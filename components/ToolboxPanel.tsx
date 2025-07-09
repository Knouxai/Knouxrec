import React, { useState, useEffect } from "react";
import { AITool, ToolCategory, UserCredits } from "../types/templates";
import {
  toolboxService,
  ToolExecutionResult,
} from "../services/toolboxService";

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

  // Note: Task monitoring removed since toolboxService handles operations directly

  // معالجة الأدوات
  const handleToolUse = async (
    tool: AITool,
    file?: File,
    additionalInput?: string,
  ) => {
    try {
      if (!file && tool.input_types.includes("file")) {
        // فتح منتقي الملفات
        const input = document.createElement("input");
        input.type = "file";
        input.accept = getAcceptedFileTypes(tool.input_types);
        input.onchange = (e) => {
          const selectedFile = (e.target as HTMLInputElement).files?.[0];
          if (selectedFile) {
            executeToolOperation(tool, selectedFile, additionalInput);
          }
        };
        input.click();
        return;
      }

      await executeToolOperation(tool, file, additionalInput);
    } catch (error) {
      console.error("خطأ في تشغيل الأداة:", error);
      alert(`خطأ في تشغيل ${tool.name}: ${error}`);
    }
  };

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
          options: {
            quality: "high",
            format: "auto",
          },
        },
      );

      // معالجة النتيجة
      if (result.success) {
        console.log(`✅ نجح تنفيذ ${tool.name}:`, result);

        // تحديث النقاط
        setUserCredits((prev) => ({
          ...prev,
          remaining: prev.remaining - tool.credits_cost,
          used: prev.used + tool.credits_cost,
        }));

        // عرض رسالة نجاح
        alert(`تم إنجاز ${tool.name} بنجاح! ✨`);

        // تحميل النتيجة تلقائياً إذا كانت ملف
        if (result.output && typeof result.output !== "string") {
          downloadFile(result.output, `${tool.name}_result`);
        }
      } else {
        throw new Error(result.error || "فشل في تنفيذ العملية");
      }
    } catch (error) {
      console.error(`❌ خطأ في تنفيذ ${tool.name}:`, error);
      alert(`خطأ في ${tool.name}: ${error}`);
    }
  };

  // تحميل الملفات
  const downloadFile = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  // الحصول على أنواع الملفات المقبولة
  const getAcceptedFileTypes = (inputTypes: string[]): string => {
    const typeMapping: Record<string, string> = {
      video: "video/*",
      audio: "audio/*",
      image: "image/*",
      text: "text/*",
      file: "*/*",
    };

    return inputTypes.map((type) => typeMapping[type] || "*/*").join(",");
  };

  const categories = [
    { id: "all", name: "جميع الأدوات", icon: "🛠️", color: "knoux-purple" },
    { id: "video", name: "الفيديو", icon: "🎥", color: "blue-400" },
    { id: "audio", name: "الصوت", icon: "🎵", color: "green-400" },
    { id: "image", name: "الصور", icon: "🖼️", color: "yellow-400" },
    { id: "text", name: "النصوص", icon: "📝", color: "purple-400" },
    {
      id: "ai-tools",
      name: "أدوات الذكاء الاصطناعي",
      icon: "🤖",
      color: "knoux-neon",
    },
  ] as const;

  // جميع أدوات Toolbox - مطابقة للمتطلبات الكاملة
  useEffect(() => {
    const comprehensiveTools: AITool[] = [
      // ========== أدوات الفيديو (Video Tools) ==========
      {
        id: "ai-effects",
        name: "التأثيرات الذكية",
        description: "تأثيرات ذكية على الفيديو مع تتبع الحركة وفلاتر متقدمة",
        category: "video",
        icon: "🎨",
        ai_powered: true,
        credits_cost: 25,
        processing_time: "medium",
        input_types: ["video"],
        output_types: ["video"],
        features: ["تتبع الحركة", "فلاتر ذكية", "خلفيات ديناميكية"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "ai-animation",
        name: "الرسوم المتحركة الذكية",
        description:
          "توليد رسوم متحركة من صور أو نصوص بتقنيات الذكاء الاصطناعي",
        category: "video",
        icon: "🎞️",
        ai_powered: true,
        credits_cost: 40,
        processing_time: "slow",
        input_types: ["image", "text"],
        output_types: ["video"],
        features: ["توليد حركة", "أنماط متعددة", "تحكم بالمدة"],
        premium: true,
        popular: true,
        beta: false,
      },
      {
        id: "ai-transition",
        name: "الانتقالات الذكية",
        description: "انتقالات سلسة ومبتكرة بين مقاطع الفيديو تلقائياً",
        category: "video",
        icon: "🔀",
        ai_powered: true,
        credits_cost: 15,
        processing_time: "fast",
        input_types: ["video"],
        output_types: ["video"],
        features: ["انتقالات تلقائية", "تحليل المشاهد", "مدة قابلة للتعديل"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "image-to-video",
        name: "الصورة إلى فيديو",
        description: "تحويل مجموعة صور إلى فيديو مع حركة كاميرا احترافية",
        category: "video",
        icon: "🖼️➡️🎬",
        ai_powered: true,
        credits_cost: 30,
        processing_time: "medium",
        input_types: ["image"],
        output_types: ["video"],
        features: ["حركة كاميرا", "مؤثرات بصرية", "موسيقى تلقائية"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "text-to-video",
        name: "النص إلى فيديو",
        description: "إنشاء فيديو كامل من أوصاف نصية فقط",
        category: "video",
        icon: "📝➡️🎞️",
        ai_powered: true,
        credits_cost: 60,
        processing_time: "slow",
        input_types: ["text"],
        output_types: ["video"],
        features: ["توليد مشاهد", "تحكم بالأسلوب", "سرد صوتي"],
        premium: true,
        popular: true,
        beta: true,
      },
      {
        id: "screen-recorder",
        name: "مسجل الشاشة",
        description: "تسجيل شاشة النظام مع صوت عالي الجودة",
        category: "video",
        icon: "🎥",
        ai_powered: false,
        credits_cost: 5,
        processing_time: "fast",
        input_types: ["screen"],
        output_types: ["video"],
        features: ["تسجيل كامل", "تسجيل جزئي", "صوت النظام"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "video-downloader",
        name: "محمل الفيديو",
        description: "تحميل فيديوهات من منصات متعددة بجودة عالية",
        category: "video",
        icon: "⬇️🎞️",
        ai_powered: false,
        credits_cost: 2,
        processing_time: "fast",
        input_types: ["url"],
        output_types: ["video"],
        features: ["منصات متعددة", "جودة متنوعة", "تحميل سريع"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "ai-video-generator",
        name: "مولد الفيديو الذكي",
        description: "توليد فيديوهات كاملة تلقائياً من نصوص أو صور",
        category: "video",
        icon: "🧠🎬",
        ai_powered: true,
        credits_cost: 80,
        processing_time: "slow",
        input_types: ["text", "image"],
        output_types: ["video"],
        features: ["توليد كامل", "سرد متقدم", "مؤثرات شاملة"],
        premium: true,
        popular: true,
        beta: true,
      },
      {
        id: "video-stabilization",
        name: "مثبت الفيديو",
        description: "تثبيت الفيديو لتقليل الاهتزاز والحركة غير المرغوبة",
        category: "video",
        icon: "🛡️",
        ai_powered: true,
        credits_cost: 20,
        processing_time: "medium",
        input_types: ["video"],
        output_types: ["video"],
        features: ["تحليل الحركة", "تثبيت متقدم", "حفظ الجودة"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "auto-bg-removal",
        name: "إزالة الخلفية التلقائية",
        description: "إزالة خلفية الفيديو تلقائياً بدقة عالية",
        category: "video",
        icon: "🎭",
        ai_powered: true,
        credits_cost: 35,
        processing_time: "medium",
        input_types: ["video"],
        output_types: ["video"],
        features: ["فصل دقيق", "حواف ناعمة", "معالجة متقدمة"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "blur-background",
        name: "تمويه الخلفية",
        description: "تمويه خلفية الفيديو مع إبراز الموضوع الرئيسي",
        category: "video",
        icon: "🖼️〰️",
        ai_powered: true,
        credits_cost: 15,
        processing_time: "fast",
        input_types: ["video"],
        output_types: ["video"],
        features: ["تحديد ذكي", "تمويه متدرج", "تحكم بالشدة"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "video-translator",
        name: "مترجم الفيديو",
        description: "ترجمة الفيديو صوتياً ونصياً لعدة لغات",
        category: "video",
        icon: "🌍💬",
        ai_powered: true,
        credits_cost: 45,
        processing_time: "slow",
        input_types: ["video"],
        output_types: ["video"],
        features: ["ترجمة صوتية", "ترجمة نصية", "لغات متعددة"],
        premium: true,
        popular: true,
        beta: false,
      },
      {
        id: "ai-shorts",
        name: "المقاطع القصيرة الذكية",
        description: "إنشاء مقاطع قصيرة مثيرة للاهتمام من فيديوهات طويلة",
        category: "video",
        icon: "📱🎬",
        ai_powered: true,
        credits_cost: 30,
        processing_time: "medium",
        input_types: ["video"],
        output_types: ["video"],
        features: ["اختيار ذكي", "تنسيق تلقائي", "تحسين للمنصات"],
        premium: true,
        popular: true,
        beta: false,
      },
      {
        id: "face-swap",
        name: "تبديل الوجوه",
        description: "تبديل الوجوه في الصور والفيديو بواقعية عالية",
        category: "video",
        icon: "🧑↔️🧑",
        ai_powered: true,
        credits_cost: 50,
        processing_time: "slow",
        input_types: ["video", "image"],
        output_types: ["video"],
        features: ["واقعية عالية", "مزامنة التعابير", "إضاءة طبيعية"],
        premium: true,
        popular: false,
        beta: true,
      },
      {
        id: "ai-text-editing",
        name: "التحرير النصي الذكي",
        description: "تحرير الفيديو عبر التفاعل مع النص المنسوخ",
        category: "video",
        icon: "📝▶️",
        ai_powered: true,
        credits_cost: 25,
        processing_time: "medium",
        input_types: ["video"],
        output_types: ["video"],
        features: ["تحرير نصي", "قص ذكي", "تزامن دقيق"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "video-trimmer",
        name: "قص الفيديو",
        description: "قص وتقطيع الفيديوهات بدقة عالية",
        category: "video",
        icon: "✂️",
        ai_powered: false,
        credits_cost: 3,
        processing_time: "fast",
        input_types: ["video"],
        output_types: ["video"],
        features: ["قص دقيق", "معاينة فورية", "تنسيقات متعددة"],
        premium: false,
        popular: true,
        beta: false,
      },

      // ========== أدوات الصوت (Audio Tools) ==========
      {
        id: "vocal-remover",
        name: "مزيل الأصوات",
        description: "فصل الغناء عن الموسيقى وإنشاء نسخ كاريوكي",
        category: "audio",
        icon: "🎤🚫",
        ai_powered: true,
        credits_cost: 20,
        processing_time: "medium",
        input_types: ["audio", "video"],
        output_types: ["audio"],
        features: ["فصل دقيق", "نسخ كاريوكي", "جودة عالية"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "audio-downloader",
        name: "محمل الصوت",
        description: "تحميل ملفات صوتية من منصات متعددة",
        category: "audio",
        icon: "⬇️🎶",
        ai_powered: false,
        credits_cost: 2,
        processing_time: "fast",
        input_types: ["url"],
        output_types: ["audio"],
        features: ["منصات متعددة", "جودة عالية", "تنسيقات متنوعة"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "extract-audio",
        name: "استخراج الصوت",
        description: "استخراج الصوت من مقاطع الفيديو",
        category: "audio",
        icon: "🎞️➡️🎵",
        ai_powered: false,
        credits_cost: 2,
        processing_time: "fast",
        input_types: ["video"],
        output_types: ["audio"],
        features: ["استخراج سريع", "جودة أصلية", "تنسيقات متعددة"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "voice-change",
        name: "تغيير الصوت",
        description: "تغيير نغمة وطابع الصوت بتأثيرات متنوعة",
        category: "audio",
        icon: "🎙️❤️",
        ai_powered: true,
        credits_cost: 15,
        processing_time: "fast",
        input_types: ["audio"],
        output_types: ["audio"],
        features: ["تأثيرات متعددة", "تحكم بالنغمة", "جودة طبيعية"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "noise-reduction",
        name: "تقليل الضوضاء",
        description: "إزالة ضوضاء الخلفية من التسجيلات الصوتية",
        category: "audio",
        icon: "🔇✋",
        ai_powered: true,
        credits_cost: 10,
        processing_time: "fast",
        input_types: ["audio"],
        output_types: ["audio"],
        features: ["إزالة ذكية", "حفظ الكلام", "تحسين الوضوح"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "beat-detection",
        name: "كشف الإيقاع",
        description: "تحليل الإيقاع الموسيقي لمزامنة الفيديو مع الموسيقى",
        category: "audio",
        icon: "🎶⏱️",
        ai_powered: true,
        credits_cost: 8,
        processing_time: "fast",
        input_types: ["audio"],
        output_types: ["data"],
        features: ["تحليل الإيقاع", "مزامنة تلقائية", "دقة عالية"],
        premium: false,
        popular: false,
        beta: false,
      },

      // ========== أدوات الصور (Image Tools) ==========
      {
        id: "photo-enhancer",
        name: "محسن الصور",
        description: "تحسين جودة الصور ووضوحها وألوانها تل��ائياً",
        category: "image",
        icon: "✨",
        ai_powered: true,
        credits_cost: 8,
        processing_time: "fast",
        input_types: ["image"],
        output_types: ["image"],
        features: ["تحسين تلقائي", "تصحيح الألوان", "إزالة التشويش"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "image-bg-removal",
        name: "إزالة خلفية الصور",
        description: "إزالة الخلفية من الصور بدقة احترافية",
        category: "image",
        icon: "🖼️🚫🌫️",
        ai_powered: true,
        credits_cost: 5,
        processing_time: "fast",
        input_types: ["image"],
        output_types: ["image"],
        features: ["فصل دقيق", "حواف ناعمة", "صور شفافة"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "custom-cutout",
        name: "القص المخصص",
        description: "قص مخصص لعناصر محددة من الصور بدقة عالية",
        category: "image",
        icon: "✂️🖼️",
        ai_powered: true,
        credits_cost: 10,
        processing_time: "medium",
        input_types: ["image"],
        output_types: ["image"],
        features: ["تحديد ذكي", "قص دقيق", "تحسين الحواف"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "text-to-image",
        name: "النص إلى صورة",
        description: "توليد صور مذهلة من أوصاف نصية",
        category: "image",
        icon: "📝➡️🖼️",
        ai_powered: true,
        credits_cost: 25,
        processing_time: "medium",
        input_types: ["text"],
        output_types: ["image"],
        features: ["توليد إبداعي", "أنماط متعددة", "دقة عالية"],
        premium: true,
        popular: true,
        beta: false,
      },
      {
        id: "reference-image",
        name: "الصورة المرجعية",
        description: "استخدام صورة مرجعية لتوليد أو تعديل صور جديدة",
        category: "image",
        icon: "🖼️🔗",
        ai_powered: true,
        credits_cost: 20,
        processing_time: "medium",
        input_types: ["image"],
        output_types: ["image"],
        features: ["مرجع أسلوب", "تحويل إبداعي", "حفظ ا��هوية"],
        premium: true,
        popular: false,
        beta: false,
      },
      {
        id: "image-upscaler",
        name: "مكبر الصور",
        description: "تكبير الصور وتحسين دقتها حتى 8K",
        category: "image",
        icon: "🖼️↔️",
        ai_powered: true,
        credits_cost: 12,
        processing_time: "medium",
        input_types: ["image"],
        output_types: ["image"],
        features: ["تكبير ذكي", "دقة 8K", "حفظ التفاصيل"],
        premium: false,
        popular: true,
        beta: false,
      },

      // ========== أدوات النصوص (Text Tools) ==========
      {
        id: "ai-copywriting",
        name: "الكتابة الإعلانية الذكية",
        description: "توليد نصوص تسويقية وإعلانية احترافية",
        category: "text",
        icon: "✍️✨",
        ai_powered: true,
        credits_cost: 15,
        processing_time: "fast",
        input_types: ["text"],
        output_types: ["text"],
        features: ["نصوص تسويقية", "أنماط متعددة", "تحسين SEO"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "text-to-speech",
        name: "النص إلى كلام",
        description: "تحويل النصوص إلى كلام طبيعي بأصوات متنوعة",
        category: "text",
        icon: "📢",
        ai_powered: true,
        credits_cost: 8,
        processing_time: "fast",
        input_types: ["text"],
        output_types: ["audio"],
        features: ["أصوات متعددة", "تحكم بالسرعة", "لغات متنوعة"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "speech-to-text",
        name: "الكلام إلى نص",
        description: "تحويل التسجيلات الصوتية إلى نصوص دقيقة",
        category: "text",
        icon: "🎤📝",
        ai_powered: true,
        credits_cost: 10,
        processing_time: "medium",
        input_types: ["audio", "video"],
        output_types: ["text"],
        features: ["دقة عالية", "لهجات متعددة", "ترميز زمني"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "split-subtitles",
        name: "تقسيم الترجمات",
        description: "تقسيم النصوص الطويلة لترجمات مناسبة للعرض",
        category: "text",
        icon: "📝✂️",
        ai_powered: true,
        credits_cost: 5,
        processing_time: "fast",
        input_types: ["text"],
        output_types: ["text"],
        features: ["تقسيم ذكي", "توقيت مناسب", "تنسيق احترافي"],
        premium: false,
        popular: true,
        beta: false,
      },
      {
        id: "subtitle-maker",
        name: "صانع الترجمات",
        description: "إنشاء ملفات ترجمة احترافية تلقائياً",
        category: "text",
        icon: "🎬💬",
        ai_powered: true,
        credits_cost: 12,
        processing_time: "medium",
        input_types: ["video", "audio"],
        output_types: ["text"],
        features: ["ترجمة تلقائية", "تنسيقات متعددة", "مزامنة دقيقة"],
        premium: false,
        popular: true,
        beta: false,
      },

      // ========== أدوات الذكاء الاصطناعي المتقدمة ==========
      {
        id: "ai-avatar",
        name: "الصورة الرمزية الذكية",
        description: "توليد صور رمزية متحركة قادرة على الكلام والغناء",
        category: "ai-tools",
        icon: "👤🎤",
        ai_powered: true,
        credits_cost: 40,
        processing_time: "slow",
        input_types: ["image", "audio"],
        output_types: ["video"],
        features: ["تحريك الوجه", "مزامنة الشفاه", "تعابير طبيعية"],
        premium: true,
        popular: true,
        beta: true,
      },
    ];

    setTools(comprehensiveTools);
  }, []);

  const filteredTools = tools.filter((tool) => {
    if (selectedCategory !== "all" && tool.category !== selectedCategory)
      return false;
    if (
      searchQuery &&
      !tool.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const handleToolSelect = (tool: AITool) => {
    if (tool.credits_cost > userCredits.remaining) {
      alert("نقاط غير كافية! يرجى ترقية الخطة.");
      return;
    }

    // استخدام الأداة مباشرة
    handleToolUse(tool);
  };

  const ToolCard = ({ tool }: { tool: AITool }) => (
    <div
      className="glass-card p-6 rounded-xl border border-knoux-purple/20 hover:border-knoux-purple/60 transition-all duration-300 cursor-pointer group interactive"
      onClick={() => handleToolSelect(tool)}
    >
      {/* Tool Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`text-3xl p-2 rounded-lg ${
              tool.ai_powered ? "bg-knoux-purple/20" : "bg-gray-500/20"
            }`}
          >
            {tool.icon}
          </div>
          <div>
            <h3 className="font-rajdhani font-bold text-white group-hover:text-knoux-purple transition-colors">
              {tool.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              {tool.ai_powered && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-knoux-purple to-knoux-neon rounded text-xs font-bold text-white">
                  AI
                </span>
              )}
              {tool.premium && (
                <span className="px-2 py-0.5 bg-yellow-500/80 rounded text-xs font-bold text-black">
                  PRO
                </span>
              )}
              {tool.beta && (
                <span className="px-2 py-0.5 bg-orange-500/80 rounded text-xs font-bold text-white">
                  BETA
                </span>
              )}
              {tool.popular && (
                <span className="px-2 py-0.5 bg-green-500/80 rounded text-xs font-bold text-white">
                  🔥 شائع
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Credits Cost */}
        <div className="text-right">
          <div className="text-lg font-bold text-knoux-neon">
            {tool.credits_cost}
          </div>
          <div className="text-xs text-white/60">نقاط</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-white/70 text-sm mb-4 leading-relaxed">
        {tool.description}
      </p>

      {/* Features */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {tool.features.slice(0, 3).map((feature, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-knoux-purple/10 border border-knoux-purple/20 rounded text-xs text-knoux-purple"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Processing Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span
            className={`w-2 h-2 rounded-full ${
              tool.processing_time === "fast"
                ? "bg-green-400"
                : tool.processing_time === "medium"
                  ? "bg-yellow-400"
                  : "bg-red-400"
            }`}
          ></span>
          <span className="text-xs text-white/60 capitalize">
            {tool.processing_time === "fast"
              ? "سريع"
              : tool.processing_time === "medium"
                ? "متوسط"
                : "بطيء"}
          </span>
        </div>

        <div className="flex space-x-1">
          {tool.input_types.map((type, idx) => (
            <span key={idx} className="text-xs text-white/50">
              {type === "text"
                ? "📝"
                : type === "image"
                  ? "🖼️"
                  : type === "video"
                    ? "🎥"
                    : type === "audio"
                      ? "🎵"
                      : type === "url"
                        ? "🔗"
                        : "📄"}
            </span>
          ))}
          <span className="text-white/30">→</span>
          {tool.output_types.map((type, idx) => (
            <span key={idx} className="text-xs text-knoux-neon">
              {type === "text"
                ? "📝"
                : type === "image"
                  ? "🖼️"
                  : type === "video"
                    ? "🎞️"
                    : type === "audio"
                      ? "🎵"
                      : "📄"}
            </span>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => handleToolUse(tool)}
        className={`w-full py-2 rounded-lg font-medium transition-all ${
          tool.credits_cost > userCredits.remaining
            ? "bg-gray-500/20 text-gray-500 cursor-not-allowed"
            : "bg-knoux-purple/20 hover:bg-knoux-purple/40 text-knoux-purple hover:text-white"
        }`}
        disabled={tool.credits_cost > userCredits.remaining}
      >
        {tool.credits_cost > userCredits.remaining
          ? "نقاط غير كافية"
          : "استخدام الأداة"}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-knoux-purple to-knoux-neon bg-clip-text text-transparent">
              🛠️ صندوق الأدوات الاحترافي
            </h2>
            <p className="text-white/70 mt-1">
              أدوات الذكاء الاصطناعي المتقدمة لتحرير المحتوى
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن الأدوات..."
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

        {/* Credits Info */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-knoux-purple/10 rounded-lg">
            <div className="text-2xl font-bold text-knoux-purple">
              {userCredits.remaining}
            </div>
            <div className="text-sm text-white/70">النقاط المتبقية</div>
          </div>
          <div className="text-center p-3 bg-knoux-neon/10 rounded-lg">
            <div className="text-2xl font-bold text-knoux-neon">
              {tools.filter((t) => t.ai_powered).length}
            </div>
            <div className="text-sm text-white/70">أدوات ذكية</div>
          </div>
          <div className="text-center p-3 bg-green-400/10 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {tools.filter((t) => t.popular).length}
            </div>
            <div className="text-sm text-white/70">شائعة</div>
          </div>
          <div className="text-center p-3 bg-yellow-400/10 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400 capitalize">
              {userCredits.subscription_tier}
            </div>
            <div className="text-sm text-white/70">الخطة</div>
          </div>
        </div>

        {/* Credits Progress */}
        <div className="mt-4 p-4 bg-black/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">استخدام النقاط</span>
            <span className="text-knoux-neon">
              {userCredits.used}/{userCredits.total}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-knoux-purple to-knoux-neon h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(userCredits.used / userCredits.total) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="glass-card p-4 rounded-2xl border border-knoux-purple/20">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as ToolCategory)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                selectedCategory === category.id
                  ? `bg-${category.color}/30 border border-${category.color} text-${category.color}`
                  : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-transparent"
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
              <span className="text-xs opacity-75">
                (
                {
                  tools.filter(
                    (t) => category.id === "all" || t.category === category.id,
                  ).length
                }
                )
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="glass-card p-6 rounded-2xl border border-knoux-purple/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-orbitron font-bold text-white">
            {categories.find((c) => c.id === selectedCategory)?.icon}{" "}
            {categories.find((c) => c.id === selectedCategory)?.name}
          </h3>
          <span className="text-white/70">{filteredTools.length} أداة</span>
        </div>

        {filteredTools.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-orbitron font-bold text-white mb-2">
              لم يتم العثور على أدوات
            </h3>
            <p className="text-white/70">جرب تعديل البحث أو تغيير الفئة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </div>

      {/* Upgrade Notice */}
      {userCredits.subscription_tier === "free" && (
        <div className="glass-card p-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/5">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">⭐</div>
            <div className="flex-grow">
              <h3 className="text-xl font-orbitron font-bold text-yellow-400 mb-1">
                ترقية إلى الاحترافي
              </h3>
              <p className="text-white/70">
                احصل على نقاط غير محدودة وإمكانية الوصول لأدوات الذكاء الاصطناعي
                المتقدمة
              </p>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl font-bold text-black hover:scale-105 transition-transform">
              ترقية الآن
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolboxPanel;
