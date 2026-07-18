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
