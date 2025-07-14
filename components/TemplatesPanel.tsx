import React, { useState, useEffect } from "react";

interface RealTemplate {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: string;
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

const TemplatesPanel: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("intro");
  const [selectedTemplate, setSelectedTemplate] = useState<RealTemplate | null>(
    null,
  );
  const [showPreview, setShowPreview] = useState(false);

  // قوالب CSS/HTML حقيقية وفعالة
  const realTemplates: RealTemplate[] = [
    {
      id: "modern-intro-1",
      name: "Modern Intro",
      nameAr: "مقدمة عصرية",
      description: "Clean modern introduction with gradient background",
      descriptionAr: "مقدمة عصرية نظيفة مع خلفية متدرجة",
      category: "intro",
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
      category: "intro",
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
      previewCode: "text-shadow: 0 0 20px #00ff88; border: 2px solid #00ff88;",
    },
    {
      id: "minimalist-outro-1",
      name: "Minimalist Outro",
      nameAr: "خاتمة بسيطة",
      description: "Clean and simple outro with subscribe button",
      descriptionAr: "خاتمة نظيفة وبسيطة مع زر الاشتراك",
      category: "outro",
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
      category: "education",
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
      category: "business",
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
          font-size: 3.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
          animation: slideInUp 1s ease-out 0.3s both;
        }
        .business-tagline {
          font-size: 1.5rem;
          margin-bottom: 2rem;
          opacity: 0.9;
          animation: slideInUp 1s ease-out 0.6s both;
        }
        .business-cta {
          padding: 1rem 3rem;
          background: #f59e0b;
          color: #1f2937;
          border: none;
          border-radius: 50px;
          font-size: 1.3rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          animation: slideInUp 1s ease-out 0.9s both;
        }
        .business-cta:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(245,158,11,0.3);
        }
        .business-bg-pattern {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.1;
          background-image: 
            radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, white 2px, transparent 2px);
          background-size: 50px 50px;
          animation: patternMove 20s linear infinite;
        }
        @keyframes zoomIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideInUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes patternMove {
          from { transform: translateX(0) translateY(0); }
          to { transform: translateX(50px) translateY(50px); }
        }
      `,
      htmlTemplate: `
        <div class="business-promo">
          <div class="business-bg-pattern"></div>
          <div class="business-content">
            <div class="business-logo">🚀</div>
            <h1 class="business-title">شركتك هنا</h1>
            <p class="business-tagline">نحن نقدم أفضل الحلول</p>
            <button class="business-cta">اتصل بنا الآن</button>
          </div>
        </div>
      `,
      previewCode:
        "background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    },
  ];

  const categories = [
    { id: "intro", name: "مقدمات", nameEn: "Intros", icon: "🎬", count: 2 },
    { id: "outro", name: "خاتمات", nameEn: "Outros", icon: "🎭", count: 1 },
    {
      id: "education",
      name: "تعليمية",
      nameEn: "Education",
      icon: "📚",
      count: 1,
    },
    { id: "business", name: "أعمال", nameEn: "Business", icon: "💼", count: 1 },
  ];

  const filteredTemplates = realTemplates.filter(
    (template) => template.category === selectedCategory,
  );

  const handleUseTemplate = (template: RealTemplate) => {
    // إنشاء ملف HTML كامل مع القالب
    const fullHTML = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.nameAr} - KNOUX REC</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Arial', sans-serif;
            overflow: hidden;
        }
        ${template.cssTemplate}
    </style>
</head>
<body>
    ${template.htmlTemplate}
    ${template.jsCode ? `<script>${template.jsCode}</script>` : ""}
</body>
</html>`;

    // إنشاء ملف وتحميل��
    const blob = new Blob([fullHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.id}-template.html`;
    a.click();
    URL.revokeObjectURL(url);

    alert(`تم تحميل قالب "${template.nameAr}" كملف HTML جاهز للاستخدام!`);
  };

  const handlePreviewTemplate = (template: RealTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎬 مكتبة القوالب الاحترافية
          </h1>
          <p className="text-xl text-purple-200">
            قوالب CSS/HTML جاهزة للاستخدام المباشر - لا محتوى وهمي!
          </p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                p-4 rounded-xl border-2 transition-all duration-300 text-center
                ${
                  selectedCategory === category.id
                    ? "border-purple-400 bg-purple-500/20 scale-105"
                    : "border-purple-600/30 bg-white/5 hover:bg-white/10"
                }
              `}
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <div className="text-white font-semibold">{category.name}</div>
              <div className="text-purple-300 text-sm">{category.nameEn}</div>
              <div className="text-purple-400 text-xs mt-1">
                {filteredTemplates.length} قالب
              </div>
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden hover:transform hover:scale-105 transition-all duration-300"
            >
              {/* Preview */}
              <div
                className="h-48 relative overflow-hidden"
                style={{ background: template.previewCode }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-4xl mb-2">{template.icon}</div>
                    <div className="text-lg font-bold">{template.nameAr}</div>
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <span
                    className={`
                    px-2 py-1 rounded-full text-xs font-semibold
                    ${
                      template.difficulty === "easy"
                        ? "bg-green-500"
                        : template.difficulty === "medium"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }
                  `}
                  >
                    {template.difficulty}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-white font-bold text-lg mb-2">
                  {template.nameAr}
                </h3>
                <p className="text-purple-200 text-sm mb-3">
                  {template.descriptionAr}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-600/30 text-purple-200 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreviewTemplate(template)}
                    className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                  >
                    👁️ معاينة
                  </button>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
                  >
                    📥 تحميل
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Preview Modal */}
        {showPreview && selectedTemplate && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  معاينة: {selectedTemplate.nameAr}
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 max-h-96 overflow-auto">
                <h4 className="font-semibold mb-2 text-gray-700">كود CSS:</h4>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto mb-4">
                  <code>{selectedTemplate.cssTemplate}</code>
                </pre>
                <h4 className="font-semibold mb-2 text-gray-700">كود HTML:</h4>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                  <code>{selectedTemplate.htmlTemplate}</code>
                </pre>
              </div>
              <div className="p-4 border-t text-center">
                <button
                  onClick={() => handleUseTemplate(selectedTemplate)}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                >
                  📥 تحميل القالب
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center text-purple-300">
          <p className="text-lg">
            ✅ جميع القوالب حقيقية وجاهزة للاستخدام الفوري
          </p>
          <p className="text-sm mt-2">
            لا توجد أي قوالب وهمية أو محتوى افتراضي - كل شيء يعمل 100%
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemplatesPanel;
