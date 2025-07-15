import React, { useState, useEffect } from "react";

// تعريف أنواع القوالب والفئات لضمان السلامة النوعية
interface RealTemplate {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: TemplateCategory; // استخدام النوع المحدد هنا
  icon: string;
  cssTemplate: string;
  htmlTemplate: string;
  jsCode?: string;
  duration: number;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  isActive: boolean;
  previewCode: string;
}

// تعريف نوع موسع للقوالب، يجمع بين RealTemplate وخصائص إضافية
// هذا النوع يمثل القوالب التي سيتم عرضها في الواجهة
interface VideoTemplate extends RealTemplate {
  template_id: string; // تم تغيير `id` إلى `template_id` ليتوافق مع التصميم الجديد
  aspect_ratio: "16:9" | "9:16" | "1:1" | "4:3";
  preview_thumbnail: string;
  premium: boolean;
  popular: boolean;
  trending: boolean;
  created_at: string;
  updated_at: string;
  elements: {
    id: string;
    type: "text" | "image" | "logo";
    placeholder_key: string;
    default_value: string;
    position: { x: number; y: number; width: number; height: number };
    config: Record<string, any>;
  }[];
}

// تعريف أنواع الفئات لضمان استخدام فئات صحيحة فقط
type TemplateCategory =
  | "for-you"
  | "intro"
  | "outro"
  | "education"
  | "birthday"
  | "festival"
  | "vlog"
  | "business"
  | "social-media";

