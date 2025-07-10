import React, { useState, useEffect } from "react";
import { AITool, ToolCategory, UserCredits } from "../types/templates";
import {
  enhancedToolboxService as toolboxService,
  ToolExecutionResult,
} from "../services/toolboxService_enhanced";
import ImageToolInterface from "./tools/ImageToolInterface";
import VideoToolInterface from "./tools/VideoToolInterface";
import AudioToolInterface from "./tools/AudioToolInterface";
import TextToolInterface from "./tools/TextToolInterface";

const ToolboxPanel: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>("all");
  const [tools, setTools] = useState<AITool[]>([]);
  const [userCredits, setUserCredits] = useState<UserCredits>({
    total: 1000,
    used: 250,
    remaining: 750,
    subscription_tier: "pro",
    renewal_date: "2024-02-15",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [showToolInterface, setShowToolInterface] = useState(false);

  // تنفيذ عملية الأداة
  const executeToolOperation = async (
    tool: AITool,
    file?: File,
    additionalInput?: string,
  ) => {
    try {
      // التحقق من النقاط المطلوبة
      if (tool.credits_cost > userCredits.remaining) {
        throw new Error("نقاط غير كافية لتنفيذ هذه الأداة");
      }

      // إعداد المدخلات
      const input = file ? file : additionalInput || "";

      // تنفيذ العملية باستخدام toolboxService
      const result: ToolExecutionResult = await toolboxService.executeTool(
        tool.id,
        {
          input,
          file,
          settings: {},
        },
      );

      // تحديث النقاط
      setUserCredits((prev) => ({
        ...prev,
        used: prev.used + tool.credits_cost,
        remaining: prev.remaining - tool.credits_cost,
      }));

      // إظهار النتيجة
      if (result.success) {
        alert(`تم تنفيذ ${tool.name} بنجاح!`);
        if (result.downloadUrl) {
          // تنزيل النتيجة
          const a = document.createElement("a");
          a.href = result.downloadUrl;
          a.download = `result_${tool.id}_${Date.now()}`;
          a.click();
        }
      } else {
        throw new Error(result.error || "فشل في تنفيذ الأداة");
      }
    } catch (error) {
      console.error("خطأ في تنفيذ الأداة:", error);
      alert(`خطأ في تنفيذ ${tool.name}: ${error}`);
    }
  };

  // الحصول على أنواع الملفات المقبولة
  const getAcceptedFileTypes = (inputTypes: string[]): string => {
    const typeMap: Record<string, string> = {
      image: "image/*",
      video: "video/*",
      audio: "audio/*",
      text: ".txt,.md,.json",
      file: "*/*",
    };

    return inputTypes.map((type) => typeMap[type] || "*/*").join(",");
  };

  // إنشاء أدوات شاملة ومتقدمة
  const generateAdvancedTools = (): AITool[] => {
    return [
      // أدوات الفيديو
      {
        id: "video_enhancer",
        name: "تحسين الفيديو",
        description: "تحسين جودة الفيديو باستخدام ا��ذكاء الاصطناعي",
        category: "video",
        icon: "🎬",
        ai_powered: true,
        credits_cost: 15,
        processing_time: "medium",
        input_types: ["video", "file"],
        output_types: ["video"],
        features: ["تحسين الدقة", "إزالة الضوضاء", "تحسين الألوان"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "video_generator",
        name: "مولد الفيديو",
        description: "إنشاء فيديوهات من النصوص والصور",
        category: "video",
        icon: "🎞️",
        ai_powered: true,
        credits_cost: 25,
        processing_time: "slow",
        input_types: ["text", "image"],
        output_types: ["video"],
        features: ["توليد AI", "انتقالات ذكية", "تأثيرات متقدمة"],
        premium: true,
        popular: true,
        beta: false,
      },
      {
        id: "video_stabilizer",
        name: "مثبت الفيديو",
        description: "تثبيت الفيديوهات المهتزة تلقائياً",
        category: "video",
        icon: "🎯",
        ai_powered: true,
        credits_cost: 10,
        processing_time: "medium",
        input_types: ["video"],
        output_types: ["video"],
        features: ["تثبيت ذكي", "تقليل الاهتزاز", "تحسين السلاسة"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "scene_detector",
        name: "كاشف المشاهد",
        description: "تحليل المشاهد وتقطيع الفيديو تلقائياً",
        category: "video",
        icon: "🔍",
        ai_powered: true,
        credits_cost: 8,
        processing_time: "fast",
        input_types: ["video"],
        output_types: ["text", "video"],
        features: ["تحليل المحتوى", "تقطيع ذكي", "استخراج اللقطات"],
        premium: false,
        popular: false,
        beta: false,
      },

      // أدوات الصوت
      {
        id: "voice_enhancer",
        name: "محسن الصوت",
        description: "تحسين جودة الصوت وإزالة الضوضاء",
        category: "audio",
        icon: "🎙️",
        ai_powered: true,
        credits_cost: 8,
        processing_time: "fast",
        input_types: ["audio", "video"],
        output_types: ["audio"],
        features: ["إزالة الضوضاء", "تحسين الوضوح", "تطبيع الصوت"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "voice_changer",
        name: "مُغير الصوت",
        description: "تغيير نبرة وشخصية الصوت",
        category: "audio",
        icon: "🎭",
        ai_powered: true,
        credits_cost: 12,
        processing_time: "medium",
        input_types: ["audio"],
        output_types: ["audio"],
        features: ["تغيير النبرة", "تأثيرات صوتية", "أصوات مختلفة"],
        premium: true,
        popular: true,
        beta: false,
      },
      {
        id: "music_generator",
        name: "مولد الموسيقى",
        description: "إنشاء موسيقى تصويرية مخصصة",
        category: "audio",
        icon: "🎵",
        ai_powered: true,
        credits_cost: 20,
        processing_time: "slow",
        input_types: ["text"],
        output_types: ["audio"],
        features: ["توليد AI", "أنماط متنوعة", "موسيقى مخصصة"],
        premium: true,
        popular: false,
        beta: true,
      },
      {
        id: "beat_sync",
        name: "مزامن الإيقاع",
        description: "مزامنة الفيديو مع إيقاع الموسيقى",
        category: "audio",
        icon: "🥁",
        ai_powered: true,
        credits_cost: 15,
        processing_time: "medium",
        input_types: ["video", "audio"],
        output_types: ["video"],
        features: ["كشف الإيقاع", "مزامنة ذكية", "تأثيرات إيقاعية"],
        premium: true,
        popular: false,
        beta: false,
      },

      // أدوات الصور
      {
        id: "image_upscaler",
        name: "مكبر الصور",
        description: "تكبير الصور مع الحفاظ على الجودة",
        category: "image",
        icon: "🔍",
        ai_powered: true,
        credits_cost: 10,
        processing_time: "medium",
        input_types: ["image"],
        output_types: ["image"],
        features: ["تكبير AI", "تحسين التفاصيل", "دقة عالية"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "background_remover",
        name: "مزيل الخلفية",
        description: "إزالة خلفية الصور تلقائياً",
        category: "image",
        icon: "✂️",
        ai_powered: true,
        credits_cost: 5,
        processing_time: "fast",
        input_types: ["image"],
        output_types: ["image"],
        features: ["قص دقيق", "حواف ناعمة", "شفافية كاملة"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "style_transfer",
        name: "نقل النمط",
        description: "تطبيق أنماط فنية على الصور",
        category: "image",
        icon: "🎨",
        ai_powered: true,
        credits_cost: 12,
        processing_time: "medium",
        input_types: ["image"],
        output_types: ["image"],
        features: ["أنماط فنية", "لوحات مشهورة", "تأثيرات إبداعية"],
        premium: true,
        popular: true,
        beta: false,
      },
      {
        id: "colorizer",
        name: "مُلون الصور",
        description: "تلوين الصور القديمة والأبيض والأسود",
        category: "image",
        icon: "🌈",
        ai_powered: true,
        credits_cost: 8,
        processing_time: "medium",
        input_types: ["image"],
        output_types: ["image"],
        features: ["تلوين ذكي", "ألوان طبي��ية", "تحسين التاريخ"],
        premium: false,
        popular: false,
        beta: false,
      },

      // أدوات النصوص
      {
        id: "content_writer",
        name: "كاتب المحتوى",
        description: "إنشاء محتوى إبداعي ومقالات",
        category: "text",
        icon: "✍️",
        ai_powered: true,
        credits_cost: 15,
        processing_time: "medium",
        input_types: ["text"],
        output_types: ["text"],
        features: ["كتابة إبداعية", "مقالات احترافية", "أساليب متنوعة"],
        premium: true,
        popular: true,
        beta: false,
      },
      {
        id: "translator",
        name: "المترجم الذكي",
        description: "ترجمة النصوص بدقة عالية",
        category: "text",
        icon: "🌍",
        ai_powered: true,
        credits_cost: 5,
        processing_time: "fast",
        input_types: ["text"],
        output_types: ["text"],
        features: ["100+ لغة", "ترجمة طبيعية", "حفظ السياق"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "summarizer",
        name: "ملخص ال��صوص",
        description: "تلخيص النصوص الطويلة تلقائياً",
        category: "text",
        icon: "📝",
        ai_powered: true,
        credits_cost: 8,
        processing_time: "fast",
        input_types: ["text"],
        output_types: ["text"],
        features: ["تلخيص ذكي", "نقاط رئيسية", "ملخصات قابلة للتخصيص"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "seo_optimizer",
        name: "محسن SEO",
        description: "تحسين المحتوى لمحركات البحث",
        category: "text",
        icon: "📈",
        ai_powered: true,
        credits_cost: 12,
        processing_time: "medium",
        input_types: ["text"],
        output_types: ["text"],
        features: ["تحليل الكلمات المفتاحية", "تحسين المحتوى", "اقتراحات SEO"],
        premium: true,
        popular: false,
        beta: false,
      },

      // أدوات متقدمة
      {
        id: "deepfake_detector",
        name: "كاشف التزييف العميق",
        description: "كشف المحتوى المُعدل بالذكاء الاصطناعي",
        category: "ai-tools",
        icon: "🛡️",
        ai_powered: true,
        credits_cost: 20,
        processing_time: "medium",
        input_types: ["image", "video"],
        output_types: ["text"],
        features: ["كشف التزييف", "تحليل الأصالة", "تقرير مفصل"],
        premium: true,
        popular: false,
        beta: true,
      },
      {
        id: "face_animator",
        name: "محرك الوجوه",
        description: "تحريك الوجوه في الصور الثابتة",
        category: "ai-tools",
        icon: "😄",
        ai_powered: true,
        credits_cost: 18,
        processing_time: "slow",
        input_types: ["image"],
        output_types: ["video"],
        features: ["تحريك طبيعي", "تعبيرات متنوعة", "جودة عالية"],
        premium: true,
        popular: true,
        beta: false,
      },
    ];
  };

  useEffect(() => {
    const loadTools = async () => {
      try {
        const generatedTools = generateAdvancedTools();
        setTools(generatedTools);
      } catch (error) {
        console.error("خطأ في تحميل الأدوات:", error);
      }
    };

    loadTools();
  }, []);

  // فلترة الأدوات
  const filteredTools = tools.filter((tool) => {
    const matchesCategory =
      selectedCategory === "all" || tool.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.features.some((feature) =>
        feature.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return matchesCategory && matchesSearch;
  });

  // فئات الأدوات
  const categories = [
    { id: "all", name: "الكل", icon: "🔧", count: tools.length },
    {
      id: "video",
      name: "فيديو",
      icon: "🎬",
      count: tools.filter((t) => t.category === "video").length,
    },
    {
      id: "audio",
      name: "صوت",
      icon: "🎵",
      count: tools.filter((t) => t.category === "audio").length,
    },
    {
      id: "image",
      name: "صور",
      icon: "🖼️",
      count: tools.filter((t) => t.category === "image").length,
    },
    {
      id: "text",
      name: "نصوص",
      icon: "📝",
      count: tools.filter((t) => t.category === "text").length,
    },
    {
      id: "ai-tools",
      name: "أدوات AI",
      icon: "🤖",
      count: tools.filter((t) => t.category === "ai-tools").length,
    },
  ] as const;

  // معالجة اختيار الأداة
  const handleToolSelect = (tool: AITool) => {
    setSelectedTool(tool);
    setShowToolInterface(true);
  };

  // إنشاء واجهة الأداة
  const renderToolInterface = () => {
    if (!selectedTool) return null;

    const commonProps = {
      tool: selectedTool,
      onClose: () => setShowToolInterface(false),
      onSuccess: (result: any) => {
        console.log("نجح تنفيذ الأداة:", result);
        setShowToolInterface(false);
      },
      onError: (error: string) => {
        console.error("فشل تنفيذ الأداة:", error);
        alert(`خطأ: ${error}`);
      },
    };

    switch (selectedTool.category) {
      case "image":
        return <ImageToolInterface {...commonProps} />;
      case "video":
        return <VideoToolInterface {...commonProps} />;
      case "audio":
        return <AudioToolInterface {...commonProps} />;
      case "text":
        return <TextToolInterface {...commonProps} />;
      default:
        return (
          <div className="glass-card p-8 rounded-xl text-center">
            <h3 className="text-xl font-bold mb-4">أداة غير مدعومة</h3>
            <p className="text-white/70 mb-4">
              هذه الأداة لا تحتوي على واجهة مخصصة بعد.
            </p>
            <button
              onClick={() => setShowToolInterface(false)}
              className="glow-button px-6 py-2 rounded-lg"
            >
              إغلاق
            </button>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-knoux-purple to-knoux-neon bg-clip-text text-transparent">
            صندوق الأدوات الذكية
          </h2>
          <p className="text-white/70 mt-2">
            مجموعة شاملة من أدوات الذكاء الاصطناعي للمحتوى الرقمي
          </p>
        </div>

        {/* Credits Display */}
        <div className="glass-card p-4 rounded-xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-knoux-neon">
              {userCredits.remaining}
            </div>
            <div className="text-white/70 text-sm">نقطة متبقية</div>
            <div className="text-xs text-white/50 mt-1">
              {userCredits.subscription_tier}
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="ابحث عن أداة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full glass-card px-4 py-3 pr-12 rounded-xl text-white placeholder-white/50 border-white/20 focus:border-knoux-purple/50 transition-all duration-300"
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50">
          🔍
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id as ToolCategory)}
            className={`glass-card interactive p-4 rounded-xl text-center transition-all duration-300 ${
              selectedCategory === category.id
                ? "bg-knoux-purple/20 border-knoux-purple"
                : "hover:bg-white/10"
            }`}
          >
            <div className="text-2xl mb-2">{category.icon}</div>
            <div
              className={`font-semibold text-sm ${
                selectedCategory === category.id
                  ? "text-knoux-purple"
                  : "text-white"
              }`}
            >
              {category.name}
            </div>
            <div className="text-xs text-white/50">{category.count}</div>
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => handleToolSelect(tool)}
            className="glass-card interactive rounded-xl overflow-hidden group cursor-pointer"
          >
            {/* Tool Header */}
            <div className="p-6 text-center">
              <div className="text-4xl mb-3">{tool.icon}</div>
              <h3 className="font-orbitron font-bold text-white mb-2">
                {tool.name}
              </h3>
              <p className="text-white/70 text-sm line-clamp-2 mb-4">
                {tool.description}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-1 mb-4 justify-center">
                {tool.ai_powered && (
                  <span className="bg-knoux-purple/20 text-knoux-purple px-2 py-1 rounded-full text-xs">
                    AI
                  </span>
                )}
                {tool.premium && (
                  <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">
                    مميز
                  </span>
                )}
                {tool.beta && (
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">
                    تجريبي
                  </span>
                )}
                {tool.popular && (
                  <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
                    شائع
                  </span>
                )}
              </div>

              {/* Credits Cost */}
              <div className="flex items-center justify-center space-x-2 text-sm">
                <span className="text-knoux-neon font-bold">
                  {tool.credits_cost}
                </span>
                <span className="text-white/70">نقطة</span>
              </div>
            </div>

            {/* Features */}
            <div className="px-6 pb-6">
              <div className="border-t border-white/20 pt-4">
                <div className="text-xs text-white/50 mb-2">المزايا:</div>
                <div className="flex flex-wrap gap-1">
                  {tool.features.slice(0, 3).map((feature, index) => (
                    <span
                      key={index}
                      className="bg-white/10 text-white/70 px-2 py-1 rounded text-xs"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-knoux-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="bg-knoux-purple text-white px-4 py-2 rounded-lg font-semibold transform scale-90 group-hover:scale-100 transition-transform duration-300">
                استخدم الأداة
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            لم يتم العثور على أدوات
          </h3>
          <p className="text-white/70">جرب تغيير الفئة أو مصطلح البحث</p>
        </div>
      )}

      {/* Statistics */}
      <div className="glass-card p-6 rounded-xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-knoux-purple">
              {tools.length}
            </div>
            <div className="text-white/70 text-sm">إجمالي الأدوات</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-knoux-neon">
              {tools.filter((t) => t.ai_powered).length}
            </div>
            <div className="text-white/70 text-sm">أدوات AI</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {tools.filter((t) => !t.premium).length}
            </div>
            <div className="text-white/70 text-sm">أدوات مجانية</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {tools.filter((t) => t.premium).length}
            </div>
            <div className="text-white/70 text-sm">أدوات مميزة</div>
          </div>
        </div>
      </div>

      {/* Tool Interface Modal */}
      {showToolInterface && selectedTool && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-knoux-dark/95 backdrop-blur-xl border border-knoux-purple/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {renderToolInterface()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolboxPanel;
