const Habit = require("../models/Habit");
const Checkin = require("../models/Checkin");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const moment = require("moment");

/**
 * Get overview analytics for a user
 * @param {string} userId - User ID
 * @returns {Object} Analytics overview
 */
exports.getAnalyticsOverview = async (userId) => {
  // Get all habits for this user
  const habits = await Habit.find({ userId });

  // Get today's date
  const today = moment().startOf("day");

  // Get all check-ins for the past 30 days
  const thirtyDaysAgo = moment().subtract(30, "days").startOf("day");

  const checkins = await Checkin.find({
    userId,
    date: { $gte: thirtyDaysAgo.toDate() },
  });

  // Calculate analytics
  const analytics = {
    // Habit counts
    habitCounts: {
      total: habits.length,
      active: habits.filter((h) => !h.archivedAt).length,
      archived: habits.filter((h) => h.archivedAt).length,
    },

    // Streak data
    streaks: {
      current: habits.map((h) => h.streak.current),
      longest: habits.map((h) => h.streak.longest),
      average:
        habits.length > 0
          ? habits.reduce((acc, h) => acc + h.streak.current, 0) / habits.length
          : 0,
      maxCurrent:
        habits.length > 0
          ? Math.max(...habits.map((h) => h.streak.current))
          : 0,
      maxLongest:
        habits.length > 0
          ? Math.max(...habits.map((h) => h.streak.longest))
          : 0,
    },

    // Completion data
    completion: {
      today: {
        completed: checkins.filter(
          (c) => moment(c.date).isSame(today, "day") && c.completed
        ).length,
        total: habits.filter((h) => !h.archivedAt).length,
        rate:
          habits.length > 0
            ? (checkins.filter(
                (c) => moment(c.date).isSame(today, "day") && c.completed
              ).length /
                habits.filter((h) => !h.archivedAt).length) *
              100
            : 0,
      },
      thisWeek: calculateCompletionForPeriod(checkins, habits, 7),
      thisMonth: calculateCompletionForPeriod(checkins, habits, 30),
    },

    // Habits by category
    categories: calculateCategoryData(habits),
  };

  // Get user to check subscription status
  const user = await User.findById(userId);

  // Add premium features if user has premium subscription
  if (user && user.subscriptionStatus === "premium") {
    analytics.consistency = calculateConsistencyData(checkins, habits);
  }

  return analytics;
};

/**
 * Get detailed analytics for a specific habit
 * @param {string} habitId - Habit ID
 * @param {string} userId - User ID
 * @returns {Object} Habit analytics
 */
exports.getHabitAnalytics = async (habitId, userId) => {
  const habit = await Habit.findOne({
    _id: habitId,
    userId,
  });

  if (!habit) {
    throw new ErrorResponse(`Habit not found with id of ${habitId}`, 404);
  }

  // Get all check-ins for this habit
  const checkins = await Checkin.find({ habitId });

  // Get user to check subscription status
  const user = await User.findById(userId);
  const isPremium = user && user.subscriptionStatus === "premium";

  // Calculate detailed analytics
  const analytics = {
    // Basic habit info
    habit: {
      id: habit._id,
      title: habit.title,
      description: habit.description,
      category: habit.category,
      createdAt: habit.createdAt,
      streakCurrent: habit.streak.current,
      streakLongest: habit.streak.longest,
    },

    // Completion rates
    completion: {
      overall: calculateOverallCompletion(checkins, habit),
      byDay: calculateCompletionByDay(checkins),
      byWeek: calculateCompletionByWeek(checkins),
      byMonth: calculateCompletionByMonth(checkins),
    },
  };

  // Add premium features if user has premium subscription
  if (isPremium) {
    analytics.streakHistory = calculateStreakHistory(checkins);
    analytics.patterns = {
      bestDay: findBestDay(checkins),
      worstDay: findWorstDay(checkins),
      averagePerformance: calculateAveragePerformance(checkins),
      consistency: calculateHabitConsistency(checkins),
    };
  }

  return analytics;
};

/**
 * Export all user data (premium feature)
 * @param {string} userId - User ID
 * @returns {Object} User data export
 */
exports.exportUserData = async (userId) => {
  // Get user to check subscription status
  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorResponse("User not found", 404);
  }

  if (user.subscriptionStatus !== "premium") {
    throw new ErrorResponse(
      "This feature requires a premium subscription",
      403
    );
  }

  // Get all habits and check-ins for this user
  const habits = await Habit.find({ userId });
  const checkins = await Checkin.find({ userId });

  // Format data for export
  const exportData = {
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    },
    habits: habits.map((habit) => ({
      id: habit._id,
      title: habit.title,
      description: habit.description,
      category: habit.category,
      frequency: habit.frequency,
      color: habit.color,
      icon: habit.icon,
      createdAt: habit.createdAt,
      streak: habit.streak,
      archivedAt: habit.archivedAt,
    })),
    checkins: checkins.map((checkin) => ({
      id: checkin._id,
      habitId: checkin.habitId,
      date: checkin.date,
      completed: checkin.completed,
      notes: checkin.notes,
      createdAt: checkin.createdAt,
    })),
  };

  return exportData;
};

