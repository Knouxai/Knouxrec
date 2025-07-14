import React, { useState, useRef, useEffect, useCallback } from "react";
import LuxuryHeader from "./LuxuryHeader";
import Controls from "./Controls";
import Features from "./Features";
import Actions from "./Actions";
import RecordingsGallery from "./RecordingsGallery";
import VideoPreview from "./VideoPreview";
import EnhancedSettingsModal from "./EnhancedSettingsModal";
import EnhancedNavigation from "./EnhancedNavigation";
import NotificationsDropdown from "./NotificationsDropdown";
import TrimModal from "./TrimModal";
import AIPanel from "./AIPanel";
import FileManager from "./FileManager";
import BackNavigation from "./BackNavigation";
import TemplatesPanel from "./TemplatesPanel";
import ToolboxPanel from "./ToolboxPanel";
import OfflineAIToolsPanel from "./OfflineAIToolsPanel";
import VisualPatchLabPanel from "./VisualPatchLabPanel";
import AIBodyEditorPanel from "./AIBodyEditorPanel";
import ElysianCanvas from "../elysian-canvas/ElysianCanvas";
import AdvancedProgressIndicator from "./AdvancedProgressIndicator";
import AdvancedModelSettings from "./AdvancedModelSettings";
import MemoryMonitor from "./MemoryMonitor";
import {
  AIToolsIcon,
  VisualPatchIcon,
  TemplatesIcon,
  RecordingsIcon,
  FilesIcon,
  ToolboxIcon,
  FloatingParticles,
} from "./LuxuryIcons";
import { LuxuryBackgroundEffects } from "./LuxuryEffects";
import UIEnhancer from "./UIEnhancer";
import { useRecorder } from "../hooks/useRecorder";
import { Recording, RecordingSettings, Theme, Notification } from "../types";
import { offlineAI } from "../services/offlineAI";
import { videoProcessor } from "../services/videoProcessor";
import { audioProcessor } from "../services/audioProcessor";
import { imageProcessor } from "../services/imageProcessor";
import { feedbackService } from "../services/feedbackService";
import { systemTester } from "../services/systemTester";
import LanguageService from "../services/languageService";
import {
  enhancedModelManager,
  LoadingProgress,
  MemoryStatus,
} from "../services/enhancedModelManager";
import {
  enhancedErrorHandler,
  ErrorReport,
} from "../services/enhancedErrorHandler";
import { generateFileName } from "../utils";

