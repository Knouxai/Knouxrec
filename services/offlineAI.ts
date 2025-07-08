// Advanced Offline AI Services for KNOUX REC
import * as tf from "@tensorflow/tfjs";

// Initialize TensorFlow.js
let isInitialized = false;

export const initializeAI = async () => {
  if (isInitialized) return;

  try {
    await tf.ready();
    console.log("🧠 KNOUX AI: TensorFlow.js initialized");
    isInitialized = true;
  } catch (error) {
    console.error("Failed to initialize AI:", error);
  }
};

// Text Analysis Engine
export class TextAnalysisEngine {
  private static stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "about",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "up",
    "down",
    "out",
    "off",
    "over",
    "under",
    "again",
    "further",
    "then",
    "once",
    "here",
    "there",
    "when",
    "where",
    "why",
    "how",
    "all",
    "any",
    "both",
    "each",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "nor",
    "not",
    "only",
    "own",
    "same",
    "so",
    "than",
    "too",
    "very",
    "can",
    "will",
    "just",
    "don",
    "should",
    "now",
    "i",
    "me",
    "my",
    "myself",
    "we",
    "our",
    "ours",
    "ourselves",
    "you",
    "your",
    "yours",
    "yourself",
    "yourselves",
    "he",
    "him",
    "his",
    "himself",
    "she",
    "her",
    "hers",
    "herself",
    "it",
    "its",
    "itself",
    "they",
    "them",
    "their",
    "theirs",
    "themselves",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "having",
    "do",
    "does",
    "did",
    "doing",
  ]);

  static extractKeywords(text: string, limit: number = 10): string[] {
    if (!text || text.length < 10) return [];

    // Clean and tokenize
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 2 && !this.stopWords.has(word) && !/^\d+$/.test(word),
      );

    // Count frequency
    const wordCount = new Map<string, number>();
    words.forEach((word) => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    // Calculate TF-IDF-like scores
    const scores = new Map<string, number>();
    for (const [word, count] of wordCount.entries()) {
      // Simple scoring: frequency * word length factor
      const lengthBonus = Math.min(word.length / 10, 1.5);
      const score = count * lengthBonus;
      scores.set(word, score);
    }

    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word]) => word);
  }

  static generateSummary(text: string, maxSentences: number = 3): string {
    if (!text || text.length < 50) {
      return "Content too short for meaningful summary.";
    }

    // Split into sentences
    const sentences = text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);

    if (sentences.length === 0) {
      return "No clear sentences detected.";
    }

    if (sentences.length <= maxSentences) {
      return sentences.join(". ") + ".";
    }

    // Score sentences based on keyword density and position
    const keywords = this.extractKeywords(text, 20);
    const keywordSet = new Set(keywords);

    const sentenceScores = sentences.map((sentence, index) => {
      const words = sentence.toLowerCase().split(/\s+/);
      const keywordCount = words.filter((word) => keywordSet.has(word)).length;

      // Position bonus (first and last sentences are important)
      const positionBonus =
        index === 0 || index === sentences.length - 1 ? 1.2 : 1.0;

      // Length penalty for very short or very long sentences
      const lengthFactor = Math.max(0.5, Math.min(1.5, words.length / 15));

      const score =
        (keywordCount / words.length) * positionBonus * lengthFactor;

      return { sentence, score, index };
    });

    // Select top sentences
    const topSentences = sentenceScores
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSentences)
      .sort((a, b) => a.index - b.index)
      .map((item) => item.sentence);

    return topSentences.join(". ") + ".";
  }

  static generateTitle(text: string): string {
    if (!text || text.length < 20) {
      return "KNOUX Recording";
    }

    const keywords = this.extractKeywords(text, 5);
    if (keywords.length === 0) {
      return "KNOUX Recording";
    }

    // Try to find meaningful phrases
    const sentences = text.split(/[.!?]+/).map((s) => s.trim());
    const firstSentence = sentences[0];

    if (firstSentence && firstSentence.length < 60) {
      // Clean up the first sentence as title
      return (
        firstSentence
          .replace(/^(uh|um|so|well|okay|alright)/i, "")
          .trim()
          .replace(/[^\w\s]/g, "")
          .split(/\s+/)
          .slice(0, 8)
          .join(" ") || "KNOUX Recording"
      );
    }

    // Fallback: use top keywords
    return keywords.slice(0, 3).join(" ") || "KNOUX Recording";
  }

  static detectLanguage(text: string): string {
    if (!text || text.length < 10) return "unknown";

    // Simple language detection based on common words
    const englishWords = [
      "the",
      "and",
      "is",
      "in",
      "to",
      "of",
      "a",
      "that",
      "it",
      "with",
    ];
    const arabicWords = [
      "في",
      "من",
      "إلى",
      "على",
      "هذا",
      "التي",
      "أن",
      "كان",
      "لم",
      "أو",
    ];

    const words = text.toLowerCase().split(/\s+/);

    let englishScore = 0;
    let arabicScore = 0;

    words.forEach((word) => {
      if (englishWords.includes(word)) englishScore++;
      if (arabicWords.includes(word)) arabicScore++;
    });

    if (englishScore > arabicScore) return "en";
    if (arabicScore > englishScore) return "ar";

    // Check for Arabic characters
    const arabicPattern = /[\u0600-\u06FF]/;
    if (arabicPattern.test(text)) return "ar";

    return "en";
  }

  static analyzeSentiment(text: string): "positive" | "negative" | "neutral" {
    if (!text || text.length < 10) return "neutral";

    const positiveWords = new Set([
      "good",
      "great",
      "excellent",
      "amazing",
      "wonderful",
      "fantastic",
      "awesome",
      "love",
      "like",
      "enjoy",
      "happy",
      "pleased",
      "satisfied",
      "perfect",
      "success",
      "successful",
      "win",
      "victory",
      "achievement",
      "accomplish",
    ]);

    const negativeWords = new Set([
      "bad",
      "terrible",
      "awful",
      "horrible",
      "worst",
      "hate",
      "dislike",
      "angry",
      "frustrated",
      "disappointed",
      "sad",
      "fail",
      "failure",
      "problem",
      "issue",
      "error",
      "wrong",
      "difficult",
      "hard",
      "impossible",
    ]);

    const words = text.toLowerCase().split(/\s+/);

    let positiveScore = 0;
    let negativeScore = 0;

    words.forEach((word) => {
      if (positiveWords.has(word)) positiveScore++;
      if (negativeWords.has(word)) negativeScore++;
    });

    if (positiveScore > negativeScore) return "positive";
    if (negativeScore > positiveScore) return "negative";
    return "neutral";
  }
}

