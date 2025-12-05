import React from 'react';
import { HistoryItem } from '../types';

interface HistoryProps {
  items: HistoryItem[];
}

const History: React.FC<HistoryProps> = ({ items }) => {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pt-2">
       {/* Stats Card */}
       <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-[#1c2e2a] to-background-dark border border-white/5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <span className="material-symbols-outlined text-9xl">timeline</span>
          </div>
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Your Progress</h2>
          <div className="grid grid-cols-2 gap-4 relative z-10">
             <div>
                <p className="text-3xl font-bold text-white">{items.length}</p>
                <p className="text-xs text-gray-400">Sessions completed</p>
             </div>
             <div>
                <p className="text-3xl font-bold text-primary">4.8</p>
                <p className="text-xs text-gray-400">Avg. rating</p>
             </div>
             {items.length > 0 && (
                <div className="col-span-2 pt-2 border-t border-white/5 mt-2">
                    <p className="text-sm text-gray-300"><span className="text-primary">Last lineup:</span> {items[0].date}</p>
                    <p className="text-sm text-gray-300"><span className="text-primary">Style:</span> {items[0].styleName}</p>
                </div>
             )}
          </div>
       </div>

       {/* List Header */}
       <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your lineups</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Track how your beard has evolved.</p>
          </div>
       </div>

       {/* History List */}
       <div className="space-y-4 pb-20">
          {items.length === 0 ? (
              <div className="p-8 text-center text-gray-500 bg-white/5 rounded-xl border border-white/5">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">history_toggle_off</span>
                  <p>No lineups yet. Complete a guidance session to see it here.</p>
              </div>
          ) : (
            items.map((item) => (
                <div key={item.id} className="flex flex-col bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden active:bg-gray-50 dark:active:bg-white/10 transition-colors">
                    <div className="flex h-32 w-full">
                    {/* Before */}
                    <div className="flex-1 bg-gray-200 dark:bg-black/30 relative border-r border-white/5">
                        <span className="absolute top-2 left-2 text-[10px] font-bold bg-black/50 text-white px-1.5 rounded">BEFORE</span>
                        <div className="w-full h-full flex items-center justify-center opacity-30">
                            <span className="material-symbols-outlined text-4xl">face</span>
                        </div>
                    </div>
                    {/* After */}
                    <div className="flex-1 bg-gray-300 dark:bg-black/20 relative">
                        <span className="absolute top-2 left-2 text-[10px] font-bold bg-primary text-black px-1.5 rounded">AFTER</span>
                        <div className="w-full h-full flex items-center justify-center opacity-30">
                            <span className="material-symbols-outlined text-4xl">face_retouching_natural</span>
                        </div>
                    </div>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">{item.styleName}</h3>
                        <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.mode === 'Advanced' ? 'bg-purple-500/20 text-purple-400' : 'bg-primary/20 text-primary'}`}>
                        {item.mode}
                    </span>
                    </div>
                </div>
            ))
          )}
       </div>
    </div>
  );
};

export default History;