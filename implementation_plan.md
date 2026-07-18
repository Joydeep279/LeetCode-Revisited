# LeetCode Spaced Repetition Revision Tracker

A full-stack app that uses **spaced repetition** to help developers revise previously solved LeetCode problems. The backend uses a **cron job** with `leetcode-query` to periodically fetch and sync solved problems from LeetCode.

## Tech Stack (from plan.md)

| Layer | Technology |
|-------|-----------|
| Frontend | React + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB (via Mongoose) |
| LeetCode API | `leetcode-query` npm package |
| Cron | `node-cron` (in-process scheduler) |

---

## User Review Required

> [!IMPORTANT]
> **MongoDB Connection**: You'll need a running MongoDB instance. The app will default to `mongodb://localhost:27017/leetcode-revisited`. Do you have MongoDB running locally, or should I configure it for **MongoDB Atlas** (cloud)?

> [!IMPORTANT]
> **Tailwind CSS Version**: The plan specifies Tailwind CSS. I'll use **Tailwind CSS v3** with the Vite React setup. Let me know if you prefer v4.

---

## Open Questions

> [!IMPORTANT]
> **LeetCode API Limitation**: The `leetcode-query` package can only fetch the **20 most recent submissions** without authentication. To get the full solved problem list, we'll use the `recentSubmissionList` query plus paginated fetching. If you have a LeetCode session cookie, we can fetch the complete submission history. For MVP, I'll use the public API (recent submissions) and accumulate problems over time via the cron job.

---

## Proposed Changes

### Project Structure

```
LeetCode Revisited/
├── plan.md                    (existing)
├── server/                    (backend)
│   ├── package.json
│   ├── .env
│   ├── src/
│   │   ├── index.js           (Express server + cron setup)
│   │   ├── config/
│   │   │   └── db.js          (MongoDB connection)
│   │   ├── models/
│   │   │   ├── User.js        (User schema)
│   │   │   └── Problem.js     (Problem + revision schedule schema)
│   │   ├── routes/
│   │   │   ├── userRoutes.js  (Register username, get user)
│   │   │   └── problemRoutes.js (Get due problems, mark completed, stats)
│   │   ├── services/
│   │   │   └── leetcodeService.js (Fetch from LeetCode via leetcode-query)
│   │   └── cron/
│   │       └── syncJob.js     (node-cron job to sync problems)
│   └── .gitignore
├── client/                    (frontend)
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── api/
│   │   │   └── api.js         (Axios API calls)
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   └── ProgressPage.jsx
│   │   └── components/
│   │       ├── Navbar.jsx
│   │       ├── ProblemCard.jsx
│   │       ├── StatsCard.jsx
│   │       ├── StreakTracker.jsx
│   │       └── LoadingSpinner.jsx
│   └── .gitignore
```

---

### Backend — Server

#### [NEW] [package.json](file:///c:/Users/joyde/OneDrive/Documents/LeetCode%20Revisited/server/package.json)
- Dependencies: `express`, `mongoose`, `cors`, `dotenv`, `leetcode-query`, `node-cron`
- Dev: `nodemon`
- Scripts: `start`, `dev`

#### [NEW] [.env](file:///c:/Users/joyde/OneDrive/Documents/LeetCode%20Revisited/server/.env)
- `MONGODB_URI`, `PORT=5000`, `CRON_SCHEDULE=0 */6 * * *` (every 6 hours)

#### [NEW] [db.js](file:///c:/Users/joyde/OneDrive/Documents/LeetCode%20Revisited/server/src/config/db.js)
- Mongoose connection with retry logic

#### [NEW] [User.js](file:///c:/Users/joyde/OneDrive/Documents/LeetCode%20Revisited/server/src/models/User.js)
```js
{
  leetcodeUsername: String (unique, required),
  registeredAt: Date,
  lastSyncedAt: Date,
  totalSolved: Number
}
```

#### [NEW] [Problem.js](file:///c:/Users/joyde/OneDrive/Documents/LeetCode%20Revisited/server/src/models/Problem.js)
```js
{
  userId: ObjectId (ref: User),
  titleSlug: String,
  title: String,
  difficulty: String (Easy/Medium/Hard),
  topicTags: [String],
  leetcodeUrl: String,
  firstSolvedAt: Date,
  currentInterval: Number (index into schedule array),
  nextReviewDate: Date,
  reviewHistory: [{ reviewedAt: Date, intervalIndex: Number }],
  isCompleted: Boolean (true = fully graduated from spaced repetition)
}
```

**Spaced Repetition Schedule** (days): `[1, 3, 7, 15, 30, 60]`
- When a problem is first imported → `nextReviewDate = today + 1 day`
- On "Mark Completed" → advance `currentInterval` to next index, set `nextReviewDate = today + schedule[nextIndex]`
- After Day 60 → mark as `isCompleted: true`

#### [NEW] [leetcodeService.js](file:///c:/Users/joyde/OneDrive/Documents/LeetCode%20Revisited/server/src/services/leetcodeService.js)
- Uses `leetcode-query` package:
  ```js
  import { LeetCode } from "leetcode-query";
  const lc = new LeetCode();
  const user = await lc.user(username);          // profile + stats
  const recent = await lc.recent_submissions(username); // last 20 submissions
  ```
