"use client";

import { useCallback, useState } from "react";

type State = "idle" | "loading" | "done" | "error";

export default function WeeklySummary() {
  const [state, setState] = useState<State>("idle");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  const fetchSummary = useCallback(async () => {
    setState("loading");
    setError("");

    const res = await fetch("/api/summary/weekly");
    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Failed to load summary.");
      setState("error");
    } else {
      setSummary(json.summary);
      setState("done");
    }
  }, []);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Weekly Summary</h2>
        {state === "done" && (
          <button
            onClick={fetchSummary}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Regenerate
          </button>
        )}
      </div>

      {state === "idle" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-4 text-center">
          <p className="text-3xl">✨</p>
          <p className="text-sm text-gray-500">
            Ready to generate your weekly summary.
          </p>
          <button
            onClick={fetchSummary}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Generate Summary
          </button>
        </div>
      ) : state === "loading" ? (
        <div className="flex flex-1 items-center gap-3 text-sm text-gray-400">
          <span className="turtle-spin text-xl">🐢</span>
          Asking Gemini for your weekly recap…
        </div>
      ) : state === "error" ? (
        <div className="flex flex-1 flex-col gap-3">
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
          <button
            onClick={fetchSummary}
            className="self-start rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-gray-700">{summary}</p>
      )}
    </div>
  );
}
