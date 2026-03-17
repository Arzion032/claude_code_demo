"use client";

import { useCallback, useEffect, useState } from "react";

export default function WeeklySummary() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError("");

    const res = await fetch("/api/summary/weekly");
    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Failed to load summary.");
    } else {
      setSummary(json.summary);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Weekly Summary</h2>
        <button
          onClick={fetchSummary}
          disabled={loading}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {loading ? "Generating…" : "Regenerate"}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          Asking Gemini for your weekly recap…
        </div>
      ) : error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : (
        <p className="text-sm leading-relaxed text-gray-700">{summary}</p>
      )}
    </div>
  );
}