// Audio Analysis Engine
export class AudioAnalysisEngine {
  static analyzeAudioFeatures(audioBuffer: AudioBuffer): {
    volume: number;
    silence: number;
    speechRatio: number;
    quality: "poor" | "good" | "excellent";
  } {
    const data = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;

    // Calculate RMS (volume)
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    const rms = Math.sqrt(sum / data.length);
    const volume = Math.min(100, rms * 1000);

    // Detect silence periods
    const silenceThreshold = 0.01;
    let silentSamples = 0;
    for (let i = 0; i < data.length; i++) {
      if (Math.abs(data[i]) < silenceThreshold) {
        silentSamples++;
      }
    }
    const silence = (silentSamples / data.length) * 100;

    // Estimate speech ratio (very basic)
    const speechRatio = Math.max(0, 100 - silence - 20);

    // Determine quality
    let quality: "poor" | "good" | "excellent" = "poor";
    if (volume > 30 && silence < 70) quality = "good";
    if (volume > 50 && silence < 50 && speechRatio > 30) quality = "excellent";

    return { volume, silence, speechRatio, quality };
  }

  static detectSpeechSegments(
    audioBuffer: AudioBuffer,
  ): Array<{ start: number; end: number }> {
    const data = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const windowSize = Math.floor(sampleRate * 0.1); // 100ms windows

    const segments: Array<{ start: number; end: number }> = [];
    let currentSegmentStart: number | null = null;

    for (let i = 0; i < data.length; i += windowSize) {
      const window = data.slice(i, i + windowSize);
      let energy = 0;

      for (let j = 0; j < window.length; j++) {
        energy += window[j] * window[j];
      }

      const rms = Math.sqrt(energy / window.length);
      const isSpeech = rms > 0.02; // Threshold for speech detection

      const timePosition = i / sampleRate;

      if (isSpeech && currentSegmentStart === null) {
        currentSegmentStart = timePosition;
      } else if (!isSpeech && currentSegmentStart !== null) {
        segments.push({
          start: currentSegmentStart,
          end: timePosition,
        });
        currentSegmentStart = null;
      }
    }

    // Handle case where speech continues to the end
    if (currentSegmentStart !== null) {
      segments.push({
        start: currentSegmentStart,
        end: data.length / sampleRate,
      });
    }

    return segments;
  }
}

