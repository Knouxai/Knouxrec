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

    // يم��ن إضافة منطق لفتح محرر القالب هنا
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
      description: "مقدمات جذابة للقنوات والفيديوهات",
    },
    {
      id: "outro",
      name: "خاتمة",
      icon: "🎭",
      color: "purple-400",
      description: "خاتمات تحفز التفاعل والاشتراك",
    },
    {
      id: "vlog",
      name: "فلوج",
      icon: "📹",
      color: "orange-400",
      description: "قوالب شخصية وديناميكية للفلوقات",
    },
    {
      id: "wedding",
      name: "زفاف",
      icon: "💍",
      color: "rose-400",
      description: "قوالب أنيقة ورومانسية للزفاف",
    },
    {
      id: "news",
      name: "أخبار",
      icon: "📰",
      color: "red-400",
      description: "قوالب إخبارية رسمية ومهنية",
    },
    {
      id: "business",
      name: "أعمال",
      icon: "💼",
      color: "indigo-400",
      description: "قوالب العروض التجارية والإعلانات",
    },
  ] as const;

  // توليد قوالب شاملة لجميع الفئات
  useEffect(() => {
    const generateComprehensiveTemplates = (): VideoTemplate[] => {
      const comprehensiveTemplates: VideoTemplate[] = [];

      // قوالب "لك" - مقترحة وشائعة
      for (let i = 1; i <= 8; i++) {
        comprehensiveTemplates.push({
          template_id: `for-you-${i}`,
          name: `القالب المقترح ${i}`,
          description: `قالب مخصص بناءً على تفضيلاتك واهتماماتك`,
          category: "for-you",
          thumbnail: `/api/placeholder/400/300`,
          duration: 15 + Math.random() * 45,
          difficulty: ["easy", "medium", "hard"][
            Math.floor(Math.random() * 3)
          ] as any,
          tags: ["شائع", "مقترح", "شخصي"],
          ai_enhanced: true,
          premium: Math.random() > 0.5,
          rating: 4 + Math.random(),
          usage_count: Math.floor(Math.random() * 10000),
          elements: [
            {
              type: "text",
              placeholder_key: "main_title",
              default_value: "عنوانك الرئيسي",
              position: { x: 50, y: 20 },
              style: { fontSize: 32, color: "#ffffff", fontWeight: "bold" },
            },
            {
              type: "logo",
              placeholder_key: "brand_logo",
              default_value: "",
              position: { x: 10, y: 10 },
              style: { width: 80, height: 80 },
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
          thumbnail: `/api/placeholder/400/300`,
          duration: 30 + Math.random() * 60,
          difficulty: "easy",
          tags: ["تعليمي", "شرح", "أكاديمي", "واضح"],
          ai_enhanced: true,
          premium: false,
          rating: 4.2 + Math.random() * 0.8,
          usage_count: Math.floor(Math.random() * 5000),
          elements: [
            {
              type: "text",
              placeholder_key: "lesson_title",
              default_value: "عنوان الدرس",
              position: { x: 50, y: 15 },
              style: { fontSize: 28, color: "#2563eb", fontWeight: "bold" },
            },
            {
              type: "text",
              placeholder_key: "instructor_name",
              default_value: "اسم المدرس",
              position: { x: 50, y: 85 },
              style: { fontSize: 18, color: "#64748b" },
            },
          ],
        });
      }

      // قوالب عيد ميلاد
      for (let i = 1; i <= 6; i++) {
        comprehensiveTemplates.push({
          template_id: `birthday-${i}`,
          name: `قالب عيد ميلاد ${i}`,
          description: `قالب احتفالي مليء بالألوان والبهجة`,
          category: "birthday",
          thumbnail: `/api/placeholder/400/300`,
          duration: 10 + Math.random() * 20,
          difficulty: "easy",
          tags: ["احتفالي", "بهيج", "ملون", "عيد ميلاد"],
          ai_enhanced: true,
          premium: Math.random() > 0.7,
          rating: 4.5 + Math.random() * 0.5,
          usage_count: Math.floor(Math.random() * 3000),
          elements: [
            {
              type: "text",
              placeholder_key: "birthday_name",
              default_value: "اسم صاحب العيد",
              position: { x: 50, y: 40 },
              style: { fontSize: 36, color: "#ec4899", fontWeight: "bold" },
            },
          ],
        });
      }

      // قوالب المهرجانات
      for (let i = 1; i <= 8; i++) {
        comprehensiveTemplates.push({
          template_id: `festival-${i}`,
          name: `قالب مهرجان ${i}`,
          description: `قالب للمناسبات والأعياد الخاصة`,
          category: "festival",
          thumbnail: `/api/placeholder/400/300`,
          duration: 15 + Math.random() * 30,
          difficulty: "medium",
          tags: ["مهرجان", "مناسبة", "احتفال", "خاص"],
          ai_enhanced: true,
          premium: Math.random() > 0.6,
          rating: 4.3 + Math.random() * 0.7,
          usage_count: Math.floor(Math.random() * 4000),
          elements: [
            {
              type: "text",
              placeholder_key: "festival_name",
              default_value: "اسم المناسبة",
              position: { x: 50, y: 30 },
              style: { fontSize: 32, color: "#fbbf24", fontWeight: "bold" },
            },
          ],
        });
      }

      // قوالب المقدمات
      for (let i = 1; i <= 12; i++) {
        comprehensiveTemplates.push({
          template_id: `intro-${i}`,
          name: `مقدمة ${i}`,
          description: `مقدمة قصيرة وجذابة لقناتك أو فيديوك`,
          category: "intro",
          thumbnail: `/api/placeholder/400/300`,
          duration: 5 + Math.random() * 10,
          difficulty: "medium",
          tags: ["مقدمة", "جذاب", "قصير", "احترافي"],
          ai_enhanced: true,
          premium: Math.random() > 0.4,
          rating: 4.4 + Math.random() * 0.6,
          usage_count: Math.floor(Math.random() * 8000),
          elements: [
            {
              type: "logo",
              placeholder_key: "channel_logo",
              default_value: "",
              position: { x: 50, y: 50 },
              style: { width: 120, height: 120 },
            },
            {
              type: "text",
              placeholder_key: "channel_name",
              default_value: "اسم القناة",
              position: { x: 50, y: 75 },
              style: { fontSize: 24, color: "#10b981", fontWeight: "bold" },
            },
          ],
        });
      }

      // قوالب الخاتمات
      for (let i = 1; i <= 8; i++) {
        comprehensiveTemplates.push({
          template_id: `outro-${i}`,
          name: `خاتمة ${i}`,
          description: `خاتمة تحفز المشاهدين على التفاعل والاشتراك`,
          category: "outro",
          thumbnail: `/api/placeholder/400/300`,
          duration: 8 + Math.random() * 15,
          difficulty: "easy",
          tags: ["خاتمة", "تفاعل", "اشتراك", "دعوة"],
          ai_enhanced: true,
          premium: Math.random() > 0.5,
          rating: 4.2 + Math.random() * 0.8,
          usage_count: Math.floor(Math.random() * 6000),
          elements: [
            {
              type: "text",
              placeholder_key: "call_to_action",
              default_value: "لا تنسى الاشتراك!",
              position: { x: 50, y: 60 },
              style: { fontSize: 28, color: "#8b5cf6", fontWeight: "bold" },
            },
          ],
        });
      }

      // قوالب الفلوج
      for (let i = 1; i <= 10; i++) {
        comprehensiveTemplates.push({
          template_id: `vlog-${i}`,
          name: `فلوج ${i}`,
          description: `قالب شخصي وديناميكي للفلوقات اليومية`,
          category: "vlog",
          thumbnail: `/api/placeholder/400/300`,
          duration: 20 + Math.random() * 40,
          difficulty: "easy",
          tags: ["فلوج", "شخصي", "يومي", "عفوي"],
          ai_enhanced: true,
          premium: false,
          rating: 4.1 + Math.random() * 0.9,
          usage_count: Math.floor(Math.random() * 7000),
          elements: [
            {
              type: "text",
              placeholder_key: "vlog_title",
              default_value: "يوم في حياتي",
              position: { x: 50, y: 20 },
              style: { fontSize: 30, color: "#f97316", fontWeight: "bold" },
            },
          ],
        });
      }

      // قوالب الزفاف
      for (let i = 1; i <= 6; i++) {
        comprehensiveTemplates.push({
          template_id: `wedding-${i}`,
          name: `زفاف ${i}`,
          description: `قالب أنيق ورومانسي لحفلات الزفاف`,
          category: "wedding",
          thumbnail: `/api/placeholder/400/300`,
          duration: 25 + Math.random() * 35,
          difficulty: "medium",
          tags: ["زفاف", "رومانسي", "أنيق", "خاص"],
          ai_enhanced: true,
          premium: true,
          rating: 4.7 + Math.random() * 0.3,
          usage_count: Math.floor(Math.random() * 2000),
          elements: [
            {
              type: "text",
              placeholder_key: "couple_names",
              default_value: "أسماء العروسين",
              position: { x: 50, y: 35 },
              style: { fontSize: 34, color: "#f43f5e", fontWeight: "bold" },
            },
            {
              type: "text",
              placeholder_key: "wedding_date",
              default_value: "تاريخ الزفاف",
              position: { x: 50, y: 65 },
              style: { fontSize: 20, color: "#64748b" },
            },
          ],
        });
      }

      // قوالب الأخبار
      for (let i = 1; i <= 8; i++) {
        comprehensiveTemplates.push({
          template_id: `news-${i}`,
          name: `أخبار ${i}`,
          description: `قالب إخباري رسمي ومهني`,
          category: "news",
          thumbnail: `/api/placeholder/400/300`,
          duration: 30 + Math.random() * 60,
          difficulty: "medium",
          tags: ["أخبار", "رسمي", "مهني", "إعلامي"],
          ai_enhanced: true,
          premium: false,
          rating: 4.0 + Math.random(),
          usage_count: Math.floor(Math.random() * 3000),
          elements: [
            {
              type: "text",
              placeholder_key: "news_headline",
              default_value: "عنوان الخبر الرئيسي",
              position: { x: 50, y: 25 },
              style: { fontSize: 28, color: "#dc2626", fontWeight: "bold" },
            },
            {
              type: "text",
              placeholder_key: "news_source",
              default_value: "مصدر الخبر",
              position: { x: 50, y: 80 },
              style: { fontSize: 16, color: "#64748b" },
            },
          ],
        });
      }

      // قوالب الأعمال
      for (let i = 1; i <= 10; i++) {
        comprehensiveTemplates.push({
          template_id: `business-${i}`,
          name: `أعمال ${i}`,
          description: `قالب تجاري احترافي للعروض والإعلانات`,
          category: "business",
          thumbnail: `/api/placeholder/400/300`,
          duration: 20 + Math.random() * 50,
          difficulty: "hard",
          tags: ["أعمال", "تجاري", "احترافي", "عرض"],
          ai_enhanced: true,
          premium: Math.random() > 0.3,
          rating: 4.3 + Math.random() * 0.7,
          usage_count: Math.floor(Math.random() * 5000),
          elements: [
            {
              type: "text",
              placeholder_key: "company_name",
              default_value: "اسم الشركة",
              position: { x: 50, y: 20 },
              style: { fontSize: 32, color: "#3730a3", fontWeight: "bold" },
            },
            {
              type: "text",
              placeholder_key: "business_slogan",
              default_value: "شعار الشركة",
              position: { x: 50, y: 70 },
              style: { fontSize: 18, color: "#64748b" },
            },
          ],
        });
      }

      return comprehensiveTemplates;
    };

    setLoading(true);
    setTimeout(() => {
      setTemplates(generateComprehensiveTemplates());
      setLoading(false);
    }, 1000);
  }, []);

  const filteredTemplates = templates.filter((template) => {
    if (template.category !== selectedCategory) return false;
    if (
      searchQuery &&
      !template.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !template.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const TemplateCard = ({ template }: { template: VideoTemplate }) => (
    <div
      className="glass-card rounded-xl overflow-hidden border border-knoux-purple/20 hover:border-knoux-purple/60 transition-all duration-300 cursor-pointer group interactive"
      onClick={() => handleTemplateSelect(template)}
    >
      {/* Template Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-knoux-purple/20 to-knoux-neon/20 flex items-center justify-center">
        <div className="text-6xl opacity-50">
          {categories.find((c) => c.id === template.category)?.icon}
        </div>

        {/* Overlay with info */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button className="px-4 py-2 bg-knoux-purple rounded-lg text-white font-medium">
            استخدام القالب
          </button>
        </div>

        {/* Premium Badge */}
        {template.premium && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500/90 rounded text-xs font-bold text-black">
            PRO
          </div>
        )}

        {/* AI Enhanced Badge */}
        {template.ai_enhanced && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-knoux-purple to-knoux-neon rounded text-xs font-bold text-white">
            AI
          </div>
        )}
      </div>

      {/* Template Info */}
      <div className="p-4">
        <h3 className="font-rajdhani font-bold text-white mb-2 group-hover:text-knoux-purple transition-colors">
          {template.name}
        </h3>
        <p className="text-white/70 text-sm mb-3 line-clamp-2">
          {template.description}
        </p>

        {/* Template Stats */}
        <div className="flex items-center justify-between text-xs text-white/50 mb-3">
          <span>⏱️ {Math.round(template.duration)}ثانية</span>
          <span>⭐ {template.rating.toFixed(1)}</span>
          <span>👥 {template.usage_count.toLocaleString()}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.slice(0, 2).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-knoux-purple/10 border border-knoux-purple/20 rounded text-xs text-knoux-purple"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Difficulty */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-white/50">المستوى:</span>
          <span
            className={`text-xs px-2 py-1 rounded ${
              template.difficulty === "easy"
                ? "bg-green-500/20 text-green-400"
                : template.difficulty === "medium"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-red-500/20 text-red-400"
            }`}
          >
            {template.difficulty === "easy"
              ? "سهل"
              : template.difficulty === "medium"
                ? "متوسط"
                : "متقدم"}
          </span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📽️</div>
          <h3 className="text-xl font-orbitron font-bold text-white mb-2">
            جاري تحميل القوالب...
          </h3>
          <p className="text-white/70">
            انتظر قليلاً بينما نجهز ��فضل القوالب لك
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-knoux-purple to-knoux-neon bg-clip-text text-transparent">
              📽️ مكتبة القوالب الاحترافية
            </h2>
            <p className="text-white/70 mt-1">
              اختر من مجموعة واسعة من القوالب المصممة لجميع احتياجاتك
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن القوالب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 px-4 py-2 pl-10 bg-black/30 border border-knoux-purple/30 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-knoux-purple focus:border-knoux-purple"
            />
            <svg
              className="w-5 h-5 text-white/50 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-knoux-purple/10 rounded-lg">
            <div className="text-2xl font-bold text-knoux-purple">
              {templates.length}
            </div>
            <div className="text-sm text-white/70">إجمالي القوالب</div>
          </div>
          <div className="text-center p-3 bg-knoux-neon/10 rounded-lg">
            <div className="text-2xl font-bold text-knoux-neon">
              {templates.filter((t) => t.ai_enhanced).length}
            </div>
            <div className="text-sm text-white/70">قوالب ذكية</div>
          </div>
          <div className="text-center p-3 bg-green-400/10 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {templates.filter((t) => !t.premium).length}
            </div>
            <div className="text-sm text-white/70">مجانية</div>
          </div>
          <div className="text-center p-3 bg-yellow-400/10 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">
              {templates.filter((t) => t.premium).length}
            </div>
            <div className="text-sm text-white/70">احترافية</div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="glass-card p-4 rounded-2xl border border-knoux-purple/20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() =>
                setSelectedCategory(category.id as TemplateCategory)
              }
              className={`p-4 rounded-xl font-medium transition-all duration-300 text-center group ${
                selectedCategory === category.id
                  ? `bg-${category.color}/30 border-2 border-${category.color} text-${category.color}`
                  : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-2 border-transparent"
              }`}
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <div className="font-bold">{category.name}</div>
              <div className="text-xs opacity-75 mt-1">
                ({templates.filter((t) => t.category === category.id).length})
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Category Info */}
      <div className="glass-card p-4 rounded-2xl border border-knoux-purple/20">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">
            {categories.find((c) => c.id === selectedCategory)?.icon}
          </div>
          <div>
            <h3 className="font-rajdhani font-bold text-white">
              {categories.find((c) => c.id === selectedCategory)?.name}
            </h3>
            <p className="text-white/70 text-sm">
              {categories.find((c) => c.id === selectedCategory)?.description}
            </p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-lg font-bold text-knoux-neon">
              {filteredTemplates.length}
            </div>
            <div className="text-xs text-white/60">قالب متاح</div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-orbitron font-bold text-white mb-2">
              لم يتم العثور على قوالب
            </h3>
            <p className="text-white/70">
              جرب تغيير الفئة أو البحث بكلمات أخرى
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.template_id} template={template} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesPanel;
