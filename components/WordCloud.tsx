"use client";

import { useEffect, useRef, useState } from "react";
import { Wordcloud } from "@visx/wordcloud";
import { Text } from "@visx/text";
import type { MoodEntry } from "@/types";

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
    .slice(0, 80);
}

// Indigo palette matching the app accent
const COLORS = ["#064e3b", "#047857", "#059669", "#10b981", "#6ee7b7"];
const CLOUD_HEIGHT = 160;
const FONT_FAMILY = "ui-sans-serif, system-ui, sans-serif";

export default function WordCloud() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cloudWidth, setCloudWidth] = useState(0);
  const [words, setWords] = useState<Word[]>([]);
  const [entryCount, setEntryCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Measure container width once mounted so the SVG fills it exactly
  useEffect(() => {
    if (containerRef.current) {
      setCloudWidth(containerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    fetch("/api/entries")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: unknown) => {
        if (!Array.isArray(data)) {
          console.error("[WordCloud] /api/entries returned non-array:", data);
          return;
        }
        const entries = data as MoodEntry[];
        setEntryCount(entries.length);
        if (entries.length >= 5) {
          setWords(buildWordFrequency(entries));
        }
      })
      .catch((err) => console.error("[WordCloud] fetch failed:", err))
      .finally(() => setLoading(false));
  }, []);

  // Linear font scale: min frequency → 14px, max frequency → 52px
  const minVal = words.length ? Math.min(...words.map((w) => w.value)) : 1;
  const maxVal = words.length ? Math.max(...words.map((w) => w.value)) : 1;
  const fontScale = (value: number) =>
    minVal === maxVal ? 28 : 14 + ((value - minVal) / (maxVal - minVal)) * 38;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Word Cloud</h2>

      {/* Always-rendered zero-height div — gives containerRef a stable DOM node
          so offsetWidth is correct on mount regardless of which branch renders */}
      <div ref={containerRef} className="w-full" style={{ height: 0 }} />

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <span className="turtle-spin text-3xl">🐢</span>
        </div>
      ) : entryCount !== null && entryCount < 5 ? (
        <div className="flex h-32 flex-col items-center justify-center gap-2 text-center">
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
        <div className="flex h-32 items-center justify-center">
          <p className="text-sm text-gray-500">
            No words to display yet — try adding some notes!
          </p>
        </div>
      ) : (
        <div style={{ height: CLOUD_HEIGHT }}>
          {cloudWidth > 0 && (
            <Wordcloud
              words={words}
              width={cloudWidth}
              height={CLOUD_HEIGHT}
              fontSize={(w) => fontScale(w.value)}
              font={FONT_FAMILY}
              padding={3}
              spiral="archimedean"
              rotate={0}
              random={() => 0.5}
            >
              {(cloudWords) => (
                <g>
                  {cloudWords.map((w, i) => (
                    <Text
                      key={w.text}
                      fill={COLORS[i % COLORS.length]}
                      textAnchor="middle"
                      transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                      fontSize={w.size}
                      fontFamily={w.font}
                    >
                      {w.text}
                    </Text>
                  ))}
                </g>
              )}
            </Wordcloud>
          )}
        </div>
      )}
    </div>
  );
}
