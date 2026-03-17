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

export interface PagongSpeaksResult {
  pagong_says: string;
  watch_this: string;
  read_this: string;
  eat_this: string;
  play_this: string;
  try_this: string;
}

const PAGONG_SPEAKS_FALLBACK: PagongSpeaksResult = {
  pagong_says: "Hey there, friend! Pagong's shell is a little glitchy right now — but remember, even slow turtles keep moving forward. You're doing great!",
  watch_this: "Studio Ghibli's My Neighbor Totoro — warm, gentle, and guaranteed to make you smile.",
  read_this: "The Boy, the Mole, the Fox and the Horse by Charlie Mackesy — short, beautiful, and full of kindness.",
  eat_this: "A warm bowl of arroz caldo — comfort food for the soul.",
  play_this: "Stardew Valley — peaceful farming, no pressure, just vibes.",
  try_this: "Take a slow walk outside. No destination, no timer. Just you and the sky.",
};

export async function generatePagongSpeaks(
  entries: MoodEntry[]
): Promise<PagongSpeaksResult> {
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

  const prompt = `You are Pagong, a wise, warm, and slightly goofy turtle who genuinely cares about the user. You speak directly to them — casual, witty, heartfelt, sometimes funny. You are NOT a dry wellness assistant. You are their turtle friend.

The user logged these mood entries recently:

${entriesJson}

Based on their mood trend, emotional tone, and note themes, respond with ONLY a JSON object containing these six keys. Each value should be 1–3 sentences, written in character as Pagong the turtle. Be specific to their actual mood — reference their entries where possible. Include Filipino cultural touches where fitting.

{
  "pagong_says": "A personalized pep talk from Pagong based on their week. Warm, direct, and encouraging. Mention specific things from their notes if possible.",
  "watch_this": "A specific movie or TV show recommendation matching their current emotional state. Include the title and a short reason why.",
  "read_this": "A specific book recommendation based on how they've been feeling. Include the title and author and a reason.",
  "eat_this": "A specific food recommendation that fits the mood. Favor Filipino comfort food where appropriate (arroz caldo, champorado, sinigang, etc.) but any cuisine is fine. Include why it fits.",
  "play_this": "A specific game or game genre recommendation based on their emotional state. Can be video game, board game, or mobile game. Include why.",
  "try_this": "A specific activity suggestion — a walk, journaling, calling a friend, a nap, stretching, etc. Make it actionable and specific to their mood."
}

Respond with ONLY the JSON object. No explanation. No markdown fences.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(cleaned);

    // Validate all six keys exist and are strings
    const keys: (keyof PagongSpeaksResult)[] = [
      "pagong_says", "watch_this", "read_this",
      "eat_this", "play_this", "try_this",
    ];
    for (const key of keys) {
      if (typeof parsed[key] !== "string" || !parsed[key].trim()) {
        return PAGONG_SPEAKS_FALLBACK;
      }
    }

    return parsed as PagongSpeaksResult;
  } catch {
    return PAGONG_SPEAKS_FALLBACK;
  }
}
