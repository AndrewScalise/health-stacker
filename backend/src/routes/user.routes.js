const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updatePreferences,
} = require("../controllers/userController");

const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");
const User = require("../models/User");

// All routes below this middleware are protected and require admin role for most operations
router.use(protect);

// Admin-only routes
router
  .route("/")
  .get(authorize("admin"), advancedResults(User), getUsers)
  .post(authorize("admin"), createUser);

router
  .route("/:id")
  .get(authorize("admin"), getUser)
  .put(authorize("admin"), updateUser)
  .delete(authorize("admin"), deleteUser);

// User routes (can be accessed by the logged-in user)
router.put("/preferences", updatePreferences);

module.exports = router;
