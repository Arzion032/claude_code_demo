import { MOOD_SCALE, type MoodEntry, type SentimentLabel } from "@/types";

const SENTIMENT_BADGE: Record<SentimentLabel, string> = {
  positive: "bg-green-100 text-green-700",
  neutral: "bg-gray-100 text-gray-600",
  negative: "bg-red-100 text-red-700",
};

interface EntryCardProps {
  entry: MoodEntry;
}

export default function EntryCard({ entry }: EntryCardProps) {
  const mood = MOOD_SCALE.find((m) => m.rating === entry.mood_rating);

  // Parse date as local noon to avoid off-by-one from UTC conversion
  const formattedDate = new Date(
    entry.entry_date + "T12:00:00"
  ).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400">{formattedDate}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl">{mood?.emoji}</span>
            <span className="font-semibold text-gray-900">{mood?.label}</span>
            <span className="text-sm text-gray-400">{entry.mood_rating}/5</span>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
            SENTIMENT_BADGE[entry.sentiment_label]
          }`}
        >
          {entry.sentiment_label}
        </span>
      </div>

      {entry.note && (
        <p className="mt-3 border-t border-gray-100 pt-3 text-sm leading-relaxed text-gray-600">
          {entry.note}
        </p>
      )}
    </div>
  );
}
