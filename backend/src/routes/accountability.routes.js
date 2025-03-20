const express = require("express");
const router = express.Router();
const {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  generateInvite,
  joinGroup,
  leaveGroup,
  addHabitToGroup,
  removeHabitFromGroup,
  getMessages,
  addMessage,
} = require("../controllers/accountabilityController");

const { protect, checkPremium } = require("../middleware/auth");

// All routes below this middleware are protected and require premium subscription
router.use(protect);
router.use(checkPremium);

// Group routes
router.route("/").get(getGroups).post(createGroup);

router.route("/:id").get(getGroup).put(updateGroup).delete(deleteGroup);

// Invite management
router.put("/:id/invite", generateInvite);
router.post("/join/:code", joinGroup);
router.put("/:id/leave", leaveGroup);

// Habit management within groups
router
  .route("/:id/habits/:habitId")
  .put(addHabitToGroup)
  .delete(removeHabitFromGroup);

// Message management
router.route("/:id/messages").get(getMessages).post(addMessage);

module.exports = router;
