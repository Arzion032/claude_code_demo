import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeSentiment } from "@/lib/gemini";

export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { mood_rating, note } = body;

  if (
    typeof mood_rating !== "number" ||
    mood_rating < 1 ||
    mood_rating > 5
  ) {
    return NextResponse.json(
      { error: "mood_rating must be an integer between 1 and 5" },
      { status: 400 }
    );
  }

  const { label, score } = await analyzeSentiment(note);

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("mood_entries")
    .insert({
      user_id: user.id,
      entry_date: today,
      mood_rating,
      note: note?.trim() || null,
      sentiment_label: label,
      sentiment_score: score,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
