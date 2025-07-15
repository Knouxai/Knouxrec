import React, { useState, useEffect, useCallback, useRef, FC, ReactNode } from "react";

// =================================================================
// TYPES (الأنواع)
// =================================================================

interface RecordingSettings {
  recordScreen: boolean;
  recordMic: boolean;
  recordSystemAudio: boolean;
  recordCamera: boolean;
  videoQuality: "720p" | "1080p" | "1440p" | "4k";
  fps: 30 | 60;
  gameMode: boolean;
  aiProcessingEnabled: boolean;
  scheduleEnabled: boolean;
  scheduleTime: string;
  instantTrimEnabled: boolean;
  fileNamePattern: string;
  hotkeys: {
    startStop: string;
    pauseResume: string;
    screenshot: string;
  };
  liveFilter: string;
  enableRegionSelection: boolean;
  countdownEnabled: boolean;
  countdownSeconds: number;
  highlightMouse: boolean;
  cameraPipPosition: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  cameraPipSize: "small" | "medium" | "large";
}

interface Recording {
  id: string;
  name: string;
  url: string;
  blob: Blob;
  size: number; // in bytes
  date: Date;
  duration: number; // in seconds
  transcript?: string;
  isProcessing?: boolean;
  summary?: string;
  keywords?: string[];
  sentiment?: string; // New field for sentiment
  language?: string;  // New field for language
  topic?: string;     // New field for topic
  metadata: RecordingSettings;
}

interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

interface LoadingProgress {
  modelName: string;
  progress: number; // 0-100
  stage: "loading" | "optimizing" | "ready" | "error";
  details?: string;
}

interface MemoryStatus {
  totalUsed: number; // in MB
  available: number; // in MB
}

interface ErrorReport {
  id: string;
  message: string;
  timestamp: Date;
  context: {
    component?: string;
    modelName?: string;
    errorType?: string;
  };
  solution: {
    title: string;
    description: string;
    actions: { label: string; action: () => void; isPrimary?: boolean }[];
  };
}

// =================================================================
// MOCK SERVICES & UTILITIES (خدمات وأدوات وهمية)
// =================================================================

// Mock for feedbackService
const feedbackService = {
  success: (message: string, options?: { actions?: { label: string; action: () => void; style: string }[]; message?: string }) => {
    console.log("SUCCESS:", message, options?.message);
    return `toast-${Date.now()}`;
  },
  error: (message: string) => {
    console.error("ERROR:", message);
    return `toast-${Date.now()}`;
  },
  warning: (message: string) => {
    console.warn("WARNING:", message);
    return `toast-${Date.now()}`;
  },
  info: (message: string) => {
    console.info("INFO:", message);
    return `toast-${Date.now()}`;
  },
  loading: (message: string, progress: number) => {
    console.log("LOADING:", message, progress);
    return `toast-${Date.now()}`;
  },
  dismiss: (id: string) => {
    console.log("DISMISS:", id);
  },
};

// Mock for offlineAI
const offlineAI = {
  addTask: async (task: { type: string; operation: string; input: string; credits: number; estimatedTime: number }) => {
    console.log("Offline AI: Adding task", task);
    return `task-${Date.now()}`;
  },
  getTaskStatus: (taskId: string) => {
    console.log("Offline AI: Getting task status", taskId);
    // Simulate processing
    const status = Math.random() > 0.8 ? "completed" : Math.random() > 0.5 ? "processing" : "error";
    let output = null;
    let error = null;
    if (status === "completed") {
      output = JSON.stringify({
        title: "تحليل AI للمحتوى",
        summary: "ملخص تم إنشاؤه بواسطة الذكاء الاصطناعي.",
        keywords: ["AI", "تحليل", "تسجيل"],
      });
    } else if (status === "error") {
      error = "فشل في المعالجة";
    }
    return { id: taskId, status, output, error };
  },
};

// Mock for audioProcessor
const audioProcessor = {
  extractAudioFromVideo: async (blob: Blob): Promise<Blob> => {
    console.log("Audio Processor: Extracting audio from video blob...");
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate delay
    return new Blob(["mock audio data"], { type: "audio/wav" });
  },
  speechToText: async (audioBlob: Blob, language: string): Promise<string> => {
    console.log(`Audio Processor: Converting speech to text (${language})...`);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate delay
    const mockTranscripts = [
      "هذا تسجيل تجريبي لعملية تحويل الكلام إلى نص باستخدام الذكاء الاصطناعي المحلي.",
      "مرحباً بكم في تطبيق KNOUX REC، حيث يمكنكم تسجيل الشاشة والصوت بسهولة وفعالية.",
      "تتضمن الميزات الجديدة تحليل المشاعر وكشف اللغة ونمذجة المواضيع لتجربة مستخدم محسنة.",
      "تجربة تسجيل الشاشة المذهلة مع أدوات الذكاء الاصطناعي المتكاملة.",
      "استكشف القوالب الجديدة وأدوات التحرير المتقدمة في Visual Patch Lab.",
      "This is a sample English transcript for testing purposes.",
      "مزيج من اللغتين العربية والإنجليزية في هذا النص لاختبار كشف اللغة.",
      "", // Empty transcript for testing short text
    ];
    return mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
  },
};

// Mock for enhancedModelManager
const enhancedModelManager = {
  getMemoryStatus: (): MemoryStatus => {
    const total = 8192; // 8GB
    const used = Math.floor(Math.random() * (total * 0.7)) + (total * 0.2); // 20-90% used
    return {
      totalUsed: used,
      available: total - used,
    };
  },
};

// Mock for enhancedErrorHandler
const enhancedErrorHandler = {
  _listeners: new Map<string, ((report: ErrorReport) => void)[]>(),
  onError: (context: string, callback: (report: ErrorReport) => void) => {
    if (!enhancedErrorHandler._listeners.has(context)) {
      enhancedErrorHandler._listeners.set(context, []);
    }
    enhancedErrorHandler._listeners.get(context)?.push(callback);
  },
  offError: (context: string) => {
    enhancedErrorHandler._listeners.delete(context);
  },
  reportError: (report: Omit<ErrorReport, "id" | "timestamp">) => {
    const fullReport: ErrorReport = {
      id: `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
      ...report,
    };
    enhancedErrorHandler._listeners.get("app")?.forEach((callback) => callback(fullReport));
    console.error("Reported Error:", fullReport);
  },
  resolveError: (id: string, actionIndex: number) => {
    console.log(`Resolved error ${id} with action ${actionIndex}`);
  },
};

// Utility to generate file names
const generateFileName = (pattern: string, extension: string): string => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const time = now.toTimeString().slice(0, 8).replace(/:/g, "-"); // HH-MM-SS
  return pattern
    .replace("[DATE]", date)
    .replace("[TIME]", time)
    .replace(/[^a-zA-Z0-9-]/g, "") + `.${extension}`;
};

// Mock for useRecorder hook
interface RecorderState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  recordingBlob: Blob | null;
  frameRate: number;
}

interface RecorderActions {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  takeScreenshot: () => Promise<{ success: boolean; filename?: string; dataUrl?: string; error?: string }>;
}

const useRecorder = (): { state: RecorderState; actions: RecorderActions } => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [frameRate, setFrameRate] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    console.log("Mock Recorder: Starting recording...");
    setRecordingBlob(null);
    setRecordingTime(0);
    setIsRecording(true);
    setIsPaused(false);
    setFrameRate(60); // Mock FPS
    intervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = async () => {
    console.log("Mock Recorder: Stopping recording...");
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsRecording(false);
    setIsPaused(false);
    // Simulate a recording blob
    const mockBlob = new Blob(["mock video data"], { type: "video/webm" });
    setRecordingBlob(mockBlob);
    setFrameRate(0);
  };

  const pauseRecording = () => {
    console.log("Mock Recorder: Pausing recording...");
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resumeRecording = () => {
    console.log("Mock Recorder: Resuming recording...");
    setIsPaused(false);
    intervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const takeScreenshot = async () => {
    console.log("Mock Recorder: Taking screenshot...");
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async operation
    const mockDataUrl = "https://placehold.co/600x400/FFDE00/000000?text=Screenshot";
    const filename = `screenshot-${Date.now()}.png`;
    return { success: true, filename, dataUrl: mockDataUrl };
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    state: { isRecording, isPaused, recordingTime, recordingBlob, frameRate },
    actions: { startRecording, stopRecording, pauseRecording, resumeRecording, takeScreenshot },
  };
};

// Helper for formatting duration and file size
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};


// =================================================================
// LUXURY ICONS (أيقونات فاخرة) - مكونات أيقونات SVG بسيطة
// =================================================================
const TemplatesIcon: FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-yellow-400 ${className}`}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <path d="M14 2v6h6"></path>
    <path d="M10 9H8"></path>
    <path d="M16 13H8"></path>
    <path d="M16 17H8"></path>
  </svg>
);

const ToolboxIcon: FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-blue-400 ${className}`}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z"></path>
  </svg>
);

const AIToolsIcon: FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-purple-400 ${className}`}>
    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
    <path d="M2 17l10 5 10-5"></path>
    <path d="M2 12l10 5 10-5"></path>
  </svg>
);

const VisualPatchIcon: FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-red-400 ${className}`}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
  </svg>
);

const RecordingsIcon: FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-green-400 ${className}`}>
    <path d="M14.5 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1.5l-3 3v-3z"></path>
    <line x1="10" y1="8" x2="10" y2="12"></line>
    <line x1="14" y1="8" x2="14" y2="12"></line>
    <line x1="8" y1="10" x2="16" y2="10"></line>
  </svg>
);

const FilesIcon: FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-orange-400 ${className}`}>
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
    <polyline points="13 2 13 9 20 9"></polyline>
  </svg>
);

const FloatingParticles: FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {Array.from({ length: 50 }).map((_, i) => (
      <div
        key={i}
        className="absolute bg-white rounded-full opacity-0 animate-float"
        style={{
          width: `${Math.random() * 5 + 2}px`,
          height: `${Math.random() * 5 + 2}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 10}s`,
          animationDuration: `${Math.random() * 20 + 10}s`,
        }}
      ></div>
    ))}
  </div>
);

const LuxuryBackgroundEffects: FC<{ effects: string[]; intensity: number }> = ({ effects, intensity }) => {
  const effectClasses: { [key: string]: string } = {
    starfield: `absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${intensity > 0.5 ? 'opacity-30' : 'opacity-10'}`,
    orbs: `absolute inset-0 transition-opacity duration-1000 ${intensity > 0.5 ? 'opacity-50' : 'opacity-20'}`,
    waves: `absolute inset-0 transition-opacity duration-1000 ${intensity > 0.5 ? 'opacity-40' : 'opacity-15'}`,
  };

  const effectStyles: { [key: string]: React.CSSProperties } = {
    starfield: { backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' },
    orbs: {
      background: `radial-gradient(circle at 20% 80%, rgba(255,100,200,${intensity * 0.5}) 0%, transparent 50%),
                   radial-gradient(circle at 80% 20%, rgba(100,200,255,${intensity * 0.5}) 0%, transparent 50%)`,
    },
    waves: {
      background: `linear-gradient(45deg, rgba(0,255,255,${intensity * 0.2}) 0%, transparent 50%),
                   linear-gradient(-45deg, rgba(255,0,255,${intensity * 0.2}) 0%, transparent 50%)`,
      backgroundSize: '200% 200%',
      animation: 'wave-motion 20s infinite alternate',
    },
  };

  return (
    <>
      {effects.includes("starfield") && <div className={effectClasses.starfield} style={effectStyles.starfield}></div>}
      {effects.includes("orbs") && <div className={effectClasses.orbs} style={effectStyles.orbs}></div>}
      {effects.includes("waves") && <div className={effectClasses.waves} style={effectStyles.waves}></div>}
      <style>{`
        @keyframes wave-motion {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>
    </>
  );
};


// =================================================================
// SUB-COMPONENTS (المكونات الفرعية) - معرفة داخل ملف App.tsx
// =================================================================

