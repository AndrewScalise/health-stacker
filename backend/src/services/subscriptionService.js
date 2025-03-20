const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");
const moment = require("moment");

/**
 * Get subscription details for a user
 * @param {string} userId - User ID
 * @returns {Object} Subscription details
 */
exports.getSubscription = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorResponse("User not found", 404);
  }

  return {
    status: user.subscriptionStatus,
    details: user.subscriptionDetails || null,
  };
};

/**
 * Create a new subscription
 * @param {string} userId - User ID
 * @param {string} plan - Subscription plan
 * @param {string} paymentMethodId - Payment method ID
 * @returns {Object} Updated subscription details
 */
exports.createSubscription = async (userId, plan, paymentMethodId) => {
  if (!plan || !paymentMethodId) {
    throw new ErrorResponse("Please provide plan and payment method", 400);
  }

  // Plan details - in a real app this would come from a database or config
  const planDetails = {
    monthly: {
      amount: 5.99,
      interval: "month",
      intervalCount: 1,
    },
    annual: {
      amount: 49.99,
      interval: "year",
      intervalCount: 1,
    },
    family: {
      amount: 9.99,
      interval: "month",
      intervalCount: 1,
    },
  };

  if (!planDetails[plan]) {
    throw new ErrorResponse("Invalid subscription plan", 400);
  }

  // In a real application, you would integrate with a payment processor here
  // This is a mock implementation
  const paymentResult = {
    success: true,
    id: `payment_${Date.now()}`,
    amount: planDetails[plan].amount,
  };

  // Calculate subscription dates
  const startDate = new Date();
  const endDate = moment(startDate)
    .add(planDetails[plan].intervalCount, planDetails[plan].interval)
    .toDate();

  // Update user subscription status
  const user = await User.findByIdAndUpdate(
    userId,
    {
      subscriptionStatus: "premium",
      subscriptionDetails: {
        plan,
        amount: planDetails[plan].amount,
        startDate,
        endDate,
        status: "active",
        paymentId: paymentResult.id,
      },
    },
    { new: true }
  );

  if (!user) {
    throw new ErrorResponse("User not found", 404);
  }

  // Send confirmation email
  try {
    await sendEmail({
      email: user.email,
      subject: "Your HealthStack Premium Subscription",
      message: `Thank you for subscribing to HealthStack Premium! Your subscription is now active and will renew on ${moment(
        endDate
      ).format("MMMM D, YYYY")}.`,
    });
  } catch (err) {
    console.log("Email could not be sent", err);
  }

  return {
    status: user.subscriptionStatus,
    details: user.subscriptionDetails,
  };
};

/**
 * Update subscription plan
 * @param {string} userId - User ID
 * @param {string} plan - New subscription plan
 * @returns {Object} Updated subscription details
 */
exports.updateSubscription = async (userId, plan) => {
  // Check if user has an active subscription
  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorResponse("User not found", 404);
  }

  if (user.subscriptionStatus !== "premium") {
    throw new ErrorResponse("No active subscription found", 400);
  }

  // Plan details - in a real app this would come from a database or config
  const planDetails = {
    monthly: {
      amount: 5.99,
      interval: "month",
      intervalCount: 1,
    },
    annual: {
      amount: 49.99,
      interval: "year",
      intervalCount: 1,
    },
    family: {
      amount: 9.99,
      interval: "month",
      intervalCount: 1,
    },
  };

  if (!planDetails[plan]) {
    throw new ErrorResponse("Invalid subscription plan", 400);
  }

  // In a real application, you would update the subscription with your payment processor here

  // Update subscription details
  const startDate = new Date();
  const endDate = moment(startDate)
    .add(planDetails[plan].intervalCount, planDetails[plan].interval)
    .toDate();

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      "subscriptionDetails.plan": plan,
      "subscriptionDetails.amount": planDetails[plan].amount,
      "subscriptionDetails.startDate": startDate,
      "subscriptionDetails.endDate": endDate,
      "subscriptionDetails.status": "active",
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new ErrorResponse("User not found", 404);
  }

  return {
    status: updatedUser.subscriptionStatus,
    details: updatedUser.subscriptionDetails,
  };
};

/**
 * Cancel subscription
 * @param {string} userId - User ID
 * @returns {Object} Updated subscription details
 */
exports.cancelSubscription = async (userId) => {
  // Check if user has an active subscription
  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorResponse("User not found", 404);
  }

  if (user.subscriptionStatus !== "premium") {
    throw new ErrorResponse("No active subscription found", 400);
  }

  // In a real application, you would cancel the subscription with your payment processor here

  // Update user subscription status
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      "subscriptionDetails.status": "canceled",
    },
    { new: true }
  );

  // Send cancellation email
  try {
    await sendEmail({
      email: user.email,
      subject: "Your HealthStack Subscription Cancellation",
      message: `We're sorry to see you go. Your HealthStack Premium subscription has been canceled. You'll continue to have access to premium features until ${moment(
        user.subscriptionDetails.endDate
      ).format("MMMM D, YYYY")}.`,
    });
  } catch (err) {
    console.log("Email could not be sent", err);
  }

  return {
    status: updatedUser.subscriptionStatus,
    details: updatedUser.subscriptionDetails,
  };
};

/**
 * Check if subscription is active
 * @param {string} userId - User ID
 * @returns {boolean} Whether premium access is active
 */
exports.checkSubscriptionAccess = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorResponse("User not found", 404);
  }

  const hasPremiumAccess =
    user.subscriptionStatus === "premium" &&
    user.subscriptionDetails &&
    moment(user.subscriptionDetails.endDate).isAfter(moment());

  return { hasPremiumAccess };
};

/**
 * Process expired subscriptions (to be run by a scheduled job)
 * @returns {number} Number of updated subscriptions
 */
exports.processExpiredSubscriptions = async () => {
  const now = new Date();

  const result = await User.updateMany(
    {
      subscriptionStatus: "premium",
      "subscriptionDetails.endDate": { $lt: now },
      "subscriptionDetails.status": { $ne: "canceled" },
    },
    {
      subscriptionStatus: "free",
      "subscriptionDetails.status": "expired",
    }
  );

  return result.nModified;
};
