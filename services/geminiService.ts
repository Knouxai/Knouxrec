// Advanced Offline AI Service - KNOUX REC
import { processAdvancedTranscript, AdvancedAIResult } from "./offlineAI";

// Legacy interface for backward compatibility
interface AIProcessingResult {
  title: string;
  summary: string;
  keywords: string[];
}

// Main processing function with enhanced capabilities
export async function processTranscript(
  transcript: string,
  audioBuffer?: AudioBuffer,
): Promise<AIProcessingResult> {
  try {
    console.log("🧠 KNOUX AI: Starting advanced transcript processing...");

    const result: AdvancedAIResult = await processAdvancedTranscript(
      transcript,
      audioBuffer,
    );

    console.log(
      `🧠 KNOUX AI: Processing complete in ${result.processingTime.toFixed(2)}ms`,
    );
    console.log(
      `🧠 KNOUX AI: Confidence: ${(result.confidence * 100).toFixed(1)}%`,
    );
    console.log(
      `🧠 KNOUX AI: Language: ${result.language}, Sentiment: ${result.sentiment}`,
    );

    if (result.audioAnalysis) {
      console.log(
        `🧠 KNOUX AI: Audio quality: ${result.audioAnalysis.quality}`,
      );
      console.log(
        `🧠 KNOUX AI: Speech ratio: ${result.audioAnalysis.speechRatio.toFixed(1)}%`,
      );
    }

    // Return legacy format for compatibility
    return {
      title: result.title,
      summary: result.summary,
      keywords: result.keywords,
    };
  } catch (error) {
    console.error("🧠 KNOUX AI: Processing failed:", error);

    // Fallback to basic processing
    return {
      title: "KNOUX Recording",
      summary:
        "AI processing encountered an error, but your recording is safe.",
      keywords: ["recording", "knoux"],
    };
  }
}

// Enhanced processing function for advanced features
export async function processTranscriptAdvanced(
  transcript: string,
  audioBuffer?: AudioBuffer,
): Promise<AdvancedAIResult> {
  return processAdvancedTranscript(transcript, audioBuffer);
}

// Batch processing for multiple recordings
export async function batchProcessTranscripts(
  transcripts: Array<{
    id: string;
    transcript: string;
    audioBuffer?: AudioBuffer;
  }>,
): Promise<Array<{ id: string; result: AIProcessingResult }>> {
  console.log(
    `🧠 KNOUX AI: Starting batch processing of ${transcripts.length} recordings...`,
  );

  const results = [];

  for (const item of transcripts) {
    try {
      const result = await processTranscript(item.transcript, item.audioBuffer);
      results.push({ id: item.id, result });

      // Small delay between processing to avoid blocking UI
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`🧠 KNOUX AI: Failed to process ${item.id}:`, error);
      results.push({
        id: item.id,
        result: {
          title: "Processing Failed",
          summary: "Could not process this recording.",
          keywords: ["error"],
        },
      });
    }
  }

  console.log(`🧠 KNOUX AI: Batch processing complete`);
  return results;
}

// Real-time transcript analysis (for live processing)
export class LiveTranscriptProcessor {
  private buffer: string = "";
  private lastProcessTime: number = 0;
  private readonly PROCESS_INTERVAL = 5000; // Process every 5 seconds

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
      console.log("🧠 KNOUX AI: Live processing result:", result.title);

      // Emit event for live updates
      window.dispatchEvent(
        new CustomEvent("liveTranscriptProcessed", {
          detail: result,
        }),
      );
    } catch (error) {
      console.error("🧠 KNOUX AI: Live processing error:", error);
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

// Export convenience functions
export const createLiveProcessor = () => new LiveTranscriptProcessor();

// AI Model Status
export function getAIStatus(): {
  ready: boolean;
  features: string[];
  performance: "high" | "medium" | "low";
} {
  return {
    ready: true,
    features: [
      "Speech Analysis",
      "Keyword Extraction",
      "Smart Summarization",
      "Language Detection",
      "Sentiment Analysis",
      "Audio Quality Analysis",
      "Real-time Processing",
    ],
    performance: "high",
  };
}
