import React, { useState, useRef, useCallback } from "react";
import { AITool } from "../../types/templates";
import AdvancedFileBrowser from "../AdvancedFileBrowser";
import { toolboxService } from "../../services/toolboxService";

interface ImageToolInterfaceProps {
  tool: AITool;
  onClose: () => void;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

const ImageToolInterface: React.FC<ImageToolInterfaceProps> = ({
  tool,
  onClose,
  onSuccess,
  onError,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFileBrowser, setShowFileBrowser] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Image tool specific settings
  const [settings, setSettings] = useState({
    quality: "high" as "fast" | "balanced" | "high",
    format: "auto" as "auto" | "png" | "jpg" | "webp",
    resolution: "original" as "original" | "2x" | "4x" | "8x",
    enhancement: "auto" as "auto" | "contrast" | "brightness" | "saturation",
    style: "photorealistic" as
      | "photorealistic"
      | "artistic"
      | "anime"
      | "sketch",
    prompt: "",
    negativePrompt: "",
    seed: Math.floor(Math.random() * 1000000),
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowFileBrowser(false);
  }, []);

  const handleProcessTool = async () => {
    if (!selectedFile && !tool.input_types.includes("text")) {
      onError("يرجى اختيار صورة أولاً");
      return;
    }

    if (
      tool.input_types.includes("text") &&
      !settings.prompt &&
      !selectedFile
    ) {
      onError("يرجى إدخال وصف نصي أو اختيار صورة");
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    // محاكاة التقدم
    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 200);

    try {
      const input: any = {
        file: selectedFile,
        text: settings.prompt,
        options: {
          quality: settings.quality,
          format: settings.format,
          resolution: settings.resolution,
          enhancement: settings.enhancement,
          style: settings.style,
          negativePrompt: settings.negativePrompt,
          seed: settings.seed,
        },
      };

      const result = await toolboxService.executeTool(tool.id, input);

      clearInterval(progressInterval);
      setProcessingProgress(100);

      if (result.success) {
        onSuccess(result);

        // عرض النتيجة في المعاينة إذا كانت صورة
        if (result.output instanceof Blob) {
          setPreviewUrl(URL.createObjectURL(result.output));
        }
      } else {
        onError(result.error || "فشل في معالجة الصورة");
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
    if (previewUrl) {
      const a = document.createElement("a");
      a.href = previewUrl;
      a.download = `${tool.name}_result.png`;
      a.click();
    }
  };

  const resetTool = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setSettings({
      ...settings,
      prompt: "",
      seed: Math.floor(Math.random() * 1000000),
    });
  };

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
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            {/* File Selection */}
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
                  <div className="text-3xl mb-2">🖼️</div>
                  <div className="text-white/70">انقر لاختيار صورة</div>
                </button>
              )}
            </div>

            {/* Text Input for AI Tools */}
            {tool.input_types.includes("text") && (
              <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
                <h3 className="font-rajdhani font-bold text-white mb-3">
                  📝 الوصف النصي
                </h3>
                <div className="space-y-3">
                  <textarea
                    value={settings.prompt}
                    onChange={(e) =>
                      setSettings({ ...settings, prompt: e.target.value })
                    }
                    placeholder="اكتب وصفاً مفصلاً للصورة المطلوبة..."
                    className="w-full h-24 px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white placeholder-white/50 resize-none focus:ring-2 focus:ring-knoux-purple"
                  />

                  {tool.id === "text-to-image" && (
                    <textarea
                      value={settings.negativePrompt}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          negativePrompt: e.target.value,
                        })
                      }
                      placeholder="أشياء لا تريدها في الصورة..."
                      className="w-full h-16 px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white placeholder-white/50 resize-none focus:ring-2 focus:ring-knoux-purple"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Settings */}
            <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
              <h3 className="font-rajdhani font-bold text-white mb-3">
                ⚙️ الإعدادات
              </h3>

              <div className="space-y-4">
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
                    <option value="auto">تلقائي</option>
                    <option value="png">PNG</option>
                    <option value="jpg">JPEG</option>
                    <option value="webp">WebP</option>
                  </select>
                </div>

                {/* Resolution for upscaler */}
                {tool.id === "image-upscaler" && (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      مضاعف الدقة
                    </label>
                    <select
                      value={settings.resolution}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          resolution: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white focus:ring-2 focus:ring-knoux-purple"
                    >
                      <option value="original">الأصلي</option>
                      <option value="2x">2x</option>
                      <option value="4x">4x</option>
                      <option value="8x">8x</option>
                    </select>
                  </div>
                )}

                {/* Style for AI tools */}
                {tool.ai_powered && tool.input_types.includes("text") && (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      الأسلوب
                    </label>
                    <select
                      value={settings.style}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          style: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white focus:ring-2 focus:ring-knoux-purple"
                    >
                      <option value="photorealistic">واقعي</option>
                      <option value="artistic">فني</option>
                      <option value="anime">أنيمي</option>
                      <option value="sketch">رسم</option>
                    </select>
                  </div>
                )}

                {/* Seed */}
                {tool.ai_powered && (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      البذرة (Seed)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={settings.seed}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            seed: parseInt(e.target.value) || 0,
                          })
                        }
                        className="flex-1 px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white focus:ring-2 focus:ring-knoux-purple"
                      />
                      <button
                        onClick={() =>
                          setSettings({
                            ...settings,
                            seed: Math.floor(Math.random() * 1000000),
                          })
                        }
                        className="px-3 py-2 bg-knoux-purple/20 hover:bg-knoux-purple/40 rounded-lg text-knoux-purple hover:text-white transition-all"
                        title="عشوائي"
                      >
                        🎲
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleProcessTool}
                disabled={isProcessing || (!selectedFile && !settings.prompt)}
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

              {previewUrl && (
                <button
                  onClick={downloadResult}
                  className="w-full py-2 bg-green-500/20 hover:bg-green-500/40 rounded-lg text-green-400 hover:text-white transition-all"
                >
                  تحميل النتيجة
                </button>
              )}

              <button
                onClick={resetTool}
                className="w-full py-2 bg-gray-500/20 hover:bg-gray-500/40 rounded-lg text-gray-400 hover:text-white transition-all"
              >
                إعادة تعيين
              </button>
            </div>
          </div>

          {/* Center & Right Panel - Preview */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 rounded-xl border border-knoux-purple/20 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-rajdhani font-bold text-white text-lg">
                  🖼️ معاينة الصورة
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

              <div className="relative h-96 md:h-[500px] bg-black/30 rounded-xl overflow-hidden border border-knoux-purple/20">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white/50">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🖼️</div>
                      <div className="text-lg">معاينة الصورة ستظهر هنا</div>
                      <div className="text-sm mt-2">
                        اختر صورة أو أدخل وصفاً نصياً لبدء المعالجة
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Canvas for advanced editing */}
              <canvas
                ref={canvasRef}
                className="hidden"
                width={800}
                height={600}
              ></canvas>
            </div>
          </div>
        </div>
      </div>

      {/* File Browser Modal */}
      {showFileBrowser && (
        <AdvancedFileBrowser
          title={`اختر صورة لـ ${tool.name}`}
          supportedTypes={["image"]}
          onFileSelect={handleFileSelect}
          onClose={() => setShowFileBrowser(false)}
          maxSize={50}
        />
      )}
    </div>
  );
};

export default ImageToolInterface;
