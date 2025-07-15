import React, { useState, useEffect, useCallback, FC, ReactNode } from "react";

// =================================================================
// TYPES (الأنواع) - عادة ما تكون في ملف منفصل ولكن تم دمجها هنا
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
  metadata: RecordingSettings;
}

// =================================================================
// HELPER FUNCTIONS (دوال مساعدة)
// =================================================================
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
// SUB-COMPONENTS (المكونات الفرعية) - معرفة داخل ملف App.tsx
// =================================================================

// مكون وهمي لمكتبة التسجيلات
const RecordingsGallery: FC<{ recordings: Recording[], onDelete: (id: string) => void, onUpdateRecording: (rec: Recording) => void, onSelectForPreview: (id: string) => void }> = ({ recordings }) => (
  <div className="bg-[rgba(29,29,31,0.6)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-6">
    <h2 className="text-2xl font-bold mb-6 text-[#FFDE00]">Recordings Library</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recordings.map(rec => (
        <div key={rec.id} className="bg-[rgba(255,255,255,0.05)] p-4 rounded-lg">
          <p className="font-bold truncate">{rec.name}</p>
          <p className="text-sm text-gray-400">{rec.date.toLocaleDateString()}</p>
          <p className="text-sm text-gray-400">{formatDuration(rec.duration)} - {formatFileSize(rec.size)}</p>
        </div>
      ))}
    </div>
  </div>
);

// مكون وهمي للقوالب
const TemplatesPanel: FC = () => (
    <div className="bg-[rgba(29,29,31,0.6)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-6 text-center">
        <h2 className="text-2xl font-bold mb-6 text-[#FFDE00]">Recording Templates</h2>
        <p>Templates feature is coming soon!</p>
    </div>
);

// مكون وهمي لصندوق الأدوات
const ToolboxPanel: FC = () => (
    <div className="bg-[rgba(29,29,31,0.6)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-6 text-center">
        <h2 className="text-2xl font-bold mb-6 text-[#FFDE00]">Smart Toolbox</h2>
        <p>Toolbox feature is coming soon!</p>
    </div>
);

// مكون وهمي لأدوات الذكاء الاصطناعي
const AIPanel: FC<{ recordings: Recording[], onUpdateRecording: (rec: Recording) => void }> = ({ recordings }) => (
    <div className="bg-[rgba(29,29,31,0.6)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-6 text-center">
        <h2 className="text-2xl font-bold mb-6 text-[#FFDE00]">AI Tools</h2>
        <p>AI processing tools will be available here.</p>
    </div>
);

// مكون وهمي للإعدادات
const SettingsModal: FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-[#1D1D1F] border border-[rgba(255,255,255,0.1)] rounded-lg p-8 w-1/2">
            <h2 className="text-2xl font-bold mb-6 text-[#FFDE00]">Settings</h2>
            <p>Settings configuration will be here.</p>
            <button
                onClick={onClose}
                className="mt-6 bg-[#FFDE00] text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
            >
                Close
            </button>
        </div>
    </div>
);

