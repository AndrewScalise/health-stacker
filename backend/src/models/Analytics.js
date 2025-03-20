const mongoose = require("mongoose");

const AnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Habit",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  dailyStats: {
    completionRate: Number,
    streakCurrent: Number,
    streakLongest: Number,
  },
  weeklyStats: {
    completionRate: Number,
    completionByDay: Object, // { "Monday": 0.8, "Tuesday": 0.6, ... }
    totalCompleted: Number,
    totalPossible: Number,
  },
  monthlyStats: {
    completionRate: Number,
    bestWeek: Number, // Week of the month (1-5)
    worstWeek: Number,
    streakHistory: [
      {
        startDate: Date,
        endDate: Date,
        length: Number,
      },
    ],
  },
  calculatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for efficient queries
AnalyticsSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Analytics", AnalyticsSchema);
