import React, { useState } from "react";
import { OfflineAITool } from "../services/offlineAIToolsService";

interface ToolSettingsDialogProps {
  tool: OfflineAITool | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
}

const ToolSettingsDialog: React.FC<ToolSettingsDialogProps> = ({
  tool,
  isOpen,
  onClose,
  onSave,
}) => {
  const [settings, setSettings] = useState({
    quality: "balanced",
    outputFormat: "auto",
    maxDuration: 300, // 5 minutes
    batchSize: 1,
    enableGPU: true,
    autoOptimize: true,
    customParams: {},
  });

  const [activeTab, setActiveTab] = useState("general");

  if (!isOpen || !tool) return null;

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/20">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCategoryGradient(tool.category)} flex items-center justify-center text-2xl`}
              >
                {tool.icon}
              </div>
              <div>
                <h2 className="text-xl font-orbitron font-bold text-white">
                  إعدادات {tool.name}
                </h2>
                <p className="text-white/60 text-sm">{tool.nameEn} Settings</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar Tabs */}
          <div className="w-1/4 p-6 border-r border-white/10">
            <nav className="space-y-2">
              {[
                { id: "general", name: "عام", icon: "⚙️" },
                { id: "performance", name: "الأداء", icon: "⚡" },
                { id: "output", name: "الإخراج", icon: "📤" },
                { id: "advanced", name: "متقدم", icon: "🔧" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                    activeTab === tab.id
                      ? "bg-knoux-purple text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 p-6">
            {activeTab === "general" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  الإعدادات العامة
                </h3>

                {/* Quality Setting */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    جودة المعالجة
                  </label>
                  <select
                    value={settings.quality}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        quality: e.target.value,
                      }))
                    }
                    className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white"
                  >
                    <option value="fast">سريع - معالجة أسرع بجودة أقل</option>
                    <option value="balanced">
                      متوازن - توازن بين السرعة والجودة
                    </option>
                    <option value="high">عالي - أفضل جودة مع وقت أطول</option>
                  </select>
                  <p className="text-white/60 text-sm mt-1">
                    يؤثر على سرعة المعالجة وجودة النتائج
                  </p>
                </div>

                {/* GPU Acceleration */}
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">تسريع GPU</h4>
                    <p className="text-white/60 text-sm">
                      استخدام معالج الرسوم لتسريع المعالجة
                    </p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.enableGPU}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          enableGPU: e.target.checked,
                        }))
                      }
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                {/* Auto Optimize */}
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">تحسين تلقائي</h4>
                    <p className="text-white/60 text-sm">
                      تحسين الإعدادات تلقائياً حسب نوع المدخل
                    </p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.autoOptimize}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          autoOptimize: e.target.checked,
                        }))
                      }
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === "performance" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  إعدادات الأداء
                </h3>

                {/* Max Duration */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    الحد الأقصى لمدة المعالجة (ثانية)
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="1800"
                    step="30"
                    value={settings.maxDuration}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        maxDuration: parseInt(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-white/60 mt-1">
                    <span>30s</span>
                    <span className="text-white">
                      {Math.floor(settings.maxDuration / 60)}m{" "}
                      {settings.maxDuration % 60}s
                    </span>
                    <span>30m</span>
                  </div>
                </div>

                {/* Batch Size */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    حجم الدفعة
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={settings.batchSize}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        batchSize: parseInt(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-white/60 mt-1">
                    <span>1</span>
                    <span className="text-white">{settings.batchSize}</span>
                    <span>10</span>
                  </div>
                  <p className="text-white/60 text-sm mt-1">
                    عدد الملفات التي يتم معالجتها في نفس الوقت
                  </p>
                </div>

                {/* Memory Usage */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h4 className="text-blue-300 font-medium mb-2">
                    📊 استخدام الذاكرة المتوقع
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/70">النموذج:</span>
                      <span className="text-white ml-2">
                        {tool.modelSize}MB
                      </span>
                    </div>
                    <div>
                      <span className="text-white/70">المعالجة:</span>
                      <span className="text-white ml-2">
                        ~{Math.round(tool.modelSize * 0.3)}MB
                      </span>
                    </div>
                    <div>
                      <span className="text-white/70">المجموع:</span>
                      <span className="text-white ml-2">
                        {Math.round(tool.modelSize * 1.3)}MB
                      </span>
                    </div>
                    <div>
                      <span className="text-white/70">GPU:</span>
                      <span
                        className={`ml-2 ${settings.enableGPU ? "text-green-400" : "text-red-400"}`}
                      >
                        {settings.enableGPU ? "مفعل" : "معطل"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "output" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  إعدادات الإخراج
                </h3>

                {/* Output Format */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    تنسيق الإخراج
                  </label>
                  <select
                    value={settings.outputFormat}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        outputFormat: e.target.value,
                      }))
                    }
                    className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white"
                  >
                    <option value="auto">تلقائي - أفضل تنسيق للأداة</option>
                    {tool.outputTypes.map((format) => (
                      <option key={format} value={format}>
                        {format}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Output Quality for Different Types */}
                {tool.category === "image" && (
                  <div>
                    <label className="block text-white font-medium mb-2">
                      جودة الصورة
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      defaultValue="85"
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-white/60 mt-1">
                      <span>ضغط عالي</span>
                      <span>جودة عالية</span>
                    </div>
                  </div>
                )}

                {tool.category === "video" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white font-medium mb-2">
                        دقة الفيديو
                      </label>
                      <select className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white">
                        <option value="original">الدقة الأصلية</option>
                        <option value="720p">720p HD</option>
                        <option value="1080p">1080p Full HD</option>
                        <option value="4k">4K Ultra HD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">
                        معدل الإطارات
                      </label>
                      <select className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white">
                        <option value="original">المعدل الأصلي</option>
                        <option value="24">24 FPS</option>
                        <option value="30">30 FPS</option>
                        <option value="60">60 FPS</option>
                      </select>
                    </div>
                  </div>
                )}

                {tool.category === "audio" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white font-medium mb-2">
                        معدل العينة
                      </label>
                      <select className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white">
                        <option value="44100">44.1 kHz (CD Quality)</option>
                        <option value="48000">48 kHz (Professional)</option>
                        <option value="96000">96 kHz (High-end)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">
                        معدل البت
                      </label>
                      <select className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white">
                        <option value="128">128 kbps</option>
                        <option value="192">192 kbps</option>
                        <option value="320">320 kbps</option>
                        <option value="lossless">Lossless</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "advanced" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  الإعدادات المتقدمة
                </h3>

                {/* Tool-specific settings */}
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <h4 className="text-yellow-300 font-medium mb-2">
                    ⚠️ إعدادات متقدمة
                  </h4>
                  <p className="text-white/70 text-sm mb-4">
                    هذه الإعدادات للمستخدمين المتقدمين فقط. التغيير قد يؤثر على
                    الأداء.
                  </p>

                  {/* Custom Parameters */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      معاملات مخصصة (JSON)
                    </label>
                    <textarea
                      placeholder='{"threshold": 0.5, "iterations": 10}'
                      className="w-full h-24 p-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/50 font-mono text-sm"
                    />
                    <p className="text-white/60 text-xs mt-1">
                      معاملات إضافية بصيغة JSON لتخصيص سلوك الأداة
                    </p>
                  </div>
                </div>

                {/* Model Information */}
                <div className="p-4 bg-black/20 rounded-lg">
                  <h4 className="text-white font-medium mb-3">
                    معلومات النموذج
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/70">المسار:</span>
                      <span className="text-white ml-2 font-mono text-xs">
                        {tool.modelPath}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/70">الحجم:</span>
                      <span className="text-white ml-2">
                        {tool.modelSize}MB
                      </span>
                    </div>
                    <div>
                      <span className="text-white/70">الصعوبة:</span>
                      <span className="text-white ml-2">
                        {getDifficultyText(tool.difficulty)}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/70">النقاط:</span>
                      <span className="text-yellow-400 ml-2">
                        💎 {tool.credits}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="text-white/70">المميزات:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tool.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-knoux-purple/20 rounded-full text-xs text-white"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reset Settings */}
                <div className="flex justify-between items-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div>
                    <h4 className="text-red-300 font-medium">
                      إعادة تعيين الإعدادات
                    </h4>
                    <p className="text-white/60 text-sm">
                      استعادة الإعدادات الافتراضية لهذه الأداة
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setSettings({
                        quality: "balanced",
                        outputFormat: "auto",
                        maxDuration: 300,
                        batchSize: 1,
                        enableGPU: true,
                        autoOptimize: true,
                        customParams: {},
                      })
                    }
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 text-sm transition-all duration-200"
                  >
                    إعادة تعيين
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-white/10">
          <div className="text-white/60 text-sm">
            الإعدادات محفوظة محلياً لهذه الأداة
          </div>
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

// Helper functions
const getCategoryGradient = (category: string) => {
  switch (category) {
    case "image":
      return "from-purple-500 to-pink-500";
    case "video":
      return "from-blue-500 to-cyan-500";
    case "audio":
      return "from-green-500 to-emerald-500";
    case "text":
      return "from-yellow-500 to-orange-500";
    case "analysis":
      return "from-red-500 to-rose-500";
    default:
      return "from-gray-500 to-slate-500";
  }
};

const getDifficultyText = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "سهل";
    case "medium":
      return "متوسط";
    case "hard":
      return "صعب";
    default:
      return "غير محدد";
  }
};

export default ToolSettingsDialog;
