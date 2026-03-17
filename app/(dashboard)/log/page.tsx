import { createClient } from "@/lib/supabase/server";
import EntryCard from "@/components/EntryCard";
import type { MoodEntry } from "@/types";

export default async function LogPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("mood_entries")
    .select("*")
    .order("entry_date", { ascending: false });

  const entries = (data as MoodEntry[]) ?? [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Mood Log</h1>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center">
          <p className="text-3xl">📓</p>
          <p className="mt-3 text-sm text-gray-500">
            No entries yet. Log your first mood on the{" "}
            <a href="/" className="font-medium text-emerald-600 hover:underline">
              dashboard
            </a>
            !
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
