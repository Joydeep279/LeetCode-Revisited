import express from "express";
import User from "../models/User.js";
import { syncUserProblems } from "../cron/syncJob.js";
import { fetchUserProfile } from "../services/leetcodeService.js";

const router = express.Router();

/**
 * POST /api/users/register
 * Register a LeetCode username and trigger initial sync.
 */
router.post("/register", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || typeof username !== "string" || username.trim() === "") {
      return res.status(400).json({ error: "Username is required" });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check if user already exists
    let user = await User.findOne({ leetcodeUsername: cleanUsername });

    if (user) {
      return res.status(200).json({
        message: "User already registered",
        user,
        isExisting: true,
      });
    }

    // Validate the username exists on LeetCode
    try {
      await fetchUserProfile(cleanUsername);
    } catch {
      return res.status(404).json({
        error: `LeetCode user "${cleanUsername}" not found. Please check the username.`,
      });
    }

    // Create the user
    user = await User.create({
      leetcodeUsername: cleanUsername,
    });

    // Trigger initial sync (don't await — let it run in background)
    syncUserProblems(user).catch((err) =>
      console.error("Initial sync error:", err.message)
    );

    return res.status(201).json({
      message: "User registered. Initial sync started.",
      user,
      isExisting: false,
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/users/:username
 * Get user profile and stats.
 */
router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      leetcodeUsername: req.params.username.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Get user error:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
