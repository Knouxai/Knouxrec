import React, { useState } from "react";
import { Hotkeys } from "../types";

interface ActionsProps {
  recordingState: "IDLE" | "RECORDING" | "PAUSED" | "STOPPED" | "STARTING";
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onScreenshot: () => void;
  disabled: boolean;
  timer: string;
  fps: number;
  scheduleStatus: string;
  hotkeys: Hotkeys;
}

const Actions: React.FC<ActionsProps> = ({
  recordingState,
  onStart,
  onStop,
  onPause,
  onResume,
  onScreenshot,
  disabled,
  timer,
  fps,
  scheduleStatus,
  hotkeys,
}) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const getRecordButtonContent = () => {
    switch (recordingState) {
      case "STARTING":
        return {
          icon: (
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          ),
          text: "Starting...",
          color: "yellow-400",
          glow: "yellow",
        };
      case "RECORDING":
        return {
          icon: (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ),
          text: "Stop Recording",
          color: "red-500",
          glow: "red",
        };
      case "PAUSED":
        return {
          icon: (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          ),
          text: "Resume",
          color: "green-500",
          glow: "green",
        };
      default:
        return {
          icon: (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
            </svg>
          ),
          text: "Start Recording",
          color: "knoux-purple",
          glow: "purple",
        };
    }
  };

  const primaryButton = getRecordButtonContent();

  const handlePrimaryAction = () => {
    if (recordingState === "IDLE") {
      onStart();
    } else if (recordingState === "RECORDING") {
      onStop();
    } else if (recordingState === "PAUSED") {
      onResume();
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-knoux-purple/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-orbitron font-bold text-white">
          🎬 Recording Controls
        </h3>
        {recordingState !== "IDLE" && (
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-knoux-neon">
                {timer}
              </div>
              <div className="text-sm text-white/70">{fps} FPS</div>
            </div>
          </div>
        )}
      </div>

      {/* Main Recording Button */}
      <div className="mb-6">
        <button
          onClick={handlePrimaryAction}
          disabled={disabled}
          onMouseEnter={() => setHoveredButton("primary")}
          onMouseLeave={() => setHoveredButton(null)}
          className={`w-full p-6 rounded-2xl font-bold text-xl transition-all duration-300 transform relative overflow-hidden group ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : `hover:scale-105 hover:shadow-neon-${primaryButton.glow} active:scale-95`
          }`}
          style={{
            background: `linear-gradient(45deg, ${
              recordingState === "RECORDING"
                ? "rgb(239, 68, 68)"
                : recordingState === "PAUSED"
                  ? "rgb(34, 197, 94)"
                  : recordingState === "STARTING"
                    ? "rgb(251, 191, 36)"
                    : "rgb(139, 92, 246)"
            }, ${
              recordingState === "RECORDING"
                ? "rgb(220, 38, 38)"
                : recordingState === "PAUSED"
                  ? "rgb(21, 128, 61)"
                  : recordingState === "STARTING"
                    ? "rgb(245, 158, 11)"
                    : "rgb(0, 217, 255)"
            })`,
            boxShadow:
              hoveredButton === "primary"
                ? `0 0 40px ${
                    recordingState === "RECORDING"
                      ? "rgb(239, 68, 68)"
                      : recordingState === "PAUSED"
                        ? "rgb(34, 197, 94)"
                        : recordingState === "STARTING"
                          ? "rgb(251, 191, 36)"
                          : "rgb(139, 92, 246)"
                  }`
                : "none",
          }}
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

          <div className="relative flex items-center justify-center space-x-3 text-white">
            {primaryButton.icon}
            <span className="font-orbitron">{primaryButton.text}</span>
          </div>

          {/* Hotkey Hint */}
          <div className="absolute bottom-2 right-2 text-xs text-white/70 font-mono">
            {hotkeys.startStop}
          </div>
        </button>
      </div>

      {/* Secondary Controls */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Pause/Resume Button */}
        {recordingState === "RECORDING" && (
          <button
            onClick={onPause}
            onMouseEnter={() => setHoveredButton("pause")}
            onMouseLeave={() => setHoveredButton(null)}
            className="p-4 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 transition-all duration-300 group"
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              <span className="font-rajdhani font-bold">Pause</span>
            </div>
            <div className="text-xs mt-1 font-mono text-yellow-400/70">
              {hotkeys.pauseResume}
            </div>
          </button>
        )}

        {/* Screenshot Button */}
        <button
          onClick={onScreenshot}
          disabled={recordingState === "IDLE"}
          onMouseEnter={() => setHoveredButton("screenshot")}
          onMouseLeave={() => setHoveredButton(null)}
          className={`p-4 rounded-xl transition-all duration-300 group ${
            recordingState === "IDLE"
              ? "bg-gray-500/20 border border-gray-500/30 text-gray-500 cursor-not-allowed"
              : "bg-knoux-neon/20 border border-knoux-neon/30 text-knoux-neon hover:bg-knoux-neon/30"
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="font-rajdhani font-bold">Screenshot</span>
          </div>
          <div className="text-xs mt-1 font-mono opacity-70">
            {hotkeys.screenshot}
          </div>
        </button>
      </div>

      {/* Status Information */}
      <div className="space-y-3">
        {/* Recording State */}
        <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/10">
          <span className="text-white/70">Status:</span>
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                recordingState === "RECORDING"
                  ? "bg-red-500 animate-pulse"
                  : recordingState === "PAUSED"
                    ? "bg-yellow-500"
                    : recordingState === "STARTING"
                      ? "bg-yellow-500 animate-pulse"
                      : "bg-gray-500"
              }`}
            ></div>
            <span
              className={`font-medium ${
                recordingState === "RECORDING"
                  ? "text-red-400"
                  : recordingState === "PAUSED"
                    ? "text-yellow-400"
                    : recordingState === "STARTING"
                      ? "text-yellow-400"
                      : "text-gray-400"
              }`}
            >
              {recordingState === "IDLE"
                ? "Ready"
                : recordingState === "STARTING"
                  ? "Initializing"
                  : recordingState === "RECORDING"
                    ? "Recording"
                    : recordingState === "PAUSED"
                      ? "Paused"
                      : "Stopped"}
            </span>
          </div>
        </div>

        {/* Schedule Status */}
        {scheduleStatus && (
          <div className="flex items-center justify-between p-3 bg-knoux-purple/10 rounded-lg border border-knoux-purple/20">
            <span className="text-white/70">Schedule:</span>
            <span className="text-knoux-purple font-medium">
              {scheduleStatus}
            </span>
          </div>
        )}

        {/* Performance Info */}
        {recordingState === "RECORDING" && (
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="text-green-400 font-bold">●</div>
              <div className="text-xs text-green-400">Stable</div>
            </div>
            <div className="text-center p-2 bg-knoux-neon/10 rounded-lg border border-knoux-neon/20">
              <div className="text-knoux-neon font-bold">{fps}</div>
              <div className="text-xs text-knoux-neon">FPS</div>
            </div>
            <div className="text-center p-2 bg-knoux-purple/10 rounded-lg border border-knoux-purple/20">
              <div className="text-knoux-purple font-bold">HD</div>
              <div className="text-xs text-knoux-purple">Quality</div>
            </div>
          </div>
        )}
      </div>

      {/* Hotkeys Reference */}
      <div className="mt-6 p-4 bg-black/20 rounded-lg border border-white/10">
        <h4 className="text-sm font-bold text-white mb-2">
          ⌨️ Keyboard Shortcuts
        </h4>
        <div className="space-y-1 text-xs text-white/70">
          <div className="flex justify-between">
            <span>Start/Stop:</span>
            <code className="font-mono text-knoux-purple">
              {hotkeys.startStop}
            </code>
          </div>
          <div className="flex justify-between">
            <span>Pause/Resume:</span>
            <code className="font-mono text-knoux-neon">
              {hotkeys.pauseResume}
            </code>
          </div>
          <div className="flex justify-between">
            <span>Screenshot:</span>
            <code className="font-mono text-green-400">
              {hotkeys.screenshot}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Actions;
