const express = require("express");
const router = express.Router();
const {
  getAnalyticsOverview,
  getHabitAnalytics,
  exportUserData,
} = require("../controllers/analyticsController");

const { protect, checkPremium } = require("../middleware/auth");

// All routes below this middleware are protected
router.use(protect);

// Routes
router.get("/overview", getAnalyticsOverview);
router.get("/habits/:id", getHabitAnalytics);

// Premium-only routes
router.get("/export", checkPremium, exportUserData);

module.exports = router;
