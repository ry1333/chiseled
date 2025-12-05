import React from 'react';
import { QuickAction } from '../types';

const actions: QuickAction[] = [
  { id: '1', icon: 'texture', label: 'Stubble lineup' },
  { id: '2', icon: 'content_cut', label: 'Full beard cleanup' },
  { id: '3', icon: 'psychology_alt', label: 'Mustache only' },
  { id: '4', icon: 'face', label: 'Clean Shave' },
];

const QuickActions: React.FC = () => {
  return (
    <div className="pt-8">
      <h3 className="text-xs font-bold uppercase tracking-widest pb-4 text-gray-500 pl-1">
        Quick actions
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar snap-x">
        {actions.map((action) => (
          <button 
            key={action.id}
            className="group flex shrink-0 snap-start cursor-pointer items-center gap-3 rounded-xl bg-surface-dark border border-white/5 px-4 py-3 hover:border-primary/50 hover:bg-white/5 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-2xl text-gray-400 group-hover:text-primary transition-colors">
              {action.icon}
            </span>
            <p className="text-sm font-semibold text-gray-300 group-hover:text-white whitespace-nowrap">
              {action.label}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;