import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ScanResult } from '../types';

interface ScanCardProps {
  onScanComplete?: (result: ScanResult, imageSrc: string) => void;
}

const SYSTEM_PROMPT = `
You are a grooming assistant that analyzes a user's face geometry from a photo.
Analyze the image to identify the **face shape** and the exact coordinates of key **facial landmarks** needed for beard grooming guidance.

**Instructions:**
1. Identify the **face shape** (e.g., Oval, Square, Round, Heart, Diamond, Oblong).
2. specific facial landmarks. Return their coordinates normalized to the image dimensions (0.0 to 1.0).
   - **mouth_left**, **mouth_right**: The outer corners of the lips.
   - **nose_bottom**: The lowest point of the nose (center).
   - **chin_bottom**: The lowest point of the chin.
   - **jaw_left**, **jaw_right**: The angle of the jaw below the ears (gonion).
   - **sideburn_left**, **sideburn_right**: The point where the sideburn meets the top of the ear or hairline.

**Output Format (JSON Only):**
{
  "faceShape": "String",
  "landmarks": {
    "mouth_left": [x, y],
    "mouth_right": [x, y],
    "nose_bottom": [x, y],
    "chin_bottom": [x, y],
    "jaw_left": [x, y],
    "jaw_right": [x, y],
    "sideburn_left": [x, y],
    "sideburn_right": [x, y]
  },
  "beardType": "String (optional description of current beard)"
}

Do not include any commentary. Return only valid JSON.
`;

// Dummy result for testing without API usage
const DEMO_RESULT: ScanResult = {
  faceShape: "Square",
  landmarks: {
    mouth_left: [0.38, 0.65],
    mouth_right: [0.62, 0.65],
    nose_bottom: [0.5, 0.55],
    chin_bottom: [0.5, 0.85],
    jaw_left: [0.25, 0.75],
    jaw_right: [0.75, 0.75],
    sideburn_left: [0.2, 0.4],
    sideburn_right: [0.8, 0.4]
  },
  beardType: "Medium Stubble",
  steps: ["Defined cheek lines", "Clean neckline", "Trimmed mustache"]
};