// UI Enhancer (تحسينات الواجهة الشاملة)
const UIEnhancer: FC = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@400;600&family=Inter:wght@400;500;700&display=swap');

    body {
      font-family: 'Inter', sans-serif;
      overflow: hidden; /* Prevent body scroll */
    }

    .luxury-arabic {
      direction: rtl;
      text-align: right;
    }

    .luxury-text {
      color: var(--text-color, #E0E0E0);
    }

    .luxury-glass-card {
      background: rgba(29, 29, 31, 0.6);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
      transition: all 0.3s ease-in-out;
    }

    .luxury-glass-card:hover {
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 12px 48px 0 rgba(0, 0, 0, 0.45);
    }

    .interactive-hover:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }

    .hologram-effect {
      position: relative;
      overflow: hidden;
    }
    .hologram-effect::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, transparent 40%, rgba(0,255,255,0.3) 50%, transparent 60%);
      transform: rotate(45deg);
      animation: hologram-scan 4s infinite linear;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .hologram-effect:hover::before {
      opacity: 1;
    }
    @keyframes hologram-scan {
      0% { transform: translate(-50%, -50%) rotate(45deg); opacity: 0.5; }
      50% { transform: translate(0%, 0%) rotate(45deg); opacity: 1; }
      100% { transform: translate(50%, 50%) rotate(45deg); opacity: 0.5; }
    }

    .neon-glow {
      text-shadow: 0 0 5px #00FFFF, 0 0 10px #00FFFF, 0 0 15px #00FFFF;
    }

    .diamond-effect {
      position: relative;
      overflow: hidden;
      border-image: linear-gradient(45deg, #FFD700, #DAA520, #FFD700) 1;
      border-width: 2px;
      border-style: solid;
    }
    .diamond-effect::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
      animation: diamond-shine 3s infinite linear;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .diamond-effect:hover::before {
      opacity: 1;
    }
    @keyframes diamond-shine {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .electric-effect {
      position: relative;
      overflow: hidden;
      border: 2px solid #FF00FF; /* Magenta */
      box-shadow: 0 0 10px #FF00FF, 0 0 20px #FF00FF;
    }
    .electric-effect::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at center, rgba(255,0,255,0.3) 0%, transparent 70%);
      animation: electric-pulse 1.5s infinite alternate;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .electric-effect:hover::before {
      opacity: 1;
    }
    @keyframes electric-pulse {
      0% { transform: scale(0.8); opacity: 0.5; }
      100% { transform: scale(1.2); opacity: 0.8; }
    }

    .cosmic-glow {
      position: relative;
      overflow: hidden;
      border: 2px solid #8A2BE2; /* BlueViolet */
      box-shadow: 0 0 15px #8A2BE2, 0 0 30px #8A2BE2;
    }
    .cosmic-glow::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(138,43,226,0.3) 0%, transparent 70%);
      transform-origin: center center;
      animation: cosmic-swirl 5s infinite linear;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .cosmic-glow:hover::before {
      opacity: 1;
    }
    @keyframes cosmic-swirl {
      0% { transform: rotate(0deg) scale(0.8); opacity: 0.6; }
      50% { transform: rotate(180deg) scale(1.1); opacity: 0.9; }
      100% { transform: rotate(360deg) scale(0.8); opacity: 0.6; }
    }

    .glow-button {
      position: relative;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .glow-button::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 300%;
      height: 300%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      transform: translate(-50%, -50%) scale(0);
      transition: transform 0.5s ease-out, opacity 0.5s ease-out;
      opacity: 0;
    }
    .glow-button:hover::before {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
    .glow-button:active::before {
      transform: translate(-50%, -50%) scale(1.1);
      opacity: 0.8;
      transition: none;
    }

    /* Custom scrollbar for dark themes */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
    .dark ::-webkit-scrollbar-thumb {
      background: #4A4A4A;
    }
    .dark ::-webkit-scrollbar-thumb:hover {
      background: #666;
    }

    /* Keyframe for modal entry */
    @keyframes modal-enter {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .animate-modal-enter {
      animation: modal-enter 0.3s ease-out forwards;
    }

    .bg-grid-pattern {
      background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
      background-size: 20px 20px;
      background-color: #0A0A0B;
    }

  `}</style>
);

// Modal Component (مكون المودال)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  const modalRef = useRef<HTMLDivLement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent scrolling background
    } else {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={modalRef}
        className="relative bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-lg transform transition-all duration-300 scale-95 opacity-0 animate-modal-enter border border-gray-700"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-700 mb-4">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="text-gray-300 mb-6">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="pt-4 border-t border-gray-700 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};


// Luxury Header (الرأسية الفاخرة)
interface LuxuryHeaderProps {
  onSettingsClick: () => void;
  onNotificationsClick: () => void;
  onThemeToggle: () => void;
  currentTheme: Theme;
  notificationCount: number;
  onAdvancedSettingsClick: () => void;
  onAutoAllocationClick: () => void;
  onRealContentClick: () => void;
}

const LuxuryHeader: FC<LuxuryHeaderProps> = ({
  onSettingsClick,
  onNotificationsClick,
  onThemeToggle,
  currentTheme,
  notificationCount,
  onAdvancedSettingsClick,
  onAutoAllocationClick,
  onRealContentClick,
}) => (
  <header className="relative z-20 w-full bg-gradient-to-r from-gray-900/80 to-blue-900/80 backdrop-blur-md shadow-lg py-4 px-6 flex items-center justify-between border-b border-gray-700">
    <div className="flex items-center space-x-4">
      <div className="flex items-center gap-2">
        <svg className="w-10 h-8 flex-shrink-0 text-[#FFDE00]" viewBox="0 0 42 32" fill="currentColor">
          <g clipPath="url(#clip0)">
            <path d="M13.5378 1.64102H30.8355L18.1182 20.4906H0.820496L13.5378 1.64102Z"></path>
            <path d="M14.2953 22.2375L9.36957 29.5385H27.4878L40.2051 10.6889H26.8327L19.0411 22.2375H14.2953Z" fill="white"></path>
          </g>
          <defs>
            <clipPath id="clip0">
              <rect width="41.0256" height="32" fill="white"></rect>
            </clipPath>
          </defs>
        </svg>
        <div className="text-3xl font-orbitron font-bold text-white">
          KNOUX<span className="text-yellow-400">REC</span>
        </div>
      </div>
    </div>

    <div className="flex items-center space-x-4">
      <button
        onClick={onAutoAllocationClick}
        className="glow-button p-2 rounded-full text-white hover:bg-knoux-purple/30 transition-all duration-300"
        title="تنسيق التخصيص التلقائي"
      >
        <span className="text-xl">⚙️</span>
      </button>
      <button
        onClick={onRealContentClick}
        className="glow-button p-2 rounded-full text-white hover:bg-knoux-purple/30 transition-all duration-300"
        title="إدارة المحتوى الحقيقي"
      >
        <span className="text-xl">✨</span>
      </button>
      <button
        onClick={onAdvancedSettingsClick}
        className="glow-button p-2 rounded-full text-white hover:bg-knoux-purple/30 transition-all duration-300"
        title="إعدادات متقدمة"
      >
        <span className="text-xl">🛠️</span>
      </button>
      <button
        onClick={onThemeToggle}
        className="glow-button p-2 rounded-full text-white hover:bg-knoux-purple/30 transition-all duration-300"
        title="تبديل الوضع"
      >
        <span className="text-xl">{currentTheme === "dark" ? "☀️" : "🌙"}</span>
      </button>
      <div className="relative">
        <button
          onClick={onNotificationsClick}
          className="glow-button p-2 rounded-full text-white hover:bg-knoux-purple/30 transition-all duration-300"
          title="الإشعارات"
        >
          <span className="text-xl">🔔</span>
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {notificationCount}
            </span>
          )}
        </button>
      </div>
      <button
        onClick={onSettingsClick}
        className="glow-button p-2 rounded-full text-white hover:bg-knoux-purple/30 transition-all duration-300"
        title="الإعدادات"
      >
        <span className="text-xl">⚙️</span>
      </button>
    </div>
  </header>
);

// Controls (التحكم)
const Controls: FC = () => (
  <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl">
    <h3 className="text-2xl font-bold text-white mb-4">أدوات التحكم الرئيسية</h3>
    <p className="text-gray-300 text-center mb-6">
      ابدأ، أوقف، أو أوقف مؤقتاً تسجيلاتك بسهولة.
    </p>
    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
      <button className="luxury-button bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105">
        <span className="text-xl">▶️</span> بدء التسجيل
      </button>
      <button className="luxury-button bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105">
        <span className="text-xl">⏹️</span> إيقاف التسجيل
      </button>
      <button className="luxury-button bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105">
        <span className="text-xl">⏸️</span> إيقاف مؤقت
      </button>
      <button className="luxury-button bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105">
        <span className="text-xl">▶️</span> استئناف
      </button>
    </div>
  </div>
);

// Features (الميزات)
interface FeaturesProps {
  settings: RecordingSettings;
  onSettingsChange: (settings: RecordingSettings) => void;
  isRecording: boolean;
}

const Features: FC<FeaturesProps> = ({ settings, onSettingsChange, isRecording }) => (
  <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl">
    <h3 className="text-2xl font-bold text-white mb-4">ميزات التسجيل</h3>
    <p className="text-gray-300 text-center mb-6">
      قم بتخصيص إعدادات التسجيل الخاصة بك لتناسب احتياجاتك.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
        <label htmlFor="recordScreen" className="text-white font-medium">تسجيل الشاشة</label>
        <input
          type="checkbox"
          id="recordScreen"
          checked={settings.recordScreen}
          onChange={(e) => onSettingsChange({ ...settings, recordScreen: e.target.checked })}
          disabled={isRecording}
          className="form-checkbox h-5 w-5 text-blue-600 rounded"
        />
      </div>
      <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
        <label htmlFor="recordMic" className="text-white font-medium">تسجيل الميكروفون</label>
        <input
          type="checkbox"
          id="recordMic"
          checked={settings.recordMic}
          onChange={(e) => onSettingsChange({ ...settings, recordMic: e.target.checked })}
          disabled={isRecording}
          className="form-checkbox h-5 w-5 text-blue-600 rounded"
        />
      </div>
      <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
        <label htmlFor="recordSystemAudio" className="text-white font-medium">تسجيل صوت النظام</label>
        <input
          type="checkbox"
          id="recordSystemAudio"
          checked={settings.recordSystemAudio}
          onChange={(e) => onSettingsChange({ ...settings, recordSystemAudio: e.target.checked })}
          disabled={isRecording}
          className="form-checkbox h-5 w-5 text-blue-600 rounded"
        />
      </div>
      <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
        <label htmlFor="recordCamera" className="text-white font-medium">تسجيل الكاميرا (PIP)</label>
        <input
          type="checkbox"
          id="recordCamera"
          checked={settings.recordCamera}
          onChange={(e) => onSettingsChange({ ...settings, recordCamera: e.target.checked })}
          disabled={isRecording}
          className="form-checkbox h-5 w-5 text-blue-600 rounded"
        />
      </div>
      <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg col-span-full">
        <label htmlFor="videoQuality" className="text-white font-medium">جودة الفيديو</label>
        <select
          id="videoQuality"
          value={settings.videoQuality}
          onChange={(e) => onSettingsChange({ ...settings, videoQuality: e.target.value as RecordingSettings['videoQuality'] })}
          disabled={isRecording}
          className="bg-gray-800 text-white rounded-md p-2"
        >
          <option value="720p">720p</option>
          <option value="1080p">1080p</option>
          <option value="1440p">1440p</option>
          <option value="4k">4K</option>
        </select>
      </div>
    </div>
  </div>
);

// Actions (الإجراءات)
interface ActionsProps {
  recordingState: "IDLE" | "RECORDING" | "PAUSED";
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onScreenshot: () => void;
  disabled: boolean;
  timer: string;
  fps: number;
  scheduleStatus: string;
  hotkeys: {
    startStop: string;
    pauseResume: string;
    screenshot: string;
  };
}

const Actions: FC<ActionsProps> = ({
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
  const getStatusText = () => {
    switch (recordingState) {
      case "IDLE":
        return "جاهز للتسجيل";
      case "RECORDING":
        return "جاري التسجيل...";
      case "PAUSED":
        return "متوقف مؤقتاً";
      default:
        return "";
    }
  };

  const getStatusColor = () => {
    switch (recordingState) {
      case "IDLE":
        return "text-gray-400";
      case "RECORDING":
        return "text-red-500 animate-pulse";
      case "PAUSED":
        return "text-yellow-500";
      default:
        return "text-white";
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl">
      <h3 className="text-2xl font-bold text-white mb-4">حالة التسجيل والإجراءات</h3>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${getStatusColor().includes('red') ? 'bg-red-500' : getStatusColor().includes('yellow') ? 'bg-yellow-500' : 'bg-gray-500'}`}></span>
          <span className={`text-lg font-semibold ${getStatusColor()}`}>{getStatusText()}</span>
        </div>
        <div className="text-xl font-bold text-white">المدة: {timer}</div>
      </div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-gray-300">معدل الإطارات: {fps} FPS</span>
        <span className="text-gray-300">الجدولة: {scheduleStatus === "idle" ? "غير مفعل" : "مفعل"}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={recordingState === "RECORDING" ? onStop : onStart}
          disabled={disabled}
          className={`luxury-button py-3 px-6 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 ${
            recordingState === "RECORDING"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {recordingState === "RECORDING" ? "إيقاف التسجيل" : "بدء التسجيل"}
        </button>
        <button
          onClick={recordingState === "PAUSED" ? onResume : onPause}
          disabled={disabled || recordingState === "IDLE"}
          className={`luxury-button py-3 px-6 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 ${
            recordingState === "IDLE"
              ? "bg-gray-600 cursor-not-allowed"
              : recordingState === "PAUSED"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-yellow-600 hover:bg-yellow-700"
          }`}
        >
          {recordingState === "PAUSED" ? "استئناف" : "إيقاف مؤقت"}
        </button>
        <button
          onClick={onScreenshot}
          disabled={disabled}
          className="luxury-button bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 col-span-full"
        >
          التقاط لقطة شاشة 📸
        </button>
      </div>

      <div className="mt-6 text-center text-gray-400 text-sm">
        <p>الاختصارات:</p>
        <p>بدء/إيقاف: <span className="font-mono text-white">{hotkeys.startStop}</span></p>
        <p>إيقاف مؤقت/استئناف: <span className="font-mono text-white">{hotkeys.pauseResume}</span></p>
        <p>لقطة شاشة: <span className="font-mono text-white">{hotkeys.screenshot}</span></p>
      </div>
    </div>
  );
};

// Video Preview (معاينة الفيديو)
interface VideoPreviewProps {
  previewSource: string | null;
  isRecording: boolean;
  countdown: number;
  pipCameraStream: MediaStream | null;
  settings: RecordingSettings;
}

const VideoPreview: FC<VideoPreviewProps> = ({
  previewSource,
  isRecording,
  countdown,
  pipCameraStream,
  settings,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && previewSource) {
      videoRef.current.src = previewSource;
      videoRef.current.play().catch(e => console.error("Error playing video:", e));
    }
  }, [previewSource]);

  useEffect(() => {
    if (pipVideoRef.current && pipCameraStream) {
      pipVideoRef.current.srcObject = pipCameraStream;
      pipVideoRef.current.play().catch(e => console.error("Error playing PIP video:", e));
    }
  }, [pipCameraStream]);

  const pipPositionClasses = {
    topLeft: "top-4 left-4",
    topRight: "top-4 right-4",
    bottomLeft: "bottom-4 left-4",
    bottomRight: "bottom-4 right-4",
  };

  const pipSizeClasses = {
    small: "w-24 h-16",
    medium: "w-36 h-24",
    large: "w-48 h-32",
  };

  return (
    <div className="relative w-full h-80 bg-gray-900 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center border border-gray-700">
      {previewSource ? (
        <video
          ref={videoRef}
          src={previewSource}
          controls
          autoPlay
          loop
          muted={!isRecording} // Mute preview if not actively recording
          className="w-full h-full object-contain"
        ></video>
      ) : (
        <div className="text-gray-400 text-lg">
          {isRecording ? "جاري التقاط الشاشة..." : "لا توجد معاينة متاحة"}
        </div>
      )}

      {isRecording && countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white text-6xl font-bold">
          {countdown}
        </div>
      )}

      {settings.recordCamera && pipCameraStream && (
        <div className={`absolute ${pipPositionClasses[settings.cameraPipPosition]} ${pipSizeClasses[settings.cameraPipSize]} bg-black rounded-lg overflow-hidden border-2 border-blue-500 shadow-lg`}>
          <video ref={pipVideoRef} autoPlay muted className="w-full h-full object-cover"></video>
        </div>
      )}

      {isRecording && (
        <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          LIVE
        </div>
      )}
    </div>
  );
};

// Recordings Gallery (معرض التسجيلات)
interface RecordingsGalleryProps {
  recordings: Recording[];
  onDelete: (id: string) => void;
  onUpdateRecording: (recording: Recording) => void;
  onSelectForPreview: (rec: Recording) => void;
}

const RecordingsGallery: FC<RecordingsGalleryProps> = ({
  recordings,
  onDelete,
  onUpdateRecording,
  onSelectForPreview,
}) => {
  return (
    <div className="luxury-glass-card p-6">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">معرض التسجيلات 🎬</h2>
      {recordings.length === 0 ? (
        <p className="text-gray-400 text-center py-10">
          لا توجد تسجيلات حتى الآن. ابدأ بتسجيل جديد!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recordings.map((rec) => (
            <div key={rec.id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700 hover:border-blue-500 transition-all duration-300">
              <div className="relative h-40 bg-gray-900 flex items-center justify-center">
                <video src={rec.url} controls={false} className="w-full h-full object-cover" />
                <button
                  onClick={() => onSelectForPreview(rec)}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-4xl opacity-0 hover:opacity-100 transition-opacity"
                  title="معاينة"
                >
                  ▶️
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white truncate mb-1">{rec.name}</h3>
                <p className="text-sm text-gray-400">
                  {rec.date.toLocaleDateString()} | {formatDuration(rec.duration)} | {formatFileSize(rec.size)}
                </p>
                {rec.summary && (
                  <p className="text-xs text-gray-500 mt-2">
                    الملخص: {rec.summary}
                  </p>
                )}
                {rec.keywords && rec.keywords.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    كلمات مفتاحية: {rec.keywords.join(", ")}
                  </p>
                )}
                {rec.sentiment && (
                  <p className="text-xs text-gray-500 mt-1">
                    المشاعر: {rec.sentiment}
                  </p>
                )}
                {rec.language && (
                  <p className="text-xs text-gray-500 mt-1">
                    اللغة: {rec.language}
                  </p>
                )}
                {rec.topic && (
                  <p className="text-xs text-gray-500 mt-1">
                    الموضوع: {rec.topic}
                  </p>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => onDelete(rec.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                  >
                    حذف
                  </button>
                  {/* Add more actions like edit, share, etc. */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Settings Modal (نافذة الإعدادات المنبثقة)
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: RecordingSettings;
  onSave: (settings: RecordingSettings) => void;
}

const SettingsModal: FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [tempSettings, setTempSettings] = useState(settings);

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, type, checked, value } = e.target;
    setTempSettings((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleHotkeyChange = (key: keyof RecordingSettings['hotkeys'], value: string) => {
    setTempSettings((prev) => ({
      ...prev,
      hotkeys: {
        ...prev.hotkeys,
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    onSave(tempSettings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إعدادات التسجيل">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="recordScreen" className="text-white">تسجيل الشاشة:</label>
          <input type="checkbox" id="recordScreen" checked={tempSettings.recordScreen} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600 rounded" />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="recordMic" className="text-white">تسجيل الميكروفون:</label>
          <input type="checkbox" id="recordMic" checked={tempSettings.recordMic} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600 rounded" />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="recordSystemAudio" className="text-white">تسجيل صوت النظام:</label>
          <input type="checkbox" id="recordSystemAudio" checked={tempSettings.recordSystemAudio} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600 rounded" />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="recordCamera" className="text-white">تسجيل الكاميرا (PIP):</label>
          <input type="checkbox" id="recordCamera" checked={tempSettings.recordCamera} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600 rounded" />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="videoQuality" className="text-white">جودة الفيديو:</label>
          <select id="videoQuality" value={tempSettings.videoQuality} onChange={handleChange} className="bg-gray-700 text-white p-2 rounded">
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
            <option value="1440p">1440p</option>
            <option value="4k">4K</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="fps" className="text-white">معدل الإطارات (FPS):</label>
          <select id="fps" value={tempSettings.fps} onChange={handleChange} className="bg-gray-700 text-white p-2 rounded">
            <option value="30">30</option>
            <option value="60">60</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="aiProcessingEnabled" className="text-white">تمكين معالجة الذكاء الاصطناعي:</label>
          <input type="checkbox" id="aiProcessingEnabled" checked={tempSettings.aiProcessingEnabled} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600 rounded" />
        </div>
        <div className="flex flex-col">
          <label className="text-white mb-2">الاختصارات (Hotkeys):</label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">بدء/إيقاف:</span>
              <input type="text" value={tempSettings.hotkeys.startStop} onChange={(e) => handleHotkeyChange('startStop', e.target.value)} className="bg-gray-700 text-white p-2 rounded w-40" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">إيقاف مؤقت/استئناف:</span>
              <input type="text" value={tempSettings.hotkeys.pauseResume} onChange={(e) => handleHotkeyChange('pauseResume', e.target.value)} className="bg-gray-700 text-white p-2 rounded w-40" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">لقطة شاشة:</span>
              <input type="text" value={tempSettings.hotkeys.screenshot} onChange={(e) => handleHotkeyChange('screenshot', e.target.value)} className="bg-gray-700 text-white p-2 rounded w-40" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          إلغاء
        </button>
        <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          حفظ الإعدادات
        </button>
      </div>
    </Modal>
  );
};

// Notifications Dropdown (قائمة الإشعارات المنسدلة)
interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onClearNotification: (id: string) => void;
  onClearAll: () => void;
}

const NotificationsDropdown: FC<NotificationsDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearNotification,
  onClearAll,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-4 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 p-4 animate-modal-enter"
    >
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white">الإشعارات ({notifications.length})</h3>
        {notifications.length > 0 && (
          <button onClick={onClearAll} className="text-blue-400 hover:text-blue-300 text-sm">
            مسح الكل
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <p className="text-gray-400 text-center py-4">لا توجد إشعارات جديدة.</p>
      ) : (
        <ul className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
          {notifications.map((notif) => (
            <li
              key={notif.id}
              className={`p-3 rounded-md flex items-center justify-between ${
                notif.type === "success" ? "bg-green-900/30 border border-green-700" :
                notif.type === "error" ? "bg-red-900/30 border border-red-700" :
                notif.type === "warning" ? "bg-yellow-900/30 border border-yellow-700" :
                "bg-blue-900/30 border border-blue-700"
              }`}
            >
              <span className="text-sm text-white flex-grow">{notif.message}</span>
              <button onClick={() => onClearNotification(notif.id)} className="text-gray-400 hover:text-white ml-2">
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Trim Modal (نافذة القص المنبثقة)
interface TrimModalProps {
  recording: Recording;
  onClose: () => void;
  onTrimComplete: (trimmedBlob: Blob) => void;
}

const TrimModal: FC<TrimModalProps> = ({ recording, onClose, onTrimComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(recording.duration);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
    setTrimEnd(recording.duration);
  }, [recording]);

  const handleTrim = () => {
    // Simulate trimming by creating a new blob.
    // In a real app, this would involve complex video processing.
    const trimmedBlob = new Blob([`trimmed-${recording.blob.size}-${trimStart}-${trimEnd}`], { type: recording.blob.type });
    onTrimComplete(trimmedBlob);
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`قص التسجيل: ${recording.name}`}>
      <div className="space-y-4">
        <video ref={videoRef} src={recording.url} controls className="w-full rounded-md" />
        <div className="flex items-center justify-between text-white">
          <span>بداية القص: {formatDuration(trimStart)}</span>
          <span>نهاية القص: {formatDuration(trimEnd)}</span>
        </div>
        <input
          type="range"
          min="0"
          max={recording.duration}
          value={trimStart}
          onChange={(e) => setTrimStart(parseFloat(e.target.value))}
          className="w-full accent-blue-500"
        />
        <input
          type="range"
          min="0"
          max={recording.duration}
          value={trimEnd}
          onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
          className="w-full accent-blue-500"
        />
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          إلغاء
        </button>
        <button onClick={handleTrim} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          قص وحفظ
        </button>
      </div>
    </Modal>
  );
};

// AI Panel (لوحة الذكاء الاصطناعي)
interface AIPanelProps {
  recordings: Recording[];
  onUpdateRecording: (recording: Recording) => void;
}

const AIPanel: FC<AIPanelProps> = ({ recordings, onUpdateRecording }) => {
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedMainTool, setSelectedMainTool] = useState<string>("text-analysis");
  const [analysisResults, setAnalysisResults] = useState<Record<string, any>>({});

  // --- Local AI Functions ---
  const analyzeText = async (text: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const charCount = text.length;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim());
    const avgWordsPerSentence = sentences.length > 0 ? Math.round(wordCount / sentences.length) : 0;
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const wordFreq: Record<string, number> = {};
    words.forEach((word) => { if (word.length > 2) { wordFreq[word] = (wordFreq[word] || 0) + 1; } });
    const topWords = Object.entries(wordFreq).sort(([, a], [, b]) => b - a).slice(0, 10).map(([word, count]) => ({ word, count }));
    const readingTime = Math.ceil(wordCount / 200);
    return { wordCount, charCount, sentenceCount: sentences.length, avgWordsPerSentence, topWords, readingTime, analysisDate: new Date().toLocaleString("ar-SA") };
  };

  const extractKeywords = async (text: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const stopWords = ["في", "من", "إلى", "على", "عن", "مع", "كان", "كانت", "هذا", "هذه", "ذلك", "التي", "الذي", "و", "أو", "ثم", "إذا", "ما", "قد", "كل", "بعض", "لا", "لن", "لم", "غير", "إن", "أن", "هو", "هي", "هم", "هن", "أنا", "أنت", "نحن", "ليس", "هناك", "كذلك", "حتى", "أيضا", "فقط"];
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const cleanWords = words.filter((word) => word.length > 2 && !stopWords.includes(word));
    const wordFreq: Record<string, number> = {};
    cleanWords.forEach((word) => { wordFreq[word] = (wordFreq[word] || 0) + 1; });
    const keywords = Object.entries(wordFreq).map(([word, freq]) => ({ word, frequency: freq })).sort((a, b) => b.frequency - a.frequency).slice(0, 15);
    return keywords;
  };

  const generateSummary = async (text: string) => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim());
    if (sentences.length <= 3) { return "النص قصير جداً لإنشاء ملخص مفيد."; }
    const sentenceScores = sentences.map((sentence, index) => {
      const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
      const wordCount = words.length;
      let positionScore = 0;
      if (index < sentences.length * 0.2) positionScore += 3;
      if (index > sentences.length * 0.8) positionScore += 2;
      const longWordsScore = words.filter((w) => w.length > 5).length * 0.5;
      return { sentence: sentence.trim(), score: wordCount + positionScore + longWordsScore, index };
    });
    const summaryLength = Math.max(2, Math.ceil(sentences.length * 0.25));
    const topSentences = sentenceScores.sort((a, b) => b.score - a.score).slice(0, summaryLength).sort((a, b) => a.index - b.index).map((item) => item.sentence);
    let summary = topSentences.join(". ");
    if (!summary.endsWith(".")) { summary += "."; }
    return summary;
  };

  const analyzeSentiment = async (text: string) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const positiveWords = ["جيد", "رائع", "ممتاز", "مفيد", "سعيد", "نجح", "أحب", "إيجابي", "مميز", "مقبول", "جميل", "ناجح", "مدهش", "مبارك", "نشيط", "مرح", "طموح", "قوي", "ثقة", "كريم", "لطيف", "متفائل"];
    const negativeWords = ["سيء", "فظيع", "خطأ", "فشل", "حزين", "أكره", "مشكلة", "صعب", "سلبي", "مخيب", "محبط", "ضعيف", "خوف", "حرج", "غضب", "حقد", "مرير", "ممل", "متعب", "ضار", "مكروه", "تشاؤم"];
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    let positiveScore = 0;
    let negativeScore = 0;
    words.forEach((word) => { if (positiveWords.includes(word)) positiveScore++; if (negativeWords.includes(word)) negativeScore++; });
    const totalEmotionalWords = positiveScore + negativeScore;
    let sentiment = "محايد";
    let confidence = 0;
    if (totalEmotionalWords > 0) {
      confidence = (Math.abs(positiveScore - negativeScore) / totalEmotionalWords) * 100;
      if (positiveScore > negativeScore) { sentiment = "إيجابي"; } else if (negativeScore > positiveScore) { sentiment = "سلبي"; }
    } else if (words.length > 0) { confidence = 10; }
    return { sentiment, confidence: Math.round(confidence), positiveScore, negativeScore, emotionalWordsCount: totalEmotionalWords };
  };

  const detectLanguage = async (text: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
    const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
    const totalChars = arabicChars + englishChars;
    let language = "غير محدد";
    let confidence = 0;
    if (totalChars > 0) {
      const arabicRatio = arabicChars / totalChars;
      const englishRatio = englishChars / totalChars;
      if (arabicRatio > 0.7) { language = "العربية"; confidence = Math.round(arabicRatio * 100); }
      else if (englishRatio > 0.7) { language = "الإنجليزية"; confidence = Math.round(englishRatio * 100); }
      else if (arabicRatio > 0.2 || englishRatio > 0.2) { language = "مختلط (عربي/إنجليزي)"; confidence = 60; }
      else { language = "لغات أخرى/غير واضحة"; confidence = 30; }
    }
    return { language, confidence, arabicChars, englishChars, totalChars };
  };

  const modelTopics = async (text: string) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const topicCategories = {
      "التقنية والابتكار": ["برمجة", "تطوير", "تقنية", "حاسوب", "برنامج", "موقع", "تطبيق", "ذكاء اصطناعي", "شبكة", "بيانات", "ابتكار", "رقمي", "خوارزمية"],
      "التعليم والمعرفة": ["تعلم", "درس", "دراسة", "طالب", "معلم", "مدرسة", "جامعة", "كتاب", "معرفة", "بحث", "منهج", "شهادة", "امتحان", "محاضرة"],
      "الأعمال والاقتصاد": ["شركة", "عمل", "مال", "ربح", "مشروع", "استثمار", "سوق", "اقتصاد", "تجارة", "موظف", "مبيعات", "تسويق", "تمويل", "صفقة"],
      "الصحة والطب": ["صحة", "طب", "علاج", "دواء", "مريض", "طبيب", "مستشفى", "وقاية", "لياقة", "تغذية", "نفسي", "جسدي", "مرض", "جراحة"],
      "الرياضة والترفيه": ["رياضة", "لعب", "فريق", "مباراة", "تمرين", "لاعب", "نادي", "ترفيه", "فيلم", "موسيقى", "فنون", "سفر", "سينما", "هواية"],
      "المجتمع والأخبار": ["مجتمع", "أخبار", "سياسة", "حكومة", "قانون", "مواطن", "حدث", "تاريخ", "ثقافة", "عائلة", "صداقة", "إنسانية", "سلام", "حروب"],
    };
    const textLower = text.toLowerCase();
    const topicScores: Record<string, number> = {};
    Object.entries(topicCategories).forEach(([topic, keywords]) => {
      let score = 0;
      keywords.forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, "gi");
        const matches = textLower.match(regex) || [];
        score += matches.length;
      });
      topicScores[topic] = score;
    });
    const sortedTopics = Object.entries(topicScores).sort(([, a], [, b]) => b - a);
    let dominantTopic = "غير مصنف";
    let dominantConfidence = 0;
    if (sortedTopics.length > 0 && sortedTopics[0][1] > 0) {
        dominantTopic = sortedTopics[0][0];
        const totalScores = Object.values(topicScores).reduce((sum, score) => sum + score, 0);
        dominantConfidence = totalScores > 0 ? Math.round((sortedTopics[0][1] / totalScores) * 100) : 0;
    }
    return { dominantTopic, confidence: dominantConfidence, allTopics: topicScores };
  };

  const textAnalysisTools = [
    { id: "text-analysis", name: "تحليل النصوص", nameEn: "Text Analysis", icon: "📊", description: "تحليل وفهم النصوص المستخرجة من التسجيلات (الكلمات، الجمل، وقت القراءة).", color: "purple-500", status: "active", functionality: analyzeText, resultKey: "textAnalysis" },
    { id: "keyword-extraction", name: "استخراج الكلمات المفتاحية", nameEn: "Keyword Extraction", icon: "🔑", description: "استخراج أهم الكلمات والمفاهيم من النص، مما يساعد على فهم المحتوى بسرعة.", color: "blue-500", status: "active", functionality: extractKeywords, resultKey: "keywords" },
    { id: "summary-generation", name: "توليد الملخصات", nameEn: "Summary Generation", icon: "�", description: "إنشاء ملخصات تلقائية للمحتوى الطويل لتوفير الوقت والجهد.", color: "green-500", status: "active", functionality: generateSummary, resultKey: "summary" },
    { id: "sentiment-analysis", name: "تحليل المشاعر", nameEn: "Sentiment Analysis", icon: "😊", description: "تحديد الطابع العاطفي للمحتوى (إيجابي، سلبي، محايد) لفهم نبرة الحديث.", color: "pink-500", status: "active", functionality: analyzeSentiment, resultKey: "sentiment" },
    { id: "language-detection", name: "كشف اللغة", nameEn: "Language Detection", icon: "🌍", description: "تحديد لغة المحتوى تلقائياً (عربي، إنجليزي، أو مختلط) لتصنيف التسجيلات.", color: "orange-500", status: "active", functionality: detectLanguage, resultKey: "language" },
    { id: "topic-modeling", name: "نمذجة المواضيع", nameEn: "Topic Modeling", icon: "💡", description: "تحديد المواضيع الرئيسية في المحتوى لتنظيم التسجيلات وتسهيل البحث.", color: "indigo-500", status: "active", functionality: modelTopics, resultKey: "topics" },
  ];

  // Placeholder Components
  const PerformancePanel: FC = () => (<div className="glass-card p-6 text-white/70 text-center rounded-xl min-h-[300px] flex flex-col items-center justify-center"><div className="text-4xl mb-4">⚡</div><div><h3 className="font-bold text-lg text-white mb-2">أداء المعالجة المحلية</h3><p>هنا يمكنك رؤية إحصائيات حول سرعة وكفاءة المعالجة على جهازك.</p><p className="text-sm text-white/50 mt-2">جاري العمل على لوحة الأداء...</p></div></div>);
  const AIModelsManager: FC = () => (<div className="glass-card p-6 text-white/70 text-center rounded-xl min-h-[300px] flex flex-col items-center justify-center"><div className="text-4xl mb-4">🧠</div><div><h3 className="font-bold text-lg text-white mb-2">إدارة نماذج الذكاء الاصطناعي</h3><p>تحكم في النماذج المحملة، تحديثها، أو إضافة نماذج جديدة لتحليل أعمق.</p><p className="text-sm text-white/50 mt-2">جاري العمل على إدارة النماذج...</p></div></div>);
  const SystemStats: FC = () => (<div className="glass-card p-6 text-white/70 text-center rounded-xl min-h-[300px] flex flex-col items-center justify-center"><div className="text-4xl mb-4">💻</div><div><h3 className="font-bold text-lg text-white mb-2">إحصائيات النظام</h3><p>مراقبة استهلاك الموارد (المعالج، الذاكرة) أثناء تشغيل تحليلات الذكاء الاصطناعي.</p><p className="text-sm text-white/50 mt-2">جاري العمل على إحصائيات النظام...</p></div></div>);
  const AdvancedFeatures: FC = () => (<div className="glass-card p-6 text-white/70 text-center rounded-xl min-h-[300px] flex flex-col items-center justify-center"><div className="text-4xl mb-4">✨</div><div><h3 className="font-bold text-lg text-white mb-2">ميزات متقدمة</h3><p>استكشف الخيارات المتقدمة لضبط خوارزميات الذكاء الاصطناعي.</p><p className="text-sm text-white/50 mt-2">جاري العمل على الميزات المتقدمة...</p></div></div>);
  const BatchProcessor: FC = () => (<div className="glass-card p-6 text-white/70 text-center rounded-xl min-h-[300px] flex flex-col items-center justify-center"><div className="text-4xl mb-4">📦</div><div><h3 className="font-bold text-lg text-white mb-2">المعالجة الدفعية</h3><p>قم بمعالجة عدة تسجيلات في وقت واحد لتحسين الكفاءة.</p><p className="text-sm text-white/50 mt-2">جاري العمل على المعالجة الدفعية...</p></div></div>);
  const AnalyticsDashboard: FC = () => (<div className="glass-card p-6 text-white/70 text-center rounded-xl min-h-[300px] flex flex-col items-center justify-center"><div className="text-4xl mb-4">📈</div><div><h3 className="font-bold text-lg text-white mb-2">لوحة تحكم التحليلات</h3><p>عرض رسوم بيانية وتصورات لنتائج تحليل التسجيلات عبر الوقت.</p><p className="text-sm text-white/50 mt-2">جاري العمل على لوحة تحكم التحليلات...</p></div></div>);
  const PrivacySettings: FC = () => (<div className="glass-card p-6 text-white/70 text-center rounded-xl min-h-[300px] flex flex-col items-center justify-center"><div className="text-4xl mb-4">🔐</div><div><h3 className="font-bold text-lg text-white mb-2">إعدادات الخصوصية</h3><p>تأكد من بقاء بياناتك آمنة على جهازك الخاص.</p><p className="text-sm text-white/50 mt-2">جاري العمل على إعدادات الخصوصية...</p></div></div>);

  const mainTools = [
    { id: "text-analysis", name: "تحليل النصوص", icon: "📝", component: null },
    { id: "performance", name: "الأداء", icon: "🚀", component: <PerformancePanel /> },
    { id: "models", name: "النماذج", icon: "🧠", component: <AIModelsManager /> },
    { id: "system-stats", name: "إحصائيات النظام", icon: "💻", component: <SystemStats /> },
    { id: "advanced", name: "ميزات متقدمة", icon: "✨", component: <AdvancedFeatures /> },
    { id: "batch-processing", name: "معالجة دفعية", icon: "📦", component: <BatchProcessor /> },
    { id: "analytics", name: "لوحة التحليلات", icon: "📈", component: <AnalyticsDashboard /> },
    { id: "privacy", name: "الخصوصية", icon: "🔐", component: <PrivacySettings /> },
  ];

  const handleProcessRecording = async (recording: Recording, toolId: string) => {
    const tool = textAnalysisTools.find((t) => t.id === toolId);
    if (!recording.transcript || !tool) return;

    setProcessing(`${recording.id}-${tool.id}`);

    try {
      const result = await tool.functionality(recording.transcript);
      setAnalysisResults((prev) => ({
        ...prev,
        [recording.id]: {
          ...prev[recording.id],
          [tool.resultKey]: result,
        },
      }));

      let updatedRecording = { ...recording };
      if (tool.id === "summary-generation" && typeof result === 'string') {
        updatedRecording.summary = result.length > 250 ? `${result.substring(0, 250)}...` : result;
      } else if (tool.id === "keyword-extraction" && Array.isArray(result)) {
        updatedRecording.keywords = result.slice(0, 8).map((item: any) => item.word);
      } else if (tool.id === "sentiment-analysis" && result.sentiment) {
        updatedRecording.sentiment = result.sentiment;
      } else if (tool.id === "language-detection" && result.language) {
        updatedRecording.language = result.language;
      } else if (tool.id === "topic-modeling" && result.dominantTopic) {
        updatedRecording.topic = result.dominantTopic;
      }
      onUpdateRecording(updatedRecording);
    } catch (error) {
      console.error(`خطأ في ${tool.name}:`, error);
      alert(`حدث خطأ أثناء معالجة ${tool.name}. يرجى التحقق من وحدة التحكم (Console).`);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 min-h-screen text-white font-inter rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-white">
        🧠 أدوات الذكاء الاصطناعي
      </h2>

      {/* Main Navigation Tabs */}
      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        {mainTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setSelectedMainTool(tool.id)}
            className={`
              px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300
              flex items-center gap-2
              ${
                selectedMainTool === tool.id
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
              }
            `}
          >
            <span className="text-2xl">{tool.icon}</span>
            {tool.name}
          </button>
        ))}
      </div>

      {/* Conditional Rendering of Panels */}
      {selectedMainTool !== "text-analysis" && (
        <div className="mt-8">
          {mainTools.find(tool => tool.id === selectedMainTool)?.component}
        </div>
      )}

      {selectedMainTool === "text-analysis" && (
        <>
          {/* Text Analysis Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {textAnalysisTools.map((tool) => (
              <div
                key={tool.id}
                className={`
                  luxury-glass-card p-5 rounded-xl border-2 transition-all duration-300
                  ${
                    tool.status === "active"
                      ? `border-${tool.color}/50 hover:border-${tool.color} cursor-pointer`
                      : "border-gray-600 opacity-50 cursor-not-allowed"
                  }
                `}
              >
                <div className="flex items-center mb-3">
                  <span className={`text-4xl mr-3 text-${tool.color}`}>
                    {tool.icon}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-gray-400">{tool.nameEn}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  {tool.description}
                </p>
                <div className="text-xs text-gray-500">
                  الحالة:{" "}
                  <span
                    className={`font-semibold ${
                      tool.status === "active" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {tool.status === "active" ? "نشط" : "غير نشط"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Recordings List for Text Analysis */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-inner">
            <h3 className="text-2xl font-bold text-white mb-6">
              تسجيلاتك لتحليل الذكاء الاصطناعي
            </h3>
            {recordings.length === 0 ? (
              <p className="text-gray-400 text-center py-10">
                لا توجد تسجيلات متاحة للتحليل. ابدأ بتسجيل جديد!
              </p>
            ) : (
              <div className="space-y-4">
                {recordings.map((recording) => (
                  <div
                    key={recording.id}
                    className="bg-gray-700 p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between shadow-md"
                  >
                    <div className="flex-grow mb-3 md:mb-0">
                      <h4 className="text-lg font-semibold text-white">
                        {recording.name}
                      </h4>
                      <p className="text-sm text-gray-300 mt-1">
                        المدة: {recording.duration.toFixed(1)} ثانية | الحجم:{" "}
                        {(recording.size / (1024 * 1024)).toFixed(2)} ميجابايت
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        النص المستخرج:{" "}
                        {recording.transcript
                          ? recording.transcript.substring(0, 100) + "..."
                          : "لا يوجد نص مستخرج"}
                      </p>
                      {/* Display Analysis Results if available */}
                      {analysisResults[recording.id] && (
                        <div className="mt-3 text-sm text-gray-200 bg-gray-600 p-3 rounded-md">
                          {analysisResults[recording.id].textAnalysis && (
                            <p>
                              <strong>تحليل النص:</strong> كلمات: {analysisResults[recording.id].textAnalysis.wordCount},{" "}
                              جمل: {analysisResults[recording.id].textAnalysis.sentenceCount},{" "}
                              وقت القراءة: {analysisResults[recording.id].textAnalysis.readingTime} دقيقة
                            </p>
                          )}
                          {analysisResults[recording.id].keywords && (
                            <p>
                              <strong>كلمات مفتاحية:</strong>{" "}
                              {analysisResults[recording.id].keywords.map((k: any) => k.word).join(", ")}
                            </p>
                          )}
                          {analysisResults[recording.id].summary && (
                            <p>
                              <strong>ملخص:</strong> {analysisResults[recording.id].summary}
                            </p>
                          )}
                          {analysisResults[recording.id].sentiment && (
                            <p>
                              <strong>المشاعر:</strong> {analysisResults[recording.id].sentiment.sentiment}{" "}
                              (ثقة: {analysisResults[recording.id].sentiment.confidence}%)
                            </p>
                          )}
                          {analysisResults[recording.id].language && (
                            <p>
                              <strong>اللغة:</strong> {analysisResults[recording.id].language.language}{" "}
                              (ثقة: {analysisResults[recording.id].language.confidence}%)
                            </p>
                          )}
                          {analysisResults[recording.id].topics && (
                            <p>
                              <strong>الموضوع الرئيسي:</strong> {analysisResults[recording.id].topics.dominantTopic}{" "}
                              (ثقة: {analysisResults[recording.id].topics.confidence}%)
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 md:flex-col md:ml-4">
                      {textAnalysisTools.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => handleProcessRecording(recording, tool.id)}
                          disabled={!recording.transcript || processing === `${recording.id}-${tool.id}`}
                          className={`
                            px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200
                            ${
                              !recording.transcript
                                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                : processing === `${recording.id}-${tool.id}`
                                  ? `bg-${tool.color}/30 text-${tool.color} animate-pulse`
                                  : `bg-${tool.color} hover:bg-${tool.color}/80 text-white`
                            }
                          `}
                        >
                          {processing === `${recording.id}-${tool.id}` ? "جاري..." : `تحليل ${tool.name}`}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// File Manager (مدير الملفات)
interface FileManagerProps {
  recordings: Recording[];
  onDeleteRecording: (id: string) => void;
}

const FileManager: FC<FileManagerProps> = ({ recordings, onDeleteRecording }) => {
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<keyof Recording>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const filteredAndSortedRecordings = [...recordings]
    .filter(rec => rec.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      let valA: any = a[sortKey];
      let valB: any = b[sortKey];

      if (sortKey === "date") {
        valA = a.date.getTime();
        valB = b.date.getTime();
      } else if (sortKey === "size") {
        valA = a.size;
        valB = b.size;
      } else if (sortKey === "duration") {
        valA = a.duration;
        valB = b.duration;
      } else if (typeof valA === 'string') {
        return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="luxury-glass-card p-6">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">إدارة الملفات 📁</h2>
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="بحث بالاسم..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-grow bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as keyof Recording)}
          className="bg-gray-700 text-white p-3 rounded-lg border border-gray-600"
        >
          <option value="date">الفرز حسب التاريخ</option>
          <option value="name">الفرز حسب الاسم</option>
          <option value="size">الفرز حسب الحجم</option>
          <option value="duration">الفرز حسب المدة</option>
        </select>
        <button
          onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg flex items-center justify-center"
        >
          {sortDirection === "asc" ? "⬆️" : "⬇️"}
        </button>
      </div>

      {filteredAndSortedRecordings.length === 0 ? (
        <p className="text-gray-400 text-center py-10">
          لا توجد ملفات مطابقة لنتائج البحث.
        </p>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedRecordings.map((rec) => (
            <div key={rec.id} className="bg-gray-800 p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between shadow-md border border-gray-700">
              <div className="flex-grow mb-3 md:mb-0">
                <h4 className="text-lg font-semibold text-white">{rec.name}</h4>
                <p className="text-sm text-gray-400">
                  {rec.date.toLocaleDateString()} | {formatDuration(rec.duration)} | {formatFileSize(rec.size)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(rec.url, "_blank")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                >
                  فتح
                </button>
                <button
                  onClick={() => onDeleteRecording(rec.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Back Navigation (التنقل الخلفي)
interface BackNavigationProps {
  currentView: string;
  onBack: () => void;
  onNavigate: (
    view:
      | "main"
      | "recordings"
      | "ai"
      | "settings"
      | "files"
      | "templates"
      | "toolbox"
      | "offline-tools"
      | "visual-patch-lab"
      | "ai-body-editor"
      | "knoux-morph-core"
      | "arabic-ai-tools"
      | "elysian"
      | "real-content",
  ) => void;
}

const BackNavigation: FC<BackNavigationProps> = ({ currentView, onBack, onNavigate }) => {
  const getViewTitle = (view: string) => {
    switch (view) {
      case "templates": return "📽️ Video Templates";
      case "toolbox": return "🛠️ AI Toolbox";
      case "recordings": return "🎬 Recording Library";
      case "ai": return "🧠 AI Analysis";
      case "files": return "📁 File Manager";
      case "settings": return "⚙️ Settings";
      case "offline-tools": return "🧠 أدوات أوفلاين";
      case "visual-patch-lab": return "🧩 Visual Patch Lab";
      case "ai-body-editor": return "🔞 AI Body Editor (18+)";
      case "knoux-morph-core": return "🧱 Knoux MorphCore™";
      case "arabic-ai-tools": return "🤖 أدوات الذكاء الاصطناعي العربية";
      case "elysian": return "🌌 Elysian Canvas";
      case "real-content": return "✨ Real Content Manager";
      default: return "🏠 KNOUX REC";
    }
  };

  const navigationItems = [
    { id: "main", icon: "🏠", label: "الرئيسية" },
    { id: "templates", icon: "📽️", label: "القوالب" },
    { id: "toolbox", icon: "🛠️", label: "Toolbox" },
    { id: "offline-tools", icon: "🧠", label: "أدوات أوفلاين" },
    { id: "arabic-ai-tools", icon: "🤖", label: "أدوات عربية" },
    { id: "visual-patch-lab", icon: "🧩", label: "Visual Patch" },
    { id: "knoux-morph-core", icon: "🧱", label: "MorphCore" },
    { id: "ai-body-editor", icon: "🔞", label: "AI Body Editor" },
    { id: "recordings", icon: "🎬", label: "Recordings" },
    { id: "ai", icon: "🧠", label: "AI Tools" },
    { id: "files", icon: "📁", label: "Files" },
    { id: "elysian", icon: "🌌", label: "Elysian" },
    { id: "real-content", icon: "✨", label: "Real Content" },
  ];

  return (
    <div className="luxury-glass-card mx-4 mt-4 mb-2 p-4 rounded-2xl">
      <div className="flex items-center justify-between">
        {/* Back Button & Current View */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="glow-button p-3 rounded-xl text-white hover:bg-knoux-purple/30 transition-all duration-300 group"
            title="Go Back"
          >
            <svg
              className="w-5 h-5 group-hover:transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div>
            <h1 className="text-xl font-orbitron font-bold text-white">
              {getViewTitle(currentView)}
            </h1>
            <div className="text-sm text-white/60">
              Navigate through KNOUX REC features
            </div>
          </div>
        </div>

        {/* Quick Navigation - Desktop */}
        <div className="hidden md:flex items-center space-x-2 overflow-x-auto pb-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as any)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                currentView === item.id
                  ? "bg-knoux-purple/30 border border-knoux-purple text-knoux-purple" // Assuming knoux-purple is defined in Tailwind config
                  : "hover:bg-white/10 text-white/70 hover:text-white"
              }`}
              title={item.label}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-rajdhani font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Quick Navigation - Mobile (Icons only) */}
        <div className="md:hidden flex items-center space-x-2 overflow-x-auto pb-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as any)}
              className={`flex-shrink-0 p-2 rounded-lg transition-all duration-300 ${
                currentView === item.id
                  ? "bg-knoux-purple/30 border border-knoux-purple text-knoux-purple"
                  : "hover:bg-white/10 text-white/70 hover:text-white"
              }`}
              title={item.label}
            >
              <span className="text-lg">{item.icon}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="mt-3 flex items-center space-x-2 text-sm text-white/50">
        <span>KNOUX REC</span>
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="text-knoux-purple">
          {getViewTitle(currentView).split(" ").slice(1).join(" ")}
        </span>
      </div>
    </div>
  );
};

// Templates Panel (لوحة القوالب)
const TemplatesPanel: FC = () => (
  <div className="luxury-glass-card p-6 text-white/70 text-center rounded-xl min-h-[300px] flex flex-col items-center justify-center">
    <div className="text-5xl mb-4">📽️</div>
    <h3 className="font-bold text-2xl text-white mb-2">قوالب الفيديو الجاهزة</h3>
    <p className="mb-4">استخدم قوالب احترافية لإنشاء مقاطع فيديو مذهلة بسرعة.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
      <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
        <h4 className="font-semibold text-white">قالب العرض التقديمي</h4>
        <p className="text-sm text-gray-400">مثالي للاجتماعات والعروض.</p>
      </div>
      <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
        <h4 className="font-semibold text-white">قالب الشرح التعليمي</h4>
        <p className="text-sm text-gray-400">لإنشاء دروس وشروحات واضحة.</p>
      </div>
    </div>
    <p className="text-sm text-white/50 mt-4">المزيد من القوالب قريباً!</p>
  </div>
);

// Toolbox Panel (لوحة صندوق الأدوات)
const ToolboxPanel: FC = () => (
  <div className="luxury-glass-card p-6 text-white/70 text-center rounded-xl min-h-[300px] flex flex-col items-center justify-center">
    <div className="text-5xl mb-4">🛠️</div>
    <h3 className="font-bold text-2xl text-white mb-2">صندوق الأدوات الذكي</h3>
    <p className="mb-4">مجموعة من الأدوات المساعدة لتحسين سير عملك.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
      <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
        <h4 className="font-semibold text-white">ضاغط الفيديو</h4>
        <p className="text-sm text-gray-400">تقليل حجم الملفات.</p>
      </div>
      <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
        <h4 className="font-semibold text-white">محول التنسيقات</h4>
        <p className="text-sm text-gray-400">تحويل الفيديو إلى صيغ مختلفة.</p>
      </div>
    </div>
    <p className="text-sm text-white/50 mt-4">المزيد من الأدوات قريباً!</p>
  </div>
);

// Offline AI Tools Panel (لوحة أدوات الذكاء الاصطناعي غير المتصلة)
const OfflineAIToolsPanel: FC = () => (
  <div className="luxury-glass-card p-6 text-white/70 text-center rounded-xl min-h-[300px] flex flex-col items-center justify-center">
    <div className="text-5xl mb-4">🧠</div>
    <h3 className="font-bold text-2xl text-white mb-2">أدوات الذكاء الاصطناعي غير المتصلة</h3>
    <p className="mb-4">استفد من قوة الذكاء الاصطناعي مباشرة على جهازك، بدون الحاجة للاتصال بالإنترنت.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
      <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
        <h4 className="font-semibold text-white">تحويل الكلام إلى نص (محلي)</h4>
        <p className="text-sm text-gray-400">دقيق وسريع.</p>
      </div>
      <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
        <h4 className="font-semibold text-white">تحليل المشاعر (محلي)</h4>
        <p className="text-sm text-gray-400">فهم نبرة المحتوى.</p>
      </div>
    </div>
    <p className="text-sm text-white/50 mt-4">38 أداة ذكية تعمل محلياً.</p>
  </div>
);

// Visual Patch Lab Panel (لوحة مختبر التصحيح البصري)
const VisualPatchLabPanel: FC = () => (
  <div className="luxury-glass-card p-6 text-white/70 text-center rounded-xl min-h-[300px] flex flex-col items-center justify-center">
    <div className="text-5xl mb-4">🧩</div>
    <h3 className="font-bold text-2xl text-white mb-2">مختبر التصحيح البصري</h3>
    <p className="mb-4">أدوات متقدمة لتحرير الفيديو والصور بشكل دقيق ومبتكر.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
      <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
        <h4 className="font-semibold text-white">إزالة الخلفية</h4>
        <p className="text-sm text-gray-400">بضغطة زر.</p>
      </div>
      <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
        <h4 className="font-semibold text-white">تحسين الألوان</h4>
        <p className="text-sm text-gray-400">جعل مقاطعك تبدو احترافية.</p>
      </div>
    </div>
    <p className="text-sm text-white/50 mt-4">50 أداة تحرير متوفرة.</p>
  </div>
);

// AI Body Editor Panel (لوحة محرر الجسم بالذكاء الاصطناعي)
const AIBodyEditorPanel: FC = () => (
  <div className="luxury-glass-card p-6 text-white/70 text-center rounded-xl min-h-[300px] flex flex-col items-center justify-center">
    <div className="text-5xl mb-4">🔞</div>
    <h3 className="font-bold text-2xl text-white mb-2">محرر الجسم بالذكاء الاصطناعي (18+)</h3>
    <p className="mb-4 text-red-400">
      هذه الأداة مخصصة للمستخدمين البالغين فقط (18+) وتتيح تعديلات متقدمة على صور الجسم باستخدام الذكاء الاصطناعي.
    </p>
    <p className="text-sm text-white/50 mt-4">يرجى استخدامها بمسؤولية.</p>
  </div>
);

// Knoux MorphCore Panel (لوحة Knoux MorphCore)
const KnouxMorphCorePanel: FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="luxury-glass-card p-6 text-white/70 text-center rounded-xl min-h-[300px] flex flex-col items-center justify-center">
    <div className="text-5xl mb-4">🧱</div>
    <h3 className="font-bold text-2xl text-white mb-2">Knoux MorphCore™ - مختبر التصحيح البصري غير المتصل</h3>
    <p className="mb-4">
      استكشف 50 أداة تحرير بصرية قوية تعمل بالكامل على جهازك، دون الحاجة إلى اتصال بالإنترنت أو الذكاء الاصطناعي.
    </p>
    <p className="text-sm text-white/50 mt-4">مثالي للتعديلات السريعة والتحكم الكامل.</p>
    <button onClick={onClose} className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
      العودة إلى الرئيسية
    </button>
  </div>
);

// Arabic AI Tools Panel (لوحة أدوات الذكاء الاصطناعي العربية)
const ArabicAIToolsPanel: FC = () => (
  <div className="luxury-glass-card p-6 text-white/70 text-center rounded-xl min-h-[300px] flex flex-col items-center justify-center">
    <div className="text-5xl mb-4">🤖</div>
    <h3 className="font-bold text-2xl text-white mb-2">أدوات الذكاء الاصطناعي العربية</h3>
    <p className="mb-4">
      مجموعة متخصصة من 38 أداة ذكاء اصطناعي مصممة خصيصاً لمعالجة وتحليل المحتوى باللغة العربية، تعمل محلياً.
    </p>
    <p className="text-sm text-white/50 mt-4">دقة عالية وتوافق كامل مع اللغة العربية.</p>
  </div>
);

// Elysian Canvas (قماش إليزيان)
const ElysianCanvas: FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="luxury-glass-card p-6 text-white/70 text-center rounded-xl min-h-[300px] flex flex-col items-center justify-center">
    <div className="text-5xl mb-4">🌌</div>
    <h3 className="font-bold text-2xl text-white mb-2">Elysian Canvas</h3>
    <p className="mb-4">
      مساحة إبداعية لا نهائية لتصميم وتصور أفكارك.
    </p>
    <p className="text-sm text-white/50 mt-4">ابدأ مشروعك الفني التالي هنا.</p>
    <button onClick={onClose} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
      العودة إلى الرئيسية
    </button>
  </div>
);

// Advanced Progress Indicator (مؤشر التقدم المتقدم)
interface AdvancedProgressIndicatorProps {
  progress: LoadingProgress;
  memoryStatus?: MemoryStatus;
  onCancel: () => void;
  showDetails?: boolean;
}

const AdvancedProgressIndicator: FC<AdvancedProgressIndicatorProps> = ({ progress, memoryStatus, onCancel, showDetails }) => {
  const progressColor = progress.stage === "error" ? "bg-red-500" : progress.stage === "ready" ? "bg-green-500" : "bg-blue-500";
  const textColor = progress.stage === "error" ? "text-red-300" : "text-white";

  return (
    <div className="bg-gray-700 p-4 rounded-lg shadow-md border border-gray-600">
      <div className="flex items-center justify-between mb-2">
        <span className={`font-semibold ${textColor}`}>
          {progress.modelName} - {progress.stage === "loading" ? "جار التحميل" : progress.stage === "optimizing" ? "جار التحسين" : progress.stage === "ready" ? "جاهز" : "خطأ"}
        </span>
        <span className="text-gray-300">{progress.progress.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-600 rounded-full h-2.5">
        <div className={`${progressColor} h-2.5 rounded-full`} style={{ width: `${progress.progress}%` }}></div>
      </div>
      {showDetails && progress.details && (
        <p className="text-xs text-gray-400 mt-2">{progress.details}</p>
      )}
      {memoryStatus && (
        <p className="text-xs text-gray-500 mt-2">
          الذاكرة المستخدمة: {(memoryStatus.totalUsed / 1024).toFixed(2)} جيجابايت / {(memoryStatus.totalUsed + memoryStatus.available) / 1024).toFixed(2)} جيجابايت
        </p>
      )}
      {progress.stage === "loading" && (
        <button onClick={onCancel} className="mt-3 text-red-400 hover:text-red-300 text-sm">
          إلغاء التحميل
        </button>
      )}
    </div>
  );
};

// Advanced Model Settings (إعدادات النموذج المتقدمة)
interface AdvancedModelSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  loadingProgress: LoadingProgress[];
  memoryStatus: MemoryStatus | null;
  errorReports: ErrorReport[];
  onLoadingProgress: (modelName: string, progress: LoadingProgress) => void;
  onMemoryStatusChange: (status: MemoryStatus) => void;
}

const AdvancedModelSettings: FC<AdvancedModelSettingsProps> = ({
  isOpen,
  onClose,
  loadingProgress,
  memoryStatus,
  errorReports,
  onLoadingProgress,
  onMemoryStatusChange,
}) => {
  const [mockModelLoadProgress, setMockModelLoadProgress] = useState(0);
  const [mockModelStage, setMockModelStage] = useState<LoadingProgress['stage']>('loading');

  const simulateModelLoad = useCallback(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress > 100) {
        clearInterval(interval);
        setMockModelStage('ready');
        onLoadingProgress('MockModel', { modelName: 'MockModel', progress: 100, stage: 'ready' });
      } else {
        setMockModelLoadProgress(currentProgress);
        onLoadingProgress('MockModel', { modelName: 'MockModel', progress: currentProgress, stage: 'loading' });
      }
    }, 200);
  }, [onLoadingProgress]);

  useEffect(() => {
    // Simulate initial memory status
    onMemoryStatusChange(enhancedModelManager.getMemoryStatus());
  }, [onMemoryStatusChange]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إعدادات النموذج المتقدمة">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-3">حالة تحميل النموذج</h3>
          {loadingProgress.length === 0 && mockModelStage === 'ready' ? (
            <p className="text-gray-400">لا توجد نماذج قيد التحميل حالياً.</p>
          ) : (
            <>
              {loadingProgress.map((progress) => (
                <AdvancedProgressIndicator
                  key={progress.modelName}
                  progress={progress}
                  memoryStatus={memoryStatus || undefined}
                  onCancel={() => {
                    enhancedErrorHandler.reportError({
                      message: `تم إلغاء تحميل النموذج ${progress.modelName}.`,
                      context: { modelName: progress.modelName, errorType: 'UserCancel' },
                      solution: { title: 'تم الإلغاء', description: 'يمكنك إعادة المحاولة لاحقاً.', actions: [] }
                    });
                    onLoadingProgress(progress.modelName, { ...progress, stage: 'error', details: 'تم الإلغاء بواسطة المستخدم' });
                  }}
                  showDetails={true}
                />
              ))}
              {mockModelStage !== 'ready' && (
                <AdvancedProgressIndicator
                  progress={{ modelName: 'MockModel', progress: mockModelLoadProgress, stage: mockModelStage }}
                  memoryStatus={memoryStatus || undefined}
                  onCancel={() => {
                    setMockModelStage('error');
                    onLoadingProgress('MockModel', { modelName: 'MockModel', progress: mockModelLoadProgress, stage: 'error', details: 'تم الإلغاء بواسطة المستخدم' });
                  }}
                  showDetails={true}
                />
              )}
            </>
          )}
          <button onClick={simulateModelLoad} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">
            تحميل نموذج تجريبي
          </button>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-3">مراقبة الذاكرة</h3>
          {memoryStatus ? (
            <div className="bg-gray-700 p-4 rounded-lg text-gray-300">
              <p>إجمالي الذاكرة المستخدمة: {(memoryStatus.totalUsed / 1024).toFixed(2)} جيجابايت</p>
              <p>الذاكرة المتاحة: {(memoryStatus.available / 1024).toFixed(2)} جيجابايت</p>
              <div className="w-full bg-gray-600 rounded-full h-2.5 mt-2">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(memoryStatus.totalUsed / (memoryStatus.totalUsed + memoryStatus.available)) * 100}%` }}></div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">جاري تحميل حالة الذاكرة...</p>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-3">تقارير الأخطاء</h3>
          {errorReports.length === 0 ? (
            <p className="text-gray-400">لا توجد تقارير أخطاء حالياً.</p>
          ) : (
            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
              {errorReports.map((report) => (
                <div key={report.id} className="bg-red-900/30 border border-red-700 p-3 rounded-lg">
                  <p className="text-red-300 font-medium mb-1">{report.solution.title}</p>
                  <p className="text-sm text-gray-300">{report.solution.description}</p>
                  <div className="flex gap-2 mt-2">
                    {report.solution.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          action.action();
                          // Remove the error report after action
                          // This logic would typically be handled by the parent component (LuxuryApp)
                          // but for a single file, we'll simulate it.
                          // This is a simplified direct manipulation for single-file constraint.
                          // In a real app, state update would flow from parent.
                          // For now, we'll just log and assume parent handles removal.
                          console.log(`Action "${action.label}" for error ${report.id} executed.`);
                        }}
                        className={`px-3 py-1 rounded-md text-xs ${action.isPrimary ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          إغلاق
        </button>
      </div>
    </Modal>
  );
};

// Memory Monitor (مراقبة الذاكرة)
interface MemoryMonitorProps {
  onMemoryWarning: (status: MemoryStatus) => void;
  className?: string;
}

const MemoryMonitor: FC<MemoryMonitorProps> = ({ onMemoryWarning, className }) => {
  const [memoryStatus, setMemoryStatus] = useState<MemoryStatus | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      const status = enhancedModelManager.getMemoryStatus();
      setMemoryStatus(status);
      onMemoryWarning(status);
    };
    updateStatus();
    const interval = setInterval(updateStatus, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [onMemoryWarning]);

  if (!memoryStatus) {
    return <div className={`luxury-glass-card p-4 text-gray-400 text-center ${className}`}>جاري تحميل حالة الذاكرة...</div>;
  }

  const usagePercentage = (memoryStatus.totalUsed / (memoryStatus.totalUsed + memoryStatus.available)) * 100;
  const progressBarColor = usagePercentage > 90 ? "bg-red-500" : usagePercentage > 70 ? "bg-yellow-500" : "bg-green-500";

  return (
    <div className={`luxury-glass-card p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-2">مراقبة الذاكرة</h3>
      <div className="flex items-center justify-between text-gray-300 text-sm mb-1">
        <span>الذاكرة المستخدمة: {(memoryStatus.totalUsed / 1024).toFixed(2)} جيجابايت</span>
        <span>المتاحة: {(memoryStatus.available / 1024).toFixed(2)} جيجابايت</span>
      </div>
      <div className="w-full bg-gray-600 rounded-full h-3">
        <div className={`${progressBarColor} h-3 rounded-full`} style={{ width: `${usagePercentage}%` }}></div>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        إجمالي الذاكرة: {((memoryStatus.totalUsed + memoryStatus.available) / 1024).toFixed(2)} جيجابايت
      </p>
    </div>
  );
};

// Auto Allocation Coordinator (منسق التخصيص التلقائي)
interface AutoAllocationCoordinatorProps {
  onAllocationUpdate: (stats: { totalAllocated: number; details: string }) => void;
  onClose: () => void;
}

const AutoAllocationCoordinator: FC<AutoAllocationCoordinatorProps> = ({ onAllocationUpdate, onClose }) => {
  const [status, setStatus] = useState("idle"); // idle, allocating, complete, error
  const [progress, setProgress] = useState(0);

  const startAllocation = useCallback(() => {
    setStatus("allocating");
    setProgress(0);
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setStatus("complete");
        onAllocationUpdate({ totalAllocated: 5, details: "تم تخصيص 5 موارد بنجاح." });
      }
    }, 200);
  }, [onAllocationUpdate]);

  return (
    <div className="p-6 text-white text-center">
      <h3 className="text-2xl font-bold mb-4">تنسيق التخصيص التلقائي</h3>
      <p className="text-gray-300 mb-6">
        قم بتحسين أداء النظام عن طريق السماح للتطبيق بتخصيص الموارد تلقائياً.
      </p>
      {status === "idle" && (
        <button
          onClick={startAllocation}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          بدء التخصيص التلقائي
        </button>
      )}
      {status === "allocating" && (
        <div className="mt-4">
          <p className="text-yellow-400 mb-2">جاري تخصيص الموارد... ({progress}%)</p>
          <div className="w-full bg-gray-600 rounded-full h-4">
            <div className="bg-yellow-500 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}
      {status === "complete" && (
        <div className="mt-4 text-green-400">
          <p className="text-xl font-bold">✅ تم التخصيص بنجاح!</p>
          <p className="text-sm text-gray-300">تم تحسين الموارد.</p>
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 text-red-400">
          <p className="text-xl font-bold">❌ فشل التخصيص.</p>
          <p className="text-sm text-gray-300">حدث خطأ أثناء محاولة التخصيص.</p>
        </div>
      )}
      <button
        onClick={onClose}
        className="mt-8 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        إغلاق
      </button>
    </div>
  );
};

// Real Content Manager (مدير المحتوى الحقيقي)
interface RealContentManagerProps {
  onContentUpdate: (stats: { total: number }) => void;
}

const RealContentManager: FC<RealContentManagerProps> = ({ onContentUpdate }) => {
  const [contentCount, setContentCount] = useState(0);

  const activateContent = useCallback(() => {
    // Simulate activating real content
    const newCount = Math.floor(Math.random() * 10) + 1; // Activate 1-10 items
    setContentCount(prev => prev + newCount);
    onContentUpdate({ total: newCount });
  }, [onContentUpdate]);

  return (
    <div className="p-6 text-white text-center">
      <h3 className="text-2xl font-bold mb-4">إدارة المحتوى الحقيقي</h3>
      <p className="text-gray-300 mb-6">
        قم بتفعيل المحتوى الحقيقي لتحسين تجربة المستخدم وإضافة بيانات واقعية.
      </p>
      <p className="text-lg mb-4">عدد عناصر المحتوى المفعلة: <span className="font-bold text-green-400">{contentCount}</span></p>
      <button
        onClick={activateContent}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        تفعيل محتوى جديد
      </button>
      <p className="text-sm text-white/50 mt-4">
        هذه الميزة تقوم بدمج بيانات حقيقية لتعزيز وظائف التطبيق.
      </p>
    </div>
  );
};


// =================================================================
// MAIN APP COMPONENT (المكون الرئيسي)
// =================================================================
const App: FC = () => {
  // --- STATE ---
  const [currentView, setCurrentView] = useState<
    | "main"
    | "recordings"
    | "ai"
    | "settings"
    | "files"
    | "templates"
    | "toolbox"
    | "offline-tools"
    | "visual-patch-lab"
    | "ai-body-editor"
    | "knoux-morph-core"
    | "arabic-ai-tools"
    | "elysian"
    | "real-content"
  >("main");

  const [settings, setSettings] = useState<RecordingSettings>({
    recordScreen: true,
    recordMic: true,
    recordSystemAudio: true,
    recordCamera: false,
    videoQuality: "1080p",
    fps: 60,
    gameMode: false,
    aiProcessingEnabled: true,
    scheduleEnabled: false,
    scheduleTime: "",
    instantTrimEnabled: false,
    fileNamePattern: "KNOUX-REC-[DATE]_[TIME]",
    hotkeys: {
      startStop: "Control+Shift+R",
      pauseResume: "Control+Shift+P",
      screenshot: "Control+Shift+S",
    },
    liveFilter: "none",
    enableRegionSelection: false,
    countdownEnabled: false,
    countdownSeconds: 3,
    highlightMouse: false,
    cameraPipPosition: "bottomRight",
    cameraPipSize: "medium",
  });

  const [recordings, setRecordings] = useState<Recording[]>([
    {
      id: "rec-1700000000000",
      name: "عرض تقديمي للمشروع",
      url: "https://www.w3.org/2010/05/video/media.webm", // Example video URL
      blob: new Blob(["mock video 1"], { type: "video/webm" }),
      size: 50 * 1024 * 1024,
      date: new Date("2024-07-10T10:00:00Z"),
      duration: 300, // 5 minutes
      transcript: "مرحباً بكم في هذا العرض التقديمي لمشروعنا الجديد. سنناقش اليوم أهم الميزات والتحسينات التي قمنا بها. نأمل أن تستمتعوا بهذا العرض التقديمي وتجدوا المعلومات مفيدة. شكراً لكم على حضوركم.",
      isProcessing: false,
      summary: "ملخص افتراضي للعرض التقديمي.",
      keywords: ["مشروع", "عرض", "ميزات"],
      sentiment: "إيجابي",
      language: "العربية",
      topic: "الأعمال والاقتصاد",
      metadata: settings,
    },
    {
      id: "rec-1700000000001",
      name: "درس تعليمي في البرمجة",
      url: "https://www.w3.org/2010/05/video/media.webm",
      blob: new Blob(["mock video 2"], { type: "video/webm" }),
      size: 120 * 1024 * 1024,
      date: new Date("2024-07-08T14:30:00Z"),
      duration: 720, // 12 minutes
      transcript: "في هذا الدرس، سنتعلم أساسيات لغة بايثون وكيفية كتابة أول برنامج لنا. سنغطي المتغيرات، أنواع البيانات، والجمل الشرطية. تأكدوا من مراجعة الأمثلة بعد الدرس.",
      isProcessing: false,
      summary: "ملخص افتراضي لدرس البرمجة.",
      keywords: ["بايثون", "برمجة", "درس"],
      sentiment: "محايد",
      language: "العربية",
      topic: "التعليم والمعرفة",
      metadata: settings,
    },
    {
      id: "rec-1700000000002",
      name: "مراجعة منتج جديد",
      url: "https://www.w3.org/2010/05/video/media.webm",
      blob: new Blob(["mock video 3"], { type: "video/webm" }),
      size: 80 * 1024 * 1024,
      date: new Date("2024-07-05T09:00:00Z"),
      duration: 480, // 8 minutes
      transcript: "This is a review of the new XYZ smartphone. It has amazing features, but the battery life is quite bad. Overall, it's a mixed bag.",
      isProcessing: false,
      summary: "ملخص افتراضي لمراجعة المنتج.",
      keywords: ["smartphone", "review", "battery"],
      sentiment: "مختلط",
      language: "الإنجليزية",
      topic: "التقنية والابتكار",
      metadata: settings,
    },
  ]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingRecording, setPendingRecording] = useState<Recording | null>(null);
  const [galleryPlaybackUrl, setGalleryPlaybackUrl] = useState<string | null>(null);
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress[]>([]);
  const [memoryStatus, setMemoryStatus] = useState<MemoryStatus | null>(null);
  const [errorReports, setErrorReports] = useState<ErrorReport[]>([]);
  const [showAutoAllocation, setShowAutoAllocation] = useState(false);
  const [showRealContent, setShowRealContent] = useState(false);

  const addNotification = useCallback(
    (message: string, type: Notification["type"]) => {
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        message,
        type,
      };
      setNotifications((prev) => [newNotification, ...prev].slice(0, 10));

      switch (type) {
        case "success": feedbackService.success(message); break;
        case "error": feedbackService.error(message); break;
        case "warning": feedbackService.warning(message); break;
        default: feedbackService.info(message);
      }
    },
    [],
  );

  const runAiProcessing = useCallback(
    async (recording: Recording) => {
      if (!recording.transcript || recording.transcript.trim().length < 10) {
        addNotification(`تم تخطي التحليل الذكي لـ "${recording.name}" (النص قصير جداً).`, "info");
        setRecordings((prev) =>
          prev.map((r) =>
            r.id === recording.id
              ? { ...r, isProcessing: false, summary: "لم يتم اكتشاف كلام واضح." }
              : r,
          ),
        );
        return;
      }

      setRecordings(prev => prev.map(r => r.id === recording.id ? { ...r, isProcessing: true } : r));

      try {
        const loadingId = feedbackService.loading(`جار المعالجة بالذكاء الاصطناعي لـ "${recording.name}"...`, 0);
        addNotification(`جار المعالجة بالذكاء الاصطناعي لـ "${recording.name}"...`, "info");

        const taskId = await offlineAI.addTask({
          type: "text",
          operation: "text_analysis",
          input: recording.transcript,
          credits: 10,
          estimatedTime: 60,
        });

        const checkTaskStatus = () => {
          const task = offlineAI.getTaskStatus(taskId);
          if (task) {
            if (task.status === "completed" && task.output) {
              const result = JSON.parse(task.output as string);
              setRecordings((prev) =>
                prev.map((r) =>
                  r.id === recording.id
                    ? {
                        ...r,
                        name: result.title || recording.name,
                        summary: result.summary || "تم التحليل بنجاح",
                        keywords: result.keywords || [],
                        isProcessing: false,
                      }
                    : r,
                ),
              );
              feedbackService.dismiss(loadingId);
              addNotification(`اكتمل التحليل الذكي لـ "${recording.name}"`, "success");
            } else if (task.status === "error") {
              setRecordings((prev) =>
                prev.map((r) =>
                  r.id === recording.id
                    ? { ...r, isProcessing: false, summary: `فشل التحليل الذكي: ${task.error}` }
                    : r,
                ),
              );
              feedbackService.dismiss(loadingId);
              addNotification(`فشل التحليل الذكي: ${task.error}`, "error");
            } else if (task.status === "processing") {
              setTimeout(checkTaskStatus, 2000);
            }
          }
        };
        setTimeout(checkTaskStatus, 1000);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "خطأ غير معروف";
        addNotification(`فشل التحليل الذكي: ${errorMessage}`, "error");
        setRecordings((prev) =>
          prev.map((r) =>
            r.id === recording.id
              ? { ...r, isProcessing: false, summary: `فشل التحليل الذكي: ${errorMessage}` }
              : r,
          ),
        );
      }
    },
    [addNotification],
  );

  const onRecordingComplete = useCallback(
    async (blob: Blob, transcript: string = "") => {
      const newRecording: Recording = {
        id: `rec-${Date.now()}`,
        name: generateFileName(settings.fileNamePattern, "webm"),
        url: URL.createObjectURL(blob),
        blob,
        size: blob.size,
        date: new Date(),
        duration: 0, // Duration will be updated later
        transcript,
        isProcessing: settings.aiProcessingEnabled,
        metadata: settings,
      };

      if (settings.instantTrimEnabled) {
        setPendingRecording(newRecording);
      } else {
        setRecordings((prev) => [newRecording, ...prev]);
        addNotification(`تم حفظ التسجيل "${newRecording.name}".`, "success");
        feedbackService.success(`تم حفظ التسجيل بنجاح! 🎬`, {
          actions: [{ label: "عرض", action: () => setCurrentView("recordings"), style: "primary" }],
        });

        if (newRecording.isProcessing && newRecording.transcript) {
          runAiProcessing(newRecording);
        } else if (!newRecording.transcript && settings.aiProcessingEnabled) {
          try {
            const audioLoadingId = feedbackService.loading("جار استخراج الصوت وتحويله لنص...", 0);
            addNotification("جار استخراج الصوت وتحويله لنص...", "info");
            const audioBlob = await audioProcessor.extractAudioFromVideo(blob);
            const extractedText = await audioProcessor.speechToText(audioBlob, "ar-SA");

            const updatedRecording = { ...newRecording, transcript: extractedText };
            setRecordings((prev) =>
              prev.map((r) => (r.id === newRecording.id ? updatedRecording : r)),
            );
            feedbackService.dismiss(audioLoadingId);
            if (extractedText.trim().length > 10) {
              runAiProcessing(updatedRecording);
            } else {
              feedbackService.warning("لم يتم اكتشاف نص واضح في التسجيل الصوتي");
            }
          } catch (error) {
            console.warn("فشل في استخراج النص من الصوت:", error);
            addNotification("فشل في استخراج النص من الصوت.", "error");
          }
        }
      }
    },
    [settings, addNotification, runAiProcessing],
  );

  const { state: recorderState, actions: recorderActions } = useRecorder();

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    enhancedErrorHandler.onError("app", (report) => {
      setErrorReports((prev) => [report, ...prev].slice(0, 10));
      addNotification(`خطأ في النموذج ${report.context.modelName || 'غير معروف'}: ${report.solution.title}`, "error");
    });

    const updateMemoryStatus = () => {
      const status = enhancedModelManager.getMemoryStatus();
      setMemoryStatus(status);
    };

    updateMemoryStatus();
    const memoryInterval = setInterval(updateMemoryStatus, 10000);

    return () => {
      enhancedErrorHandler.offError("app");
      clearInterval(memoryInterval);
    };
  }, [addNotification]);

  const handleMemoryWarning = useCallback(
    (status: MemoryStatus) => {
      const usagePercentage = (status.totalUsed / (status.totalUsed + status.available)) * 100;
      if (usagePercentage > 90) {
        addNotification("تحذير: الذاكرة ممتلئة تقريباً! قد يتم إلغاء تحميل بعض النماذج تلقائياً.", "warning");
      } else if (usagePercentage > 80) {
        addNotification("تحذير: استخدام الذاكرة مرتفع. يُنصح بتحسين الاستخدام.", "warning");
      }
    },
    [addNotification],
  );

  const handleLoadingProgress = useCallback(
    (modelName: string, progress: LoadingProgress) => {
      setLoadingProgress((prev) => {
        const existing = prev.findIndex((p) => p.modelName === modelName);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = progress;
          return updated;
        } else {
          return [...prev, progress];
        }
      });

      if (progress.stage === "ready" || progress.stage === "error") {
        setTimeout(() => {
          setLoadingProgress((prev) => prev.filter((p) => p.modelName !== modelName));
        }, 3000);
      }
    },
    [],
  );

  const handleSettingsChange = (newSettings: RecordingSettings) => {
    setSettings(newSettings);
  };

  const onSettingsSave = (newSettings: RecordingSettings) => {
    handleSettingsChange(newSettings);
    addNotification("Settings saved!", "success");
    feedbackService.success("تم حفظ الإعدادات بنجاح! ⚙️");
  };

  const handleDeleteRecording = (id: string) => {
    setRecordings((prev) =>
      prev.filter((rec) => {
        if (rec.id === id) {
          if (rec.url === galleryPlaybackUrl) {
            setGalleryPlaybackUrl(null);
          }
          URL.revokeObjectURL(rec.url);
          return false;
        }
        return true;
      }),
    );
    addNotification("Recording deleted.", "info");
    feedbackService.warning("تم حذف التسجيل");
  };

  const handleScreenshot = useCallback(async () => {
    try {
      const loadingId = feedbackService.loading("جار التقاط لقطة الشاشة...", 0);
      const result = await recorderActions.takeScreenshot();
      feedbackService.dismiss(loadingId);

      if (result.success) {
        feedbackService.success(`تم التقاط لقطة الشاشة بنجاح! 📸`, {
          message: `الملف: ${result.filename}`,
          actions: [{ label: "فتح", action: () => { if (result.dataUrl) { window.open(result.dataUrl, "_blank"); } }, style: "primary" }],
        });
      } else {
        feedbackService.error(`فشل في التقاط لقطة الشاشة: ${result.error}`);
      }
    } catch (error) {
      feedbackService.error(`خطأ في التقاط لقطة الشاشة: ${error instanceof Error ? error.message : "خطأ غير معروف"}`);
    }
  }, [recorderActions]);

  const handleUpdateRecording = (updatedRecording: Recording) => {
    setRecordings((prev) =>
      prev.map((r) => (r.id === updatedRecording.id ? updatedRecording : r)),
    );
  };

  const handleSelectForPreview = (rec: Recording) => {
    if (galleryPlaybackUrl) {
      URL.revokeObjectURL(galleryPlaybackUrl);
    }
    setGalleryPlaybackUrl(rec.url);
  };

  useEffect(() => {
    const checkHotkey = (e: KeyboardEvent, hotkey: string): boolean => {
      if (!hotkey) return false;
      const keys = hotkey.toLowerCase().split("+").map((k) => k.trim());
      const key = keys.pop();
      if (!key) return false;

      const ctrl = keys.includes("control") || keys.includes("ctrl");
      const shift = keys.includes("shift");
      const alt = keys.includes("alt");
      const meta = keys.includes("meta");

      return (
        e.key.toLowerCase() === key.toLowerCase() &&
        e.ctrlKey === ctrl &&
        e.shiftKey === shift &&
        e.altKey === alt &&
        e.metaKey === meta
      );
    };

    const handleHotkeys = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
        target.isContentEditable ||
        isSettingsOpen ||
        pendingRecording
      ) {
        return;
      }

      if (checkHotkey(e, settings.hotkeys.startStop)) {
        e.preventDefault();
        !recorderState.isRecording ? recorderActions.startRecording() : recorderActions.stopRecording();
      } else if (checkHotkey(e, settings.hotkeys.pauseResume)) {
        e.preventDefault();
        if (recorderState.isRecording && !recorderState.isPaused) {
          recorderActions.pauseRecording();
        } else if (recorderState.isRecording && recorderState.isPaused) {
          recorderActions.resumeRecording();
        }
      } else if (checkHotkey(e, settings.hotkeys.screenshot)) {
        e.preventDefault();
        if (recorderState.isRecording) {
          recorderActions.takeScreenshot();
        }
      }
    };

    window.addEventListener("keydown", handleHotkeys);
    return () => window.removeEventListener("keydown", handleHotkeys);
  }, [
    settings.hotkeys,
    recorderState,
    recorderActions,
    isSettingsOpen,
    pendingRecording,
  ]);

  const handleStartRecording = () => {
    setGalleryPlaybackUrl(null);
    recorderActions.startRecording();
  };

  useEffect(() => {
    if (recorderState.recordingBlob && !recorderState.isRecording) {
      onRecordingComplete(recorderState.recordingBlob);
    }
  }, [recorderState.recordingBlob, recorderState.isRecording, onRecordingComplete]);

  const [theme, setTheme] = useState<Theme>("dark");

  const renderMainView = () => (
    <main className="flex-grow p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-screen-2xl w-full mx-auto z-10">
      <div className="flex flex-col gap-6">
        <div className="luxury-glass-card">
          <Controls />
        </div>
        <div className="luxury-glass-card">
          <Features
            settings={settings}
            onSettingsChange={handleSettingsChange}
            isRecording={recorderState.isRecording}
          />
        </div>
        <div className="luxury-glass-card">
          <Actions
            recordingState={
              recorderState.isRecording
                ? "RECORDING"
                : recorderState.isPaused
                  ? "PAUSED"
                  : "IDLE"
            }
            onStart={handleStartRecording}
            onStop={recorderActions.stopRecording}
            onPause={recorderActions.pauseRecording}
            onResume={recorderActions.resumeRecording}
            onScreenshot={handleScreenshot}
            disabled={false}
            timer={recorderState.recordingTime.toString()}
            fps={recorderState.frameRate}
            scheduleStatus="idle"
            hotkeys={settings.hotkeys}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="luxury-glass-card">
          <VideoPreview
            previewSource={
              recorderState.recordingBlob
                ? URL.createObjectURL(recorderState.recordingBlob)
                : galleryPlaybackUrl
            }
            isRecording={recorderState.isRecording}
            countdown={0}
            pipCameraStream={null}
            settings={settings}
          />
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => setCurrentView("templates")}
            className="luxury-glass-card interactive-hover p-6 rounded-2xl text-center group"
          >
            <div className="mb-3">
              <TemplatesIcon size={48} className="mx-auto" />
            </div>
            <div className="luxury-text font-bold text-lg mb-1">
              قوالب الفيديو
            </div>
            <div className="luxury-text text-sm opacity-70">
              Video Templates
            </div>
          </button>

          <button
            onClick={() => setCurrentView("toolbox")}
            className="luxury-glass-card interactive-hover p-6 rounded-2xl text-center group"
          >
            <div className="mb-3">
              <ToolboxIcon size={48} className="mx-auto" />
            </div>
            <div className="luxury-text font-bold text-lg mb-1">
              صندوق الأدوات
            </div>
            <div className="luxury-text text-sm opacity-70">AI Toolbox</div>
          </button>

          <button
            onClick={() => setCurrentView("offline-tools")}
            className="luxury-glass-card interactive-hover p-6 rounded-2xl text-center group hologram-effect"
          >
            <div className="mb-3">
              <AIToolsIcon size={48} className="mx-auto" />
            </div>
            <div className="luxury-text font-bold text-lg mb-1 neon-glow">
              أدوات أوفلاين
            </div>
            <div className="luxury-text text-sm opacity-70">38 أداة ذكية</div>
          </button>

          <button
            onClick={() => setCurrentView("visual-patch-lab")}
            className="luxury-glass-card interactive-hover p-6 rounded-2xl text-center group diamond-effect"
          >
            <div className="mb-3">
              <VisualPatchIcon size={48} className="mx-auto" />
            </div>
            <div className="luxury-text font-bold text-lg mb-1 neon-glow">
              Visual Patch
            </div>
            <div className="luxury-text text-sm opacity-70">50 أداة تحرير</div>
          </button>

          <button
            onClick={() => setCurrentView("recordings")}
            className="luxury-glass-card interactive-hover p-6 rounded-2xl text-center group"
          >
            <div className="mb-3">
              <RecordingsIcon size={48} className="mx-auto" />
            </div>
            <div className="luxury-text font-bold text-lg mb-1">التسجيلات</div>
            <div className="luxury-text text-sm opacity-70">
              {recordings.length} ملف
            </div>
          </button>

          <button
            onClick={() => setCurrentView("files")}
            className="luxury-glass-card interactive-hover p-6 rounded-2xl text-center group"
          >
            <div className="mb-3">
              <FilesIcon size={48} className="mx-auto" />
            </div>
            <div className="luxury-text font-bold text-lg mb-1">
              إدارة الملفات
            </div>
            <div className="luxury-text text-sm opacity-70">File Manager</div>
          </button>

          <button
            onClick={() => setCurrentView("arabic-ai-tools")}
            className="luxury-glass-card interactive-hover p-6 rounded-2xl text-center group hologram-effect border-2 border-yellow-500/50"
          >
            <div className="mb-3">
              <div className="text-5xl mx-auto text-yellow-400">🤖</div>
            </div>
            <div className="luxury-text font-bold text-lg mb-1 text-yellow-300">
              أدوات الذكاء الاصطناعي
            </div>
            <div className="luxury-text text-sm opacity-70 text-yellow-400">
              38 أداة عربية • محلياً
            </div>
          </button>

          <button
            onClick={() => setCurrentView("knoux-morph-core")}
            className="luxury-glass-card interactive-hover p-6 rounded-2xl text-center group cosmic-glow border-2 border-purple-500/50"
          >
            <div className="mb-3">
              <div className="text-5xl mx-auto text-purple-400">🧱</div>
            </div>
            <div className="luxury-text font-bold text-lg mb-1 text-purple-300">
              Knoux MorphCore™
            </div>
            <div className="luxury-text text-sm opacity-70 text-purple-400">
              50 أداة محلية • بدون AI
            </div>
          </button>

          <button
            onClick={() => setCurrentView("ai-body-editor")}
            className="luxury-glass-card interactive-hover p-6 rounded-2xl text-center group electric-effect border-2 border-red-500/50"
          >
            <div className="mb-3">
              <div className="text-5xl mx-auto text-red-400">🔞</div>
            </div>
            <div className="luxury-text font-bold text-lg mb-1 text-red-300">
              AI Body Editor
            </div>
            <div className="luxury-text text-sm opacity-70 text-red-400">
              18+ محرر الجسم
            </div>
          </button>
        </div>

        {/* Memory Monitor */}
        <div className="luxury-glass-card">
          <MemoryMonitor
            onMemoryWarning={handleMemoryWarning}
            className="mt-4"
          />
        </div>

        {/* Loading Progress Indicators */}
        {loadingProgress.length > 0 && (
          <div className="luxury-glass-card space-y-3">
            <h3 className="luxury-text font-semibold text-lg flex items-center gap-2">
              ⏳ جار تحميل النماذج
            </h3>
            {loadingProgress.map((progress) => (
              <AdvancedProgressIndicator
                key={progress.modelName}
                progress={progress}
                memoryStatus={memoryStatus || undefined}
                onCancel={() => {
                  console.log(`إلغاء تحميل ${progress.modelName}`);
                }}
                showDetails={progress.stage === "error"}
              />
            ))}
          </div>
        )}

        {/* Error Reports */}
        {errorReports.length > 0 && (
          <div className="luxury-glass-card space-y-3">
            <h3 className="luxury-text font-semibold text-lg flex items-center gap-2">
              ⚠️ تقارير الأخطاء
            </h3>
            {errorReports.slice(0, 3).map((report) => (
              <div
                key={report.id}
                className="luxury-glass-card border border-red-500/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="luxury-text text-red-300 font-medium">
                    {report.solution.title}
                  </h4>
                  <button
                    onClick={() =>
                      setErrorReports((prev) =>
                        prev.filter((r) => r.id !== report.id),
                      )
                    }
                    className="luxury-text text-red-400 hover:text-red-300 text-sm"
                  >
                    ✕
                  </button>
                </div>
                <p className="luxury-text opacity-70 text-sm mb-3">
                  {report.solution.description}
                </p>
                <div className="flex gap-2">
                  {report.solution.actions.slice(0, 2).map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        enhancedErrorHandler.resolveError(report.id, index);
                        setErrorReports((prev) =>
                          prev.filter((r) => r.id !== report.id),
                        );
                      }}
                      className={`luxury-button text-sm ${
                        action.isPrimary ? "electric-effect" : ""
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );

  const renderContent = () => {
    switch (currentView) {
      case "templates":
        return (
          <div className="flex-grow p-4 md:p-6 max-w-screen-2xl w-full mx-auto z-10">
            <div className="luxury-glass-card">
              <TemplatesPanel />
            </div>
          </div>
        );
      case "toolbox":
        return (
          <div className="flex-grow p-4 md:p-6 max-w-screen-2xl w-full mx-auto z-10">
            <div className="luxury-glass-card">
              <ToolboxPanel />
            </div>
          </div>
        );
      case "recordings":
        return (
          <div className="flex-grow p-4 md:p-6 max-w-screen-2xl w-full mx-auto z-10">
            <div className="luxury-glass-card">
              <RecordingsGallery
                recordings={recordings}
                onDelete={handleDeleteRecording}
                onUpdateRecording={handleUpdateRecording}
                onSelectForPreview={handleSelectForPreview}
              />
            </div>
          </div>
        );
      case "ai":
        return (
          <div className="flex-grow p-4 md:p-6 max-w-screen-2xl w-full mx-auto z-10">
            <div className="luxury-glass-card">
              <AIPanel
                recordings={recordings}
                onUpdateRecording={handleUpdateRecording}
              />
            </div>
          </div>
        );
      case "files":
        return (
          <div className="flex-grow p-4 md:p-6 max-w-screen-2xl w-full mx-auto z-10">
            <div className="luxury-glass-card">
              <FileManager
                recordings={recordings}
                onDeleteRecording={handleDeleteRecording}
              />
            </div>
          </div>
        );
      case "offline-tools":
        return (
          <div className="flex-grow p-4 md:p-6 max-w-screen-2xl w-full mx-auto z-10">
            <div className="luxury-glass-card">
              <OfflineAIToolsPanel />
            </div>
          </div>
        );
      case "visual-patch-lab":
        return <VisualPatchLabPanel />;
      case "ai-body-editor":
        return (
          <div className="flex-grow p-4 md:p-6 max-w-screen-2xl w-full mx-auto z-10">
            <AIBodyEditorPanel />
          </div>
        );
      case "arabic-ai-tools":
        return (
          <div className="flex-grow p-4 md:p-6 max-w-screen-2xl w-full mx-auto z-10">
            <ArabicAIToolsPanel />
          </div>
        );
      case "knoux-morph-core":
        return (
          <div className="flex-grow p-4 md:p-6 max-w-screen-2xl w-full mx-auto z-10">
            <KnouxMorphCorePanel onClose={() => setCurrentView("main")} />
          </div>
        );
      case "elysian":
        return (
          <div className="flex-grow p-4 md:p-6 max-w-screen-2xl w-full mx-auto z-10">
            <ElysianCanvas onClose={() => setCurrentView("main")} />
          </div>
        );
      case "real-content":
        return (
          <div className="flex-grow p-4 md:p-6 max-w-screen-2xl w-full mx-auto z-10">
            <RealContentManager
              onContentUpdate={(stats) => {
                console.log("تم تحديث المحتوى الحقيقي:", stats);
                addNotification(
                  `تم تفعيل ${stats.total} عنصر محتوى حقيقي!`,
                  "success",
                );
              }}
            />
          </div>
        );
      default:
        return renderMainView();
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative luxury-arabic">
      {/* تحسينات الواجهة الشاملة */}
      <UIEnhancer />

      {/* التأثيرات البصرية الفاخرة */}
      <LuxuryBackgroundEffects
        effects={["starfield", "orbs", "waves"]}
        intensity={recorderState.isRecording ? 0.8 : 0.4}
      />

      {/* الجسيمات المتحركة */}
      <FloatingParticles />

      {/* الرأسية الفاخرة */}
      <LuxuryHeader
        onSettingsClick={() => setIsSettingsOpen(true)}
        onNotificationsClick={() => setIsNotificationsOpen(true)}
        onThemeToggle={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
        currentTheme={theme}
        notificationCount={notifications.length}
        onAdvancedSettingsClick={() => setIsAdvancedSettingsOpen(true)}
        onAutoAllocationClick={() => setShowAutoAllocation(true)}
        onRealContentClick={() => setShowRealContent(true)}
      />

      {/* التنقل الخلفي */}
      {currentView !== "main" && (
        <BackNavigation onBack={() => setCurrentView("main")} currentView={currentView} onNavigate={setCurrentView} />
      )}

      {/* المحتوى الرئيسي بناءً على currentView */}
      {renderContent()}

      {/* إعدادات التسجيل */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={onSettingsSave}
      />

      {/* إعدادات النموذج المتقدمة */}
      <AdvancedModelSettings
        isOpen={isAdvancedSettingsOpen}
        onClose={() => setIsAdvancedSettingsOpen(false)}
        loadingProgress={loadingProgress}
        memoryStatus={memoryStatus}
        errorReports={errorReports}
        onLoadingProgress={handleLoadingProgress}
        onMemoryStatusChange={setMemoryStatus}
      />

      {/* Notifications Dropdown */}
      <NotificationsDropdown
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onClearNotification={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
        onClearAll={() => setNotifications([])}
      />

      {/* Trim Modal */}
      {pendingRecording && (
        <TrimModal
          recording={pendingRecording}
          onClose={() => setPendingRecording(null)}
          onTrimComplete={(trimmedBlob) => {
            const trimmedRecording = {
              ...pendingRecording,
              blob: trimmedBlob,
              url: URL.createObjectURL(trimmedBlob),
              size: trimmedBlob.size,
            };
            setRecordings((prev) => [trimmedRecording, ...prev]);
            addNotification(
              `تم قص التسجيل "${trimmedRecording.name}" وحفظه.`,
              "success",
            );
            if (trimmedRecording.isProcessing && trimmedRecording.transcript) {
              runAiProcessing(trimmedRecording);
            }
            setPendingRecording(null);
          }}
        />
      )}

      {/* Auto Allocation Coordinator Modal */}
      {showAutoAllocation && (
        <Modal
          isOpen={showAutoAllocation}
          onClose={() => setShowAutoAllocation(false)}
          title="تنسيق التخصيص التلقائي"
        >
          <AutoAllocationCoordinator
            onAllocationUpdate={(stats) => {
              addNotification(`تم تخصيص ${stats.totalAllocated} مورد تلقائياً.`, "info");
              console.log("Auto Allocation Stats:", stats);
            }}
            onClose={() => setShowAutoAllocation(false)}
          />
        </Modal>
      )}

      {/* Real Content Manager Modal */}
      {showRealContent && (
        <Modal
          isOpen={showRealContent}
          onClose={() => setShowRealContent(false)}
          title="إدارة المحتوى الحقيقي"
        >
          <RealContentManager
            onContentUpdate={(stats) => {
              addNotification(`تم تفعيل ${stats.total} عنصر محتوى حقيقي!`, "success");
              console.log("Real Content Stats:", stats);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default App;
