-- ============================================================
-- Pagong — Kwento Mo Sa'ken: Database Schema
-- Paste this into the Supabase SQL Editor and run it.
-- ============================================================

-- 1. Create the mood_entries table
create table if not exists public.mood_entries (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  entry_date       date not null,
  mood_rating      integer not null check (mood_rating between 1 and 5),
  note             text check (char_length(note) <= 280),
  sentiment_label  text not null default 'neutral' check (sentiment_label in ('positive', 'neutral', 'negative')),
  sentiment_score  float not null default 0.5 check (sentiment_score between 0.0 and 1.0),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint mood_entries_user_date_unique unique (user_id, entry_date)
);

-- 2. Auto-update updated_at on row changes
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger mood_entries_updated_at
  before update on public.mood_entries
  for each row execute procedure public.handle_updated_at();

-- 3. Enable Row Level Security
alter table public.mood_entries enable row level security;

-- 4. RLS Policies — all operations scoped to the authenticated user
create policy "Users can view their own entries"
  on public.mood_entries
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own entries"
  on public.mood_entries
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own entries"
  on public.mood_entries
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own entries"
  on public.mood_entries
  for delete
  using (auth.uid() = user_id);
