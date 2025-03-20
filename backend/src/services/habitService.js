const Habit = require("../models/Habit");
const Checkin = require("../models/Checkin");
const ErrorResponse = require("../utils/errorResponse");
const streakCalculator = require("../utils/streakCalculator");

/**
 * Get all habits for a user
 * @param {string} userId - User ID
 * @param {Object} filters - Optional filters
 * @returns {Array} Array of habits
 */
exports.getUserHabits = async (userId, filters = {}) => {
  // Prepare query object
  const query = { userId, ...filters };

  // Remove undefined or null values
  Object.keys(query).forEach(
    (key) => query[key] === undefined && delete query[key]
  );

  const habits = await Habit.find(query);
  return habits;
};

/**
 * Get a single habit
 * @param {string} habitId - Habit ID
 * @param {string} userId - User ID
 * @returns {Object} Habit data
 */
exports.getHabit = async (habitId, userId) => {
  const habit = await Habit.findOne({
    _id: habitId,
    userId,
  });

  if (!habit) {
    throw new ErrorResponse(`Habit not found with id of ${habitId}`, 404);
  }

  return habit;
};

/**
 * Create a new habit
 * @param {Object} habitData - Habit data
 * @param {string} userId - User ID
 * @returns {Object} Created habit
 */
exports.createHabit = async (habitData, userId) => {
  // Add user to habit data
  habitData.userId = userId;

  // Set initial streak
  habitData.streak = { current: 0, longest: 0 };

  // Create habit
  const habit = await Habit.create(habitData);
  return habit;
};

/**
 * Update a habit
 * @param {string} habitId - Habit ID
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated habit
 */
exports.updateHabit = async (habitId, userId, updateData) => {
  let habit = await Habit.findOne({
    _id: habitId,
    userId,
  });

  if (!habit) {
    throw new ErrorResponse(`Habit not found with id of ${habitId}`, 404);
  }

  // Update habit
  habit = await Habit.findByIdAndUpdate(habitId, updateData, {
    new: true,
    runValidators: true,
  });

  return habit;
};

/**
 * Delete a habit
 * @param {string} habitId - Habit ID
 * @param {string} userId - User ID
 * @returns {boolean} Success status
 */
exports.deleteHabit = async (habitId, userId) => {
  const habit = await Habit.findOne({
    _id: habitId,
    userId,
  });

  if (!habit) {
    throw new ErrorResponse(`Habit not found with id of ${habitId}`, 404);
  }

  // Remove all associated check-ins
  await Checkin.deleteMany({ habitId });

  // Remove the habit
  await habit.remove();

  return true;
};

/**
 * Archive/unarchive a habit
 * @param {string} habitId - Habit ID
 * @param {string} userId - User ID
 * @param {boolean} archive - Whether to archive or unarchive
 * @returns {Object} Updated habit
 */
exports.toggleArchiveHabit = async (habitId, userId, archive = true) => {
  const habit = await Habit.findOne({
    _id: habitId,
    userId,
  });

  if (!habit) {
    throw new ErrorResponse(`Habit not found with id of ${habitId}`, 404);
  }

  // Set archive date or remove it
  habit.archivedAt = archive ? Date.now() : null;
  await habit.save();

  return habit;
};

/**
 * Get all check-ins for a habit
 * @param {string} habitId - Habit ID
 * @param {string} userId - User ID
 * @param {Object} filters - Optional filters
 * @returns {Array} Array of check-ins
 */
exports.getHabitCheckins = async (habitId, userId, filters = {}) => {
  // Verify the habit exists and belongs to user
  const habit = await Habit.findOne({
    _id: habitId,
    userId,
  });

  if (!habit) {
    throw new ErrorResponse(`Habit not found with id of ${habitId}`, 404);
  }

  // Prepare query object
  const query = { habitId, ...filters };

  // Remove undefined or null values
  Object.keys(query).forEach(
    (key) => query[key] === undefined && delete query[key]
  );

  const checkins = await Checkin.find(query).sort({ date: -1 });
  return checkins;
};

/**
 * Create or update a check-in for a habit
 * @param {string} habitId - Habit ID
 * @param {string} userId - User ID
 * @param {Object} checkinData - Check-in data
 * @returns {Object} Check-in data and streak info
 */
exports.createOrUpdateCheckin = async (habitId, userId, checkinData) => {
  // Verify the habit exists and belongs to user
  const habit = await Habit.findOne({
    _id: habitId,
    userId,
  });

  if (!habit) {
    throw new ErrorResponse(`Habit not found with id of ${habitId}`, 404);
  }

  // Set habit and user IDs
  checkinData.habitId = habitId;
  checkinData.userId = userId;

  // Check if a check-in already exists for this date and habit
  const existingCheckin = await Checkin.findOne({
    habitId,
    date: new Date(checkinData.date),
  });

  let checkin;

  if (existingCheckin) {
    // Update existing check-in
    checkin = await Checkin.findByIdAndUpdate(
      existingCheckin._id,
      checkinData,
      {
        new: true,
        runValidators: true,
      }
    );
  } else {
    // Create new check-in
    checkin = await Checkin.create(checkinData);
  }

  // Calculate streak
  const { currentStreak, longestStreak } =
    await streakCalculator.calculateStreak(habitId);

  // Update habit with new streak values
  await Habit.findByIdAndUpdate(
    habitId,
    {
      streak: {
        current: currentStreak,
        longest: longestStreak,
      },
    },
    { new: true }
  );

  return {
    checkin,
    streak: {
      current: currentStreak,
      longest: longestStreak,
    },
  };
};

/**
 * Delete a check-in
 * @param {string} checkinId - Check-in ID
 * @param {string} userId - User ID
 * @returns {Object} Streak info
 */
exports.deleteCheckin = async (checkinId, userId) => {
  const checkin = await Checkin.findOne({
    _id: checkinId,
    userId,
  });

  if (!checkin) {
    throw new ErrorResponse(`Check-in not found with id of ${checkinId}`, 404);
  }

  const habitId = checkin.habitId;

  await checkin.remove();

  // Recalculate streak
  const { currentStreak, longestStreak } =
    await streakCalculator.calculateStreak(habitId);

  // Update habit with new streak values
  await Habit.findByIdAndUpdate(
    habitId,
    {
      streak: {
        current: currentStreak,
        longest: longestStreak,
      },
    },
    { new: true }
  );

  return {
    streak: {
      current: currentStreak,
      longest: longestStreak,
    },
  };
};
