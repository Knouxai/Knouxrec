import React, { useState, useEffect } from "react";
import {
  enhancedModelManager,
  MemoryStatus,
} from "../services/enhancedModelManager";

interface ModelSettings {
  memoryLimit: number; // MB
  performanceMode: "power_saving" | "balanced" | "performance";
  autoUnload: boolean;
  autoUnloadDelay: number; // minutes
  preferredBackend: "auto" | "webgl" | "cpu";
  enableFallback: boolean;
  maxConcurrentModels: number;
  preloadEssential: boolean;
  cacheSize: number; // MB
}

interface AdvancedModelSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ModelSettings) => void;
}

const AdvancedModelSettings: React.FC<AdvancedModelSettingsProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [settings, setSettings] = useState<ModelSettings>({
    memoryLimit: 4096,
    performanceMode: "balanced",
    autoUnload: true,
    autoUnloadDelay: 30,
    preferredBackend: "auto",
    enableFallback: true,
    maxConcurrentModels: 3,
    preloadEssential: true,
    cacheSize: 2048,
  });

  const [memoryStatus, setMemoryStatus] = useState<MemoryStatus | null>(null);
  const [loadedModels, setLoadedModels] = useState<string[]>([]);
  const [systemInfo, setSystemInfo] = useState<any>(null);

  // تحديث حالة النظام
  useEffect(() => {
    if (isOpen) {
      updateSystemStatus();
      const interval = setInterval(updateSystemStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const updateSystemStatus = async () => {
    try {
      const memory = enhancedModelManager.getMemoryStatus();
      const models = enhancedModelManager.getLoadedModels();
      const info = getSystemInfo();

      setMemoryStatus(memory);
      setLoadedModels(models);
      setSystemInfo(info);
    } catch (error) {
      console.error("فشل في تحديث حالة النظام:", error);
    }
  };

  const getSystemInfo = () => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cores: navigator.hardwareConcurrency || "غير معروف",
      memory: (navigator as any).deviceMemory || "غير معروف",
      webgl: !!gl,
      webglVersion: gl ? gl.getParameter(gl.VERSION) : "غير مدعوم",
      maxTextureSize: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : "غير معروف",
    };
  };

  const handleSettingChange = (key: keyof ModelSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    // تطبيق الإعدادات
    enhancedModelManager.setMemoryLimit(settings.memoryLimit);

    // حفظ في localStorage
    localStorage.setItem("knoux_model_settings", JSON.stringify(settings));

    onSave(settings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings: ModelSettings = {
      memoryLimit: 4096,
      performanceMode: "balanced",
      autoUnload: true,
      autoUnloadDelay: 30,
      preferredBackend: "auto",
      enableFallback: true,
      maxConcurrentModels: 3,
      preloadEssential: true,
      cacheSize: 2048,
    };

    setSettings(defaultSettings);
  };

  const handleUnloadAllModels = async () => {
    if (confirm("هل أنت متأكد من إلغاء تحميل جميع النماذج؟")) {
      enhancedModelManager.cleanup();
      updateSystemStatus();
    }
  };

  const handleUnloadModel = async (modelName: string) => {
    if (confirm(`هل تريد إلغاء تحميل النموذج ${modelName}؟`)) {
      enhancedModelManager.unloadModel(modelName);
      updateSystemStatus();
    }
  };

  const getPerformanceModeDescription = (
    mode: ModelSettings["performanceMode"],
  ) => {
    switch (mode) {
      case "power_saving":
        return "توفير الطاقة - استهلاك أقل للبطارية والذاكرة";
      case "balanced":
        return "متوازن - توازن بين الأداء والاستهلاك";
      case "performance":
        return "أداء عالي - أقصى سرعة معالجة";
      default:
        return "";
    }
  };

  const getBackendDescription = (
    backend: ModelSettings["preferredBackend"],
  ) => {
    switch (backend) {
      case "auto":
        return "تلقائي - اختيار أفضل معالج متاح";
      case "webgl":
        return "WebGL - استخدام معالج الرسوم (أسرع)";
      case "cpu":
        return "المعالج العادي - أكثر توافقاً";
      default:
        return "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/20">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-orbitron font-bold text-white flex items-center gap-3">
              ⚙️ إعدادات النماذج المتقدمة
            </h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* System Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              📊 حالة النظام
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Memory Status */}
              {memoryStatus && (
                <div className="glass-card p-4 rounded-xl">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    🧠 الذاكرة
                  </h4>
                  <div className="space-y-2 text-sm">
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
                    <div className="flex justify-between">
                      <span className="text-white/70">النماذج:</span>
                      <span className="text-white">
                        {memoryStatus.modelsInMemory}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          memoryStatus.totalUsed /
                            (memoryStatus.totalUsed + memoryStatus.available) >
                          0.8
                            ? "bg-gradient-to-r from-red-500 to-red-600"
                            : "bg-gradient-to-r from-green-500 to-green-600"
                        }`}
                        style={{
                          width: `${(memoryStatus.totalUsed / (memoryStatus.totalUsed + memoryStatus.available)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* System Info */}
              {systemInfo && (
                <div className="glass-card p-4 rounded-xl">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    💻 معلومات النظام
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">المعالجات:</span>
                      <span className="text-white">{systemInfo.cores}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">الذاكرة:</span>
                      <span className="text-white">{systemInfo.memory} GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">WebGL:</span>
                      <span
                        className={`${systemInfo.webgl ? "text-green-400" : "text-red-400"}`}
                      >
                        {systemInfo.webgl ? "مدعوم" : "غير مدعوم"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Loaded Models */}
              <div className="glass-card p-4 rounded-xl">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  🤖 النماذج المحملة
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {loadedModels.length === 0 ? (
                    <p className="text-white/60 text-sm">لا توجد نماذج محملة</p>
                  ) : (
                    loadedModels.map((model) => (
                      <div
                        key={model}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-white/80">{model}</span>
                        <button
                          onClick={() => handleUnloadModel(model)}
                          className="text-red-400 hover:text-red-300 text-xs"
                          title="إلغاء التحميل"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {loadedModels.length > 0 && (
                  <button
                    onClick={handleUnloadAllModels}
                    className="mt-3 w-full px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 text-sm transition-all duration-200"
                  >
                    إلغاء تحميل الجميع
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Performance Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              ⚡ إعدادات الأداء
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Memory Limit */}
              <div className="space-y-3">
                <label className="block text-white font-medium">
                  حد الذاكرة (MB)
                </label>
                <input
                  type="range"
                  min="1024"
                  max="16384"
                  step="512"
                  value={settings.memoryLimit}
                  onChange={(e) =>
                    handleSettingChange("memoryLimit", parseInt(e.target.value))
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-white/70">
                  <span>1 GB</span>
                  <span className="text-white">{settings.memoryLimit} MB</span>
                  <span>16 GB</span>
                </div>
              </div>

              {/* Performance Mode */}
              <div className="space-y-3">
                <label className="block text-white font-medium">
                  وضع الأداء
                </label>
                <select
                  value={settings.performanceMode}
                  onChange={(e) =>
                    handleSettingChange("performanceMode", e.target.value)
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white"
                >
                  <option value="power_saving">توفير الطاقة</option>
                  <option value="balanced">متوازن</option>
                  <option value="performance">أداء عالي</option>
                </select>
                <p className="text-sm text-white/60">
                  {getPerformanceModeDescription(settings.performanceMode)}
                </p>
              </div>

              {/* Preferred Backend */}
              <div className="space-y-3">
                <label className="block text-white font-medium">
                  معالج الحوسبة المفضل
                </label>
                <select
                  value={settings.preferredBackend}
                  onChange={(e) =>
                    handleSettingChange("preferredBackend", e.target.value)
                  }
                  className="w-full px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white"
                >
                  <option value="auto">تلقائي</option>
                  <option value="webgl">WebGL (GPU)</option>
                  <option value="cpu">المعالج العادي</option>
                </select>
                <p className="text-sm text-white/60">
                  {getBackendDescription(settings.preferredBackend)}
                </p>
              </div>

              {/* Max Concurrent Models */}
              <div className="space-y-3">
                <label className="block text-white font-medium">
                  الحد الأقصى للنماذج المتزامنة
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={settings.maxConcurrentModels}
                  onChange={(e) =>
                    handleSettingChange(
                      "maxConcurrentModels",
                      parseInt(e.target.value),
                    )
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-white/70">
                  <span>1</span>
                  <span className="text-white">
                    {settings.maxConcurrentModels}
                  </span>
                  <span>10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Memory Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              💾 إدارة الذاكرة
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Auto Unload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-white font-medium">
                    الإ��غاء التلقائي للنماذج
                  </label>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.autoUnload}
                      onChange={(e) =>
                        handleSettingChange("autoUnload", e.target.checked)
                      }
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <p className="text-sm text-white/60">
                  إلغاء تحميل النماذج غير المستخدمة تلقائياً لتوفير الذاكرة
                </p>
              </div>

              {/* Auto Unload Delay */}
              {settings.autoUnload && (
                <div className="space-y-3">
                  <label className="block text-white font-medium">
                    تأخير الإلغاء التلقائي (دقائق)
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={settings.autoUnloadDelay}
                    onChange={(e) =>
                      handleSettingChange(
                        "autoUnloadDelay",
                        parseInt(e.target.value),
                      )
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-white/70">
                    <span>5 min</span>
                    <span className="text-white">
                      {settings.autoUnloadDelay} min
                    </span>
                    <span>2 hours</span>
                  </div>
                </div>
              )}

              {/* Cache Size */}
              <div className="space-y-3">
                <label className="block text-white font-medium">
                  حجم التخزين المؤقت (MB)
                </label>
                <input
                  type="range"
                  min="512"
                  max="8192"
                  step="256"
                  value={settings.cacheSize}
                  onChange={(e) =>
                    handleSettingChange("cacheSize", parseInt(e.target.value))
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-white/70">
                  <span>512 MB</span>
                  <span className="text-white">{settings.cacheSize} MB</span>
                  <span>8 GB</span>
                </div>
              </div>

              {/* Enable Fallback */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-white font-medium">
                    تفعيل النماذج الاحتياطية
                  </label>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.enableFallback}
                      onChange={(e) =>
                        handleSettingChange("enableFallback", e.target.checked)
                      }
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <p className="text-sm text-white/60">
                  استخدام نماذج احتياطية عند فشل تحميل النماذج الأصلية
                </p>
              </div>
            </div>
          </div>

          {/* Startup Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              🚀 إعدادات البدء
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">
                    تحميل النماذج الأساسية مسبقاً
                  </label>
                  <p className="text-sm text-white/60">
                    تحميل النماذج الأساسية عند بد�� التطبيق لتسريع الاستجابة
                  </p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.preloadEssential}
                    onChange={(e) =>
                      handleSettingChange("preloadEssential", e.target.checked)
                    }
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-white/10">
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded-lg text-gray-300 font-medium transition-all duration-200"
          >
            🔄 إعادة تعيين
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded-lg text-gray-300 font-medium transition-all duration-200"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-knoux-purple hover:bg-knoux-purple/80 border border-knoux-purple/30 rounded-lg text-white font-medium transition-all duration-200"
            >
              💾 حفظ الإعدادات
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
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
          transition: 0.4s;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: rgba(139, 92, 246, 0.6);
          border-color: rgba(139, 92, 246, 0.8);
        }

        input:checked + .slider:before {
          transform: translateX(24px);
        }
      `}</style>
    </div>
  );
};

export default AdvancedModelSettings;
