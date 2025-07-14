import { useState, useEffect, useCallback } from "react";
import LuxuryHeader from "./LuxuryHeader";
import Controls from "./Controls";
import Features from "./Features";
import Actions from "./Actions";
import RecordingsGallery from "./RecordingsGallery";
import VideoPreview from "./VideoPreview";
import SettingsModal from "./SettingsModal";
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
import KnouxMorphCorePanel from "./KnouxMorphCorePanel";
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
import AutoAllocationCoordinator from "./AutoAllocationCoordinator";
import RealContentManager from "./RealContentManager";
import { useRecorder } from "../hooks/useRecorder";
import { Recording, RecordingSettings, Theme, Notification } from "../types";
import { offlineAI } from "../services/offlineAI";
import { audioProcessor } from "../services/audioProcessor";
import { feedbackService } from "../services/feedbackService";
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
    | "knoux-morph-core"
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
          `تم ��خطي التحليل الذكي لـ "${recording.name}" (النص قصير جداً).`,
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
          `جار المعالجة بالذكاء الاصطناعي لـ "${recording.name}"...`,
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
        addNotification(`��شل التحليل الذكي: ${errorMessage}`, "error");
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
        addNotification(`تم حفظ التسجيل "${newRecording.name}".`, "success");
        feedbackService.success(`��م حفظ التسجيل بنجاح! 🎬`, {
          actions: [
            {
              label: "عرض",
              action: () => setCurrentView("recordings"),
              style: "primary",
            },
          ],
        });

        if (newRecording.isProcessing && transcript) {
          runAiProcessing(newRecording);
        }

        if (!transcript && settings.aiProcessingEnabled) {
          try {
            const audioLoadingId = feedbackService.loading(
              "جار استخراج الصوت وتحويله لنص...",
              0,
            );
            addNotification("جار استخراج الصوت وتحويله لنص...", "info");
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
                "لم يتم اكتشاف نص واضح في التسجيل الصوتي",
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
          actions: [
            {
              label: "فتح",
              action: () => {
                if (result.dataUrl) {
                  window.open(result.dataUrl, "_blank");
                }
              },
              style: "primary",
            },
          ],
        });
      } else {
        feedbackService.error(`فشل في التقاط لقطة الشاشة: ${result.error}`);
      }
    } catch (error) {
      feedbackService.error(
        `خطأ في التقاط لقطة الشاشة: ${error instanceof Error ? error.message : "خطأ غير معروف"}`,
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
              إدارة الملف��ت
            </div>
            <div className="luxury-text text-sm opacity-70">File Manager</div>
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
              ���️ تقارير الأخطاء
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
      case "elysian":
        return <ElysianCanvas onClose={() => setCurrentView("main")} />;
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

      {/* Navigation */}
      {currentView !== "main" && (
        <BackNavigation
          currentView={currentView}
          onBack={() => setCurrentView("main")}
          onNavigate={setCurrentView}
        />
      )}

      {/* Header */}
      <LuxuryHeader
        isRecording={recorderState.isRecording}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onNotificationsClick={() => setIsNotificationsOpen((p) => !p)}
        notificationCount={notifications.length}
        currentView={currentView}
        onViewChange={(view: string) => setCurrentView(view as any)}
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

      {/* Settings Modal */}
      <SettingsModal
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

      {/* Auto-Allocation Modal */}
      {showAutoAllocation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-auto">
            <AutoAllocationCoordinator
              autoStart={true}
              onComplete={(report) => {
                console.log("تم الانتهاء من التخصيص التلقائي:", report);
                addNotification(
                  "تم إنجاز التخصيص التلقائي الذكي بنجاح!",
                  "success",
                );
              }}
            />
            <div className="text-center mt-4">
              <button
                onClick={() => setShowAutoAllocation(false)}
                className="px-6 py-3 bg-gray-500/20 hover:bg-gray-500/40 rounded-xl text-white font-medium transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      {currentView === "main" && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-3">
          {/* Real Content Button */}
          <button
            onClick={() => setCurrentView("real-content")}
            className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white font-bold shadow-lg hover:scale-110 transition-all duration-300 group"
            title="المحتوى الحقيقي للمستخدم"
          >
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎆</span>
              <span className="hidden group-hover:block text-sm whitespace-nowrap">
                محتوى حقيقي
              </span>
            </div>
          </button>

          {/* Auto-Allocation Button */}
          {!showAutoAllocation && (
            <button
              onClick={() => setShowAutoAllocation(true)}
              className="p-4 bg-gradient-to-r from-knoux-purple to-knoux-neon rounded-full text-white font-bold shadow-lg hover:scale-110 transition-all duration-300 group"
              title="التخصيص التلقائي الذكي"
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🤖</span>
                <span className="hidden group-hover:block text-sm whitespace-nowrap">
                  تخصيص ذكي
                </span>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Main Content */}
      {renderContent()}
    </div>
  );
};

export default LuxuryApp;
