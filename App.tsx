import React, { useState, useRef, useEffect, useCallback } from "react";
import Header from "./components/Header";
import Controls from "./components/Controls";
import Features from "./components/Features";
import Actions from "./components/Actions";
import RecordingsGallery from "./components/RecordingsGallery";
import VideoPreview from "./components/VideoPreview";
import SettingsModal from "./components/SettingsModal";
import NotificationsDropdown from "./components/NotificationsDropdown";
import TrimModal from "./components/TrimModal";
import AIPanel from "./components/AIPanel";
import FileManager from "./components/FileManager";
import BackNavigation from "./components/BackNavigation";
import TemplatesPanel from "./components/TemplatesPanel";
import ToolboxPanel from "./components/ToolboxPanel";
import { useRecorder } from "./hooks/useRecorder";
import { Recording, RecordingSettings, Theme, Notification } from "./types";
import { processTranscript } from "./services/geminiService";
import { generateFileName } from "./utils";

const App = () => {
  const [currentView, setCurrentView] = useState<
    | "main"
    | "recordings"
    | "ai"
    | "settings"
    | "files"
    | "templates"
    | "toolbox"
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

  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [theme, setTheme] = useState<Theme>("dark");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingRecording, setPendingRecording] = useState<Recording | null>(
    null,
  );
  const [galleryPlaybackUrl, setGalleryPlaybackUrl] = useState<string | null>(
    null,
  );

  const addNotification = useCallback(
    (message: string, type: Notification["type"]) => {
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        message,
        type,
      };
      setNotifications((prev) => [newNotification, ...prev].slice(0, 10));
    },
    [],
  );

  const runAiProcessing = useCallback(
    async (recording: Recording) => {
      if (!recording.transcript || recording.transcript.trim().length < 10) {
        addNotification(
          `AI analysis skipped for "${recording.name}" (transcript too short).`,
          "info",
        );
        setRecordings((prev) =>
          prev.map((r) =>
            r.id === recording.id
              ? {
                  ...r,
                  isProcessing: false,
                  summary: "No significant speech detected.",
                }
              : r,
          ),
        );
        return;
      }

      try {
        addNotification(
          `Processing AI analysis for "${recording.name}"...`,
          "info",
        );
        const result = await processTranscript(recording.transcript);
        setRecordings((prev) =>
          prev.map((r) =>
            r.id === recording.id
              ? {
                  ...r,
                  name: result.title,
                  summary: result.summary,
                  keywords: result.keywords,
                  isProcessing: false,
                }
              : r,
          ),
        );
        addNotification(
          `AI analysis complete for "${result.title}"`,
          "success",
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        addNotification(`AI analysis failed: ${errorMessage}`, "error");
        setRecordings((prev) =>
          prev.map((r) =>
            r.id === recording.id
              ? {
                  ...r,
                  isProcessing: false,
                  summary: `AI Analysis Failed: ${errorMessage}`,
                }
              : r,
          ),
        );
      }
    },
    [addNotification],
  );

  const onRecordingComplete = useCallback(
    (blob: Blob, transcript: string) => {
      const newRecording: Recording = {
        id: `rec-${Date.now()}`,
        name: generateFileName(settings.fileNamePattern, "webm"),
        url: URL.createObjectURL(blob),
        blob,
        size: blob.size,
        date: new Date(),
        duration: 0,
        transcript,
        isProcessing: settings.aiProcessingEnabled,
        metadata: settings,
      };

      if (settings.instantTrimEnabled) {
        setPendingRecording(newRecording);
      } else {
        setRecordings((prev) => [newRecording, ...prev]);
        addNotification(`Recording "${newRecording.name}" saved.`, "success");
        if (newRecording.isProcessing) {
          runAiProcessing(newRecording);
        }
      }
    },
    [settings, addNotification, runAiProcessing],
  );

  const recorder = useRecorder(settings, onRecordingComplete, addNotification);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  const handleSettingsChange = (newSettings: RecordingSettings) => {
    setSettings(newSettings);
  };

  const onSettingsSave = (newSettings: RecordingSettings) => {
    handleSettingsChange(newSettings);
    addNotification("Settings saved!", "success");
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
  };

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

  // Hotkey Effect
  useEffect(() => {
    const checkHotkey = (e: KeyboardEvent, hotkey: string): boolean => {
      if (!hotkey) return false;
      const keys = hotkey
        .toLowerCase()
        .split("+")
        .map((k) => k.trim());
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
        recorder.recordingState === "IDLE"
          ? recorder.startRecording()
          : recorder.stopRecording();
      } else if (checkHotkey(e, settings.hotkeys.pauseResume)) {
        e.preventDefault();
        if (recorder.recordingState === "RECORDING") recorder.pauseRecording();
        else if (recorder.recordingState === "PAUSED")
          recorder.resumeRecording();
      } else if (checkHotkey(e, settings.hotkeys.screenshot)) {
        e.preventDefault();
        if (recorder.recordingState !== "IDLE") recorder.takeScreenshot();
      }
    };

    window.addEventListener("keydown", handleHotkeys);
    return () => window.removeEventListener("keydown", handleHotkeys);
  }, [settings.hotkeys, recorder, isSettingsOpen, pendingRecording]);

  const handleStartRecording = () => {
    setGalleryPlaybackUrl(null);
    recorder.startRecording();
  };

  const renderMainView = () => (
    <main className="flex-grow p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-screen-2xl w-full mx-auto z-10">
      <div className="flex flex-col gap-6">
        <Controls
          settings={settings}
          onSettingsChange={handleSettingsChange}
          isRecording={recorder.recordingState !== "IDLE"}
          isGameModeActive={settings.gameMode}
        />
        <Features
          settings={settings}
          onSettingsChange={handleSettingsChange}
          isRecording={recorder.recordingState !== "IDLE"}
        />
        <Actions
          recordingState={recorder.recordingState}
          onStart={handleStartRecording}
          onStop={recorder.stopRecording}
          onPause={recorder.pauseRecording}
          onResume={recorder.resumeRecording}
          onScreenshot={recorder.takeScreenshot}
          disabled={recorder.recordingState === "STARTING"}
          timer={recorder.timer}
          fps={recorder.fps}
          scheduleStatus={recorder.scheduleStatus}
          hotkeys={settings.hotkeys}
        />
      </div>
      <div className="flex flex-col gap-6">
        <VideoPreview
          previewSource={recorder.previewSource || galleryPlaybackUrl}
          isRecording={recorder.recordingState !== "IDLE"}
          countdown={recorder.countdown}
          pipCameraStream={recorder.pipCameraStream}
          settings={settings}
        />

        {/* Quick Access Cards */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setCurrentView("recordings")}
            className="glass-card interactive p-6 rounded-2xl text-center hover:bg-knoux-purple/20 transition-all duration-300"
          >
            <div className="text-3xl mb-2">🎬</div>
            <div className="font-orbitron font-bold text-knoux-purple">
              Recordings
            </div>
            <div className="text-sm text-white/70">
              {recordings.length} files
            </div>
          </button>

          <button
            onClick={() => setCurrentView("ai")}
            className="glass-card interactive p-6 rounded-2xl text-center hover:bg-knoux-neon/20 transition-all duration-300"
          >
            <div className="text-3xl mb-2">🧠</div>
            <div className="font-orbitron font-bold text-knoux-neon">
              AI Tools
            </div>
            <div className="text-sm text-white/70">Offline AI</div>
          </button>
        </div>
      </div>
    </main>
  );

  const renderContent = () => {
    switch (currentView) {
      case "recordings":
        return (
          <div className="flex-grow p-4 md:p-6 max-w-screen-2xl w-full mx-auto z-10">
            <RecordingsGallery
              recordings={recordings}
              onDelete={handleDeleteRecording}
              onUpdateRecording={handleUpdateRecording}
              onSelectForPreview={handleSelectForPreview}
            />
          </div>
        );
      case "ai":
        return (
          <div className="flex-grow p-4 md:p-6 max-w-screen-2xl w-full mx-auto z-10">
            <AIPanel
              recordings={recordings}
              onUpdateRecording={handleUpdateRecording}
            />
          </div>
        );
      case "files":
        return (
          <div className="flex-grow p-4 md:p-6 max-w-screen-2xl w-full mx-auto z-10">
            <FileManager
              recordings={recordings}
              onDeleteRecording={handleDeleteRecording}
            />
          </div>
        );
      default:
        return renderMainView();
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Navigation */}
      {currentView !== "main" && (
        <BackNavigation
          currentView={currentView}
          onBack={() => setCurrentView("main")}
          onNavigate={setCurrentView}
        />
      )}

      {/* Header */}
      <div className="relative z-20">
        <Header
          isRecording={recorder.recordingState !== "IDLE"}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onNotificationsClick={() => setIsNotificationsOpen((p) => !p)}
          notificationCount={notifications.length}
          currentView={currentView}
          onViewChange={setCurrentView}
        />
        <NotificationsDropdown
          isOpen={isNotificationsOpen}
          notifications={notifications}
          onClose={() => setIsNotificationsOpen(false)}
          onDismiss={(id) =>
            setNotifications((p) => p.filter((n) => n.id !== id))
          }
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        settings={settings}
        onSave={onSettingsSave}
      />

      {/* Trim Modal */}
      {pendingRecording && (
        <TrimModal
          recording={pendingRecording}
          onSave={(rec, trimData) => {
            addNotification("Trimming is a demo feature.", "info");
            setRecordings((prev) => [{ ...rec, trim: trimData }, ...prev]);
            setPendingRecording(null);
          }}
          onSaveFull={(rec) => {
            setRecordings((prev) => [rec, ...prev]);
            addNotification(`Recording "${rec.name}" saved.`, "success");
            if (rec.isProcessing) runAiProcessing(rec);
            setPendingRecording(null);
          }}
          onClose={() => setPendingRecording(null)}
        />
      )}

      {/* Main Content */}
      {renderContent()}
    </div>
  );
};

export default App;
