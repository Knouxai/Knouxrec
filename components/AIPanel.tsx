import React, { useState } from "react";
import { Recording } from "../types"; // تأكد من أن هذا المسار صحيح لنوع التسجيل

interface AIPanelProps {
  recordings: Recording[];
  onUpdateRecording: (recording: Recording) => void;
}

const AIPanel: React.FC<AIPanelProps> = ({ recordings, onUpdateRecording }) => {
  const [processing, setProcessing] = useState<string | null>(null);
  // `selectedMainTool` يحدد التبويب الرئيسي النشط (تحليل النصوص، الأداء، إلخ.)
  const [selectedMainTool, setSelectedMainTool] = useState<string>("text-analysis");
  // `analysisResults` يخزن نتائج التحليل المفصلة لكل تسجيل
  const [analysisResults, setAnalysisResults] = useState<Record<string, any>>({});

  // --- دوال الذكاء الاصطناعي المحلية (مدمجة مباشرة في المكون) ---

  /**
   * تقوم بتحليل النص المستخرج من التسجيل.
   * @param text النص المراد تحليله.
   * @returns كائن يحتوي على إحصائيات النص.
   */
  const analyzeText = async (text: string) => {
    // محاكاة تأخير بسيط للمعالجة لإظهار حالة "جاري المعالجة"
    await new Promise((resolve) => setTimeout(resolve, 500));

    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const charCount = text.length;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim());
    const avgWordsPerSentence = sentences.length > 0 ? Math.round(wordCount / sentences.length) : 0;

    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const wordFreq: Record<string, number> = {};
    words.forEach((word) => {
      if (word.length > 2) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    const topWords = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    const readingTime = Math.ceil(wordCount / 200);

    return {
      wordCount,
      charCount,
      sentenceCount: sentences.length,
      avgWordsPerSentence,
      topWords,
      readingTime,
      analysisDate: new Date().toLocaleString("ar-SA"),
    };
  };

  /**
   * تستخرج الكلمات المفتاحية من النص.
   * @param text النص المراد استخراج الكلمات المفتاحية منه.
   * @returns مصفوفة من الكلمات المفتاحية مع تفاصيلها.
   */
  const extractKeywords = async (text: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // قائمة بكلمات التوقف الشائعة في العربية لتجاهلها
    const stopWords = [
      "في", "من", "إلى", "على", "عن", "مع", "كان", "كانت", "هذا", "هذه", "ذلك", "التي", "الذي",
      "و", "أو", "ثم", "إذا", "ما", "قد", "كل", "بعض", "لا", "لن", "لم", "غير", "إن", "أن",
      "هو", "هي", "هم", "هن", "أنا", "أنت", "نحن", "ليس", "هناك", "كذلك", "حتى", "أيضا", "فقط"
    ];

    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const cleanWords = words.filter(
      (word) => word.length > 2 && !stopWords.includes(word)
    );

    const wordFreq: Record<string, number> = {};
    cleanWords.forEach((word) => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    const keywords = Object.entries(wordFreq)
      .map(([word, freq]) => ({
        word,
        frequency: freq,
        // يمكن إضافة Importance Score إذا أردنا استخدام TF-IDF فعلي
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 15); // أعلى 15 كلمة مفتاحية

    return keywords;
  };

  /**
   * يولد ملخصاً للنص.
   * @param text النص المراد تلخيصه.
   * @returns ملخص النص.
   */
  const generateSummary = async (text: string) => {
    await new Promise((resolve) => setTimeout(resolve, 700));

    const sentences = text.split(/[.!?]+/).filter((s) => s.trim());

    if (sentences.length <= 3) {
      return "النص قصير جداً لإنشاء ملخص مفيد.";
    }

    const sentenceScores = sentences.map((sentence, index) => {
      const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
      const wordCount = words.length;

      // نقاط إضافية للجمل في البداية والنهاية (عادة ما تكون أكثر أهمية)
      let positionScore = 0;
      if (index < sentences.length * 0.2) positionScore += 3;
      if (index > sentences.length * 0.8) positionScore += 2;

      // نقاط للكلمات الطويلة التي قد تشير إلى محتوى غني
      const longWordsScore = words.filter((w) => w.length > 5).length * 0.5;

      return {
        sentence: sentence.trim(),
        score: wordCount + positionScore + longWordsScore,
        index, // الاحتفاظ بالفهرس الأصلي لإعادة الترتيب لاحقاً
      };
    });

    // اختيار نسبة معينة من الجمل لتكوين الملخص
    const summaryLength = Math.max(2, Math.ceil(sentences.length * 0.25));
    const topSentences = sentenceScores
      .sort((a, b) => b.score - a.score) // فرز حسب الأهمية
      .slice(0, summaryLength) // اختيار الجمل الأكثر أهمية
      .sort((a, b) => a.index - b.index) // إعادة ترتيبها حسب ظهورها الأصلي في النص
      .map((item) => item.sentence);

    let summary = topSentences.join(". ");
    if (!summary.endsWith(".")) {
        summary += "."; // التأكد من انتهاء الملخص بنقطة
    }
    return summary;
  };

  /**
   * يحلل المشاعر في النص (إيجابي، سلبي، محايد).
   * @param text النص المراد تحليل مشاعره.
   * @returns كائن يحتوي على نتيجة تحليل المشاعر.
   */
  const analyzeSentiment = async (text: string) => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    // قوائم كلمات بسيطة للإيجابية والسلبية باللغة العربية
    const positiveWords = [
      "جيد", "رائع", "ممتاز", "مفيد", "سعيد", "نجح", "أحب", "إيجابي", "مميز", "مقبول", "جميل",
      "ناجح", "مدهش", "مبارك", "نشيط", "مرح", "طموح", "قوي", "ثقة", "كريم", "لطيف", "متفائل"
    ];
    const negativeWords = [
      "سيء", "فظيع", "خطأ", "فشل", "حزين", "أكره", "مشكلة", "صعب", "سلبي", "مخيب", "محبط",
      "ضعيف", "خوف", "حرج", "غضب", "حقد", "مرير", "ممل", "متعب", "ضار", "مكروه", "تشاؤم"
    ];

    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    let positiveScore = 0;
    let negativeScore = 0;

    words.forEach((word) => {
      if (positiveWords.includes(word)) positiveScore++;
      if (negativeWords.includes(word)) negativeScore++;
    });

    const totalEmotionalWords = positiveScore + negativeScore;
    let sentiment = "محايد";
    let confidence = 0;

    if (totalEmotionalWords > 0) {
      // حساب الثقة بناءً على الفرق بين النقاط ونسبة الكلمات العاطفية
      confidence = (Math.abs(positiveScore - negativeScore) / totalEmotionalWords) * 100;
      if (positiveScore > negativeScore) {
        sentiment = "إيجابي";
      } else if (negativeScore > positiveScore) {
        sentiment = "سلبي";
      }
    } else if (words.length > 0) {
        // إذا لم توجد كلمات عاطفية ولكن النص موجود، لا يزال محايدًا بثقة منخفضة
        confidence = 10; // افتراضي
    }

    return {
      sentiment,
      confidence: Math.round(confidence),
      positiveScore,
      negativeScore,
      emotionalWordsCount: totalEmotionalWords,
    };
  };

  /**
   * يكشف اللغة المستخدمة في النص (عربية، إنجليزية، مختلطة).
   * @param text النص المراد كشف لغته.
   * @returns كائن يحتوي على اللغة المكتشفة وثقتها.
   */
  const detectLanguage = async (text: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // الاعتماد على نطاق أحرف Unicode للغة العربية والأحرف الإنجليزية
    const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
    const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
    const totalChars = arabicChars + englishChars; // نركز فقط على هذه اللغات هنا

    let language = "غير محدد";
    let confidence = 0;

    if (totalChars > 0) {
      const arabicRatio = arabicChars / totalChars;
      const englishRatio = englishChars / totalChars;

      if (arabicRatio > 0.7) {
        language = "العربية";
        confidence = Math.round(arabicRatio * 100);
      } else if (englishRatio > 0.7) {
        language = "الإنجليزية";
        confidence = Math.round(englishRatio * 100);
      } else if (arabicRatio > 0.2 || englishRatio > 0.2) {
          language = "مختلط (عربي/إنجليزي)";
          confidence = 60; // ثقة متوسطة للمحتوى المختلط
      } else {
          language = "لغات أخرى/غير واضحة";
          confidence = 30; // ثقة منخفضة إذا لم يتم التعرف
      }
    }

    return {
      language,
      confidence,
      arabicChars,
      englishChars,
      totalChars,
    };
  };

  /**
   * ينمذج المواضيع الرئيسية في النص بناءً على قوائم كلمات مفتاحية.
   * @param text النص المراد نمذجة مواضيعه.
   * @returns كائن يحتوي على المواضيع المكتشفة.
   */
  const modelTopics = async (text: string) => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    // فئات المواضيع المحددة مسبقاً مع الكلمات المفتاحية المرتبطة
    const topicCategories = {
      "التقنية والابتكار": ["برمجة", "تطوير", "تقنية", "حاسوب", "برنامج", "موقع", "تطبيق", "ذكاء اصطناعي", "شبكة", "بيانات", "ابتكار", "رقمي", "خوارزمية"],
      "التعليم والمعرفة": ["تعلم", "درس", "دراسة", "طالب", "معلم", "مدرسة", "جامعة", "كتاب", "معرفة", "بحث", "منهج", "شهادة", "امتحان", "محاضرة"],
      "الأعمال والاقتصاد": ["شركة", "عمل", "مال", "ربح", "مشروع", "استثمار", "سوق", "اقتصاد", "تجارة", "موظف", "مبيعات", "تسويق", "تمويل", "صفقة"],
      "الصحة والطب": ["صحة", "طب", "علاج", "دواء", "مريض", "طبيب", "مستشفى", "وقاية", "لياقة", "تغذية", "نفسي", "جسدي", "مرض", "جراحة"],
      "الرياضة والترفيه": ["رياضة", "لعب", "فريق", "مباراة", "تمرين", "لاعب", "نادي", "ترفيه", "فيلم", "موسيقى", "فنون", "سفر", "سينما", "هواية"],
      "المجتمع والأخبار": ["مجتمع", "أخبار", "سياسة", "حكومة", "قانون", "مواطن", "حدث", "تاريخ", "ثقافة", "عائلة", "صداقة", "إنسانية", "سلام", "حروب"],
    };

    const textLower = text.toLowerCase();
    const topicScores: Record<string, number> = {};

    Object.entries(topicCategories).forEach(([topic, keywords]) => {
      let score = 0;
      keywords.forEach((keyword) => {
        // البحث عن الكلمة المفتاحية في النص (باستخدام تعبير عادي للكلمات الكاملة)
        const regex = new RegExp(`\\b${keyword}\\b`, "gi");
        const matches = textLower.match(regex) || [];
        score += matches.length;
      });
      topicScores[topic] = score;
    });

    const sortedTopics = Object.entries(topicScores).sort(
      ([, a], [, b]) => b - a
    );

    let dominantTopic = "غير مصنف";
    let dominantConfidence = 0;

    if (sortedTopics.length > 0 && sortedTopics[0][1] > 0) {
        dominantTopic = sortedTopics[0][0];
        // حساب الثقة كنسبة مئوية من مجموع كل النقاط
        const totalScores = Object.values(topicScores).reduce((sum, score) => sum + score, 0);
        dominantConfidence = totalScores > 0 ? Math.round((sortedTopics[0][1] / totalScores) * 100) : 0;
    }

    return {
      dominantTopic,
      confidence: dominantConfidence,
      allTopics: topicScores, // يمكن استخدام هذا لعرض تفاصيل أكثر عن كل موضوع
    };
  };

  // --- تعريف أدوات تحليل النصوص التي تظهر في التبويب الأول ---
  const textAnalysisTools = [
    {
      id: "text-analysis",
      name: "تحليل النصوص",
      nameEn: "Text Analysis",
      icon: "📊",
      description: "تحليل وفهم النصوص المستخرجة من التسجيلات (الكلمات، الجمل، وقت القراءة).",
      color: "purple-500",
      status: "active",
      functionality: analyzeText, // استخدام الدالة المحلية
      resultKey: "textAnalysis", // مفتاح لتخزين النتيجة في analysisResults
    },
    {
      id: "keyword-extraction",
      name: "استخراج الكلمات المفتاحية",
      nameEn: "Keyword Extraction",
      icon: "🔑",
      description: "استخراج أهم الكلمات والمفاهيم من النص، مما يساعد على فهم المحتوى بسرعة.",
      color: "blue-500",
      status: "active",
      functionality: extractKeywords, // استخدام الدالة المحلية
      resultKey: "keywords",
    },
    {
      id: "summary-generation",
      name: "توليد الملخصات",
      nameEn: "Summary Generation",
      icon: "📋",
      description: "إنشاء ملخصات تلقائية للمحتوى الطويل لتوفير الوقت والجهد.",
      color: "green-500",
      status: "active",
      functionality: generateSummary, // استخدام الدالة المحلية
      resultKey: "summary",
    },
    {
      id: "sentiment-analysis",
      name: "تحليل المشاعر",
      nameEn: "Sentiment Analysis",
      icon: "😊",
      description: "تحديد الطابع العاطفي للمحتوى (إيجابي، سلبي، محايد) لفهم نبرة الحديث.",
      color: "pink-500",
      status: "active",
      functionality: analyzeSentiment, // استخدام الدالة المحلية
      resultKey: "sentiment",
    },
    {
      id: "language-detection",
      name: "كشف اللغة",
      nameEn: "Language Detection",
      icon: "🌍",
      description: "تحديد لغة المحتوى تلقائياً (عربي، إنجليزي، أو مختلط) لتصنيف التسجيلات.",
      color: "orange-500",
      status: "active",
      functionality: detectLanguage, // استخدام الدالة المحلية
      resultKey: "language",
    },
    {
      id: "topic-modeling",
      name: "نمذجة المواضيع",
      nameEn: "Topic Modeling",
      icon: "💡",
      description: "تحديد المواضيع الرئيسية في المحتوى لتنظيم التسجيلات وتسهيل البحث.",
      color: "indigo-500",
      status: "active",
      functionality: modelTopics, // استخدام الدالة المحلية
      resultKey: "topics",
    },
  ];

  // --- المكونات الوهمية Placeholder Components (مدمجة مباشرة هنا) ---
  // لتبسيط الكود وعدم الحاجة لملفات منفصلة لهذه المكونات
  const PerformancePanel: React.FC = () => (
    <div className="glass-card p-6 text-white/70 text-center rounded-xl min-h-[300px] flex flex-col items-center justify-center">
      <div className="text-4xl mb-4">⚡</div>
      <div>
        <h3 className="font-bold text-lg text-white mb-2">أداء المعالجة المحلية</h3>
        <p>هنا يمكنك رؤية إحصائيات حول سرعة وكفاءة المعالجة على جهازك.</p>
        <p className="text-sm text-white/50 mt-2">جاري العمل على لوحة الأداء...</p>
      </div>
    </div>
  );
  const AIModelsManager: React.FC = () => (
    <div className="glass-card p-6 text-white/70 text-center rounded-xl min-h-[300px] flex flex-col items-center justify-center">
      <div className="text-4xl mb-4">🧠</div>
      <div>
        <h3 className="font-bold text-lg text-white mb-2">إدارة نماذج الذكاء الاصطناعي</h3>
        <p>تحكم في النماذج المحملة، تحديثها، أو إضافة نماذج جديدة لتحليل أعمق.</p>
        <p className="text-sm text-white/50 mt-2">جاري العمل على إدارة النماذج...</p>
      </div>
    </div>
  );
  const SystemStats: React.FC = () => (
    <div className="glass-card p-6 text-white/70 text-center rounded-xl min-h-[300px] flex flex-col items-center justify-center">
      <div className="text-4xl mb-4">💻</div>
      <div>
        <h3 className="font-bold text-lg text-white mb-2">إحصائيات النظام</h3>
        <p>مراقبة استهلاك الموارد (المعالج، الذاكرة) أثناء تشغيل تحليلات الذكاء الاصطناعي.</p>
        <p className="text-sm text-white/50 mt-2">جاري العمل على إحصائيات النظام...</p>
      </div>
    </div>
  );
  const AdvancedFeatures: React.FC = () => (
    <div className="glass-card p-6 text-white/70 text-center rounded-xl min-h-[300px] flex flex-col items-center justify-center">
      <div className="text-4xl mb-4">✨</div>
      <div>
        <h3 className="font-bold text-lg text-white mb-2">ميزات متقدمة</h3>
        <p>استكشف الخيارات المتقدمة لضبط خوارزميات الذكاء الاصطناعي.</p>
        <p className="text-sm text-white/50 mt-2">جاري العمل على الميزات المتقدمة...</p>
      </div>
    </div>
  );
  const BatchProcessor: React.FC = () => (
    <div className="glass-card p-6 text-white/70 text-center rounded-xl min-h-[300px] flex flex-col items-center justify-center">
      <div className="text-4xl mb-4">📦</div>
      <div>
        <h3 className="font-bold text-lg text-white mb-2">المعالجة الدفعية</h3>
        <p>قم بمعالجة عدة تسجيلات في وقت واحد لتحسين الكفاءة.</p>
        <p className="text-sm text-white/50 mt-2">جاري العمل على المعالجة الدفعية...</p>
      </div>
    </div>
  );
  const AnalyticsDashboard: React.FC = () => (
    <div className="glass-card p-6 text-white/70 text-center rounded-xl min-h-[300px] flex flex-col items-center justify-center">
      <div className="text-4xl mb-4">📈</div>
      <div>
        <h3 className="font-bold text-lg text-white mb-2">لوحة تحكم التحليلات</h3>
        <p>عرض رسوم بيانية وتصورات لنتائج تحليل التسجيلات عبر الوقت.</p>
        <p className="text-sm text-white/50 mt-2">جاري العمل على لوحة تحكم التحليلات...</p>
      </div>
    </div>
  );
  const PrivacySettings: React.FC = () => (
    <div className="glass-card p-6 text-white/70 text-center rounded-xl min-h-[300px] flex flex-col items-center justify-center">
      <div className="text-4xl mb-4">🔐</div>
      <div>
        <h3 className="font-bold text-lg text-white mb-2">إعدادات الخصوصية</h3>
        <p>تأكد من بقاء بياناتك آمنة على جهازك الخاص.</p>
        <p className="text-sm text-white/50 mt-2">جاري العمل على إعدادات الخصوصية...</p>
      </div>
    </div>
  );


  // --- تعريف الأدوات الرئيسية التي تظهر في شريط التبويبات العلوي ---
  const mainTools = [
    { id: "text-analysis", name: "تحليل النصوص", icon: "📝", component: null }, // لا يوجد مكون منفصل لها، بل تعرض قائمة التسجيلات
    { id: "performance", name: "الأداء", icon: "🚀", component: <PerformancePanel /> },
    { id: "models", name: "النماذج", icon: "🧠", component: <AIModelsManager /> },
    { id: "system-stats", name: "إحصائيات النظام", icon: "💻", component: <SystemStats /> },
    { id: "advanced", name: "ميزات متقدمة", icon: "✨", component: <AdvancedFeatures /> },
    { id: "batch-processing", name: "معالجة دفعية", icon: "📦", component: <BatchProcessor /> },
    { id: "analytics", name: "لوحة التحليلات", icon: "📈", component: <AnalyticsDashboard /> },
    { id: "privacy", name: "الخصوصية", icon: "🔐", component: <PrivacySettings /> },
  ];

  /**
   * دالة لمعالجة تسجيل محدد باستخدام أداة AI معينة.
   * يتم استدعاؤها عند النقر على زر "تحليل" بجانب كل أداة.
   * @param recording التسجيل المراد معالجته.
   * @param toolId معرف الأداة المراد استخدامها.
   */
  const handleProcessRecording = async (
    recording: Recording,
    toolId: string
  ) => {
    const tool = textAnalysisTools.find((t) => t.id === toolId);
    // التحقق من وجود النص والتأكد من وجود الأداة
    if (!recording.transcript || !tool) return;

    // تعيين حالة المعالجة لمنع الضغط المتعدد وإظهار مؤشر التحميل
    setProcessing(`${recording.id}-${tool.id}`);

    try {
      // استدعاء دالة التحليل المناسبة مع نص التسجيل
      const result = await tool.functionality(recording.transcript);

      // تحديث حالة `analysisResults` بالنتائج الجديدة
      setAnalysisResults((prev) => ({
        ...prev,
        [recording.id]: {
          ...prev[recording.id],
          [tool.resultKey]: result,
        },
      }));

      // تحديث حقول الملخص والكلمات المفتاحية واللغة والمشاعر في كائن التسجيل الرئيسي
      // ليعكس آخر تحليل تم إجراؤه أو لدمج النتائج
      let updatedRecording = { ...recording };
      if (tool.id === "summary-generation" && typeof result === 'string') {
        updatedRecording.summary = result.length > 250 ? `${result.substring(0, 250)}...` : result;
      } else if (tool.id === "keyword-extraction" && Array.isArray(result)) {
        updatedRecording.keywords = result.slice(0, 8).map((item: any) => item.word);
      } else if (tool.id === "sentiment-analysis" && result.sentiment) {
        updatedRecording.sentiment = result.sentiment;
      } else if (tool.id === "language-detection" && result.language) {
        updatedRecording.language = result.language;
      } else if (tool.id === "topic-modeling" && result.dominantTopic) {
        updatedRecording.topic = result.dominantTopic;
      }

      // إبلاغ المكون الأب بالتسجيل المحدث
      onUpdateRecording(updatedRecording);
    } catch (error) {
      console.error(`خطأ في ${tool.name}:`, error);
      alert(`حدث خطأ أثناء معالجة ${tool.name}. يرجى التحقق من وحدة التحكم (Console).`);
    } finally {
      // إزالة حالة المعالجة
      setProcessing(null);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 min-h-screen text-white font-inter rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-white">
        🧠 أدوات الذكاء الاصطناعي
      </h2>

      {/* Main Navigation Tabs */}
      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        {mainTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setSelectedMainTool(tool.id)}
            className={`
              px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300
              flex items-center gap-2
              ${
                selectedMainTool === tool.id
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
              }
            `}
          >
            <span className="text-2xl">{tool.icon}</span>
            {tool.name}
          </button>
        ))}
      </div>

      {/* Conditional Rendering of Panels */}
      {selectedMainTool !== "text-analysis" && (
        <div className="mt-8">
          {mainTools.find(tool => tool.id === selectedMainTool)?.component}
        </div>
      )}

      {selectedMainTool === "text-analysis" && (
        <>
          {/* Text Analysis Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {textAnalysisTools.map((tool) => (
              <div
                key={tool.id}
                className={`
                  glass-card p-5 rounded-xl border-2 transition-all duration-300
                  ${
                    tool.status === "active"
                      ? `border-${tool.color}/50 hover:border-${tool.color} cursor-pointer`
                      : "border-gray-600 opacity-50 cursor-not-allowed"
                  }
                `}
              >
                <div className="flex items-center mb-3">
                  <span className={`text-4xl mr-3 text-${tool.color}`}>
                    {tool.icon}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-gray-400">{tool.nameEn}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  {tool.description}
                </p>
                <div className="text-xs text-gray-500">
                  الحالة:{" "}
                  <span
                    className={`font-semibold ${
                      tool.status === "active" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {tool.status === "active" ? "نشط" : "غير نشط"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Recordings List for Text Analysis */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-inner">
            <h3 className="text-2xl font-bold text-white mb-6">
              تسجيلاتك لتحليل الذكاء الاصطناعي
            </h3>
            {recordings.length === 0 ? (
              <p className="text-gray-400 text-center py-10">
                لا توجد تسجيلات متاحة للتحليل. ابدأ بتسجيل جديد!
              </p>
            ) : (
              <div className="space-y-4">
                {recordings.map((recording) => (
                  <div
                    key={recording.id}
                    className="bg-gray-700 p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between shadow-md"
                  >
                    <div className="flex-grow mb-3 md:mb-0">
                      <h4 className="text-lg font-semibold text-white">
                        {recording.name}
                      </h4>
                      <p className="text-sm text-gray-300 mt-1">
                        المدة: {recording.duration.toFixed(1)} ثانية | الحجم:{" "}
                        {(recording.size / (1024 * 1024)).toFixed(2)} ميجابايت
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        النص المستخرج:{" "}
                        {recording.transcript
                          ? recording.transcript.substring(0, 100) + "..."
                          : "لا يوجد نص مستخرج"}
                      </p>
                      {/* Display Analysis Results if available */}
                      {analysisResults[recording.id] && (
                        <div className="mt-3 text-sm text-gray-200 bg-gray-600 p-3 rounded-md">
                          {analysisResults[recording.id].textAnalysis && (
                            <p>
                              <strong>تحليل النص:</strong> كلمات: {analysisResults[recording.id].textAnalysis.wordCount},{" "}
                              جمل: {analysisResults[recording.id].textAnalysis.sentenceCount},{" "}
                              وقت القراءة: {analysisResults[recording.id].textAnalysis.readingTime} دقيقة
                            </p>
                          )}
                          {analysisResults[recording.id].keywords && (
                            <p>
                              <strong>كلمات مفتاحية:</strong>{" "}
                              {analysisResults[recording.id].keywords.map((k: any) => k.word).join(", ")}
                            </p>
                          )}
                          {analysisResults[recording.id].summary && (
                            <p>
                              <strong>ملخص:</strong> {analysisResults[recording.id].summary}
                            </p>
                          )}
                          {analysisResults[recording.id].sentiment && (
                            <p>
                              <strong>المشاعر:</strong> {analysisResults[recording.id].sentiment.sentiment}{" "}
                              (ثقة: {analysisResults[recording.id].sentiment.confidence}%)
                            </p>
                          )}
                          {analysisResults[recording.id].language && (
                            <p>
                              <strong>اللغة:</strong> {analysisResults[recording.id].language.language}{" "}
                              (ثقة: {analysisResults[recording.id].language.confidence}%)
                            </p>
                          )}
                          {analysisResults[recording.id].topics && (
                            <p>
                              <strong>الموضوع الرئيسي:</strong> {analysisResults[recording.id].topics.dominantTopic}{" "}
                              (ثقة: {analysisResults[recording.id].topics.confidence}%)
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 md:flex-col md:ml-4">
                      {textAnalysisTools.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => handleProcessRecording(recording, tool.id)}
                          disabled={!recording.transcript || processing === `${recording.id}-${tool.id}`}
                          className={`
                            px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200
                            ${
                              !recording.transcript
                                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                : processing === `${recording.id}-${tool.id}`
                                  ? `bg-${tool.color}/30 text-${tool.color} animate-pulse`
                                  : `bg-${tool.color} hover:bg-${tool.color}/80 text-white`
                            }
                          `}
                        >
                          {processing === `${recording.id}-${tool.id}` ? "جاري..." : `تحليل ${tool.name}`}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AIPanel;