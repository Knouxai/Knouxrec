import React, { useState, useEffect, useRef } from "react";
import {
  knouxMorphCore,
  MorphCategory,
  MorphTool,
  ProcessResult,
} from "../services/knouxMorphCore";
import "../styles/morphcore.css";

interface KnouxMorphCorePanelProps {
  onClose?: () => void;
}

const KnouxMorphCorePanel: React.FC<KnouxMorphCorePanelProps> = ({
  onClose,
}) => {
  const [categories, setCategories] = useState<MorphCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTool, setSelectedTool] = useState<MorphTool | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBefore, setShowBefore] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["body_scale"]),
  );
  const [usageStats, setUsageStats] = useState<any>(null);
  const [processingResult, setProcessingResult] =
    useState<ProcessResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cats = knouxMorphCore.getCategories();
    setCategories(cats);
    if (cats.length > 0) {
      setSelectedCategory(cats[0].id);
    }
    updateStats();
  }, []);

  const updateStats = () => {
    const stats = knouxMorphCore.getUsageStats();
    setUsageStats(stats);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imagePath = e.target?.result as string;
        setCurrentImage(imagePath);
        setOriginalImage(imagePath);
        knouxMorphCore.setCurrentImage(imagePath);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const selectTool = (tool: MorphTool) => {
    setSelectedTool(tool);
  };

  const applyTool = async () => {
    if (!selectedTool || !currentImage) return;

    setIsProcessing(true);
    setProcessingResult(null);

    try {
      const settings = selectedTool.settings.reduce((acc, setting) => {
        acc[setting.id] = setting.value;
        return acc;
      }, {} as any);

      const result = await knouxMorphCore.applyTool(
        selectedTool.category,
        selectedTool.id,
        settings,
      );

      setProcessingResult(result);

      if (result.success) {
        // محاكاة تحديث الصورة
        setCurrentImage(currentImage + `?processed=${Date.now()}`);
        updateStats();
        showNotification(
          `تم تطبيق ${selectedTool.name} بنجاح! (${result.processingTime}ms)`,
          "success",
        );
      } else {
        showNotification(
          `فشل في تطبيق ${selectedTool.name}: ${result.error}`,
          "error",
        );
      }
    } catch (error) {
      showNotification("حدث خطأ أثناء المعالجة", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetToOriginal = () => {
    if (originalImage) {
      setCurrentImage(originalImage);
      knouxMorphCore.resetToOriginal();
      updateStats();
      showNotification("تم إعادة تعيين الصورة للحالة الأصلية", "info");
    }
  };

  const openCategoryFolder = (categoryId: string) => {
    knouxMorphCore.openCategoryFolder(categoryId);
    showNotification("تم فتح مجلد الأدوات", "info");
  };

  const updateToolSetting = (settingId: string, value: any) => {
    if (!selectedTool) return;

    const updatedTool = {
      ...selectedTool,
      settings: selectedTool.settings.map((setting) =>
        setting.id === settingId ? { ...setting, value } : setting,
      ),
    };
    setSelectedTool(updatedTool);
  };

  const showNotification = (message: string, type: string) => {
    const event = new CustomEvent("showNotification", {
      detail: { message, type },
    });
    window.dispatchEvent(event);
  };

  const renderToolSetting = (setting: any) => {
    switch (setting.type) {
      case "slider":
        return (
          <div key={setting.id} className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">
              {setting.name}: {setting.value}
            </label>
            <input
              type="range"
              min={setting.min}
              max={setting.max}
              step={setting.step}
              value={setting.value}
              onChange={(e) =>
                updateToolSetting(setting.id, Number(e.target.value))
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        );

      case "toggle":
        return (
          <div key={setting.id} className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={setting.value}
                onChange={(e) =>
                  updateToolSetting(setting.id, e.target.checked)
                }
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-white">
                {setting.name}
              </span>
            </label>
          </div>
        );

      case "select":
        return (
          <div key={setting.id} className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">
              {setting.name}
            </label>
            <select
              value={setting.value}
              onChange={(e) => updateToolSetting(setting.id, e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              {setting.options?.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex">
      {/* القائمة ��لجانبية - الأدوات */}
      <div className="w-80 bg-gradient-to-b from-gray-900 to-black border-r border-purple-500/30 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              🧱 Knoux MorphCore™
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="text-sm text-cyan-400 mb-6">
            Offline Visual Patch Lab
            <br />
            <span className="text-xs text-gray-400">
              50 أداة محلية • بدون AI
            </span>
          </div>

          {/* إحصائيات سريعة */}
          {usageStats && (
            <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="text-sm font-semibold text-white mb-2">
                📊 الإحصائيات
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-gray-400">
                  المجموعات:{" "}
                  <span className="text-white">
                    {usageStats.totalCategories}
                  </span>
                </div>
                <div className="text-gray-400">
                  الأدوات:{" "}
                  <span className="text-white">{usageStats.totalTools}</span>
                </div>
                <div className="text-gray-400">
                  المفعلة:{" "}
                  <span className="text-green-400">
                    {usageStats.activeTools}
                  </span>
                </div>
                <div className="text-gray-400">
                  المخرجات:{" "}
                  <span className="text-blue-400">
                    {usageStats.outputHistory}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* قائمة الفئات والأدوات */}
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border border-gray-700 rounded-lg overflow-hidden"
              >
                <div
                  className="flex items-center justify-between p-3 bg-gray-800/30 cursor-pointer hover:bg-gray-700/30 transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{category.icon}</span>
                    <div>
                      <div className="font-medium text-white text-sm">
                        {category.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {category.tools.length} أداة
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCategoryFolder(category.id);
                      }}
                      className="p-1 text-xs bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 transition-colors"
                      title="فتح مجلد الأدوات"
                    >
                      📂
                    </button>
                    <span
                      className={`transform transition-transform ${expandedCategories.has(category.id) ? "rotate-180" : ""}`}
                    >
                      ▼
                    </span>
                  </div>
                </div>

                {expandedCategories.has(category.id) && (
                  <div className="bg-gray-900/50">
                    {category.tools.map((tool) => (
                      <div
                        key={tool.id}
                        className={`p-3 border-t border-gray-700/50 cursor-pointer hover:bg-gray-700/30 transition-colors ${
                          selectedTool?.id === tool.id
                            ? "bg-purple-500/20 border-l-4 border-l-purple-500"
                            : ""
                        }`}
                        onClick={() => selectTool(tool)}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{tool.icon}</span>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">
                              {tool.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {tool.nameEn}
                            </div>
                          </div>
                          {tool.lastUsed && (
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* المنطقة الرئيسية */}
      <div className="flex-1 flex flex-col">
        {/* شريط الأدوات العلوي */}
        <div className="flex items-center justify-between p-4 bg-gray-900/50 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors"
            >
              📁 تحميل صورة
            </button>

            <button
              onClick={resetToOriginal}
              disabled={!originalImage}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              🔄 إعادة تعيين
            </button>

            <button
              onClick={() => setShowBefore(!showBefore)}
              disabled={!currentImage}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showBefore
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-500 hover:bg-gray-600 text-white"
              }`}
            >
              {showBefore ? "👁️ إظهار بعد" : "👁️ إظهار قبل"}
            </button>
          </div>

          <div className="text-sm text-gray-400">
            {selectedTool
              ? `الأداة المحددة: ${selectedTool.name}`
              : "لم يتم تحديد أداة"}
          </div>
        </div>

        <div className="flex-1 flex">
          {/* منطقة عرض الصورة */}
          <div className="flex-1 p-6 flex items-center justify-center bg-gray-800/30">
            {currentImage ? (
              <div className="relative max-w-full max-h-full">
                <img
                  src={
                    showBefore ? originalImage || currentImage : currentImage
                  }
                  alt="معاينة"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <div className="text-white text-center">
                      <div className="animate-spin text-4xl mb-2">⚙️</div>
                      <div>جاري المعالجة...</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-4">🖼️</div>
                <div className="text-xl mb-2">لا توجد صورة محددة</div>
                <div className="text-sm">
                  انقر على "تحميل صورة" لبدء التعديل
                </div>
              </div>
            )}
          </div>

          {/* لوحة إعدادات الأداة */}
          {selectedTool && (
            <div className="w-80 bg-gray-900/50 border-l border-gray-700 p-6 overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-2">
                  {selectedTool.icon} {selectedTool.name}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {selectedTool.description}
                </p>
                <div className="text-xs text-cyan-400">
                  📁 {selectedTool.executable}
                </div>
              </div>

              {/* إعدادات الأداة */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-white mb-4">
                  ⚙️ الإعدادات
                </h4>
                {selectedTool.settings.map(renderToolSetting)}
              </div>

              {/* أزرار التحكم */}
              <div className="space-y-3">
                <button
                  onClick={applyTool}
                  disabled={!currentImage || isProcessing}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-bold transition-all transform hover:scale-105"
                >
                  {isProcessing ? "⚙️ جاري التطبيق..." : "✨ تطبيق الأداة"}
                </button>

                {processingResult && (
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      processingResult.success
                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                        : "bg-red-500/20 text-red-300 border border-red-500/30"
                    }`}
                  >
                    {processingResult.success
                      ? `✅ تم بنجاح في ${processingResult.processingTime}ms`
                      : `❌ فشل: ${processingResult.error}`}
                  </div>
                )}
              </div>

              {/* معلومات إضافية */}
              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <h5 className="text-sm font-semibold text-white mb-2">
                  💡 نصائح الاستخدام
                </h5>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• ابدأ بقيم منخفضة وزد تدريجياً</li>
                  <li>• استخدم "إظهار قبل/بعد" للمقارنة</li>
                  <li>• يمكن حفظ الإعدادات كنموذج</li>
                  <li>• جميع العمليات محلية 100%</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #3b82f6);
          cursor: pointer;
          border: 2px solid #1f2937;
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #3b82f6);
          cursor: pointer;
          border: 2px solid #1f2937;
        }
      `}</style>
    </div>
  );
};

export default KnouxMorphCorePanel;
