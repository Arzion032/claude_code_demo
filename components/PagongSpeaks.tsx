"use client";

import { useCallback, useState } from "react";
import type { PagongSpeaksResult } from "@/lib/gemini";

type State = "idle" | "loading" | "done" | "error";

const CARDS: { key: keyof PagongSpeaksResult; icon: string; title: string; color: string }[] = [
  { key: "pagong_says", icon: "🐢", title: "Pagong Says",  color: "border-emerald-200 bg-emerald-50" },
  { key: "watch_this",  icon: "🎬", title: "Watch This",   color: "border-teal-200 bg-teal-50" },
  { key: "read_this",   icon: "📚", title: "Read This",    color: "border-amber-200 bg-amber-50" },
  { key: "eat_this",    icon: "🍜", title: "Eat This",     color: "border-orange-200 bg-orange-50" },
  { key: "play_this",   icon: "🎮", title: "Play This",    color: "border-lime-200 bg-lime-50" },
  { key: "try_this",    icon: "🧘", title: "Try This",     color: "border-teal-200 bg-teal-50" },
];

export default function PagongSpeaks() {
  const [state, setState] = useState<State>("idle");
  const [data, setData] = useState<PagongSpeaksResult | null>(null);
  const [error, setError] = useState("");

  const fetchSpeaks = useCallback(async () => {
    setState("loading");
    setError("");

    try {
      const res = await fetch("/api/pagong/speaks");
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Something went wrong.");
        setState("error");
      } else {
        setData(json as PagongSpeaksResult);
        setState("done");
      }
    } catch {
      setError("Network error — check your connection.");
      setState("error");
    }
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          🐢 Pagong Speaks
        </h2>
        {state === "done" && (
          <button
            onClick={fetchSpeaks}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Ask Again
          </button>
        )}
      </div>

      {state === "idle" ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <p className="text-5xl">🐢</p>
          <p className="max-w-sm text-sm text-gray-500">
            Pagong is ready to share some wisdom, recommendations, and a pep talk based on your recent moods.
          </p>
          <button
            onClick={fetchSpeaks}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Ask Pagong 🐢
          </button>
        </div>
      ) : state === "loading" ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="turtle-spin text-4xl">🐢</span>
          <p className="text-sm text-gray-400">
            Pagong is thinking…
          </p>
        </div>
      ) : state === "error" ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <p className="text-3xl">😅</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={fetchSpeaks}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Try Again
          </button>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map(({ key, icon, title, color }) => (
            <div
              key={key}
              className={`rounded-xl border p-4 ${color}`}
            >
              <p className="mb-1.5 text-sm font-semibold text-gray-800">
                {icon} {title}
              </p>
              <p className="text-sm leading-relaxed text-gray-700">
                {data[key]}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
