import React, { useState, useRef, useCallback } from "react";
import { AITool } from "../../types/templates";
import AdvancedFileBrowser from "../AdvancedFileBrowser";
import { toolboxService } from "../../services/toolboxService";

interface VideoToolInterfaceProps {
  tool: AITool;
  onClose: () => void;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

const VideoToolInterface: React.FC<VideoToolInterfaceProps> = ({
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
  const [currentFrame, setCurrentFrame] = useState(0);

  // Video tool specific settings
  const [settings, setSettings] = useState({
    quality: "high" as "fast" | "balanced" | "high",
    resolution: "1080p" as "720p" | "1080p" | "4k" | "original",
    fps: 30 as 24 | 30 | 60,
    codec: "h264" as "h264" | "h265" | "vp9",
    format: "mp4" as "mp4" | "webm" | "avi" | "mov",
    duration: 30,
    style: "cinematic" as
      | "cinematic"
      | "documentary"
      | "creative"
      | "commercial",
    prompt: "",
    voice: "arabic_female" as
      | "arabic_female"
      | "arabic_male"
      | "english_female"
      | "english_male",
    background: "auto" as "auto" | "blur" | "remove" | "green_screen",
    effects: [] as string[],
    transitions: "smart" as "smart" | "fade" | "slide" | "zoom",
    trimStart: 0,
    trimEnd: 100,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowFileBrowser(false);
  }, []);

  const handleProcessTool = async () => {
    if (
      !selectedFile &&
      !tool.input_types.includes("text") &&
      !tool.input_types.includes("url")
    ) {
      onError("يرجى اختيار ملف أولاً");
      return;
    }

    if (
      tool.input_types.includes("text") &&
      !settings.prompt &&
      !selectedFile
    ) {
      onError("يرجى إدخال نص أو اختيار ملف");
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    // محاكاة التقدم بناءً على نوع الأداة
    const totalTime =
      tool.processing_time === "fast"
        ? 3000
        : tool.processing_time === "medium"
          ? 8000
          : 15000;

    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 5;
      });
    }, totalTime / 20);

    try {
      const input: any = {
        file: selectedFile,
        text: settings.prompt,
        options: {
          quality: settings.quality,
          resolution: settings.resolution,
          fps: settings.fps,
          codec: settings.codec,
          format: settings.format,
          duration: settings.duration,
          style: settings.style,
          voice: settings.voice,
          background: settings.background,
          effects: settings.effects,
          transitions: settings.transitions,
          trimStart: settings.trimStart,
          trimEnd: settings.trimEnd,
        },
      };

      const result = await toolboxService.executeTool(tool.id, input);

      clearInterval(progressInterval);
      setProcessingProgress(100);

      if (result.success) {
        onSuccess(result);

        // عرض النتيجة في المعاينة إذا كانت فيديو
        if (result.output instanceof Blob) {
          setPreviewUrl(URL.createObjectURL(result.output));
        }
      } else {
        onError(result.error || "فشل في معالجة الفيديو");
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
      a.download = `${tool.name}_result.${settings.format}`;
      a.click();
    }
  };

