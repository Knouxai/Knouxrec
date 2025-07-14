import React from "react";
import LuxuryApp from "./components/LuxuryApp";
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
import OfflineAIToolsPanel from "./components/OfflineAIToolsPanel";
import VisualPatchLabPanel from "./components/VisualPatchLabPanel";
import ElysianCanvas from "./elysian-canvas/ElysianCanvas";
import AdvancedProgressIndicator from "./components/AdvancedProgressIndicator";
import AdvancedModelSettings from "./components/AdvancedModelSettings";
import MemoryMonitor from "./components/MemoryMonitor";
import { useRecorder } from "./hooks/useRecorder";
import { Recording, RecordingSettings, Theme, Notification } from "./types";
import { offlineAI } from "./services/offlineAI";
import { videoProcessor } from "./services/videoProcessor";
import { audioProcessor } from "./services/audioProcessor";
import { imageProcessor } from "./services/imageProcessor";
import { feedbackService } from "./services/feedbackService";
import { systemTester } from "./services/systemTester";
import {
  enhancedModelManager,
  LoadingProgress,
  MemoryStatus,
} from "./services/enhancedModelManager";
import {
  enhancedErrorHandler,
  ErrorReport,
} from "./services/enhancedErrorHandler";
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
    | "offline-tools"
    | "visual-patch-lab"
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

  const addNotification = useCallback(
    (message: string, type: Notification["type"]) => {
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        message,
        type,
      };
      setNotifications((prev) => [newNotification, ...prev].slice(0, 10));

      // استخدام نظام الإشعارات المتقدم
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
          `جار المعالجة بالذكاء الاصطناعي لـ "${recording.name}"...`,
          "info",
        );

        // استخ��ام نظام الذكاء الاصطناعي الجديد
        const taskId = await offlineAI.addTask({
          type: "text",
          operation: "text_analysis",
          input: recording.transcript,
          credits: 10,
          estimatedTime: 60,
        });

        // مراقبة حالة المهمة
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
              // استمرار المراقبة
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
        addNotification(`تم حفظ التسجيل "${newRecording.name}".`, "success");
        feedbackService.success(`تم حفظ التسجيل بنجاح! 🎬`, {
          actions: [
            {
              label: "عرض",
              action: () => setCurrentView("recordings"),
              style: "primary",
            },
          ],
        });

        // بدء المعالجة الذكية التلقائية إذا كانت مفعلة
        if (newRecording.isProcessing && transcript) {
          runAiProcessing(newRecording);
        }

        // استخراج الصوت تلقائياً إذا لم يكن هناك نسخ نصي
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

  // استخدام النظام الجديد
  const { state: recorderState, actions: recorderActions } = useRecorder();

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  // إعداد مراقبة النظام المحسن
  useEffect(() => {
    // مراقبة أخطاء النماذج
    enhancedErrorHandler.onError("app", (report) => {
      setErrorReports((prev) => [report, ...prev].slice(0, 10));
      addNotification(
        `خطأ في النموذج ${report.context.modelName}: ${report.solution.title}`,
        "error",
      );
    });

    // تحديث حالة الذاكرة
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

  // معالجة تحذيرات الذا��رة
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

  // معالجة تقدم التحميل
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

      // إزالة المكتملة بعد 3 ثوان
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
    feedbackService.success("تم ��فظ الإعدادات بنجاح! ⚙️");
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

  // معالج لقطة الشاشة المحدث
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

  // مراقبة إنهاء التسجيل
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
        <Controls />
        <Features
          settings={settings}
          onSettingsChange={handleSettingsChange}
          isRecording={recorderState.isRecording}
        />
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
      <div className="flex flex-col gap-6">
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

        {/* Quick Access Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <button
            onClick={() => setCurrentView("templates")}
            className="glass-card interactive p-6 rounded-2xl text-center hover:bg-knoux-purple/20 transition-all duration-300"
          >
            <div className="text-3xl mb-2">📽��</div>
            <div className="font-orbitron font-bold text-knoux-purple">
              Templates
            </div>
            <div className="text-sm text-white/70">Video Templates</div>
          </button>

          <button
            onClick={() => setCurrentView("toolbox")}
            className="glass-card interactive p-6 rounded-2xl text-center hover:bg-knoux-neon/20 transition-all duration-300"
          >
            <div className="text-3xl mb-2">🛠️</div>
            <div className="font-orbitron font-bold text-knoux-neon">
              Toolbox
            </div>
            <div className="text-sm text-white/70">AI Tools</div>
          </button>

          <button
            onClick={() => setCurrentView("offline-tools")}
            className="glass-card interactive p-6 rounded-2xl text-center hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300 border border-purple-500/30"
          >
            <div className="text-3xl mb-2">🧠</div>
            <div className="font-orbitron font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              أدوات أوفلاين
            </div>
            <div className="text-sm text-white/70">38 أداة ذكية</div>
          </button>

          <button
            onClick={() => setCurrentView("visual-patch-lab")}
            className="glass-card interactive p-6 rounded-2xl text-center hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-purple-500/20 transition-all duration-300 border border-indigo-500/30"
          >
            <div className="text-3xl mb-2">🧩</div>
            <div className="font-orbitron font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Visual Patch Lab
            </div>
            <div className="text-sm text-white/70">50 أداة تحرير</div>
          </button>

          <button
            onClick={() => setCurrentView("elysian")}
            className="glass-card interactive p-6 rounded-2xl text-center hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300 border border-purple-500/30"
          >
            <div className="text-3xl mb-2">✨</div>
            <div className="font-orbitron font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Elysian Canvas
            </div>
            <div className="text-sm text-white/70">Adult Art Studio</div>
          </button>

          <button
            onClick={() => setCurrentView("recordings")}
            className="glass-card interactive p-6 rounded-2xl text-center hover:bg-green-400/20 transition-all duration-300"
          >
            <div className="text-3xl mb-2">🎬</div>
            <div className="font-orbitron font-bold text-green-400">
              Recordings
            </div>
            <div className="text-sm text-white/70">
              {recordings.length} files
            </div>
          </button>

          <button
            onClick={() => setCurrentView("ai")}
            className="glass-card interactive p-6 rounded-2xl text-center hover:bg-yellow-400/20 transition-all duration-300"
          >
            <div className="text-3xl mb-2">🧠</div>
            <div className="font-orbitron font-bold text-yellow-400">
              AI Analysis
            </div>
            <div className="text-sm text-white/70">Offline AI</div>
          </button>
        </div>

        {/* Memory Monitor */}
        <MemoryMonitor onMemoryWarning={handleMemoryWarning} className="mt-4" />

        {/* Loading Progress Indicators */}
        {loadingProgress.length > 0 && (
          <div className="mt-4 space-y-3">
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              �� جار تحميل النماذج
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
          <div className="mt-4 space-y-3">
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              ⚠️ تقارير الأخطاء
            </h3>
            {errorReports.slice(0, 3).map((report) => (
              <div
                key={report.id}
                className="glass-card p-4 rounded-xl border border-red-500/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-red-300 font-medium">
                    {report.solution.title}
                  </h4>
                  <button
                    onClick={() =>
                      setErrorReports((prev) =>
                        prev.filter((r) => r.id !== report.id),
                      )
                    }
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-white/70 text-sm mb-3">
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
                      className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                        action.isPrimary
                          ? "bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300"
                          : "bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 text-gray-300"
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
            <TemplatesPanel />
          </div>
        );
      case "toolbox":
        return (
          <div className="flex-grow p-4 md:p-6 max-w-screen-2xl w-full mx-auto z-10">
            <ToolboxPanel />
          </div>
        );
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
      case "offline-tools":
        return (
          <div className="flex-grow p-4 md:p-6 max-w-screen-2xl w-full mx-auto z-10">
            <OfflineAIToolsPanel />
          </div>
        );
      case "visual-patch-lab":
        return <VisualPatchLabPanel />;
      case "elysian":
        return <ElysianCanvas onClose={() => setCurrentView("main")} />;
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
        {/* Advanced Settings Button */}
        <div className="absolute top-4 left-4 z-30">
          <button
            onClick={() => setIsAdvancedSettingsOpen(true)}
            className="glass-card interactive p-3 rounded-xl hover:bg-white/10 transition-all duration-200"
            title="إعدادات النماذج المتقدمة"
          >
            <div className="text-white/80 hover:text-white text-lg">⚙️</div>
          </button>
        </div>

        <Header
          isRecording={recorderState.isRecording}
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

export default App;
