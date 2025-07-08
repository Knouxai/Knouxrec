import React from "react";
import { ScreenIcon, MicIcon, SystemAudioIcon, CameraIcon } from "./icons";
import { RecordingSettings } from "../types";
import ToggleSwitch from "./ToggleSwitch";

const ControlCard = ({
  icon,
  label,
  description,
  enabled,
  onToggle,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled: boolean;
}) => (
  <div
    className={`glass-card p-4 rounded-xl transition-all duration-300 flex items-center justify-between border ${
      enabled && !disabled
        ? "border-knoux-purple bg-knoux-purple/10"
        : "border-knoux-purple/20 hover:border-knoux-purple/40"
    } ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "interactive"}`}
  >
    <div className="flex items-center gap-4">
      <div
        className={`flex-shrink-0 text-2xl ${enabled ? "text-knoux-purple" : "text-knoux-neon"}`}
      >
        {icon}
      </div>
      <div className="flex-grow">
        <h4 className="font-rajdhani font-bold text-white">{label}</h4>
        <p className="text-sm text-white/70">{description}</p>
      </div>
    </div>
    <ToggleSwitch enabled={enabled} onChange={onToggle} disabled={disabled} />
  </div>
);

const SelectControl = <T extends string | number>({
  label,
  value,
  options,
  onChange,
  disabled,
  icon,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  disabled: boolean;
  icon?: React.ReactNode;
}) => (
  <div
    className={`glass-card p-4 rounded-xl transition-all duration-300 flex items-center justify-between border border-knoux-purple/20 ${
      disabled
        ? "opacity-50 cursor-not-allowed pointer-events-none"
        : "hover:border-knoux-purple/40"
    }`}
  >
    <div className="flex items-center gap-3">
      {icon && <div className="text-knoux-neon text-xl">{icon}</div>}
      <label className="font-rajdhani font-bold text-white">{label}</label>
    </div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      disabled={disabled}
      className="p-2 rounded-lg bg-black/30 border border-knoux-purple/30 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-knoux-purple focus:border-knoux-purple min-w-[120px]"
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="bg-black text-white"
        >
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

interface ControlsProps {
  settings: RecordingSettings;
  onSettingsChange: (settings: RecordingSettings) => void;
  isRecording: boolean;
  isGameModeActive: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  settings,
  onSettingsChange,
  isRecording,
  isGameModeActive,
}) => {
  const updateSetting = <K extends keyof RecordingSettings>(
    key: K,
    value: RecordingSettings[K],
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const videoQualityOptions = [
    { value: "480p" as const, label: "480p (SD)" },
    { value: "720p" as const, label: "720p (HD)" },
    { value: "1080p" as const, label: "1080p (FHD)" },
  ];

  const fpsOptions = [
    { value: 30 as const, label: "30 FPS" },
    { value: 60 as const, label: "60 FPS" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-4 rounded-xl border border-knoux-purple/30">
        <h3 className="text-xl font-orbitron font-bold text-white mb-2">
          🎛️ Recording Controls
        </h3>
        <p className="text-white/70">
          Configure your recording sources and quality
        </p>
      </div>

      {/* Source Controls */}
      <div className="space-y-4">
        <h4 className="font-orbitron font-bold text-white mb-3">
          📹 Recording Sources
        </h4>

        <ControlCard
          icon={<ScreenIcon />}
          label="Screen Recording"
          description="Capture your entire screen or window"
          enabled={settings.recordScreen}
          onToggle={(enabled) => updateSetting("recordScreen", enabled)}
          disabled={isRecording}
        />

        <ControlCard
          icon={<MicIcon />}
          label="Microphone"
          description="Record audio from your microphone"
          enabled={settings.recordMic}
          onToggle={(enabled) => updateSetting("recordMic", enabled)}
          disabled={isRecording}
        />

        <ControlCard
          icon={<SystemAudioIcon />}
          label="System Audio"
          description="Capture computer's audio output"
          enabled={settings.recordSystemAudio}
          onToggle={(enabled) => updateSetting("recordSystemAudio", enabled)}
          disabled={isRecording}
        />

        <ControlCard
          icon={<CameraIcon />}
          label="Camera (PiP)"
          description="Add camera feed as picture-in-picture"
          enabled={settings.recordCamera}
          onToggle={(enabled) => updateSetting("recordCamera", enabled)}
          disabled={isRecording}
        />
      </div>

      {/* Quality Settings */}
      <div className="space-y-4">
        <h4 className="font-orbitron font-bold text-white mb-3">
          ⚡ Quality Settings
        </h4>

        <SelectControl
          label="Video Quality"
          value={settings.videoQuality}
          options={videoQualityOptions}
          onChange={(value) => updateSetting("videoQuality", value)}
          disabled={isRecording}
          icon="🎥"
        />

        <SelectControl
          label="Frame Rate"
          value={settings.fps}
          options={fpsOptions}
          onChange={(value) => updateSetting("fps", value)}
          disabled={isRecording}
          icon="📊"
        />
      </div>

      {/* Game Mode */}
      <div
        className={`glass-card p-4 rounded-xl border transition-all duration-300 ${
          isGameModeActive
            ? "border-green-500 bg-green-500/10"
            : "border-knoux-purple/20 hover:border-knoux-purple/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl">🎮</div>
            <div>
              <h4 className="font-rajdhani font-bold text-white">Game Mode</h4>
              <p className="text-sm text-white/70">
                Optimized for gaming performance
              </p>
            </div>
          </div>
          <ToggleSwitch
            enabled={settings.gameMode}
            onChange={(enabled) => updateSetting("gameMode", enabled)}
            disabled={isRecording}
          />
        </div>

        {isGameModeActive && (
          <div className="mt-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-center space-x-2 text-green-400 text-sm">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>High performance mode active</span>
            </div>
            <ul className="mt-2 text-xs text-white/60 space-y-1">
              <li>• Reduced system overhead</li>
              <li>• Priority CPU scheduling</li>
              <li>• Optimized for 60+ FPS</li>
            </ul>
          </div>
        )}
      </div>

      {/* Status Summary */}
      <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
        <h4 className="font-orbitron font-bold text-white mb-3">
          📊 Recording Status
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div
            className={`p-3 rounded-lg text-center ${
              settings.recordScreen
                ? "bg-knoux-purple/20 text-knoux-purple"
                : "bg-gray-500/20 text-gray-500"
            }`}
          >
            <div className="text-lg">📺</div>
            <div className="text-xs">Screen</div>
          </div>
          <div
            className={`p-3 rounded-lg text-center ${
              settings.recordMic
                ? "bg-knoux-neon/20 text-knoux-neon"
                : "bg-gray-500/20 text-gray-500"
            }`}
          >
            <div className="text-lg">🎤</div>
            <div className="text-xs">Mic</div>
          </div>
          <div
            className={`p-3 rounded-lg text-center ${
              settings.recordSystemAudio
                ? "bg-green-400/20 text-green-400"
                : "bg-gray-500/20 text-gray-500"
            }`}
          >
            <div className="text-lg">🔊</div>
            <div className="text-xs">Audio</div>
          </div>
          <div
            className={`p-3 rounded-lg text-center ${
              settings.recordCamera
                ? "bg-yellow-400/20 text-yellow-400"
                : "bg-gray-500/20 text-gray-500"
            }`}
          >
            <div className="text-lg">📷</div>
            <div className="text-xs">Camera</div>
          </div>
        </div>

        {/* Quality Info */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-white/70">Quality:</span>
          <span className="text-knoux-purple font-medium">
            {settings.videoQuality} @ {settings.fps}fps
          </span>
        </div>
      </div>
    </div>
  );
};

export default Controls;
