# 🐢 Pagong — Kwento Mo Sa'ken

A daily mood tracker with AI-powered sentiment analysis and personalized recommendations. Log your mood each day, watch your patterns emerge, and let Pagong the turtle share some wisdom.

---

## Features

- **Daily mood entry** — pick a mood (1–5 scale) and write a short note (max 280 chars)
- **Sentiment analysis** — every note is analyzed by Gemini and tagged positive / neutral / negative
- **Mood heatmap** — 30-day calendar grid showing mood intensity at a glance
- **Word cloud** — the most frequent words from your journal notes, sized by frequency
- **Pagong Speaks** — one-click AI feature where Pagong the turtle analyzes your recent moods and responds with a pep talk, a movie rec, a book rec, a food rec, a game rec, and an activity suggestion — all in character
- **Entry log** — full scrollable history of all past entries with sentiment badges
- **Auth** — email/password sign-in via Supabase; all data is scoped per user

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL + Auth) |
| AI | Google Gemini `gemini-2.0-flash` via `@google/generative-ai` |
| Word Cloud | `@visx/wordcloud` + `@visx/text` |
| Charts | Recharts |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd <repo>
npm install
```

### 2. Set up environment variables

Create a `.env.local` file at the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_AI_API_KEY=
```

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API (keep this server-only) |
| `GOOGLE_AI_API_KEY` | [Google AI Studio](https://aistudio.google.com/) → Get API key |

### 3. Set up the database

In your Supabase project, open the **SQL Editor** and run the contents of [`supabase/schema.sql`](supabase/schema.sql). This creates the `mood_entries` table, sets up the `updated_at` trigger, enables Row Level Security, and adds all RLS policies.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up for an account and start logging.

---

## Project Structure

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── page.tsx           ← Dashboard
│   │   ├── loading.tsx        ← Skeleton loading state
│   │   └── log/page.tsx       ← Entry history
│   ├── api/
│   │   ├── entries/
│   │   │   ├── route.ts       ← GET, POST
│   │   │   └── [id]/route.ts  ← PUT
│   │   ├── pagong/
│   │   │   └── speaks/route.ts ← Pagong Speaks (GET)
│   │   └── summary/
│   │       └── weekly/route.ts ← Weekly summary (GET)
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── MoodForm.tsx
│   ├── EntryCard.tsx
│   ├── MoodHeatmap.tsx
│   ├── WordCloud.tsx
│   ├── PagongSpeaks.tsx
│   ├── WeeklySummary.tsx
│   └── Navbar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts          ← Browser client (Client Components)
│   │   └── server.ts          ← Server client (Server Components + API routes)
│   └── gemini.ts              ← Gemini API wrapper
├── types/
│   └── index.ts
├── supabase/
│   └── schema.sql             ← Run this in Supabase SQL editor
├── middleware.ts               ← Auth redirect guard
└── CLAUDE.md                  ← Project spec for AI-assisted development
```

---

## API Routes

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/entries` | Fetch all entries for the logged-in user |
| `POST` | `/api/entries` | Create a mood entry, run sentiment analysis |
| `PUT` | `/api/entries/[id]` | Update today's entry, re-run sentiment |
| `GET` | `/api/pagong/speaks` | Generate Pagong's full 6-card response |
| `GET` | `/api/summary/weekly` | Generate a plain-text weekly summary |

All routes validate the Supabase session server-side and return `401` for unauthenticated requests.

---

## Mood Scale

| Rating | Emoji | Label |
|---|---|---|
| 1 | 😞 | Rough |
| 2 | 😕 | Low |
| 3 | 😐 | Okay |
| 4 | 🙂 | Good |
| 5 | 😄 | Great |

---

## Deploying to Vercel

1. Push the repo to GitHub
2. Import the repo in [Vercel](https://vercel.com/new)
3. Add all four environment variables in **Project Settings → Environment Variables**
4. Deploy — Vercel auto-detects Next.js and sets the output directory correctly

> No `vercel.json` is needed. The build command is `next build` and the output directory is `.next`, both of which Vercel sets automatically.

---

## Database Schema Summary

Table: `mood_entries`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK → `auth.users` |
| `entry_date` | date | Unique per user per day |
| `mood_rating` | integer | 1–5 |
| `note` | text | Max 280 chars, nullable |
| `sentiment_label` | text | `positive` / `neutral` / `negative` |
| `sentiment_score` | float | 0.0–1.0 |
| `created_at` | timestamptz | Auto-set |
| `updated_at` | timestamptz | Auto-updated via trigger |

RLS is enabled. All policies are scoped to `auth.uid() = user_id`.
