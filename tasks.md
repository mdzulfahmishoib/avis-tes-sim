# AVIS TES SIM — Task Tracker

_Last updated: 2026-03-10_

---

## ✅ Completed Features

### Foundation
- [x] Next.js App Router project setup with TypeScript, Tailwind CSS, ESLint  
- [x] Supabase client utilities (`client.ts`, `server.ts`)  
- [x] Global Inter font via `next/font/google`  
- [x] Light / Dark mode via `next-themes` with `ThemeProvider`  
- [x] Global `Toaster` (sonner) in root layout  
- [x] Middleware for session refresh and admin route protection  

### Authentication
- [x] Admin login page (`/admin/login`) with Supabase email/password auth  
- [x] Server actions: `login`, `logout` in `admin/login/actions.ts`  
- [x] Route group `(dashboard)` with server-side auth guard in `layout.tsx`  
- [x] Middleware redirect: unauthenticated `/admin/*` → `/admin/login` (no redirect loop on login page)  

### Admin — Dashboard
- [x] Dashboard overview with stat cards (admin count, question count, test result count)
- [x] Detailed statistics section (Pass Rate, Lulus/Tidak Lulus counts, SIM A vs SIM C distribution)
- [x] Recent test results feed on dashboard

### Admin — Question Management (`/admin/questions`)
- [x] Question Bank table with columns: Category, Preview (truncated), SIM Type badge, Correct Answer, Media, Audio, Actions
- [x] Server-side pagination (10 per page, `Previous`/`Next` links)
- [x] "Showing X to Y of Z entries" info text 
- [x] Create question modal with:
- [x] Audio upload specifically for Persepsi Bahaya questions
- [x] Admin table buttons changed to icon-only group for cleaner UI
- [x] Create question modal with:
  - [x] Category + SIM Type selectors (side-by-side 2-column grid)
  - [x] Question text textarea
  - [x] Media file upload (image/video, optional)
  - [x] Audio file upload (specifically for Persepsi Bahaya)
  - [x] Dynamic options inputs (hidden for Persepsi Bahaya)
  - [x] Dynamic Correct Answer select (populates from option inputs; fixed values for Persepsi Bahaya)
- [x] Edit question modal with same dynamic fields, pre-populated from existing data
- [x] Delete question (with media and audio cleanup from storage)
- [x] File upload size limit: 10MB (`next.config.ts`)
- [x] `+ Add Question` button icon (Plus), `Delete` button icon (Trash2)
- [x] `text-white` on Add Question button (dark mode fix)
- [x] SIM Type badge: blue for SIM A, orange for SIM C
- [x] Cursor: pointer for all buttons across the application

### Admin — User Management (`/admin/users`)
- [x] List admin users  
- [x] Create admin modal  
- [x] Reset password modal  

### Admin — Test Results (`/admin/results`)
- [x] List test results table
- [x] Server-side pagination for Results table
- [x] Badge styling for SIM types and pass/fail status in results table

### Public — Landing Page (`/`)
- [x] Fixed header with logo + Theme Toggle button (icon-only, top-right)
- [x] Hero section with quiz CTA button
- [x] Feature highlights grid (3 cards)
- [x] Statistics section (Total sessions, Pass rate, Lulus count)
- [x] Footer
- [x] Full dark mode support (bg-background, bg-card, text-muted-foreground)
- [x] Logo color: `#21479B` in light, white in dark mode

### Public — Start Quiz Modal
- [x] Captures: Nama Lengkap, Email, Jenis SIM  
- [x] SIM type selector: two large visual card buttons (Car icon = SIM A, Bike icon = SIM C)  
- [x] Stores data in `sessionStorage` as `quiz_participant`  
- [x] Redirects to `/quiz` on submit  

### Public — Quiz Engine (`/quiz`)
- [x] Reads participant data from `sessionStorage` (redirects to `/` if missing)  
- [x] Fetches questions filtered by `sim_type` (A or C) and category  
- [x] Per-category distribution: 25 Persepsi Bahaya, 20 Wawasan, 20 Pengetahuan  
- [x] Per-question timers: 25s (Persepsi Bahaya), 20s (others). Auto-advance on timeout  
- [x] Sequential flow (no back navigation)  
- [x] Radio answer selection  
- [x] Media display (image/video)  
- [x] Progress bar + question counter  
- [x] Final score calculation and submission via `submitQuizResult` server action  

### Public — Result Page (`/result`)
- [x] Reads `last_result_id` from `sessionStorage`
- [x] Fetches result from Supabase
- [x] Displays Pass/Fail, total score, per-category breakdown
- [x] Detailed correct/incorrect counts per category
- [x] "Coba Lagi" and "Kembali ke Beranda" buttons
- [x] Full dark mode support

---

## 🚧 Features In Progress

- [ ] `sim_type` database column migration — column added in code but must be manually applied in Supabase:
  ```sql
  ALTER TABLE questions ADD COLUMN sim_type TEXT NOT NULL DEFAULT 'A';
  ```

---

## 📋 Planned Features

### Admin
- [ ] Search and filter on Question Bank table (by category, sim_type, keyword)  
- [ ] Search and filter on Results table  
- [ ] Pagination for Users and Results tables  
- [ ] Admin dashboard analytics (charts: pass rate, scores over time)  
- [ ] Seed script for initial admin user  

### Public
- [ ] Quiz randomization (shuffle questions within each category)  
- [ ] Review mode after quiz ends (show correct answers)  
- [ ] Print / download result as PDF  
- [ ] Mobile-responsive quiz layout improvements  

---

## 🐛 Known Issues / Bugs

- [ ] **`sim_type` and `audio_url` database columns**: Columns must be added manually via SQL migration in Supabase Dashboard.
  ```sql
  ALTER TABLE questions ADD COLUMN sim_type TEXT NOT NULL DEFAULT 'A';
  ALTER TABLE questions ADD COLUMN audio_url TEXT;
  ```
- [ ] **`media_type` logic**: Ensure `audio` is correctly handled in all media display logic if needed beyond quiz page.
- [ ] **Result page dark mode**: Some text in the result page still uses hardcoded `text-gray-*` colors (not adapting to dark mode).
- [ ] **Quiz page dark mode**: The quiz page (`/quiz`) uses `bg-gray-50` and `bg-white` hardcoded — not fully dark-mode aware.

---

## 💡 Future Improvements

- Add `useTransition` or React `useOptimistic` for smoother admin table updates  
- Add server-side search for the Question Bank  
- Add role-based access (super-admin vs. operator)  
- Add rate limiting on quiz submission API  
- Add email notification to participant after quiz (with result summary)  
- Add question import via CSV/Excel  
- Replace `any` types with proper TypeScript interfaces across client components  
