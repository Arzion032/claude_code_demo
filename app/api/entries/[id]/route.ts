import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeSentiment } from "@/lib/gemini";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

  const { data, error } = await supabase
    .from("mood_entries")
    .update({
      mood_rating,
      note: note?.trim() || null,
      sentiment_label: label,
      sentiment_score: score,
    })
    .eq("id", params.id)
    .eq("user_id", user.id) // ownership guard — never update another user's entry
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
