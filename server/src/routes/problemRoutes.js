import express from "express";
import User from "../models/User.js";
import Problem, { REVIEW_INTERVALS } from "../models/Problem.js";
import { syncUserProblems } from "../cron/syncJob.js";

const router = express.Router();

/**
 * GET /api/problems/:username/due
 * Get problems due for review today (nextReviewDate <= now).
 */
router.get("/:username/due", async (req, res) => {
  try {
    const user = await User.findOne({
      leetcodeUsername: req.params.username.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const now = new Date();
    // Set to end of today
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );

    const dueProblems = await Problem.find({
      userId: user._id,
      nextReviewDate: { $lte: endOfToday },
      isCompleted: false,
    }).sort({ nextReviewDate: 1 });

    return res.json({ problems: dueProblems, count: dueProblems.length });
  } catch (error) {
    console.error("Get due problems error:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/problems/:username/all
 * Get all problems for a user.
 */
router.get("/:username/all", async (req, res) => {
  try {
    const user = await User.findOne({
      leetcodeUsername: req.params.username.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const problems = await Problem.find({ userId: user._id }).sort({
      nextReviewDate: 1,
    });

    return res.json({ problems, count: problems.length });
  } catch (error) {
    console.error("Get all problems error:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /api/problems/:id/complete
 * Mark a problem as reviewed. Advance to the next spaced repetition interval.
 */
router.put("/:id/complete", async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    if (problem.isCompleted) {
      return res
        .status(400)
        .json({ error: "Problem already fully completed" });
    }

    // Record this review
    problem.reviewHistory.push({
      reviewedAt: new Date(),
      intervalIndex: problem.currentInterval,
    });

    // Advance to the next interval
    const nextIndex = problem.currentInterval + 1;

    if (nextIndex >= REVIEW_INTERVALS.length) {
      // Graduated from spaced repetition!
      problem.isCompleted = true;
      problem.nextReviewDate = new Date("9999-12-31"); // far future
    } else {
      problem.currentInterval = nextIndex;
      const daysToAdd = REVIEW_INTERVALS[nextIndex];
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + daysToAdd);
      problem.nextReviewDate = nextDate;
    }

    await problem.save();

    return res.json({
      message: problem.isCompleted
        ? "🎉 Problem fully graduated from revision!"
        : `Next review in ${REVIEW_INTERVALS[problem.currentInterval]} days`,
      problem,
    });
  } catch (error) {
    console.error("Complete problem error:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/problems/:username/stats
 * Get revision statistics for a user.
 */
router.get("/:username/stats", async (req, res) => {
  try {
    const user = await User.findOne({
      leetcodeUsername: req.params.username.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const now = new Date();
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );

    // Count by category
    const totalProblems = await Problem.countDocuments({ userId: user._id });
    const dueToday = await Problem.countDocuments({
      userId: user._id,
      nextReviewDate: { $lte: endOfToday },
      isCompleted: false,
    });
    const completedReviews = await Problem.countDocuments({
      userId: user._id,
      isCompleted: true,
    });

    // Upcoming in the next 7 days
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    const upcoming = await Problem.countDocuments({
      userId: user._id,
      nextReviewDate: { $gt: endOfToday, $lte: next7Days },
      isCompleted: false,
    });

    // Count total reviews made (sum of reviewHistory lengths)
    const reviewsAgg = await Problem.aggregate([
      { $match: { userId: user._id } },
      {
        $project: {
          reviewCount: { $size: { $ifNull: ["$reviewHistory", []] } },
        },
      },
      { $group: { _id: null, total: { $sum: "$reviewCount" } } },
    ]);
    const totalReviewsMade = reviewsAgg[0]?.total || 0;

    // Difficulty breakdown
    const difficultyBreakdown = await Problem.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
    ]);

    const difficulties = { Easy: 0, Medium: 0, Hard: 0 };
    for (const d of difficultyBreakdown) {
      difficulties[d._id] = d.count;
    }

    // Calculate streak: consecutive days with at least 1 review
    const allReviews = await Problem.aggregate([
      { $match: { userId: user._id } },
      { $unwind: "$reviewHistory" },
      { $sort: { "reviewHistory.reviewedAt": -1 } },
      {
        $project: {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$reviewHistory.reviewedAt",
            },
          },
        },
      },
      { $group: { _id: "$date" } },
      { $sort: { _id: -1 } },
    ]);

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < allReviews.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedStr = expectedDate.toISOString().split("T")[0];

      if (allReviews[i]._id === expectedStr) {
        streak++;
      } else {
        break;
      }
    }

    return res.json({
      totalProblems,
      dueToday,
      completedReviews,
      upcoming,
      totalReviewsMade,
      difficulties,
      streak,
      lastSyncedAt: user.lastSyncedAt,
    });
  } catch (error) {
    console.error("Get stats error:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/problems/:username/sync
 * Manually trigger a sync for a user.
 */
router.post("/:username/sync", async (req, res) => {
  try {
    const user = await User.findOne({
      leetcodeUsername: req.params.username.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const result = await syncUserProblems(user);

    return res.json({
      message: "Sync completed",
      ...result,
    });
  } catch (error) {
    console.error("Manual sync error:", error.message);
    return res.status(500).json({ error: "Sync failed" });
  }
});

export default router;
