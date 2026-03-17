import { createClient } from "@/lib/supabase/server";
import MoodForm from "@/components/MoodForm";
import MoodHeatmap from "@/components/MoodHeatmap";
import WordCloud from "@/components/WordCloud";
import PagongSpeaks from "@/components/PagongSpeaks";
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
    <div className="space-y-6">
      {/* Row 1 — Mood form (primary action) + Heatmap (context) side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <MoodForm initialEntry={todayEntry} />
        </div>
        <div className="lg:col-span-3">
          <div className="grid h-full grid-rows-[1fr] gap-6">
            <MoodHeatmap />
            <WordCloud />
          </div>
        </div>
      </div>

      {/* Row 2 — Pagong Speaks: the main feature, full width */}
      <PagongSpeaks />
    </div>
  );
}
