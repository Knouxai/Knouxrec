

import React from 'react';
import { ClockIcon, GamepadIcon } from './icons';
import { RecordingSettings } from '../types';
import ToggleSwitch from './ToggleSwitch';

interface FeaturesProps {
  settings: RecordingSettings;
  onSettingsChange: (settings: RecordingSettings) => void;
  isRecording: boolean;
}

const FeatureCard = ({ icon, label, description, children, disabled }: { icon: React.ReactNode, label: string, description: string, children: React.ReactNode, disabled?: boolean }) => (
    <div className={`p-4 rounded-lg transition-all duration-300 interactive-card ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
            <div className="text-knoux-neon-blue">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-md text-[var(--primary-text)]">{label}</h4>
                <p className="text-xs text-[var(--secondary-text)]">{description}</p>
            </div>
            </div>
            {children}
        </div>
    </div>
);


const Features = ({ settings, onSettingsChange, isRecording }: FeaturesProps) => {
  const handleToggle = (key: keyof RecordingSettings) => {
    onSettingsChange({ ...settings, [key]: !settings[key] });
  };

  const handleScheduleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, scheduleTime: e.target.value });
  };
  
  const getMinScheduleTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // At least one minute in the future
    return now.toISOString().slice(0, 16);
  }

  return (
    <div className="p-4 glass-card rounded-xl">
      <h3 className="text-lg font-bold font-orbitron mb-4 text-knoux-purple">FEATURES</h3>
      <div className="space-y-3">
        <FeatureCard
          icon={<GamepadIcon className="w-7 h-7"/>}
          label="Game Mode"
          description="Optimize for high-performance game recording"
          disabled={isRecording}
        >
            <ToggleSwitch 
                enabled={settings.gameMode} 
                onChange={() => handleToggle('gameMode')} 
                disabled={isRecording}
            />
        </FeatureCard>

        <div className={`p-4 rounded-lg transition-all duration-300 interactive-card ${isRecording ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="text-knoux-neon-blue">
                       <ClockIcon className="w-7 h-7"/>
                    </div>
                    <div>
                        <h4 className="font-bold text-md text-[var(--primary-text)]">Schedule Recording</h4>
                        <p className="text-xs text-[var(--secondary-text)]">Set a time to start recording automatically</p>
                    </div>
                </div>
                <ToggleSwitch 
                    enabled={settings.scheduleEnabled} 
                    onChange={() => handleToggle('scheduleEnabled')}
                    disabled={isRecording}
                />
            </div>
            {settings.scheduleEnabled && !isRecording && (
                <div className="mt-4 pl-11">
                    <input 
                        type="datetime-local"
                        value={settings.scheduleTime}
                        onChange={handleScheduleTimeChange}
                        min={getMinScheduleTime()}
                        disabled={isRecording}
                        className="w-full bg-black/20 dark:bg-knoux-dark-glass/50 border border-[var(--card-border)] rounded-md px-3 py-2 focus:ring-knoux-neon-blue focus:border-knoux-neon-blue transition"
                    />
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Features;
