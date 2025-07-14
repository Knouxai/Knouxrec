import React, { useState, useEffect } from "react";
import {
  LoadingProgress,
  MemoryStatus,
} from "../services/enhancedModelManager";

interface AdvancedProgressIndicatorProps {
  progress: LoadingProgress;
  memoryStatus?: MemoryStatus;
  onCancel?: () => void;
  showDetails?: boolean;
}

const AdvancedProgressIndicator: React.FC<AdvancedProgressIndicatorProps> = ({
  progress,
  memoryStatus,
  onCancel,
  showDetails = false,
}) => {
  const [showDetailedView, setShowDetailedView] = useState(showDetails);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // أنيميشن تدريجي للتقدم
  useEffect(() => {
    const targetProgress = progress.progress;
    const step = (targetProgress - animatedProgress) / 10;

    if (Math.abs(step) > 0.1) {
      const interval = setInterval(() => {
        setAnimatedProgress((prev) => {
          const next = prev + step;
          if (Math.abs(next - targetProgress) < 0.1) {
            clearInterval(interval);
            return targetProgress;
          }
          return next;
        });
      }, 50);

      return () => clearInterval(interval);
    } else {
      setAnimatedProgress(targetProgress);
    }
  }, [progress.progress, animatedProgress]);

  // تنسيق الوقت
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // تنسيق الحجم
  const formatBytes = (bytes: number): string => {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // ألوان حسب المرحلة
  const getStageColor = (stage: LoadingProgress["stage"]): string => {
    switch (stage) {
      case "downloading":
        return "from-blue-500 to-blue-600";
      case "parsing":
        return "from-yellow-500 to-yellow-600";
      case "initializing":
        return "from-purple-500 to-purple-600";
      case "ready":
        return "from-green-500 to-green-600";
      case "error":
        return "from-red-500 to-red-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  // نص المرحلة
  const getStageText = (stage: LoadingProgress["stage"]): string => {
    switch (stage) {
      case "downloading":
        return "جار التحميل...";
      case "parsing":
        return "جار التحليل...";
      case "initializing":
        return "جار التهيئة...";
      case "ready":
        return "جاهز!";
      case "error":
        return "خطأ!";
      default:
        return "معالجة...";
    }
  };

  // أيقونة المرحلة
  const getStageIcon = (stage: LoadingProgress["stage"]): string => {
    switch (stage) {
      case "downloading":
        return "⬇️";
      case "parsing":
        return "🔄";
      case "initializing":
        return "⚙️";
      case "ready":
        return "✅";
      case "error":
        return "❌";
      default:
        return "⏳";
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/20 backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{getStageIcon(progress.stage)}</div>
          <div>
            <h3 className="font-orbitron font-bold text-white text-lg">
              {progress.modelName}
            </h3>
            <p className="text-white/70 text-sm">
              {getStageText(progress.stage)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showDetailedView && (
            <button
              onClick={() => setShowDetailedView(false)}
              className="text-white/60 hover:text-white transition-colors"
              title="إخفاء التفاصيل"
            >
              ▼
            </button>
          )}
          {!showDetailedView && (
            <button
              onClick={() => setShowDetailedView(true)}
              className="text-white/60 hover:text-white transition-colors"
              title="عرض التفاصيل"
            >
              ▶
            </button>
          )}
          {onCancel &&
            progress.stage !== "ready" &&
            progress.stage !== "error" && (
              <button
                onClick={onCancel}
                className="text-red-400 hover:text-red-300 transition-colors text-sm"
                title="إلغاء"
              >
                ✕
              </button>
            )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-4">
        <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getStageColor(progress.stage)} transition-all duration-300 ease-out rounded-full relative`}
            style={{ width: `${Math.max(animatedProgress, 2)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2 text-sm">
          <span className="text-white/70">{Math.round(animatedProgress)}%</span>
          {progress.estimatedTimeRemaining > 0 && (
            <span className="text-white/70">
              متبقي: {formatTime(progress.estimatedTimeRemaining)}
            </span>
          )}
        </div>
      </div>

      {/* Detailed View */}
      {showDetailedView && (
        <div className="space-y-4 border-t border-white/10 pt-4">
          {/* Download Progress */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/70">البيانات المحملة:</span>
                <span className="text-white">
                  {formatBytes(progress.bytesLoaded)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">الحجم الإجمالي:</span>
                <span className="text-white">
                  {formatBytes(progress.totalBytes)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">الوقت المنقضي:</span>
                <span className="text-white">
                  {formatTime(progress.timeElapsed)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/70">السرعة:</span>
                <span className="text-white">
                  {progress.timeElapsed > 0
                    ? `${formatBytes(progress.bytesLoaded / (progress.timeElapsed / 1000))}/s`
                    : "حساب..."}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">المرحلة:</span>
                <span className="text-white capitalize">{progress.stage}</span>
              </div>
              {progress.error && (
                <div className="flex justify-between">
                  <span className="text-red-400">الخطأ:</span>
                  <span className="text-red-300 text-xs">{progress.error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Memory Status */}
          {memoryStatus && (
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                🧠 حالة الذاكرة
              </h4>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/70">المستخدم:</span>
                    <span className="text-white">
                      {memoryStatus.totalUsed.toFixed(1)} MB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">المتاح:</span>
                    <span className="text-white">
                      {memoryStatus.available.toFixed(1)} MB
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/70">النماذج المحملة:</span>
                    <span className="text-white">
                      {memoryStatus.modelsInMemory}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">أكبر نموذج:</span>
                    <span className="text-white text-xs">
                      {memoryStatus.largestModel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Memory Usage Bar */}
              <div className="mt-3">
                <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      memoryStatus.totalUsed /
                        (memoryStatus.totalUsed + memoryStatus.available) >
                      0.8
                        ? "bg-gradient-to-r from-red-500 to-red-600"
                        : memoryStatus.totalUsed /
                              (memoryStatus.totalUsed +
                                memoryStatus.available) >
                            0.6
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                          : "bg-gradient-to-r from-green-500 to-green-600"
                    }`}
                    style={{
                      width: `${(memoryStatus.totalUsed / (memoryStatus.totalUsed + memoryStatus.available)) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>0 MB</span>
                  <span>
                    {(memoryStatus.totalUsed + memoryStatus.available).toFixed(
                      0,
                    )}{" "}
                    MB
                  </span>
                </div>
              </div>

              {!memoryStatus.canLoadMore && (
                <div className="mt-3 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-200 text-xs">
                  ⚠️ الذاكرة منخفضة - قد يتم إلغاء تحميل بعض النماذج تلقائياً
                </div>
              )}
            </div>
          )}

          {/* Stage Details */}
          <div className="border-t border-white/10 pt-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              📊 تفاصيل المرحلة
            </h4>

            <div className="space-y-2">
              {progress.stage === "downloading" && (
                <div className="text-sm text-white/70">
                  جار تحميل ملفات النموذج من الخادم المحلي...
                </div>
              )}
              {progress.stage === "parsing" && (
                <div className="text-sm text-white/70">
                  جار تحليل وتحويل ملفات النموذج إلى تنسيق TensorFlow.js...
                </div>
              )}
              {progress.stage === "initializing" && (
                <div className="text-sm text-white/70">
                  جار تهيئة النموذج وتحميله في الذاكرة...
                </div>
              )}
              {progress.stage === "ready" && (
                <div className="text-sm text-green-300">
                  ✅ النموذج جاهز للاستخدام!
                </div>
              )}
              {progress.stage === "error" && (
                <div className="text-sm text-red-300">
                  ❌ حدث خطأ أثناء تحميل النموذج. يرجى المحاولة مرة أخرى.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {progress.stage === "error" && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 font-medium transition-all duration-200"
          >
            🔄 إعادة المحاولة
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded-lg text-gray-300 font-medium transition-all duration-200"
          >
            ✕ إلغاء
          </button>
        </div>
      )}

      {progress.stage === "ready" && (
        <div className="mt-4">
          <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm text-center">
            🎉 تم تحميل النموذج بنجاح ويمكن استخدامه الآن!
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedProgressIndicator;