// Helper functions for analytics calculations

function calculateCompletionForPeriod(checkins, habits, days) {
  const startDate = moment().subtract(days, "days").startOf("day");
  const endDate = moment().endOf("day");

  const activeDaysInPeriod = moment().diff(startDate, "days") + 1;
  const activeHabits = habits.filter(
    (h) => !h.archivedAt || moment(h.archivedAt).isAfter(startDate)
  );

  const potentialCompletions = activeHabits.length * activeDaysInPeriod;
  const actualCompletions = checkins.filter(
    (c) =>
      moment(c.date).isBetween(startDate, endDate, null, "[]") && c.completed
  ).length;

  return {
    completed: actualCompletions,
    potential: potentialCompletions,
    rate:
      potentialCompletions > 0
        ? (actualCompletions / potentialCompletions) * 100
        : 0,
  };
}

function calculateCategoryData(habits) {
  const categories = {};

  habits.forEach((habit) => {
    const category = habit.category || "uncategorized";

    if (!categories[category]) {
      categories[category] = {
        count: 0,
        completed: 0,
        streak: 0,
      };
    }

    categories[category].count += 1;
    categories[category].streak += habit.streak.current;
  });

  // Calculate averages
  for (const category in categories) {
    categories[category].averageStreak =
      categories[category].streak / categories[category].count;
  }

  return categories;
}

function calculateConsistencyData(checkins, habits) {
  // Group check-ins by date
  const checkinsGroupedByDate = {};

  checkins.forEach((checkin) => {
    const dateKey = moment(checkin.date).format("YYYY-MM-DD");

    if (!checkinsGroupedByDate[dateKey]) {
      checkinsGroupedByDate[dateKey] = [];
    }

    checkinsGroupedByDate[dateKey].push(checkin);
  });

  // Calculate consistency score for each day
  const consistencyByDate = {};
  const activeHabitsByDate = {};

  // Get active habits for each date
  for (const dateKey in checkinsGroupedByDate) {
    const date = moment(dateKey);
    activeHabitsByDate[dateKey] = habits.filter(
      (h) => !h.archivedAt || moment(h.archivedAt).isAfter(date)
    ).length;

    consistencyByDate[dateKey] =
      (checkinsGroupedByDate[dateKey].filter((c) => c.completed).length /
        activeHabitsByDate[dateKey]) *
      100;
  }

  // Calculate overall consistency
  const dates = Object.keys(consistencyByDate);
  const totalConsistency = dates.reduce(
    (acc, date) => acc + consistencyByDate[date],
    0
  );
  const averageConsistency =
    dates.length > 0 ? totalConsistency / dates.length : 0;

  return {
    byDate: consistencyByDate,
    average: averageConsistency,
    bestDate:
      dates.length > 0
        ? dates.reduce((a, b) =>
            consistencyByDate[a] > consistencyByDate[b] ? a : b
          )
        : null,
    worstDate:
      dates.length > 0
        ? dates.reduce((a, b) =>
            consistencyByDate[a] < consistencyByDate[b] ? a : b
          )
        : null,
  };
}

function calculateOverallCompletion(checkins, habit) {
  const totalDays = moment().diff(moment(habit.createdAt), "days") + 1;
  const totalCompletions = checkins.filter((c) => c.completed).length;

  return {
    rate: totalDays > 0 ? (totalCompletions / totalDays) * 100 : 0,
    totalDays,
    completedDays: totalCompletions,
  };
}

function calculateCompletionByDay(checkins) {
  const days = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
  const result = {};

  days.forEach((day) => {
    const dayName = moment().day(day).format("dddd");
    const checkinsOnDay = checkins.filter((c) => moment(c.date).day() === day);

    const totalOnDay = checkinsOnDay.length;
    const completedOnDay = checkinsOnDay.filter((c) => c.completed).length;

    result[dayName] = {
      total: totalOnDay,
      completed: completedOnDay,
      rate: totalOnDay > 0 ? (completedOnDay / totalOnDay) * 100 : 0,
    };
  });

  return result;
}

function calculateCompletionByWeek(checkins) {
  // Group check-ins by week
  const weeks = {};

  checkins.forEach((checkin) => {
    const weekKey = moment(checkin.date).startOf("week").format("YYYY-MM-DD");

    if (!weeks[weekKey]) {
      weeks[weekKey] = {
        total: 0,
        completed: 0,
      };
    }

    weeks[weekKey].total += 1;
    if (checkin.completed) {
      weeks[weekKey].completed += 1;
    }
  });

  // Calculate rates
  for (const week in weeks) {
    weeks[week].rate =
      weeks[week].total > 0
        ? (weeks[week].completed / weeks[week].total) * 100
        : 0;
  }

  return weeks;
}

