import mongoose from "mongoose";

// Spaced repetition intervals in days
export const REVIEW_INTERVALS = [1, 3, 7, 15, 30, 60];

const problemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    titleSlug: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    topicTags: {
      type: [String],
      default: [],
    },
    leetcodeUrl: {
      type: String,
      required: true,
    },
    firstSolvedAt: {
      type: Date,
      default: Date.now,
    },
    currentInterval: {
      type: Number,
      default: 0, // index into REVIEW_INTERVALS
    },
    nextReviewDate: {
      type: Date,
      required: true,
    },
    reviewHistory: [
      {
        reviewedAt: { type: Date, default: Date.now },
        intervalIndex: { type: Number },
      },
    ],
    isCompleted: {
      type: Boolean,
      default: false, // true when graduated from spaced repetition
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate problems per user
problemSchema.index({ userId: 1, titleSlug: 1 }, { unique: true });

// Index for efficient "due today" queries
problemSchema.index({ userId: 1, nextReviewDate: 1, isCompleted: 1 });

const Problem = mongoose.model("Problem", problemSchema);

export default Problem;
