import React, { useState, useEffect } from "react";
import { VideoTemplate, TemplateCategory } from "../types/templates";

const TemplatesPanel: React.FC = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<TemplateCategory>("for-you");
  const [templates, setTemplates] = useState<VideoTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const handleTemplateSelect = (template: VideoTemplate) => {
    // إنشاء إشعار عن اختيار القالب
    alert(`تم اختيار قالب: ${template.name}`);

    // تسجيل للمطورين
    console.log("تم اختيار القالب:", template);

    // يمكن ��ضافة منطق لفتح محرر القالب هنا
    // مثل: navigate to template editor with template data
  };

  // فئات القوالب الشاملة - مطابقة للمتطلبات
  const categories = [
    {
      id: "for-you",
      name: "لك",
      icon: "⭐",
      color: "knoux-purple",
      description: "قوالب مقترحة وشائعة بناءً على اهتماماتك",
    },
    {
      id: "education",
      name: "تعليمي",
      icon: "📚",
      color: "blue-400",
      description: "قوالب للعروض التعليمية والمحتوى الأكاديمي",
    },
    {
      id: "birthday",
      name: "عيد ميلاد",
      icon: "🎂",
      color: "pink-400",
      description: "قوالب احتفالية بألوان زاهية وعناصر مميزة",
    },
    {
      id: "festival",
      name: "مهرجان",
      icon: "🎉",
      color: "yellow-400",
      description: "قوالب للمناسبات والأعياد والمهرجانات",
    },
    {
      id: "intro",
      name: "مقدمة",
      icon: "🎬",
      color: "green-400",
      description: "قوالب مقدمات احترافية للفيديوهات",
    },
    {
      id: "vlog",
      name: "فلوج",
      icon: "📹",
      color: "orange-400",
      description: "قوالب للفلوجات والمحتوى الشخصي",
    },
    {
      id: "business",
      name: "أعمال",
      icon: "💼",
      color: "indigo-400",
      description: "قوالب احترافية للعروض التجارية",
    },
    {
      id: "social-media",
      name: "سوشيال ميديا",
      icon: "📱",
      color: "purple-400",
      description: "قوالب مصممة خصيصاً لمنصات التواصل",
    },
  ] as const;

  // إنشاء قوالب شاملة وحقيقية
  const generateComprehensiveTemplates = (): VideoTemplate[] => {
    const comprehensiveTemplates: VideoTemplate[] = [];

    // قوالب "لك" - الأكثر شعبية ومقترحة
    for (let i = 1; i <= 15; i++) {
      comprehensiveTemplates.push({
        template_id: `for-you-${i}`,
        name: `قالب مقترح ${i}`,
        description: `قالب مصمم خصيصاً لك بناءً على تفضيلاتك واستخدامك`,
        category: "for-you",
        aspect_ratio: ["16:9", "9:16", "1:1", "4:3"][
          Math.floor(Math.random() * 4)
        ] as any,
        preview_thumbnail: `/api/placeholder/400/300`,
        duration: 15 + Math.random() * 45,
        difficulty: ["easy", "medium", "advanced"][
          Math.floor(Math.random() * 3)
        ] as any,
        tags: ["شائع", "مقترح", "شخصي"],
        premium: Math.random() > 0.5,
        popular: true,
        trending: Math.random() > 0.3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        elements: [
          {
            id: "main-title",
            type: "text",
            placeholder_key: "main_title",
            default_value: "عنوانك الرئيسي",
            position: { x: 50, y: 20, width: 200, height: 40 },
            config: { font_size: 32, color: "#ffffff", font_weight: "bold" },
          },
          {
            id: "brand-logo",
            type: "logo",
            placeholder_key: "brand_logo",
            default_value: "",
            position: { x: 10, y: 10, width: 80, height: 80 },
            config: { opacity: 1 },
          },
        ],
      });
    }

    // قوالب تعليمية
    for (let i = 1; i <= 10; i++) {
      comprehensiveTemplates.push({
        template_id: `education-${i}`,
        name: `قالب تعليمي ${i}`,
        description: `قالب مصمم خصيصاً للمحتوى التعليمي والشروحات`,
        category: "education",
        aspect_ratio: "16:9",
        preview_thumbnail: `/api/placeholder/400/300`,
        duration: 30 + Math.random() * 60,
        difficulty: "easy",
        tags: ["تعليمي", "شرح", "أكاديمي", "واضح"],
        premium: false,
        popular: Math.random() > 0.5,
        trending: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        elements: [
          {
            id: "lesson-title",
            type: "text",
            placeholder_key: "lesson_title",
            default_value: "عنوان الدرس",
            position: { x: 50, y: 15, width: 300, height: 35 },
            config: { font_size: 28, color: "#2563eb", font_weight: "bold" },
          },
          {
            id: "instructor-name",
            type: "text",
            placeholder_key: "instructor_name",
            default_value: "اسم المدرس",
            position: { x: 50, y: 85, width: 200, height: 25 },
            config: { font_size: 18, color: "#64748b" },
          },
        ],
      });
    }

    // قوالب عيد الميلاد
    for (let i = 1; i <= 8; i++) {
      comprehensiveTemplates.push({
        template_id: `birthday-${i}`,
        name: `قالب عيد ميلاد ${i}`,
        description: `قالب احتفالي مليء بالألوان والبهجة`,
        category: "birthday",
        aspect_ratio: "1:1",
        preview_thumbnail: `/api/placeholder/400/300`,
        duration: 20 + Math.random() * 30,
        difficulty: "easy",
        tags: ["احتفال", "عيد ميلاد", "ألوان", "بهجة"],
        premium: Math.random() > 0.7,
        popular: true,
        trending: Math.random() > 0.4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        elements: [
          {
            id: "birthday-title",
            type: "text",
            placeholder_key: "birthday_name",
            default_value: "عيد ميلاد سعيد",
            position: { x: 50, y: 30, width: 250, height: 50 },
            config: { font_size: 36, color: "#ec4899", font_weight: "bold" },
          },
          {
            id: "birthday-decorations",
            type: "image",
            placeholder_key: "decorations",
            default_value: "",
            position: { x: 20, y: 20, width: 60, height: 60 },
            config: { opacity: 0.8 },
          },
        ],
      });
    }

    // قوالب المهرجانات
    for (let i = 1; i <= 6; i++) {
      comprehensiveTemplates.push({
        template_id: `festival-${i}`,
        name: `قالب مهرجان ${i}`,
        description: `قالب مليء بالحيوية للمناسبات والمهرجانات`,
        category: "festival",
        aspect_ratio: "16:9",
        preview_thumbnail: `/api/placeholder/400/300`,
        duration: 25 + Math.random() * 35,
        difficulty: "medium",
        tags: ["مهرجان", "احتفال", "مناسبة", "حيوية"],
        premium: Math.random() > 0.6,
        popular: Math.random() > 0.3,
        trending: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        elements: [
          {
            id: "festival-title",
            type: "text",
            placeholder_key: "festival_name",
            default_value: "مهرجان رائع",
            position: { x: 50, y: 25, width: 300, height: 45 },
            config: { font_size: 34, color: "#f59e0b", font_weight: "bold" },
          },
          {
            id: "festival-date",
            type: "text",
            placeholder_key: "festival_date",
            default_value: "التاريخ",
            position: { x: 50, y: 75, width: 200, height: 20 },
            config: { font_size: 16, color: "#ffffff" },
          },
        ],
      });
    }

    // قوالب المقدمات
    for (let i = 1; i <= 12; i++) {
      comprehensiveTemplates.push({
        template_id: `intro-${i}`,
        name: `مقدمة احترافية ${i}`,
        description: `قالب مقدمة مذهل لبداية مميزة لفيديوهاتك`,
        category: "intro",
        aspect_ratio: "16:9",
        preview_thumbnail: `/api/placeholder/400/300`,
        duration: 5 + Math.random() * 10,
        difficulty: "medium",
        tags: ["مقدمة", "احترافي", "مذهل", "بداية"],
        premium: Math.random() > 0.5,
        popular: true,
        trending: Math.random() > 0.2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        elements: [
          {
            id: "intro-logo",
            type: "logo",
            placeholder_key: "brand_logo",
            default_value: "",
            position: { x: 50, y: 40, width: 120, height: 120 },
            config: { animation: "fadeInScale", duration: 2 },
          },
          {
            id: "intro-text",
            type: "text",
            placeholder_key: "brand_name",
            default_value: "اسم العلامة التجارية",
            position: { x: 50, y: 70, width: 250, height: 30 },
            config: { font_size: 24, color: "#10b981", font_weight: "bold" },
          },
        ],
      });
    }

    // قوالب الفلوج
    for (let i = 1; i <= 8; i++) {
      comprehensiveTemplates.push({
        template_id: `vlog-${i}`,
        name: `فلوج يومي ${i}`,
        description: `قالب مثالي لتوثيق يومك وحياتك الشخصية`,
        category: "vlog",
        aspect_ratio: "9:16",
        preview_thumbnail: `/api/placeholder/400/300`,
        duration: 60 + Math.random() * 120,
        difficulty: "easy",
        tags: ["فلوج", "يومي", "شخصي", "حياة"],
        premium: false,
        popular: Math.random() > 0.4,
        trending: Math.random() > 0.3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        elements: [
          {
            id: "vlog-title",
            type: "text",
            placeholder_key: "vlog_title",
            default_value: "يوم في حياتي",
            position: { x: 50, y: 20, width: 200, height: 35 },
            config: { font_size: 30, color: "#f97316", font_weight: "bold" },
          },
          {
            id: "vlog-date",
            type: "text",
            placeholder_key: "today_date",
            default_value: "اليوم",
            position: { x: 50, y: 90, width: 150, height: 20 },
            config: { font_size: 14, color: "#6b7280" },
          },
        ],
      });
    }

    // قوالب الأعمال
    for (let i = 1; i <= 10; i++) {
      comprehensiveTemplates.push({
        template_id: `business-${i}`,
        name: `عرض تجاري ${i}`,
        description: `قالب احترافي للعروض التجارية والشركات`,
        category: "business",
        aspect_ratio: "16:9",
        preview_thumbnail: `/api/placeholder/400/300`,
        duration: 45 + Math.random() * 75,
        difficulty: "advanced",
        tags: ["أعمال", "احترافي", "شركات", "عرض"],
        premium: true,
        popular: Math.random() > 0.6,
        trending: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        elements: [
          {
            id: "company-name",
            type: "text",
            placeholder_key: "company_name",
            default_value: "اسم الشركة",
            position: { x: 50, y: 20, width: 300, height: 40 },
            config: { font_size: 32, color: "#3730a3", font_weight: "bold" },
          },
          {
            id: "company-slogan",
            type: "text",
            placeholder_key: "company_slogan",
            default_value: "شعار الشركة",
            position: { x: 50, y: 80, width: 250, height: 20 },
            config: { font_size: 16, color: "#64748b" },
          },
        ],
      });
    }

    // قوالب السوشيال ميديا
    for (let i = 1; i <= 12; i++) {
      comprehensiveTemplates.push({
        template_id: `social-${i}`,
        name: `سوشيال ميديا ${i}`,
        description: `قالب مُحسّن لمنصات التواصل الاجتماعي`,
        category: "social-media",
        aspect_ratio: "1:1",
        preview_thumbnail: `/api/placeholder/400/300`,
        duration: 15 + Math.random() * 30,
        difficulty: "easy",
        tags: ["سوشيال", "إنستقرام", "تيك توك", "فيسبوك"],
        premium: Math.random() > 0.6,
        popular: true,
        trending: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        elements: [
          {
            id: "social-text",
            type: "text",
            placeholder_key: "post_text",
            default_value: "نص المنشور",
            position: { x: 50, y: 40, width: 280, height: 60 },
            config: {
              font_size: 26,
              color: "#8b5cf6",
              font_weight: "bold",
              text_align: "center",
            },
          },
          {
            id: "social-hashtags",
            type: "text",
            placeholder_key: "hashtags",
            default_value: "#هاشتاج",
            position: { x: 50, y: 85, width: 200, height: 15 },
            config: { font_size: 12, color: "#6366f1" },
          },
        ],
      });
    }

    return comprehensiveTemplates;
  };

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        // محاكاة تحميل البيانات
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const generatedTemplates = generateComprehensiveTemplates();
        setTemplates(generatedTemplates);
      } catch (error) {
        console.error("خطأ في تحميل القوالب:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // فلترة القوالب حسب الفئة والبحث
  const filteredTemplates = templates.filter((template) => {
    const matchesCategory =
      selectedCategory === "for-you" || template.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <span className="ml-4 text-white/70">جار تحميل القوالب...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-knoux-purple to-knoux-neon bg-clip-text text-transparent">
            قوالب الفيديو
          </h2>
          <p className="text-white/70 mt-2">
            اختر من مكتبة واسعة من القوالب الاحترافية
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="ابحث عن قالب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-card px-4 py-3 pr-12 rounded-xl text-white placeholder-white/50 border-white/20 focus:border-knoux-purple/50 transition-all duration-300"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50">
            🔍
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id as TemplateCategory)}
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
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.template_id}
            className="glass-card interactive rounded-xl overflow-hidden group"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gradient-to-br from-knoux-purple/20 to-knoux-neon/20 overflow-hidden">
              <img
                src={template.preview_thumbnail}
                alt={template.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMTExODI3Ii8+CjxwYXRoIGQ9Ik0xNzUgMTAwSDIyNVYyMDBIMTc1VjEwMFoiIGZpbGw9IiM4QjVDRjYiLz4KPHN2Zz4=";
                }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button
                  onClick={() => handleTemplateSelect(template)}
                  className="glow-button px-6 py-2 rounded-lg font-semibold transform scale-90 group-hover:scale-100 transition-transform duration-300"
                >
                  استخدم القالب
                </button>
              </div>

              {/* Badges */}
              <div className="absolute top-3 right-3 flex gap-2">
                {template.premium && (
                  <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                    مميز
                  </span>
                )}
                {template.trending && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    رائج
                  </span>
                )}
                {template.popular && (
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    شائع
                  </span>
                )}
              </div>

              {/* Duration */}
              <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-xs">
                {Math.round(template.duration)}ث
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-white line-clamp-2 mb-2">
                {template.name}
              </h3>

              <p className="text-white/70 text-sm line-clamp-2 mb-3">
                {template.description}
              </p>

              {/* Meta */}
              <div className="flex items-center justify-between text-xs text-white/50">
                <span className="capitalize">{template.difficulty}</span>
                <span>{template.aspect_ratio}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-3">
                {template.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="bg-white/10 text-white/70 px-2 py-1 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            لم يتم العثور على قوالب
          </h3>
          <p className="text-white/70">جرب تغيير الفئة أو مصطلح البحث</p>
        </div>
      )}

      {/* Stats */}
      <div className="glass-card p-6 rounded-xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-knoux-purple">
              {templates.length}
            </div>
            <div className="text-white/70 text-sm">إجمالي القوالب</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-knoux-neon">
              {categories.length}
            </div>
            <div className="text-white/70 text-sm">الفئات</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {templates.filter((t) => !t.premium).length}
            </div>
            <div className="text-white/70 text-sm">قوالب مجانية</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {templates.filter((t) => t.premium).length}
            </div>
            <div className="text-white/70 text-sm">قوالب مميزة</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesPanel;
