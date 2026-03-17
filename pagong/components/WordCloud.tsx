"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { MoodEntry } from "@/types";

// react-wordcloud uses ResizeObserver and SVG APIs — must skip SSR
const ReactWordcloud = dynamic(() => import("react-wordcloud"), { ssr: false });

interface Word {
  text: string;
  value: number;
}

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "it", "its", "was", "are", "were",
  "be", "been", "being", "have", "has", "had", "do", "does", "did",
  "will", "would", "could", "should", "may", "might", "shall", "can",
  "i", "me", "my", "we", "our", "you", "your", "he", "she", "they",
  "his", "her", "their", "this", "that", "these", "those", "so", "if",
  "not", "no", "just", "very", "really", "felt", "feel", "feeling",
  "today", "day", "week", "time", "got", "get", "went", "go", "going",
  "am", "as", "up", "out", "about", "also", "than", "then", "when",
  "what", "which", "who", "how", "all", "one", "some", "like", "into",
  "there", "here", "s", "t", "re", "ve", "ll", "d", "m",
]);

function buildWordFrequency(entries: MoodEntry[]): Word[] {
  const freq: Record<string, number> = {};

  entries.forEach((entry) => {
    if (!entry.note) return;
    // Lowercase, strip punctuation, split on whitespace
    const words = entry.note
      .toLowerCase()
      .replace(/[^a-z\s']/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

    words.forEach((w) => {
      freq[w] = (freq[w] ?? 0) + 1;
    });
  });

  return Object.entries(freq)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 80); // cap at 80 words for readability
}

const WORDCLOUD_OPTIONS = {
  rotations: 0,
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  fontSizes: [14, 52] as [number, number],
  padding: 3,
  deterministic: true,
};

export default function WordCloud() {
  const [words, setWords] = useState<Word[]>([]);
  const [entryCount, setEntryCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/entries")
      .then((r) => r.json())
      .then((entries: MoodEntry[]) => {
        setEntryCount(entries.length);
        if (entries.length >= 5) {
          setWords(buildWordFrequency(entries));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Word Cloud</h2>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      ) : entryCount !== null && entryCount < 5 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
          <p className="text-2xl">💬</p>
          <p className="text-sm text-gray-500">
            Log at least <span className="font-medium">5 entries</span> to see
            your word cloud.
          </p>
          <p className="text-xs text-gray-400">
            {entryCount} / 5 entries logged so far
          </p>
        </div>
      ) : words.length === 0 ? (
        <div className="flex h-40 items-center justify-center">
          <p className="text-sm text-gray-500">
            No words to display yet — try adding some notes!
          </p>
        </div>
      ) : (
        <div className="h-56 w-full">
          <ReactWordcloud words={words} options={WORDCLOUD_OPTIONS} />
        </div>
      )}
    </div>
  );
}