// Helper to strip markdown code blocks if present
const cleanJson = (text: string): string => {
  return text.replace(/```json\n|\n```|```/g, "").trim();
};

const ScanCard: React.FC<ScanCardProps> = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    setPreviewImage(null);
    try {
      setPermissionError(null);
      // Prefer higher resolution for better AI analysis
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: 'user', 
            width: { ideal: 1920 }, 
            height: { ideal: 1080 } 
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsScanning(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setPermissionError("Camera access denied.");
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const runAnalysis = async (base64Image: string, fullImageSrc: string) => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: SYSTEM_PROMPT }
          ]
        },
        config: { 
          responseMimeType: 'application/json'
        }
      });

      const text = response.text;
      if (text) {
        try {
            const cleanText = cleanJson(text);
            const result = JSON.parse(cleanText) as ScanResult;
            if (onScanComplete) {
              onScanComplete(result, fullImageSrc);
            }
        } catch (e) {
            console.error("JSON Parse Error", e);
            console.log("Raw Text:", text);
            setPermissionError("AI response error. Try again.");
        }
      }
    } catch (error) {
      console.error("Analysis failed", error);
      setPermissionError("Analysis failed. Try again.");
    } finally {
      setIsAnalyzing(false);
      stopCamera(); 
      setPreviewImage(null);
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");
      
      // Mirror the capture to match the preview
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0);
      
      const base64Image = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
      const imageSrc = canvas.toDataURL('image/jpeg');

      await runAnalysis(base64Image, imageSrc);

    } catch (error) {
      console.error("Capture failed", error);
      setPermissionError("Capture failed. Try again.");
      setIsAnalyzing(false);
    }
  };

  const handleDemo = () => {
      // Load a placeholder image or just use a blank one for testing logic
      // Ideally, we'd load a real static asset, but for now we simulate the event
      if (onScanComplete) {
          // Create a dummy canvas to get a valid data URL
          const canvas = document.createElement('canvas');
          canvas.width = 640;
          canvas.height = 640;
          const ctx = canvas.getContext('2d');
          if (ctx) {
             ctx.fillStyle = "#ccc";
             ctx.fillRect(0,0,640,640);
             ctx.fillStyle = "#333";
             ctx.font = "30px sans-serif";
             ctx.fillText("Demo Image", 240, 320);
             onScanComplete(DEMO_RESULT, canvas.toDataURL());
          }
      }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset state
    stopCamera();
    setPermissionError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      setPreviewImage(result);
      
      // Extract base64
      const base64Data = result.split(',')[1];
      await runAnalysis(base64Data, result);
    };
    reader.readAsDataURL(file);
    
    // Reset input so same file can be selected again
    event.target.value = '';
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="flex flex-col items-stretch justify-start rounded-2xl bg-surface-dark border border-white/5 p-5 shadow-lg relative overflow-hidden group">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full pointer-events-none"></div>

      <div className="relative flex h-80 w-full items-center justify-center overflow-hidden rounded-xl bg-black/40 border border-white/5">
        
        {/* Placeholder Icon State */}
        {!isScanning && !previewImage && (
          <div className="flex flex-col items-center gap-4 text-gray-600 animate-in fade-in zoom-in duration-500">
            <div className="relative">
                <span 
                className="material-symbols-outlined text-6xl opacity-50 text-gray-500" 
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
                >
                face
                </span>
                <div className="absolute inset-0 border-2 border-dashed border-gray-700 rounded-lg scale-150 opacity-50"></div>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-60">Tap to start scan</p>
          </div>
        )}

        {/* Live Camera State */}
        <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted 
            className={`absolute inset-0 h-full w-full object-cover transform scale-x-[-1] transition-opacity duration-700 ${isScanning ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Uploaded Image Preview */}
        {previewImage && (
            <img 
                src={previewImage} 
                alt="Upload Preview" 
                className="absolute inset-0 h-full w-full object-cover animate-in fade-in" 
            />
        )}
        
        {/* Scanning UI Overlay */}
        {isScanning && !isAnalyzing && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-6 border-2 border-primary/40 rounded-[2rem] shadow-[0_0_30px_rgba(40,240,194,0.1)] transition-all duration-300">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
            </div>
            <div className="absolute top-1/2 left-0 w-full h-px bg-primary/30 blur-[1px] animate-[scan_2s_ease-in-out_infinite]"></div>
          </div>
        )}

        {/* Analyzing Loading State */}
        {isAnalyzing && (
          <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
             <div className="relative">
                <div className="w-16 h-16 border-4 border-white/10 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
             </div>
             <p className="text-white font-bold tracking-widest uppercase text-xs mt-4 animate-pulse">Gemini 3.0 Analysis...</p>
          </div>
        )}
      </div>

      <div className="flex w-full grow flex-col items-center justify-center gap-1.5 py-5 text-center">
        <h3 className="text-lg font-bold tracking-tight text-white">
          {isScanning ? (isAnalyzing ? "Processing..." : "Align your face") : (previewImage ? "Analyzing Image" : "Scan your face")}
        </h3>
        <p className="text-sm font-medium text-gray-400">
          {permissionError ? (
            <span className="text-red-400">{permissionError} <button onClick={startCamera} className="underline">Try again</button></span>
          ) : (
            isScanning 
              ? (isAnalyzing ? "Analyzing bone structure & density." : "Look straight ahead for best results.") 
              : (previewImage ? "Mapping facial features..." : "Let AI analyze your beard and jawline.")
          )}
        </p>
      </div>

      {isScanning ? (
        <div className="flex gap-2">
            <button 
                onClick={stopCamera}
                disabled={isAnalyzing}
                className="flex-1 rounded-xl h-14 bg-gray-800 text-white font-bold uppercase tracking-widest text-xs hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={captureAndAnalyze}
                disabled={isAnalyzing}
                className="flex-[2] rounded-xl h-14 bg-primary text-background-dark font-bold uppercase tracking-widest text-xs hover:bg-primary/90 shadow-[0_0_20px_rgba(37,244,196,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
                <span className="material-symbols-outlined">shutter_speed</span>
                Capture
            </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-2 w-full">
                <button 
                    onClick={startCamera}
                    disabled={isAnalyzing}
                    className="relative flex-1 overflow-hidden rounded-xl h-14 px-4 text-sm font-bold uppercase tracking-widest transition-all duration-300 bg-primary text-background-dark hover:bg-primary/90 shadow-[0_0_20px_rgba(37,244,196,0.4)] active:scale-[0.98] disabled:opacity-50"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-lg">videocam</span>
                        Camera
                    </span>
                </button>
                
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                    className="relative flex-1 overflow-hidden rounded-xl h-14 px-4 text-sm font-bold uppercase tracking-widest transition-all duration-300 bg-surface-dark border border-white/10 text-white hover:bg-white/5 active:scale-[0.98] disabled:opacity-50"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-lg">upload_file</span>
                        Upload
                    </span>
                </button>

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileUpload}
                />
            </div>
            {/* Demo Button for Testing */}
            <button 
                onClick={handleDemo}
                className="text-[10px] text-gray-500 uppercase tracking-widest hover:text-white transition-colors py-2"
            >
                Try Demo Scan
            </button>
        </div>
      )}
    </div>
  );
};

export default ScanCard;