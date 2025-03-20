const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: [true, "A habit must have a title"],
    trim: true,
    maxlength: [100, "A habit title cannot be more than 100 characters"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "A habit description cannot be more than 500 characters"],
  },
  category: {
    type: String,
    enum: [
      "exercise",
      "nutrition",
      "mindfulness",
      "sleep",
      "productivity",
      "other",
    ],
    default: "other",
  },
  frequency: {
    type: {
      type: String,
      enum: ["daily", "weekly", "specific_days"],
      default: "daily",
    },
    specificDays: {
      type: [Number],
      validate: {
        validator: function (arr) {
          return arr.every((val) => val >= 0 && val <= 6);
        },
        message: "Days must be between 0 (Sunday) and 6 (Saturday)",
      },
      default: [],
    },
    timesPerPeriod: {
      type: Number,
      min: [1, "Times per period must be at least 1"],
      default: 1,
    },
    periodLength: {
      type: String,
      enum: ["day", "week", "month"],
      default: "day",
    },
  },
  reminderTime: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  archivedAt: {
    type: Date,
    default: null,
  },
  streak: {
    current: {
      type: Number,
      default: 0,
    },
    longest: {
      type: Number,
      default: 0,
    },
  },
  color: {
    type: String,
    default: "#4CAF50", // Default green color
  },
  icon: {
    type: String,
    default: "check", // Default icon
  },
});

// Middleware
habitSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

habitSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Habit = mongoose.model("Habit", habitSchema);

module.exports = Habit;