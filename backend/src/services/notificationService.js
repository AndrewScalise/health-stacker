const User = require("../models/User");
const Habit = require("../models/Habit");
const moment = require("moment");
const sendEmail = require("../utils/sendEmail");

/**
 * Send habit reminders to users
 * @returns {number} Number of reminders sent
 */
exports.sendHabitReminders = async () => {
  // Get current time
  const now = moment();
  const currentHour = now.hour();

  // Find users who have set reminder time for the current hour
  const users = await User.find({
    "notificationPreferences.email": true,
    "notificationPreferences.reminderTime": {
      $regex: new RegExp(`^${currentHour.toString().padStart(2, "0")}:`),
    },
  });

  let remindersSent = 0;

  // Process each user
  for (const user of users) {
    // Get active habits for the user
    const habits = await Habit.find({
      userId: user._id,
      archivedAt: null,
    });

    if (habits.length === 0) {
      continue;
    }

    // Check which habits need to be completed today
    const today = now.format("YYYY-MM-DD");
    const habitsToRemind = [];

    for (const habit of habits) {
      // Check if habit should be done today
      const shouldDoToday = this.shouldHabitBeCompletedToday(habit);

      if (shouldDoToday) {
        habitsToRemind.push(habit);
      }
    }

    if (habitsToRemind.length === 0) {
      continue;
    }

    // Send reminder email
    try {
      await this.sendReminderEmail(user, habitsToRemind);
      remindersSent++;
    } catch (err) {
      console.error(`Failed to send reminder to user ${user._id}:`, err);
    }
  }

  return remindersSent;
};

/**
 * Check if a habit should be completed today based on its frequency
 * @param {Object} habit - Habit object
 * @returns {boolean} Whether the habit should be completed today
 */
exports.shouldHabitBeCompletedToday = (habit) => {
  const today = moment();
  const dayOfWeek = today.day(); // 0-6, Sunday-Saturday

  switch (habit.frequency.type) {
    case "daily":
      return true;

    case "weekly":
      // If no specific days set, assume any day is fine
      if (
        !habit.frequency.specificDays ||
        habit.frequency.specificDays.length === 0
      ) {
        return true;
      }
      // Check if today is one of the specific days
      return habit.frequency.specificDays.includes(dayOfWeek);

    case "specific_days":
      // Check if today is one of the specific days
      return habit.frequency.specificDays.includes(dayOfWeek);

    default:
      return true;
  }
};

/**
 * Send a reminder email to a user
 * @param {Object} user - User object
 * @param {Array} habits - Array of habits to remind about
 * @returns {boolean} Success status
 */
exports.sendReminderEmail = async (user, habits) => {
  const habitList = habits.map((habit) => `- ${habit.title}`).join("\n");

  const message = `
Hello ${user.firstName},

This is your daily reminder to complete the following habits:

${habitList}

Keep up the good work!

Best regards,
The HealthStack Team
  `;

  await sendEmail({
    email: user.email,
    subject: "Your HealthStack Daily Reminder",
    message,
  });

  return true;
};

/**
 * Send streak milestone notifications to users
 * @returns {number} Number of notifications sent
 */
exports.sendStreakMilestones = async () => {
  // Milestone thresholds (days)
  const milestones = [7, 30, 60, 90, 180, 365];

  let notificationsSent = 0;

  // Find habits that have just hit a milestone
  for (const milestone of milestones) {
    const habits = await Habit.find({
      "streak.current": milestone,
    }).populate("userId", "firstName email notificationPreferences.email");

    for (const habit of habits) {
      if (
        !habit.userId ||
        !habit.userId.notificationPreferences ||
        !habit.userId.notificationPreferences.email
      ) {
        continue;
      }

      // Send milestone email
      try {
        await this.sendMilestoneEmail(habit.userId, habit, milestone);
        notificationsSent++;
      } catch (err) {
        console.error(
          `Failed to send milestone notification for habit ${habit._id}:`,
          err
        );
      }
    }
  }

  return notificationsSent;
};

/**
 * Send a streak milestone email
 * @param {Object} user - User object
 * @param {Object} habit - Habit object
 * @param {number} milestone - Milestone days
 * @returns {boolean} Success status
 */
exports.sendMilestoneEmail = async (user, habit, milestone) => {
  // Customize message based on milestone
  let achievementText = `Congratulations on maintaining your habit "${habit.title}" for ${milestone} consecutive days!`;

  if (milestone >= 365) {
    achievementText = `🏆 INCREDIBLE ACHIEVEMENT! You've maintained your habit "${habit.title}" for a full year!`;
  } else if (milestone >= 180) {
    achievementText = `🏆 AMAZING MILESTONE! You've maintained your habit "${habit.title}" for 6 months straight!`;
  } else if (milestone >= 90) {
    achievementText = `🏆 HUGE ACHIEVEMENT! You've maintained your habit "${habit.title}" for 90 days straight!`;
  } else if (milestone >= 30) {
    achievementText = `🏆 MAJOR MILESTONE! You've maintained your habit "${habit.title}" for 30 days straight!`;
  } else if (milestone >= 7) {
    achievementText = `🏆 Great job! You've maintained your habit "${habit.title}" for a full week!`;
  }

  const message = `
Hello ${user.firstName},

${achievementText}

Research shows that consistency is key to forming lasting habits, and you're well on your way!

Keep up the amazing work!

Best regards,
The HealthStack Team
  `;

  await sendEmail({
    email: user.email,
    subject: `You've reached a ${milestone}-day streak on HealthStack!`,
    message,
  });

  return true;
};

