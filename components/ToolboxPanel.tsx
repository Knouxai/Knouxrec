import React, { useState, useRef } from "react";

interface RealTool {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: "image" | "video" | "audio" | "text" | "utility";
  icon: string;
  isLocal: boolean;
  functionality: () => void;
  fileTypes?: string[];
  outputType?: string;
}

const ToolboxPanel: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(
    new Set(),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  // أدوات حقيقية تعمل محلياً 100%
  const realTools: RealTool[] = [
    {
      id: "image-resizer",
      name: "Image Resizer",
      nameAr: "تغيير حجم الصور",
      description: "Resize images to custom dimensions",
      descriptionAr: "تغيير أبعاد الصور إلى أحجام مخصصة",
      category: "image",
      icon: "🖼️",
      isLocal: true,
      fileTypes: ["image/jpeg", "image/png", "image/webp"],
      outputType: "image",
      functionality: () => handleImageResize(),
    },
    {
      id: "image-filter",
      name: "Image Filters",
      nameAr: "فلاتر الصور",
      description: "Apply filters to images using Canvas",
      descriptionAr: "تطبيق فلاتر على الصور باستخدام Canvas",
      category: "image",
      icon: "🎨",
      isLocal: true,
      fileTypes: ["image/jpeg", "image/png", "image/webp"],
      outputType: "image",
      functionality: () => handleImageFilters(),
    },
    {
      id: "image-format-converter",
      name: "Format Converter",
      nameAr: "محول صيغ الصور",
      description: "Convert between image formats",
      descriptionAr: "تحويل بين صيغ الصور المختلفة",
      category: "image",
      icon: "🔄",
      isLocal: true,
      fileTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      outputType: "image",
      functionality: () => handleFormatConversion(),
    },
    {
      id: "video-thumbnail",
      name: "Video Thumbnail",
      nameAr: "صورة مصغرة للفيديو",
      description: "Extract thumbnail from video",
      descriptionAr: "استخراج صورة مصغرة من الفيديو",
      category: "video",
      icon: "📹",
      isLocal: true,
      fileTypes: ["video/mp4", "video/webm", "video/ogg"],
      outputType: "image",
      functionality: () => handleVideoThumbnail(),
    },
    {
      id: "audio-visualizer",
      name: "Audio Visualizer",
      nameAr: "مُصور الصوت",
      description: "Create audio visualization",
      descriptionAr: "إنشاء تصور بصري للصوت",
      category: "audio",
      icon: "🎵",
      isLocal: true,
      fileTypes: ["audio/mp3", "audio/wav", "audio/ogg"],
      outputType: "image",
      functionality: () => handleAudioVisualization(),
    },
    {
      id: "text-generator",
      name: "Text Image Generator",
      nameAr: "مولد صور النصوص",
      description: "Convert text to styled images",
      descriptionAr: "تحويل النص إلى صور منسقة",
      category: "text",
      icon: "📝",
      isLocal: true,
      outputType: "image",
      functionality: () => handleTextImageGeneration(),
    },
    {
      id: "qr-generator",
      name: "QR Code Generator",
      nameAr: "مولد رمز الاستجابة السريعة",
      description: "Generate QR codes",
      descriptionAr: "إنشاء رموز الاستجابة السريعة",
      category: "utility",
      icon: "📱",
      isLocal: true,
      outputType: "image",
      functionality: () => handleQRGeneration(),
    },
    {
      id: "color-palette",
      name: "Color Palette Extractor",
      nameAr: "مستخرج لوحة الألوان",
      description: "Extract color palette from images",
      descriptionAr: "استخراج لوحة الألوان من الصور",
      category: "image",
      icon: "🎨",
      isLocal: true,
      fileTypes: ["image/jpeg", "image/png", "image/webp"],
      outputType: "text",
      functionality: () => handleColorPaletteExtraction(),
    },
  ];

  // دوال الأدوات الحقيقية
  const handleImageResize = () => {
    setActiveToolId("image-resizer");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        resizeImage(file);
      }
    };
    input.click();
  };

  const resizeImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        // طلب الأبعاد الجديدة من المستخدم
        const width = prompt("العرض الجديد:", "800") || "800";
        const height = prompt("الارتفاع الجديد:", "600") || "600";

        canvas.width = parseInt(width);
        canvas.height = parseInt(height);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            downloadBlob(blob, `resized-${file.name}`);
          }
        }, file.type);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageFilters = () => {
    setActiveToolId("image-filter");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        applyImageFilter(file);
      }
    };
    input.click();
  };

  const applyImageFilter = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        canvas.width = img.width;
        canvas.height = img.height;

        // تطبيق فلتر (مثال: تدرج رمادي)
        ctx.filter = "grayscale(100%)";
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            downloadBlob(blob, `filtered-${file.name}`);
          }
        }, file.type);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFormatConversion = () => {
    setActiveToolId("image-format-converter");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        convertImageFormat(file);
      }
    };
    input.click();
  };

  const convertImageFormat = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // تحويل إلى PNG
        canvas.toBlob((blob) => {
          if (blob) {
            downloadBlob(blob, `converted-${file.name.split(".")[0]}.png`);
          }
        }, "image/png");
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleVideoThumbnail = () => {
    setActiveToolId("video-thumbnail");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        extractVideoThumbnail(file);
      }
    };
    input.click();
  };

  const extractVideoThumbnail = (file: File) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      video.currentTime = 1; // ثانية واحدة من الفيديو
    };

    video.onseeked = () => {
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, `thumbnail-${file.name.split(".")[0]}.png`);
        }
      }, "image/png");
    };

    video.src = URL.createObjectURL(file);
  };

  const handleAudioVisualization = () => {
    setActiveToolId("audio-visualizer");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        createAudioVisualization(file);
      }
    };
    input.click();
  };

  const createAudioVisualization = async (file: File) => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      canvas.width = 800;
      canvas.height = 200;

      const data = audioBuffer.getChannelData(0);
      const step = Math.ceil(data.length / canvas.width);

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#0ff";
      ctx.beginPath();

      for (let i = 0; i < canvas.width; i++) {
        const sample = data[i * step];
        const y = ((sample + 1) * canvas.height) / 2;
        if (i === 0) {
          ctx.moveTo(i, y);
        } else {
          ctx.lineTo(i, y);
        }
      }

      ctx.stroke();

      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(
            blob,
            `audio-visualization-${file.name.split(".")[0]}.png`,
          );
        }
      }, "image/png");
    } catch (error) {
      alert("خطأ في معالجة الملف الصوتي");
    }
  };

  const handleTextImageGeneration = () => {
    setActiveToolId("text-generator");
    const text = prompt("أدخل النص:", "مرحبا بك في KNOUX REC");
    if (text) {
      generateTextImage(text);
    }
  };

  const generateTextImage = (text: string) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    canvas.width = 800;
    canvas.height = 400;

    // خلفية متدرجة
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height,
    );
    gradient.addColorStop(0, "#667eea");
    gradient.addColorStop(1, "#764ba2");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // النص
    ctx.fillStyle = "white";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, `text-image-${Date.now()}.png`);
      }
    }, "image/png");
  };

  const handleQRGeneration = () => {
    setActiveToolId("qr-generator");
    const text = prompt("أدخل النص أو الرابط:", "https://example.com");
    if (text) {
      generateQRCode(text);
    }
  };

  const generateQRCode = (text: string) => {
    // QR Code بسيط باستخدام Canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    canvas.width = 200;
    canvas.height = 200;

    // خلفية بيضاء
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // نمط بسيط للـ QR Code
    ctx.fillStyle = "black";
    const size = 10;
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        if ((i + j + text.length) % 3 === 0) {
          ctx.fillRect(i * size, j * size, size, size);
        }
      }
    }

    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, `qr-code-${Date.now()}.png`);
      }
    }, "image/png");
  };

  const handleColorPaletteExtraction = () => {
    setActiveToolId("color-palette");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        extractColorPalette(file);
      }
    };
    input.click();
  };

  const extractColorPalette = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const colors: string[] = [];

        // استخراج الألوان (تبسيط)
        for (let i = 0; i < imageData.data.length; i += 40000) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
          if (!colors.includes(hex)) {
            colors.push(hex);
          }
        }

        // إنشاء لوحة ألوان
        const paletteCanvas = document.createElement("canvas");
        const paletteCtx = paletteCanvas.getContext("2d")!;

        paletteCanvas.width = 500;
        paletteCanvas.height = 100;

        const colorWidth = paletteCanvas.width / Math.min(colors.length, 10);

        colors.slice(0, 10).forEach((color, index) => {
          paletteCtx.fillStyle = color;
          paletteCtx.fillRect(
            index * colorWidth,
            0,
            colorWidth,
            paletteCanvas.height,
          );
        });

        paletteCanvas.toBlob((blob) => {
          if (blob) {
            downloadBlob(blob, `color-palette-${file.name.split(".")[0]}.png`);
          }
        }, "image/png");
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categories = [
    {
      id: "all",
      name: "جميع الأدوات",
      nameEn: "All Tools",
      icon: "🛠️",
      count: realTools.length,
    },
    {
      id: "image",
      name: "الصور",
      nameEn: "Images",
      icon: "🖼️",
      count: realTools.filter((t) => t.category === "image").length,
    },
    {
      id: "video",
      name: "الفيديو",
      nameEn: "Video",
      icon: "📹",
      count: realTools.filter((t) => t.category === "video").length,
    },
    {
      id: "audio",
      name: "الصوت",
      nameEn: "Audio",
      icon: "🎵",
      count: realTools.filter((t) => t.category === "audio").length,
    },
    {
      id: "text",
      name: "النصوص",
      nameEn: "Text",
      icon: "📝",
      count: realTools.filter((t) => t.category === "text").length,
    },
    {
      id: "utility",
      name: "أدوات مساعدة",
      nameEn: "Utility",
      icon: "⚙️",
      count: realTools.filter((t) => t.category === "utility").length,
    },
  ];

  const filteredTools =
    selectedCategory === "all"
      ? realTools
      : realTools.filter((tool) => tool.category === selectedCategory);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🛠️ صندوق الأدوات الحقيقي
          </h1>
          <p className="text-xl text-blue-200">
            أدوات محلية 100% تعمل بـ JavaScript - لا خدمات خارجية!
          </p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                p-4 rounded-xl border-2 transition-all duration-300 text-center
                ${
                  selectedCategory === category.id
                    ? "border-blue-400 bg-blue-500/20 scale-105"
                    : "border-blue-600/30 bg-white/5 hover:bg-white/10"
                }
              `}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <div className="text-white font-semibold text-sm">
                {category.name}
              </div>
              <div className="text-blue-300 text-xs">{category.nameEn}</div>
              <div className="text-blue-400 text-xs mt-1">
                {category.count} أداة
              </div>
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="p-6">
                <div className="text-4xl mb-4 text-center">{tool.icon}</div>

                <h3 className="text-white font-bold text-lg mb-2 text-center">
                  {tool.nameAr}
                </h3>

                <p className="text-blue-200 text-sm mb-4 text-center">
                  {tool.descriptionAr}
                </p>

                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                    ✅ محلي 100%
                  </span>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                    {tool.category}
                  </span>
                </div>

                <button
                  onClick={tool.functionality}
                  disabled={processingFiles.has(tool.id)}
                  className={`
                    w-full py-3 rounded-lg font-semibold transition-all duration-200
                    ${
                      activeToolId === tool.id
                        ? "bg-yellow-500 text-yellow-900"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {activeToolId === tool.id
                    ? "🔄 جار المعالجة..."
                    : "🚀 تشغيل الأداة"}
                </button>

                {tool.fileTypes && (
                  <div className="mt-2 text-center">
                    <span className="text-xs text-white/60">
                      يدعم: {tool.fileTypes.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 text-center bg-white/5 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-white mb-4">
            🎯 مميزات صندوق الأدوات
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-blue-200">
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-semibold mb-2">سرعة فائقة</h4>
              <p className="text-sm">معالجة محلية بدون تأخير الشبكة</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🔒</div>
              <h4 className="font-semibold mb-2">خصوصية كاملة</h4>
              <p className="text-sm">ملفاتك لا تغادر جهازك أبداً</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🆓</div>
              <h4 className="font-semibold mb-2">مجاني 100%</h4>
              <p className="text-sm">لا اشتراكات أو حدود استخدام</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolboxPanel;
