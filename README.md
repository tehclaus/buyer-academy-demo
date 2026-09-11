# Buyer Academy

**Buyer Academy** is a portfolio single-page application that automates one
complete HR function end to end: the 20-working-day onboarding and training
program for junior media buyers. It is not a general HR platform — it is a
focused, fully working demo of a single training workflow, from the daily
learning plan to the automated status a manager or HR partner would check on.

**Live demo:** https://buyer-academy-demo.vercel.app/

## Overview

The app walks a trainee through a 20-day curriculum split into six modules,
covering everything a junior media buyer needs before running campaigns
independently — from industry fundamentals to tracking, creatives, campaign
economics, and a final guided-practice certification.

Each day follows the same loop:

1. See the day's learning objective and its 5 videos, in order.
2. Mark each video as watched.
3. Once all 5 videos are watched, a 10-question multiple-choice quiz unlocks
   (about 7 knowledge questions and 3 scenario-based questions, with both
   question order and answer-option order randomized on every attempt).
4. Score 80% or higher → the day is complete and the next day unlocks.
5. Score below 80% → the specific videos tied to the missed questions are
   flagged for review, the quiz re-locks, and the trainee can try again.

After days 5, 10, and 15, a **weekly checkpoint** (25 questions sampled from
that week's daily question pool — no separate question bank) must be passed
at 80% or higher before the next module unlocks. A failed checkpoint reports
the weak topics and specific videos to review, then allows a fresh, freshly
sampled retry.

Day 20 replaces the regular checkpoint with a **final certification**: a
40-question theory test sampled from the entire course, plus one structured,
automatically-graded practical case (see below). Both parts must be passed to
complete the program.

All progress (watched videos, quiz/checkpoint/certification attempts, scores,
unlocked day) is saved to the browser's `localStorage`, so it survives a page
refresh — there is no backend, database, or account system.

## Features

- **100 fictional training videos** — 5 per day × 20 days, organized into 6
  modules with realistic Russian titles, descriptions, and durations.
- **200 fictional quiz questions** — exactly 10 per day (≈7 knowledge + ≈3
  situational/scenario questions), each tied to a specific video for
  targeted review.
- **Daily learning flow** — objective, ordered video list, completion
  checkboxes, and a 10-question quiz that only unlocks once every video is
  watched.
- **Randomized quizzes** — question order and answer-option order are
  reshuffled on every attempt (daily quiz, checkpoint, and certification
  theory alike), while scoring always stays correct against the shuffled
  order shown to the learner.
- **Adaptive review** — a failed quiz attempt (below 80%) automatically
  re-assigns the specific videos linked to incorrect answers and allows a
  new attempt, instead of just showing a generic "try again."
- **Weekly checkpoints** — after days 5, 10, and 15, a 25-question checkpoint
  sampled from that week's own daily questions (never a separate bank) gates
  the next module. A failed checkpoint names the weak topics/videos and can
  be retried with a freshly sampled set.
- **Final certification (day 20)** — a 40-question theory test sampled from
  the full 200-question course bank, plus a structured practical campaign
  case (calculate CTR/CR/CPA/ROI, diagnose the likely problem, pick the right
  next actions) that is graded automatically, client-side, with no API. Both
  the theory score and the practical case must pass to finish the program.
- **Progressive unlocking** — days, checkpoints, and the certification unlock
  strictly in order as each gate is passed; anything not yet reached is
  visible but locked.
- **Automated status summary** — a concise, always-visible status (current
  stage — a day, a checkpoint, or certification — days completed, videos
  watched, average daily-quiz score, attempts on the current stage, and an
  overall state such as "needs attention") — the kind of snapshot an HR
  partner or manager would want, without a separate analytics dashboard.
- **Demo controls** — one-click **"Load demo state"** (jumps to day 8 with
  days 1–7 and the day-5 checkpoint already completed, and 4 of day 8's 5
  videos watched) and **"Reset progress"** (clears all saved progress and
  starts over from day 1).
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
- [Vitest](https://vitest.dev/) for automated tests of the curriculum data and
  progress/scoring engine
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

# run the automated test suite
npm run test
```

## Demo walkthrough

To see the full "day 8 → day 9" journey an interviewer can complete in about
three minutes:

1. Open the app and click **"Загрузить демо-состояние"** ("Load demo
   state") in the header. This loads a fictional trainee who has completed
   days 1–7 (including the day-5 weekly checkpoint) and is partway through
   day 8 — a day covering pixels, events, click IDs, subids, postbacks,
   attribution, and diagnosing missing conversions.
2. Day 8 shows 4 of its 5 videos already checked off. Check the box on the
   5th video ("Диагностика пропавших конверсий") to mark it watched.
3. The day's 10-question quiz unlocks automatically. Answer all 10 questions
   and click **"Отправить ответы"** ("Submit answers").
4. A score of 80% or higher completes day 8 and shows a **"Перейти к дню 9"**
   ("Go to day 9") button — day 9 is now unlocked in the navigation and the
   status summary updates (days completed, average score, etc.). Day 9 is not
   a checkpoint day, so it unlocks immediately.
5. Click **"Сбросить прогресс"** ("Reset progress") at any time to clear all
   saved state and start again from day 1.

Try answering a quiz incorrectly as well: any question missed re-flags its
related video for review, un-checks it, and locks the quiz again until that
video (and any others tied to missed questions) is re-watched. To see a
weekly checkpoint or the final certification directly, complete days up to 5,
10, 15, or 20 through the UI (or drive the same flow via the
`submitDayQuiz`/`submitCheckpoint`/`submitCertificationTheory` functions
covered by the automated tests in `src/progressEngine.test.ts`).

## Fictional data notice

**All employees, training video titles, descriptions, quiz questions, and
results in this application are entirely fictional**, created for
demonstration purposes only. No real courses, copyrighted videos, real
companies, or real people are referenced or represented anywhere in this
project.

---

Built with AI-assisted development using Claude Code.
