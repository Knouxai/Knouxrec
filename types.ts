export interface ClickEffect {
  id: number;
  x: number;
  y: number;
  radius: number;
  opacity: number;
  maxRadius: number;
}

export interface Hotkeys {
  startStop: string;
  pauseResume: string;
  screenshot: string;
}

export interface Recording {
  id: string; // Changed to string for consistency (e.g., `rec-${Date.now()}`)
  name: string;
  url: string;
  blob: Blob; // The actual data
  size: number;
  date: Date;
  duration: number; // in seconds
  transcript?: string;
  summary?: string;
  keywords?: string[];
  isProcessing?: boolean;
  trim?: { start: number; end: number };
  metadata: RecordingSettings; // Settings used for this recording
}

export enum RecordingState {
  Idle = "IDLE",
  Recording = "RECORDING",
  Paused = "PAUSED",
  Stopped = "STOPPED",
  Starting = "STARTING", // Added for clarity during setup
}

export interface RecordingSettings {
  recordScreen: boolean;
  recordMic: boolean;
  recordSystemAudio: boolean;
  recordCamera: boolean;
  videoQuality: "1080p" | "720p" | "480p";
  fps: 30 | 60;
  gameMode: boolean;
  aiProcessingEnabled: boolean;
  scheduleEnabled: boolean;
  scheduleTime: string;
  instantTrimEnabled: boolean;
  fileNamePattern: string;
  hotkeys: Hotkeys;
  liveFilter: "none" | "vintage" | "cool" | "warm" | "cyberpunk" | "neon";
  enableRegionSelection: boolean;
  countdownEnabled: boolean;
  countdownSeconds: number;
  highlightMouse: boolean;
  cameraPipPosition:
    | "none"
    | "topLeft"
    | "topRight"
    | "bottomLeft"
    | "bottomRight";
  cameraPipSize: "small" | "medium" | "large";
}

export type Theme = "light" | "dark";

export interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}
