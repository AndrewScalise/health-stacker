const express = require("express");
const router = express.Router();

// Import route files
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const habitRoutes = require("./habit.routes");
const checkinRoutes = require("./checkin.routes");
const analyticsRoutes = require("./analytics.routes");
const subscriptionRoutes = require("./subscription.routes");
const accountabilityRoutes = require("./accountability.routes");

// Mount routers
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/habits", habitRoutes);
router.use("/checkins", checkinRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/subscription", subscriptionRoutes);
router.use("/accountability", accountabilityRoutes);

module.exports = router;
