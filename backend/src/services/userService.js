const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");

/**
 * Get all users (admin only)
 * @param {Object} query - Query filters
 * @returns {Array} Array of users
 */
exports.getAllUsers = async (query = {}) => {
  return await User.find(query);
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Object} User data
 */
exports.getUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorResponse(`User not found with id of ${userId}`, 404);
  }

  return user;
};

/**
 * Create a new user (admin only)
 * @param {Object} userData - User data
 * @returns {Object} Created user
 */
exports.createUser = async (userData) => {
  const user = await User.create(userData);
  return user;
};

/**
 * Update a user
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated user
 */
exports.updateUser = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ErrorResponse(`User not found with id of ${userId}`, 404);
  }

  return user;
};

/**
 * Delete a user
 * @param {string} userId - User ID
 * @returns {boolean} Success status
 */
exports.deleteUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorResponse(`User not found with id of ${userId}`, 404);
  }

  await user.remove();
  return true;
};

/**
 * Update notification preferences
 * @param {string} userId - User ID
 * @param {Object} preferences - Notification preferences
 * @returns {Object} Updated user
 */
exports.updateNotificationPreferences = async (userId, preferences) => {
  // Validate timezone if provided
  if (preferences.timezone) {
    try {
      // Check if timezone is valid
      const isValid = moment.tz.zone(preferences.timezone);
      if (!isValid) {
        throw new ErrorResponse("Invalid timezone", 400);
      }
    } catch (err) {
      throw new ErrorResponse("Invalid timezone", 400);
    }
  }

  // Format reminder time if provided
  if (
    preferences.notificationPreferences &&
    preferences.notificationPreferences.reminderTime
  ) {
    const time = preferences.notificationPreferences.reminderTime;

    // Validate time format (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(time)) {
      throw new ErrorResponse(
        "Reminder time must be in HH:MM format (24-hour)",
        400
      );
    }
  }

  const fieldsToUpdate = {
    notificationPreferences: preferences.notificationPreferences,
    timezone: preferences.timezone,
  };

  const user = await User.findByIdAndUpdate(userId, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ErrorResponse(`User not found with id of ${userId}`, 404);
  }

  return user;
};

/**
 * Get user statistics
 * @param {string} userId - User ID
 * @returns {Object} User statistics
 */
exports.getUserStatistics = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorResponse(`User not found with id of ${userId}`, 404);
  }

  // Get habits
  const habits = await Habit.find({ userId });

  // Get check-ins
  const checkins = await Checkin.find({ userId });

  // Calculate statistics
  const stats = {
    totalHabits: habits.length,
    activeHabits: habits.filter((h) => !h.archivedAt).length,
    archivedHabits: habits.filter((h) => h.archivedAt).length,
    totalCheckins: checkins.length,
    completedCheckins: checkins.filter((c) => c.completed).length,
    longestStreak: Math.max(...habits.map((h) => h.streak.longest), 0),
    currentStreaks: habits.map((h) => ({
      habitId: h._id,
      habitTitle: h.title,
      streak: h.streak.current,
    })),
    accountCreated: user.createdAt,
    accountAge: moment().diff(moment(user.createdAt), "days"),
    premium: user.subscriptionStatus === "premium",
  };

  return stats;
};
