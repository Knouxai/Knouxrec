import React, { useState } from "react";
import { Recording } from "../types";
import { processAdvancedTranscript } from "../services/offlineAI";

interface AIPanelProps {
  recordings: Recording[];
  onUpdateRecording: (recording: Recording) => void;
}

const AIPanel: React.FC<AIPanelProps> = ({ recordings, onUpdateRecording }) => {
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string>("transcript");
  const [analysisResults, setAnalysisResults] = useState<Record<string, any>>(
    {},
  );

  // أدوات ذكاء اصطناعي حقيقية تعمل محلياً
  const realAITools = [
    {
      id: "transcript",
      name: "تحليل النصوص",
      nameEn: "Text Analysis",
      icon: "���",
      description: "تحليل وفهم النصوص المستخرجة من التسجيلات",
      descriptionEn: "Analyze and understand extracted text from recordings",
      color: "purple-500",
      status: "active",
      functionality: (recording: Recording) => analyzeText(recording),
    },
    {
      id: "keyword-extraction",
      name: "استخراج الكلمات المفتاحية",
      nameEn: "Keyword Extraction",
      icon: "🔑",
      description: "استخراج أهم الكلمات والمفاهيم من النص",
      descriptionEn: "Extract important keywords and concepts from text",
      color: "blue-500",
      status: "active",
      functionality: (recording: Recording) => extractKeywords(recording),
    },
    {
      id: "summary-generation",
      name: "توليد الملخصات",
      nameEn: "Summary Generation",
      icon: "📋",
      description: "إنشاء ملخصات تلقائية للمحتوى",
      descriptionEn: "Generate automatic summaries of content",
      color: "green-500",
      status: "active",
      functionality: (recording: Recording) => generateSummary(recording),
    },
    {
      id: "sentiment-analysis",
      name: "تحليل المشاعر",
      nameEn: "Sentiment Analysis",
      icon: "😊",
      description: "تحديد الطابع العاطفي للمحتوى",
      descriptionEn: "Determine emotional tone of content",
      color: "pink-500",
      status: "active",
      functionality: (recording: Recording) => analyzeSentiment(recording),
    },
    {
      id: "language-detection",
      name: "كشف اللغة",
      nameEn: "Language Detection",
      icon: "🌍",
      description: "تحديد لغة المحتوى تلقائياً",
      descriptionEn: "Automatically detect content language",
      color: "orange-500",
      status: "active",
      functionality: (recording: Recording) => detectLanguage(recording),
    },
    {
      id: "topic-modeling",
      name: "نمذجة المواضيع",
      nameEn: "Topic Modeling",
      icon: "📊",
      description: "تحديد المواضيع الرئيسية في المحتوى",
      descriptionEn: "Identify main topics in content",
      color: "indigo-500",
      status: "active",
      functionality: (recording: Recording) => modelTopics(recording),
    },
  ];

  // وظائف تحليل حقيقية تعمل محلياً
  const analyzeText = async (recording: Recording) => {
    if (!recording.transcript) return;

    setProcessing(recording.id);

    try {
      // تحليل النص باستخدام خوارزميات محلية
      const wordCount = recording.transcript.split(/\s+/).length;
      const charCount = recording.transcript.length;
      const sentences = recording.transcript
        .split(/[.!?]+/)
        .filter((s) => s.trim());
      const avgWordsPerSentence = Math.round(wordCount / sentences.length);

      // تحليل تردد الكلمات
      const words = recording.transcript.toLowerCase().match(/\b\w+\b/g) || [];
      const wordFreq: Record<string, number> = {};
      words.forEach((word) => {
        if (word.length > 3) {
          // تجاهل الكلمات القصيرة
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      });

      const result = {
        wordCount,
        charCount,
        sentenceCount: sentences.length,
        avgWordsPerSentence,
        topWords: Object.entries(wordFreq)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([word, count]) => ({ word, count })),
        readingTime: Math.ceil(wordCount / 200), // دقائق القراءة
        analysisDate: new Date().toLocaleString("ar-SA"),
      };

      setAnalysisResults((prev) => ({
        ...prev,
        [recording.id]: { ...prev[recording.id], textAnalysis: result },
      }));

      // تحديث التسجيل
      const updatedRecording = {
        ...recording,
        summary: `تحليل النص: ${wordCount} كلمة، ${sentences.length} جملة، وقت القراءة: ${result.readingTime} دقائق`,
        keywords: result.topWords.slice(0, 5).map((item) => item.word),
      };

      onUpdateRecording(updatedRecording);
    } catch (error) {
      console.error("خطأ في تحليل النص:", error);
    } finally {
      setProcessing(null);
    }
  };

  const extractKeywords = async (recording: Recording) => {
    if (!recording.transcript) return;

    setProcessing(recording.id);

    try {
      // استخراج الكلمات المفتاحية باستخدام خوارزمية TF-IDF مبسطة
      const text = recording.transcript.toLowerCase();
      const sentences = text.split(/[.!?]+/).filter((s) => s.trim());

      // كلمات الوقف العربية
      const stopWords = [
        "في",
        "من",
        "إلى",
        "على",
        "عن",
        "مع",
        "كان",
        "كانت",
        "هذا",
        "هذه",
        "ذلك",
        "التي",
        "الذي",
      ];

      const words = text.match(/\b\w+\b/g) || [];
      const cleanWords = words.filter(
        (word) => word.length > 3 && !stopWords.includes(word),
      );

      // حساب تكرار الكلمات
      const wordFreq: Record<string, number> = {};
      cleanWords.forEach((word) => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });

      // حساب الأهمية النسبية
      const keywords = Object.entries(wordFreq)
        .map(([word, freq]) => ({
          word,
          frequency: freq,
          importance: freq / cleanWords.length,
          positions: cleanWords
            .map((w, i) => (w === word ? i : -1))
            .filter((i) => i !== -1),
        }))
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 15);

      setAnalysisResults((prev) => ({
        ...prev,
        [recording.id]: { ...prev[recording.id], keywords },
      }));

      const updatedRecording = {
        ...recording,
        keywords: keywords.slice(0, 8).map((k) => k.word),
        summary: `تم استخراج ${keywords.length} كلمة مفتاحية من النص`,
      };

      onUpdateRecording(updatedRecording);
    } catch (error) {
      console.error("خطأ في استخراج الكلمات المفتاحية:", error);
    } finally {
      setProcessing(null);
    }
  };

  const generateSummary = async (recording: Recording) => {
    if (!recording.transcript) return;

    setProcessing(recording.id);

    try {
      // توليد ملخص باستخدام خوارزمية التقييم النصي
      const sentences = recording.transcript
        .split(/[.!?]+/)
        .filter((s) => s.trim());

      if (sentences.length <= 3) {
        setAnalysisResults((prev) => ({
          ...prev,
          [recording.id]: {
            ...prev[recording.id],
            summary: "النص قصير جداً لإنشاء ملخص",
          },
        }));
        return;
      }

      // تقييم أهمية كل جملة
      const sentenceScores = sentences.map((sentence, index) => {
        const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
        const wordCount = words.length;

        // نقاط إضافية للجمل في البداية والنهاية
        let positionScore = 0;
        if (index < sentences.length * 0.3) positionScore += 2;
        if (index > sentences.length * 0.7) positionScore += 1;

        // نقاط للكلمات الطويلة
        const longWordsScore = words.filter((w) => w.length > 6).length;

        return {
          sentence: sentence.trim(),
          score: wordCount + positionScore + longWordsScore,
          index,
        };
      });

      // اختيار أفضل الجمل للملخص
      const topSentences = sentenceScores
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.max(2, Math.ceil(sentences.length * 0.3)))
        .sort((a, b) => a.index - b.index)
        .map((item) => item.sentence);

      const summary = topSentences.join(". ") + ".";

      setAnalysisResults((prev) => ({
        ...prev,
        [recording.id]: { ...prev[recording.id], summary },
      }));

      const updatedRecording = {
        ...recording,
        summary:
          summary.length > 200 ? summary.substring(0, 200) + "..." : summary,
      };

      onUpdateRecording(updatedRecording);
    } catch (error) {
      console.error("خطأ في توليد الملخص:", error);
    } finally {
      setProcessing(null);
    }
  };

  const analyzeSentiment = async (recording: Recording) => {
    if (!recording.transcript) return;

    setProcessing(recording.id);

    try {
      // تحليل المشاعر باستخدام قاموس الكلمات العاطفية
      const positiveWords = [
        "جيد",
        "رائع",
        "ممتاز",
        "مفيد",
        "رائع",
        "سعيد",
        "نجح",
        "أحب",
        "إيجابي",
      ];
      const negativeWords = [
        "سيء",
        "فظيع",
        "خطأ",
        "فشل",
        "حزين",
        "أكره",
        "مشكلة",
        "صعب",
        "سلبي",
      ];

      const text = recording.transcript.toLowerCase();
      const words = text.match(/\b\w+\b/g) || [];

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
        confidence = totalEmotionalWords / words.length;
        if (positiveScore > negativeScore) {
          sentiment = "إيجابي";
        } else if (negativeScore > positiveScore) {
          sentiment = "سلبي";
        }
      }

      const result = {
        sentiment,
        confidence: Math.round(confidence * 100),
        positiveScore,
        negativeScore,
        emotionalWords: totalEmotionalWords,
      };

      setAnalysisResults((prev) => ({
        ...prev,
        [recording.id]: { ...prev[recording.id], sentiment: result },
      }));

      const updatedRecording = {
        ...recording,
        summary: `تحليل المشاعر: ${sentiment} (ثقة: ${result.confidence}%)`,
      };

      onUpdateRecording(updatedRecording);
    } catch (error) {
      console.error("خطأ في تحليل المشاعر:", error);
    } finally {
      setProcessing(null);
    }
  };

  const detectLanguage = async (recording: Recording) => {
    if (!recording.transcript) return;

    setProcessing(recording.id);

    try {
      const text = recording.transcript;

      // كشف اللغة باستخدام تحليل الأحرف
      const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
      const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
      const totalChars = arabicChars + englishChars;

      let language = "غير محدد";
      let confidence = 0;

      if (totalChars > 0) {
        const arabicRatio = arabicChars / totalChars;
        const englishRatio = englishChars / totalChars;

        if (arabicRatio > 0.6) {
          language = "العربية";
          confidence = Math.round(arabicRatio * 100);
        } else if (englishRatio > 0.6) {
          language = "الإنجليزية";
          confidence = Math.round(englishRatio * 100);
        } else {
          language = "مختلط";
          confidence = 50;
        }
      }

      const result = {
        language,
        confidence,
        arabicChars,
        englishChars,
        totalChars,
      };

      setAnalysisResults((prev) => ({
        ...prev,
        [recording.id]: { ...prev[recording.id], language: result },
      }));

      const updatedRecording = {
        ...recording,
        summary: `كشف اللغة: ${language} (ثقة: ${confidence}%)`,
      };

      onUpdateRecording(updatedRecording);
    } catch (error) {
      console.error("خطأ في كشف اللغة:", error);
    } finally {
      setProcessing(null);
    }
  };

  const modelTopics = async (recording: Recording) => {
    if (!recording.transcript) return;

    setProcessing(recording.id);

    try {
      // نمذجة المواضيع باستخدام تجميع الكلمات المفتاحية
      const text = recording.transcript.toLowerCase();

      // فئات المواضيع المحددة مسبقاً
      const topicCategories = {
        تقنية: ["برمجة", "تطوير", "تقنية", "حاسوب", "برنامج", "موقع", "تطبيق"],
        تعليم: ["تعلم", "درس", "دراسة", "طالب", "معلم", "مدرسة", "جامعة"],
        أعمال: ["شركة", "عمل", "مال", "ربح", "مشروع", "استثمار", "سوق"],
        صحة: ["صحة", "طب", "علاج", "دواء", "مريض", "طبيب", "مستشفى"],
        رياضة: ["رياضة", "لعب", "فريق", "مباراة", "تمرين", "لاعب", "نادي"],
      };

      const topicScores: Record<string, number> = {};

      Object.entries(topicCategories).forEach(([topic, keywords]) => {
        let score = 0;
        keywords.forEach((keyword) => {
          const regex = new RegExp(keyword, "gi");
          const matches = text.match(regex) || [];
          score += matches.length;
        });
        topicScores[topic] = score;
      });

      const dominantTopic = Object.entries(topicScores).sort(
        ([, a], [, b]) => b - a,
      )[0];

      const result = {
        dominantTopic: dominantTopic[0],
        confidence: dominantTopic[1],
        allTopics: topicScores,
      };

      setAnalysisResults((prev) => ({
        ...prev,
        [recording.id]: { ...prev[recording.id], topics: result },
      }));

      const updatedRecording = {
        ...recording,
        summary: `الموضوع الرئيسي: ${result.dominantTopic} (نقاط: ${result.confidence})`,
      };

      onUpdateRecording(updatedRecording);
    } catch (error) {
      console.error("خطأ في نمذجة المواضيع:", error);
    } finally {
      setProcessing(null);
    }
  };

  const recordingsWithTranscript = recordings.filter(
    (r) => r.transcript && r.transcript.length > 10,
  );

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🧠 مختبر الذكاء الاصطناعي المحلي
          </h1>
          <p className="text-xl text-indigo-200">
            تحليل ذكي محلي 100% - لا خدمات خارجية ولا "Coming Soon"!
          </p>
        </div>

        {/* AI Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {realAITools.map((tool) => (
            <div
              key={tool.id}
              className={`
                glass-card border-2 rounded-xl p-6 transition-all duration-300 cursor-pointer
                ${
                  selectedTool === tool.id
                    ? `border-${tool.color} bg-${tool.color}/10`
                    : "border-white/20 hover:border-white/40"
                }
              `}
              onClick={() => setSelectedTool(tool.id)}
            >
              <div className="text-4xl mb-4 text-center">{tool.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2 text-center">
                {tool.name}
              </h3>
              <p className="text-white/70 text-sm text-center mb-4">
                {tool.description}
              </p>
              <div className="text-center">
                <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                  ✅ نشط ويعمل
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Recordings List */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            📋 التسجيلات المتاحة للتحليل ({recordingsWithTranscript.length})
          </h2>

          {recordingsWithTranscript.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-xl text-white/70 mb-2">
                لا توجد تسجيلات تحتوي على نص
              </p>
              <p className="text-white/50">
                قم بإنشاء تسجيل يحتوي على كلام لتفعيل أدوات الذكاء الاصطناعي
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recordingsWithTranscript.map((recording) => (
                <div key={recording.id} className="bg-white/5 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {recording.name}
                      </h3>
                      <p className="text-sm text-white/60">
                        {recording.transcript?.substring(0, 100)}...
                      </p>
                    </div>
                    <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">
                      نص متاح
                    </span>
                  </div>

                  {/* Analysis Results */}
                  {analysisResults[recording.id] && (
                    <div className="mb-4 p-4 bg-white/5 rounded-lg">
                      <h4 className="text-sm font-semibold text-white mb-2">
                        نتائج التحليل:
                      </h4>
                      <div className="text-xs text-white/80 space-y-1">
                        {analysisResults[recording.id].textAnalysis && (
                          <div>
                            📊{" "}
                            {
                              analysisResults[recording.id].textAnalysis
                                .wordCount
                            }{" "}
                            كلمة
                          </div>
                        )}
                        {analysisResults[recording.id].sentiment && (
                          <div>
                            😊 المشاعر:{" "}
                            {analysisResults[recording.id].sentiment.sentiment}
                          </div>
                        )}
                        {analysisResults[recording.id].language && (
                          <div>
                            🌍 اللغة:{" "}
                            {analysisResults[recording.id].language.language}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {realAITools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => tool.functionality(recording)}
                        disabled={processing === recording.id}
                        className={`
                          px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                          ${
                            processing === recording.id
                              ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                              : `bg-${tool.color} hover:bg-${tool.color}/80 text-white`
                          }
                        `}
                      >
                        {processing === recording.id
                          ? "🔄 جار المعالجة..."
                          : `${tool.icon} ${tool.name}`}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 text-center bg-white/5 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-white mb-4">
            🎯 مميزات الذكاء الاصطناعي المحلي
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-indigo-200">
            <div>
              <div className="text-3xl mb-2">🔒</div>
              <h4 className="font-semibold mb-2">خصوصية كاملة</h4>
              <p className="text-sm">تحليل محلي بدون إرسال البيانات</p>
            </div>
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-semibold mb-2">سرعة فائقة</h4>
              <p className="text-sm">معالجة فورية بدون انتظار</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🆓</div>
              <h4 className="font-semibold mb-2">مجاني</h4>
              <p className="text-sm">لا رسوم أو حدود استخدام</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🌐</div>
              <h4 className="font-semibold mb-2">أوفلاين</h4>
              <p className="text-sm">يعمل بدون اتصال بالإنترنت</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
