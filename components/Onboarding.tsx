import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const screens = [
    {
      title: "Sharpen your face.",
      subtitle: "Chiseled shows you exactly where to trim your beard, mustache, and neckline.",
      icon: "face_retouching_natural",
      cta: "Get Started",
      secondary: "Already have an account? Log in"
    },
    {
      title: "How it works",
      content: [
        { icon: "photo_camera", title: "Scan your face", text: "AI analyzes your facial hair and face shape." },
        { icon: "style", title: "Pick a style", text: "Choose from stubble, full beard, goatee, and more." },
        { icon: "timeline", title: "Follow the lines", text: "Use live guides to line up like a barber." }
      ],
      cta: "Continue"
    },
    {
      title: "Set up your tools",
      subtitle: "We need access to your camera to provide live AR guidance. We never store your photos without permission.",
      permissions: [
        { icon: "videocam", label: "Camera Access", granted: true },
        { icon: "image", label: "Photo Gallery", granted: true }
      ],
      cta: "Allow & Continue"
    }
  ];

  const handleNext = () => {
    if (step < screens.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background-dark text-white animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="flex justify-center p-6">
        <h1 className="text-xl font-bold tracking-tight">CHISELED</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto w-full">
        
        {/* Screen 1: Welcome */}
        {step === 0 && (
          <div className="flex flex-col items-center gap-8 animate-in slide-in-from-right-8 fade-in duration-500">
             <div className="relative size-48 flex items-center justify-center rounded-full bg-primary/10 border border-primary/20 shadow-[0_0_40px_rgba(37,244,196,0.1)]">
                <span className="material-symbols-outlined text-8xl text-primary" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>
                  {screens[0].icon}
                </span>
             </div>
             <div className="space-y-4">
                <h2 className="text-4xl font-bold leading-tight">{screens[0].title}</h2>
                <p className="text-gray-400 text-lg leading-relaxed">{screens[0].subtitle}</p>
             </div>
          </div>
        )}

        {/* Screen 2: Features */}
        {step === 1 && (
          <div className="w-full flex flex-col gap-6 animate-in slide-in-from-right-8 fade-in duration-500">
            <h2 className="text-3xl font-bold mb-4">{screens[1].title}</h2>
            {screens[1].content?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 text-left p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">{item.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-white">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Screen 3: Permissions */}
        {step === 2 && (
          <div className="w-full flex flex-col gap-8 animate-in slide-in-from-right-8 fade-in duration-500">
            <div className="space-y-4">
               <h2 className="text-3xl font-bold">{screens[2].title}</h2>
               <p className="text-gray-400 text-base">{screens[2].subtitle}</p>
            </div>
            <div className="space-y-3">
              {screens[2].permissions?.map((perm, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                   <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-300">{perm.icon}</span>
                      <span className="font-medium">{perm.label}</span>
                   </div>
                   <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors duration-200 ease-in-out focus:outline-none">
                      <span className="pointer-events-none translate-x-5 inline-block h-5 w-5 transform rounded-full bg-background-dark shadow ring-0 transition duration-200 ease-in-out"></span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="p-6 max-w-md mx-auto w-full space-y-4">
        <button 
          onClick={handleNext}
          className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(37,244,196,0.3)] transition-all active:scale-[0.98]"
        >
          {screens[step].cta}
        </button>
        {screens[step].secondary && (
          <button className="w-full text-sm text-gray-500 font-medium hover:text-white transition-colors">
            {screens[step].secondary}
          </button>
        )}
        
        {/* Progress Dots */}
        <div className="flex justify-center gap-2 pt-2">
          {screens.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-gray-700'}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;