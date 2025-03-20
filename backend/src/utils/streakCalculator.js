const Checkin = require("../models/Checkin");
const Habit = require("../models/Habit");
const moment = require("moment");

/**
 * Calculate current and longest streak for a habit
 * @param {string} habitId - The ID of the habit
 * @returns {Object} Object containing current and longest streak
 */
exports.calculateStreak = async (habitId) => {
  // Get the habit to check its frequency
  const habit = await Habit.findById(habitId);
  if (!habit) {
    throw new Error("Habit not found");
  }

  // Get all completed check-ins for this habit, sorted by date
  const checkins = await Checkin.find({
    habitId,
    completed: true,
  }).sort({ date: 1 });

  if (checkins.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Process based on frequency type
  switch (habit.frequency.type) {
    case "daily":
      return calculateDailyStreak(checkins);

    case "weekly":
      return calculateWeeklyStreak(checkins, habit.frequency);

    case "specific_days":
      return calculateSpecificDaysStreak(
        checkins,
        habit.frequency.specificDays
      );

    default:
      return { currentStreak: 0, longestStreak: 0 };
  }
};

/**
 * Calculate streak for daily habits
 * @param {Array} checkins - Array of check-ins
 * @returns {Object} Current and longest streak
 */
const calculateDailyStreak = (checkins) => {
  let currentStreak = 0;
  let longestStreak = 0;
  let previousDate = null;

  // Process check-ins in reverse order (newest first)
  const sortedCheckins = [...checkins].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Get today's date without time
  const today = moment().startOf("day");

  // Check if the most recent check-in is from today or yesterday
  const mostRecentDate = moment(sortedCheckins[0].date).startOf("day");
  const daysSinceLastCheckin = today.diff(mostRecentDate, "days");

  // If the most recent check-in is older than yesterday, streak is broken
  if (daysSinceLastCheckin > 1) {
    return {
      currentStreak: 0,
      longestStreak: calculateLongestDailyStreak(checkins),
    };
  }

  // Calculate current streak
  for (let i = 0; i < sortedCheckins.length; i++) {
    const currentDate = moment(sortedCheckins[i].date).startOf("day");

    if (i === 0) {
      currentStreak = 1;
      previousDate = currentDate;
      continue;
    }

    const expectedPreviousDate = moment(previousDate).subtract(1, "days");

    if (currentDate.isSame(expectedPreviousDate, "day")) {
      currentStreak++;
      previousDate = currentDate;
    } else {
      break;
    }
  }

  // Calculate longest streak historically
  longestStreak = Math.max(
    currentStreak,
    calculateLongestDailyStreak(checkins)
  );

  return { currentStreak, longestStreak };
};

/**
 * Calculate the longest streak for daily habits
 * @param {Array} checkins - Array of check-ins
 * @returns {number} Longest streak
 */
const calculateLongestDailyStreak = (checkins) => {
  let longestStreak = 0;
  let currentStreak = 0;
  let previousDate = null;

  // Sort check-ins by date (oldest first)
  const sortedCheckins = [...checkins].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  for (const checkin of sortedCheckins) {
    const currentDate = moment(checkin.date).startOf("day");

    if (!previousDate) {
      currentStreak = 1;
      previousDate = currentDate;
      continue;
    }

    const expectedDate = moment(previousDate).add(1, "days");

    if (currentDate.isSame(expectedDate, "day")) {
      currentStreak++;
    } else {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
    }

    previousDate = currentDate;
  }

  return Math.max(longestStreak, currentStreak);
};

/**
 * Calculate streak for weekly habits
 * @param {Array} checkins - Array of check-ins
 * @param {Object} frequency - Frequency settings
 * @returns {Object} Current and longest streak
 */
const calculateWeeklyStreak = (checkins, frequency) => {
  let currentStreak = 0;
  let longestStreak = 0;

  // Group check-ins by week
  const checkinsGroupedByWeek = {};

  checkins.forEach((checkin) => {
    const weekStart = moment(checkin.date).startOf("week").format("YYYY-MM-DD");

    if (!checkinsGroupedByWeek[weekStart]) {
      checkinsGroupedByWeek[weekStart] = [];
    }

    checkinsGroupedByWeek[weekStart].push(checkin);
  });

  // Get weeks in chronological order
  const weeks = Object.keys(checkinsGroupedByWeek).sort();

  // Calculate longest streak
  let tempStreak = 0;

  for (let i = 0; i < weeks.length; i++) {
    const currentWeek = weeks[i];

    // Count completed check-ins in this week
    const completedInWeek = checkinsGroupedByWeek[currentWeek].length;

    // Check if minimum required check-ins are met
    const minRequired = frequency.timesPerPeriod || 1;

    if (completedInWeek >= minRequired) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
    }

    // Check for gaps between weeks
    if (i < weeks.length - 1) {
      const nextWeek = weeks[i + 1];
      const currentWeekMoment = moment(currentWeek);
      const nextWeekMoment = moment(nextWeek);

      // If there's more than a week gap, break the streak
      if (nextWeekMoment.diff(currentWeekMoment, "weeks") > 1) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  // Calculate current streak
  const currentWeekStart = moment().startOf("week").format("YYYY-MM-DD");
  const previousWeekStart = moment()
    .subtract(1, "week")
    .startOf("week")
    .format("YYYY-MM-DD");

  // Check if current or previous week has required check-ins
  const hasCurrentWeekCheckIns =
    checkinsGroupedByWeek[currentWeekStart] &&
    checkinsGroupedByWeek[currentWeekStart].length >=
      (frequency.timesPerPeriod || 1);

  const hasPreviousWeekCheckIns =
    checkinsGroupedByWeek[previousWeekStart] &&
    checkinsGroupedByWeek[previousWeekStart].length >=
      (frequency.timesPerPeriod || 1);

  // If neither current nor previous week has check-ins, current streak is 0
  if (!hasCurrentWeekCheckIns && !hasPreviousWeekCheckIns) {
    currentStreak = 0;
    return { currentStreak, longestStreak };
  }

  // If we have check-ins in current week, calculate backwards
  const startWeek = hasCurrentWeekCheckIns
    ? currentWeekStart
    : previousWeekStart;
  const startIndex = weeks.indexOf(startWeek);

  if (startIndex === -1) {
    // Week not found in our history
    currentStreak = hasCurrentWeekCheckIns ? 1 : 0;
    return { currentStreak, longestStreak };
  }

  currentStreak = 1; // Start with current week

  // Count backwards
  for (let i = startIndex - 1; i >= 0; i--) {
    const weekStart = weeks[i];
    const completedInWeek = checkinsGroupedByWeek[weekStart].length;

    // Check if minimum required check-ins are met
    if (completedInWeek >= (frequency.timesPerPeriod || 1)) {
      // Check for continuity
      const currentWeekMoment = moment(weeks[i + 1]);
      const previousWeekMoment = moment(weekStart);

      if (currentWeekMoment.diff(previousWeekMoment, "weeks") === 1) {
        currentStreak++;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak };
};

/**
 * Calculate streak for habits with specific days
 * @param {Array} checkins - Array of check-ins
 * @param {Array} specificDays - Array of specific days (0-6 for Sunday-Saturday)
 * @returns {Object} Current and longest streak
 */
const calculateSpecificDaysStreak = (checkins, specificDays) => {
  // If no specific days set, use daily calculation
  if (!specificDays || specificDays.length === 0) {
    return calculateDailyStreak(checkins);
  }

  // Group check-ins by week
  const checkinsGroupedByWeek = {};

  checkins.forEach((checkin) => {
    const weekStart = moment(checkin.date).startOf("week").format("YYYY-MM-DD");

    if (!checkinsGroupedByWeek[weekStart]) {
      checkinsGroupedByWeek[weekStart] = new Set();
    }

    // Add day of week (0-6)
    const dayOfWeek = moment(checkin.date).day();
    checkinsGroupedByWeek[weekStart].add(dayOfWeek);
  });

  // Get weeks in chronological order
  const weeks = Object.keys(checkinsGroupedByWeek).sort();

  // Calculate longest streak (weeks where all specific days have check-ins)
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < weeks.length; i++) {
    const currentWeek = weeks[i];
    const daysCompletedThisWeek = checkinsGroupedByWeek[currentWeek];

    // Check if all specific days are completed
    const allDaysCompleted = specificDays.every((day) =>
      daysCompletedThisWeek.has(day)
    );

    if (allDaysCompleted) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
    }

    // Check for gaps between weeks
    if (i < weeks.length - 1) {
      const nextWeek = weeks[i + 1];
      const currentWeekMoment = moment(currentWeek);
      const nextWeekMoment = moment(nextWeek);

      // If there's more than a week gap, break the streak
      if (nextWeekMoment.diff(currentWeekMoment, "weeks") > 1) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  // Calculate current streak
  const currentWeekStart = moment().startOf("week").format("YYYY-MM-DD");
  const previousWeekStart = moment()
    .subtract(1, "week")
    .startOf("week")
    .format("YYYY-MM-DD");

  // Check current week
  const currentWeekCheckins = checkinsGroupedByWeek[currentWeekStart];
  const previousWeekCheckins = checkinsGroupedByWeek[previousWeekStart];

  // Calculate days that should have been completed by today
  const today = moment();
  const dayOfWeek = today.day();
  const dueDays = specificDays.filter((day) => day <= dayOfWeek);

  // Check if all due days in current week are completed
  const allDueDaysCompleted =
    currentWeekCheckins && dueDays.every((day) => currentWeekCheckins.has(day));

  // Check if all days in previous week are completed
  const allPreviousDaysCompleted =
    previousWeekCheckins &&
    specificDays.every((day) => previousWeekCheckins.has(day));

  // Set current streak
  let currentStreak = 0;

  if (
    allDueDaysCompleted ||
    (dueDays.length === 0 && allPreviousDaysCompleted)
  ) {
    // Start with current week if all due days are completed or no due days yet but previous week complete
    currentStreak = 1;

    // Count backwards
    for (let i = weeks.indexOf(previousWeekStart); i >= 0; i--) {
      const weekStart = weeks[i];
      const daysCompletedThisWeek = checkinsGroupedByWeek[weekStart];

      // Check if all specific days are completed
      const allDaysCompleted = specificDays.every((day) =>
        daysCompletedThisWeek.has(day)
      );

      if (allDaysCompleted) {
        // Check for continuity
        const currentWeekMoment =
          i === weeks.indexOf(previousWeekStart)
            ? moment(currentWeekStart)
            : moment(weeks[i + 1]);
        const previousWeekMoment = moment(weekStart);

        if (currentWeekMoment.diff(previousWeekMoment, "weeks") === 1) {
          currentStreak++;
        } else {
          break;
        }
      } else {
        break;
      }
    }
  } else if (allPreviousDaysCompleted) {
    // If current week not complete but previous week is, just count previous weeks
    currentStreak = 1;

    // Count backwards from 2 weeks ago
    const twoWeeksAgoStart = moment()
      .subtract(2, "weeks")
      .startOf("week")
      .format("YYYY-MM-DD");

    for (let i = weeks.indexOf(twoWeeksAgoStart); i >= 0; i--) {
      const weekStart = weeks[i];
      const daysCompletedThisWeek = checkinsGroupedByWeek[weekStart];

      // Check if all specific days are completed
      const allDaysCompleted = specificDays.every((day) =>
        daysCompletedThisWeek.has(day)
      );

      if (allDaysCompleted) {
        // Check for continuity
        const currentWeekMoment =
          i === weeks.indexOf(twoWeeksAgoStart)
            ? moment(previousWeekStart)
            : moment(weeks[i + 1]);
        const previousWeekMoment = moment(weekStart);

        if (currentWeekMoment.diff(previousWeekMoment, "weeks") === 1) {
          currentStreak++;
        } else {
          break;
        }
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
};
