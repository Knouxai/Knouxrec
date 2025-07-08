import React from 'react';
// Ensure correct paths for icons and types
import { ScreenIcon, MicIcon, SystemAudioIcon, CameraIcon, TimerIcon, CropIcon, CursorClickIcon } from './icons'; 
import { RecordingSettings } from '../types'; 
import ToggleSwitch from './ToggleSwitch';

// Re-using ControlCard for toggle-based settings
const ControlCard = ({ icon, label, description, enabled, onToggle, disabled }: { icon: React.ReactNode, label: string, description: string, enabled: boolean, onToggle: (enabled: boolean) => void, disabled: boolean }) => (
  // Disabled style updated to reflect non-interactiveness
  <div className={`p-4 rounded-lg transition-all duration-300 interactive-card flex items-center justify-between ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
    <div className="flex items-center gap-4">
      <div className="text-knoux-neon-blue flex-shrink-0">
        {icon}
      </div>
      <div className="flex-grow">
        <h4 className="font-bold text-md text-[var(--primary-text)]">{label}</h4>
        <p className="text-xs text-[var(--secondary-text)]">{description}</p>
      </div>
    </div>
    <ToggleSwitch enabled={enabled} onChange={onToggle} disabled={disabled} />
  </div>
);

// Component for Select inputs (e.g., Video Quality, FPS, PIP Position/Size)
const SelectControl = <T extends string | number>({ label, value, options, onChange, disabled }: {
  label: string;
  value: T;
  options: { value: T, label: string }[];
  onChange: (value: T) => void;
  disabled: boolean;
}) => (
    <div className={`p-4 rounded-lg transition-all duration-300 interactive-card flex items-center justify-between ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
        <label className="flex-grow text-md font-bold text-[var(--primary-text)]">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value as T)} // Type assertion
            disabled={disabled}
            className="p-2 ml-2 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--primary-text)] disabled:opacity-50 disabled:cursor-not-allowed focus:ring-knoux-neon-blue focus:border-knoux-neon-blue"
        >
            {options.map(option => (
                <option key={option.value.toString()} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);

// Component for Number inputs (e.g., Countdown Seconds)
const NumberInputControl = ({ label, value, onChange, disabled, min = 0, max }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    disabled: boolean;
    min?: number;
    max?: number;
}) => (
     <div className={`p-4 rounded-lg transition-all duration-300 interactive-card flex items-center justify-between ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
        <label className="flex-grow text-md font-bold text-[var(--primary-text)]">{label}</label>
         <input
             type="number"
             value={value}
             onChange={(e) => onChange(Number(e.target.value))} // Convert to number
             disabled={disabled}
             min={min}
             max={max}
             className="p-2 ml-2 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--primary-text)] w-20 text-center disabled:opacity-50 disabled:cursor-not-allowed focus:ring-knoux-neon-blue focus:border-knoux-neon-blue"
         />
     </div>
);


interface ControlsProps {
  settings: RecordingSettings;
  onSettingsChange: (settings: RecordingSettings) => void;
  isRecording: boolean;
  isGameModeActive: boolean;
}

const Controls = ({ settings, onSettingsChange, isRecording, isGameModeActive }: ControlsProps) => {

  const isDisabled = isRecording || isGameModeActive;

  const handleSettingChange = <K extends keyof RecordingSettings>(key: K, value: RecordingSettings[K]) => {
      onSettingsChange({
          ...settings,
          [key]: value
      });
  };

   const handleToggle = (key: keyof RecordingSettings) => {
       if (typeof settings[key] === 'boolean') {
            handleSettingChange(key, !settings[key]);
       }
   };


  return (
    <div className="p-4 glass-card rounded-xl">
      <h3 className="text-lg font-bold font-orbitron mb-4 text-knoux-purple">SOURCES</h3>
      <div className="space-y-3">
        <ControlCard
          icon={<ScreenIcon className="w-7 h-7"/>}
          label="Screen"
          description="Record entire screen or a window"
          enabled={settings.recordScreen}
          onToggle={() => handleToggle('recordScreen')}
          disabled={isDisabled}
        />
        <ControlCard
          icon={<MicIcon className="w-7 h-7"/>}
          label="Microphone"
          description="Record audio from your mic"
          enabled={settings.recordMic}
          onToggle={() => handleToggle('recordMic')}
          disabled={isDisabled}
        />
        <ControlCard
          icon={<SystemAudioIcon className="w-7 h-7"/>}
          label="System Audio"
          description="Record audio from your computer"
          enabled={settings.recordSystemAudio}
          onToggle={() => handleToggle('recordSystemAudio')}
          disabled={isDisabled}
        />
        <ControlCard
          icon={<CameraIcon className="w-7 h-7"/>}
          label="Camera"
          description="Record camera Picture-in-Picture"
          enabled={settings.recordCamera}
          onToggle={() => handleToggle('recordCamera')}
          disabled={isDisabled}
        />
      </div>

      <h3 className="text-lg font-bold font-orbitron my-4 text-knoux-purple">VIDEO & SCREEN</h3>
      <div className="space-y-3">
         <ControlCard
             icon={<CropIcon className="w-7 h-7"/>}
             label="Select Region"
             description="Choose a specific screen area to record"
             enabled={settings.enableRegionSelection}
             onToggle={() => handleToggle('enableRegionSelection')}
             disabled={isDisabled || !settings.recordScreen}
         />

          <SelectControl
               label="Video Quality"
               value={settings.videoQuality}
               options={[
                   { value: '1080p', label: '1080p (Full HD)' },
                   { value: '720p', label: '720p (HD)' },
                   { value: '480p', label: '480p (SD)' },
               ]}
               disabled={isDisabled || !settings.recordScreen}
               onChange={(value) => handleSettingChange('videoQuality', value as '1080p' | '720p' | '480p')}
           />

          <SelectControl
               label="Frames Per Second (FPS)"
               value={settings.fps}
                options={[
                   { value: 30, label: '30 FPS' },
                   { value: 60, label: '60 FPS' },
               ]}
                disabled={isDisabled || (!settings.recordScreen && !settings.recordCamera)}
               onChange={(value) => handleSettingChange('fps', Number(value) as 30 | 60)}
           />

          <ControlCard
             icon={<CursorClickIcon className="w-7 h-7"/>}
             label="Highlight Mouse"
             description="Highlight pointer movement and clicks"
             enabled={settings.highlightMouse}
             onToggle={() => handleToggle('highlightMouse')}
             disabled={isDisabled || !settings.recordScreen}
          />
      </div>

        {settings.recordCamera && (
             <>
              <h3 className="text-lg font-bold font-orbitron my-4 text-knoux-purple">CAMERA PICTURE-IN-PICTURE</h3>
               <div className="space-y-3">
                  <SelectControl
                       label="PIP Position"
                       value={settings.cameraPipPosition}
                       options={[
                           { value: 'topLeft', label: 'Top Left' },
                           { value: 'topRight', label: 'Top Right' },
                           { value: 'bottomLeft', label: 'Bottom Left' },
                           { value: 'bottomRight', label: 'Bottom Right' },
                       ]}
                       disabled={isDisabled}
                       onChange={(value) => handleSettingChange('cameraPipPosition', value as 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight')}
                   />

                    {settings.cameraPipPosition !== 'none' && (
                        <SelectControl
                             label="PIP Size"
                             value={settings.cameraPipSize}
                              options={[
                                 { value: 'small', label: 'Small' },
                                 { value: 'medium', label: 'Medium' },
                                 { value: 'large', label: 'Large' },
                             ]}
                             disabled={isDisabled}
                             onChange={(value) => handleSettingChange('cameraPipSize', value as 'small' | 'medium' | 'large')}
                         />
                    )}
               </div>
             </>
        )}

         <h3 className="text-lg font-bold font-orbitron my-4 text-knoux-purple">TIMER</h3>
         <div className="space-y-3">
             <ControlCard
                icon={<TimerIcon className="w-7 h-7"/>}
                label="Recording Countdown"
                description="Delay recording start by X seconds"
                enabled={settings.countdownEnabled}
                onToggle={() => handleToggle('countdownEnabled')}
                disabled={isDisabled}
             />
             {settings.countdownEnabled && (
                  <NumberInputControl
                     label="Countdown Seconds"
                     value={settings.countdownSeconds}
                     onChange={(value) => handleSettingChange('countdownSeconds', value)}
                     disabled={isDisabled}
                     min={1}
                     max={10}
                  />
             )}
         </div>
    </div>
  );
};

export default Controls;