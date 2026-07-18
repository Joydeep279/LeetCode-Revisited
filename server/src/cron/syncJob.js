import cron from "node-cron";
import User from "../models/User.js";
import Problem, { REVIEW_INTERVALS } from "../models/Problem.js";
import {
  fetchRecentSolvedProblems,
  fetchProblemDetails,
  fetchUserProfile,
} from "../services/leetcodeService.js";

/**
 * Sync a single user's solved problems from LeetCode.
 * Fetches recent submissions, checks for new problems,
 * and creates Problem documents with initial spaced repetition schedule.
 */
export async function syncUserProblems(user) {
  const username = user.leetcodeUsername;
  console.log(`🔄 Syncing problems for: ${username}`);

  try {
    // Fetch recent accepted submissions
    const recentProblems = await fetchRecentSolvedProblems(username);
    let newProblemsCount = 0;

    for (const sub of recentProblems) {
      // Check if problem already exists for this user
      const exists = await Problem.findOne({
        userId: user._id,
        titleSlug: sub.titleSlug,
      });

      if (!exists) {
        // Fetch detailed problem info (difficulty, tags)
        const details = await fetchProblemDetails(sub.titleSlug);

        // Calculate initial next review date (Day 1)
        const nextReviewDate = new Date();
        nextReviewDate.setDate(
          nextReviewDate.getDate() + REVIEW_INTERVALS[0]
        );

        await Problem.create({
          userId: user._id,
          titleSlug: sub.titleSlug,
          title: sub.title,
          difficulty: details.difficulty,
          topicTags: details.topicTags,
          leetcodeUrl: `https://leetcode.com/problems/${sub.titleSlug}/`,
          firstSolvedAt: sub.timestamp
            ? new Date(parseInt(sub.timestamp) * 1000)
            : new Date(),
          currentInterval: 0,
          nextReviewDate,
          reviewHistory: [],
          isCompleted: false,
        });

        newProblemsCount++;
        console.log(`  ✅ New problem added: ${sub.title}`);
      }
    }

    // Update user profile stats
    try {
      const profile = await fetchUserProfile(username);
      user.totalSolved = profile.totalSolved;
    } catch {
      // If profile fetch fails, count from DB
      user.totalSolved = await Problem.countDocuments({ userId: user._id });
    }

    user.lastSyncedAt = new Date();
    await user.save();

    console.log(
      `✅ Sync complete for ${username}: ${newProblemsCount} new problems added`
    );

    return { newProblemsCount, totalSynced: recentProblems.length };
  } catch (error) {
    console.error(`❌ Sync failed for ${username}:`, error.message);
    throw error;
  }
}

/**
 * Sync all registered users' problems.
 * Called by the cron job.
 */
async function syncAllUsers() {
  console.log("\n🕐 Cron job started: Syncing all users...");
  const startTime = Date.now();

  try {
    const users = await User.find({});

    if (users.length === 0) {
      console.log("  No registered users to sync.");
      return;
    }

    for (const user of users) {
      try {
        await syncUserProblems(user);
      } catch (error) {
        console.error(
          `  ⚠️ Skipping ${user.leetcodeUsername}: ${error.message}`
        );
      }

      // Small delay between users to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`🕐 Cron job complete. ${users.length} users synced in ${elapsed}s\n`);
  } catch (error) {
    console.error("❌ Cron job failed:", error.message);
  }
}

/**
 * Start the cron job with the configured schedule.
 * Default: every 6 hours ("0 * /6 * * *")
 */
export function startSyncCron() {
  const schedule = process.env.CRON_SCHEDULE || "0 */6 * * *";

  if (!cron.validate(schedule)) {
    console.error(`❌ Invalid cron schedule: "${schedule}". Using default.`);
    return;
  }

  cron.schedule(schedule, syncAllUsers, {
    timezone: "UTC",
  });

  console.log(`⏰ Cron job scheduled: "${schedule}" (UTC)`);
}
