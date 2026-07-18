import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import { startSyncCron } from "./cron/syncJob.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/problems", problemRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  try {
    await connectDB();

    // Start cron job for periodic syncing
    startSyncCron();

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
      console.log(`💓 Health: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

start();
