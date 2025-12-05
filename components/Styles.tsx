import React, { useState } from 'react';
import { BeardStyle } from '../types';

interface StylesProps {
  onSelectStyle: (style: BeardStyle) => void;
  userFaceShape?: string;
}

// -- Custom Icon Component for consistent head shapes --
const BeardIcon = ({ id, className }: { id: string, className?: string }) => {
  // Common Colors
  const skinColor = "#E0C8AA";
  const skinShadow = "#D0B89A";
  const beardColor = "#2D3748";
  
  // Base Face Shape Path (0-200 coord space)
  const facePath = "M 60 70 Q 60 20 100 20 Q 140 20 140 70 V 120 Q 140 170 100 185 Q 60 170 60 120 Z";
  
  // Beard Paths
  const renderBeard = () => {
    switch (id) {
      case '1': // Clean Stubble
        return (
          <>
             {/* Stubble is same as full beard but low opacity */}
             <path 
                d="M 60 80 V 120 Q 60 170 100 185 Q 140 170 140 120 V 80 L 132 80 V 115 Q 132 145 100 145 Q 68 145 68 115 V 80 Z" 
                fill={beardColor} 
                fillOpacity="0.15" 
             />
             {/* Mustache Stubble */}
             <path 
                d="M 75 132 Q 100 125 125 132 Q 125 142 100 142 Q 75 142 75 132"
                fill={beardColor}
                fillOpacity="0.15"
             />
          </>
        );
      case '2': // Short Boxed Beard
        return (
          <>
             {/* Full Beard Shape */}
             <path 
                d="M 60 80 V 120 Q 60 170 100 185 Q 140 170 140 120 V 80 L 132 80 V 115 Q 132 145 100 145 Q 68 145 68 115 V 80 Z" 
                fill={beardColor} 
             />
             {/* Connector */}
             <path d="M 125 132 V 142 L 132 125 Z" fill={beardColor} />
             <path d="M 75 132 V 142 L 68 125 Z" fill={beardColor} />
             {/* Mustache */}
             <path 
                d="M 75 132 Q 100 125 125 132 Q 125 145 100 145 Q 75 145 75 132"
                fill={beardColor}
             />
          </>
        );
      case '3': // Anchor Goatee
        return (
          <>
            {/* Mustache */}
            <path 
               d="M 78 132 Q 100 125 122 132 Q 122 140 100 140 Q 78 140 78 132"
               fill={beardColor}
            />
            {/* Chin Strap Anchor */}
            <path 
               d="M 90 155 H 110 L 115 178 Q 100 185 85 178 L 90 155 Z"
               fill={beardColor}
            />
            {/* Jaw line trace */}
            <path 
               d="M 110 155 Q 125 165 135 150 L 138 155 Q 125 180 100 185 Q 75 180 62 155 L 65 150 Q 75 165 90 155"
               fill={beardColor}
            />
          </>
        );
      case '4': // Chevron Mustache
        return (
          <path 
             d="M 72 130 Q 100 120 128 130 Q 128 150 100 150 Q 72 150 72 130"
             fill={beardColor}
          />
        );
      case '5': // Royal Beard
        return (
          <>
             {/* Fancy Mustache */}
             <path 
               d="M 75 130 Q 100 122 125 130 Q 128 135 122 138 Q 100 135 78 138 Q 72 135 75 130"
               fill={beardColor}
             />
             {/* Soul Patch / Chin Strip */}
             <path 
               d="M 95 150 H 105 L 102 170 Q 100 172 98 170 Z"
               fill={beardColor}
             />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
       {/* Neck/Body Hint */}
       <path d="M 70 170 L 70 200 H 130 L 130 170" fill={skinShadow} />

       {/* Face Base */}
       <path d={facePath} fill={skinColor} />
       
       {/* Ears */}
       <path d="M 60 90 Q 50 85 50 105 Q 50 125 60 120" fill={skinColor} />
       <path d="M 140 90 Q 150 85 150 105 Q 150 125 140 120" fill={skinColor} />

       {/* Eyes */}
       <circle cx="80" cy="95" r="5" fill="#333" fillOpacity="0.8" />
       <circle cx="120" cy="95" r="5" fill="#333" fillOpacity="0.8" />
       <path d="M 72 88 Q 80 85 88 88" stroke="#333" strokeWidth="1.5" fill="none" opacity="0.4" />
       <path d="M 112 88 Q 120 85 128 88" stroke="#333" strokeWidth="1.5" fill="none" opacity="0.4" />

       {/* Nose */}
       <path d="M 100 95 L 96 120 L 104 120 Z" fill={skinShadow} opacity="0.6" />

       {/* Mouth (Neutral) */}
       <path d="M 85 145 Q 100 155 115 145" stroke="#C8A080" strokeWidth="2" fill="none" />

       {/* Beard Overlay */}
       {renderBeard()}
    </svg>
  );
};


const stylesData: BeardStyle[] = [
  { 
    id: '1', 
    name: 'Clean Stubble', 
    category: 'Stubble', 
    description: 'A well-maintained heavy stubble that highlights the jawline.', 
    tags: ['Beginner-friendly', 'Sharp jawline'], 
    difficulty: 'Beginner',
    faceShapes: ['Oval', 'Square', 'Round', 'Diamond', 'Oblong', 'Heart'],
  },
  { 
    id: '2', 
    name: 'Short Boxed Beard', 
    category: 'Full Beard', 
    description: 'A classic, neat full beard that works well for business settings.', 
    tags: ['Professional', 'Volume'], 
    difficulty: 'Advanced',
    faceShapes: ['Round', 'Oval', 'Heart'],
  },
  { 
    id: '3', 
    name: 'Anchor Goatee', 
    category: 'Goatee', 
    description: 'A pointed beard that traces the jawline, paired with a mustache.', 
    tags: ['Edgy', 'Defined'], 
    difficulty: 'Advanced',
    faceShapes: ['Square', 'Diamond', 'Oblong'],
  },
  { 
    id: '4', 
    name: 'Chevron Mustache', 
    category: 'Mustache', 
    description: 'A thick, full mustache that covers the top lip.', 
    tags: ['Vintage', 'Bold'], 
    difficulty: 'Beginner',
    faceShapes: ['Oval', 'Heart', 'Square'],
  },
  { 
    id: '5', 
    name: 'Royal Beard', 
    category: 'Goatee', 
    description: 'A mustache anchored by a chin strip.', 
    tags: ['Classic', 'Refined'], 
    difficulty: 'Beginner',
    faceShapes: ['Round', 'Diamond'],
  }
];

const categories = ['All', 'Stubble', 'Full Beard', 'Goatee', 'Mustache'];

const Styles: React.FC<StylesProps> = ({ onSelectStyle, userFaceShape }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedStyle, setSelectedStyle] = useState<BeardStyle | null>(null);

  const filteredStyles = activeCategory === 'All' 
    ? stylesData 
    : stylesData.filter(s => s.category === activeCategory);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pt-2">
      {/* Header Area */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Choose your style</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {userFaceShape 
            ? <>Recommended for your <strong className="text-primary">{userFaceShape}</strong> face.</>
            : "Styles that fit your face shape."}
        </p>
      </div>

      {/* Categories Filter */}
      <div className="flex gap-2 overflow-x-auto pb-6 -mx-4 px-4 no-scrollbar snap-x">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all snap-start border
              ${activeCategory === cat 
                ? 'bg-primary border-primary text-background-dark shadow-[0_0_10px_rgba(37,244,196,0.3)]' 
                : 'bg-transparent border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/30'}
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 pb-20">
        {filteredStyles.map(style => {
          const isMatch = userFaceShape && style.faceShapes.includes(userFaceShape);
          
          return (
            <div 
              key={style.id}
              onClick={() => setSelectedStyle(style)}
              className={`
                group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-white/5 border transition-all cursor-pointer active:scale-[0.98]
                ${isMatch ? 'border-primary/40 shadow-[0_0_15px_rgba(37,244,196,0.1)]' : 'border-gray-200 dark:border-white/5 hover:border-primary/50'}
              `}
            >
              {isMatch && (
                <div className="absolute top-2 left-2 z-10 bg-primary text-background-dark text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                  Match
                </div>
              )}
              
              {/* Image Container */}
              <div className="aspect-[4/5] w-full relative overflow-hidden bg-[#edf2f7] dark:bg-white/5 p-4 flex items-center justify-center">
                 <BeardIcon 
                    id={style.id} 
                    className="w-full h-full drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
                 />
                 
                 <div className="absolute top-2 right-2">
                    {style.faceShapes.includes('Round') && <span className="material-symbols-outlined text-gray-400/50 text-sm">circle</span>}
                 </div>
              </div>
              
              {/* Content */}
              <div className="p-3">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1 truncate">{style.name}</h3>
                <div className="flex flex-wrap gap-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">
                    {style.difficulty}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sheet Detail Overlay */}
      {selectedStyle && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedStyle(null)} />
          <div className="fixed inset-x-0 bottom-0 z-[60] bg-background-light dark:bg-[#151b1e] rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="w-12 h-1 bg-gray-300 dark:bg-white/10 rounded-full mx-auto mb-6" />
            
            <div className="flex items-start justify-between mb-4">
               <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStyle.name}</h2>
                  <p className="text-primary font-medium text-sm">{selectedStyle.category}</p>
               </div>
               <button 
                onClick={() => setSelectedStyle(null)}
                className="p-2 bg-gray-100 dark:bg-white/5 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
               >
                 <span className="material-symbols-outlined text-xl">close</span>
               </button>
            </div>

            <div className="aspect-video w-full rounded-xl bg-[#edf2f7] dark:bg-white/5 mb-6 flex items-center justify-center border border-black/5 dark:border-white/5 relative overflow-hidden group">
                <BeardIcon 
                    id={selectedStyle.id}
                    className="h-full w-auto p-4 transition-transform duration-1000 group-hover:scale-105 drop-shadow-2xl" 
                />

                {userFaceShape && selectedStyle.faceShapes.includes(userFaceShape) && (
                  <div className="absolute bottom-4 left-4 bg-primary/90 text-background-dark backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span className="text-xs font-bold">Great for your {userFaceShape} face</span>
                  </div>
                )}
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {selectedStyle.description} This style works particularly well for <strong>{selectedStyle.faceShapes.join(' & ')}</strong> face shapes.
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {selectedStyle.tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-500 dark:text-gray-400">
                  {tag}
                </span>
              ))}
            </div>

            <div className="space-y-3 pb-safe">
              <button 
                onClick={() => onSelectStyle(selectedStyle)}
                className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(37,244,196,0.3)] transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>Start Guidance</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button className="w-full bg-transparent border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-900 dark:text-white font-medium text-lg py-4 rounded-xl transition-colors">
                View trimming steps
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Styles;