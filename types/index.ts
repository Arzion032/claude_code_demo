export type SentimentLabel = "positive" | "neutral" | "negative";

export interface MoodEntry {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  mood_rating: number; // 1–5
  note: string | null;
  sentiment_label: SentimentLabel;
  sentiment_score: number;
  created_at: string;
  updated_at: string;
}

export const MOOD_SCALE = [
  { rating: 1, emoji: "😞", label: "Rough" },
  { rating: 2, emoji: "😕", label: "Low" },
  { rating: 3, emoji: "😐", label: "Okay" },
  { rating: 4, emoji: "🙂", label: "Good" },
  { rating: 5, emoji: "😄", label: "Great" },
] as const;
