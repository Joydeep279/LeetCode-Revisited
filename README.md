<div align="center">

# 🧠 LeetCode Revisited

### Never forget a LeetCode solution again.

A spaced-repetition revision tracker that schedules reviews of your solved LeetCode problems at scientifically optimal intervals — so you retain what you've learned, forever.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)

</div>

---

## 🎯 The Problem

You solve a LeetCode problem today. In two weeks, you've completely forgotten the approach. During interview prep, you end up re-solving the same problems from scratch because there's **no structured revision system**.

## 💡 The Solution

**LeetCode Revisited** uses the **forgetting curve** and **spaced repetition** to schedule reviews exactly when your memory needs them:

```
Day 1 → Day 3 → Day 7 → Day 15 → Day 30 → Day 60 → ✅ Graduated
```

After 6 review cycles, the solution is locked into long-term memory. No more forgetting.

---

## ✨ Features

| Feature | Description |
|:---|:---|
| 🔓 **No Login Required** | Just enter your public LeetCode username — no authentication needed |
| 🔄 **Auto-Import** | Fetches your recent accepted submissions from LeetCode automatically |
| 📅 **Smart Scheduling** | 6-step spaced repetition: Day 1 → 3 → 7 → 15 → 30 → 60 |
| 📋 **Daily Dashboard** | See only the problems due for revision today |
| ✅ **One-Click Review** | Click "Done" to advance to the next interval |
| 📊 **Progress Tracking** | Search, filter, sort all problems with progress bars |
| 🔥 **Streak Tracker** | Track consecutive days of revision activity |
| ⏰ **Auto-Sync** | Background cron job re-syncs every 6 hours |
| 🏷️ **Topic Tags** | Problems tagged with topics like Array, DP, Graph, etc. |
| 🎨 **Dark Theme** | Premium glassmorphism UI with smooth animations |

---

## 🛠️ Tech Stack

