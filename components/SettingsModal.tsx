


import React from 'react';
import { CloseIcon, SunIcon, MoonIcon, SparklesIcon, WorkflowIcon, KeyboardIcon, FilterIcon } from './icons';
import { Theme, RecordingSettings, Hotkeys } from '../types';
import ToggleSwitch from './ToggleSwitch';
import HotkeyCaptureInput from './HotkeyCaptureInput';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  settings: RecordingSettings;
  onSave: (settings: RecordingSettings) => void;
}

const SettingsModal = ({ isOpen, onClose, theme, setTheme, settings, onSave }: SettingsModalProps) => {
  if (!isOpen) return null;

  const [localSettings, setLocalSettings] = React.useState(settings);

  const handleToggle = (key: keyof RecordingSettings) => {
    setLocalSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const handleInputChange = (key: keyof RecordingSettings, value: string | number) => {
    setLocalSettings(prev => ({...prev, [key]: value}));
  }
  
  const handleHotkeyChange = (hotkeyName: keyof Hotkeys, value: string) => {
    setLocalSettings(prev => ({
        ...prev,
        hotkeys: {
            ...prev.hotkeys,
            [hotkeyName]: value,
        }
    }));
  };
  
  const handleSave = () => {
      onSave(localSettings);
      onClose();
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
      onClick={handleSave}
    >
      <div 
        className="glass-card w-full max-w-lg m-4 p-6 rounded-2xl relative border-2 border-knoux-purple/50 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-[var(--secondary-text)] hover:text-knoux-neon-blue transition-colors"
        >
          <CloseIcon className="w-6 h-6"/>
        </button>
        
        <h2 className="text-2xl font-orbitron font-bold text-knoux-purple mb-6">Settings</h2>
        
        <div className="space-y-6">
           <div>
              <h3 className="text-lg font-bold font-orbitron mb-3 text-knoux-neon-blue/80">Appearance</h3>
              <div className="flex items-center justify-between p-4 interactive-card rounded-lg">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <MoonIcon className="w-6 h-6 text-knoux-neon-blue"/> : <SunIcon className="w-6 h-6 text-yellow-400"/>}
                    <span className="font-semibold text-md text-[var(--primary-text)]">Theme</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <SunIcon className="w-5 h-5 text-yellow-400"/>
                    <ToggleSwitch enabled={theme === 'dark'} onChange={(isDark) => setTheme(isDark ? 'dark' : 'light')} />
                    <MoonIcon className="w-5 h-5 text-knoux-neon-blue"/>
                  </div>
              </div>
           </div>
           
            <div>
              <h3 className="text-lg font-bold font-orbitron mb-3 text-knoux-neon-blue/80">Live Effects</h3>
                <div className="p-4 interactive-card rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="liveFilter" className="font-semibold text-md text-[var(--primary-text)] flex items-center gap-2">
                      <FilterIcon className="w-5 h-5" /> Video Filter
                    </label>
                    <select
                      id="liveFilter"
                      value={localSettings.liveFilter}
                      onChange={e => handleInputChange('liveFilter', e.target.value)}
                      className="w-1/2 bg-black/20 dark:bg-knoux-dark-glass/50 border border-[var(--card-border)] rounded-md px-3 py-2 focus:ring-knoux-neon-blue focus:border-knoux-neon-blue transition"
                    >
                      <option value="none">None</option>
                      <option value="neon-glow">Neon Glow</option>
                      <option value="grayscale">Grayscale</option>
                      <option value="sepia">Sepia</option>
                      <option value="invert">Invert</option>
                    </select>
                  </div>
                </div>
           </div>

            <div>
              <h3 className="text-lg font-bold font-orbitron mb-3 text-knoux-neon-blue/80">Workflow</h3>
                <div className="p-4 interactive-card rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <WorkflowIcon className="w-6 h-6 text-knoux-purple"/>
                        <div>
                            <h4 className="font-semibold text-md text-[var(--primary-text)]">Instant Trim</h4>
                            <p className="text-xs text-[var(--secondary-text)]">Trim video immediately after recording.</p>
                        </div>
                   </div>
                    <ToggleSwitch enabled={localSettings.instantTrimEnabled} onChange={() => handleToggle('instantTrimEnabled')} />
                  </div>
                   <div>
                        <label htmlFor="fileNamePattern" className="block font-semibold text-md text-[var(--primary-text)] mb-2">File Name Pattern</label>
                        <input
                            type="text"
                            id="fileNamePattern"
                            value={localSettings.fileNamePattern}
                            onChange={(e) => handleInputChange('fileNamePattern', e.target.value)}
                            className="w-full bg-black/20 dark:bg-knoux-dark-glass/50 border border-[var(--card-border)] rounded-md px-3 py-2 focus:ring-knoux-neon-blue focus:border-knoux-neon-blue transition"
                        />
                        <p className="text-xs text-[var(--secondary-text)] mt-2">
                            Placeholders: <kbd className="font-sans border border-gray-500 rounded-sm px-1 text-xs">[DATE]</kbd> <kbd className="font-sans border border-gray-500 rounded-sm px-1 text-xs">[TIME]</kbd>
                        </p>
                    </div>
                </div>
           </div>

           <div>
              <h3 className="text-lg font-bold font-orbitron mb-3 text-knoux-neon-blue/80">Hotkeys</h3>
                <div className="p-4 interactive-card rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="font-semibold text-md text-[var(--primary-text)]">Start / Stop</label>
                        <div className="w-1/2">
                            <HotkeyCaptureInput value={localSettings.hotkeys.startStop} onChange={(v) => handleHotkeyChange('startStop', v)} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="font-semibold text-md text-[var(--primary-text)]">Pause / Resume</label>
                        <div className="w-1/2">
                            <HotkeyCaptureInput value={localSettings.hotkeys.pauseResume} onChange={(v) => handleHotkeyChange('pauseResume', v)} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="font-semibold text-md text-[var(--primary-text)]">Screenshot</label>
                        <div className="w-1/2">
                            <HotkeyCaptureInput value={localSettings.hotkeys.screenshot} onChange={(v) => handleHotkeyChange('screenshot', v)} />
                        </div>
                    </div>
                </div>
           </div>

           <div>
              <h3 className="text-lg font-bold font-orbitron mb-3 text-knoux-neon-blue/80">Intelligence</h3>
                <div className="p-4 interactive-card rounded-lg flex items-center justify-between">
                   <div className="flex items-center gap-4">
                        <SparklesIcon className="w-6 h-6 text-knoux-purple"/>
                        <div>
                            <h4 className="font-semibold text-md text-[var(--primary-text)]">AI Post-Processing</h4>
                            <p className="text-xs text-[var(--secondary-text)]">Auto-generate title, summary & keywords after recording.</p>
                        </div>
                   </div>
                    <ToggleSwitch enabled={localSettings.aiProcessingEnabled} onChange={() => handleToggle('aiProcessingEnabled')} />
                </div>
           </div>
           <div className="flex justify-end pt-4">
                <button 
                    onClick={handleSave}
                    className="px-6 py-2 text-lg font-bold font-orbitron bg-knoux-purple text-white rounded-lg hover:shadow-neon-purple transition-all duration-300"
                >
                    Save & Close
                </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
