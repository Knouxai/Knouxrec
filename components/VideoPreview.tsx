import React, { useRef, useEffect, useState } from "react";
import { RecordingSettings } from "../types";

interface VideoPreviewProps {
  previewSource: MediaStream | string | null;
  isRecording: boolean;
  countdown: number;
  pipCameraStream: MediaStream | null;
  settings: RecordingSettings;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  previewSource,
  isRecording,
  countdown,
  pipCameraStream,
  settings,
}) => {
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("none");

  useEffect(() => {
    const videoEl = mainVideoRef.current;
    if (!videoEl) return;

    if (typeof previewSource === "string") {
      videoEl.srcObject = null;
      videoEl.src = previewSource;
      videoEl.muted = false;
      videoEl.play().catch(console.error);
    } else if (previewSource instanceof MediaStream) {
      videoEl.src = "";
      videoEl.srcObject = previewSource;
      videoEl.muted = true;
      videoEl.play().catch(console.error);
    }
  }, [previewSource]);

  useEffect(() => {
    const pipEl = pipVideoRef.current;
    if (!pipEl || !pipCameraStream) return;

    pipEl.srcObject = pipCameraStream;
    pipEl.muted = true;
    pipEl.play().catch(console.error);
  }, [pipCameraStream]);

  const toggleFullscreen = () => {
    const videoEl = mainVideoRef.current;
    if (!videoEl) return;

    if (!isFullscreen) {
      if (videoEl.requestFullscreen) {
        videoEl.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const applyFilter = (filter: string) => {
    setCurrentFilter(filter);
  };

  const getFilterStyle = () => {
    switch (currentFilter) {
      case "vintage":
        return "sepia(0.8) contrast(1.2) brightness(0.9)";
      case "cool":
        return "hue-rotate(180deg) brightness(1.1) contrast(1.1)";
      case "warm":
        return "hue-rotate(30deg) brightness(1.1) saturate(1.2)";
      case "cyberpunk":
        return "hue-rotate(280deg) saturate(1.5) contrast(1.3) brightness(1.1)";
      case "neon":
        return "contrast(1.4) saturate(1.6) hue-rotate(260deg) brightness(1.2)";
      default:
        return "none";
    }
  };

  const getPipPosition = () => {
    switch (settings.cameraPipPosition) {
      case "topLeft":
        return "top-4 left-4";
      case "topRight":
        return "top-4 right-4";
      case "bottomLeft":
        return "bottom-4 left-4";
      case "bottomRight":
        return "bottom-4 right-4";
      default:
        return "bottom-4 right-4";
    }
  };

  const getPipSize = () => {
    switch (settings.cameraPipSize) {
      case "small":
        return "w-24 h-18";
      case "medium":
        return "w-32 h-24";
      case "large":
        return "w-40 h-30";
      default:
        return "w-32 h-24";
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-knoux-purple/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              isRecording ? "bg-red-500 animate-pulse" : "bg-gray-500"
            }`}
          ></div>
          <h3 className="text-lg font-orbitron font-bold text-white">
            {isRecording ? "Live Preview" : "Preview"}
          </h3>
          {isRecording && (
            <span className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs font-medium">
              RECORDING
            </span>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-2">
          <select
            value={currentFilter}
            onChange={(e) => applyFilter(e.target.value)}
            className="px-3 py-1 bg-black/30 border border-knoux-purple/30 rounded-lg text-white text-sm focus:ring-2 focus:ring-knoux-purple"
          >
            <option value="none">No Filter</option>
            <option value="vintage">Vintage</option>
            <option value="cool">Cool</option>
            <option value="warm">Warm</option>
            <option value="cyberpunk">Cyberpunk</option>
            <option value="neon">Neon</option>
          </select>

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-knoux-purple/20 border border-knoux-purple/30 rounded-lg text-knoux-purple hover:bg-knoux-purple/30 transition-all"
            title="Toggle Fullscreen"
          >
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
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative aspect-video bg-black/30 rounded-xl overflow-hidden border border-knoux-purple/20">
        {countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-8xl font-orbitron font-bold text-knoux-purple mb-4 animate-bounce">
                {countdown}
              </div>
              <div className="text-xl text-white">Starting recording...</div>
            </div>
          </div>
        )}

        {previewSource ? (
          <video
            ref={mainVideoRef}
            className="w-full h-full object-cover"
            style={{ filter: getFilterStyle() }}
            autoPlay
            muted={previewSource instanceof MediaStream}
            playsInline
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">📹</div>
              <h3 className="text-xl font-orbitron font-bold text-white mb-2">
                Ready to Record
              </h3>
              <p className="text-white/70">
                Click start to begin your recording
              </p>
            </div>
          </div>
        )}

        {/* PiP Camera */}
        {pipCameraStream && settings.recordCamera && (
          <div className={`absolute ${getPipPosition()} ${getPipSize()} z-40`}>
            <video
              ref={pipVideoRef}
              className="w-full h-full object-cover rounded-lg border-2 border-knoux-neon shadow-neon-blue"
              autoPlay
              muted
              playsInline
            />
            <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        )}

        {/* Recording Info Overlay */}
        {isRecording && (
          <div className="absolute top-4 left-4 z-30">
            <div className="glass p-3 rounded-lg border border-red-500/30">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 font-medium text-sm">LIVE</span>
              </div>
              <div className="text-white/70 text-xs mt-1">
                {settings.videoQuality} • {settings.fps}fps
              </div>
            </div>
          </div>
        )}

        {/* Quality Badge */}
        <div className="absolute bottom-4 left-4 z-30">
          <div className="glass p-2 rounded-lg border border-knoux-purple/30">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-knoux-purple rounded-full"></div>
              <span className="text-knoux-purple font-medium text-xs">
                {settings.videoQuality}
              </span>
            </div>
          </div>
        </div>

        {/* Audio Indicator */}
        {settings.recordMic && (
          <div className="absolute bottom-4 right-4 z-30">
            <div className="glass p-2 rounded-lg border border-knoux-neon/30">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-knoux-neon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                <span className="text-knoux-neon font-medium text-xs">MIC</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-sm text-white/70">
            Resolution:{" "}
            <span className="text-knoux-purple font-medium">
              {settings.videoQuality}
            </span>
          </div>
          <div className="text-sm text-white/70">
            FPS:{" "}
            <span className="text-knoux-neon font-medium">{settings.fps}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isRecording && (
            <div className="flex items-center space-x-2 text-red-400">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Recording Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Performance Stats */}
      {isRecording && (
        <div className="mt-4 p-3 bg-black/20 rounded-lg border border-white/10">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-knoux-purple">HD</div>
              <div className="text-xs text-white/70">Quality</div>
            </div>
            <div>
              <div className="text-lg font-bold text-knoux-neon">
                {settings.fps}
              </div>
              <div className="text-xs text-white/70">FPS</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">●</div>
              <div className="text-xs text-white/70">Stable</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPreview;
