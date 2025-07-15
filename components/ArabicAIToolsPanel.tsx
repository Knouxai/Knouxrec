import React, { useState, useCallback } from "react";

interface AITool {
  icon: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  color: "green" | "yellow" | "red";
  desc: string;
  features: string[];
  modelSize: number;
  time: number;
  points: number;
  input: number;
  output: number;
}

const ARABIC_AI_TOOLS: AITool[] = [
  {
    icon: "🖼️",
    title: "إزالة الخلفية",
    difficulty: "easy",
    color: "green",
    desc: "إزالة خلفية الصور تلقائياً باستخدام U-2-Net المحلي",
    features: ["دقة عالية", "حواف ناعمة"],
    modelSize: 95,
    time: 3,
    points: 2,
    input: 3,
    output: 1,
  },
  {
    icon: "🔊",
    title: "استخراج الصوت",
    difficulty: "easy",
    color: "green",
    desc: "استخراج المسار الصوتي من الفيديو",
    features: ["جودة عالية", "تنسيقات متعددة"],
    modelSize: 85,
    time: 10,
    points: 3,
    input: 3,
    output: 2,
  },
  {
    icon: "🎬",
    title: "استخراج المشاهد",
    difficulty: "easy",
    color: "green",
    desc: "تقسيم الفيديو إلى مشاهد تلقائياً",
    features: ["كشف تلقائي", "توقيتات دقيقة"],
    modelSize: 50,
    time: 20,
    points: 5,
    input: 3,
    output: 2,
  },
  {
    icon: "📄",
    title: "استخراج النص من الصور",
    difficulty: "easy",
    color: "green",
    desc: "استخراج النصوص من الصور باستخدام Tesseract OCR",
    features: ["لغات متعددة", "دقة عالية"],
    modelSize: 85,
    time: 8,
    points: 3,
    input: 3,
    output: 2,
  },
  {
    icon: "👤",
    title: "استخراج الوجوه من الفيديو",
    difficulty: "medium",
    color: "yellow",
    desc: "استخراج جميع الوجوه الظاهرة في الفيديو",
    features: ["دقة عالية", "تجميع الوجوه"],
    modelSize: 10,
    time: 35,
    points: 8,
    input: 3,
    output: 2,
  },
  {
    icon: "🔄",
    title: "تبديل الوجوه",
    difficulty: "hard",
    color: "red",
    desc: "تبديل الوجوه بين الصور باستخدام SimSwap",
    features: ["نتائ�� واقعية", "حفظ الهوية"],
    modelSize: 320,
    time: 15,
    points: 10,
    input: 2,
    output: 1,
  },
  {
    icon: "🎯",
    title: "تتبع الأجسام",
    difficulty: "medium",
    color: "yellow",
    desc: "تتبع الأجسام في الفيديو باستخدام YOLO Tracker",
    features: ["تتبع متعدد", "دقة عالية"],
    modelSize: 45,
    time: 30,
    points: 8,
    input: 3,
    output: 2,
  },
  {
    icon: "📹",
    title: "تثبيت الفيديو",
    difficulty: "hard",
    color: "red",
    desc: "تثبيت الفيديو المهتز وتحسين الاستقرار",
    features: ["تثبيت ذكي", "حفظ الجودة"],
    modelSize: 45,
    time: 45,
    points: 12,
    input: 3,
    output: 1,
  },
  {
    icon: "🎤",
    title: "تحسين الصوت البشري",
    difficulty: "easy",
    color: "green",
    desc: "تحسين وضوح الصوت البشري وإزالة التشويش",
    features: ["إزالة الضوضاء", "تحسين الوضوح"],
    modelSize: 15,
    time: 15,
    points: 5,
    input: 3,
    output: 1,
  },
  {
    icon: "💄",
    title: "تحسين الوجه والجلد",
    difficulty: "medium",
    color: "yellow",
    desc: "تحسين ملامح الوجه والجلد في الصور",
    features: ["تنعيم البشرة", "تحسين العينين"],
    modelSize: 150,
    time: 8,
    points: 6,
    input: 3,
    output: 1,
  },
  {
    icon: "✨",
    title: "تحسين جودة الصور",
    difficulty: "easy",
    color: "green",
    desc: "تحسين جودة الصور وإزالة الضوضاء وتعديل الألوان",
    features: ["تنعيم الضوضاء", "تحسين الألوان"],
    modelSize: 150,
    time: 5,
    points: 3,
    input: 3,
    output: 2,
  },
  {
    icon: "✨",
    title: "تحسين جودة الفيديو",
    difficulty: "hard",
    color: "red",
    desc: "تحسين جودة الفيديو ووضوح الصورة",
    features: ["تحسين الدقة", "إزالة الضوضاء"],
    modelSize: 150,
    time: 60,
    points: 20,
    input: 3,
    output: 1,
  },
  {
    icon: "😊",
    title: "تحليل المشاعر",
    difficulty: "easy",
    color: "green",
    desc: "تحليل المشاعر والعواطف في النصوص والتعليقات",
    features: ["دقة عالية", "تصنيف مفصل"],
    modelSize: 120,
    time: 5,
    points: 2,
    input: 1,
    output: 1,
  },
  {
    icon: "📊",
    title: "تحليل معدل الإطارات",
    difficulty: "easy",
    color: "green",
    desc: "تحليل معدل الإطارات وجودة الفيديو",
    features: ["إحصائيات مفصلة", "رسوم بيانية"],
    modelSize: 50,
    time: 5,
    points: 2,
    input: 3,
    output: 1,
  },
  {
    icon: "🎙️",
    title: "تحويل الكلام المحلي",
    difficulty: "medium",
    color: "yellow",
    desc: "تحويل الكلام إلى نص بشكل محلي وسريع",
    features: ["د��ة عالية", "لغات متعددة"],
    modelSize: 85,
    time: 12,
    points: 5,
    input: 3,
    output: 2,
  },
  {
    icon: "📝",
    title: "تحويل الكلام إلى نص",
    difficulty: "medium",
    color: "yellow",
    desc: "تحويل التسجيلات الصوتية إلى نص باستخدام Whisper",
    features: ["دقة عالية", "لغات متعددة"],
    modelSize: 85,
    time: 20,
    points: 6,
    input: 3,
    output: 2,
  },
  {
    icon: "🎭",
    title: "تحويل إلى رسمة",
    difficulty: "hard",
    color: "red",
    desc: "تحويل الصور الحقيقية إلى رسوم متحركة",
    features: ["أسلوب كرتوني", "ألوان زاهية"],
    modelSize: 2500,
    time: 18,
    points: 12,
    input: 3,
    output: 1,
  },
  {
    icon: "🖼️",
    title: "تحويل فيديو إلى صور",
    difficulty: "easy",
    color: "green",
    desc: "استخراج الإطارات من الفيديو كصور منفصلة",
    features: ["دقة قابلة للتعديل", "فترات زمنية"],
    modelSize: 50,
    time: 15,
    points: 4,
    input: 3,
    output: 1,
  },
  {
    icon: "🎵",
    title: "تغيير نغمة الصوت",
    difficulty: "medium",
    color: "yellow",
    desc: "تغيير طبقة ونغمة الصوت مع الحفاظ على الوضوح",
    features: ["تحكم دقيق", "معاينة مباشرة"],
    modelSize: 220,
    time: 25,
    points: 7,
    input: 2,
    output: 1,
  },
  {
    icon: "📈",
    title: "تكبير الصور",
    difficulty: "medium",
    color: "yellow",
    desc: "تكبير الصور وتحسين جودتها باستخدام Real-ESRGAN",
    features: ["تكبير 4x", "تحسين الجودة"],
    modelSize: 150,
    time: 8,
    points: 5,
    input: 3,
    output: 1,
  },
  {
    icon: "🎨",
    title: "تلوين الصور القديمة",
    difficulty: "hard",
    color: "red",
    desc: "تلوين الصور القديمة والأبيض والأسود تلقائياً",
    features: ["ألوان طبيعية", "حفظ التفاصيل"],
    modelSize: 2500,
    time: 20,
    points: 15,
    input: 3,
    output: 1,
  },
  {
    icon: "📊",
    title: "توليد طيف ترددي",
    difficulty: "easy",
    color: "green",
    desc: "إنشاء طيف ترددي مرئي للملفات الصوتية",
    features: ["دقة عالية", "ألوان قابلة للتعديل"],
    modelSize: 25,
    time: 10,
    points: 3,
    input: 3,
    output: 2,
  },
  {
    icon: "⏪",
    title: "عكس الصوت",
    difficulty: "easy",
    color: "green",
    desc: "عكس الملفات الصوتية وتشغيلها بالاتجاه المعاكس",
    features: ["معالجة سريعة", "جودة عالية"],
    modelSize: 25,
    time: 5,
    points: 1,
    input: 3,
    output: 1,
  },
  {
    icon: "🎵",
    title: "فصل الصوت والموسيقى",
    difficulty: "medium",
    color: "yellow",
    desc: "فصل الأصوات والآلات الموسيقية باستخدام Spleeter",
    features: ["فصل عالي الجودة", "4 مسارات"],
    modelSize: 150,
    time: 30,
    points: 8,
    input: 3,
    output: 1,
  },
  {
    icon: "🎨",
    title: "فلاتر الفيديو",
    difficulty: "medium",
    color: "yellow",
    desc: "تطبيق فلاتر وتأثيرات متنوعة على الفيديو",
    features: ["20+ فلتر", "معاينة مباشرة"],
    modelSize: 2500,
    time: 40,
    points: 10,
    input: 3,
    output: 1,
  },
  {
    icon: "🌍",
    title: "كاشف اللغة",
    difficulty: "easy",
    color: "green",
    desc: "اكتشاف لغة النص والترجمة الأساسية",
    features: ["100+ لغة", "دقة عالية"],
    modelSize: 420,
    time: 3,
    points: 1,
    input: 1,
    output: 1,
  },
  {
    icon: "🎯",
    title: "كشف الأجسام",
    difficulty: "easy",
    color: "green",
    desc: "كشف وتمييز الأجسام في الصور باستخدام YOLOv8",
    features: ["80+ فئة", "دقة عالية"],
    modelSize: 45,
    time: 2,
    points: 2,
    input: 3,
    output: 2,
  },
  {
    icon: "🏃",
    title: "كشف الحركة",
    difficulty: "medium",
    color: "yellow",
    desc: "كشف وتحليل الحركة في الفيديو",
    features: ["حساسية قابلة للتعديل", "مناطق محددة"],
    modelSize: 45,
    time: 25,
    points: 6,
    input: 3,
    output: 2,
  },
  {
    icon: "📐",
    title: "كشف الحواف ��التفاصيل",
    difficulty: "easy",
    color: "green",
    desc: "استخراج الحواف والتفاصيل من الصور باستخدام Canny",
    features: ["حواف دقيقة", "تفاصيل واضحة"],
    modelSize: 45,
    time: 2,
    points: 1,
    input: 3,
    output: 1,
  },
  {
    icon: "👤",
    title: "كشف الوجوه",
    difficulty: "easy",
    color: "green",
    desc: "اكتشاف الوجوه ونقاط الوجه في الصور",
    features: ["دقة عالية", "نقاط الوجه"],
    modelSize: 10,
    time: 1,
    points: 1,
    input: 3,
    output: 1,
  },
  {
    icon: "🔇",
    title: "كشف فترات الصمت",
    difficulty: "easy",
    color: "green",
    desc: "اكتشاف وتحديد فترات الصمت في التسجيلات الصوتية",
    features: ["حساسية قابلة للتعديل", "تقارير مفصلة"],
    modelSize: 25,
    time: 8,
    points: 2,
    input: 3,
    output: 1,
  },
  {
    icon: "📈",
    title: "محلل الضوضاء",
    difficulty: "medium",
    color: "yellow",
    desc: "تحليل وتحديد أنواع الضوضاء في التسجيلات",
    features: ["تحليل شامل", "تصنيف الضوضاء"],
    modelSize: 15,
    time: 12,
    points: 4,
    input: 3,
    output: 1,
  },
  {
    icon: "🔍",
    title: "محلل الملفات الشامل",
    difficulty: "easy",
    color: "green",
    desc: "تحليل شامل للملفات: البيانات الوصفية، الهاش، الحجم، البنية",
    features: ["تحليل شامل", "معلومات مفصلة"],
    modelSize: 45,
    time: 5,
    points: 2,
    input: 1,
    output: 2,
  },
  {
    icon: "🔄",
    title: "محول الصوت",
    difficulty: "easy",
    color: "green",
    desc: "تحويل بين مونو وستيريو وتنسيقات صوتية مختلفة",
    features: ["تنسيقات متعددة", "جودة عالية"],
    modelSize: 25,
    time: 6,
    points: 2,
    input: 4,
    output: 2,
  },
  {
    icon: "🔧",
    title: "مرشح الترددات",
    difficulty: "easy",
    color: "green",
    desc: "تصفية ترددات معينة (عالية/منخفضة) من الصوت",
    features: ["فلاتر متقدمة", "تحكم دقيق"],
    modelSize: 15,
    time: 8,
    points: 2,
    input: 3,
    output: 1,
  },
  {
    icon: "📚",
    title: "مصنف الوثائق",
    difficulty: "medium",
    color: "yellow",
    desc: "تصنيف الوثائق والنصوص حسب المحتوى والموضوع",
    features: ["تصنيف ذكي", "فئات متعددة"],
    modelSize: 120,
    time: 10,
    points: 4,
    input: 2,
    output: 1,
  },
  {
    icon: "📋",
    title: "ملخص النصوص",
    difficulty: "medium",
    color: "yellow",
    desc: "تلخيص النصوص الطويلة والوثائق تلقائياً",
    features: ["ملخص ذكي", "نقاط رئيسية"],
    modelSize: 120,
    time: 15,
    points: 6,
    input: 2,
    output: 2,
  },
  {
    icon: "✍️",
    title: "مولد النصوص",
    difficulty: "medium",
    color: "yellow",
    desc: "توليد نصوص إبداعية ومقالات باستخدام GPT4All",
    features: ["إبداع عالي", "أساليب متنوعة"],
    modelSize: 120,
    time: 20,
    points: 8,
    input: 1,
    output: 1,
  },
];