const LuxuryApp = () => {
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
    | "elysian"
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
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress[]>([]);
  const [memoryStatus, setMemoryStatus] = useState<MemoryStatus | null>(null);
  const [errorReports, setErrorReports] = useState<ErrorReport[]>([]);

  // Enhanced state
  const [currentLanguage, setCurrentLanguage] = useState("ar");
  const [compactMode, setCompactMode] = useState(false);
  const [showEnhancedNavigation, setShowEnhancedNavigation] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([
    "main",
  ]);

  const languageService = useRef(LanguageService.getInstance());

  const addNotification = useCallback(
    (message: string, type: Notification["type"]) => {
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        message,
        type,
      };
      setNotifications((prev) => [newNotification, ...prev].slice(0, 10));

      switch (type) {
        case "success":
          feedbackService.success(message);
          break;
        case "error":
          feedbackService.error(message);
          break;
        case "warning":
          feedbackService.warning(message);
          break;
        default:
          feedbackService.info(message);
      }
    },
    [],
  );

  const runAiProcessing = useCallback(
    async (recording: Recording) => {
      if (!recording.transcript || recording.transcript.trim().length < 10) {
        addNotification(
          `تم تخطي التحليل الذكي لـ "${recording.name}" (النص قصير جداً).`,
          "info",
        );
        setRecordings((prev) =>
          prev.map((r) =>
            r.id === recording.id
              ? {
                  ...r,
                  isProcessing: false,
                  summary: "لم يتم اكتشاف كلام واضح.",
                }
              : r,
          ),
        );
        return;
      }

      try {
        const loadingId = feedbackService.loading(
          `جار المعالجة بالذكاء الاصطناعي لـ "${recording.name}"...`,
          0,
        );
        addNotification(
          `جار المعالجة بالذكاء الاصطناعي ��ـ "${recording.name}"...`,
          "info",
        );

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
              addNotification(
                `اكتمل التحليل الذكي لـ "${recording.name}"`,
                "success",
              );
            } else if (task.status === "error") {
              setRecordings((prev) =>
                prev.map((r) =>
                  r.id === recording.id
                    ? {
                        ...r,
                        isProcessing: false,
                        summary: `فشل التحليل الذكي: ${task.error}`,
                      }
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
        const errorMessage =
          err instanceof Error ? err.message : "خطأ غير معروف";
        addNotification(`فشل التحليل الذكي: ${errorMessage}`, "error");
        setRecordings((prev) =>
          prev.map((r) =>
            r.id === recording.id
              ? {
                  ...r,
                  isProcessing: false,
                  summary: `فشل التحليل الذكي: ${errorMessage}`,
                }
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
        duration: 0,
        transcript,
        isProcessing: settings.aiProcessingEnabled,
        metadata: settings,
      };

      if (settings.instantTrimEnabled) {
        setPendingRecording(newRecording);
      } else {
        setRecordings((prev) => [newRecording, ...prev]);
        addNotification(
          languageService.current.translateWithParams("recordingSaved", {
            name: newRecording.name,
          }),
          "success",
        );
        feedbackService.success(
          languageService.current.translate("recordingSaved") + " 🎬",
          {
            actions: [
              {
                label: languageService.current.translate("view"),
                action: () => setCurrentView("recordings"),
                style: "primary",
              },
            ],
          },
        );

        if (newRecording.isProcessing && transcript) {
          runAiProcessing(newRecording);
        }

        if (!transcript && settings.aiProcessingEnabled) {
          try {
            const audioLoadingId = feedbackService.loading(
              languageService.current.translate("extractingAudio"),
              0,
            );
            addNotification(
              languageService.current.translate("extractingAudio"),
              "info",
            );
            const audioBlob = await audioProcessor.extractAudioFromVideo(blob);
            const extractedText = await audioProcessor.speechToText(
              audioBlob,
              "ar-SA",
            );

            const updatedRecording = {
              ...newRecording,
              transcript: extractedText,
            };
            setRecordings((prev) =>
              prev.map((r) =>
                r.id === newRecording.id ? updatedRecording : r,
              ),
            );

            feedbackService.dismiss(audioLoadingId);
            if (extractedText.trim().length > 10) {
              runAiProcessing(updatedRecording);
            } else {
              feedbackService.warning(
                languageService.current.translate("noTextDetected"),
              );
            }
          } catch (error) {
            console.warn("فشل في استخراج النص من الصوت:", error);
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

  // Language initialization
  useEffect(() => {
    const handleLanguageChange = (newLanguage: string) => {
      setCurrentLanguage(newLanguage);
    };

    languageService.current.onLanguageChange(handleLanguageChange);
    setCurrentLanguage(languageService.current.getCurrentLanguage());

    return () => {
      languageService.current.offLanguageChange(handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    enhancedErrorHandler.onError("app", (report) => {
      setErrorReports((prev) => [report, ...prev].slice(0, 10));
      addNotification(
        `خطأ في النموذج ${report.context.modelName}: ${report.solution.title}`,
        "error",
      );
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
      const usagePercentage =
        (status.totalUsed / (status.totalUsed + status.available)) * 100;

      if (usagePercentage > 90) {
        addNotification(
          "تحذير: الذاكرة ممتلئة تقريباً! قد يتم إلغاء تحميل بعض النماذج تلقائياً.",
          "warning",
        );
      } else if (usagePercentage > 80) {
        addNotification(
          "تحذير: استخدام الذاكرة مرتفع. يُنصح بتحسين الاستخدام.",
          "warning",
        );
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
          setLoadingProgress((prev) =>
            prev.filter((p) => p.modelName !== modelName),
          );
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
    addNotification(
      languageService.current.translate("settingsSaved"),
      "success",
    );
    feedbackService.success(
      languageService.current.translate("settingsSaved") + " ⚙️",
    );
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
    addNotification(
      languageService.current.translate("recordingDeleted"),
      "info",
    );
    feedbackService.warning(
      languageService.current.translate("recordingDeleted"),
    );
  };

  const handleScreenshot = useCallback(async () => {
    try {
      const loadingId = feedbackService.loading(
        languageService.current.translate("takingScreenshot"),
        0,
      );
      const result = await recorderActions.takeScreenshot();
      feedbackService.dismiss(loadingId);

      if (result.success) {
        feedbackService.success(
          languageService.current.translate("screenshotTaken") + " 📸",
          {
            message: `الملف: ${result.filename}`,
            actions: [
              {
                label: languageService.current.translate("open"),
                action: () => {
                  if (result.dataUrl) {
                    window.open(result.dataUrl, "_blank");
                  }
                },
                style: "primary",
              },
            ],
          },
        );
      } else {
        feedbackService.error(
          languageService.current.translateWithParams("screenshotFailed", {
            error: result.error || "Unknown error",
          }),
        );
      }
    } catch (error) {
      feedbackService.error(
        languageService.current.translateWithParams("screenshotError", {
          error: error instanceof Error ? error.message : "خطأ غير معروف",
        }),
      );
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

  // Enhanced navigation functions
  const handleViewChange = useCallback(
    (view: string) => {
      setNavigationHistory((prev) => [...prev, currentView]);
      setCurrentView(view as any);
    },
    [currentView],
  );

  const handleBack = useCallback(() => {
    if (navigationHistory.length > 1) {
      const prevHistory = [...navigationHistory];
      const previousView = prevHistory.pop();
      setNavigationHistory(prevHistory);
      setCurrentView(previousView as any);
    } else {
      setCurrentView("main");
    }
  }, [navigationHistory]);

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
        !recorderState.isRecording
          ? recorderActions.startRecording()
          : recorderActions.stopRecording();
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
  }, [
    recorderState.recordingBlob,
    recorderState.isRecording,
    onRecordingComplete,
  ]);

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
            onClick={() => handleViewChange("templates")}
            className="luxury-glass-card interactive-hover p-6 rounded-2xl text-center group"
          >
            <div className="mb-3">
              <TemplatesIcon size={48} className="mx-auto" />
            </div>
            <div className="luxury-text font-bold text-lg mb-1">
              {languageService.current.translate("templates")}
            </div>
            <div className="luxury-text text-sm opacity-70">
              Video Templates
            </div>
          </button>

          <button
            onClick={() => handleViewChange("toolbox")}
            className="luxury-glass-card interactive-hover p-6 rounded-2xl text-center group"
          >
            <div className="mb-3">
              <ToolboxIcon size={48} className="mx-auto" />
            </div>
            <div className="luxury-text font-bold text-lg mb-1">
              {languageService.current.translate("toolbox")}
            </div>
            <div className="luxury-text text-sm opacity-70">AI Toolbox</div>
          </button>

          <button
            onClick={() => handleViewChange("offline-tools")}
            className="luxury-glass-card interactive-hover p-6 rounded-2xl text-center group hologram-effect"
          >
            <div className="mb-3">
              <AIToolsIcon size={48} className="mx-auto" />
            </div>
            <div className="luxury-text font-bold text-lg mb-1 neon-glow">
              {languageService.current.translate("offlineTools")}
            </div>
            <div className="luxury-text text-sm opacity-70">38 أداة ذكية</div>
          </button>

          <button
            onClick={() => handleViewChange("visual-patch-lab")}
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
            onClick={() => handleViewChange("ai-body-editor")}
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

          <button
            onClick={() => handleViewChange("recordings")}
            className="luxury-glass-card interactive-hover p-6 rounded-2xl text-center group"
          >
            <div className="mb-3">
              <RecordingsIcon size={48} className="mx-auto" />
            </div>
            <div className="luxury-text font-bold text-lg mb-1">
              {languageService.current.translate("recordings")}
            </div>
            <div className="luxury-text text-sm opacity-70">
              {recordings.length} ملف
            </div>
          </button>

          <button
            onClick={() => handleViewChange("files")}
            className="luxury-glass-card interactive-hover p-6 rounded-2xl text-center group"
          >
            <div className="mb-3">
              <FilesIcon size={48} className="mx-auto" />
            </div>
            <div className="luxury-text font-bold text-lg mb-1">
              {languageService.current.translate("files")}
            </div>
            <div className="luxury-text text-sm opacity-70">File Manager</div>
          </button>
        </div>

        {/* Enhanced Navigation Toggle */}
        <div className="luxury-glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="luxury-text font-semibold">Navigation Options</h3>
            <button
              onClick={() => setShowEnhancedNavigation(!showEnhancedNavigation)}
              className="luxury-button"
            >
              {showEnhancedNavigation ? "Standard" : "Enhanced"}
            </button>
          </div>

          {showEnhancedNavigation && (
            <EnhancedNavigation
              currentView={currentView}
              onNavigate={handleViewChange}
              onBack={handleBack}
              showBackButton={navigationHistory.length > 1}
              compactMode={compactMode}
              language={currentLanguage as "ar" | "en"}
              notifications={notifications.length}
            />
          )}
        </div>

        {/* Memory Monitor */}
        <div className="luxury-glass-card">
          <MemoryMonitor
            onMemoryWarning={handleMemoryWarning}
            className="mt-4"
          />
        </div>
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
      case "elysian":
        return <ElysianCanvas onClose={() => setCurrentView("main")} />;
      default:
        return renderMainView();
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative luxury-arabic">
      {/* UI Enhancer */}
      <UIEnhancer />

      {/* Background Effects */}
      <LuxuryBackgroundEffects
        effects={["starfield", "orbs", "waves"]}
        intensity={recorderState.isRecording ? 0.8 : 0.4}
      />

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Navigation */}
      {currentView !== "main" && (
        <BackNavigation
          currentView={currentView}
          onBack={handleBack}
          onNavigate={handleViewChange}
        />
      )}

      {/* Header */}
      <LuxuryHeader
        isRecording={recorderState.isRecording}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onNotificationsClick={() => setIsNotificationsOpen((p) => !p)}
        notificationCount={notifications.length}
        currentView={currentView}
        onViewChange={handleViewChange}
      />

      {/* Notifications */}
      <NotificationsDropdown
        isOpen={isNotificationsOpen}
        notifications={notifications}
        onClose={() => setIsNotificationsOpen(false)}
        onDismiss={(id) =>
          setNotifications((p) => p.filter((n) => n.id !== id))
        }
      />

      {/* Enhanced Settings Modal */}
      <EnhancedSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        settings={settings}
        onSave={onSettingsSave}
      />

      {/* Advanced Model Settings */}
      <AdvancedModelSettings
        isOpen={isAdvancedSettingsOpen}
        onClose={() => setIsAdvancedSettingsOpen(false)}
        onSave={(modelSettings) => {
          console.log("حُفظت إعدادات النماذج:", modelSettings);
          addNotification("تم حفظ إعدادات النماذج المتقدمة!", "success");
        }}
      />

      {/* Trim Modal */}
      {pendingRecording && (
        <TrimModal
          recording={pendingRecording}
          onSave={(rec, trimData) => {
            addNotification("تم قص الفيديو بنجاح! ✂️", "success");
            feedbackService.success("تم قص الفيديو بنجاح! ✂️");
            setRecordings((prev) => [{ ...rec, trim: trimData }, ...prev]);
            setPendingRecording(null);
          }}
          onSaveFull={(rec) => {
            setRecordings((prev) => [rec, ...prev]);
            addNotification(`Recording "${rec.name}" saved.`, "success");
            feedbackService.success("تم حفظ التسجيل كاملاً! 🎬");
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

export default LuxuryApp;
