import React from 'react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-4 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-transparent dark:border-white/5">
      <h2 className="text-lg font-bold tracking-[0.2em] text-gray-900 dark:text-white uppercase">
        Chiseled
      </h2>
      <div className="flex size-10 shrink-0 items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
        <div 
          className="aspect-square size-10 rounded-full bg-cover bg-center bg-no-repeat border-2 border-white/10 hover:border-primary transition-all shadow-lg"
          role="img"
          aria-label={`${user.name}'s profile avatar`}
          style={{ backgroundImage: `url("${user.avatarUrl}")` }}
        />
      </div>
    </header>
  );
};

export default Header;