interface ArabicAIToolsPanelProps {}

const ArabicAIToolsPanel: React.FC<ArabicAIToolsPanelProps> = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<
    "all" | "easy" | "medium" | "hard"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter tools based on search and difficulty
  const filteredTools = ARABIC_AI_TOOLS.filter((tool) => {
    const matchesSearch =
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.features.some((f) =>
        f.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesDifficulty =
      difficultyFilter === "all" || tool.difficulty === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "hard":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getBorderColor = (color: string): string => {
    switch (color) {
      case "green":
        return "border-green-500/30";
      case "yellow":
        return "border-yellow-500/30";
      case "red":
        return "border-red-500/30";
      default:
        return "border-gray-500/30";
    }
  };

  const handleToolRun = useCallback(async (tool: AITool) => {
    setSelectedTool(tool);
    setIsProcessing(true);

    // Simulate tool execution
    await new Promise((resolve) => setTimeout(resolve, tool.time * 100));

    setIsProcessing(false);
    // You can add real tool execution logic here
    console.log(`Running tool: ${tool.title}`);
  }, []);

  const handleToolSettings = useCallback((tool: AITool) => {
    setSelectedTool(tool);
    // Open settings modal for the tool
    console.log(`Opening settings for: ${tool.title}`);
  }, []);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"
      dir="rtl"
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                لوحة أدوات الذكاء الاصطناعي
              </h1>
              <p className="text-gray-600 mt-1">
                مجموعة شاملة من أدوات الذكاء الاصطناعي المحلية
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-4xl">🤖</div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {ARABIC_AI_TOOLS.length}
                </div>
                <div className="text-sm text-gray-500">أداة متاحة</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="ال��حث في الأدوات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع المستويات</option>
            <option value="easy">سهل</option>
            <option value="medium">متوسط</option>
            <option value="hard">صعب</option>
          </select>

          {/* View Mode */}
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            title={viewMode === "grid" ? "عرض قائمة" : "عرض شبكة"}
          >
            {viewMode === "grid" ? "📋" : "⊞"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-green-600">
              {ARABIC_AI_TOOLS.filter((t) => t.difficulty === "easy").length}
            </div>
            <div className="text-sm text-gray-600">أدوات سهلة</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">
              {ARABIC_AI_TOOLS.filter((t) => t.difficulty === "medium").length}
            </div>
            <div className="text-sm text-gray-600">أدوات متوسطة</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-red-600">
              {ARABIC_AI_TOOLS.filter((t) => t.difficulty === "hard").length}
            </div>
            <div className="text-sm text-gray-600">أدوات صعبة</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">
              {filteredTools.length}
            </div>
            <div className="text-sm text-gray-600">نتائج البحث</div>
          </div>
        </div>

        {/* Tools Grid/List */}
        <div
          className={`
          ${
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }
        `}
        >
          {filteredTools.map((tool, index) => (
            <div
              key={index}
              className={`
                group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 ${getBorderColor(tool.color)}
                ${viewMode === "list" ? "flex items-center p-4" : "flex flex-col"}
              `}
            >
              {viewMode === "grid" ? (
                <>
                  {/* Header */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{tool.icon}</div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">
                            {tool.title}
                          </h3>
                          <div
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border ${getDifficultyColor(tool.difficulty)}`}
                          >
                            {tool.difficulty}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-700">
                          💎 {tool.points}
                        </div>
                        <div className="text-xs text-gray-500">
                          النقاط المطلوبة
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{tool.desc}</p>
                    <div className="flex gap-2 flex-wrap">
                      {tool.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="px-6 py-3 bg-gray-50 text-xs text-gray-600">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="font-semibold text-gray-800">
                          {tool.modelSize} MB
                        </div>
                        <div>حجم النموذج</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {tool.time}s
                        </div>
                        <div>وقت المعالجة</div>
                      </div>
                      <div>
                        <div className="font-semibold text-green-600">
                          ✅ جاهز
                        </div>
                        <div>حالة النموذج</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToolSettings(tool)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 text-sm"
                        >
                          ⚙️ إعدادات
                        </button>
                        <button
                          onClick={() => handleToolRun(tool)}
                          disabled={isProcessing}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none text-sm font-semibold"
                        >
                          ⚡ تشغيل الأداة
                        </button>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <div title="أنواع المدخلات">📥 {tool.input} نوع</div>
                        <div title="تنسيقات المخرجات">
                          📤 {tool.output} تنسيق
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* List View */
                <>
                  <div className="text-3xl ml-4">{tool.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        {tool.title}
                      </h3>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-bold ${getDifficultyColor(tool.difficulty)}`}
                      >
                        {tool.difficulty}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{tool.desc}</p>
                    <div className="flex gap-2">
                      {tool.features.slice(0, 2).map((feature, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mr-4">
                    <div className="text-center">
                      <div className="font-bold text-gray-700">
                        💎 {tool.points}
                      </div>
                      <div className="text-xs text-gray-500">نقاط</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToolSettings(tool)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                      >
                        ⚙️
                      </button>
                      <button
                        onClick={() => handleToolRun(tool)}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 text-sm font-semibold"
                      >
                        ⚡ تشغيل
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredTools.length === 0 && (
          <div className="text-center py-16">
            <div className="text-8xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">
              لا توجد أدوات مطابقة
            </h3>
            <p className="text-gray-500">
              جرب كلمات بحث مختلفة أو غير مستوى الصعوبة
            </p>
          </div>
        )}
      </div>

      {/* Processing Modal */}
      {isProcessing && selectedTool && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">{selectedTool.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                جار تشغيل {selectedTool.title}
              </h3>
              <p className="text-gray-600 mb-6">يرجى الانتظار...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse"
                  style={{ width: "70%" }}
                />
              </div>
              <div className="mt-4 text-sm text-gray-500">
                المدة المتوقعة: {selectedTool.time} ثانية
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArabicAIToolsPanel;
