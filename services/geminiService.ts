// KNOUX REC - Local AI Service (No External APIs)
// 100% Offline AI Processing System

import { processAdvancedTranscript, AdvancedAIResult } from "./offlineAI";

// Legacy interface for backward compatibility
export interface AIProcessingResult {
  title: string;
  summary: string;
  keywords: string[];
}

/**
 * معالجة النصوص بالذكاء الاصطناعي المحلي
 * لا يستخدم أي API خارجي - يعمل بالكامل أوفلاين
 */
export async function processTranscript(
  transcript: string,
  audioBuffer?: AudioBuffer,
): Promise<AIProcessingResult> {
  try {
    console.log("🧠 KNOUX AI: بدء المعالجة المحلية للنص...");

    // استخدام نظام الذكاء الاصطناعي المحلي بدلاً من Gemini
    const result: AdvancedAIResult = await processAdvancedTranscript(
      transcript,
      audioBuffer,
    );

    console.log(
      `🧠 KNOUX AI: اكتملت المعالجة في ${result.processingTime.toFixed(2)}ms`,
    );
    console.log(
      `🧠 KNOUX AI: مستوى الثقة: ${(result.confidence * 100).toFixed(1)}%`,
    );
    console.log(
      `🧠 KNOUX AI: اللغة: ${result.language}، المشاعر: ${result.sentiment}`,
    );

    if (result.audioAnalysis) {
      console.log(`🧠 KNOUX AI: جودة الصوت: ${result.audioAnalysis.quality}`);
      console.log(
        `🧠 KNOUX AI: نسبة الكلام: ${result.audioAnalysis.speechRatio.toFixed(1)}%`,
      );
    }

    // إرجاع التنسيق المتوافق مع النظام القديم
    return {
      title: result.title,
      summary: result.summary,
      keywords: result.keywords,
    };
  } catch (error) {
    console.error("🧠 KNOUX AI: فشلت المعالجة:", error);

    // نظام احتياطي محلي
    return {
      title: "تسجيل KNOUX",
      summary: "واجهت المعالجة الذكية خطأ، لكن تسجيلك آمن ومحفوظ.",
      keywords: ["تسجيل", "knoux"],
    };
  }
}

/**
 * معالجة متقدمة للنصوص مع تحليل شامل
 */
export async function processTranscriptAdvanced(
  transcript: string,
  audioBuffer?: AudioBuffer,
): Promise<AdvancedAIResult> {
  return processAdvancedTranscript(transcript, audioBuffer);
}

/**
 * معالجة مجمعة لعدة تسجيلات
 */
export async function batchProcessTranscripts(
  transcripts: Array<{
    id: string;
    transcript: string;
    audioBuffer?: AudioBuffer;
  }>,
): Promise<Array<{ id: string; result: AIProcessingResult }>> {
  console.log(
    `🧠 KNOUX AI: بدء المعالجة المجمعة لـ ${transcripts.length} تسجيل...`,
  );

  const results = [];

  for (const item of transcripts) {
    try {
      const result = await processTranscript(item.transcript, item.audioBuffer);
      results.push({ id: item.id, result });

      // تأخير صغير بين المعالجات لتجنب تجميد الواجهة
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`🧠 KNOUX AI: فشل في معالجة ${item.id}:`, error);
      results.push({
        id: item.id,
        result: {
          title: "فشلت المعالجة",
          summary: "تعذر معالجة هذا التسجيل.",
          keywords: ["خطأ"],
        },
      });
    }
  }

  console.log(`🧠 KNOUX AI: اكتملت المعالجة المجمعة`);
  return results;
}

/**
 * معالج النصوص المباشر (للمعالجة الحية)
 */
export class LiveTranscriptProcessor {
  private buffer: string = "";
  private lastProcessTime: number = 0;
  private readonly PROCESS_INTERVAL = 5000; // معالجة كل 5 ثواني

  addText(text: string): void {
    this.buffer += " " + text;

    const now = Date.now();
    if (now - this.lastProcessTime > this.PROCESS_INTERVAL) {
      this.processBuffer();
      this.lastProcessTime = now;
    }
  }

  private async processBuffer(): Promise<void> {
    if (this.buffer.trim().length < 50) return;

    try {
      const result = await processTranscript(this.buffer.trim());
      console.log("🧠 KNOUX AI: نتيجة المعالجة المباشرة:", result.title);

      // إرسال حدث للتحديثات المباشرة
      window.dispatchEvent(
        new CustomEvent("liveTranscriptProcessed", {
          detail: result,
        }),
      );
    } catch (error) {
      console.error("🧠 KNOUX AI: خطأ في المعالجة المباشرة:", error);
    }
  }

  getBuffer(): string {
    return this.buffer;
  }

  clearBuffer(): void {
    this.buffer = "";
  }

  async finalizeProcessing(): Promise<AIProcessingResult> {
    const result = await processTranscript(this.buffer.trim());
    this.clearBuffer();
    return result;
  }
}

// دوال الراحة
export const createLiveProcessor = () => new LiveTranscriptProcessor();

/**
 * حالة نظام الذكاء الاصطناعي المحلي
 */
export function getAIStatus(): {
  ready: boolean;
  features: string[];
  performance: "high" | "medium" | "low";
  localModels: string[];
} {
  return {
    ready: true,
    features: [
      "تحليل الكلام المحلي",
      "استخراج الكلمات المفتاحية",
      "تلخيص ذكي",
      "اكتشاف اللغة",
      "تحليل المشاعر",
      "تحليل جودة الصوت",
      "المعالجة المباشرة",
      "معالجة مجمعة",
      "استخراج الكيانات",
      "تحليل الموضوعات",
    ],
    performance: "high",
    localModels: [
      "TensorFlow.js Language Model",
      "Local Speech Analysis",
      "Keyword Extraction Algorithm",
      "Sentiment Analysis Model",
      "Topic Classification Model",
      "Entity Recognition Model",
    ],
  };
}

// تصدير جميع الواجهات والفئات
export { AdvancedAIResult };
