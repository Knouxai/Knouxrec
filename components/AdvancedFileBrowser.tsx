import React, { useState, useRef, useCallback } from "react";

interface FileSource {
  id: string;
  name: string;
  icon: string;
  description: string;
  supportedTypes: string[];
}

interface AdvancedFileBrowserProps {
  title: string;
  supportedTypes: string[];
  onFileSelect: (file: File) => void;
  onUrlInput?: (url: string) => void;
  onClose: () => void;
  allowMultiple?: boolean;
  maxSize?: number; // MB
}

const AdvancedFileBrowser: React.FC<AdvancedFileBrowserProps> = ({
  title,
  supportedTypes,
  onFileSelect,
  onUrlInput,
  onClose,
  allowMultiple = false,
  maxSize = 100,
}) => {
  const [selectedSource, setSelectedSource] = useState<string>("local");
  const [isDragOver, setIsDragOver] = useState(false);
  const [url, setUrl] = useState("");
  const [recentFiles, setRecentFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileSources: FileSource[] = [
    {
      id: "local",
      name: "من الكمبيوتر",
      icon: "💻",
      description: "تصفح واختيار الملفات من جهازك",
      supportedTypes: supportedTypes,
    },
    {
      id: "url",
      name: "من رابط",
      icon: "🌐",
      description: "أدخل رابط الملف مباشرة",
      supportedTypes: ["url"],
    },
    {
      id: "drag",
      name: "السحب والإفلات",
      icon: "📎",
      description: "اسحب الملف إلى هذه المنطقة",
      supportedTypes: supportedTypes,
    },
    {
      id: "camera",
      name: "الكاميرا",
      icon: "📸",
      description: "التقط صورة مباشرة من الكاميرا",
      supportedTypes: ["image"],
    },
    {
      id: "screen",
      name: "لقطة الشاشة",
      icon: "🖥️",
      description: "التقط لقطة من الشاشة",
      supportedTypes: ["image"],
    },
  ];

  const getAcceptedTypes = () => {
    const typeMapping: Record<string, string> = {
      image: "image/*",
      video: "video/*",
      audio: "audio/*",
      text: "text/*",
    };
    return supportedTypes.map((type) => typeMapping[type] || type).join(",");
  };

  const handleFileSelect = useCallback(
    (file: File) => {
      // التحقق من حجم الملف
      if (file.size > maxSize * 1024 * 1024) {
        alert(`حجم الملف يجب أن يكون أقل من ${maxSize}MB`);
        return;
      }

      // التحقق من نوع الملف
      const isValidType = supportedTypes.some((type) => {
        if (type === "image") return file.type.startsWith("image/");
        if (type === "video") return file.type.startsWith("video/");
        if (type === "audio") return file.type.startsWith("audio/");
        if (type === "text") return file.type.startsWith("text/");
        return true;
      });

      if (!isValidType) {
        alert("نوع الملف غير مدعوم");
        return;
      }

      setRecentFiles((prev) => [file, ...prev.slice(0, 4)]);
      onFileSelect(file);
    },
    [supportedTypes, maxSize, onFileSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleUrlSubmit = () => {
    if (url.trim() && onUrlInput) {
      onUrlInput(url.trim());
    }
  };

  const captureScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      video.addEventListener("loadedmetadata", () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx?.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "screenshot.png", {
              type: "image/png",
            });
            handleFileSelect(file);
          }
        });

        stream.getTracks().forEach((track) => track.stop());
      });
    } catch (error) {
      alert("فشل في التقاط لقطة الشاشة");
    }
  };

  const captureCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      video.addEventListener("loadedmetadata", () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx?.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera-capture.png", {
              type: "image/png",
            });
            handleFileSelect(file);
          }
        });

        stream.getTracks().forEach((track) => track.stop());
      });
    } catch (error) {
      alert("فشل في الوصول للكاميرا");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-auto rounded-2xl border border-knoux-purple/30">
        {/* Header */}
        <div className="p-6 border-b border-knoux-purple/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-orbitron font-bold text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>
          <p className="text-white/70 mt-2">
            اختر مصدر الملف واستعرض خياراتك المتعددة
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* File Sources */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-rajdhani font-bold text-white text-lg">
              مصادر الملفات
            </h3>

            {fileSources.map((source) => (
              <button
                key={source.id}
                onClick={() => setSelectedSource(source.id)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                  selectedSource === source.id
                    ? "bg-knoux-purple/30 border border-knoux-purple"
                    : "bg-white/5 hover:bg-white/10 border border-transparent"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{source.icon}</span>
                  <div>
                    <div className="font-medium text-white">{source.name}</div>
                    <div className="text-sm text-white/70">
                      {source.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {selectedSource === "local" && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-knoux-purple/50 rounded-xl p-8 text-center">
                  <div className="text-4xl mb-4">📁</div>
                  <h3 className="font-rajdhani font-bold text-white text-lg mb-2">
                    اختر ملف من جهازك
                  </h3>
                  <p className="text-white/70 mb-4">
                    الملفات المدعومة: {supportedTypes.join(", ")}
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-knoux-purple/20 hover:bg-knoux-purple/40 rounded-xl text-knoux-purple hover:text-white transition-all"
                  >
                    تصفح الملفات
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={getAcceptedTypes()}
                    multiple={allowMultiple}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                </div>
              </div>
            )}

            {selectedSource === "drag" && (
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  isDragOver
                    ? "border-knoux-neon bg-knoux-neon/10"
                    : "border-knoux-purple/50"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="text-6xl mb-4">📎</div>
                <h3 className="font-rajdhani font-bold text-white text-xl mb-2">
                  اسحب الملف هنا
                </h3>
                <p className="text-white/70">أو انقر لتصفح الملفات من جهازك</p>
              </div>
            )}

            {selectedSource === "url" && onUrlInput && (
              <div className="space-y-4">
                <div className="border border-knoux-purple/30 rounded-xl p-6">
                  <div className="text-3xl text-center mb-4">🌐</div>
                  <h3 className="font-rajdhani font-bold text-white text-lg mb-4 text-center">
                    أدخل رابط الملف
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/file.mp4"
                      className="w-full px-4 py-3 bg-black/30 border border-knoux-purple/30 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-knoux-purple focus:border-knoux-purple"
                    />
                    <button
                      onClick={handleUrlSubmit}
                      disabled={!url.trim()}
                      className="w-full py-3 bg-knoux-purple/20 hover:bg-knoux-purple/40 disabled:bg-gray-500/20 disabled:text-gray-500 rounded-xl text-knoux-purple hover:text-white transition-all"
                    >
                      تحميل من الرابط
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedSource === "camera" &&
              supportedTypes.includes("image") && (
                <div className="space-y-4">
                  <div className="border border-knoux-purple/30 rounded-xl p-6 text-center">
                    <div className="text-4xl mb-4">📸</div>
                    <h3 className="font-rajdhani font-bold text-white text-lg mb-4">
                      التقط صورة من الكاميرا
                    </h3>
                    <button
                      onClick={captureCamera}
                      className="px-6 py-3 bg-knoux-purple/20 hover:bg-knoux-purple/40 rounded-xl text-knoux-purple hover:text-white transition-all"
                    >
                      فتح الكاميرا
                    </button>
                  </div>
                </div>
              )}

            {selectedSource === "screen" &&
              supportedTypes.includes("image") && (
                <div className="space-y-4">
                  <div className="border border-knoux-purple/30 rounded-xl p-6 text-center">
                    <div className="text-4xl mb-4">🖥️</div>
                    <h3 className="font-rajdhani font-bold text-white text-lg mb-4">
                      التقط لقطة من الشاشة
                    </h3>
                    <button
                      onClick={captureScreenshot}
                      className="px-6 py-3 bg-knoux-purple/20 hover:bg-knoux-purple/40 rounded-xl text-knoux-purple hover:text-white transition-all"
                    >
                      التقط الشاشة
                    </button>
                  </div>
                </div>
              )}

            {/* Recent Files */}
            {recentFiles.length > 0 && (
              <div className="mt-6">
                <h4 className="font-rajdhani font-bold text-white mb-3">
                  الملفات الأخيرة
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {recentFiles.map((file, index) => (
                    <button
                      key={index}
                      onClick={() => handleFileSelect(file)}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-all"
                    >
                      <div className="text-sm font-medium text-white truncate">
                        {file.name}
                      </div>
                      <div className="text-xs text-white/70">
                        {(file.size / 1024 / 1024).toFixed(1)}MB
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Footer */}
        <div className="p-4 bg-black/20 border-t border-knoux-purple/20">
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>الحد الأقصى للحجم: {maxSize}MB</span>
            <span>الأنواع المدعومة: {supportedTypes.join(", ")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFileBrowser;
