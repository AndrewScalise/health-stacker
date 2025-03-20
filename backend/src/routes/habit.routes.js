// src/routes/habit.routes.js
const express = require("express");
const router = express.Router();
const {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  archiveHabit,
  unarchiveHabit,
  getCheckins,
  createCheckin,
} = require("../controllers/habitController");

const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validation");
const { habitValidator, checkinValidator } = require("../utils/validators");

// All routes below this middleware are protected
router.use(protect);

// Habit routes
router.route("/").get(getHabits).post(validate(habitValidator), createHabit);

router
  .route("/:id")
  .get(getHabit)
  .put(validate(habitValidator), updateHabit)
  .delete(deleteHabit);

router.put("/:id/archive", archiveHabit);
router.put("/:id/unarchive", unarchiveHabit);

// Check-in routes
router
  .route("/:id/checkins")
  .get(getCheckins)
  .post(validate(checkinValidator), createCheckin);

module.exports = router;
