// src/controllers/habitController.js
const Habit = require("../models/Habit");
const Checkin = require("../models/Checkin");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const { calculateStreak } = require("../utils/streakCalculator");

// @desc    Get all habits for current user
// @route   GET /api/habits
// @access  Private
exports.getHabits = asyncHandler(async (req, res, next) => {
  const habits = await Habit.find({ userId: req.user.id });

  res.status(200).json({
    success: true,
    count: habits.length,
    data: habits,
  });
});

// @desc    Get a single habit
// @route   GET /api/habits/:id
// @access  Private
exports.getHabit = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!habit) {
    return next(
      new ErrorResponse(`Habit not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: habit,
  });
});

// @desc    Create new habit
// @route   POST /api/habits
// @access  Private
exports.createHabit = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.userId = req.user.id;

  // Set initial streak
  req.body.streak = { current: 0, longest: 0 };

  const habit = await Habit.create(req.body);

  res.status(201).json({
    success: true,
    data: habit,
  });
});

// @desc    Update habit
// @route   PUT /api/habits/:id
// @access  Private
exports.updateHabit = asyncHandler(async (req, res, next) => {
  let habit = await Habit.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!habit) {
    return next(
      new ErrorResponse(`Habit not found with id of ${req.params.id}`, 404)
    );
  }

  habit = await Habit.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: habit,
  });
});

// @desc    Delete habit
// @route   DELETE /api/habits/:id
// @access  Private
exports.deleteHabit = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!habit) {
    return next(
      new ErrorResponse(`Habit not found with id of ${req.params.id}`, 404)
    );
  }

  // Remove all associated check-ins
  await Checkin.deleteMany({ habitId: req.params.id });

  // Remove the habit
  await habit.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Archive habit
// @route   PUT /api/habits/:id/archive
// @access  Private
exports.archiveHabit = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!habit) {
    return next(
      new ErrorResponse(`Habit not found with id of ${req.params.id}`, 404)
    );
  }

  // Set archive date
  habit.archivedAt = Date.now();
  await habit.save();

  res.status(200).json({
    success: true,
    data: habit,
  });
});

// @desc    Unarchive habit
// @route   PUT /api/habits/:id/unarchive
// @access  Private
exports.unarchiveHabit = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!habit) {
    return next(
      new ErrorResponse(`Habit not found with id of ${req.params.id}`, 404)
    );
  }

  // Remove archive date
  habit.archivedAt = null;
  await habit.save();

  res.status(200).json({
    success: true,
    data: habit,
  });
});

// @desc    Get all check-ins for a habit
// @route   GET /api/habits/:id/checkins
// @access  Private
exports.getCheckins = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!habit) {
    return next(
      new ErrorResponse(`Habit not found with id of ${req.params.id}`, 404)
    );
  }

  const checkins = await Checkin.find({ habitId: req.params.id }).sort({
    date: -1,
  });

  res.status(200).json({
    success: true,
    count: checkins.length,
    data: checkins,
  });
});

// @desc    Create check-in for a habit
// @route   POST /api/habits/:id/checkins
// @access  Private
exports.createCheckin = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!habit) {
    return next(
      new ErrorResponse(`Habit not found with id of ${req.params.id}`, 404)
    );
  }

  // Set habit and user IDs
  req.body.habitId = req.params.id;
  req.body.userId = req.user.id;

  // Check if a check-in already exists for this date and habit
  const existingCheckin = await Checkin.findOne({
    habitId: req.params.id,
    date: new Date(req.body.date),
  });

  let checkin;

  if (existingCheckin) {
    // Update existing check-in
    checkin = await Checkin.findByIdAndUpdate(existingCheckin._id, req.body, {
      new: true,
      runValidators: true,
    });
  } else {
    // Create new check-in
    checkin = await Checkin.create(req.body);
  }

  // Calculate streak
  const { currentStreak, longestStreak } = await calculateStreak(req.params.id);

  // Update habit with new streak values
  await Habit.findByIdAndUpdate(
    req.params.id,
    {
      streak: {
        current: currentStreak,
        longest: longestStreak,
      },
    },
    { new: true }
  );

  res.status(201).json({
    success: true,
    data: checkin,
    streak: {
      current: currentStreak,
      longest: longestStreak,
    },
  });
});

// @desc    Delete check-in
// @route   DELETE /api/checkins/:id
// @access  Private
exports.deleteCheckin = asyncHandler(async (req, res, next) => {
  const checkin = await Checkin.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!checkin) {
    return next(
      new ErrorResponse(`Check-in not found with id of ${req.params.id}`, 404)
    );
  }

  await checkin.remove();

  // Recalculate streak
  const { currentStreak, longestStreak } = await calculateStreak(
    checkin.habitId
  );

  // Update habit with new streak values
  await Habit.findByIdAndUpdate(
    checkin.habitId,
    {
      streak: {
        current: currentStreak,
        longest: longestStreak,
      },
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: {},
    streak: {
      current: currentStreak,
      longest: longestStreak,
    },
  });
});
