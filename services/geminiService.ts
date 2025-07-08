
import { GoogleGenAI } from "@google/genai";

// This assumes the API_KEY is set in the execution environment.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Google GenAI is not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

interface AIProcessingResult {
  title: string;
  summary: string;
  keywords: string[];
}

export async function processTranscript(transcript: string): Promise<AIProcessingResult> {
    if (!API_KEY) {
        throw new Error("API key is not configured.");
    }
  if (!transcript || transcript.trim().length < 10) {
    // If transcript is too short, return a default
    return {
      title: 'Short Recording',
      summary: 'Not enough audio data to generate a summary.',
      keywords: [],
    };
  }

  const prompt = `
    Analyze the following transcript from a screen recording. Based on the content, provide:
    1.  A concise and descriptive title for the recording (max 10 words).
    2.  A brief summary of the main points (2-3 sentences).
    3.  A list of 3 to 5 relevant keywords or topics.

    Transcript:
    "${transcript}"

    Provide the output in a clean JSON format like this:
    {
      "title": "...",
      "summary": "...",
      "keywords": ["...", "...", "..."]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr) as AIProcessingResult;
    // Basic validation
    if (parsedData.title && parsedData.summary && Array.isArray(parsedData.keywords)) {
        return parsedData;
    } else {
        throw new Error("AI response did not match the expected format.");
    }

  } catch (error) {
    console.error("Error processing transcript with Gemini API:", error);
    throw new Error("Failed to analyze recording with AI.");
  }
}