  const resetTool = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setSettings({
      ...settings,
      prompt: "",
      trimStart: 0,
      trimEnd: 100,
    });
  };

  const toggleEffect = (effect: string) => {
    setSettings({
      ...settings,
      effects: settings.effects.includes(effect)
        ? settings.effects.filter((e) => e !== effect)
        : [...settings.effects, effect],
    });
  };

  const availableEffects = [
    { id: "motion_blur", name: "تمويه الحركة", icon: "💫" },
    { id: "color_grading", name: "تدرج الألوان", icon: "🎨" },
    { id: "stabilization", name: "التثبيت", icon: "🛡️" },
    { id: "noise_reduction", name: "تقليل الضوضاء", icon: "🔇" },
    { id: "sharpening", name: "التوضيح", icon: "✨" },
    { id: "vintage", name: "كلاسيكي", icon: "📼" },
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
          {/* Left Panel - File & Basic Controls */}
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
                  <div className="text-3xl mb-2">🎥</div>
                  <div className="text-white/70">انقر لاختيار فيديو</div>
                </button>
              )}
            </div>

            {/* Text Input for AI Tools */}
            {tool.input_types.includes("text") && (
              <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
                <h3 className="font-rajdhani font-bold text-white mb-3">
                  📝 الوصف النصي
                </h3>
                <textarea
                  value={settings.prompt}
                  onChange={(e) =>
                    setSettings({ ...settings, prompt: e.target.value })
                  }
                  placeholder="اكتب وصفاً مفصلاً للفيديو المطلوب..."
                  className="w-full h-24 px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white placeholder-white/50 resize-none focus:ring-2 focus:ring-knoux-purple"
                />
              </div>
            )}

            {/* Quick Actions */}
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

          {/* Center Panel - Video Preview */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 rounded-xl border border-knoux-purple/20 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-rajdhani font-bold text-white text-lg">
                  🎬 معاينة الفيديو
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

              <div className="relative h-64 md:h-80 bg-black/30 rounded-xl overflow-hidden border border-knoux-purple/20 mb-4">
                {previewUrl ? (
                  <video
                    ref={videoRef}
                    src={previewUrl}
                    controls
                    className="w-full h-full object-contain"
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        const duration = videoRef.current.duration;
                        setSettings((prev) => ({
                          ...prev,
                          trimEnd: duration,
                        }));
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white/50">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎬</div>
                      <div className="text-lg">معاينة الفيديو ستظهر هنا</div>
                      <div className="text-sm mt-2">
                        اختر فيديو أو أدخل وصفاً نصياً لبدء المعالجة
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline for trimming */}
              {tool.id === "video-trimmer" && previewUrl && (
                <div className="space-y-3">
                  <h4 className="font-medium text-white">
                    Timeline - قص الفيديو
                  </h4>
                  <div
                    ref={timelineRef}
                    className="relative h-12 bg-gray-700 rounded-lg overflow-hidden cursor-pointer"
                  >
                    <div
                      className="absolute top-0 h-full bg-knoux-purple/50"
                      style={{
                        left: `${settings.trimStart}%`,
                        width: `${settings.trimEnd - settings.trimStart}%`,
                      }}
                    ></div>
                    <div
                      className="absolute top-0 w-1 h-full bg-knoux-neon cursor-ew-resize"
                      style={{ left: `${settings.trimStart}%` }}
                    ></div>
                    <div
                      className="absolute top-0 w-1 h-full bg-knoux-neon cursor-ew-resize"
                      style={{ left: `${settings.trimEnd}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-white/70">
                    <span>البداية: {settings.trimStart.toFixed(1)}%</span>
                    <span>النهاية: {settings.trimEnd.toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Advanced Settings */}
          <div className="space-y-6">
            {/* Video Settings */}
            <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
              <h3 className="font-rajdhani font-bold text-white mb-3">
                ⚙️ إعدادات الفيديو
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

                {/* Resolution */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    دقة الإخراج
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
                    <option value="720p">720p HD</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="4k">4K Ultra HD</option>
                  </select>
                </div>

                {/* FPS */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    معدل الإطارات
                  </label>
                  <select
                    value={settings.fps}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        fps: parseInt(e.target.value) as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white focus:ring-2 focus:ring-knoux-purple"
                  >
                    <option value={24}>24 FPS</option>
                    <option value={30}>30 FPS</option>
                    <option value={60}>60 FPS</option>
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
                    <option value="mp4">MP4</option>
                    <option value="webm">WebM</option>
                    <option value="avi">AVI</option>
                    <option value="mov">MOV</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Effects */}
            {tool.ai_powered && (
              <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
                <h3 className="font-rajdhani font-bold text-white mb-3">
                  ✨ التأثيرات
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {availableEffects.map((effect) => (
                    <button
                      key={effect.id}
                      onClick={() => toggleEffect(effect.id)}
                      className={`p-2 rounded-lg text-xs transition-all ${
                        settings.effects.includes(effect.id)
                          ? "bg-knoux-purple/30 border border-knoux-purple text-white"
                          : "bg-white/5 hover:bg-white/10 text-white/70 border border-transparent"
                      }`}
                    >
                      <div>{effect.icon}</div>
                      <div>{effect.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Style Settings */}
            {tool.ai_powered && tool.input_types.includes("text") && (
              <div className="glass-card p-4 rounded-xl border border-knoux-purple/20">
                <h3 className="font-rajdhani font-bold text-white mb-3">
                  🎨 الأسلوب
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      نمط الفيديو
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
                      <option value="cinematic">سينمائي</option>
                      <option value="documentary">وثائقي</option>
                      <option value="creative">إبداعي</option>
                      <option value="commercial">تجاري</option>
                    </select>
                  </div>

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
                      مدة الفيديو (ثانية)
                    </label>
                    <input
                      type="number"
                      value={settings.duration}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          duration: parseInt(e.target.value) || 30,
                        })
                      }
                      min={5}
                      max={300}
                      className="w-full px-3 py-2 bg-black/30 border border-knoux-purple/30 rounded-lg text-white focus:ring-2 focus:ring-knoux-purple"
                    />
                  </div>
                </div>
              </div>
            )}
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
          maxSize={500}
        />
      )}
    </div>
  );
};

export default VideoToolInterface;
