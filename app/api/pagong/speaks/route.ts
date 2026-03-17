import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePagongSpeaks } from "@/lib/gemini";
import type { MoodEntry } from "@/types";

export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
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
    return NextResponse.json({
      error: "Log at least 3 moods this week so Pagong has something to work with! 🐢",
    }, { status: 400 });
  }

  try {
    const speaks = await generatePagongSpeaks(entries);
    return NextResponse.json(speaks);
  } catch {
    return NextResponse.json(
      { error: "Pagong got tongue-tied. Try again in a moment!" },
      { status: 500 }
    );
  }
}