function calculateCompletionByMonth(checkins) {
  // Group check-ins by month
  const months = {};

  checkins.forEach((checkin) => {
    const monthKey = moment(checkin.date).startOf("month").format("YYYY-MM");

    if (!months[monthKey]) {
      months[monthKey] = {
        total: 0,
        completed: 0,
      };
    }

    months[monthKey].total += 1;
    if (checkin.completed) {
      months[monthKey].completed += 1;
    }
  });

  // Calculate rates
  for (const month in months) {
    months[month].rate =
      months[month].total > 0
        ? (months[month].completed / months[month].total) * 100
        : 0;
  }

  return months;
}

function calculateStreakHistory(checkins) {
  // Sort check-ins by date
  const sortedCheckins = [...checkins]
    .filter((c) => c.completed)
    .sort((a, b) => moment(a.date).diff(moment(b.date)));

  if (sortedCheckins.length === 0) {
    return [];
  }

  const streakHistory = [];
  let currentStreak = 1;
  let streakStartDate = moment(sortedCheckins[0].date);

  for (let i = 1; i < sortedCheckins.length; i++) {
    const previousDate = moment(sortedCheckins[i - 1].date);
    const currentDate = moment(sortedCheckins[i].date);

    // Check if dates are consecutive
    if (currentDate.diff(previousDate, "days") === 1) {
      currentStreak++;
    } else {
      // Save the completed streak
      streakHistory.push({
        start: streakStartDate.format("YYYY-MM-DD"),
        end: previousDate.format("YYYY-MM-DD"),
        length: currentStreak,
      });

      // Start a new streak
      currentStreak = 1;
      streakStartDate = currentDate;
    }
  }

  // Add the last streak
  const lastCheckin = sortedCheckins[sortedCheckins.length - 1];
  streakHistory.push({
    start: streakStartDate.format("YYYY-MM-DD"),
    end: moment(lastCheckin.date).format("YYYY-MM-DD"),
    length: currentStreak,
  });

  return streakHistory;
}

function findBestDay(checkins) {
  const completionByDay = calculateCompletionByDay(checkins);
  let bestDay = null;
  let bestRate = -1;

  for (const day in completionByDay) {
    if (
      completionByDay[day].total > 0 &&
      completionByDay[day].rate > bestRate
    ) {
      bestDay = day;
      bestRate = completionByDay[day].rate;
    }
  }

  return {
    day: bestDay,
    rate: bestRate,
  };
}

function findWorstDay(checkins) {
  const completionByDay = calculateCompletionByDay(checkins);
  let worstDay = null;
  let worstRate = 101; // Start above 100%

  for (const day in completionByDay) {
    if (
      completionByDay[day].total > 0 &&
      completionByDay[day].rate < worstRate
    ) {
      worstDay = day;
      worstRate = completionByDay[day].rate;
    }
  }

  return {
    day: worstDay,
    rate: worstRate,
  };
}

function calculateAveragePerformance(checkins) {
  if (checkins.length === 0) {
    return {
      daily: 0,
      weekly: 0,
      monthly: 0,
    };
  }

  // Calculate average completion rates
  const byDay = calculateCompletionByDay(checkins);
  const byWeek = calculateCompletionByWeek(checkins);
  const byMonth = calculateCompletionByMonth(checkins);

  // Calculate average daily completion
  let totalDailyRate = 0;
  let daysWithData = 0;

  for (const day in byDay) {
    if (byDay[day].total > 0) {
      totalDailyRate += byDay[day].rate;
      daysWithData++;
    }
  }

  // Calculate average weekly completion
  let totalWeeklyRate = 0;
  let weeksWithData = 0;

  for (const week in byWeek) {
    if (byWeek[week].total > 0) {
      totalWeeklyRate += byWeek[week].rate;
      weeksWithData++;
    }
  }

  // Calculate average monthly completion
  let totalMonthlyRate = 0;
  let monthsWithData = 0;

  for (const month in byMonth) {
    if (byMonth[month].total > 0) {
      totalMonthlyRate += byMonth[month].rate;
      monthsWithData++;
    }
  }

  return {
    daily: daysWithData > 0 ? totalDailyRate / daysWithData : 0,
    weekly: weeksWithData > 0 ? totalWeeklyRate / weeksWithData : 0,
    monthly: monthsWithData > 0 ? totalMonthlyRate / monthsWithData : 0,
  };
}

function calculateHabitConsistency(checkins) {
  if (checkins.length === 0) {
    return 0;
  }

  // Get date range
  const dates = checkins.map((c) => moment(c.date));
  const minDate = moment.min(dates);
  const maxDate = moment.max(dates);

  // Get all days in range
  const totalDays = maxDate.diff(minDate, "days") + 1;

  // Get completed days
  const completedDays = new Set(
    checkins
      .filter((c) => c.completed)
      .map((c) => moment(c.date).format("YYYY-MM-DD"))
  ).size;

  // Calculate consistency score
  return (completedDays / totalDays) * 100;
}
