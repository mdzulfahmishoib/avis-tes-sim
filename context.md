# AVIS TES SIM — Project Context

## Project Overview

**AVIS TES SIM** is a fullstack SIM (Surat Izin Mengemudi / Driver's License) Theory Exam Simulator for Indonesia. It allows citizens to practice for their driving license theory exam (SIM A for cars, SIM C for motorcycles) before taking the real test at the police office (Satpas).

- **App URL (dev):** `http://localhost:3000`
- **Admin Panel:** `http://localhost:3000/admin`
- **Language:** Indonesian (UI text is in Bahasa Indonesia)
- **Brand Color:** `#21479B` (deep blue)

---

## Tech Stack

| Layer         | Technology                                |
|---------------|-------------------------------------------|
| Framework     | Next.js 15+ (App Router, Turbopack)       |
| Language      | TypeScript                                |
| Styling       | Tailwind CSS v4                           |
| UI Components | shadcn/ui (Radix UI primitives)           |
| Font          | Inter (Google Fonts via `next/font`)      |
| Theme         | next-themes (light / dark mode)           |
| Backend/DB    | Supabase (PostgreSQL, Auth, Storage)      |
| Auth          | Supabase Auth (email/password)            |
| Storage       | Supabase Storage bucket: `question-media` |
| Icons         | lucide-react                              |
| Toast         | sonner                                    |
| Date Utility  | date-fns                                  |
| UUID          | uuid                                      |

---

## Architecture Overview

```
src/
├── app/
│   ├── layout.tsx              # Root layout: ThemeProvider, Toaster, Inter font
│   ├── globals.css             # Global styles, Tailwind tokens, theme variables
│   ├── page.tsx                # Public landing page (/)
│   ├── quiz/
│   │   ├── page.tsx            # Quiz engine (client component)
│   │   └── actions.ts          # submitQuizResult server action
│   ├── result/
│   │   └── page.tsx            # Result page (client component)
│   └── admin/
│       ├── login/
│       │   ├── page.tsx        # Admin login form
│       │   └── actions.ts      # login + logout server actions
│       └── (dashboard)/        # Route group: protected admin area
│           ├── layout.tsx      # Auth guard + AdminSidebar wrapper
│           ├── page.tsx        # Dashboard overview (stats)
│           ├── questions/
│           │   ├── page.tsx                  # Question Bank table (server + pagination)
│           │   ├── actions.ts                # createQuestion, updateQuestion, deleteQuestion
│           │   ├── create-question-modal.tsx # Add question modal (client)
│           │   └── edit-question-modal.tsx   # Edit question modal (client)
│           ├── users/
│           │   ├── page.tsx                  # Admin users table
│           │   ├── create-admin-modal.tsx    # Create admin modal
│           │   └── reset-password-modal.tsx  # Reset password modal
│           ├── results/
│           │   └── page.tsx    # Test results table
│           └── feedbacks/
│               └── page.tsx    # User feedbacks management table
├── components/
│   ├── admin-sidebar.tsx       # Fixed sidebar navigation for admin
│   ├── feedback-form.tsx       # Public feedback form with captcha
│   ├── start-quiz-modal.tsx    # Public quiz start modal (captures participant info)
│   ├── theme-provider.tsx      # next-themes ThemeProvider wrapper
│   ├── theme-toggle.tsx        # Sun/Moon toggle button (supports hideText prop)
│   └── ui/                     # shadcn/ui components
│       ├── button.tsx          # Client-side Button component
│       └── button-variants.ts  # Server-safe button styles (CVA)
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client (createBrowserClient)
│   │   └── server.ts           # Server Supabase client (createServerClient with cookies)
│   └── utils.ts                # cn() utility for Tailwind class merging
└── middleware.ts                # Auth guard: redirects unauthenticated /admin/* to /admin/login
```

---

## Key Features

### Public (User-Facing)
- **Landing Page `/`**: Hero section, feature highlights, "Mulai Simulasi Tes" button, Theme Toggle in header
- **Start Quiz Modal**: Captures participant `Nama`, `Email`, and `Jenis SIM` (A or C) with visual card-style SIM type selector.
- **Quiz Engine `/quiz`**: Fetches questions filtered by `sim_type`. All questions have a **25s timer**. Includes persistent audio logic for "Persepsi Bahaya" and a Theme Toggle in the header.
- **Result Page `/result`**: Shows total score, per-category breakdown, Pass/Fail status. Includes a **Donation Card** and **Feedback Form** (with captcha) on the right column.

### Admin Portal `/admin`
- **Login `/admin/login`**: Email/password via Supabase Auth server action.
- **Dashboard `/admin`**: Stats cards: total admin users, questions, test results.
- **Question Bank `/admin/questions`**: Table with Category, Preview, SIM Type badge, Correct Answer (truncated), Media, Actions. Includes search and category filters.
- **Add/Edit Questions**: Modals with Category + SIM Type selectors, Question Text, Media upload, dynamic Options/Correct Answer section.
- **User Management `/admin/users`**: Create admin accounts, reset passwords.
- **Test Results `/admin/results`**: View all test submissions with search and status filters.
- **Feedbacks `/admin/feedbacks`**: View user-submitted critiques, suggestions, and corrections.

---

## Important Database Tables

### `questions`
| Column         | Type                            | Notes                                          |
|----------------|---------------------------------|------------------------------------------------|
| id             | UUID (PK)                       |                                                |
| category       | ENUM ('Persepsi Bahaya', 'Wawasan', 'Pengetahuan') |                              |
| sim_type       | TEXT                            | `'A'` or `'C'`. Added via migration (not in original schema) |
| text           | TEXT                            | Question body                                  |
| media_url      | TEXT (nullable)                 | Public URL from Supabase Storage               |
| media_type     | TEXT (nullable)                 | `'image'` or `'video'`                         |
| options        | JSONB                           | Array of answer strings                        |
| correct_answer | TEXT                            | Must match one of the options                  |
| created_at     | TIMESTAMPTZ                     |                                                |

> ⚠️ `sim_type` was added after initial schema. Run: `ALTER TABLE questions ADD COLUMN sim_type TEXT NOT NULL DEFAULT 'A';`

### `test_results`
| Column              | Type     | Notes                              |
|---------------------|----------|------------------------------------|
| id                  | UUID (PK)|                                    |
| participant_name    | TEXT     |                                    |
| participant_email   | TEXT     |                                    |
| sim_type            | TEXT     | `'A'` or `'C'`                     |
| score_persepsi      | INTEGER  | Out of 25                          |
| score_wawasan       | INTEGER  | Out of 20                          |
| score_pengetahuan   | INTEGER  | Out of 20                          |
| total_score         | INTEGER  | Computed in `submitQuizResult`     |
| pass_status         | BOOLEAN  | true if total_score >= 70          |
| created_at          | TIMESTAMPTZ |                                 |

### `profiles`
| Column     | Type     | Notes                               |
|------------|----------|-------------------------------------|
| id         | UUID (PK)| References `auth.users.id`          |
| role       | TEXT     | Always `'admin'` for this app       |
| created_at | TIMESTAMPTZ |                                  |

---

### `feedbacks`
| Column            | Type        | Notes                                          |
|-------------------|-------------|------------------------------------------------|
| id                | UUID (PK)   |                                                |
| participant_name  | TEXT        |                                                |
| participant_email | TEXT        |                                                |
| type              | TEXT        | 'General', etc.                                |
| content           | TEXT        | The actual feedback text                       |
| created_at        | TIMESTAMPTZ |                                                |

---

## Question Distribution (per quiz session)
- **Persepsi Bahaya**: 25 questions
- **Wawasan**: 20 questions
- **Pengetahuan**: 20 questions
- **Total**: 65 questions
- **Timer**: **25 seconds** for ALL types
- **Passing score**: ≥ 70 / 100

## Persepsi Bahaya Special Logic
- Options are fixed: `['Mengurangi Kecepatan', 'Melakukan Pengereman', 'Mempertahankan Kecepatan']`
- Automatically assigned in `actions.ts` — no user input for options needed
- In modals, option input fields are hidden (`isPersepsi ? null : ...`)

---

## Coding Conventions

- **Server Components** by default. Use `"use client"` only when needed (state, effects, event handlers).
- **Server Actions** (`'use server'`) for all mutations (create, update, delete, login, logout).
- **Supabase SSR**: Always use `@/lib/supabase/server` in server components/actions, `@/lib/supabase/client` in client components.
- **Brand color**: `#21479B` (hover: `#1a3778`) — always add `text-white` to buttons using this background.
- **Dark mode**: Use Tailwind `dark:` variants. Never hardcode `text-gray-*` — prefer `text-muted-foreground`. Use `bg-background`, `bg-card`, `bg-muted` over `bg-white` or `bg-gray-*`.
- **Icons**: lucide-react exclusively.
- **Modals**: Use `shadcn/ui Dialog` with `DialogTrigger render={<Button />}` pattern (NOT `asChild` — it's not supported in this Button implementation).
- **Toasts**: Use `sonner` (`toast.success`, `toast.error`).
- **Forms in modals**: Use `action={handleAction}` (async server action called from client) for admin forms with `FormData`. Non-admin public forms use `onSubmit`.

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # Server-only, never expose to client
```

## Storage
- Bucket: `question-media` (public read, authenticated write)
- File upload limit: 10MB (configured in `next.config.ts` via `serverActions.bodySizeLimit`)

## Supabase Storage Bucket
Must be created manually in Supabase Dashboard. RLS policies are in `supabase/schema.sql`.