// =================================================================
// MAIN APP COMPONENT (المكون الرئيسي)
// =================================================================
const App = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isRecording, setIsRecording] = useState(false);
  const [cpuUsage, setCpuUsage] = useState(45);
  const [ramUsage, setRamUsage] = useState(62);
  const [fps, setFps] = useState(58);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- MOCK DATA & SETTINGS ---
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
      id: "1",
      name: "Tutorial Recording",
      url: "#",
      blob: new Blob(),
      size: 245 * 1024 * 1024, // 245 MB
      date: new Date("2024-07-14T10:30:00"),
      duration: 754, // 12:34 in seconds
      metadata: settings,
    },
    {
      id: "2",
      name: "Project Meeting Notes",
      url: "#",
      blob: new Blob(),
      size: 1.2 * 1024 * 1024 * 1024, // 1.2 GB
      date: new Date("2024-07-13T15:00:00"),
      duration: 2712, // 45:12 in seconds
      metadata: settings,
    },
    {
      id: "3",
      name: "UI/UX Code Review",
      url: "#",
      blob: new Blob(),
      size: 680 * 1024 * 1024, // 680 MB
      date: new Date("2024-07-12T09:15:00"),
      duration: 1725, // 28:45 in seconds
      metadata: settings,
    },
  ]);

  const aiModels = [
    { name: "Whisper STT", status: "active", usage: "Speech Recognition" },
    { name: "Tesseract OCR", status: "active", usage: "Text Detection" },
    { name: "YOLOv8 Detection", status: "inactive", usage: "Object Tracking" },
  ];

  const quickActions = [
    { id: 1, title: "Screen Capture", icon: "📷" },
    { id: 2, title: "Voice Transcription", icon: "🎤" },
    { id: 3, title: "Smart Editing", icon: "✏️" },
    { id: 4, title: "Batch Processing", icon: "📚" },
  ];

  const insights = [
    { id: 1, title: "Recording Quality", value: "4K Ultra HD", description: "Optimal settings detected" },
    { id: 2, title: "Storage Usage", value: formatFileSize(recordings.reduce((acc, r) => acc + r.size, 0)), description: "Available: 47.6 GB" },
    { id: 3, title: "AI Processing", value: "98.5%", description: "Models running efficiently" },
  ];

  // --- EFFECTS ---
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.min(95, Math.max(15, prev + (Math.random() - 0.5) * 10)));
      setRamUsage(prev => Math.min(95, Math.max(20, prev + (Math.random() - 0.5) * 8)));
      setFps(prev => Math.round(Math.min(60, Math.max(30, prev + (Math.random() - 0.5) * 5))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // --- HANDLERS & ACTIONS ---
  const startRecording = async () => {
    console.log("Starting recording with settings:", settings);
    setIsRecording(true);
  };

  const stopRecording = async () => {
    console.log("Stopping recording...");
    setIsRecording(false);
    // Here you would add the new recording to the list
  };

  // --- RENDER LOGIC ---
  const renderMainContent = () => {
    switch (activeTab) {
      case "recordings":
        return <RecordingsGallery recordings={recordings} onDelete={(id) => setRecordings(prev => prev.filter(r => r.id !== id))} onUpdateRecording={(rec) => setRecordings(prev => prev.map(r => (r.id === rec.id ? rec : r)))} onSelectForPreview={() => {}} />;
      case "templates":
        return <TemplatesPanel />;
      case "toolbox":
        return <ToolboxPanel />;
      case "ai-tools":
        return <AIPanel recordings={recordings} onUpdateRecording={(rec) => setRecordings(prev => prev.map(r => (r.id === rec.id ? rec : r)))} />;
      case "dashboard":
      default:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* System Performance */}
                <div className="bg-[rgba(29,29,31,0.6)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#FFDE00]"><span>System Performance</span></h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* CPU */}
                    <div>
                      <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-400">CPU Usage</span><span className="text-lg font-bold text-white">{cpuUsage}%</span></div>
                      <div className="w-full bg-[rgba(255,255,255,0.1)] rounded-full h-2"><div className="bg-gradient-to-r from-[#FFDE00] to-yellow-400 h-2 rounded-full" style={{ width: `${cpuUsage}%` }}></div></div>
                    </div>
                    {/* RAM */}
                    <div>
                      <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-400">RAM Usage</span><span className="text-lg font-bold text-white">{ramUsage}%</span></div>
                      <div className="w-full bg-[rgba(255,255,255,0.1)] rounded-full h-2"><div className="bg-gradient-to-r from-[#FFDE00] to-yellow-400 h-2 rounded-full" style={{ width: `${ramUsage}%` }}></div></div>
                    </div>
                    {/* FPS */}
                    <div>
                      <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-400">FPS</span><span className="text-lg font-bold text-white">{fps}</span></div>
                      <div className="w-full bg-[rgba(255,255,255,0.1)] rounded-full h-2"><div className="bg-gradient-to-r from-[#FFDE00] to-yellow-400 h-2 rounded-full" style={{ width: `${(fps/60)*100}%` }}></div></div>
                    </div>
                  </div>
                </div>
                {/* Recent Recordings */}
                <div className="bg-[rgba(29,29,31,0.6)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#FFDE00]"><span>Recent Recordings</span></h3>
                  <div className="space-y-3">
                    {recordings.slice(0, 3).map((recording) => (
                      <div key={recording.id} className="flex items-center gap-4 p-3 bg-[rgba(255,255,255,0.05)] rounded-[12px] hover:bg-[rgba(255,255,255,0.15)] transition-colors cursor-pointer">
                        <div className="w-16 h-9 bg-[#1D1D1F] rounded flex items-center justify-center"><svg className="w-6 h-6 text-[#FFDE00]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white truncate">{recording.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>{formatDuration(recording.duration)}</span>
                            <span>{formatFileSize(recording.size)}</span>
                            <span>{recording.date.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                {/* AI Status */}
                <div className="bg-[rgba(29,29,31,0.6)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-6">
                  <h3 className="text-xl font-semibold mb-4 text-[#FFDE00]">AI Models Status</h3>
                  <div className="space-y-3">
                    {aiModels.map((model, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-[rgba(255,255,255,0.05)] rounded-[8px]">
                        <div>
                          <div className="font-medium text-white">{model.name}</div>
                          <div className="text-sm text-gray-400">{model.usage}</div>
                        </div>
                        <div className={`w-2.5 h-2.5 rounded-full ${model.status === "active" ? "bg-green-400 animate-pulse" : "bg-red-500"}`}></div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Quick Actions */}
                <div className="bg-[rgba(29,29,31,0.6)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-6">
                  <h3 className="text-xl font-semibold mb-4 text-[#FFDE00]">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((action) => (
                      <button key={action.id} className="p-3 bg-[rgba(255,255,255,0.05)] rounded-[8px] hover:bg-[rgba(255,255,255,0.15)] transition-colors text-left">
                        <div className="text-lg mb-1">{action.icon}</div>
                        <div className="font-medium text-sm text-white">{action.title}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const NavButton: FC<{ tabName: string, icon: ReactNode, label: string }> = ({ tabName, icon, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center gap-3 p-3 rounded-[4px] transition-all duration-200 w-full max-sm:justify-center ${activeTab === tabName ? "bg-[#242424] border-l-[6px] border-[#FFDE00]" : "hover:bg-[#2a2a2a]"}`}
    >
      <div className={`w-5 h-5 flex-shrink-0 ${activeTab === tabName ? "text-[#FFDE00]" : "text-gray-400"}`}>{icon}</div>
      <span className={`text-[16px] max-sm:hidden ${activeTab === tabName ? "text-white font-bold" : "text-gray-300"}`}>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen w-screen bg-[#0A0A0B] font-[Rajdhani] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-[250px] h-full bg-[#1D1D1F] flex flex-col justify-between p-6 max-lg:w-[200px] max-sm:w-[70px] border-r border-gray-800">
        <div>
          <div className="flex items-center gap-3 max-sm:justify-center mb-12">
            <svg className="w-10 h-8 flex-shrink-0" viewBox="0 0 42 32" fill="none"><g clipPath="url(#clip0)"><path d="M13.5378 1.64102H30.8355L18.1182 20.4906H0.820496L13.5378 1.64102Z" fill="#FFDE00"></path><path d="M14.2953 22.2375L9.36957 29.5385H27.4878L40.2051 10.6889H26.8327L19.0411 22.2375H14.2953Z" fill="white"></path></g><defs><clipPath id="clip0"><rect width="41.0256" height="32" fill="white"></rect></clipPath></defs></svg>
            <div className="text-xl max-sm:hidden"><span className="font-bold">KNOUX</span><span className="font-normal text-gray-300">REC</span></div>
          </div>
          <nav className="flex flex-col gap-4">
            <NavButton tabName="dashboard" label="Dashboard" icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>} />
            <NavButton tabName="recordings" label="Recordings" icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>} />
            <NavButton tabName="templates" label="Templates" icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>} />
            <NavButton tabName="toolbox" label="Toolbox" icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>} />
            <NavButton tabName="ai-tools" label="AI Tools" icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>} />
          </nav>
        </div>
        <div>
           <NavButton tabName="settings" label="Settings" icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>} />
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-[#1D1D1F] border-b border-gray-800">
            <h1 className="text-2xl font-bold capitalize">{activeTab.replace('-', ' ')}</h1>
            <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-6 py-2 font-bold rounded-full flex items-center gap-2 transition-all duration-300 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-[#FFDE00] hover:bg-yellow-400 text-black'}`}
            >
                <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-white animate-pulse' : 'bg-red-500'}`}></div>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
        </header>
        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto bg-grid-pattern">
          {renderMainContent()}
        </main>
      </div>
       {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};

export default App;
