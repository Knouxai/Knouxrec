import React, { useState, useEffect } from "react";
import { VisualPatchTool, ToolSettings } from "../types/visualPatchLab";

interface VisualPatchToolSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  tool: VisualPatchTool | null;
  settings: ToolSettings;
  onSettingsChange: (settings: ToolSettings) => void;
}

const VisualPatchToolSettings: React.FC<VisualPatchToolSettingsProps> = ({
  isOpen,
  onClose,
  tool,
  settings,
  onSettingsChange,
}) => {
  const [localSettings, setLocalSettings] = useState<ToolSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, tool]);

  if (!isOpen || !tool) return null;

  const handleSliderChange = (key: keyof ToolSettings, value: number) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleToggleChange = (key: keyof ToolSettings, value: boolean) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const resetToDefaults = () => {
    const defaultSettings: ToolSettings = {
      intensity: tool.defaultIntensity,
      brushSize: tool.defaultBrushSize,
      feather: tool.defaultFeather,
      symmetryEnabled: tool.supportsSymmetry,
      realTimePreview: tool.realTimePreview,
      snapToGrid: false,
      showGuides: true,
      preserveAspectRatio: true,
      autoSave: true,
      undoLevels: 50,
    };
    setLocalSettings(defaultSettings);
    onSettingsChange(defaultSettings);
  };

  const getCategoryGradient = (category: string): string => {
    switch (category) {
      case "body-scale":
        return "from-green-500/30 to-emerald-600/30";
      case "waist-belly":
        return "from-purple-500/30 to-violet-600/30";
      case "chest":
        return "from-pink-500/30 to-rose-600/30";
      case "hips-thighs":
        return "from-orange-500/30 to-amber-600/30";
      case "legs-feet":
        return "from-blue-500/30 to-cyan-600/30";
      case "arms-shoulders":
        return "from-teal-500/30 to-emerald-600/30";
      case "head-face":
        return "from-yellow-500/30 to-orange-600/30";
      case "freeform":
        return "from-indigo-500/30 to-purple-600/30";
      default:
        return "from-gray-500/30 to-slate-600/30";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black/90 border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className={`bg-gradient-to-r ${getCategoryGradient(tool.category)} p-6 rounded-t-2xl border-b border-white/20`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{tool.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-white">{tool.nameAr}</h2>
                <p className="text-white/80 text-sm">{tool.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
              <span className="text-white text-xl">✕</span>
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="p-6 space-y-6">
          {/* Tool Description */}
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-2">وصف الأداة</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              {tool.descriptionAr}
            </p>
          </div>

          {/* Primary Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg">
              الإعدادات الأساسية
            </h3>

            {/* Intensity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-white font-medium">شدة التأثير</label>
                <span className="text-white/70 text-sm">
                  {localSettings.intensity}%
                </span>
              </div>
              <input
                type="range"
                min="1"
                max={tool.maxIntensity}
                value={localSettings.intensity}
                onChange={(e) =>
                  handleSliderChange("intensity", parseInt(e.target.value))
                }
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, ${tool.previewColor} 0%, ${tool.previewColor} ${(localSettings.intensity / tool.maxIntensity) * 100}%, rgba(255,255,255,0.2) ${(localSettings.intensity / tool.maxIntensity) * 100}%, rgba(255,255,255,0.2) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-white/50">
                <span>ضعيف</span>
                <span>متوسط</span>
                <span>قوي</span>
              </div>
            </div>

            {/* Brush Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-white font-medium">حجم الفرشاة</label>
                <span className="text-white/70 text-sm">
                  {localSettings.brushSize}px
                </span>
              </div>
              <input
                type="range"
                min="10"
                max={tool.maxBrushSize}
                value={localSettings.brushSize}
                onChange={(e) =>
                  handleSliderChange("brushSize", parseInt(e.target.value))
                }
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-white/50">
                <span>صغير</span>
                <span>متوسط</span>
                <span>كبير</span>
              </div>
            </div>

            {/* Feather */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-white font-medium">نعومة الحواف</label>
                <span className="text-white/70 text-sm">
                  {localSettings.feather}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={localSettings.feather}
                onChange={(e) =>
                  handleSliderChange("feather", parseInt(e.target.value))
                }
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-white/50">
                <span>حاد</span>
                <span>ناعم</span>
                <span>ناعم جداً</span>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg">إعدادات متقدمة</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Symmetry */}
              {tool.supportsSymmetry && (
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <label className="text-white font-medium">التماثل</label>
                    <p className="text-white/60 text-xs">
                      تطبيق التأثير على الجانبين
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleToggleChange(
                        "symmetryEnabled",
                        !localSettings.symmetryEnabled,
                      )
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      localSettings.symmetryEnabled
                        ? "bg-green-500"
                        : "bg-white/20"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                        localSettings.symmetryEnabled
                          ? "translate-x-7"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Real-time Preview */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <label className="text-white font-medium">معاينة فورية</label>
                  <p className="text-white/60 text-xs">
                    عرض التغييرات أثناء التحرير
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleToggleChange(
                      "realTimePreview",
                      !localSettings.realTimePreview,
                    )
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    localSettings.realTimePreview
                      ? "bg-green-500"
                      : "bg-white/20"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      localSettings.realTimePreview
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Snap to Grid */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <label className="text-white font-medium">
                    الانطباق للشبكة
                  </label>
                  <p className="text-white/60 text-xs">محاذاة التحرير للشبكة</p>
                </div>
                <button
                  onClick={() =>
                    handleToggleChange("snapToGrid", !localSettings.snapToGrid)
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    localSettings.snapToGrid ? "bg-green-500" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      localSettings.snapToGrid
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Show Guides */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <label className="text-white font-medium">إظهار الأدلة</label>
                  <p className="text-white/60 text-xs">عرض خطوط الإرشاد</p>
                </div>
                <button
                  onClick={() =>
                    handleToggleChange("showGuides", !localSettings.showGuides)
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    localSettings.showGuides ? "bg-green-500" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      localSettings.showGuides
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Auto Save */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <label className="text-white font-medium">حفظ تلقائي</label>
                  <p className="text-white/60 text-xs">
                    حفظ التغييرات تلقائياً
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleToggleChange("autoSave", !localSettings.autoSave)
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    localSettings.autoSave ? "bg-green-500" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      localSettings.autoSave ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Preserve Aspect Ratio */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <label className="text-white font-medium">حفظ النسبة</label>
                  <p className="text-white/60 text-xs">
                    الحفاظ على نسبة العرض ��لارتفاع
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleToggleChange(
                      "preserveAspectRatio",
                      !localSettings.preserveAspectRatio,
                    )
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    localSettings.preserveAspectRatio
                      ? "bg-green-500"
                      : "bg-white/20"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      localSettings.preserveAspectRatio
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Undo Levels */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-white font-medium">
                  مستويات التراجع
                </label>
                <span className="text-white/70 text-sm">
                  {localSettings.undoLevels}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={localSettings.undoLevels}
                onChange={(e) =>
                  handleSliderChange("undoLevels", parseInt(e.target.value))
                }
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-white/50">
                <span>10</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>
          </div>

          {/* Tool Specifications */}
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-3">مواصفات الأداة</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">نمط التحرير:</span>
                <span className="text-white capitalize">{tool.editMode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">معقدة المعالجة:</span>
                <span className="text-white capitalize">
                  {tool.processingComplexity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">يتطلب تحديد منطقة:</span>
                <span className="text-white">
                  {tool.requiresRegionSelection ? "نعم" : "لا"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">لون المعاينة:</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border border-white/30"
                    style={{ backgroundColor: tool.previewColor }}
                  />
                  <span className="text-white text-xs">
                    {tool.previewColor}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20 flex items-center justify-between">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white transition-colors duration-200"
          >
            إعادة تعيين
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white transition-colors duration-200"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualPatchToolSettings;
