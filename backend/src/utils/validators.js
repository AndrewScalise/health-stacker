const { check } = require("express-validator");

/**
 * Validation rules for user registration
 */
exports.registerValidator = [
  check("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ max: 50 })
    .withMessage("First name cannot be more than 50 characters"),

  check("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ max: 50 })
    .withMessage("Last name cannot be more than 50 characters"),

  check("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

/**
 * Validation rules for user login
 */
exports.loginValidator = [
  check("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  check("password").notEmpty().withMessage("Password is required"),
];

/**
 * Validation rules for habit creation/update
 */
exports.habitValidator = [
  check("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 100 })
    .withMessage("Title cannot be more than 100 characters"),

  check("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot be more than 500 characters"),

  check("category")
    .optional()
    .trim()
    .isIn([
      "exercise",
      "nutrition",
      "mindfulness",
      "sleep",
      "productivity",
      "other",
    ])
    .withMessage("Invalid category"),

  check("frequency.type")
    .notEmpty()
    .withMessage("Frequency type is required")
    .isIn(["daily", "weekly", "specific_days"])
    .withMessage("Invalid frequency type"),

  check("frequency.specificDays")
    .optional()
    .isArray()
    .withMessage("Specific days must be an array")
    .custom((days) => {
      if (!days) return true;
      return days.every((day) => day >= 0 && day <= 6);
    })
    .withMessage("Specific days must be between 0 (Sunday) and 6 (Saturday)"),

  check("frequency.timesPerPeriod")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Times per period must be at least 1"),

  check("frequency.periodLength")
    .optional()
    .isIn(["day", "week", "month"])
    .withMessage("Invalid period length"),

  check("reminderTime")
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Reminder time must be in HH:MM format (24-hour)"),

  check("color")
    .optional()
    .isHexColor()
    .withMessage("Color must be a valid hex color code"),
];

/**
 * Validation rules for check-in creation
 */
exports.checkinValidator = [
  check("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be in ISO format (YYYY-MM-DD)"),

  check("completed")
    .optional()
    .isBoolean()
    .withMessage("Completed must be a boolean"),

  check("notes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes cannot be more than 1000 characters"),
];

/**
 * Validation rules for updating user details
 */
exports.updateUserValidator = [
  check("firstName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("First name cannot be empty")
    .isLength({ max: 50 })
    .withMessage("First name cannot be more than 50 characters"),

  check("lastName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Last name cannot be empty")
    .isLength({ max: 50 })
    .withMessage("Last name cannot be more than 50 characters"),

  check("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
];

/**
 * Validation rules for updating notification preferences
 */
exports.notificationPreferencesValidator = [
  check("notificationPreferences.email")
    .optional()
    .isBoolean()
    .withMessage("Email notifications setting must be a boolean"),

  check("notificationPreferences.reminderTime")
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Reminder time must be in HH:MM format (24-hour)"),

  check("timezone")
    .optional()
    .isString()
    .withMessage("Timezone must be a string"),
];

/**
 * Validation rules for accountability group creation/update
 */
exports.accountabilityGroupValidator = [
  check("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 })
    .withMessage("Name cannot be more than 100 characters"),

  check("type")
    .notEmpty()
    .withMessage("Type is required")
    .isIn(["partner", "group"])
    .withMessage('Type must be either "partner" or "group"'),

  check("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot be more than 500 characters"),

  check("members").optional().isArray().withMessage("Members must be an array"),
];

/**
 * Validation rules for sending messages
 */
exports.messageValidator = [
  check("content")
    .trim()
    .notEmpty()
    .withMessage("Message content is required")
    .isLength({ max: 2000 })
    .withMessage("Message cannot be more than 2000 characters"),
];