/**
 * Send weekly summary emails to users
 * @returns {number} Number of summaries sent
 */
exports.sendWeeklySummaries = async () => {
  // Get current day of week
  const now = moment();
  const dayOfWeek = now.day(); // 0-6, Sunday-Saturday

  // Only send summaries on Sunday (day 0)
  if (dayOfWeek !== 0) {
    return 0;
  }

  // Get users who have subscribed to email notifications
  const users = await User.find({
    "notificationPreferences.email": true,
  });

  let summariesSent = 0;

  // Process each user
  for (const user of users) {
    try {
      // Get user habits
      const habits = await Habit.find({ userId: user._id });

      if (habits.length === 0) {
        continue;
      }

      // Generate weekly summary
      const summary = await this.generateWeeklySummary(user, habits);

      // Send summary email
      await this.sendSummaryEmail(user, summary);
      summariesSent++;
    } catch (err) {
      console.error(`Failed to send weekly summary to user ${user._id}:`, err);
    }
  }

  return summariesSent;
};

/**
 * Generate a weekly summary for a user
 * @param {Object} user - User object
 * @param {Array} habits - Array of habits
 * @returns {Object} Summary data
 */
exports.generateWeeklySummary = async (user, habits) => {
  // Get date range for the past week
  const endDate = moment().endOf("day");
  const startDate = moment().subtract(7, "days").startOf("day");

  // Initialize summary data
  const summary = {
    totalHabits: habits.length,
    activeHabits: habits.filter((h) => !h.archivedAt).length,
    completionRate: 0,
    habitPerformance: [],
    longestStreak: 0,
    bestHabit: null,
    worstHabit: null,
    improvementSuggestions: [],
  };

  // Calculate stats for each habit
  for (const habit of habits) {
    // Skip archived habits
    if (habit.archivedAt) {
      continue;
    }

    // Count check-ins for this habit in the past week
    const checkins = await Checkin.find({
      habitId: habit._id,
      date: {
        $gte: startDate.toDate(),
        $lte: endDate.toDate(),
      },
    });

    // Calculate completion rate for this habit
    let completedDays = 0;
    const totalPossibleDays = 7; // Simplification - in a real app you'd check habit frequency

    checkins.forEach((checkin) => {
      if (checkin.completed) {
        completedDays++;
      }
    });

    const habitCompletionRate = (completedDays / totalPossibleDays) * 100;

    // Add to habit performance array
    summary.habitPerformance.push({
      id: habit._id,
      title: habit.title,
      completionRate: habitCompletionRate,
      currentStreak: habit.streak.current,
      longestStreak: habit.streak.longest,
    });

    // Update longest streak
    if (habit.streak.current > summary.longestStreak) {
      summary.longestStreak = habit.streak.current;
    }

    // Generate improvement suggestions
    if (habitCompletionRate < 50) {
      summary.improvementSuggestions.push({
        habitId: habit._id,
        habitTitle: habit.title,
        suggestion: `Try to focus on improving "${habit.title}" next week. Consider making it easier or setting reminders.`,
      });
    }
  }

  // Calculate overall completion rate
  if (summary.habitPerformance.length > 0) {
    const totalCompletionRate = summary.habitPerformance.reduce(
      (sum, h) => sum + h.completionRate,
      0
    );
    summary.completionRate =
      totalCompletionRate / summary.habitPerformance.length;
  }

  // Identify best and worst habits
  if (summary.habitPerformance.length > 0) {
    // Sort by completion rate
    const sortedHabits = [...summary.habitPerformance].sort(
      (a, b) => b.completionRate - a.completionRate
    );

    summary.bestHabit = sortedHabits[0];
    summary.worstHabit = sortedHabits[sortedHabits.length - 1];
  }

  return summary;
};

/**
 * Send a weekly summary email
 * @param {Object} user - User object
 * @param {Object} summary - Summary data
 * @returns {boolean} Success status
 */
exports.sendSummaryEmail = async (user, summary) => {
  // Format habit performance table
  let habitPerformanceText = "";

  if (summary.habitPerformance.length > 0) {
    habitPerformanceText = "Your habits this week:\n\n";

    summary.habitPerformance.forEach((habit) => {
      habitPerformanceText += `- ${habit.title}: ${Math.round(
        habit.completionRate
      )}% completion rate, ${habit.currentStreak} day streak\n`;
    });
  }

  // Format improvement suggestions
  let suggestionsText = "";

  if (summary.improvementSuggestions.length > 0) {
    suggestionsText = "\nSuggestions for improvement:\n\n";

    summary.improvementSuggestions.forEach((suggestion) => {
      suggestionsText += `- ${suggestion.suggestion}\n`;
    });
  }

  // Format best habit highlight
  let bestHabitText = "";

  if (summary.bestHabit) {
    bestHabitText = `\nYour best performing habit is "${
      summary.bestHabit.title
    }" with a ${Math.round(
      summary.bestHabit.completionRate
    )}% completion rate. Great job!\n`;
  }

  const message = `
  Hello ${user.firstName},
  
  Here's your weekly habit summary from HealthStack:
  
  Overall completion rate: ${Math.round(summary.completionRate)}%
  Active habits: ${summary.activeHabits}
  Longest current streak: ${summary.longestStreak} days
  
  ${habitPerformanceText}
  ${bestHabitText}
  ${suggestionsText}
  
  Stay consistent and keep building those healthy habits!
  
  Best regards,
  The HealthStack Team
    `;

  await sendEmail({
    email: user.email,
    subject: "Your Weekly HealthStack Summary",
    message,
  });

  return true;
};
