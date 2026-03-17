import { GoogleGenerativeAI } from "@google/generative-ai";
import type { MoodEntry, SentimentLabel } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export interface SentimentResult {
  label: SentimentLabel;
  score: number;
}

const FALLBACK: SentimentResult = { label: "neutral", score: 0.5 };

function isTooShort(note: string): boolean {
  return note.trim().split(/\s+/).filter(Boolean).length < 3;
}

export async function analyzeSentiment(
  note: string | null | undefined
): Promise<SentimentResult> {
  if (!note || isTooShort(note)) return FALLBACK;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a sentiment analysis assistant. Analyze the following mood journal entry and return ONLY a JSON object with two fields:
- "label": one of "positive", "neutral", or "negative"
- "score": a confidence float between 0.0 and 1.0

Entry: "${note}"

Respond with only the JSON. No explanation. No markdown.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if the model returns them despite instructions
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(cleaned);

    if (
      typeof parsed.label === "string" &&
      ["positive", "neutral", "negative"].includes(parsed.label) &&
      typeof parsed.score === "number" &&
      parsed.score >= 0 &&
      parsed.score <= 1
    ) {
      return { label: parsed.label as SentimentLabel, score: parsed.score };
    }

    return FALLBACK;
  } catch {
    return FALLBACK;
  }
}

export async function generateWeeklySummary(
  entries: MoodEntry[]
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const entriesJson = JSON.stringify(
    entries.map((e) => ({
      date: e.entry_date,
      mood_rating: e.mood_rating,
      note: e.note,
      sentiment: e.sentiment_label,
    })),
    null,
    2
  );

  const prompt = `You are a supportive wellness assistant. The user logged these mood entries in the past 7 days:

${entriesJson}

Write a warm, encouraging 3–4 sentence summary of their week. Mention the overall mood trend, dominant emotional tone, and any themes from their notes. Be supportive and non-judgmental. Speak directly using "you."`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