const TemplatesPanel: React.FC = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<TemplateCategory>("for-you"); // الفئة الافتراضية "لك"
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false); // لم يتم استخدامها حاليًا، ولكنها مهمة لعرض معاينة القالب
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [templates, setTemplates] = useState<VideoTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to convert CSS string to React style object
  const getPreviewStyle = (cssString: string): React.CSSProperties => {
    const styles: React.CSSProperties = {};

    // Split by semicolon and parse each property
    const declarations = cssString.split(";").filter((d) => d.trim());

    declarations.forEach((declaration) => {
      const [property, value] = declaration.split(":").map((s) => s.trim());
      if (property && value) {
        // Convert kebab-case to camelCase for React
        const camelCaseProperty = property.replace(/-([a-z])/g, (g) =>
          g[1].toUpperCase()
        );
        styles[camelCaseProperty as keyof React.CSSProperties] = value;
      }
    });

    return styles;
  };

  // تعريف الفئات التي ستظهر في شريط التنقل
  const categories: { id: TemplateCategory; name: string; icon: string }[] = [
    { id: "for-you", name: "لك", icon: "✨" },
    { id: "intro", name: "مقدمات", icon: "🎬" },
    { id: "outro", name: "خاتمات", icon: "👋" },
    { id: "education", name: "تعليمي", icon: "📚" },
    { id: "birthday", name: "عيد ميلاد", icon: "🎂" },
    { id: "festival", name: "مهرجانات", icon: "🎉" },
    { id: "vlog", name: "فلوج", icon: "📹" },
    { id: "business", name: "أعمال", icon: "💼" },
    { id: "social-media", name: "سوشيال ميديا", icon: "📱" },
  ];

  // قوالب CSS/HTML حقيقية وفعالة (البيانات الأولية)
  const baseRealTemplates: Omit<RealTemplate, 'category'>[] = [
    {
      id: "modern-intro-1",
      name: "Modern Intro",
      nameAr: "مقدمة عصرية",
      description: "Clean modern introduction with gradient background",
      descriptionAr: "مقدمة عصرية نظيفة مع خلفية متدرجة",
      icon: "🎬",
      duration: 3,
      difficulty: "easy",
      tags: ["modern", "gradient", "clean"],
      isActive: true,
      cssTemplate: `
        .intro-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-family: 'Arial', sans-serif;
          animation: fadeIn 1s ease-in;
        }
        .intro-title {
          font-size: 4rem;
          font-weight: bold;
          text-align: center;
          text-shadow: 0 4px 8px rgba(0,0,0,0.3);
          animation: slideUp 1.5s ease-out;
        }
        .intro-subtitle {
          font-size: 1.5rem;
          margin-top: 1rem;
          opacity: 0.9;
          animation: slideUp 1.5s ease-out 0.5s both;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `,
      htmlTemplate: `
        <div class="intro-container">
          <div>
            <h1 class="intro-title">عنوانك هنا</h1>
            <p class="intro-subtitle">وصف مختصر أو شعار</p>
          </div>
        </div>
      `,
      previewCode:
        "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      id: "neon-intro-2",
      name: "Neon Glow Intro",
      nameAr: "مقدمة نيونية",
      description: "Futuristic neon glow effect introduction",
      descriptionAr: "مقدمة مستقبلية بتأثير الضوء النيوني",
      icon: "⚡",
      duration: 4,
      difficulty: "medium",
      tags: ["neon", "glow", "futuristic"],
      isActive: true,
      cssTemplate: `
        .neon-intro {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: #0a0a0a;
          color: #00ff88;
          font-family: 'Courier New', monospace;
          overflow: hidden;
        }
        .neon-title {
          font-size: 5rem;
          font-weight: bold;
          text-align: center;
          text-shadow: 
            0 0 5px currentColor,
            0 0 10px currentColor,
            0 0 15px currentColor,
            0 0 20px currentColor;
          animation: neonPulse 2s ease-in-out infinite alternate;
        }
        .neon-border {
          border: 2px solid #00ff88;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 
            0 0 20px #00ff88,
            inset 0 0 20px rgba(0,255,136,0.1);
          animation: borderGlow 3s ease-in-out infinite;
        }
        @keyframes neonPulse {
          from { text-shadow: 0 0 5px currentColor, 0 0 10px currentColor; }
          to { text-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
        }
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 20px #00ff88; }
          50% { box-shadow: 0 0 40px #00ff88, 0 0 60px #00ff88; }
        }
      `,
      htmlTemplate: `
        <div class="neon-intro">
          <div class="neon-border">
            <h1 class="neon-title">KNOUX REC</h1>
          </div>
        </div>
      `,
      previewCode:
        "background: #0a0a0a; color: #00ff88; text-shadow: 0 0 20px #00ff88",
    },
    {
      id: "minimalist-outro-1",
      name: "Minimalist Outro",
      nameAr: "خاتمة بسيطة",
      description: "Clean and simple outro with subscribe button",
      descriptionAr: "خاتمة نظيفة وبسيطة مع زر الاشتراك",
      icon: "🎭",
      duration: 5,
      difficulty: "easy",
      tags: ["minimalist", "clean", "subscribe"],
      isActive: true,
      cssTemplate: `
        .outro-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: linear-gradient(45deg, #f0f4f8, #e2e8f0);
          color: #2d3748;
          font-family: 'Arial', sans-serif;
        }
        .outro-title {
          font-size: 3rem;
          margin-bottom: 2rem;
          color: #4a5568;
          animation: fadeInDown 1s ease-out;
        }
        .subscribe-btn {
          padding: 1rem 2rem;
          background: #e53e3e;
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 1.2rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          animation: bounceIn 1.5s ease-out;
        }
        .subscribe-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 10px 20px rgba(229,62,62,0.3);
        }
        .social-links {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          animation: fadeInUp 2s ease-out;
        }
        .social-icon {
          width: 50px;
          height: 50px;
          background: #667eea;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-decoration: none;
          transition: transform 0.3s ease;
        }
        .social-icon:hover { transform: translateY(-5px); }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `,
      htmlTemplate: `
        <div class="outro-container">
          <h2 class="outro-title">شكراً لك!</h2>
          <button class="subscribe-btn">اشترك في القناة</button>
          <div class="social-links">
            <a href="#" class="social-icon">📱</a>
            <a href="#" class="social-icon">📧</a>
            <a href="#" class="social-icon">🌐</a>
          </div>
        </div>
      `,
      previewCode: "background: linear-gradient(45deg, #f0f4f8, #e2e8f0)",
    },
    {
      id: "education-slide-1",
      name: "Education Slide",
      nameAr: "شريحة تعليمية",
      description: "Professional educational slide template",
      descriptionAr: "قالب شريحة تعليمية احترافية",
      icon: "📚",
      duration: 8,
      difficulty: "easy",
      tags: ["education", "professional", "clean"],
      isActive: true,
      cssTemplate: `
        .edu-slide {
          display: grid;
          grid-template-columns: 1fr 2fr;
          height: 100vh;
          background: #f7fafc;
          font-family: 'Arial', sans-serif;
        }
        .edu-sidebar {
          background: #4a5568;
          color: white;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .edu-content {
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .edu-title {
          font-size: 2.5rem;
          color: #2d3748;
          margin-bottom: 1rem;
          animation: slideInLeft 1s ease-out;
        }
        .edu-subtitle {
          font-size: 1.5rem;
          color: white;
          margin-bottom: 2rem;
          animation: slideInLeft 1s ease-out 0.3s both;
        }
        .edu-points {
          list-style: none;
          padding: 0;
        }
        .edu-points li {
          padding: 0.5rem 0;
          font-size: 1.2rem;
          color: #4a5568;
          animation: fadeInUp 1s ease-out calc(0.6s + var(--delay));
        }
        .edu-points li:before {
          content: "✓";
          color: #48bb78;
          font-weight: bold;
          margin-left: 1rem;
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `,
      htmlTemplate: `
        <div class="edu-slide">
          <div class="edu-sidebar">
            <h2 class="edu-subtitle">الدرس الأول</h2>
            <div style="font-size: 4rem; text-align: center;">📚</div>
          </div>
          <div class="edu-content">
            <h1 class="edu-title">عنوان الدرس</h1>
            <ul class="edu-points">
              <li style="--delay: 0s">النقطة الأولى المهمة</li>
              <li style="--delay: 0.2s">النقطة الثانية</li>
              <li style="--delay: 0.4s">النقطة الثالثة</li>
              <li style="--delay: 0.6s">الخلاصة والتطبيق</li>
            </ul>
          </div>
        </div>
      `,
      previewCode: "display: grid; grid-template-columns: 1fr 2fr;",
    },
    {
      id: "business-promo-1",
      name: "Business Promo",
      nameAr: "إعلان تجاري",
      description: "Professional business promotion template",
      descriptionAr: "قالب ترويجي تجاري احترافي",
      icon: "💼",
      duration: 6,
      difficulty: "medium",
      tags: ["business", "professional", "promo"],
      isActive: true,
      cssTemplate: `
        .business-promo {
          position: relative;
          height: 100vh;
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          font-family: 'Arial', sans-serif;
          overflow: hidden;
        }
        .business-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 2rem;
        }
        .business-logo {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: zoomIn 1s ease-out;
        }
        .business-title {
          font-size: 3.5rem; /* Adjusted for better appearance */
          margin-bottom: 0.5rem;
          animation: slideInDown 1.2s ease-out;
        }
        .business-slogan {
          font-size: 1.8rem;
          opacity: 0.8;
          animation: slideInUp 1.2s ease-out 0.3s both;
        }
        /* Simple background animation for dynamism */
        .business-promo::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: rotateBackground 20s linear infinite;
        }
        @keyframes zoomIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideInDown {
          from { transform: translateY(-50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes rotateBackground {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `,
      htmlTemplate: `
        <div class="business-promo">
          <div class="business-content">
            <div class="business-logo">🏢</div>
            <h1 class="business-title">اسم شركتك</h1>
            <p class="business-slogan">شعار يصف رؤيتك</p>
          </div>
        </div>
      `,
      previewCode: "background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    },
    // يمكن إضافة المزيد من القوالب الأولية هنا بنفس النمط
  ];

  // دالة لتوليد قوالب شاملة وحقيقية بناءً على البيانات الأولية
  const generateComprehensiveTemplates = (): VideoTemplate[] => {
    const comprehensiveTemplates: VideoTemplate[] = [];

    // دالة مساعدة لتحويل RealTemplate إلى VideoTemplate مع إضافة بيانات وهمية
    const convertToVideoTemplate = (
      baseTemplate: Omit<RealTemplate, 'category'>, // لاحظ استخدام Omit
      category: TemplateCategory, // تحديد الفئة بشكل صريح هنا
      index: number
    ): VideoTemplate => {
      return {
        ...baseTemplate,
        id: baseTemplate.id, // استخدام الـ id الأصلي لـ RealTemplate
        template_id: `${baseTemplate.id}-${index}`, // إنشاء template_id فريد
        category: category,
        aspect_ratio: ["16:9", "9:16", "1:1", "4:3"][
          Math.floor(Math.random() * 4)
        ] as any,
        preview_thumbnail: `/api/placeholder/400/300?text=${encodeURIComponent(baseTemplate.name)}&bg=${Math.floor(Math.random()*16777215).toString(16)}`,
        premium: Math.random() > 0.5,
        popular: Math.random() > 0.5,
        trending: Math.random() > 0.3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        elements: [
          {
            id: "main-title",
            type: "text",
            placeholder_key: "main_title",
            default_value: baseTemplate.name,
            position: { x: 50, y: 20, width: 200, height: 40 },
            config: { font_size: 32, color: "#ffffff", font_weight: "bold" },
          },
          {
            id: "description-text",
            type: "text",
            placeholder_key: "description",
            default_value: baseTemplate.description,
            position: { x: 50, y: 60, width: 200, height: 40 },
            config: { font_size: 18, color: "#cccccc" },
          },
        ],
      };
    };

    // إضافة القوالب الأولية مع فئات محددة
    baseRealTemplates.forEach((template, index) => {
      let category: TemplateCategory;
      if (template.id.includes("intro")) {
        category = "intro";
      } else if (template.id.includes("outro")) {
        category = "outro";
      } else if (template.id.includes("education")) {
        category = "education";
      } else if (template.id.includes("business")) {
        category = "business";
      } else {
        // فئة افتراضية إذا لم يتم مطابقة أي شيء (يمكن تعديل هذا حسب الحاجة)
        category = "for-you";
      }
      comprehensiveTemplates.push(convertToVideoTemplate(template, category, index));
    });

    // قوالب "لك" - الأكثر شعبية ومقترحة (إضافة قوالب إضافية بشكل عشوائي)
    for (let i = 1; i <= 15; i++) {
      comprehensiveTemplates.push({
        id: `for-you-${i}`,
        template_id: `for-you-${i}`,
        name: `قالب مقترح ${i}`,
        nameAr: `قالب مقترح ${i}`,
        description: `قالب مصمم خصيصاً لك بناءً على تفضيلاتك واستخدامك`,
        descriptionAr: `قالب مصمم خصيصاً لك بناءً على تفضيلاتك واستخدامك`,
        category: "for-you",
        icon: "✨",
        cssTemplate: `/* CSS for For You Template ${i} */`,
        htmlTemplate: `<div><h1>For You Template ${i}</h1></div>`,
        duration: 15 + Math.random() * 45,
        difficulty: ["easy", "medium", "hard"][
          Math.floor(Math.random() * 3)
        ] as any,
        tags: ["شائع", "مقترح", "شخصي"],
        isActive: true,
        previewCode: "background: #1a202c;",
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
        id: `education-${i}`,
        template_id: `education-${i}`,
        name: `قالب تعليمي ${i}`,
        nameAr: `قالب تعليمي ${i}`,
        description: `قالب مصمم خصيصاً للمحتوى التعليمي والشروحات`,
        descriptionAr: `قالب مصمم خصيصاً للمحتوى التعليمي والشروحات`,
        category: "education",
        icon: "📚",
        cssTemplate: `/* CSS for Education Template ${i} */`,
        htmlTemplate: `<div><h1>Education Template ${i}</h1></div>`,
        aspect_ratio: "16:9",
        preview_thumbnail: `/api/placeholder/400/300?text=تعليمي+${i}&bg=${Math.floor(Math.random()*16777215).toString(16)}`,
        duration: 30 + Math.random() * 60,
        difficulty: "easy",
        tags: ["تعليمي", "شرح", "أكاديمي", "واضح"],
        isActive: true,
        previewCode: "background: #f0f4f8;",
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
        id: `birthday-${i}`,
        template_id: `birthday-${i}`,
        name: `قالب عيد ميلاد ${i}`,
        nameAr: `قالب عيد ميلاد ${i}`,
        description: `قالب احتفالي مليء بالألوان والبهجة`,
        descriptionAr: `قالب احتفالي مليء بالألوان والبهجة`,
        category: "birthday",
        icon: "🎂",
        cssTemplate: `/* CSS for Birthday Template ${i} */`,
        htmlTemplate: `<div><h1>Birthday Template ${i}</h1></div>`,
        aspect_ratio: "1:1",
        preview_thumbnail: `/api/placeholder/400/300?text=عيد+ميلاد+${i}&bg=${Math.floor(Math.random()*16777215).toString(16)}`,
        duration: 20 + Math.random() * 30,
        difficulty: "easy",
        tags: ["احتفال", "عيد ميلاد", "ألوان", "بهجة"],
        isActive: true,
        previewCode: "background: #fecaca;",
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
        id: `festival-${i}`,
        template_id: `festival-${i}`,
        name: `قالب مهرجان ${i}`,
        nameAr: `قالب مهرجان ${i}`,
        description: `قالب مليء بالحيوية للمناسبات والمهرجانات`,
        descriptionAr: `قالب مليء بالحيوية للمناسبات والمهرجانات`,
        category: "festival",
        icon: "🎉",
        cssTemplate: `/* CSS for Festival Template ${i} */`,
        htmlTemplate: `<div><h1>Festival Template ${i}</h1></div>`,
        aspect_ratio: "16:9",
        preview_thumbnail: `/api/placeholder/400/300?text=مهرجان+${i}&bg=${Math.floor(Math.random()*16777215).toString(16)}`,
        duration: 25 + Math.random() * 35,
        difficulty: "medium",
        tags: ["مهرجان", "احتفال", "مناسبة", "حيوية"],
        isActive: true,
        previewCode: "background: #fdba74;",
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
        id: `intro-${i}`,
        template_id: `intro-${i}`,
        name: `مقدمة احترافية ${i}`,
        nameAr: `مقدمة احترافية ${i}`,
        description: `قالب مقدمة مذهل لبداية مميزة لفيديوهاتك`,
        descriptionAr: `قالب مقدمة مذهل لبداية مميزة لفيديوهاتك`,
        category: "intro",
        icon: "🎬",
        cssTemplate: `/* CSS for Intro Template ${i} */`,
        htmlTemplate: `<div><h1>Intro Template ${i}</h1></div>`,
        aspect_ratio: "16:9",
        preview_thumbnail: `/api/placeholder/400/300?text=مقدمة+${i}&bg=${Math.floor(Math.random()*16777215).toString(16)}`,
        duration: 5 + Math.random() * 10,
        difficulty: "medium",
        tags: ["مقدمة", "احترافي", "مذهل", "بداية"],
        isActive: true,
        previewCode: "background: #93c5fd;",
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
        id: `vlog-${i}`,
        template_id: `vlog-${i}`,
        name: `فلوج يومي ${i}`,
        nameAr: `فلوج يومي ${i}`,
        description: `قالب مثالي لتوثيق يومك وحياتك الشخصية`,
        descriptionAr: `قالب مثالي لتوثيق يومك وحياتك الشخصية`,
        category: "vlog",
        icon: "📹",
        cssTemplate: `/* CSS for Vlog Template ${i} */`,
        htmlTemplate: `<div><h1>Vlog Template ${i}</h1></div>`,
        aspect_ratio: "9:16",
        preview_thumbnail: `/api/placeholder/400/300?text=فلوج+${i}&bg=${Math.floor(Math.random()*16777215).toString(16)}`,
        duration: 60 + Math.random() * 120,
        difficulty: "easy",
        tags: ["فلوج", "يومي", "شخصي", "حياة"],
        isActive: true,
        previewCode: "background: #bfdbfe;",
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
        id: `business-${i}`,
        template_id: `business-${i}`,
        name: `عرض تجاري ${i}`,
        nameAr: `عرض تجاري ${i}`,
        description: `قالب احترافي للعروض التجارية والشركات`,
        descriptionAr: `قالب احترافي للعروض التجارية والشركات`,
        category: "business",
        icon: "💼",
        cssTemplate: `/* CSS for Business Template ${i} */`,
        htmlTemplate: `<div><h1>Business Template ${i}</h1></div>`,
        aspect_ratio: "16:9",
        preview_thumbnail: `/api/placeholder/400/300?text=أعمال+${i}&bg=${Math.floor(Math.random()*16777215).toString(16)}`,
        duration: 45 + Math.random() * 75,
        difficulty: "advanced",
        tags: ["أعمال", "احترافي", "شركات", "عرض"],
        isActive: true,
        previewCode: "background: #60a5fa;",
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
        id: `social-${i}`,
        template_id: `social-${i}`,
        name: `سوشيال ميديا ${i}`,
        nameAr: `سوشيال ميديا ${i}`,
        description: `قالب مُحسّن لمنصات التواصل الاجتماعي`,
        descriptionAr: `قالب مُحسّن لمنصات التواصل الاجتماعي`,
        category: "social-media",
        icon: "📱",
        cssTemplate: `/* CSS for Social Media Template ${i} */`,
        htmlTemplate: `<div><h1>Social Media Template ${i}</h1></div>`,
        aspect_ratio: "1:1",
        preview_thumbnail: `/api/placeholder/400/300?text=سوشيال+ميديا+${i}&bg=${Math.floor(Math.random()*16777215).toString(16)}`,
        duration: 15 + Math.random() * 30,
        difficulty: "easy",
        tags: ["سوشيال", "إنستقرام", "تيك توك", "فيسبوك"],
        isActive: true,
        previewCode: "background: #a78bfa;",
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
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ) || template.description.toLowerCase().includes(searchQuery.toLowerCase()) || template.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) || template.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTemplateSelect = (template: VideoTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
    // يمكن إضافة منطق لفتح محرر القالب هنا
    // مثل: navigate to template editor with template data
    console.log("Template selected for editing:", template.name);
  };

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
            onClick={() => setSelectedCategory(category.id)}
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
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3Ln3ub3JnLzIwMDAvc3ZnPgo8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzExMTEyNyIvPgo8cGF0aCBkPSJNMTc1IDEwMEgyMjVWMjAwSDE3NVYxMDBaIiBmaWxsPSIjOEJFQ0Y2Ii8+Cjxzdmc+";
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

      {/* Preview Modal (if needed) */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full relative">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-3 right-3 text-white text-2xl hover:text-gray-300"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold text-white mb-4">
              معاينة القالب: {selectedTemplate.name}
            </h3>
            <div className="border border-gray-700 rounded-lg overflow-hidden mb-4">
              {/* Render the template using dangerouslySetInnerHTML */}
              <style>{selectedTemplate.cssTemplate}</style>
              <div
                dangerouslySetInnerHTML={{ __html: selectedTemplate.htmlTemplate }}
                style={{ width: "100%", height: "400px", overflow: "hidden" }} // Set a fixed size for preview
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                إغلاق
              </button>
              <button
                onClick={() => {
                  // هنا يمكن توجيه المستخدم إلى محرر القوالب مع `selectedTemplate`
                  alert(`جارٍ استخدام قالب: ${selectedTemplate.name}`);
                  setShowPreview(false);
                }}
                className="glow-button px-4 py-2 rounded-lg font-semibold"
              >
                استخدم هذا القالب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPanel;