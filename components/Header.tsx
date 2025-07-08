
import React from 'react';
import { RecordIcon, SettingsIcon, BellIcon } from './icons';

interface HeaderProps {
    isRecording: boolean;
    onSettingsClick: () => void;
    onNotificationsClick: () => void;
    notificationCount: number;
}

const KnouLogo = ({ isRecording }: { isRecording: boolean }) => (
  <div className="flex items-center gap-3">
    <div className="relative w-10 h-10">
      <div className={`absolute inset-0 rounded-full bg-knoux-red/20 blur-lg ${isRecording ? 'animate-glow' : ''}`}></div>
      <div className={`absolute inset-0 rounded-full border-2 ${isRecording ? 'border-knoux-red/50' : 'border-knoux-purple/50'}`}></div>
      <RecordIcon className={`w-10 h-10 ${isRecording ? 'text-knoux-red animate-pulse' : 'text-knoux-purple'}`} />
    </div>
    <h1 className="text-3xl font-orbitron font-bold tracking-wider text-shadow-lg text-[var(--primary-text)]">
      <span className={isRecording ? 'text-knoux-red' : 'text-knoux-purple'}>KNOUX</span> REC
    </h1>
  </div>
);


const Header = ({ isRecording, onSettingsClick, onNotificationsClick, notificationCount }: HeaderProps) => {
  return (
    <header className="sticky top-4 left-4 right-4 z-40 mx-4 mt-4 p-4 flex justify-between items-center glass-card rounded-xl">
      <KnouLogo isRecording={isRecording} />
      <div className="flex items-center space-x-4">
        <button onClick={onNotificationsClick} className="relative text-[var(--icon-color)] hover:text-knoux-neon-blue transition-colors duration-200">
          <BellIcon className="w-6 h-6" />
          {notificationCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-knoux-red text-xs font-bold text-white">
              {notificationCount}
            </span>
          )}
        </button>
        <button onClick={onSettingsClick} className="text-[var(--icon-color)] hover:text-knoux-neon-blue transition-colors duration-200">
          <SettingsIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
