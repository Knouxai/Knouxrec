import React, { useState, useCallback, useRef } from "react";
import VisualPatchToolCard from "./VisualPatchToolCard";
import ToolCategorySelector from "./ToolCategorySelector";
import VisualPatchToolSettings from "./VisualPatchToolSettings";
import VisualPatchCanvas from "./VisualPatchCanvas";
import {
  ToolCategory,
  VisualPatchTool,
  ToolSettings,
  CanvasState,
  EditRegion,
  EditSession,
  ExportOptions,
  ALL_VISUAL_PATCH_TOOLS,
  BODY_SCALE_TOOLS,
  WAIST_BELLY_TOOLS,
  CHEST_TOOLS,
  HIPS_THIGHS_TOOLS,
  LEGS_FEET_TOOLS,
  ARMS_SHOULDERS_TOOLS,
  HEAD_FACE_TOOLS,
  FREEFORM_TOOLS,
} from "../types/visualPatchLab";
import { visualPatchLabService } from "../services/visualPatchLabService";

interface VisualPatchLabPanelProps {}

const VisualPatchLabPanel: React.FC<VisualPatchLabPanelProps> = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [selectedCategory, setSelectedCategory] = useState<
    ToolCategory | "all"
  >("all");
  const [selectedTool, setSelectedTool] = useState<VisualPatchTool | null>(
    null,
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<EditSession | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);

  // Tool settings
  const [toolSettings, setToolSettings] = useState<ToolSettings>({
    intensity: 30,
    brushSize: 80,
    feather: 25,
    symmetryEnabled: true,
    realTimePreview: true,
    snapToGrid: false,
    showGuides: true,
    preserveAspectRatio: true,
    autoSave: true,
    undoLevels: 50,
  });

  // Canvas state
  const [canvasState, setCanvasState] = useState<CanvasState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    isDrawing: false,
    isDragging: false,
    currentTool: null,
    selectedRegions: [],
    guides: {
      horizontal: [],
      vertical: [],
    },
  });

  // Get tools by category
  const getToolsByCategory = (
    category: ToolCategory | "all",
  ): VisualPatchTool[] => {
    if (category === "all") return ALL_VISUAL_PATCH_TOOLS;

    switch (category) {
      case "body-scale":
        return BODY_SCALE_TOOLS;
      case "waist-belly":
        return WAIST_BELLY_TOOLS;
      case "chest":
        return CHEST_TOOLS;
      case "hips-thighs":
        return HIPS_THIGHS_TOOLS;
      case "legs-feet":
        return LEGS_FEET_TOOLS;
      case "arms-shoulders":
        return ARMS_SHOULDERS_TOOLS;
      case "head-face":
        return HEAD_FACE_TOOLS;
      case "freeform":
        return FREEFORM_TOOLS;
      default:
        return [];
    }
  };

  // Filter tools by search
  const filteredTools = getToolsByCategory(selectedCategory).filter(
    (tool) =>
      tool.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Get tool counts for category selector
  const toolCounts = {
    "body-scale": BODY_SCALE_TOOLS.length,
    "waist-belly": WAIST_BELLY_TOOLS.length,
    chest: CHEST_TOOLS.length,
    "hips-thighs": HIPS_THIGHS_TOOLS.length,
    "legs-feet": LEGS_FEET_TOOLS.length,
    "arms-shoulders": ARMS_SHOULDERS_TOOLS.length,
    "head-face": HEAD_FACE_TOOLS.length,
    freeform: FREEFORM_TOOLS.length,
  };

  // File upload handling
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("يرجى اختيار ملف صورة صالح");
        return;
      }

      try {
        setIsProcessing(true);
        const sessionId = await visualPatchLabService.createSession(file);
        const session = visualPatchLabService.getCurrentSession();
        setCurrentSession(session);
        setIsProcessing(false);
      } catch (error) {
        console.error("Failed to load image:", error);
        alert("فشل في تحميل الصورة");
        setIsProcessing(false);
      }
    },
    [],
  );

  // Tool selection
  const handleToolSelect = useCallback((toolId: string) => {
    const tool = ALL_VISUAL_PATCH_TOOLS.find((t) => t.id === toolId);
    if (tool) {
      setSelectedTool(tool);

      // Update tool settings with tool defaults
      setToolSettings((prev) => ({
        ...prev,
        intensity: tool.defaultIntensity,
        brushSize: tool.defaultBrushSize,
        feather: tool.defaultFeather,
        symmetryEnabled: tool.supportsSymmetry,
        realTimePreview: tool.realTimePreview,
      }));
    }
  }, []);

  // Region completion (tool application)
  const handleRegionComplete = useCallback(
    async (regions: EditRegion[]) => {
      if (!selectedTool || !currentSession) return;

      try {
        setIsProcessing(true);
        await visualPatchLabService.applyTool(
          selectedTool.id,
          regions,
          toolSettings,
        );

        // Update current session
        const updatedSession = visualPatchLabService.getCurrentSession();
        setCurrentSession(updatedSession);

        setIsProcessing(false);
      } catch (error) {
        console.error("Tool application failed:", error);
        alert("فشل في تطبيق الأداة");
        setIsProcessing(false);
      }
    },
    [selectedTool, currentSession, toolSettings],
  );

  // Undo/Redo
  const handleUndo = useCallback(() => {
    if (visualPatchLabService.canUndo()) {
      visualPatchLabService.undo();
      const updatedSession = visualPatchLabService.getCurrentSession();
      setCurrentSession(updatedSession);
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (visualPatchLabService.canRedo()) {
      visualPatchLabService.redo();
      const updatedSession = visualPatchLabService.getCurrentSession();
      setCurrentSession(updatedSession);
    }
  }, []);

  // Reset to original
  const handleReset = useCallback(() => {
    if (currentSession && confirm("هل تريد إعادة تعيين جميع التعديلات؟")) {
      visualPatchLabService.resetToOriginal();
      const updatedSession = visualPatchLabService.getCurrentSession();
      setCurrentSession(updatedSession);
    }
  }, [currentSession]);

  // Export image
  const handleExport = useCallback(async () => {
    if (!currentSession) return;

    const exportOptions: ExportOptions = {
      format: "png",
      quality: 95,
      resolution: "original",
      includeMetadata: true,
      watermark: {
        text: "KNOUX MorphCore™",
        position: "bottom-right",
        opacity: 0.3,
      },
    };

    try {
      setIsProcessing(true);
      const exportedImage =
        await visualPatchLabService.exportImage(exportOptions);

      // Download the image
      const link = document.createElement("a");
      link.download = `knoux-morph-${Date.now()}.png`;
      link.href = exportedImage;
      link.click();

      setIsProcessing(false);
    } catch (error) {
      console.error("Export failed:", error);
      alert("فشل في تصدير الصورة");
      setIsProcessing(false);
    }
  }, [currentSession]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="border-b border-white/20 bg-black/50 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="text-4xl">🧩</div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Knoux MorphCore™
                </h1>
                <p className="text-white/70 text-sm">
                  Visual Patch Lab - 50 أداة تحرير تفاعلية
                </p>
              </div>
            </div>

            {/* Main Actions */}
            <div className="flex items-center gap-3">
              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50"
              >
                <span>📁</span>
                تحميل صورة
              </button>

              {/* Session Actions */}
              {currentSession && (
                <>
                  <button
                    onClick={() => setShowBeforeAfter(!showBeforeAfter)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white transition-colors duration-200"
                  >
                    <span>{showBeforeAfter ? "👀" : "🔄"}</span>
                    {showBeforeAfter ? "إخفاء المقارنة" : "قبل/بعد"}
                  </button>

                  <button
                    onClick={handleExport}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium transition-colors duration-200 disabled:opacity-50"
                  >
                    <span>💾</span>
                    تصدير
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Session Info */}
          {currentSession && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-white/70">
                <span>
                  📏 {currentSession.width} × {currentSession.height}
                </span>
                <span>🕒 {currentSession.operations.length} عملية</span>
                <span>
                  💾{" "}
                  {visualPatchLabService.hasUnsavedChanges()
                    ? "غير محفوظ"
                    : "محفوظ"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleUndo}
                  disabled={!visualPatchLabService.canUndo() || isProcessing}
                  className="p-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white transition-colors duration-200 disabled:opacity-50"
                  title="تراجع"
                >
                  ↶
                </button>
                <button
                  onClick={handleRedo}
                  disabled={!visualPatchLabService.canRedo() || isProcessing}
                  className="p-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white transition-colors duration-200 disabled:opacity-50"
                  title="إعادة"
                >
                  ↷
                </button>
                <button
                  onClick={handleReset}
                  disabled={!currentSession || isProcessing}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 hover:text-red-200 transition-colors duration-200 disabled:opacity-50"
                  title="إعادة تعيين"
                >
                  🔄
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Left Panel - Tools */}
          <div className="xl:col-span-1 space-y-6 max-h-full overflow-y-auto">
            {/* Category Selector */}
            <ToolCategorySelector
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              toolCounts={toolCounts}
            />

            {/* Search and View Controls */}
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="البحث في الأدوات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
                className="p-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white transition-colors duration-200"
                title={viewMode === "grid" ? "عرض قائمة" : "عرض شبكة"}
              >
                {viewMode === "grid" ? "📋" : "⊞"}
              </button>
            </div>

            {/* Tools Grid/List */}
            <div
              className={`
              ${
                viewMode === "grid"
                  ? "grid grid-cols-1 lg:grid-cols-2 gap-4"
                  : "space-y-3"
              }
            `}
            >
              {filteredTools.map((tool) => (
                <VisualPatchToolCard
                  key={tool.id}
                  tool={tool}
                  isSelected={selectedTool?.id === tool.id}
                  isEnabled={!isProcessing}
                  onSelect={handleToolSelect}
                  onSettings={(toolId) => {
                    handleToolSelect(toolId);
                    setIsSettingsOpen(true);
                  }}
                  compact={viewMode === "list"}
                />
              ))}
            </div>

            {/* No Tools Found */}
            {filteredTools.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-white/60 text-lg font-medium">
                  لا توجد أدوات مطابقة
                </p>
                <p className="text-white/40 text-sm">جرب كلمات بحث مختلفة</p>
              </div>
            )}
          </div>

          {/* Right Panel - Canvas */}
          <div className="xl:col-span-2">
            <div className="h-full glass-card border border-white/20 rounded-2xl p-4">
              <VisualPatchCanvas
                selectedTool={selectedTool}
                settings={toolSettings}
                canvasState={canvasState}
                onCanvasStateChange={(state) =>
                  setCanvasState((prev) => ({ ...prev, ...state }))
                }
                onRegionComplete={handleRegionComplete}
                isProcessing={isProcessing}
                showBeforeAfter={showBeforeAfter}
                originalImage={currentSession?.originalImage || null}
                currentImage={currentSession?.currentImage || null}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tool Settings Modal */}
      <VisualPatchToolSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        tool={selectedTool}
        settings={toolSettings}
        onSettingsChange={setToolSettings}
      />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="glass-card p-8 rounded-2xl text-center">
            <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-purple-500 rounded-full mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">
              جار المعالجة...
            </h3>
            <p className="text-white/70">يرجى الانتظار أثناء تطبيق التأثيرات</p>
          </div>
        </div>
      )}

      {/* Instructions Overlay */}
      {!currentSession && !isProcessing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center">
          <div className="glass-card p-12 rounded-2xl text-center max-w-lg mx-4">
            <div className="text-8xl mb-6">🧩</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Knoux MorphCore™
            </h2>
            <p className="text-white/80 text-lg mb-6 leading-relaxed">
              مختبر التعديل البصري المتقدم مع 50 أداة تحرير تفاعلية تعمل بالكامل
              أوفلاين
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-xl"
            >
              🚀 ابدأ التحرير - تحميل صورة
            </button>

            <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <span>🎨</span>
                <span>50 أداة متخصصة</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span>معالجة فورية</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔒</span>
                <span>عمل أوفلاين 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💎</span>
                <span>جودة احترافية</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualPatchLabPanel;