// Performance Monitoring
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  static startTimer(operation: string): string {
    const id = `${operation}_${Date.now()}_${Math.random()}`;
    const startTime = performance.now();

    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }

    // Store start time temporarily
    (globalThis as any)[`_timer_${id}`] = startTime;

    return id;
  }

  static endTimer(id: string): number {
    const startTime = (globalThis as any)[`_timer_${id}`];
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    delete (globalThis as any)[`_timer_${id}`];

    // Extract operation name from id
    const operation = id.split("_")[0];
    const metrics = this.metrics.get(operation);
    if (metrics) {
      metrics.push(duration);
      // Keep only last 50 measurements
      if (metrics.length > 50) {
        metrics.shift();
      }
    }

    return duration;
  }

  static getAverageTime(operation: string): number {
    const metrics = this.metrics.get(operation);
    if (!metrics || metrics.length === 0) return 0;

    return metrics.reduce((sum, time) => sum + time, 0) / metrics.length;
  }

  static getPerformanceReport(): Record<
    string,
    { average: number; count: number; total: number }
  > {
    const report: Record<
      string,
      { average: number; count: number; total: number }
    > = {};

    for (const [operation, times] of this.metrics.entries()) {
      const total = times.reduce((sum, time) => sum + time, 0);
      report[operation] = {
        average: times.length > 0 ? total / times.length : 0,
        count: times.length,
        total,
      };
    }

    return report;
  }
}

// Main AI Processing Interface
export interface AdvancedAIResult {
  title: string;
  summary: string;
  keywords: string[];
  language: string;
  sentiment: "positive" | "negative" | "neutral";
  audioAnalysis?: {
    volume: number;
    silence: number;
    speechRatio: number;
    quality: "poor" | "good" | "excellent";
    speechSegments: Array<{ start: number; end: number }>;
  };
  processingTime: number;
  confidence: number;
}

export async function processAdvancedTranscript(
  transcript: string,
  audioBuffer?: AudioBuffer,
): Promise<AdvancedAIResult> {
  const timerId = PerformanceMonitor.startTimer("advancedProcessing");

  // Simulate processing delay for realistic UX
  await new Promise((resolve) =>
    setTimeout(resolve, 500 + Math.random() * 1500),
  );

  if (!transcript || transcript.trim().length < 10) {
    const processingTime = PerformanceMonitor.endTimer(timerId);
    return {
      title: "Short KNOUX Recording",
      summary: "Recording too brief for comprehensive analysis.",
      keywords: ["short", "recording"],
      language: "unknown",
      sentiment: "neutral",
      processingTime,
      confidence: 0.1,
    };
  }

  // Text analysis
  const title = TextAnalysisEngine.generateTitle(transcript);
  const summary = TextAnalysisEngine.generateSummary(transcript);
  const keywords = TextAnalysisEngine.extractKeywords(transcript);
  const language = TextAnalysisEngine.detectLanguage(transcript);
  const sentiment = TextAnalysisEngine.analyzeSentiment(transcript);

  // Audio analysis (if available)
  let audioAnalysis;
  if (audioBuffer) {
    const features = AudioAnalysisEngine.analyzeAudioFeatures(audioBuffer);
    const speechSegments =
      AudioAnalysisEngine.detectSpeechSegments(audioBuffer);
    audioAnalysis = { ...features, speechSegments };
  }

  // Calculate confidence based on text length and audio quality
  let confidence = Math.min(0.9, transcript.length / 1000);
  if (audioAnalysis && audioAnalysis.quality === "excellent") {
    confidence = Math.min(0.95, confidence * 1.2);
  }

  const processingTime = PerformanceMonitor.endTimer(timerId);

  return {
    title: title || "KNOUX Recording",
    summary,
    keywords,
    language,
    sentiment,
    audioAnalysis,
    processingTime,
    confidence,
  };
}

// Initialize AI on module load
initializeAI().catch(console.error);
