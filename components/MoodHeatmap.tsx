"use client";

import { useEffect, useState } from "react";
import { MOOD_SCALE, type MoodEntry } from "@/types";

// Indigo intensity mapped to mood rating 1–5. Empty days use gray-100.
const RATING_COLOR: Record<number, string> = {
  1: "bg-emerald-100",
  2: "bg-emerald-200",
  3: "bg-emerald-400",
  4: "bg-emerald-600",
  5: "bg-emerald-800",
};

function getLast30Days(): string[] {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

export default function MoodHeatmap() {
  const [entryMap, setEntryMap] = useState<Record<string, MoodEntry>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/entries")
      .then((r) => r.json())
      .then((entries: MoodEntry[]) => {
        const map: Record<string, MoodEntry> = {};
        entries.forEach((e) => {
          map[e.entry_date] = e;
        });
        setEntryMap(map);
      })
      .finally(() => setLoading(false));
  }, []);

  const days = getLast30Days();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Last 30 Days
      </h2>

      {loading ? (
        <div className="flex h-20 items-center justify-center">
          <span className="turtle-spin text-2xl">🐢</span>
        </div>
      ) : (
        <>
          {/* 6-column grid → 5 rows × 6 columns = 30 cells */}
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
            {days.map((date) => {
              const entry = entryMap[date];
              const rating = entry?.mood_rating;
              const mood = MOOD_SCALE.find((m) => m.rating === rating);
              const color = rating ? RATING_COLOR[rating] : "bg-gray-100";

              // Human-readable date for tooltip
              const label = new Date(date + "T12:00:00").toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" }
              );
              const tooltip = entry
                ? `${label} · ${mood?.emoji} ${mood?.label} (${rating}/5)`
                : `${label} · No entry`;

              return (
                <div key={date} className="group relative">
                  <div
                    className={`h-8 w-full rounded-md transition-opacity hover:opacity-80 ${color}`}
                  />
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-xs text-white group-hover:block">
                    {tooltip}
                    {/* Arrow */}
                    <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="h-3 w-3 rounded-sm bg-gray-100" />
              <div className="h-3 w-3 rounded-sm bg-emerald-100" />
              <div className="h-3 w-3 rounded-sm bg-emerald-200" />
              <div className="h-3 w-3 rounded-sm bg-emerald-400" />
              <div className="h-3 w-3 rounded-sm bg-emerald-600" />
              <div className="h-3 w-3 rounded-sm bg-emerald-800" />
            </div>
            <span>More</span>
          </div>
        </>
      )}
    </div>
  );
}
