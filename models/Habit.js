import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "fa-heart",
    },
    streak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    completionLog: {
      type: Map,
      of: Boolean, // المفتاح = تاريخ (string)، والقيمة = true/false
      default: {},
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Habit = mongoose.model("Habit", habitSchema);
export default Habit;
