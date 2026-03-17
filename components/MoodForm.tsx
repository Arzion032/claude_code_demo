"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MOOD_SCALE, type MoodEntry } from "@/types";

const MAX_NOTE_LENGTH = 280;

interface MoodFormProps {
  initialEntry?: MoodEntry | null;
}

export default function MoodForm({ initialEntry = null }: MoodFormProps) {
  const router = useRouter();

  // Track saved entry so POST → PUT works without a full page reload
  const [entry, setEntry] = useState<MoodEntry | null>(initialEntry);
  const [moodRating, setMoodRating] = useState<number>(
    initialEntry?.mood_rating ?? 3
  );
  const [note, setNote] = useState(initialEntry?.note ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const isEditMode = entry !== null;
  const charsLeft = MAX_NOTE_LENGTH - note.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setLoading(true);

    const payload = { mood_rating: moodRating, note: note.trim() || null };

    const res = isEditMode
      ? await fetch(`/api/entries/${entry.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    setEntry(json);
    setSaved(true);
    setLoading(false);
    router.refresh(); // re-run server components (heatmap, word cloud, etc.)
  }

  const selectedMood = MOOD_SCALE.find((m) => m.rating === moodRating);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {isEditMode ? "Edit today's mood" : "How are you feeling today?"}
        </h2>
        {isEditMode && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
            Editing
          </span>
        )}
      </div>
      <p className="mb-5 text-sm text-gray-400">
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Mood selector */}
        <div>
          <p className="mb-3 text-sm font-medium text-gray-700">Mood rating</p>
          <div className="flex gap-2">
            {MOOD_SCALE.map(({ rating, emoji, label }) => (
              <button
                key={rating}
                type="button"
                onClick={() => setMoodRating(rating)}
                className={`flex flex-1 flex-col items-center rounded-xl border-2 py-3 transition-all ${
                  moodRating === rating
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span className="text-2xl">{emoji}</span>
                <span
                  className={`mt-1 hidden text-xs font-medium sm:block ${
                    moodRating === rating ? "text-emerald-600" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
          {selectedMood && (
            <p className="mt-2 text-center text-sm text-gray-500">
              {selectedMood.emoji} {selectedMood.label}
            </p>
          )}
        </div>

        {/* Note textarea */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label
              htmlFor="note"
              className="text-sm font-medium text-gray-700"
            >
              Note{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <span
              className={`text-xs ${
                charsLeft < 20 ? "text-red-500" : "text-gray-400"
              }`}
            >
              {charsLeft} left
            </span>
          </div>
          <textarea
            id="note"
            rows={7}
            maxLength={MAX_NOTE_LENGTH}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {saved && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            Saved! Sentiment:{" "}
            <span className="font-medium capitalize">{entry?.sentiment_label}</span>{" "}
            ({((entry?.sentiment_score ?? 0) * 100).toFixed(0)}% confidence)
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="turtle-spin text-base">🐢</span> Saving…
            </span>
          ) : isEditMode ? "Update entry" : "Save entry"}
        </button>
      </form>
    </div>
  );
}
