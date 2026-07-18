import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    leetcodeUsername: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
    totalSolved: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
