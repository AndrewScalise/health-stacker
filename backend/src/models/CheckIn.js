const mongoose = require("mongoose");

const checkinSchema = new mongoose.Schema({
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Habit",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  completed: {
    type: Boolean,
    default: true,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, "Notes cannot be more than 1000 characters"],
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure one check-in per habit per day
checkinSchema.index({ habitId: 1, date: 1 }, { unique: true });

// Middleware
checkinSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Checkin = mongoose.model("Checkin", checkinSchema);

module.exports = Checkin;