| Layer | Technology |
|:---|:---|
| **Frontend** | React · Vite · Tailwind CSS · React Router · Axios · Lucide Icons |
| **Backend** | Node.js · Express · Mongoose · node-cron |
| **Database** | MongoDB (Atlas or local) |
| **External API** | [alfa-leetcode-api](https://github.com/alfaarghya/alfa-leetcode-api) |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ &nbsp;·&nbsp; **npm** v9+ &nbsp;·&nbsp; **MongoDB** (Atlas or local)

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/leetcode-revisited.git
cd leetcode-revisited
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.xxxxx.mongodb.net/<dbname>
PORT=5000
CRON_SCHEDULE=0 */6 * * *
```

> 💡 Get a free MongoDB Atlas cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)

### 3. Set up the frontend

```bash
cd ../client
npm install
```

### 4. Run the app

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd server
npm run dev
```

```bash
# Terminal 2 — Frontend
cd client
npm run dev
```

### 5. Open in browser

Visit **[http://localhost:5173](http://localhost:5173)** and enter your LeetCode username to get started!

---

## 📖 How It Works

```
┌──────────────┐     ┌───────────────────┐     ┌──────────────┐     ┌──────────┐
│  LeetCode    │────▶│ alfa-leetcode-api │────▶│  Express     │────▶│ MongoDB  │
│  (Profile)   │     │  (Proxy API)      │     │  (Server)    │     │ (Atlas)  │
└──────────────┘     └───────────────────┘     └──────┬───────┘     └──────────┘
                                                      │
                                                      ▼
                                                ┌──────────────┐
                                                │  React App   │
                                                │  (Browser)   │
                                                └──────────────┘
```

1. **Enter your LeetCode username** — no login required
2. Your **recent solved problems** are fetched and stored with review schedules
3. The **dashboard** shows problems due for revision today
4. Click **"Done"** to advance a problem to the next spaced interval
5. After all 6 intervals → the problem **graduates** 🎓
6. A **cron job** auto-syncs new problems every 6 hours

---

## 📅 Spaced Repetition Schedule

| Step | Interval | Purpose |
|:---:|:---:|:---|
| 1 | Day 1 | Reinforce while fresh |
| 2 | Day 3 | First spaced review |
| 3 | Day 7 | Weekly consolidation |
| 4 | Day 15 | Bi-weekly strengthening |
| 5 | Day 30 | Monthly recall test |
| 6 | Day 60 | Long-term memory lock |
| ✅ | Graduated | No more reviews needed! |

---

## 📁 Project Structure

```
leetcode-revisited/
├── client/                          # React + Vite frontend
│   ├── src/
│   │   ├── api/api.js               # Axios HTTP client
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Navigation bar + sync button
│   │   │   ├── ProblemCard.jsx       # Problem card (solve/done actions)
│   │   │   ├── StatsCard.jsx         # Metric display card
│   │   │   ├── StreakTracker.jsx      # Weekly streak visualization
│   │   │   └── LoadingSpinner.jsx    # Loading state
│   │   └── pages/
│   │       ├── LandingPage.jsx       # Home — username input
│   │       ├── DashboardPage.jsx     # Daily revision view
│   │       └── ProgressPage.jsx      # All problems + filters
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                          # Node.js + Express backend
│   ├── src/
│   │   ├── config/db.js             # MongoDB connection
│   │   ├── cron/syncJob.js          # Auto-sync cron job
│   │   ├── models/
│   │   │   ├── User.js              # User schema
│   │   │   └── Problem.js           # Problem schema + intervals
│   │   ├── routes/
│   │   │   ├── userRoutes.js        # Registration + profile
│   │   │   └── problemRoutes.js     # Due, all, complete, stats, sync
│   │   ├── services/
│   │   │   └── leetcodeService.js   # LeetCode API integration
│   │   └── index.js                 # Express entry point
│   ├── .env                         # Environment variables
│   └── package.json
│
├── Documentation.md                 # Detailed documentation
└── README.md                        # ← You are here
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/users/register` | Register username + trigger sync |
| `GET` | `/api/users/:username` | Get user profile |
| `GET` | `/api/problems/:username/due` | Problems due for review today |
| `GET` | `/api/problems/:username/all` | All tracked problems |
| `PUT` | `/api/problems/:id/complete` | Mark review as done |
| `GET` | `/api/problems/:username/stats` | Revision statistics |
| `POST` | `/api/problems/:username/sync` | Manual sync trigger |

> 📚 For full API documentation with request/response examples, see [Documentation.md](./Documentation.md)

---

## ⚙️ Configuration

### Environment Variables (`server/.env`)

| Variable | Required | Default | Description |
|:---|:---:|:---|:---|
| `MONGODB_URI` | ✅ | — | MongoDB connection string |
| `PORT` | ❌ | `5000` | Server port |
| `CRON_SCHEDULE` | ❌ | `0 */6 * * *` | Auto-sync frequency ([crontab.guru](https://crontab.guru)) |
| `LEETCODE_API_URL` | ❌ | `https://alfa-leetcode-api.onrender.com` | LeetCode proxy API URL |

---

## 🐛 Troubleshooting

<details>
<summary><strong>"LeetCode user not found"</strong></summary>

Double-check your username at [leetcode.com/\<username\>](https://leetcode.com). Usernames are case-insensitive.
</details>

<details>
<summary><strong>No problems appear after registration</strong></summary>

The initial sync runs in the background. The LeetCode proxy API (hosted on Render free tier) may take up to 60 seconds to cold-start. Wait a moment, then click **Sync** in the navbar.
</details>

<details>
<summary><strong>MongoDB connection error</strong></summary>

1. Verify `MONGODB_URI` in `server/.env`
2. If using Atlas, whitelist your IP in **Network Access**
3. Check that the database user has read/write permissions
</details>

<details>
<summary><strong>Frontend can't connect to backend</strong></summary>

Ensure the server is running on port 5000. The frontend expects the API at `http://localhost:5000/api` (configured in `client/src/api/api.js`).
</details>

---

## 🗺️ Roadmap

- [ ] Email / push notifications for daily reminders
- [ ] Custom review intervals per problem
- [ ] Difficulty rating & confidence scoring
- [ ] Support for LeetCode CN
- [ ] User authentication & cloud sync
- [ ] Mobile-responsive PWA
- [ ] Import from other platforms (Codeforces, HackerRank)

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ to help developers retain what they learn.**

If this project helped you, consider giving it a ⭐!

</div>
