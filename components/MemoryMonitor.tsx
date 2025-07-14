import React, { useState, useEffect } from "react";
import {
  enhancedModelManager,
  MemoryStatus,
} from "../services/enhancedModelManager";
import { offlineAI } from "../services/offlineAI";

interface MemoryMonitorProps {
  showDetails?: boolean;
  onMemoryWarning?: (status: MemoryStatus) => void;
  className?: string;
}

interface MemoryHistory {
  timestamp: number;
  used: number;
  available: number;
  modelsCount: number;
}

const MemoryMonitor: React.FC<MemoryMonitorProps> = ({
  showDetails = false,
  onMemoryWarning,
  className = "",
}) => {
  const [memoryStatus, setMemoryStatus] = useState<MemoryStatus | null>(null);
  const [memoryHistory, setMemoryHistory] = useState<MemoryHistory[]>([]);
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [warningThreshold, setWarningThreshold] = useState(80); // 80%

  // تحديث حالة الذاكرة
  useEffect(() => {
    const updateMemoryStatus = () => {
      try {
        const status = enhancedModelManager.getMemoryStatus();
        setMemoryStatus(status);

        // إضافة للتاريخ
        const historyEntry: MemoryHistory = {
          timestamp: Date.now(),
          used: status.totalUsed,
          available: status.available,
          modelsCount: status.modelsInMemory,
        };

        setMemoryHistory((prev) => {
          const newHistory = [historyEntry, ...prev].slice(0, 60); // آخر 60 قراءة (5 دقائق)
          return newHistory;
        });

        // فحص التحذيرات
        const usagePercentage =
          (status.totalUsed / (status.totalUsed + status.available)) * 100;
        if (usagePercentage > warningThreshold) {
          onMemoryWarning?.(status);

          if (autoOptimize && usagePercentage > 90) {
            optimizeMemoryUsage();
          }
        }
      } catch (error) {
        console.error("فشل في تحديث حالة الذاكرة:", error);
      }
    };

    updateMemoryStatus();
    const interval = setInterval(updateMemoryStatus, 5000); // كل 5 ثوان

    return () => clearInterval(interval);
  }, [warningThreshold, autoOptimize, onMemoryWarning]);

  // تحسين استخدام الذاكرة
  const optimizeMemoryUsage = async () => {
    try {
      console.log("🧹 بدء تحسين استخدام الذاكرة...");

      // تنظيف JavaScript garbage collection
      if ("gc" in window) {
        (window as any).gc();
      }

      // إلغاء تحميل النماذج القديمة
      const loadedModels = enhancedModelManager.getLoadedModels();
      const modelsToUnload = loadedModels.slice(
        Math.ceil(loadedModels.length / 2),
      );

      for (const modelName of modelsToUnload) {
        enhancedModelManager.unloadModel(modelName);
        // توقف قصير بين الإلغاءات
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      console.log(
        `✅ تم تحسين الذاكرة: ألغي تحميل ${modelsToUnload.length} نماذج`,
      );
    } catch (error) {
      console.error("فشل في تحسين الذاكرة:", error);
    }
  };

  // تنسيق الحجم
  const formatBytes = (bytes: number): string => {
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(1)} GB`;
    }
    return `${bytes.toFixed(0)} MB`;
  };

  // الحصول على لون شريط الذاكرة
  const getMemoryBarColor = (percentage: number): string => {
    if (percentage > 90) return "from-red-500 to-red-600";
    if (percentage > 80) return "from-orange-500 to-orange-600";
    if (percentage > 60) return "from-yellow-500 to-yellow-600";
    return "from-green-500 to-green-600";
  };

  // الحصول على أيقونة الحالة
  const getStatusIcon = (percentage: number): string => {
    if (percentage > 90) return "🔴";
    if (percentage > 80) return "🟠";
    if (percentage > 60) return "🟡";
    return "🟢";
  };

  if (!memoryStatus) {
    return (
      <div className={`glass-card p-4 rounded-xl ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded-full animate-pulse"></div>
          <span className="text-white/70">جار تحميل حالة الذاكرة...</span>
        </div>
      </div>
    );
  }

  const usagePercentage =
    (memoryStatus.totalUsed /
      (memoryStatus.totalUsed + memoryStatus.available)) *
    100;

  return (
    <div
      className={`glass-card rounded-xl border border-white/20 ${className}`}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors rounded-t-xl"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xl">{getStatusIcon(usagePercentage)}</div>
            <div>
              <h3 className="font-semibold text-white text-sm">
                مراقب الذاكرة
              </h3>
              <p className="text-white/60 text-xs">
                {formatBytes(memoryStatus.totalUsed)} /{" "}
                {formatBytes(memoryStatus.totalUsed + memoryStatus.available)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium">
              {usagePercentage.toFixed(1)}%
            </span>
            <div className="text-white/40 text-sm">
              {isExpanded ? "▼" : "▶"}
            </div>
          </div>
        </div>

        {/* Memory Bar */}
        <div className="mt-3">
          <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getMemoryBarColor(usagePercentage)} transition-all duration-500 ease-out rounded-full`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            >
              <div className="h-full bg-white/20 animate-pulse rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-white/10">
          {/* Detailed Stats */}
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/70">المستخدم:</span>
                  <span className="text-white">
                    {formatBytes(memoryStatus.totalUsed)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">المتاح:</span>
                  <span className="text-white">
                    {formatBytes(memoryStatus.available)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/70">النماذج:</span>
                  <span className="text-white">
                    {memoryStatus.modelsInMemory}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">أكبر نموذج:</span>
                  <span className="text-white text-xs">
                    {memoryStatus.largestModel || "لا يوجد"}
                  </span>
                </div>
              </div>
            </div>

            {/* Memory History Chart */}
            {memoryHistory.length > 1 && (
              <div className="space-y-2">
                <h4 className="text-white/80 text-sm font-medium">
                  تاريخ الاستخدام (آخر 5 دقائق)
                </h4>
                <div className="h-16 bg-black/20 rounded-lg p-2 relative overflow-hidden">
                  <svg width="100%" height="100%" className="absolute inset-0">
                    {/* Grid Lines */}
                    <defs>
                      <pattern
                        id="grid"
                        width="20"
                        height="12"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 20 0 L 0 0 0 12"
                          fill="none"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="0.5"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Memory Usage Line */}
                    <polyline
                      fill="none"
                      stroke="rgba(139, 92, 246, 0.8)"
                      strokeWidth="2"
                      points={memoryHistory
                        .slice(0, 20)
                        .reverse()
                        .map((entry, index) => {
                          const x = (index / 19) * 100;
                          const y =
                            100 -
                            (entry.used / (entry.used + entry.available)) * 100;
                          return `${x}%,${y}%`;
                        })
                        .join(" ")}
                    />

                    {/* Warning Threshold Line */}
                    <line
                      x1="0"
                      y1={`${100 - warningThreshold}%`}
                      x2="100%"
                      y2={`${100 - warningThreshold}%`}
                      stroke="rgba(251, 191, 36, 0.6)"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  </svg>

                  <div className="absolute bottom-1 right-2 text-xs text-white/50">
                    الآن
                  </div>
                  <div className="absolute bottom-1 left-2 text-xs text-white/50">
                    -5min
                  </div>
                </div>
              </div>
            )}

            {/* Settings */}
            <div className="space-y-3 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <label className="text-white/80 text-sm">
                  التحسين التلقائي
                </label>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={autoOptimize}
                    onChange={(e) => setAutoOptimize(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-white/80 text-sm">
                  عتبة التحذير: {warningThreshold}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={warningThreshold}
                  onChange={(e) =>
                    setWarningThreshold(parseInt(e.target.value))
                  }
                  className="w-full"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={optimizeMemoryUsage}
                className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 text-sm font-medium transition-all duration-200"
              >
                🧹 تحسين الذاكرة
              </button>

              <button
                onClick={() => enhancedModelManager.cleanup()}
                className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 text-sm font-medium transition-all duration-200"
              >
                🗑️ إلغاء الجميع
              </button>
            </div>

            {/* Warnings */}
            {usagePercentage > warningThreshold && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  usagePercentage > 90
                    ? "bg-red-500/20 border border-red-500/30 text-red-200"
                    : "bg-yellow-500/20 border border-yellow-500/30 text-yellow-200"
                }`}
              >
                {usagePercentage > 90 ? "🔴" : "⚠️"}
                {usagePercentage > 90
                  ? " الذاكرة ممتلئة تقريباً! قد يتم إلغاء تحميل نماذج تلقائياً."
                  : " استخدام الذاكرة مرتفع. يُنصح بتحسين الاستخدام."}
              </div>
            )}

            {!memoryStatus.canLoadMore && (
              <div className="p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-200 text-sm">
                🚫 لا يمكن تحميل نماذج إضافية. الذاكرة المتاحة غير كافية.
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 36px;
          height: 20px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.1);
          transition: 0.3s;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: rgba(139, 92, 246, 0.6);
          border-color: rgba(139, 92, 246, 0.8);
        }

        input:checked + .slider:before {
          transform: translateX(16px);
        }
      `}</style>
    </div>
  );
};

export default MemoryMonitor;
