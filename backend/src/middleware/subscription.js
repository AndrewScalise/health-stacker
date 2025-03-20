const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const moment = require("moment");

// Check if subscription is active
exports.checkSubscriptionActive = asyncHandler(async (req, res, next) => {
  // Get user with subscription details
  const user = await User.findById(req.user.id);

  // Check if subscription exists and is active
  if (user.subscriptionStatus !== "premium") {
    return next(new ErrorResponse("Active subscription required", 402));
  }

  // Check if subscription is expired
  if (user.subscriptionDetails && user.subscriptionDetails.endDate) {
    const endDate = moment(user.subscriptionDetails.endDate);
    if (moment().isAfter(endDate)) {
      // Update user subscription status
      user.subscriptionStatus = "free";
      await user.save();

      return next(new ErrorResponse("Your subscription has expired", 402));
    }
  }

  // Add subscription details to request for controllers
  req.subscription = user.subscriptionDetails;

  next();
});

// Check for specific subscription plan
exports.checkSubscriptionPlan = (plan) => {
  return asyncHandler(async (req, res, next) => {
    // Make sure subscription is checked first
    if (!req.subscription) {
      return next(new ErrorResponse("Subscription details not available", 500));
    }

    // Check if plan matches required plan
    if (req.subscription.plan !== plan) {
      return next(
        new ErrorResponse(`This feature requires the ${plan} plan`, 403)
      );
    }

    next();
  });
};
