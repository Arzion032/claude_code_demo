# CLAUDE.md — Pagong: Kwento Mo Sa'ken

## Project Name & Purpose
**Pagong — Kwento Mo Sa'ken** is a daily mood tracker web app. Users log a mood rating (1–5) and a short note each day. The app runs sentiment analysis on each entry and surfaces trends via a calendar heatmap, word cloud, and an AI-generated weekly summary.

---

## Tech Stack

| Layer       | Choice                          |
|-------------|---------------------------------|
| Framework   | Next.js 14 (App Router)         |
| Language    | TypeScript                      |
| Styling     | Tailwind CSS                    |
| Database    | Supabase (PostgreSQL + Auth)    |
| AI / Sentiment | Google Gemini (`@google/generative-ai`) |
| AI Model    | `gemini-2.0-flash`              |
| Charts      | Recharts                        |
| Word Cloud  | react-wordcloud                 |
| Deployment  | Vercel                          |

---

## AI Model & Prompts

**Model:** `gemini-2.0-flash` (via Google AI Studio — free tier)

### Sentiment Analysis Prompt
Called on every mood entry save. Expects a JSON-only response.

```
You are a sentiment analysis assistant. Analyze the following mood journal entry and return ONLY a JSON object with two fields:
- "label": one of "positive", "neutral", or "negative"
- "score": a confidence float between 0.0 and 1.0

Entry: "{note_text}"

Respond with only the JSON. No explanation. No markdown.
```

**Fallback:** If note is empty or under 3 words, or if the API call fails, store `neutral` / `0.5` and continue — never block the save.

### Weekly Summary Prompt
Called on dashboard load (no caching). Expects a plain-English paragraph.

```
You are a supportive wellness assistant. The user logged these mood entries in the past 7 days:

{entries_json}

Write a warm, encouraging 3–4 sentence summary of their week. Mention the overall mood trend, dominant emotional tone, and any themes from their notes. Be supportive and non-judgmental. Speak directly using "you."
```

**Condition:** Only call if the user has ≥ 3 entries in the last 7 days. Otherwise show: `"Log at least 3 moods this week to get your summary."`

---

## Data Model

### Table: `mood_entries`

| Column           | Type      | Notes                          |
|------------------|-----------|--------------------------------|
| `id`             | uuid      | Primary key                    |
| `user_id`        | uuid      | FK to `auth.users`             |
| `entry_date`     | date      | Unique per user per day        |
| `mood_rating`    | integer   | 1–5                            |
| `note`           | text      | Max 280 chars, nullable        |
| `sentiment_label`| text      | `positive`, `neutral`, `negative` |
| `sentiment_score`| float     | 0.0–1.0                        |
| `created_at`     | timestamp |                                |
| `updated_at`     | timestamp |                                |

**Constraint:** `UNIQUE(user_id, entry_date)`

RLS must be enabled with policies scoped to `auth.uid()`.

---

## API Routes

| Method | Route                   | Description                              |
|--------|-------------------------|------------------------------------------|
| GET    | `/api/entries`          | Fetch all entries for the logged-in user |
| POST   | `/api/entries`          | Create a mood entry, run sentiment       |
| PUT    | `/api/entries/[id]`     | Update today's entry, re-run sentiment   |
| GET    | `/api/summary/weekly`   | Generate and return a weekly summary     |

All routes validate the Supabase session server-side. Return 401 for unauthenticated requests.

---

## Pages & Navigation

| Route    | Page       | Description                                        |
|----------|------------|----------------------------------------------------|
| `/`      | Dashboard  | Today's form + heatmap + word cloud + weekly summary |
| `/log`   | Entry Log  | Full scrollable history of all entries             |
| `/login` | Login      | Email/password sign-in                             |
| `/signup`| Sign Up    | Registration form                                  |

Navbar: Dashboard link | Log link | Logout button

---

## Mood Scale

| Rating | Emoji | Label |
|--------|-------|-------|
| 1      | 😞    | Rough |
| 2      | 😕    | Low   |
| 3      | 😐    | Okay  |
| 4      | 🙂    | Good  |
| 5      | 😄    | Great |

---

## Sentiment Badge Colors
- `positive` → green
- `neutral` → gray
- `negative` → red

---

## Environment Variables

| Variable                        | Scope       |
|---------------------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL`      | Public      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public      |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server only |
| `GOOGLE_AI_API_KEY`             | Server only |

---

## Coding Conventions

- **App Router only** — no `pages/` directory
- **Server Components by default** — use `"use client"` only when needed (event handlers, hooks, browser APIs)
- **Supabase clients:** `lib/supabase/client.ts` for Client Components, `lib/supabase/server.ts` for Server Components and API routes
- **Auth:** All API routes validate session server-side; middleware redirects unauthenticated users to `/login`
- **Error handling:** Inline error messages only — no `alert()`. AI failures degrade gracefully (fallback values, never block save)
- **Styling:** Tailwind utility classes only — no CSS modules, no inline styles
- **One entry per day:** If today's entry exists, load in edit mode (PUT); otherwise create (POST)
- **Past entries are read-only**
- **No pagination** — simple scroll for entry history
- **No caching** for weekly summary — regenerate on every load

---

## Out of Scope (v1.0)
- Password reset / email verification
- Summary caching
- Dark mode
- Notifications or reminders
- Export / sharing
