# 📚 LeetCode Revisited — Documentation

> **A spaced-repetition revision tracker for LeetCode problems.**
> Never forget a solution again — the app automatically schedules reviews at scientifically optimal intervals so you retain what you've learned.

---

## Table of Contents

1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Prerequisites](#prerequisites)
4. [Project Setup](#project-setup)
   - [1. Clone the Repository](#1-clone-the-repository)
   - [2. Set Up MongoDB](#2-set-up-mongodb)
   - [3. Configure Environment Variables](#3-configure-environment-variables)
   - [4. Install Dependencies](#4-install-dependencies)
   - [5. Start the Application](#5-start-the-application)
5. [Using the Application](#using-the-application)
   - [Landing Page — Enter Your Username](#landing-page--enter-your-username)
   - [Dashboard — Daily Revision View](#dashboard--daily-revision-view)
   - [Progress Page — Full Problem Overview](#progress-page--full-problem-overview)
6. [Spaced Repetition Schedule](#spaced-repetition-schedule)
7. [Architecture Overview](#architecture-overview)
   - [Tech Stack](#tech-stack)
   - [Project Structure](#project-structure)
   - [Data Flow](#data-flow)
8. [API Reference](#api-reference)
   - [Health Check](#health-check)
   - [User Endpoints](#user-endpoints)
   - [Problem Endpoints](#problem-endpoints)
9. [Database Schema](#database-schema)
   - [User Model](#user-model)
   - [Problem Model](#problem-model)
10. [Cron Jobs & Auto-Sync](#cron-jobs--auto-sync)
11. [Frontend Components](#frontend-components)
12. [Configuration Reference](#configuration-reference)
13. [Troubleshooting](#troubleshooting)
14. [FAQ](#faq)

---

## Overview

**LeetCode Revisited** (branded as **LeetRevise** in the UI) solves a common problem among competitive programmers and interview candidates: **the forgetting curve**. You solve a LeetCode problem today, but in a few weeks you've completely forgotten the approach.

This application uses **spaced repetition** — a scientifically-backed technique — to schedule reviews of problems you've already solved at increasing intervals (1 → 3 → 7 → 15 → 30 → 60 days). By the time you've completed all six review cycles, the solution is locked into long-term memory.

### Key Features

| Feature | Description |
|---|---|
| **No Login Required** | Just enter your public LeetCode username — no auth needed. |
| **Auto-Import** | Automatically fetches your 20 most recent accepted submissions from LeetCode. |
| **Smart Scheduling** | Assigns review dates using a 6-step spaced repetition algorithm. |
| **Daily Dashboard** | Shows only the problems due for revision today (or overdue). |
| **One-Click Review** | Click "Done" to advance a problem to the next review interval. |
| **Progress Tracking** | Full-featured progress page with search, filters, sorting, and progress bars. |
| **Streak Tracking** | Tracks consecutive days of revision activity. |
| **Auto-Sync** | A background cron job re-syncs all users every 6 hours (configurable). |
| **Manual Sync** | Manually trigger a sync from the dashboard at any time. |
| **Difficulty Breakdown** | Visual breakdown of Easy / Medium / Hard problems. |

---

## How It Works

```
┌─────────────────┐      ┌─────────────────────┐      ┌──────────────┐
│   LeetCode.com  │◄────►│  alfa-leetcode-api  │◄────►│  Our Server  │
│  (your profile) │      │  (3rd-party proxy)  │      │  (Express)   │
└─────────────────┘      └─────────────────────┘      └──────┬───────┘
                                                             │
                                                             ▼
                                                      ┌──────────────┐
                                                      │   MongoDB    │
                                                      │  (Atlas DB)  │
                                                      └──────┬───────┘
                                                             │
                                                             ▼
                                                      ┌──────────────┐
                                                      │  React App   │
                                                      │  (Vite Dev)  │
                                                      └──────────────┘
```

1. **You enter your LeetCode username** on the landing page.
2. The **backend validates** the username against LeetCode's API.
3. Your **recent accepted submissions** are fetched, and for each new problem, **difficulty and topic tags** are retrieved.
4. Each new problem is stored in MongoDB with an initial review date of **tomorrow (Day 1)**.
5. A **cron job** runs every 6 hours to check for any newly solved problems across all registered users.
6. The **dashboard** shows you which problems are due for review today.
7. When you click **"Done"**, the next review date is advanced to the next interval in the schedule.
8. After completing all 6 intervals (Day 60), a problem is marked as **"Graduated"** — locked into long-term memory.

---

## Prerequisites

Before setting up the project, make sure you have the following installed:

| Requirement | Minimum Version | Check Command |
|---|---|---|
| **Node.js** | v18+ | `node --version` |
| **npm** | v9+ | `npm --version` |
| **MongoDB** | Atlas (cloud) or local v6+ | — |
| **Git** | Any recent version | `git --version` |

> **Note:** The project uses ES Modules (`"type": "module"` in both `package.json` files), so Node.js 18+ is required.

---

## Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "LeetCode Revisited"
```

### 2. Set Up MongoDB

You have two options:

#### Option A: MongoDB Atlas (Recommended — Free Tier)

1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account.
2. Create a new cluster (the **M0 free tier** is sufficient).
3. Under **Database Access**, create a database user with read/write permissions.
4. Under **Network Access**, add your IP address (or `0.0.0.0/0` for development).
5. Click **Connect** → **Connect your application** → copy the connection string.
6. It will look like: `mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/<dbname>`

#### Option B: Local MongoDB

1. Install MongoDB Community Edition from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community).
2. Start the MongoDB service.
3. Your connection string will be: `mongodb://localhost:27017/leetcode-revisited`

### 3. Configure Environment Variables

Create or edit the `.env` file inside the `server/` directory:

```bash
# server/.env

# MongoDB connection string (replace with your own)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/<dbname>

# Server port (default: 5000)
PORT=5000

# Cron schedule for auto-syncing (default: every 6 hours)
# Format: standard cron expression (minute hour day-of-month month day-of-week)
CRON_SCHEDULE=0 */6 * * *
```

> ⚠️ **Important:** Never commit the `.env` file to version control. Make sure it's listed in your `.gitignore`.

### 4. Install Dependencies

Open **two terminal windows** — one for the server, one for the client:

**Terminal 1 — Server:**

```bash
cd server
npm install
```

**Terminal 2 — Client:**

```bash
cd client
npm install
```

### 5. Start the Application

**Terminal 1 — Start the Backend Server:**

```bash
cd server
npm run dev
```

You should see output like:

```
✅ MongoDB connected: cluster.xxxxx.mongodb.net
⏰ Cron job scheduled: "0 */6 * * *" (UTC)

🚀 Server running on http://localhost:5000
📡 API: http://localhost:5000/api
💓 Health: http://localhost:5000/api/health
```

**Terminal 2 — Start the Frontend Dev Server:**

```bash
cd client
npm run dev
```

You should see output like:

```
VITE v8.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
```

**Open your browser** and go to **[http://localhost:5173](http://localhost:5173)** to use the application.

---

## Using the Application

### Landing Page — Enter Your Username

| Step | Action |
|---|---|
| 1 | Navigate to `http://localhost:5173` |
| 2 | You'll see the landing page with a text input |
| 3 | Type your **public LeetCode username** (e.g., `neal_wu`) |
| 4 | Click the **"Start"** button |
| 5 | The app validates your username against LeetCode |
| 6 | If valid, it creates your profile and begins syncing your recent solved problems |
| 7 | You're redirected to your **Dashboard** |

> **Returning users:** If you enter a username that's already registered, you'll be taken directly to the dashboard — no duplicate registration occurs.

### Dashboard — Daily Revision View

**URL:** `/dashboard/<username>`

This is your primary workspace. It shows:

#### Stats Row (Top)

Four cards at the top displaying key metrics:

| Card | Description |
|---|---|
| **Total Problems** | Number of problems imported from your LeetCode profile |
| **Due Today** | Problems whose review date is today or earlier (overdue) |
| **Reviews Done** | Total number of review completions across all problems |
| **Upcoming (7d)** | Problems due for review within the next 7 days |

#### Problem List (Main Area — Left)

Each problem card shows:
- **Difficulty badge** — color-coded (🟢 Easy, 🟡 Medium, 🔴 Hard)
- **Current interval** — which step of the spaced repetition schedule the problem is on
- **Overdue indicator** — a pulsing red badge if the review date has passed
- **Title** — the LeetCode problem name
- **Topic tags** — up to 4 tags (e.g., Array, Dynamic Programming, etc.)
- **"Solve" button** — opens the problem on LeetCode in a new tab
- **"Done" button** — marks the review as complete and advances to the next interval

> **What happens when you click "Done"?**
>
> The problem advances to the next spaced repetition interval. For example:
> - Currently on **Day 1** → Next review in **3 days**
> - Currently on **Day 3** → Next review in **7 days**
> - Currently on **Day 30** → Next review in **60 days**
> - Currently on **Day 60** → Problem is **Graduated** 🎉 (no more reviews)
>
> The problem immediately disappears from the "due today" list and the stats update in real time.

#### Sidebar (Right)

- **Streak Tracker** — Shows your current consecutive-day revision streak with a weekly grid visualization. Streaks of 7+ days show an "🔥 On Fire!" badge.
- **Difficulty Breakdown** — Visual bar chart showing the distribution of Easy / Medium / Hard problems.
- **Last Synced** — Timestamp of the most recent sync with LeetCode.

#### Sync Button (Navbar)

Click the **"Sync"** button in the top navigation bar to manually trigger a re-sync with LeetCode. This will:
1. Fetch your 20 most recent accepted submissions
2. Add any new problems not yet tracked
3. Update your total solved count
4. Display a toast notification with the result

### Progress Page — Full Problem Overview

**URL:** `/progress/<username>`

This page shows **every problem** being tracked (not just today's), with powerful filtering and sorting:

#### Overview Cards

| Card | Description |
|---|---|
| **Total Tracked** | All problems imported and being tracked |
| **In Progress** | Problems still going through the spaced repetition cycle |
| **Graduated** | Problems that completed all 6 review intervals |
| **Avg. Progress** | Average completion percentage across all problems |

#### Filter & Search Bar

| Control | Options |
|---|---|
| **Search** | Type to search by problem title or topic tag |
| **Difficulty** | Filter by: All / Easy / Medium / Hard |
| **Status** | Filter by: All / Active / Completed |
| **Sort By** | Sort by: Next Review / Difficulty / Progress / Title |

#### Problem Cards

Each problem card shows:
- Difficulty badge and current status (Due Now / Review Day X / Graduated)
- Next review date
- Topic tags
- **Progress bar** — visual percentage of completion through the 6 intervals
- **Interval step indicator** — 6 segments showing which intervals have been completed
- **"Open" button** — link to the problem on LeetCode

---

## Spaced Repetition Schedule

The app uses a fixed 6-interval schedule based on established spaced repetition research:

| Interval Index | Days After Previous Review | Cumulative Days | Purpose |
|---|---|---|---|
| 0 (Initial) | 1 day | Day 1 | Reinforce while fresh |
| 1 | 3 days | Day 3 | First spaced review |
| 2 | 7 days | Day 7 | Weekly consolidation |
| 3 | 15 days | Day 15 | Bi-weekly strengthening |
| 4 | 30 days | Day 30 | Monthly recall test |
| 5 | 60 days | Day 60 | Long-term memory lock |
| ✅ Graduated | — | — | No more reviews needed |

**How it works in code:**

```javascript
// Defined in server/src/models/Problem.js
export const REVIEW_INTERVALS = [1, 3, 7, 15, 30, 60];
```

- When a problem is first synced, `currentInterval` is set to `0` and `nextReviewDate` is set to **today + 1 day**.
- When you click "Done", `currentInterval` increments by 1, and `nextReviewDate` is recalculated:
  ```
  nextReviewDate = today + REVIEW_INTERVALS[newIndex]
  ```
- When `currentInterval` reaches `6` (past the end of the array), the problem is marked as `isCompleted = true` — it has **graduated**.

---

## Architecture Overview

### Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React (JSX) + Vite | UI framework and dev server |
| **Styling** | Tailwind CSS v3 | Utility-first CSS framework |
| **Icons** | Lucide React | Icon library |
| **Routing** | React Router DOM v7 | Client-side routing |
| **HTTP Client** | Axios | API calls from frontend to backend |
| **Backend** | Node.js + Express | REST API server |
| **Database** | MongoDB + Mongoose | Document database and ODM |
| **Scheduling** | node-cron | Background sync cron jobs |
| **LeetCode API** | alfa-leetcode-api | 3rd-party API proxy for LeetCode data |

### Project Structure

```
LeetCode Revisited/
├── client/                         # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js              # Axios API client (all HTTP calls)
│   │   ├── components/
│   │   │   ├── LoadingSpinner.jsx   # Full-screen loading state
│   │   │   ├── Navbar.jsx           # Top navigation bar with sync button
│   │   │   ├── ProblemCard.jsx      # Individual problem card (dashboard)
│   │   │   ├── StatsCard.jsx        # Metric display card
│   │   │   └── StreakTracker.jsx     # Weekly streak visualization
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx      # Home page with username input
│   │   │   ├── DashboardPage.jsx    # Daily revision dashboard
│   │   │   └── ProgressPage.jsx     # All problems with filters & progress
│   │   ├── App.jsx                  # Root component with route definitions
│   │   ├── main.jsx                 # React entry point
│   │   ├── index.css                # Global styles & Tailwind imports
│   │   └── style.css                # Custom theme (glassmorphism, animations)
│   ├── index.html                   # HTML template
│   ├── package.json
│   ├── tailwind.config.js           # Custom color palette & animations
│   └── postcss.config.js
│
├── server/                         # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # MongoDB connection setup
│   │   ├── cron/
│   │   │   └── syncJob.js          # Cron job for periodic LeetCode sync
│   │   ├── models/
│   │   │   ├── User.js             # Mongoose User schema
│   │   │   └── Problem.js          # Mongoose Problem schema + review intervals
│   │   ├── routes/
│   │   │   ├── userRoutes.js       # POST /register, GET /:username
│   │   │   └── problemRoutes.js    # GET /due, GET /all, PUT /complete, etc.
│   │   ├── services/
│   │   │   └── leetcodeService.js  # LeetCode API integration layer
│   │   └── index.js                # Express app entry point
│   ├── .env                        # Environment variables (not committed)
│   └── package.json
│
├── Documentation.md                # This file
└── plan.md                         # Original project plan
```

### Data Flow

#### Registration & Initial Sync

```
User enters username
        │
        ▼
POST /api/users/register
        │
        ├── Validate username exists on LeetCode (GET /<username>/solved)
        ├── Create User document in MongoDB
        └── Trigger background sync:
              │
              ├── Fetch 20 recent accepted submissions (GET /<username>/acSubmission)
              ├── For each new problem:
              │     ├── Fetch problem details (GET /select?titleSlug=...)
              │     └── Create Problem document with nextReviewDate = today + 1
              └── Update User.lastSyncedAt and User.totalSolved
```

#### Daily Review Flow

```
User opens Dashboard
        │
        ▼
GET /api/problems/<username>/due    →  Problems where nextReviewDate ≤ end of today
GET /api/problems/<username>/stats  →  Aggregate statistics
        │
        ▼
User clicks "Done" on a problem
        │
        ▼
PUT /api/problems/<id>/complete
        │
        ├── Record review in reviewHistory[]
        ├── Increment currentInterval
        ├── Calculate new nextReviewDate
        └── If past interval 5 → mark isCompleted = true (Graduated!)
```

---

## API Reference

**Base URL:** `http://localhost:5000/api`

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server health status |

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-07-18T10:00:00.000Z"
}
```

---

### User Endpoints

#### `POST /api/users/register`

Register a new LeetCode username and trigger initial sync.

**Request Body:**

```json
{
  "username": "neal_wu"
}
```

**Response (201 — New User):**

```json
{
  "message": "User registered. Initial sync started.",
  "user": {
    "_id": "...",
    "leetcodeUsername": "neal_wu",
    "totalSolved": 0,
    "lastSyncedAt": null,
    "registeredAt": "2026-07-18T10:00:00.000Z"
  },
  "isExisting": false
}
```

**Response (200 — Existing User):**

```json
{
  "message": "User already registered",
  "user": { "..." },
  "isExisting": true
}
```

**Error Responses:**
- `400` — Username is missing or empty
- `404` — LeetCode user not found
- `500` — Internal server error

---

#### `GET /api/users/:username`

Get a registered user's profile.

**Response (200):**

```json
{
  "user": {
    "_id": "...",
    "leetcodeUsername": "neal_wu",
    "totalSolved": 450,
    "lastSyncedAt": "2026-07-18T10:00:00.000Z",
    "registeredAt": "2026-07-15T08:00:00.000Z"
  }
}
```

**Error:** `404` — User not found

---

### Problem Endpoints

#### `GET /api/problems/:username/due`

Get problems due for review today or earlier (overdue).

**Response (200):**

```json
{
  "problems": [
    {
      "_id": "...",
      "title": "Two Sum",
      "titleSlug": "two-sum",
      "difficulty": "Easy",
      "topicTags": ["Array", "Hash Table"],
      "leetcodeUrl": "https://leetcode.com/problems/two-sum/",
      "currentInterval": 2,
      "nextReviewDate": "2026-07-18T00:00:00.000Z",
      "isCompleted": false,
      "reviewHistory": [
        { "reviewedAt": "2026-07-11T...", "intervalIndex": 0 },
        { "reviewedAt": "2026-07-14T...", "intervalIndex": 1 }
      ]
    }
  ],
  "count": 1
}
```

---

#### `GET /api/problems/:username/all`

Get all problems for a user (regardless of due date or completion status).

**Response format:** Same as `/due`, but returns every tracked problem.

---

#### `PUT /api/problems/:id/complete`

Mark a problem's current review as completed. Advances the spaced repetition interval.

**Response (200 — Advanced to next interval):**

```json
{
  "message": "Next review in 7 days",
  "problem": { "..." }
}
```

**Response (200 — Graduated):**

```json
{
  "message": "🎉 Problem fully graduated from revision!",
  "problem": { "...", "isCompleted": true }
}
```

**Errors:**
- `404` — Problem not found
- `400` — Problem already fully completed

---

#### `GET /api/problems/:username/stats`

Get aggregate revision statistics for a user.

**Response (200):**

```json
{
  "totalProblems": 20,
  "dueToday": 3,
  "completedReviews": 2,
  "upcoming": 8,
  "totalReviewsMade": 15,
  "difficulties": {
    "Easy": 5,
    "Medium": 10,
    "Hard": 5
  },
  "streak": 4,
  "lastSyncedAt": "2026-07-18T06:00:00.000Z"
}
```

| Field | Description |
|---|---|
| `totalProblems` | Total number of tracked problems |
| `dueToday` | Problems with `nextReviewDate ≤ end of today` and not completed |
| `completedReviews` | Problems that have graduated (all 6 intervals done) |
| `upcoming` | Problems due within the next 7 days (but not today) |
| `totalReviewsMade` | Sum of all review events across all problems |
| `difficulties` | Count of problems by difficulty |
| `streak` | Consecutive days with at least 1 review completed |
| `lastSyncedAt` | Timestamp of the last LeetCode sync |

---

#### `POST /api/problems/:username/sync`

Manually trigger a sync of the user's LeetCode submissions.

**Response (200):**

```json
{
  "message": "Sync completed",
  "newProblemsCount": 2,
  "totalSynced": 20
}
```

---

## Database Schema

### User Model

**Collection:** `users`

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated MongoDB ID |
| `leetcodeUsername` | String | LeetCode username (unique, lowercase, trimmed) |
| `registeredAt` | Date | When the user first registered |
| `lastSyncedAt` | Date | Last successful sync timestamp |
| `totalSolved` | Number | Total problems solved on LeetCode |
| `createdAt` | Date | Mongoose timestamp |
| `updatedAt` | Date | Mongoose timestamp |

### Problem Model

**Collection:** `problems`

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated MongoDB ID |
| `userId` | ObjectId (ref: User) | The user this problem belongs to |
| `titleSlug` | String | LeetCode problem slug (e.g., `"two-sum"`) |
| `title` | String | Problem title (e.g., `"Two Sum"`) |
| `difficulty` | String (enum) | `"Easy"` / `"Medium"` / `"Hard"` |
| `topicTags` | [String] | Array of topic tags (e.g., `["Array", "Hash Table"]`) |
| `leetcodeUrl` | String | Full URL to the problem on LeetCode |
| `firstSolvedAt` | Date | When the problem was first solved |
| `currentInterval` | Number | Index into `REVIEW_INTERVALS` (0–5) |
| `nextReviewDate` | Date | When the next review is scheduled |
| `reviewHistory` | Array | Log of all completed reviews |
| `reviewHistory.reviewedAt` | Date | When the review was done |
| `reviewHistory.intervalIndex` | Number | Which interval was completed |
| `isCompleted` | Boolean | `true` if the problem has graduated |
| `createdAt` | Date | Mongoose timestamp |
| `updatedAt` | Date | Mongoose timestamp |

**Indexes:**

| Index | Fields | Purpose |
|---|---|---|
| Unique compound | `{ userId, titleSlug }` | Prevent duplicate problems per user |
| Query index | `{ userId, nextReviewDate, isCompleted }` | Fast "due today" queries |

---

## Cron Jobs & Auto-Sync

The server runs a background cron job that automatically syncs all registered users' LeetCode data.

| Setting | Default | Description |
|---|---|---|
| `CRON_SCHEDULE` | `0 */6 * * *` | Every 6 hours (midnight, 6am, noon, 6pm UTC) |

**What the sync does:**

1. Iterates over every registered user in the database.
2. For each user, fetches the 20 most recent accepted submissions from LeetCode.
3. Checks if each submission already exists in the database (by `titleSlug`).
4. For new problems, fetches detailed info (difficulty, topic tags) and creates a `Problem` document.
5. Updates the user's `totalSolved` count and `lastSyncedAt` timestamp.
6. Waits 2 seconds between users to respect API rate limits.

**Common cron expressions:**

| Schedule | Expression |
|---|---|
| Every 6 hours | `0 */6 * * *` |
| Every hour | `0 * * * *` |
| Every 30 minutes | `*/30 * * * *` |
| Once daily at midnight UTC | `0 0 * * *` |
| Once daily at 8am UTC | `0 8 * * *` |

---

## Frontend Components

| Component | File | Description |
|---|---|---|
| **App** | `App.jsx` | Root component — defines 3 routes (`/`, `/dashboard/:username`, `/progress/:username`) |
| **LandingPage** | `pages/LandingPage.jsx` | Hero section with username input form, feature cards, and schedule preview |
| **DashboardPage** | `pages/DashboardPage.jsx` | Daily revision view — stats row, due problems, streak tracker, difficulty chart |
| **ProgressPage** | `pages/ProgressPage.jsx` | Full problem list with search, filter, sort, progress bars, and interval step indicators |
| **Navbar** | `components/Navbar.jsx` | Sticky top nav — logo, Dashboard/Progress links, Sync button, username badge |
| **ProblemCard** | `components/ProblemCard.jsx` | Individual problem card with difficulty, tags, "Solve" link, and "Done" button |
| **StatsCard** | `components/StatsCard.jsx` | Reusable metric card with icon, label, value, and color theme |
| **StreakTracker** | `components/StreakTracker.jsx` | 7-day weekly grid showing streak progress with encouragement messages |
| **LoadingSpinner** | `components/LoadingSpinner.jsx` | Animated full-page loading state with a message |

### Client-Side Routes

| Path | Component | Description |
|---|---|---|
| `/` | LandingPage | Home / username entry |
| `/dashboard/:username` | DashboardPage | Daily revision dashboard |
| `/progress/:username` | ProgressPage | All problems with filters |

---

## Configuration Reference

### Server Environment Variables (`server/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGODB_URI` | ✅ Yes | — | MongoDB connection string |
| `PORT` | No | `5000` | Port the Express server listens on |
| `CRON_SCHEDULE` | No | `0 */6 * * *` | Cron expression for auto-sync frequency |
| `LEETCODE_API_URL` | No | `https://alfa-leetcode-api.onrender.com` | Base URL for the LeetCode proxy API |

### Client Configuration

| Setting | Location | Default |
|---|---|---|
| API Base URL | `client/src/api/api.js` | `http://localhost:5000/api` |
| Request Timeout | `client/src/api/api.js` | 30,000 ms (30 seconds) |

> **For production:** Update the `API_BASE` in `client/src/api/api.js` to point to your deployed backend URL.

---

## Troubleshooting

### "LeetCode user not found" error

- **Cause:** The username doesn't exist on LeetCode, or there's a typo.
- **Fix:** Double-check your LeetCode username at [https://leetcode.com/<username>](https://leetcode.com). The username is case-insensitive.

### No problems appear after registration

- **Cause:** The initial sync runs in the background and may take a few seconds, especially if the LeetCode proxy API is cold-starting (hosted on Render's free tier).
- **Fix:** Wait 10–30 seconds, then click the **Sync** button in the navbar. If the proxy is sleeping, it can take up to 1 minute to spin up.

### "Failed to load data" on the dashboard

- **Cause:** The backend server is not running or not reachable.
- **Fix:**
  1. Make sure the server is running (`npm run dev` in the `server/` directory).
  2. Check that the server port matches (default `5000`).
  3. Check the browser console for CORS or network errors.

### MongoDB connection error

- **Cause:** Invalid connection string, IP not whitelisted, or credentials are wrong.
- **Fix:**
  1. Verify your `MONGODB_URI` in `server/.env`.
  2. If using Atlas, ensure your current IP is in the **Network Access** whitelist.
  3. Check that the database user has read/write permissions.

### Problems don't update after clicking "Done"

- **Cause:** Network error or the problem ID is invalid.
- **Fix:** Check the browser console and server logs for error messages. Try refreshing the page.

### Cron sync isn't running

- **Cause:** Invalid cron expression in `.env`.
- **Fix:** Check the server startup logs. If you see `❌ Invalid cron schedule`, fix the `CRON_SCHEDULE` value. Use [https://crontab.guru](https://crontab.guru) to validate.

---

## FAQ

**Q: Do I need a LeetCode account to use this?**
A: You need a LeetCode account with a public profile, but you don't need to log in to this app. Just enter your username.

**Q: How many problems does it fetch?**
A: The app fetches the **20 most recent accepted submissions** on each sync. Over time, with auto-sync running every 6 hours, it will accumulate all your recently solved problems.

**Q: Can I track problems from both LeetCode and LeetCode CN?**
A: Currently, only the main LeetCode site (leetcode.com) is supported through the alfa-leetcode-api proxy.

**Q: What happens if I solve a problem multiple times on LeetCode?**
A: The app deduplicates by `titleSlug` — each problem is only tracked once per user.

**Q: Can I reset a problem's progress?**
A: Not through the UI currently. You would need to update the `currentInterval` and `nextReviewDate` directly in MongoDB.

**Q: What happens after a problem graduates?**
A: It no longer appears on the dashboard. You can still see it on the Progress page with a "Graduated" badge and 100% progress.

**Q: Is my LeetCode password required?**
A: **No.** The app only reads publicly available data (solved problems, difficulty, tags) through a third-party API. No authentication with LeetCode is needed.

**Q: Can multiple people use the same instance?**
A: Yes! Each user is tracked independently by their LeetCode username. The cron job syncs all registered users.

---

*Built with ❤️ to help developers retain what they learn.*
