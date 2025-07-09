import React, { useState, useRef, useCallback } from "react";
import { AITool } from "../../types/templates";
import AdvancedFileBrowser from "../AdvancedFileBrowser";
import { toolboxService } from "../../services/toolboxService";

interface TextToolInterfaceProps {
  tool: AITool;
  onClose: () => void;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

const TextToolInterface: React.FC<TextToolInterfaceProps> = ({
  tool,
  onClose,
  onSuccess,
  onError,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFileBrowser, setShowFileBrowser] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [resultText, setResultText] = useState<string>("");

  // Text tool specific settings
  const [settings, setSettings] = useState({
    quality: "high" as "fast" | "balanced" | "high",
    language: "ar" as "ar" | "en" | "fr" | "es" | "de",
    tone: "professional" as
      | "professional"
      | "casual"
      | "formal"
      | "creative"
      | "marketing",
    length: "medium" as "short" | "medium" | "long",
    format: "txt" as "txt" | "srt" | "vtt" | "docx" | "pdf",
    maxLength: 500,
    style: "modern" as "modern" | "classic" | "technical" | "storytelling",
    targetAudience: "general" as
      | "general"
      | "technical"
      | "children"
      | "business",
    seoOptimized: true,
    includeKeywords: "",
    excludeWords: "",
    templateType: "blog" as "blog" | "ad" | "email" | "social" | "description",
    voice: "arabic_female" as
      | "arabic_female"
      | "arabic_male"
      | "english_female"
      | "english_male",
    speed: 1.0,
    pitch: 0,
    inputText: "",
    targetLanguage: "ar" as "ar" | "en" | "fr" | "es" | "de" | "zh" | "ja",
    subtitleDuration: 3,
    wordsPerSubtitle: 8,
    timingMode: "auto" as "auto" | "manual" | "word_based",
  });

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setShowFileBrowser(false);

    // قراءة محتوى الملف إذا كان نصي
    if (file.type.startsWith("text/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setSettings((prev) => ({ ...prev, inputText: content }));
      };
      reader.readAsText(file);
    }
  }, []);

  const handleProcessTool = async () => {
    if (
      !selectedFile &&
      !settings.inputText &&
      !tool.input_types.includes("auto")
    ) {
      onError("يرجى إدخال نص أو اختيار ملف أولاً");
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    const totalTime =
      tool.processing_time === "fast"
        ? 1500
        : tool.processing_time === "medium"
          ? 3000
          : 5000;

    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, totalTime / 12);

    try {
      const input: any = {
        file: selectedFile,
        text: settings.inputText,
        options: {
          quality: settings.quality,
          language: settings.language,
          tone: settings.tone,
          length: settings.length,
          format: settings.format,
          maxLength: settings.maxLength,
          style: settings.style,
          targetAudience: settings.targetAudience,
          seoOptimized: settings.seoOptimized,
          includeKeywords: settings.includeKeywords,
          excludeWords: settings.excludeWords,
          templateType: settings.templateType,
          voice: settings.voice,
          speed: settings.speed,
          pitch: settings.pitch,
          targetLanguage: settings.targetLanguage,
          subtitleDuration: settings.subtitleDuration,
          wordsPerSubtitle: settings.wordsPerSubtitle,
          timingMode: settings.timingMode,
        },
      };

      const result = await toolboxService.executeTool(tool.id, input);

      clearInterval(progressInterval);
      setProcessingProgress(100);

      if (result.success) {
        onSuccess(result);

        // عرض النتيجة النصية
        if (typeof result.output === "string") {
          setResultText(result.output);
        } else if (result.output instanceof Blob) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setResultText(
              (e.target?.result as string) || "تم إنشاء الملف بنجاح",
            );
          };
          reader.readAsText(result.output);
        }
      } else {
        onError(result.error || "فشل في معالجة النص");
      }
    } catch (error) {
      clearInterval(progressInterval);
      onError(error instanceof Error ? error.message : "خطأ غير متوقع");
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const downloadResult = () => {
    if (resultText) {
      const blob = new Blob([resultText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tool.name}_result.${settings.format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const copyToClipboard = () => {
    if (resultText) {
      navigator.clipboard.writeText(resultText);
      alert("تم نسخ النص إلى الحافظة");
    }
  };

  const resetTool = () => {
    setSelectedFile(null);
    setResultText("");
    setSettings({
      ...settings,
      inputText: "",
      includeKeywords: "",
      excludeWords: "",
    });
  };

  const wordCount = settings.inputText
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const characterCount = settings.inputText.length;

  const templates = [
    { id: "blog", name: "مقال مدونة", icon: "📝" },
    { id: "ad", name: "إعلان", icon: "📢" },
    { id: "email", name: "إيميل", icon: "📧" },
    { id: "social", name: "منشور اجتماعي", icon: "📱" },
    { id: "description", name: "وصف منتج", icon: "🛍️" },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-7xl w-full max-h-[95vh] overflow-auto rounded-2xl border border-knoux-purple/30">
        {/* Header */}
        <div className="p-6 border-b border-knoux-purple/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-3xl">{tool.icon}</span>
              <div>
                <h2 className="text-2xl font-orbitron font-bold text-white">
                  {tool.name}
                </h2>
                <p className="text-white/70">{tool.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Left Panel - Input & Settings */}
          <div className="space-y-6">
            {/* File Selection */}
            {tool.input_types.includes("audio") ||
            tool.input_types.includes("video") ? (
              <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
                <h3 className="font-rajdhani font-bold text-white mb-3">
                  📁 اختيار الملف
                </h3>

                {selectedFile ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="text-sm font-medium text-green-400">
                        {selectedFile.name}
                      </div>
                      <div className="text-xs text-white/70">
                        {(selectedFile.size / 1024 / 1024).toFixed(1)}MB
                      </div>
                    </div>
                    <button
                      onClick={() => setShowFileBrowser(true)}
                      className="w-full py-2 bg-knoux-purple/20 hover:bg-knoux-purple/40 rounded-lg text-knoux-purple hover:text-white transition-all text-sm"
                    >
                      تغيير الملف
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowFileBrowser(true)}
                    className="w-full py-8 border-2 border-dashed border-knoux-purple/50 hover:border-knoux-purple rounded-xl text-center transition-all"
                  >
                    <div className="text-3xl mb-2">🎵</div>
                    <div className="text-white/70">انقر لاختيار ملف</div>
                  </button>
                )}
              </div>
            ) : (
              /* Text Input */
              <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
                <h3 className="font-rajdhani font-bold text-white mb-3">
                  📝 إدخال النص
                </h3>
                <div className="space-y-3">
                  <textarea
                    ref={textAreaRef}
                    value={settings.inputText}
                    onChange={(e) =>
                      setSettings({ ...settings, inputText: e.target.value })
                    }
                    placeholder={`اكتب النص هنا لـ ${tool.name}...`}
                    className="w-full h-32 px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white placeholder-white/50 resize-none focus:ring-2 focus:ring-knoux-purple"
                  />

                  <div className="flex justify-between text-xs text-white/70">
                    <span>الكلمات: {wordCount}</span>
                    <span>الأحرف: {characterCount}</span>
                  </div>

                  {tool.id === "ai-copywriting" && (
                    <button
                      onClick={() => setShowFileBrowser(true)}
                      className="w-full py-2 bg-knoux-purple/20 hover:bg-knoux-purple/40 rounded-lg text-knoux-purple hover:text-white transition-all text-sm"
                    >
                      أو ارفع ملف نصي
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Template Selection for Copywriting */}
            {tool.id === "ai-copywriting" && (
              <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
                <h3 className="font-rajdhani font-bold text-white mb-3">
                  📋 نوع المحتوى
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() =>
                        setSettings({
                          ...settings,
                          templateType: template.id as any,
                        })
                      }
                      className={`p-3 rounded-lg text-center transition-all ${
                        settings.templateType === template.id
                          ? "bg-knoux-purple/30 border border-knoux-purple text-white"
                          : "bg-white/5 hover:bg-white/10 text-white/70 border border-transparent"
                      }`}
                    >
                      <div className="text-2xl mb-1">{template.icon}</div>
                      <div className="text-xs">{template.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Language & Voice Settings */}
            <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
              <h3 className="font-rajdhani font-bold text-white mb-3">
                🌐 اللغة والصوت
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    اللغة
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        language: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white focus:ring-2 focus:ring-knoux-purple"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">الإنجليزية</option>
                    <option value="fr">الفرنسية</option>
                    <option value="es">الإسبانية</option>
                    <option value="de">الألمانية</option>
                  </select>
                </div>

                {tool.id === "text-to-speech" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">
                        الصوت
                      </label>
                      <select
                        value={settings.voice}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            voice: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white focus:ring-2 focus:ring-knoux-purple"
                      >
                        <option value="arabic_female">عربي - أنثى</option>
                        <option value="arabic_male">عربي - ذكر</option>
                        <option value="english_female">إنجليزي - أنثى</option>
                        <option value="english_male">إنجليزي - ذكر</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">
                        السرعة: {settings.speed}x
                      </label>
                      <input
                        type="range"
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        value={settings.speed}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            speed: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-knoux-purple"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">
                        طبقة الصوت: {settings.pitch}
                      </label>
                      <input
                        type="range"
                        min={-12}
                        max={12}
                        value={settings.pitch}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            pitch: parseInt(e.target.value),
                          })
                        }
                        className="w-full accent-knoux-purple"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <button
                onClick={handleProcessTool}
                disabled={
                  isProcessing || (!selectedFile && !settings.inputText)
                }
                className="w-full py-3 bg-gradient-to-r from-knoux-purple to-knoux-neon hover:from-knoux-purple/80 hover:to-knoux-neon/80 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                    <span>جار المعالجة...</span>
                  </div>
                ) : (
                  `تشغيل ${tool.name}`
                )}
              </button>

              {resultText && (
                <>
                  <button
                    onClick={copyToClipboard}
                    className="w-full py-2 bg-blue-500/20 hover:bg-blue-500/40 rounded-lg text-blue-400 hover:text-white transition-all"
                  >
                    نسخ النتيجة
                  </button>
                  <button
                    onClick={downloadResult}
                    className="w-full py-2 bg-green-500/20 hover:bg-green-500/40 rounded-lg text-green-400 hover:text-white transition-all"
                  >
                    تحميل الملف
                  </button>
                </>
              )}

              <button
                onClick={resetTool}
                className="w-full py-2 bg-gray-500/20 hover:bg-gray-500/40 rounded-lg text-gray-400 hover:text-white transition-all"
              >
                إعادة تعيين
              </button>
            </div>
          </div>

          {/* Center & Right Panel - Output & Advanced Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Output Display */}
            <div className="glass-card p-6 rounded-xl border border-knoux-purple/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-rajdhani font-bold text-white text-lg">
                  📄 النتيجة
                </h3>
                {isProcessing && (
                  <div className="text-sm text-knoux-neon">
                    {processingProgress.toFixed(0)}%
                  </div>
                )}
              </div>

              {isProcessing && (
                <div className="mb-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-knoux-purple to-knoux-neon h-2 rounded-full transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="relative h-64 md:h-80 bg-black/30 rounded-xl p-4 overflow-auto border border-knoux-purple/20">
                {resultText ? (
                  <div className="text-white whitespace-pre-wrap leading-relaxed">
                    {resultText}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-white/50">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📄</div>
                      <div className="text-lg">النتيجة ستظهر هنا</div>
                      <div className="text-sm mt-2">
                        أدخل النص واضغط على تشغيل لبدء المعالجة
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
              <h3 className="font-rajdhani font-bold text-white mb-3">
                ⚙️ إعدادات متقدمة
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Quality */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    جودة المعالجة
                  </label>
                  <select
                    value={settings.quality}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        quality: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white focus:ring-2 focus:ring-knoux-purple"
                  >
                    <option value="fast">سريع</option>
                    <option value="balanced">متوازن</option>
                    <option value="high">عالي الجودة</option>
                  </select>
                </div>

                {/* Format */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    صيغة الإخراج
                  </label>
                  <select
                    value={settings.format}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        format: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white focus:ring-2 focus:ring-knoux-purple"
                  >
                    <option value="txt">نص عادي</option>
                    <option value="srt">ترجمات SRT</option>
                    <option value="vtt">ترجمات VTT</option>
                    <option value="docx">مستند Word</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>

                {/* Tone for Copywriting */}
                {tool.id === "ai-copywriting" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">
                        نبرة الكتابة
                      </label>
                      <select
                        value={settings.tone}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            tone: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white focus:ring-2 focus:ring-knoux-purple"
                      >
                        <option value="professional">احترافي</option>
                        <option value="casual">عادي</option>
                        <option value="formal">رسمي</option>
                        <option value="creative">إبداعي</option>
                        <option value="marketing">تسويقي</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">
                        طول المحتوى
                      </label>
                      <select
                        value={settings.length}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            length: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white focus:ring-2 focus:ring-knoux-purple"
                      >
                        <option value="short">قصير</option>
                        <option value="medium">متوسط</option>
                        <option value="long">طويل</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-white/70 mb-1">
                        الكلمات المفتاحية (فصل بفاصلة)
                      </label>
                      <input
                        type="text"
                        value={settings.includeKeywords}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            includeKeywords: e.target.value,
                          })
                        }
                        placeholder="تسويق, منتج, جودة"
                        className="w-full px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-knoux-purple"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="seo"
                        checked={settings.seoOptimized}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            seoOptimized: e.target.checked,
                          })
                        }
                        className="accent-knoux-purple"
                      />
                      <label htmlFor="seo" className="text-sm text-white/70">
                        محسن لمحركات البحث
                      </label>
                    </div>
                  </>
                )}

                {/* Subtitle Settings */}
                {tool.id === "split-subtitles" ||
                  (tool.id === "subtitle-maker" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">
                          مدة الترجمة (ثانية)
                        </label>
                        <input
                          type="number"
                          value={settings.subtitleDuration}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              subtitleDuration: parseInt(e.target.value) || 3,
                            })
                          }
                          min={1}
                          max={10}
                          className="w-full px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white focus:ring-2 focus:ring-knoux-purple"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1">
                          كلمات في السطر
                        </label>
                        <input
                          type="number"
                          value={settings.wordsPerSubtitle}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              wordsPerSubtitle: parseInt(e.target.value) || 8,
                            })
                          }
                          min={3}
                          max={15}
                          className="w-full px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white focus:ring-2 focus:ring-knoux-purple"
                        />
                      </div>
                    </>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Browser Modal */}
      {showFileBrowser && (
        <AdvancedFileBrowser
          title={`اختر ملف لـ ${tool.name}`}
          supportedTypes={tool.input_types}
          onFileSelect={handleFileSelect}
          onClose={() => setShowFileBrowser(false)}
          maxSize={50}
        />
      )}
    </div>
  );
};

export default TextToolInterface;
