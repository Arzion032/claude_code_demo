import { createClient } from "@/lib/supabase/server";
import MoodForm from "@/components/MoodForm";
import MoodHeatmap from "@/components/MoodHeatmap";
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
      <MoodForm initialEntry={todayEntry} />
      <MoodHeatmap />
    </div>
  );
}
