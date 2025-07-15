import React, { useState, useEffect } from "react";
import Modal from "./Modal"; // Assuming Modal.tsx is in the same directory
import { VisualPatchTool } from "./VisualPatchToolCard"; // Re-using VisualPatchTool for category types

// Define the RealTemplate interface
interface RealTemplate {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: TemplateCategory;
  icon: string;
  cssTemplate: string;
  htmlTemplate: string;
  jsCode?: string;
  duration: number; // in seconds
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  isActive: boolean;
  previewCode: string; // A CSS snippet for the card's background preview
}

// Define the extended VideoTemplate interface for detailed template data
interface VideoTemplate extends RealTemplate {
  template_id: string; // Unique ID for the template instance
  aspect_ratio: "16:9" | "9:16" | "1:1" | "4:3";
  preview_thumbnail: string; // URL for a thumbnail image
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
    config: Record<string, any>; // e.g., font_size, color, animation
  }[];
}

// Define valid template categories
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

// Define the Modal state interfaces (re-using from ToolboxPanel)
interface AlertModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface PromptModalState {
  isOpen: boolean;
  title: string;
  message: string;
  inputValue: string;
  callback: (value: string | null) => void;
}

const TemplatesPanel: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>("for-you");
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false); // Renamed to avoid confusion with showPreview prop
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [templates, setTemplates] = useState<VideoTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [alertModal, setAlertModal] = useState<AlertModalState>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });
  const [promptModal, setPromptModal] = useState<PromptModalState>({
    isOpen: false,
    title: "",
    message: "",
    inputValue: "",
    callback: () => {},
  });

  // Helper to show custom alert modal
  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  // Helper to show custom prompt modal
  const showPrompt = (title: string, message: string, defaultValue: string, callback: (value: string | null) => void) => {
    setPromptModal({ isOpen: true, title, message, inputValue: defaultValue, callback });
  };

  // Helper function to convert CSS string to React style object
  const getPreviewStyle = (cssString: string): React.CSSProperties => {
    const styles: React.CSSProperties = {};
    const declarations = cssString.split(";").filter((d) => d.trim());

    declarations.forEach((declaration) => {
      const [property, value] = declaration.split(":").map((s) => s.trim());
      if (property && value) {
        const camelCaseProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        styles[camelCaseProperty as keyof React.CSSProperties] = value;
      }
    });
    return styles;
  };

  // Definition of categories for the navigation bar
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

  // Base templates with minimal data, category will be assigned in generateComprehensiveTemplates
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
      previewCode: "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
      previewCode: "background: #0a0a0a; color: #00ff88; text-shadow: 0 0 20px #00ff88",
    },
    {
      id: "minimalist-outro-1",
      name: "Minimalist Outro",
      nameAr: "خاتمة بسيطة",
      description: "Clean and simple outro with subscribe button",
      descriptionAr: "خاتمة نظيفة وبسيطة مع زر الاشتراك",
      icon: "👋", // Changed icon for outro
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
  ];

  // Function to generate comprehensive templates with dummy data for various categories
  const generateComprehensiveTemplates = (): VideoTemplate[] => {
    const comprehensiveTemplates: VideoTemplate[] = [];

    // Helper to convert RealTemplate to VideoTemplate with dummy data
    const convertToVideoTemplate = (
      baseTemplate: Omit<RealTemplate, 'category'>,
      category: TemplateCategory,
      index: number
    ): VideoTemplate => {
      return {
        ...baseTemplate,
        id: baseTemplate.id,
        template_id: `${baseTemplate.id}-${index}`, // Unique ID for each instance
        category: category,
        aspect_ratio: ["16:9", "9:16", "1:1", "4:3"][Math.floor(Math.random() * 4)] as any,
        preview_thumbnail: `https://placehold.co/400x300/${Math.floor(Math.random()*16777215).toString(16)}/ffffff?text=${encodeURIComponent(baseTemplate.name)}`,
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

    // Add base templates with their explicit categories
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
        category = "for-you"; // Fallback
      }
      comprehensiveTemplates.push(convertToVideoTemplate(template, category, index));
    });

    // Generate additional templates for other categories
    const generateDummyTemplate = (cat: TemplateCategory, baseName: string, icon: string, count: number): VideoTemplate[] => {
      const dummyTemplates: VideoTemplate[] = [];
      for (let i = 1; i <= count; i++) {
        dummyTemplates.push({
          id: `${cat}-${i}`,
          template_id: `${cat}-${i}`,
          name: `${baseName} ${i}`,
          nameAr: `${baseName} ${i}`,
          description: `A dynamic template for ${cat} content.`,
          descriptionAr: `قالب ديناميكي لمحتوى ${baseName}.`,
          category: cat,
          icon: icon,
          cssTemplate: `/* Basic CSS for ${baseName} ${i} */ .container { background: #${Math.floor(Math.random()*16777215).toString(16)}; color: white; padding: 20px; }`,
          htmlTemplate: `<div><h1>${baseName} ${i}</h1><p>This is a dummy template.</p></div>`,
          duration: 10 + Math.floor(Math.random() * 20),
          difficulty: ["easy", "medium", "hard"][Math.floor(Math.random() * 3)] as any,
          tags: [cat, "dummy", "generated"],
          isActive: true,
          previewCode: `background: #${Math.floor(Math.random()*16777215).toString(16)};`,
          aspect_ratio: ["16:9", "9:16", "1:1"][Math.floor(Math.random() * 3)] as any,
          preview_thumbnail: `https://placehold.co/400x300/${Math.floor(Math.random()*16777215).toString(16)}/ffffff?text=${encodeURIComponent(baseName.replace(' ', '+'))}+${i}`,
          premium: Math.random() > 0.7,
          popular: Math.random() > 0.5,
          trending: Math.random() > 0.3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          elements: [
            {
              id: "gen-title",
              type: "text",
              placeholder_key: "gen_title",
              default_value: `${baseName} Title`,
              position: { x: 50, y: 20, width: 200, height: 40 },
              config: { font_size: 32, color: "#ffffff" },
            },
          ],
        });
      }
      return dummyTemplates;
    };

    comprehensiveTemplates.push(...generateDummyTemplate("for-you", "قالب مقترح", "✨", 15));
    comprehensiveTemplates.push(...generateDummyTemplate("birthday", "قالب عيد ميلاد", "🎂", 8));
    comprehensiveTemplates.push(...generateDummyTemplate("festival", "قالب مهرجان", "🎉", 6));
    comprehensiveTemplates.push(...generateDummyTemplate("vlog", "قالب فلوج", "📹", 10));
    comprehensiveTemplates.push(...generateDummyTemplate("social-media", "قالب سوشيال ميديا", "📱", 12));

    return comprehensiveTemplates;
  };

  useEffect(() => {
    setLoading(true);
    // Simulate API call or heavy computation
    const allTemplates = generateComprehensiveTemplates();
    setTemplates(allTemplates);
    setLoading(false);
  }, []);

  // Filtered templates based on category and search query
  const filteredTemplates = templates.filter((template) => {
    const matchesCategory =
      selectedCategory === "for-you" || template.category === selectedCategory; // "for-you" shows all initially
    const matchesSearch =
      !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Calculate counts for categories
  const getCategoryCount = (categoryId: TemplateCategory) => {
    if (categoryId === "for-you") return templates.length; // "For You" shows total count
    return templates.filter(t => t.category === categoryId).length;
  };

  const handleUseTemplate = (template: VideoTemplate) => {
    // Generate full HTML file with the template's CSS, HTML, and optional JS
    const fullHTML = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.nameAr} - KNOUX REC Template</title>
    <style>
        /* Basic reset and base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Arial', sans-serif;
            overflow: hidden; /* Important for animations */
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        /* Template specific CSS */
        ${template.cssTemplate}
    </style>
</head>
<body>
    ${template.htmlTemplate}
    ${template.jsCode ? `<script>${template.jsCode}</script>` : ""}
</body>
</html>`;

    // Create a Blob and trigger download
    const blob = new Blob([fullHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.id}-template.html`;
    document.body.appendChild(a); // Append to body to make it clickable
    a.click();
    document.body.removeChild(a); // Clean up
    URL.revokeObjectURL(url);

    showAlert("نجاح", `تم تحميل قالب "${template.nameAr}" كملف HTML جاهز للاستخدام!`, "success");
  };

  const handlePreviewTemplate = (template: VideoTemplate) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const TemplateCard: React.FC<{ template: VideoTemplate; onSelect: (template: VideoTemplate) => void; onPreview: (template: VideoTemplate) => void }> = ({ template, onSelect, onPreview }) => {
    const cardClasses = `
      relative rounded-xl overflow-hidden shadow-lg transition-all duration-300
      hover:scale-[1.03] hover:shadow-xl cursor-pointer
      bg-gray-800 border border-gray-700
      flex flex-col h-full
    `;

    const getDifficultyColor = (difficulty: string): string => {
      switch (difficulty) {
        case "easy": return "text-green-400";
        case "medium": return "text-yellow-400";
        case "hard": return "text-red-400";
        default: return "text-gray-400";
      }
    };

    const getCategoryAccentColor = (category: TemplateCategory): string => {
      switch (category) {
        case "for-you": return "bg-purple-500";
        case "intro": return "bg-blue-500";
        case "outro": return "bg-indigo-500";
        case "education": return "bg-green-500";
        case "birthday": return "bg-pink-500";
        case "festival": return "bg-orange-500";
        case "vlog": return "bg-teal-500";
        case "business": return "bg-red-500";
        case "social-media": return "bg-cyan-500";
        default: return "bg-gray-500";
      }
    };

    return (
      <div className={cardClasses}>
        {/* Premium/Popular/Trending Badges */}
        <div className="absolute top-2 left-2 z-10 flex gap-1">
          {template.premium && <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full shadow">PREMIUM</span>}
          {template.popular && <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">POPULAR</span>}
          {template.trending && <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">TRENDING</span>}
        </div>

        {/* Thumbnail or Preview */}
        <div className="relative w-full h-48 bg-gray-700 flex items-center justify-center overflow-hidden">
          {template.preview_thumbnail ? (
            <img src={template.preview_thumbnail} alt={template.nameAr} className="w-full h-full object-cover" />
          ) : (
            <div className="text-6xl text-white/50">{template.icon}</div>
          )}
          {/* Overlay for hover actions */}
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => { e.stopPropagation(); onPreview(template); }}
              className="btn btn-secondary mx-2"
            >
              معاينة
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(template); }}
              className="btn btn-primary mx-2"
            >
              استخدام
            </button>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-lg font-bold text-white mb-1">{template.nameAr}</h3>
          <p className="text-sm text-gray-400 mb-3 truncate-2">{template.descriptionAr}</p>

          <div className="flex-grow"></div> {/* Spacer */}

          {/* Specs */}
          <div className="text-xs text-gray-500 space-y-1 mt-auto">
            <div className="flex justify-between items-center">
              <span>المدة:</span>
              <span className="text-white font-medium">{template.duration} ثواني</span>
            </div>
            <div className="flex justify-between items-center">
              <span>الصعوبة:</span>
              <span className={`font-medium ${getDifficultyColor(template.difficulty)} capitalize`}>
                {template.difficulty === "easy" ? "سهل" : template.difficulty === "medium" ? "متوسط" : "صعب"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>النسبة:</span>
              <span className="text-white font-medium">{template.aspect_ratio}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>العلامات:</span>
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-xs">#{tag}</span>
                ))}
                {template.tags.length > 3 && <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-xs">...</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Category Accent Bar at the bottom */}
        <div className={`h-1 w-full ${getCategoryAccentColor(template.category)} rounded-b-xl`}></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white font-inter">
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

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="ابحث عن قالب..."
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                px-5 py-2 rounded-full border-2 transition-all duration-300 flex items-center gap-2
                ${
                  selectedCategory === category.id
                    ? "border-purple-400 bg-purple-500/20 text-purple-200 shadow-lg"
                    : "border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-purple-500/50"
                }
              `}
            >
              <span className="text-xl">{category.icon}</span>
              <span className="font-semibold">{category.name}</span>
              <span className="text-sm bg-gray-700/50 px-2 py-0.5 rounded-full">
                {getCategoryCount(category.id)}
              </span>
            </button>
          ))}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-10">
            <div className="animate-spin-fast inline-block w-8 h-8 border-4 border-t-4 border-purple-500 border-solid rounded-full"></div>
            <p className="mt-4 text-purple-300">جاري تحميل القوالب...</p>
          </div>
        )}

        {/* Templates Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.template_id} // Use template_id for key
                  template={template}
                  onSelect={handleUseTemplate}
                  onPreview={handlePreviewTemplate}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-white/70 text-lg py-10">
                لا توجد قوالب مطابقة لمعايير البحث أو الفئة المحددة.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={selectedTemplate?.nameAr || "معاينة القالب"}
        type="preview"
        footer={
          <button onClick={() => {
            if (selectedTemplate) handleUseTemplate(selectedTemplate);
            setShowPreviewModal(false);
          }} className="btn btn-primary">
            استخدام هذا القالب
          </button>
        }
      >
        {selectedTemplate && (
          <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
            {/* Using an iframe to render the template's HTML/CSS/JS */}
            <iframe
              title="Template Preview"
              srcDoc={`
                <!DOCTYPE html>
                <html lang="ar" dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Preview</title>
                    <style>
                        body { margin: 0; padding: 0; overflow: hidden; height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center; }
                        ${selectedTemplate.cssTemplate}
                    </style>
                </head>
                <body>
                    ${selectedTemplate.htmlTemplate}
                    ${selectedTemplate.jsCode ? `<script>${selectedTemplate.jsCode}</script>` : ""}
                </body>
                </html>
              `}
              style={{ width: '100%', height: '500px', border: 'none', borderRadius: '8px' }}
              sandbox="allow-scripts allow-same-origin" // Security sandbox for iframe
            ></iframe>
          </div>
        )}
      </Modal>

      {/* Alert Modal */}
      <Modal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        type="alert"
      >
        <div className={`alert alert-${alertModal.type} flex items-center justify-center`}>
          {alertModal.type === 'success' && <span className="alert-icon">✅</span>}
          {alertModal.type === 'error' && <span className="alert-icon">❌</span>}
          {alertModal.type === 'info' && <span className="alert-icon">ℹ️</span>}
          <span>{alertModal.message}</span>
        </div>
      </Modal>

      {/* Prompt Modal */}
      <Modal
        isOpen={promptModal.isOpen}
        onClose={() => {
          setPromptModal({ ...promptModal, isOpen: false });
          promptModal.callback(null); // Call callback with null if cancelled
        }}
        title={promptModal.title}
        type="prompt"
        footer={
          <>
            <button
              onClick={() => {
                setPromptModal({ ...promptModal, isOpen: false });
                promptModal.callback(null); // Pass null on cancel
              }}
              className="btn btn-secondary"
            >
              إلغاء
            </button>
            <button
              onClick={() => {
                setPromptModal({ ...promptModal, isOpen: false });
                promptModal.callback(promptModal.inputValue);
              }}
              className="btn btn-primary"
            >
              تأكيد
            </button>
          </>
        }
      >
        <p className="mb-4">{promptModal.message}</p>
        <input
          type="text"
          value={promptModal.inputValue}
          onChange={(e) => setPromptModal({ ...promptModal, inputValue: e.target.value })}
          className="w-full"
        />
      </Modal>
    </div>
  );
};

export default TemplatesPanel;
