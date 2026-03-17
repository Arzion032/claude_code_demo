import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWeeklySummary } from "@/lib/gemini";
import type { MoodEntry } from "@/types";

const NOT_ENOUGH_MESSAGE =
  "Log at least 3 moods this week to get your summary.";

export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // inclusive of today = 7 days
  const since = sevenDaysAgo.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("user_id", user.id)
    .gte("entry_date", since)
    .order("entry_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const entries = (data as MoodEntry[]) ?? [];

  if (entries.length < 3) {
    return NextResponse.json({ summary: NOT_ENOUGH_MESSAGE });
  }

  try {
    const summary = await generateWeeklySummary(entries);
    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate summary. Please try again." },
      { status: 500 }
    );
  }
}
