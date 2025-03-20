const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const { JWT_SECRET } = require("../config/env");
const moment = require("moment");

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1];
  }
  // Get token from cookie if not in Authorization header
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Add user to request object
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorResponse("User not found", 401));
    }

    // Check if password was changed after token was issued
    if (req.user.changedPasswordAfter(decoded.iat)) {
      return next(
        new ErrorResponse("Password recently changed, please log in again", 401)
      );
    }

    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Check if user has premium subscription
exports.checkPremium = asyncHandler(async (req, res, next) => {
  // Check if user has premium subscription
  if (req.user.subscriptionStatus !== "premium") {
    return next(
      new ErrorResponse("This feature requires a premium subscription", 403)
    );
  }

  // If subscription has subscription details, check if it's still valid
  if (req.user.subscriptionDetails && req.user.subscriptionDetails.endDate) {
    const endDate = moment(req.user.subscriptionDetails.endDate);
    const now = moment();

    if (now.isAfter(endDate)) {
      // Update user subscription status to 'free' if expired
      await User.findByIdAndUpdate(req.user.id, {
        subscriptionStatus: "free",
      });

      return next(
        new ErrorResponse("Your premium subscription has expired", 403)
      );
    }
  }

  next();
});
