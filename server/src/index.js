import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import { startSyncCron } from "./cron/syncJob.js";

const app = express();

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Explicitly handle preflight OPTIONS for all routes
app.options("*", cors({ origin: allowedOrigins }));

app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/problems", problemRoutes);

// Root Welcome Message
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>LeetCode Revisited Server</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #0f172a; color: #f8fafc; }
          h1 { color: #38bdf8; }
          a { color: #a78bfa; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .container { text-align: center; padding: 2rem; border-radius: 1rem; background-color: #1e293b; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 LeetCode Revisited Server is Running!</h1>
          <p>The backend API is healthy and responding to requests.</p>
          <p>API Root: <a href="/api">/api</a></p>
          <p>Health Check: <a href="/api/health">/api/health</a></p>
        </div>
      </body>
    </html>
  `);
});

// API root
app.get("/api", (req, res) => {
  res.json({
    message: "LeetCode Revisited API",
    endpoints: ["/api/users", "/api/problems", "/api/health"],
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Connect to DB on cold start (for Vercel serverless)
connectDB().then(() => {
  startSyncCron();
}).catch((err) => {
  console.error("❌ Failed to connect to DB:", err.message);
});

// Start server only when running locally (not on Vercel)
if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    startSyncCron();
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
      console.log(`💓 Health: http://localhost:${PORT}/api/health\n`);
    });
  }).catch((error) => {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  });
}

// Export for Vercel serverless
export default app;
