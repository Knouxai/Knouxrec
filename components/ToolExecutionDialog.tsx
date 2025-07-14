import React, { useState, useRef, useCallback } from "react";
import {
  OfflineAITool,
  ToolExecutionResult,
  offlineAIToolsService,
} from "../services/offlineAIToolsService";
import { feedbackService } from "../services/feedbackService";

interface ToolExecutionDialogProps {
  tool: OfflineAITool | null;
  isOpen: boolean;
  onClose: () => void;
  onResult: (result: ToolExecutionResult) => void;
}

const ToolExecutionDialog: React.FC<ToolExecutionDialogProps> = ({
  tool,
  isOpen,
  onClose,
  onResult,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [result, setResult] = useState<ToolExecutionResult | null>(null);
  const [settings, setSettings] = useState({
    quality: "balanced" as "fast" | "balanced" | "high",
    outputFormat: "auto",
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // إعادة تعيين الحالة عند فتح النافذة
  React.useEffect(() => {
    if (isOpen && tool) {
      setSelectedFile(null);
      setInputText("");
      setIsProcessing(false);
      setProgress(0);
      setStage("");
      setResult(null);
      setSettings({ quality: "balanced", outputFormat: "auto" });
    }
  }, [isOpen, tool]);

  // معالجة اختيار الملف
  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0];

      // التحقق من نوع الملف
      if (
        tool?.inputTypes.includes("*/*") ||
        tool?.inputTypes.some((type) => file.type.includes(type.split("/")[0]))
      ) {
        setSelectedFile(file);
        feedbackService.success(`تم تحديد الملف: ${file.name}`);
      } else {
        feedbackService.error("نوع الملف غير مدعوم لهذه الأداة");
      }
    },
    [tool],
  );

  // معالجة السحب والإفلات
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect],
  );

  // تشغيل الأداة
  const executeTool = async () => {
    if (!tool) return;

    // التحقق من المدخلات
    if (tool.category !== "text" && !selectedFile) {
      feedbackService.error("يرجى تحديد ملف أولاً");
      return;
    }

    if (tool.category === "text" && !inputText.trim() && !selectedFile) {
      feedbackService.error("يرجى كتابة نص أو تحديد ملف");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setStage("بدء المعالجة...");

    try {
      const executionResult = await offlineAIToolsService.executeTool(
        tool.id,
        {
          inputFile: selectedFile || undefined,
          inputText: inputText || undefined,
          settings,
          outputFormat: settings.outputFormat,
          quality: settings.quality,
        },
        (progress, stage) => {
          setProgress(progress);
          setStage(stage);
        },
      );

      setResult(executionResult);
      onResult(executionResult);

      if (executionResult.success) {
        feedbackService.success(`تم تنفيذ ${tool.name} بنجاح! 🎉`);
      } else {
        feedbackService.error(
          `فشل في تنفيذ ${tool.name}: ${executionResult.error}`,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "خطأ غير معروف";
      feedbackService.error(`خطأ في تنفيذ الأداة: ${errorMessage}`);
      setResult({
        success: false,
        error: errorMessage,
        processingTime: 0,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // تحميل النتيجة
  const downloadResult = () => {
    if (!result?.outputData) return;

    const url = URL.createObjectURL(result.outputData);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.outputPath?.split("/").pop() || `${tool?.id}_result`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    feedbackService.success("تم تحميل النتيجة بنجاح!");
  };

  // نسخ النتيجة النصية
  const copyResult = async () => {
    if (!result?.outputData) return;

    try {
      const text = await result.outputData.text();
      await navigator.clipboard.writeText(text);
      feedbackService.success("تم نسخ النتيجة إلى الحافظة!");
    } catch {
      feedbackService.error("فشل في نسخ النتيجة");
    }
  };

  // إغلاق النافذة
  const handleClose = () => {
    if (isProcessing) {
      if (!confirm("هل أنت متأكد من إلغاء العملية الجارية؟")) {
        return;
      }
    }
    onClose();
  };

  if (!isOpen || !tool) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/20">
        {/* رأس النافذة */}
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
                  {tool.name}
                </h2>
                <p className="text-white/60 text-sm">{tool.nameEn}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/60 hover:text-white transition-colors text-xl"
              disabled={isProcessing}
            >
              ✕
            </button>
          </div>
          <p className="text-white/70 text-sm mt-3">{tool.description}</p>
        </div>

        <div className="p-6">
          {/* إعدادات الجودة */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">إعدادات المعالجة</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  جودة المعالجة
                </label>
                <select
                  value={settings.quality}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      quality: e.target.value as any,
                    }))
                  }
                  className="w-full p-2 bg-black/30 border border-white/20 rounded-lg text-white"
                  disabled={isProcessing}
                >
                  <option value="fast">سريع</option>
                  <option value="balanced">متوازن</option>
                  <option value="high">جودة عالية</option>
                </select>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">
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
                  className="w-full p-2 bg-black/30 border border-white/20 rounded-lg text-white"
                  disabled={isProcessing}
                >
                  <option value="auto">تلقائي</option>
                  {tool.outputTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* منطقة اختيار الملف */}
          {tool.category !== "text" && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">اختيار الملف</h3>
              <div
                className={`border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
                  dragActive
                    ? "border-knoux-purple bg-knoux-purple/10"
                    : selectedFile
                      ? "border-green-400 bg-green-400/10"
                      : "border-white/30 hover:border-white/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  {selectedFile ? (
                    <div>
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-white font-medium mb-1">
                        {selectedFile.name}
                      </p>
                      <p className="text-white/60 text-sm">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 text-sm transition-all duration-200"
                        disabled={isProcessing}
                      >
                        إزالة الملف
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-2">📁</div>
                      <p className="text-white/70 mb-3">
                        اسحب الملف هنا أو انقر للاختيار
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-2 bg-knoux-purple hover:bg-knoux-purple/80 rounded-lg text-white font-medium transition-all duration-200"
                        disabled={isProcessing}
                      >
                        اختيار ملف
                      </button>
                      <p className="text-white/50 text-xs mt-2">
                        الأنواع المدعومة: {tool.inputTypes.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={tool.inputTypes.join(",")}
                onChange={(e) => handleFileSelect(e.target.files)}
                disabled={isProcessing}
              />
            </div>
          )}

          {/* منطقة إدخال النص */}
          {(tool.category === "text" ||
            tool.inputTypes.includes("text/plain")) && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">إدخال النص</h3>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="أدخل النص هنا..."
                className="w-full h-32 p-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/50 resize-none"
                disabled={isProcessing}
              />
            </div>
          )}

          {/* شريط التقدم */}
          {isProcessing && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">جار المعالجة...</span>
                <span className="text-white/70">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-knoux-purple to-knoux-neon transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                >
                  <div className="h-full bg-white/20 animate-pulse rounded-full"></div>
                </div>
              </div>
              <p className="text-white/60 text-sm mt-2">{stage}</p>
            </div>
          )}

          {/* عرض النتيجة */}
          {result && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">النتيجة</h3>
              <div
                className={`p-4 rounded-xl border ${
                  result.success
                    ? "border-green-500/30 bg-green-500/10"
                    : "border-red-500/30 bg-red-500/10"
                }`}
              >
                {result.success ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-green-400 text-xl">✅</span>
                      <span className="text-green-300 font-medium">
                        تمت المعالجة بنجاح!
                      </span>
                    </div>

                    {/* معلومات النتيجة */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">وقت المعالجة:</span>
                        <span className="text-white">
                          {(result.processingTime / 1000).toFixed(2)}s
                        </span>
                      </div>
                      {result.metadata && (
                        <div className="mt-3">
                          <details className="text-white/70">
                            <summary className="cursor-pointer hover:text-white">
                              معلومات إضافية
                            </summary>
                            <pre className="mt-2 p-2 bg-black/30 rounded text-xs overflow-auto max-h-32">
                              {JSON.stringify(result.metadata, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>

                    {/* أزرار التحميل */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={downloadResult}
                        className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 font-medium transition-all duration-200"
                      >
                        📥 تحميل النتيجة
                      </button>

                      {result.outputData?.type.startsWith("text/") && (
                        <button
                          onClick={copyResult}
                          className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 font-medium transition-all duration-200"
                        >
                          📋 نسخ النص
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-red-400 text-xl">❌</span>
                      <span className="text-red-300 font-medium">
                        فشلت المعالجة
                      </span>
                    </div>
                    <p className="text-red-200 text-sm">{result.error}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* معلومات الأداة */}
          <div className="mb-6 p-4 bg-black/20 rounded-xl">
            <h4 className="text-white font-medium mb-3">معلومات الأداة</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/70">حجم النموذج:</span>
                  <span className="text-white">
                    {tool.modelSize >= 1024
                      ? `${(tool.modelSize / 1024).toFixed(1)} GB`
                      : `${tool.modelSize} MB`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">وقت المعالجة:</span>
                  <span className="text-white">{tool.processingTime}s</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/70">النقاط المطلوبة:</span>
                  <span className="text-yellow-400">💎 {tool.credits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">مستوى الصعوبة:</span>
                  <span className="text-white">
                    {getDifficultyText(tool.difficulty)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded-xl text-gray-300 font-medium transition-all duration-200"
              disabled={isProcessing}
            >
              {isProcessing ? "إلغاء" : "إغلاق"}
            </button>

            <button
              onClick={executeTool}
              disabled={
                isProcessing ||
                (tool.category !== "text" && !selectedFile) ||
                (tool.category === "text" && !inputText.trim() && !selectedFile)
              }
              className={`flex-1 px-6 py-3 rounded-xl font-orbitron font-bold text-white transition-all duration-200 ${
                isProcessing
                  ? "bg-gray-500/50 cursor-not-allowed"
                  : `bg-gradient-to-r ${getCategoryGradient(tool.category)} hover:shadow-xl`
              }`}
            >
              {isProcessing ? "جار المعالجة..." : "⚡ تشغيل الأداة"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// دوال مساعدة
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

export default ToolExecutionDialog;