- Filters for `statusDisplay === "Accepted"`, deduplicates by `titleSlug`
- Returns structured problem data

#### [NEW] [syncJob.js](file:///c:/Users/joyde/OneDrive/Documents/LeetCode%20Revisited/server/src/cron/syncJob.js)
- Uses `node-cron` to run every 6 hours (configurable via `.env`)
- For each registered user:
  1. Fetches recent submissions via `leetcodeService`
  2. Checks if problem already exists in DB
  3. If new → creates Problem document with initial spaced repetition schedule
  4. Updates `User.lastSyncedAt` and `User.totalSolved`
- Also runs immediately on user registration (first sync)

#### [NEW] [userRoutes.js](file:///c:/Users/joyde/OneDrive/Documents/LeetCode%20Revisited/server/src/routes/userRoutes.js)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register LeetCode username, trigger initial sync |
| GET | `/api/users/:username` | Get user profile + stats |

#### [NEW] [problemRoutes.js](file:///c:/Users/joyde/OneDrive/Documents/LeetCode%20Revisited/server/src/routes/problemRoutes.js)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/problems/:username/due` | Get problems due today (nextReviewDate ≤ today) |
| GET | `/api/problems/:username/all` | Get all problems for user |
| PUT | `/api/problems/:id/complete` | Mark problem as reviewed, advance to next interval |
| GET | `/api/problems/:username/stats` | Get revision statistics |
| POST | `/api/problems/:username/sync` | Manually trigger a sync |

#### [NEW] [index.js](file:///c:/Users/joyde/OneDrive/Documents/LeetCode%20Revisited/server/src/index.js)
- Express app setup with CORS, JSON parsing
- Connect to MongoDB
- Register routes
- Start cron job
- Listen on PORT

---

### Frontend — Client

#### [NEW] [package.json](file:///c:/Users/joyde/OneDrive/Documents/LeetCode%20Revisited/client/package.json)
- Vite + React setup
- Dependencies: `react-router-dom`, `axios`, `lucide-react`

#### [NEW] [index.css](file:///c:/Users/joyde/OneDrive/Documents/LeetCode%20Revisited/client/src/index.css)
- Tailwind directives + custom design system
- Dark theme with LeetCode-inspired color palette (dark charcoal bg, vibrant green/yellow/red for difficulty)
- Glassmorphism cards, smooth transitions, gradient accents

#### [NEW] [App.jsx](file:///c:/Users/joyde/OneDrive/Documents/LeetCode%20Revisited/client/src/App.jsx)
- React Router setup: `/` → Landing, `/dashboard/:username` → Dashboard, `/progress/:username` → Progress

#### [NEW] [LandingPage.jsx](file:///c:/Users/joyde/OneDrive/Documents/LeetCode%20Revisited/client/src/pages/LandingPage.jsx)
- Hero section with animated gradient
- Username input form with validation
- Calls `POST /api/users/register`, then navigates to dashboard
- Animated background elements, premium feel

#### [NEW] [DashboardPage.jsx](file:///c:/Users/joyde/OneDrive/Documents/LeetCode%20Revisited/client/src/pages/DashboardPage.jsx)
- **Stats bar**: Total solved, due today, reviewed count, upcoming
- **Problem cards**: List of due problems with:
  - Problem name (clickable → LeetCode)
  - Difficulty badge (colored)
  - Topic tags
  - "Solve" button (external link)
  - "Mark Completed" button (advances schedule)
- "Sync Now" button to manually trigger fetch
- Empty state when no problems are due

#### [NEW] [ProgressPage.jsx](file:///c:/Users/joyde/OneDrive/Documents/LeetCode%20Revisited/client/src/pages/ProgressPage.jsx)
- Total solved problems
- Problems due today
- Problems revised (completed reviews)
- Upcoming revisions (next 7 days)
- Revision streak (consecutive days with at least 1 review)
- Difficulty breakdown chart (visual bars)

#### [NEW] Component Files
- **Navbar.jsx**: Navigation with username display, links to Dashboard/Progress
- **ProblemCard.jsx**: Individual problem card with glassmorphism, difficulty indicator, action buttons
- **StatsCard.jsx**: Stat display card with icon, label, value, gradient border
- **StreakTracker.jsx**: Visual streak display (like GitHub contribution graph, simplified)
- **LoadingSpinner.jsx**: Animated loading state

---

## Verification Plan

### Automated Tests
```bash
# Backend: Verify server starts and connects to DB
cd server && npm run dev

# Frontend: Verify Vite dev server starts
cd client && npm run dev
```

### Manual Verification
1. Start MongoDB, backend, and frontend
2. Enter a LeetCode username on the landing page
3. Verify problems are fetched and displayed on the dashboard
4. Click "Mark Completed" and verify next review date advances
5. Check Progress page for correct statistics
6. Wait for cron job to run (or trigger manual sync) and verify new problems appear
