import React, { useState } from "react";
import { RecordingSettings } from "../types";
import ToggleSwitch from "./ToggleSwitch";

interface FeaturesProps {
  settings: RecordingSettings;
  onSettingsChange: (settings: RecordingSettings) => void;
  isRecording: boolean;
}

const Features: React.FC<FeaturesProps> = ({
  settings,
  onSettingsChange,
  isRecording,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const updateSetting = <K extends keyof RecordingSettings>(
    key: K,
    value: RecordingSettings[K],
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const FeatureCard = ({
    icon,
    title,
    description,
    enabled,
    onToggle,
    disabled = false,
    premium = false,
  }: {
    icon: string;
    title: string;
    description: string;
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    disabled?: boolean;
    premium?: boolean;
  }) => (
    <div
      className={`glass-card p-4 rounded-xl border transition-all duration-300 ${
        enabled && !disabled
          ? "border-knoux-purple bg-knoux-purple/10"
          : "border-knoux-purple/20 hover:border-knoux-purple/40"
      } ${disabled ? "opacity-50" : "interactive"}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{icon}</div>
          <div className="flex-grow">
            <div className="flex items-center space-x-2">
              <h4 className="font-rajdhani font-bold text-white">{title}</h4>
              {premium && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded text-xs font-bold text-black">
                  PRO
                </span>
              )}
            </div>
            <p className="text-sm text-white/70">{description}</p>
          </div>
        </div>
        <ToggleSwitch
          enabled={enabled}
          onChange={onToggle}
          disabled={disabled}
        />
      </div>
    </div>
  );

  const ExpandableSection = ({
    title,
    icon,
    children,
    sectionKey,
  }: {
    title: string;
    icon: string;
    children: React.ReactNode;
    sectionKey: string;
  }) => {
    const isExpanded = expandedSection === sectionKey;

    return (
      <div className="glass-card rounded-xl border border-knoux-purple/20 overflow-hidden">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all"
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{icon}</span>
            <span className="font-orbitron font-bold text-white">{title}</span>
          </div>
          <svg
            className={`w-5 h-5 text-knoux-purple transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isExpanded && (
          <div className="p-4 border-t border-knoux-purple/20 bg-black/10">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-4 rounded-xl border border-knoux-purple/30">
        <h3 className="text-xl font-orbitron font-bold text-white mb-2">
          ⚡ Advanced Features
        </h3>
        <p className="text-white/70">
          Enhance your recording experience with AI-powered tools
        </p>
      </div>

      {/* AI & Processing */}
      <ExpandableSection title="AI Processing" icon="🧠" sectionKey="ai">
        <div className="space-y-4">
          <FeatureCard
            icon="🎤"
            title="Speech Analysis"
            description="Real-time speech-to-text and AI summarization"
            enabled={settings.aiProcessingEnabled}
            onToggle={(enabled) =>
              updateSetting("aiProcessingEnabled", enabled)
            }
            disabled={isRecording}
          />

          <FeatureCard
            icon="📝"
            title="Auto Transcription"
            description="Automatically transcribe speech during recording"
            enabled={settings.aiProcessingEnabled}
            onToggle={(enabled) =>
              updateSetting("aiProcessingEnabled", enabled)
            }
            disabled={isRecording}
            premium
          />

          <FeatureCard
            icon="🏷️"
            title="Smart Tagging"
            description="Automatically generate tags and keywords"
            enabled={settings.aiProcessingEnabled}
            onToggle={(enabled) =>
              updateSetting("aiProcessingEnabled", enabled)
            }
            disabled={isRecording}
            premium
          />
        </div>
      </ExpandableSection>

      {/* Filters & Effects */}
      <ExpandableSection title="Visual Effects" icon="🎨" sectionKey="effects">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="glass-card p-4 rounded-lg border border-knoux-neon/20">
              <label className="block text-sm font-medium text-white mb-2">
                Live Filter
              </label>
              <select
                value={settings.liveFilter}
                onChange={(e) =>
                  updateSetting("liveFilter", e.target.value as any)
                }
                disabled={isRecording}
                className="w-full p-2 bg-black/30 border border-knoux-neon/30 rounded-lg text-white focus:ring-2 focus:ring-knoux-neon"
              >
                <option value="none">No Filter</option>
                <option value="vintage">Vintage</option>
                <option value="cool">Cool</option>
                <option value="warm">Warm</option>
                <option value="cyberpunk">Cyberpunk</option>
                <option value="neon">Neon Glow</option>
              </select>
            </div>

            <FeatureCard
              icon="🖱️"
              title="Mouse Highlight"
              description="Highlight mouse cursor with glow effect"
              enabled={settings.highlightMouse}
              onToggle={(enabled) => updateSetting("highlightMouse", enabled)}
              disabled={isRecording}
            />

            <FeatureCard
              icon="🎯"
              title="Region Selection"
              description="Record specific screen regions"
              enabled={settings.enableRegionSelection}
              onToggle={(enabled) =>
                updateSetting("enableRegionSelection", enabled)
              }
              disabled={isRecording}
            />
          </div>
        </div>
      </ExpandableSection>

      {/* Camera & PIP */}
      <ExpandableSection title="Camera Settings" icon="📹" sectionKey="camera">
        <div className="space-y-4">
          <FeatureCard
            icon="📷"
            title="Picture-in-Picture"
            description="Show camera feed during screen recording"
            enabled={settings.recordCamera}
            onToggle={(enabled) => updateSetting("recordCamera", enabled)}
            disabled={isRecording}
          />

          {settings.recordCamera && (
            <div className="grid grid-cols-2 gap-4 ml-8">
              <div className="glass-card p-3 rounded-lg border border-knoux-purple/20">
                <label className="block text-sm font-medium text-white mb-2">
                  Position
                </label>
                <select
                  value={settings.cameraPipPosition}
                  onChange={(e) =>
                    updateSetting("cameraPipPosition", e.target.value as any)
                  }
                  disabled={isRecording}
                  className="w-full p-2 bg-black/30 border border-knoux-purple/30 rounded text-white text-sm"
                >
                  <option value="topLeft">Top Left</option>
                  <option value="topRight">Top Right</option>
                  <option value="bottomLeft">Bottom Left</option>
                  <option value="bottomRight">Bottom Right</option>
                </select>
              </div>

              <div className="glass-card p-3 rounded-lg border border-knoux-purple/20">
                <label className="block text-sm font-medium text-white mb-2">
                  Size
                </label>
                <select
                  value={settings.cameraPipSize}
                  onChange={(e) =>
                    updateSetting("cameraPipSize", e.target.value as any)
                  }
                  disabled={isRecording}
                  className="w-full p-2 bg-black/30 border border-knoux-purple/30 rounded text-white text-sm"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </ExpandableSection>

      {/* Automation */}
      <ExpandableSection title="Automation" icon="⏰" sectionKey="automation">
        <div className="space-y-4">
          <FeatureCard
            icon="⏱️"
            title="Scheduled Recording"
            description="Start recording at a specific time"
            enabled={settings.scheduleEnabled}
            onToggle={(enabled) => updateSetting("scheduleEnabled", enabled)}
            disabled={isRecording}
          />

          {settings.scheduleEnabled && (
            <div className="ml-8">
              <div className="glass-card p-3 rounded-lg border border-knoux-purple/20">
                <label className="block text-sm font-medium text-white mb-2">
                  Schedule Time
                </label>
                <input
                  type="time"
                  value={settings.scheduleTime}
                  onChange={(e) =>
                    updateSetting("scheduleTime", e.target.value)
                  }
                  disabled={isRecording}
                  className="w-full p-2 bg-black/30 border border-knoux-purple/30 rounded text-white focus:ring-2 focus:ring-knoux-purple"
                />
              </div>
            </div>
          )}

          <FeatureCard
            icon="⏳"
            title="Countdown Timer"
            description="Show countdown before recording starts"
            enabled={settings.countdownEnabled}
            onToggle={(enabled) => updateSetting("countdownEnabled", enabled)}
            disabled={isRecording}
          />

          {settings.countdownEnabled && (
            <div className="ml-8">
              <div className="glass-card p-3 rounded-lg border border-knoux-purple/20">
                <label className="block text-sm font-medium text-white mb-2">
                  Countdown Duration: {settings.countdownSeconds}s
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={settings.countdownSeconds}
                  onChange={(e) =>
                    updateSetting("countdownSeconds", parseInt(e.target.value))
                  }
                  disabled={isRecording}
                  className="w-full"
                />
              </div>
            </div>
          )}

          <FeatureCard
            icon="✂️"
            title="Instant Trim"
            description="Automatically open trim editor after recording"
            enabled={settings.instantTrimEnabled}
            onToggle={(enabled) => updateSetting("instantTrimEnabled", enabled)}
            disabled={isRecording}
          />
        </div>
      </ExpandableSection>

      {/* Game Mode */}
      <div className="glass-card p-4 rounded-xl border border-green-500/30 bg-green-500/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎮</span>
            <div>
              <h4 className="font-orbitron font-bold text-green-400">
                Game Mode
              </h4>
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

        {settings.gameMode && (
          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
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
              <span>High performance mode enabled</span>
            </div>
            <ul className="mt-2 text-xs text-white/60 space-y-1">
              <li>• Reduced system overhead</li>
              <li>• Priority CPU scheduling</li>
              <li>• Optimized memory usage</li>
            </ul>
          </div>
        )}
      </div>

      {/* Feature Status */}
      <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
        <h4 className="font-orbitron font-bold text-white mb-3">
          📊 Active Features
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div
            className={`p-2 rounded-lg text-center ${
              settings.aiProcessingEnabled
                ? "bg-knoux-purple/20 text-knoux-purple"
                : "bg-gray-500/20 text-gray-500"
            }`}
          >
            <div className="text-lg">🧠</div>
            <div className="text-xs">AI Processing</div>
          </div>
          <div
            className={`p-2 rounded-lg text-center ${
              settings.recordCamera
                ? "bg-knoux-neon/20 text-knoux-neon"
                : "bg-gray-500/20 text-gray-500"
            }`}
          >
            <div className="text-lg">📹</div>
            <div className="text-xs">Camera PIP</div>
          </div>
          <div
            className={`p-2 rounded-lg text-center ${
              settings.gameMode
                ? "bg-green-400/20 text-green-400"
                : "bg-gray-500/20 text-gray-500"
            }`}
          >
            <div className="text-lg">🎮</div>
            <div className="text-xs">Game Mode</div>
          </div>
          <div
            className={`p-2 rounded-lg text-center ${
              settings.scheduleEnabled
                ? "bg-yellow-400/20 text-yellow-400"
                : "bg-gray-500/20 text-gray-500"
            }`}
          >
            <div className="text-lg">⏰</div>
            <div className="text-xs">Scheduler</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
