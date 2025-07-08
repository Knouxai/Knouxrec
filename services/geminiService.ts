// Offline AI Service - No external dependencies
interface AIProcessingResult {
  title: string;
  summary: string;
  keywords: string[];
}

// Simple offline keyword extraction
function extractKeywords(text: string): string[] {
  const commonWords = new Set([
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
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !commonWords.has(word));

  const wordCount = new Map<string, number>();
  words.forEach((word) => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });

  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

// Simple offline title generation
function generateTitle(text: string): string {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  if (sentences.length === 0) return "KNOUX Recording";

  const firstSentence = sentences[0].trim();
  const words = firstSentence.split(/\s+/).slice(0, 6);
  return words.join(" ").replace(/[^\w\s]/g, "") || "KNOUX Recording";
}

// Simple offline summary generation
function generateSummary(text: string): string {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  if (sentences.length === 0) return "No speech detected in recording.";

  const summary = sentences
    .slice(0, 2)
    .map((s) => s.trim())
    .join(". ");
  return summary + (summary.endsWith(".") ? "" : ".");
}

export async function processTranscript(
  transcript: string,
): Promise<AIProcessingResult> {
  // Simulate processing delay for realistic feel
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 2000),
  );

  if (!transcript || transcript.trim().length < 10) {
    return {
      title: "Short KNOUX Recording",
      summary: "Recording too short for meaningful analysis.",
      keywords: ["short", "recording"],
    };
  }

  const title = generateTitle(transcript);
  const summary = generateSummary(transcript);
  const keywords = extractKeywords(transcript);

  return {
    title: title || "KNOUX Recording",
    summary,
    keywords,
  };
}
