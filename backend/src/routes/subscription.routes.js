const express = require("express");
const router = express.Router();
const {
  getSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  checkSubscriptionAccess,
} = require("../controllers/subscriptionController");

const { protect } = require("../middleware/auth");

// All routes below this middleware are protected
router.use(protect);

// Routes
router
  .route("/")
  .get(getSubscription)
  .post(createSubscription)
  .put(updateSubscription)
  .delete(cancelSubscription);

router.get("/check-access", checkSubscriptionAccess);

module.exports = router;
