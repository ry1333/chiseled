import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileProps {
  user: UserProfile;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    weeklyDigest: false,
    hardMode: false,
    photos: true
  });

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button 
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-primary' : 'bg-gray-700'}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background-dark shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pt-6 pb-24">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="size-28 rounded-full border-4 border-surface-highlight p-1 mb-4 relative">
          <div 
            className="w-full h-full rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url("${user.avatarUrl}")` }} 
          />
          <div className="absolute bottom-1 right-1 bg-primary text-background-dark p-1.5 rounded-full border-4 border-background-dark">
            <span className="material-symbols-outlined text-sm font-bold block">edit</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
        <p className="text-gray-400 text-sm font-medium">Dialing in since 2025</p>
      </div>

      {/* Stats/Summary Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-dark rounded-xl p-3 text-center border border-white/5">
          <p className="text-2xl font-bold text-white">12</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Lineups</p>
        </div>
        <div className="bg-surface-dark rounded-xl p-3 text-center border border-white/5">
          <p className="text-2xl font-bold text-primary">4</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Streak</p>
        </div>
        <div className="bg-surface-dark rounded-xl p-3 text-center border border-white/5">
          <p className="text-2xl font-bold text-white">Pro</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Level</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-8">
        <section>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Grooming Preferences</h3>
          <div className="bg-surface-dark rounded-xl border border-white/5 overflow-hidden">
             <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div>
                  <p className="text-white font-medium">Weekly Reminder</p>
                  <p className="text-xs text-gray-500">Sunday night lineup notification.</p>
                </div>
                <Toggle checked={settings.notifications} onChange={() => setSettings(s => ({...s, notifications: !s.notifications}))} />
             </div>
             <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div>
                  <p className="text-white font-medium">Advanced Mode</p>
                  <p className="text-xs text-gray-500">Less guidance, more freedom.</p>
                </div>
                <Toggle checked={settings.hardMode} onChange={() => setSettings(s => ({...s, hardMode: !s.hardMode}))} />
             </div>
             <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-white font-medium">Save Progress Photos</p>
                  <p className="text-xs text-gray-500">Auto-save to secure gallery.</p>
                </div>
                <Toggle checked={settings.photos} onChange={() => setSettings(s => ({...s, photos: !s.photos}))} />
             </div>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Account</h3>
          <div className="bg-surface-dark rounded-xl border border-white/5 overflow-hidden">
             <button className="w-full flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 text-left">
                <span className="text-white font-medium">Manage Subscription</span>
                <span className="material-symbols-outlined text-gray-500">chevron_right</span>
             </button>
             <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 text-left">
                <span className="text-white font-medium">Hardware Setup</span>
                <span className="material-symbols-outlined text-gray-500">chevron_right</span>
             </button>
          </div>
        </section>
        
        <div className="text-center pt-4">
          <p className="text-xs text-gray-600 font-medium">Chiseled v1.0.4</p>
          <button className="text-xs text-red-400 font-bold uppercase tracking-widest mt-2 hover:text-red-300">Log Out</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;