const User = require("../models/User");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");
const moment = require("moment");

// @desc    Get subscription details
// @route   GET /api/subscription
// @access  Private
exports.getSubscription = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      status: user.subscriptionStatus,
      details: user.subscriptionDetails || null,
    },
  });
});

// @desc    Create new subscription
// @route   POST /api/subscription
// @access  Private
exports.createSubscription = asyncHandler(async (req, res, next) => {
  const { plan, paymentMethodId } = req.body;

  if (!plan || !paymentMethodId) {
    return next(
      new ErrorResponse("Please provide plan and payment method", 400)
    );
  }

  // In a real application, you would integrate with a payment
  // processor like Stripe here to handle the actual subscription

  // This is a simplified mock implementation
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
    return next(new ErrorResponse("Invalid subscription plan", 400));
  }

  // Mock successful payment
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
    req.user.id,
    {
      subscriptionStatus: "premium",
      subscriptionDetails: {
        plan,
        amount: planDetails[plan].amount,
        startDate,
        endDate,
        paymentId: paymentResult.id,
      },
    },
    { new: true }
  );

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

  res.status(200).json({
    success: true,
    data: {
      status: user.subscriptionStatus,
      details: user.subscriptionDetails,
    },
  });
});

// @desc    Update subscription
// @route   PUT /api/subscription
// @access  Private
exports.updateSubscription = asyncHandler(async (req, res, next) => {
  const { plan } = req.body;

  // Check if user has an active subscription
  const user = await User.findById(req.user.id);

  if (user.subscriptionStatus !== "premium") {
    return next(new ErrorResponse("No active subscription found", 400));
  }

  // In a real application, you would update the subscription with
  // your payment processor here

  // Mock implementation for changing plans
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
    return next(new ErrorResponse("Invalid subscription plan", 400));
  }

  // Update subscription details
  const startDate = new Date();
  const endDate = moment(startDate)
    .add(planDetails[plan].intervalCount, planDetails[plan].interval)
    .toDate();

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      "subscriptionDetails.plan": plan,
      "subscriptionDetails.amount": planDetails[plan].amount,
      "subscriptionDetails.startDate": startDate,
      "subscriptionDetails.endDate": endDate,
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: {
      status: updatedUser.subscriptionStatus,
      details: updatedUser.subscriptionDetails,
    },
  });
});

// @desc    Cancel subscription
// @route   DELETE /api/subscription
// @access  Private
exports.cancelSubscription = asyncHandler(async (req, res, next) => {
  // Check if user has an active subscription
  const user = await User.findById(req.user.id);

  if (user.subscriptionStatus !== "premium") {
    return next(new ErrorResponse("No active subscription found", 400));
  }

  // In a real application, you would cancel the subscription with
  // your payment processor here

  // Update user subscription status
  // We're setting it to 'canceled' but keeping premium until the end date
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
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

  res.status(200).json({
    success: true,
    data: {
      status: updatedUser.subscriptionStatus,
      details: updatedUser.subscriptionDetails,
    },
  });
});

// @desc    Check if subscription is active
// @route   GET /api/subscription/check-access
// @access  Private
exports.checkSubscriptionAccess = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const hasPremiumAccess =
    user.subscriptionStatus === "premium" &&
    user.subscriptionDetails &&
    moment(user.subscriptionDetails.endDate).isAfter(moment());

  res.status(200).json({
    success: true,
    data: {
      hasPremiumAccess,
    },
  });
});
