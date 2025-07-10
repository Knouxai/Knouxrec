import { useState, useEffect, useCallback } from "react";
import { useRecorder } from "./hooks/useRecorder";
import { Recording, RecordingSettings, Theme, Notification } from "./types";
import { offlineAI } from "./services/offlineAI";
import { audioProcessor } from "./services/audioProcessor";
import { feedbackService } from "./services/feedbackService";
import { generateFileName } from "./utils";

// Import panels for different views
import RecordingsGallery from "./components/RecordingsGallery";
import TemplatesPanel from "./components/TemplatesPanel";
import ToolboxPanel from "./components/ToolboxPanel";
import AIPanel from "./components/AIPanel";
import FileManager from "./components/FileManager";
import SettingsModal from "./components/SettingsModal";

const App = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isRecording, setIsRecording] = useState(false);
  const [cpuUsage, setCpuUsage] = useState(45);
  const [ramUsage, setRamUsage] = useState(62);
  const [fps, setFps] = useState(60);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [systemAudioEnabled, setSystemAudioEnabled] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const [settings, setSettings] = useState<RecordingSettings>({
    recordScreen: true,
    recordMic: micEnabled,
    recordSystemAudio: systemAudioEnabled,
    recordCamera: cameraEnabled,
    videoQuality: "1080p",
    fps: 60,
    gameMode: false,
    aiProcessingEnabled: aiEnabled,
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
      id: "1",
      name: "Tutorial Recording",
      url: "#",
      blob: new Blob(),
      size: 245 * 1024 * 1024, // 245 MB
      date: new Date("2024-01-15"),
      duration: 754, // 12:34 in seconds
      metadata: settings,
    },
    {
      id: "2",
      name: "Meeting Notes",
      url: "#",
      blob: new Blob(),
      size: 1.2 * 1024 * 1024 * 1024, // 1.2 GB
      date: new Date("2024-01-14"),
      duration: 2712, // 45:12 in seconds
      metadata: settings,
    },
    {
      id: "3",
      name: "Code Review",
      url: "#",
      blob: new Blob(),
      size: 680 * 1024 * 1024, // 680 MB
      date: new Date("2024-01-13"),
      duration: 1725, // 28:45 in seconds
      metadata: settings,
    },
  ]);

  const [theme, setTheme] = useState<Theme>("dark");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const aiModels = [
    { name: "Whisper STT", status: "active", usage: "Speech Recognition" },
    { name: "Tesseract OCR", status: "active", usage: "Text Detection" },
    { name: "YOLO Detection", status: "inactive", usage: "Object Tracking" },
  ];

  const quickActions = [
    {
      id: 1,
      title: "Screen Capture",
      description: "Instant screenshot with AI enhancement",
      icon: "📷",
      color: "#FFDE00",
    },
    {
      id: 2,
      title: "Voice Transcription",
      description: "Real-time speech to text conversion",
      icon: "🎤",
      color: "#00FF88",
    },
    {
      id: 3,
      title: "Smart Editing",
      description: "AI-powered video editing tools",
      icon: "✏️",
      color: "#FF6B6B",
    },
    {
      id: 4,
      title: "Batch Processing",
      description: "Process multiple recordings simultaneously",
      icon: "📚",
      color: "#4ECDC4",
    },
  ];

  const insights = [
    {
      id: 1,
      title: "Recording Quality",
      value: "4K Ultra HD",
      trend: "up",
      description: "Optimal settings detected",
    },
    {
      id: 2,
      title: "Storage Usage",
      value: "2.4 GB",
      trend: "stable",
      description: "Available: 47.6 GB",
    },
    {
      id: 3,
      title: "AI Processing",
      value: "98.5%",
      trend: "up",
      description: "Models running efficiently",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "Recording Started",
      time: "2 minutes ago",
      type: "record",
    },
    { id: 2, action: "AI Model Updated", time: "15 minutes ago", type: "ai" },
    { id: 3, action: "Export Completed", time: "1 hour ago", type: "export" },
  ];

  const { state: recorderState, actions: recorderActions } = useRecorder();

  // Update performance metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(
        Math.min(95, Math.max(15, cpuUsage + (Math.random() - 0.5) * 10)),
      );
      setRamUsage(
        Math.min(95, Math.max(20, ramUsage + (Math.random() - 0.5) * 8)),
      );
      setFps(Math.min(60, Math.max(30, fps + (Math.random() - 0.5) * 5)));
    }, 2000);

    return () => clearInterval(interval);
  }, [cpuUsage, ramUsage, fps]);

  const startRecording = async () => {
    setIsRecording(true);
    try {
      await recorderActions.startRecording();
    } catch (error) {
      console.error("Failed to start recording:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    try {
      await recorderActions.stopRecording();
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
    }
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const getTabTitle = (): string => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard";
      case "recordings":
        return "Recordings Library";
      case "templates":
        return "Recording Templates";
      case "toolbox":
        return "Smart Toolbox";
      case "ai-tools":
        return "AI Tools";
      case "settings":
        return "Settings";
      default:
        return "Dashboard";
    }
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case "recordings":
        return (
          <RecordingsGallery
            recordings={recordings}
            onDelete={(id) =>
              setRecordings((prev) => prev.filter((r) => r.id !== id))
            }
            onUpdateRecording={(recording) =>
              setRecordings((prev) =>
                prev.map((r) => (r.id === recording.id ? recording : r)),
              )
            }
            onSelectForPreview={() => {}}
          />
        );
      case "templates":
        return <TemplatesPanel />;
      case "toolbox":
        return <ToolboxPanel />;
      case "ai-tools":
        return (
          <AIPanel
            recordings={recordings}
            onUpdateRecording={(recording) =>
              setRecordings((prev) =>
                prev.map((r) => (r.id === recording.id ? recording : r)),
              )
            }
          />
        );
      default:
        return (
          <div className="space-y-8">
            {/* Performance and Recent Recordings Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* System Performance */}
                <div
                  className="bg-[rgba(29,29,31,0.6)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-6 transition-all duration-300"
                  onMouseEnter={() => setHoveredCard("performance")}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    transform:
                      hoveredCard === "performance"
                        ? "translateY(-4px)"
                        : "translateY(0px)",
                    boxShadow:
                      hoveredCard === "performance"
                        ? "0 20px 40px rgba(255,222,0,0.1)"
                        : "0 0 0 rgba(0,0,0,0)",
                  }}
                >
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[#FFDE00]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      ></path>
                    </svg>
                    <span>System Performance</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {/* CPU Usage */}
                    <div
                      className="bg-[rgba(255,255,255,0.05)] rounded-[12px] p-4 transition-all duration-300"
                      onMouseEnter={() => setHoveredCard("cpu")}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        transform:
                          hoveredCard === "cpu"
                            ? "translateY(-2px)"
                            : "translateY(0px)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[rgba(255,255,255,0.7)]">
                          CPU Usage
                        </span>
                        <span className="text-lg font-bold text-[#FFDE00]">
                          {cpuUsage}%
                        </span>
                      </div>
                      <div className="w-full bg-[rgba(255,255,255,0.1)] rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#FFDE00] to-[#FFE033] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${cpuUsage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* RAM Usage */}
                    <div
                      className="bg-[rgba(255,255,255,0.05)] rounded-[12px] p-4 transition-all duration-300"
                      onMouseEnter={() => setHoveredCard("ram")}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        transform:
                          hoveredCard === "ram"
                            ? "translateY(-2px)"
                            : "translateY(0px)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[rgba(255,255,255,0.7)]">
                          RAM Usage
                        </span>
                        <span className="text-lg font-bold text-[#FFDE00]">
                          {ramUsage}%
                        </span>
                      </div>
                      <div className="w-full bg-[rgba(255,255,255,0.1)] rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#FFDE00] to-[#FFE033] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${ramUsage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* FPS */}
                    <div
                      className="bg-[rgba(255,255,255,0.05)] rounded-[12px] p-4 transition-all duration-300"
                      onMouseEnter={() => setHoveredCard("fps")}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        transform:
                          hoveredCard === "fps"
                            ? "translateY(-2px)"
                            : "translateY(0px)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[rgba(255,255,255,0.7)]">
                          FPS
                        </span>
                        <span className="text-lg font-bold text-[#FFDE00]">
                          {fps}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-4 bg-[#FFDE00] rounded-full animate-pulse"></div>
                        <div
                          className="w-1 h-3 bg-[#FFDE00] rounded-full animate-pulse"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-1 h-5 bg-[#FFDE00] rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-1 h-2 bg-[#FFDE00] rounded-full animate-pulse"
                          style={{ animationDelay: "0.3s" }}
                        ></div>
                        <div
                          className="w-1 h-4 bg-[#FFDE00] rounded-full animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Recordings */}
                <div
                  className="bg-[rgba(29,29,31,0.6)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-6 transition-all duration-300"
                  onMouseEnter={() => setHoveredCard("recordings")}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    transform:
                      hoveredCard === "recordings"
                        ? "translateY(-4px)"
                        : "translateY(0px)",
                    boxShadow:
                      hoveredCard === "recordings"
                        ? "0 20px 40px rgba(255,222,0,0.1)"
                        : "0 0 0 rgba(0,0,0,0)",
                  }}
                >
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[#FFDE00]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <span>Recent Recordings</span>
                  </h3>
                  <div className="space-y-3">
                    {recordings.slice(0, 3).map((recording) => (
                      <div
                        key={recording.id}
                        className="flex items-center gap-4 p-3 bg-[rgba(255,255,255,0.05)] rounded-[12px] hover:bg-[rgba(255,255,255,0.1)] transition-all duration-200"
                      >
                        <div className="w-16 h-9 bg-[#1D1D1F] rounded flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-[#FFDE00]"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white truncate">
                            {recording.name}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-[rgba(255,255,255,0.7)]">
                            <span>{formatDuration(recording.duration)}</span>
                            <span>{formatFileSize(recording.size)}</span>
                            <span>{recording.date.toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded-[8px] transition-all duration-200">
                          <svg
                            className="w-4 h-4 text-[rgba(255,255,255,0.7)]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right sidebar with AI Status, Insights, etc. */}
              <div className="space-y-6">
                {/* AI Status */}
                <div
                  className="bg-[rgba(29,29,31,0.6)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-6 transition-all duration-300"
                  onMouseEnter={() => setHoveredCard("ai-status")}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    transform:
                      hoveredCard === "ai-status"
                        ? "translateY(-4px)"
                        : "translateY(0px)",
                    boxShadow:
                      hoveredCard === "ai-status"
                        ? "0 20px 40px rgba(255,222,0,0.1)"
                        : "0 0 0 rgba(0,0,0,0)",
                  }}
                >
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[#FFDE00]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      ></path>
                    </svg>
                    <span>AI Models Status</span>
                  </h3>
                  <div className="space-y-3">
                    {aiModels.map((model, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-[rgba(255,255,255,0.05)] rounded-[8px]"
                      >
                        <div>
                          <div className="font-medium text-white">
                            {model.name}
                          </div>
                          <div className="text-sm text-[rgba(255,255,255,0.7)]">
                            {model.usage}
                          </div>
                        </div>
                        <div
                          className={`w-2 h-2 rounded-full ${model.status === "active" ? "bg-green-400" : "bg-red-400"}`}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[rgba(29,29,31,0.6)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-6">
                  <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((action) => (
                      <button
                        key={action.id}
                        className="p-3 bg-[rgba(255,255,255,0.05)] rounded-[8px] hover:bg-[rgba(255,255,255,0.1)] transition-all duration-200 text-left"
                      >
                        <div className="text-lg mb-1">{action.icon}</div>
                        <div className="font-medium text-sm text-white">
                          {action.title}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Insights */}
                <div className="bg-[rgba(29,29,31,0.6)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-6">
                  <h3 className="text-xl font-semibold mb-4">Insights</h3>
                  <div className="space-y-3">
                    {insights.map((insight) => (
                      <div
                        key={insight.id}
                        className="p-3 bg-[rgba(255,255,255,0.05)] rounded-[8px]"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white">
                            {insight.title}
                          </span>
                          <span className="text-[#FFDE00] font-bold">
                            {insight.value}
                          </span>
                        </div>
                        <div className="text-xs text-[rgba(255,255,255,0.7)]">
                          {insight.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#0A0A0B] font-[Rajdhani] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-[250px] h-full bg-[#1D1D1F] flex flex-col justify-between p-6 max-lg:w-[200px] max-sm:w-[60px]">
        <div className="flex flex-col gap-12">
          {/* Logo */}
          <div className="flex items-center gap-3 max-sm:justify-center">
            <svg
              className="w-10 h-8 flex-shrink-0"
              viewBox="0 0 42 32"
              fill="none"
            >
              <g clipPath="url(#clip0)">
                <path
                  d="M13.5378 1.64102H30.8355L18.1182 20.4906H0.820496L13.5378 1.64102Z"
                  fill="#FFDE00"
                ></path>
                <path
                  d="M14.2953 22.2375L9.36957 29.5385H27.4878L40.2051 10.6889H26.8327L19.0411 22.2375H14.2953Z"
                  fill="white"
                ></path>
              </g>
              <defs>
                <clipPath id="clip0">
                  <rect width="41.0256" height="32" fill="white"></rect>
                </clipPath>
              </defs>
            </svg>
            <div className="text-xl max-sm:hidden">
              <span className="font-bold">KNOUX</span>
              <span className="font-normal">REC</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-4">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-3 p-3 rounded-[4px] transition-all duration-200 max-sm:justify-center ${
                activeTab === "dashboard"
                  ? "bg-[#242424] border-l-[6px] border-[#FFDE00]"
                  : ""
              }`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                ></path>
              </svg>
              <span
                className={`text-[16px] max-sm:hidden ${activeTab === "dashboard" ? "text-white" : "text-[rgba(255,255,255,0.8)]"}`}
              >
                Dashboard
              </span>
            </button>

            <button
              onClick={() => setActiveTab("recordings")}
              className={`flex items-center gap-3 p-3 rounded-[4px] transition-all duration-200 max-sm:justify-center ${
                activeTab === "recordings"
                  ? "bg-[#242424] border-l-[6px] border-[#FFDE00]"
                  : ""
              }`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                ></path>
              </svg>
              <span
                className={`text-[16px] max-sm:hidden ${activeTab === "recordings" ? "text-white" : "text-[rgba(255,255,255,0.8)]"}`}
              >
                Recordings
              </span>
            </button>

            <button
              onClick={() => setActiveTab("templates")}
              className={`flex items-center gap-3 p-3 rounded-[4px] transition-all duration-200 max-sm:justify-center ${
                activeTab === "templates"
                  ? "bg-[#242424] border-l-[6px] border-[#FFDE00]"
                  : ""
              }`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                ></path>
              </svg>
              <span
                className={`text-[16px] max-sm:hidden ${activeTab === "templates" ? "text-white" : "text-[rgba(255,255,255,0.8)]"}`}
              >
                Templates
              </span>
            </button>

            <button
              onClick={() => setActiveTab("toolbox")}
              className={`flex items-center gap-3 p-3 rounded-[4px] transition-all duration-200 max-sm:justify-center ${
                activeTab === "toolbox"
                  ? "bg-[#242424] border-l-[6px] border-[#FFDE00]"
                  : ""
              }`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
              <span
                className={`text-[16px] max-sm:hidden ${activeTab === "toolbox" ? "text-white" : "text-[rgba(255,255,255,0.8)]"}`}
              >
                Toolbox
              </span>
            </button>

            <button
              onClick={() => setActiveTab("ai-tools")}
              className={`flex items-center gap-3 p-3 rounded-[4px] transition-all duration-200 max-sm:justify-center ${
                activeTab === "ai-tools"
                  ? "bg-[#242424] border-l-[6px] border-[#FFDE00]"
                  : ""
              }`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                ></path>
              </svg>
              <span
                className={`text-[16px] max-sm:hidden ${activeTab === "ai-tools" ? "text-white" : "text-[rgba(255,255,255,0.8)]"}`}
              >
                AI Tools
              </span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-3 p-3 rounded-[4px] transition-all duration-200 max-sm:justify-center ${
                activeTab === "settings"
                  ? "bg-[#242424] border-l-[6px] border-[#FFDE00]"
                  : ""
              }`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                ></path>
              </svg>
              <span
                className={`text-[16px] max-sm:hidden ${activeTab === "settings" ? "text-white" : "text-[rgba(255,255,255,0.8)]"}`}
              >
                Settings
              </span>
            </button>
          </nav>
        </div>

        {/* Logout Button */}
        <button className="flex items-center gap-3 p-3 rounded-[4px] transition-all duration-200 max-sm:justify-center">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            ></path>
          </svg>
          <span className="text-[16px] text-[rgba(255,255,255,0.8)] max-sm:hidden">
            Logout
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-[80px] bg-[rgba(29,29,31,0.8)] backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between px-8 max-sm:px-4">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold max-sm:text-xl">
              {getTabTitle()}
            </h1>
            <div className="flex items-center gap-4 max-sm:hidden">
              <div className="flex items-center gap-2 px-3 py-1 bg-[rgba(255,222,0,0.1)] border border-[rgba(255,222,0,0.3)] rounded-full">
                <div className="w-2 h-2 bg-[#FFDE00] rounded-full animate-pulse"></div>
                <span className="text-sm text-[#FFDE00]">System Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Controls */}
            <div className="flex items-center gap-2 max-sm:hidden">
              <button
                onClick={() => setMicEnabled(!micEnabled)}
                className={`p-2 rounded-[8px] border transition-all duration-200 ${
                  micEnabled
                    ? "bg-[rgba(255,222,0,0.2)] border-[#FFDE00] text-[#FFDE00]"
                    : "bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.2)] text-[rgba(255,255,255,0.6)]"
                }`}
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
                    strokeWidth="2"
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  ></path>
                </svg>
              </button>

              <button
                onClick={() => setCameraEnabled(!cameraEnabled)}
                className={`p-2 rounded-[8px] border transition-all duration-200 ${
                  cameraEnabled
                    ? "bg-[rgba(255,222,0,0.2)] border-[#FFDE00] text-[#FFDE00]"
                    : "bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.2)] text-[rgba(255,255,255,0.6)]"
                }`}
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
                    strokeWidth="2"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  ></path>
                </svg>
              </button>

              <button
                onClick={() => setSystemAudioEnabled(!systemAudioEnabled)}
                className={`p-2 rounded-[8px] border transition-all duration-200 ${
                  systemAudioEnabled
                    ? "bg-[rgba(255,222,0,0.2)] border-[#FFDE00] text-[#FFDE00]"
                    : "bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.2)] text-[rgba(255,255,255,0.6)]"
                }`}
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
                    strokeWidth="2"
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  ></path>
                </svg>
              </button>
            </div>

            {/* Record Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-6 py-3 rounded-[12px] border-2 font-semibold transition-all duration-300 transform active:scale-95 max-sm:px-4 max-sm:py-2 ${
                isRecording
                  ? "bg-[#FF4444] border-[#FF6666] shadow-[0_0_20px_rgba(255,68,68,0.3)] text-white"
                  : "bg-[#FFDE00] border-[#FFE033] shadow-[0_0_20px_rgba(255,222,0,0.3)] text-black"
              }`}
            >
              <span>{isRecording ? "Stop Recording" : "Start Recording"}</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8 max-sm:p-4">
          {renderMainContent()}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        settings={settings}
        onSave={(newSettings) => {
          setSettings(newSettings);
          setIsSettingsOpen(false);
        }}
      />
    </div>
  );
};

export default App;
