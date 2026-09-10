# Buyer Academy

**Buyer Academy** is a portfolio single-page application that automates one
complete HR function end to end: the 20-working-day onboarding and training
program for junior media buyers. It is not a general HR platform — it is a
focused, fully working demo of a single training workflow, from the daily
learning plan to the automated status a manager or HR partner would check on.

> **Live demo:** _add your deployed URL here (e.g. Vercel/Netlify) once published._

## Overview

The app walks a trainee through a 20-day curriculum split into six modules,
covering everything a junior media buyer needs before running campaigns
independently — from industry fundamentals to tracking, creatives, campaign
economics, and a final guided-practice certification.

Each day follows the same loop:

1. See the day's learning objective and its 5 videos, in order.
2. Mark each video as watched.
3. Once all 5 videos are watched, a 5-question multiple-choice quiz unlocks.
4. Score 80% or higher → the day is complete and the next day unlocks.
5. Score below 80% → the specific videos tied to the missed questions are
   flagged for review, the quiz re-locks, and the trainee can try again.

All progress (watched videos, quiz attempts, scores, unlocked day) is saved to
the browser's `localStorage`, so it survives a page refresh — there is no
backend, database, or account system.

## Features

- **100 fictional training videos** — 5 per day × 20 days, organized into 6
  modules with realistic Russian titles, descriptions, and durations.
- **Daily learning flow** — objective, ordered video list, completion
  checkboxes, and a quiz that only unlocks once every video is watched.
- **Adaptive review** — a failed quiz attempt (below 80%) automatically
  re-assigns the specific videos linked to incorrect answers and allows a
  new attempt, instead of just showing a generic "try again."
- **Progressive unlocking** — days 1–20 unlock strictly in order as each
  quiz is passed; locked days are visible but not accessible.
- **Automated status summary** — a concise, always-visible status (current
  day, days completed, videos watched, average quiz score, attempts on the
  current day, and an overall state such as "needs attention") — the kind of
  snapshot an HR partner or manager would want, without a separate
  analytics dashboard.
- **Demo controls** — one-click **"Load demo state"** (jumps to day 8 with
  days 1–7 already completed and 4 of day 8's 5 videos watched) and
  **"Reset progress"** (clears all saved progress and starts over from day 1).
- **Fully client-side persistence** — all state lives in `localStorage`;
  no backend, authentication, database, or API keys involved.
- **Responsive, accessible UI** — usable on desktop and mobile, with
  labeled form controls, keyboard-navigable checkboxes/radio buttons, and
  semantic headings/landmarks throughout.
- **Russian-language interface** — the primary UI language, matching the
  target audience of the training program.

## Technology stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for the build tooling and dev server
- Plain CSS (no UI framework) for styling
- Browser `localStorage` for all persistence — no backend, database, or
  external APIs

## Local setup

```bash
# install dependencies
npm install

# start the dev server (http://localhost:5173)
npm run dev

# type-check + production build
npm run build

# preview the production build locally
npm run preview

# lint
npm run lint
```

## Demo walkthrough

To see the full "day 8 → day 9" journey an interviewer can complete in under
two minutes:

1. Open the app and click **"Загрузить демо-состояние"** ("Load demo
   state") in the header. This loads a fictional trainee who has completed
   days 1–7 and is partway through day 8 — a day covering pixels, events,
   click IDs, subids, postbacks, attribution, and diagnosing missing
   conversions.
2. Day 8 shows 4 of its 5 videos already checked off. Check the box on the
   5th video ("Диагностика пропавших конверсий") to mark it watched.
3. The day's quiz unlocks automatically. Answer all 5 questions and click
   **"Отправить ответы"** ("Submit answers").
4. A score of 80% or higher completes day 8 and shows a **"Перейти к дню 9"**
   ("Go to day 9") button — day 9 is now unlocked in the navigation and the
   status summary updates (days completed, average score, etc.).
5. Click **"Сбросить прогресс"** ("Reset progress") at any time to clear all
   saved state and start again from day 1.

Try answering a quiz incorrectly as well: any question missed re-flags its
related video for review, un-checks it, and locks the quiz again until that
video (and any others tied to missed questions) is re-watched.

## Fictional data notice

**All employees, training video titles, descriptions, quiz questions, and
results in this application are entirely fictional**, created for
demonstration purposes only. No real courses, copyrighted videos, real
companies, or real people are referenced or represented anywhere in this
project.

---

Built with AI-assisted development using Claude Code.
