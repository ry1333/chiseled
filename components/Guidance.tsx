import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { BeardStyle, ScanResult, FaceLandmarks } from '../types';

interface GuidanceProps {
  style?: BeardStyle;
  scanResult?: ScanResult;
  scanImage?: string;
  onClose: () => void;
  onComplete?: (style: BeardStyle) => void;
}

interface RenderedPath {
  d: string;
  label: string;
  color?: string;
  dashed?: boolean;
}

const Guidance: React.FC<GuidanceProps> = ({ style, scanResult, scanImage, onClose, onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [viewMode, setViewMode] = useState<'guide' | 'after'>('guide');
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [isGeneratingAfter, setIsGeneratingAfter] = useState(false);
  const [useLiveCamera, setUseLiveCamera] = useState(!scanImage);
  const [paths, setPaths] = useState<RenderedPath[]>([]);

  // Dimensions for proper scaling
  const [mediaDims, setMediaDims] = useState<{w: number, h: number} | null>(null);
  const [containerDims, setContainerDims] = useState<{w: number, h: number} | null>(null);

  // Fallback steps if no AI result
  const steps = scanResult?.steps?.map((s, i) => ({
      title: `Step ${i+1}`,
      instruction: s
  })) || (style?.category === 'Goatee' ? [
    { title: "Define Width", instruction: "Shave vertical lines down from the corners of your mouth." },
    { title: "Clear Cheeks", instruction: "Shave everything on your cheeks outside the goatee area." },
    { title: "Define Neckline", instruction: "Create a rounded shape connecting the vertical lines under your chin." }
  ] : [
    { title: "Outline cheeks", instruction: "Shave everything ABOVE the teal line on both cheeks." },
    { title: "Define neckline", instruction: "Tilt head back. Shave below the line approx 1 inch above Adam's apple." },
    { title: "Define mustache", instruction: "Trim along the upper lip line to keep hair off the mouth." },
    { title: "Final check", instruction: "Turn head left and right to ensure symmetry." }
  ]);

  const totalSteps = steps.length;
  const currentStep = steps[step - 1];

  // Initialize Camera if needed
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      if (useLiveCamera && viewMode === 'guide') {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Get dimensions once video plays
            videoRef.current.onloadedmetadata = () => {
                if (videoRef.current) {
                    setMediaDims({
                        w: videoRef.current.videoWidth,
                        h: videoRef.current.videoHeight
                    });
                }
            };
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
        }
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [useLiveCamera, viewMode]);

  // Load Image Dimensions if using static image
  useEffect(() => {
      if (!useLiveCamera && scanImage) {
          const img = new Image();
          img.src = scanImage;
          img.onload = () => {
              setMediaDims({ w: img.naturalWidth, h: img.naturalHeight });
          };
      }
  }, [useLiveCamera, scanImage]);

  // Calculate Paths based on Style + Landmarks
  useEffect(() => {
    if (!scanResult?.landmarks || !style) return;
    const l = scanResult.landmarks;
    const p: RenderedPath[] = [];

    // Helper to format path string
    const M = (pt: [number, number]) => `M ${pt[0]*100} ${pt[1]*100}`;
    const L = (pt: [number, number]) => `L ${pt[0]*100} ${pt[1]*100}`;
    const Q = (c: [number, number], pt: [number, number]) => `Q ${c[0]*100} ${c[1]*100} ${pt[0]*100} ${pt[1]*100}`;

    if (style.category === 'Goatee' || style.id === '3' || style.id === '5') {
        // GOATEE LOGIC
        // 1. Vertical lines from mouth corners down to jaw level
        // Left Vertical
        const leftJawY = l.jaw_left[1];
        const leftChinY = l.chin_bottom[1];
        const bottomY = (leftJawY + leftChinY) / 2; // Approximate bottom depth
        
        p.push({
            d: `${M(l.mouth_left)} L ${l.mouth_left[0]*100} ${bottomY*100}`,
            label: "Left Boundary",
            dashed: true
        });
         p.push({
            d: `${M(l.mouth_right)} L ${l.mouth_right[0]*100} ${bottomY*100}`,
            label: "Right Boundary",
            dashed: true
        });

        // 2. Connector at bottom (Chin strap)
        p.push({
            d: `M ${l.mouth_left[0]*100} ${bottomY*100} Q ${l.chin_bottom[0]*100} ${l.chin_bottom[1]*100 + 5} ${l.mouth_right[0]*100} ${bottomY*100}`,
            label: "Chin Line"
        });

        // 3. Mustache Top (Optional, but useful)
        p.push({
            d: `${M(l.mouth_left)} Q ${l.nose_bottom[0]*100} ${l.nose_bottom[1]*100 + 2} ${M(l.mouth_right).substring(2)}`,
            label: "Lip Line"
        });

    } else if (style.category === 'Mustache' || style.id === '4') {
        // MUSTACHE LOGIC
        // Top line: nose to mouth corners
        p.push({
             d: `${M(l.mouth_left)} Q ${l.nose_bottom[0]*100} ${l.nose_bottom[1]*100 + 2} ${M(l.mouth_right).substring(2)}`,
             label: "Lip Line"
        });
        
    } else {
        // FULL BEARD / STUBBLE LOGIC (Default)
        
        // 1. Cheek Lines (Sideburn to Mouth)
        // Midpoint control for slight curve
        const leftCheekMid: [number, number] = [(l.sideburn_left[0] + l.mouth_left[0])/2, (l.sideburn_left[1] + l.mouth_left[1])/2 + 0.05];
        p.push({
            d: `${M(l.sideburn_left)} Q ${leftCheekMid[0]*100} ${leftCheekMid[1]*100} ${l.mouth_left[0]*100} ${l.mouth_left[1]*100}`,
            label: "Cheek Line"
        });

        const rightCheekMid: [number, number] = [(l.sideburn_right[0] + l.mouth_right[0])/2, (l.sideburn_right[1] + l.mouth_right[1])/2 + 0.05];
        p.push({
            d: `${M(l.sideburn_right)} Q ${rightCheekMid[0]*100} ${rightCheekMid[1]*100} ${l.mouth_right[0]*100} ${l.mouth_right[1]*100}`,
            label: "Cheek Line"
        });

        // 2. Neck Line (Jaw to Chin to Jaw)
        // Curve passing below chin
        const neckLowY = l.chin_bottom[1] + 0.1; // 10% below chin
        p.push({
            d: `${M(l.jaw_left)} Q ${l.chin_bottom[0]*100} ${neckLowY*100} ${l.jaw_right[0]*100} ${l.jaw_right[1]*100}`,
            label: "Neck Line"
        });

        // 3. Mustache Line
        p.push({
            d: `${M(l.mouth_left)} L ${l.mouth_right[0]*100} ${l.mouth_right[1]*100}`,
            label: "Lip Line",
            dashed: true
        });
    }

    setPaths(p);

  }, [scanResult, style]);

  // Track Container Size
  useLayoutEffect(() => {
    const updateSize = () => {
        if (containerRef.current) {
            setContainerDims({
                w: containerRef.current.clientWidth,
                h: containerRef.current.clientHeight
            });
        }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate Scale for "Cover" fit
  const getCoverStyle = () => {
      if (!mediaDims || !containerDims) return {};

      // Calculate the scale needed to cover the container
      const scale = Math.max(
          containerDims.w / mediaDims.w,
          containerDims.h / mediaDims.h
      );

      const width = mediaDims.w * scale;
      const height = mediaDims.h * scale;

      return {
          width: `${width}px`,
          height: `${height}px`,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          position: 'absolute' as const
      };
  };

  const generateAfterImage = async () => {
    if (!scanImage || !style) return;
    
    setIsGeneratingAfter(true);
    setAfterImage(null);
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const base64Data = scanImage.split(',')[1];
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { 
                        text: `Edit the provided image to change ONLY the facial hair. Apply a ${style.name}.
                               Style Description: ${style.description}.
                               CRITICAL RULES:
                               1. Keep the exact same face identity, skin tone, eye color, and features.
                               2. Keep the exact same lighting, shadows, background, and camera angle.
                               3. Keep the exact same clothing and hair on top of the head.
                               4. Do NOT generate a new person. Modify the existing face only where the beard grows.` 
                    },
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: base64Data
                        }
                    }
                ]
            },
            config: {
                 imageConfig: {
                    aspectRatio: "1:1"
                 }
            }
        });

        // Parse response for image
        let foundImage = false;
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                setAfterImage(`data:image/png;base64,${part.inlineData.data}`);
                foundImage = true;
                break;
            }
        }
        
        if (!foundImage) {
            throw new Error("No image data found in response");
        }

    } catch (error: any) {
        console.error("Failed to generate after image", error);
        alert("Generation failed. Please try again.");
    } finally {
        setIsGeneratingAfter(false);
    }
  };

  const handleViewModeChange = (mode: 'guide' | 'after') => {
      setViewMode(mode);
      if (mode === 'after' && !afterImage && !isGeneratingAfter) {
          generateAfterImage();
      }
  };

  const handleFinish = () => {
      if (onComplete && style) {
          onComplete(style);
      }
      onClose();
  };

  const wrapperStyle = getCoverStyle();

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onClose} className="p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white active:scale-95 transition-transform">
           <span className="material-symbols-outlined">close</span>
        </button>
        
        <div className="flex bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-lg">
            <button 
                onClick={() => handleViewModeChange('guide')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'guide' ? 'bg-primary text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
                Guide
            </button>
            <button 
                onClick={() => handleViewModeChange('after')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${viewMode === 'after' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                Result
            </button>
        </div>

        <button onClick={() => setUseLiveCamera(!useLiveCamera)} className="p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white active:scale-95 transition-transform">
             <span className="material-symbols-outlined">{useLiveCamera ? 'image' : 'videocam'}</span>
        </button>
      </div>

      {/* Main Viewport */}
      <div ref={containerRef} className="relative flex-1 bg-gray-900 w-full h-full overflow-hidden">
         {viewMode === 'guide' ? (
             <div style={wrapperStyle}>
                {/* 1. Media Layer */}
                {useLiveCamera ? (
                    <video 
                        ref={videoRef}
                        autoPlay 
                        playsInline 
                        muted 
                        className="absolute inset-0 w-full h-full transform scale-x-[-1]" 
                    />
                ) : (
                    <img 
                        src={scanImage} 
                        alt="Scan" 
                        className="absolute inset-0 w-full h-full"
                    />
                )}

                {/* 2. SVG Overlay Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {paths.map((path, idx) => (
                        <path 
                            key={idx}
                            d={path.d} 
                            stroke="#25f4c3" 
                            strokeWidth="0.8" 
                            fill="none" 
                            strokeDasharray={path.dashed ? "4 2" : undefined}
                            className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" 
                        />
                    ))}
                </svg>

                {/* 3. HTML Text Overlay Layer */}
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                    {paths.map((path, idx) => {
                        // Extract starting point from path "M x y ..."
                        const parts = path.d.split(' ');
                        const x = parseFloat(parts[1]);
                        const y = parseFloat(parts[2]);
                        
                        return (
                            <div 
                                key={idx}
                                className="absolute flex items-center gap-2 transform -translate-y-full"
                                style={{ 
                                    left: `${x}%`, 
                                    top: `${y}%`,
                                }}
                            >
                                <span className="text-[10px] font-black bg-primary text-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-lg whitespace-nowrap">
                                    {path.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
             </div>
         ) : (
             // AFTER MODE
             <div className="w-full h-full flex items-center justify-center relative">
                 {isGeneratingAfter ? (
                     <div className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10">
                         <div className="relative">
                            <div className="w-16 h-16 border-4 border-white/10 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                         </div>
                         <div className="text-center">
                            <p className="text-primary font-bold tracking-widest uppercase text-xs animate-pulse mb-1">Generating New Look</p>
                            <p className="text-gray-400 text-xs">Gemini 2.5 is reimagining your style...</p>
                         </div>
                     </div>
                 ) : afterImage ? (
                     <>
                        <img src={afterImage} alt="After Result" className="w-full h-full object-contain bg-black" />
                        <div className="absolute bottom-32 right-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-bold text-white border border-white/10 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-primary">auto_awesome</span>
                            AI Generated Preview
                        </div>
                     </>
                 ) : (
                     <div className="text-center p-6">
                         <p className="text-red-400 mb-4 max-w-xs mx-auto">Generation failed. Please try again.</p>
                         <button 
                            onClick={() => generateAfterImage()} 
                            className="px-6 py-3 bg-white text-black font-bold rounded-xl uppercase tracking-widest text-xs hover:bg-gray-200"
                        >
                            Try Again
                        </button>
                     </div>
                 )}
             </div>
         )}
      </div>

      {/* Bottom Controls - Guide Mode */}
      {viewMode === 'guide' && (
        <div className="relative z-10 bg-surface-dark border-t border-white/10 pb-safe pt-5 px-6 rounded-t-3xl shadow-[0_-10px_60px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Step {step}/{totalSteps}</span>
                <span className="text-xs font-medium text-gray-400 max-w-[60%] truncate">{currentStep.title}</span>
            </div>
            
            <p className="text-lg font-medium text-white mb-6 leading-snug min-h-[3.5rem]">
                {currentStep.instruction}
            </p>

            <div className="flex gap-4">
            <button 
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="px-6 py-4 rounded-xl border border-white/20 text-white font-bold disabled:opacity-30 disabled:border-transparent hover:bg-white/5 transition-colors"
            >
                Back
            </button>
            <button 
                onClick={() => step < totalSteps ? setStep(step + 1) : handleFinish()}
                className="flex-1 bg-primary text-background-dark font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(37,244,196,0.3)] active:scale-[0.98] transition-all"
            >
                {step < totalSteps ? 'Next step' : 'Finish'}
            </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Guidance;