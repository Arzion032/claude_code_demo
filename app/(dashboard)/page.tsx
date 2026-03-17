import { createClient } from "@/lib/supabase/server";
import MoodForm from "@/components/MoodForm";
import MoodHeatmap from "@/components/MoodHeatmap";
import WordCloud from "@/components/WordCloud";
import WeeklySummary from "@/components/WeeklySummary";
import type { MoodEntry } from "@/types";

export default async function DashboardPage() {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("entry_date", today)
    .maybeSingle();

  const todayEntry = (data as MoodEntry | null) ?? null;

  return (
    <div className="space-y-8">
      {/* Row 1 — primary action: log today's mood */}
      <MoodForm initialEntry={todayEntry} />

      {/* Row 2 — heatmap (wider) + weekly summary (narrower) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MoodHeatmap />
        </div>
        <WeeklySummary />
      </div>

      {/* Row 3 — word cloud: full width so layout algorithm has max space */}
      <WordCloud />
    </div>
  );
}
