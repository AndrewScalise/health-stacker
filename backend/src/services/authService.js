const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRE, JWT_COOKIE_EXPIRE } = require("../config/env");

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {Object} req - Express request object for generating verification URL
 * @returns {Object} User data and token
 */
exports.registerUser = async (userData, req) => {
  // Create user
  const user = await User.create(userData);

  // Generate email verification token
  const verificationToken = user.getEmailVerificationToken();

  await user.save({ validateBeforeSave: false });

  // Create verification URL
  const verificationUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/auth/verify-email/${verificationToken}`;

  const message = `You are receiving this email because you need to verify your email address. Please click on the link to verify: \n\n ${verificationUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Email Verification",
      message,
    });

    return this.getTokenResponse(user);
  } catch (err) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;

    await user.save({ validateBeforeSave: false });

    throw new ErrorResponse("Email could not be sent", 500);
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} User data and token
 */
exports.loginUser = async (email, password) => {
  // Check if email and password are provided
  if (!email || !password) {
    throw new ErrorResponse("Please provide an email and password", 400);
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ErrorResponse("Invalid credentials", 401);
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    throw new ErrorResponse("Invalid credentials", 401);
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  return this.getTokenResponse(user);
};

/**
 * Get current user
 * @param {string} userId - User ID
 * @returns {Object} User data
 */
exports.getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorResponse("User not found", 404);
  }

  return user;
};

/**
 * Update user details
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated user data
 */
exports.updateUserDetails = async (userId, updateData) => {
  // Filter allowed update fields
  const fieldsToUpdate = {
    firstName: updateData.firstName,
    lastName: updateData.lastName,
    email: updateData.email,
  };

  const user = await User.findByIdAndUpdate(userId, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ErrorResponse("User not found", 404);
  }

  return user;
};

/**
 * Update user password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Object} User data and new token
 */
exports.updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new ErrorResponse("User not found", 404);
  }

  // Check current password
  if (!(await user.matchPassword(currentPassword))) {
    throw new ErrorResponse("Password is incorrect", 401);
  }

  user.password = newPassword;
  await user.save();

  return this.getTokenResponse(user);
};

/**
 * Forgot password - send reset email
 * @param {string} email - User email
 * @param {Object} req - Express request object for generating reset URL
 * @returns {boolean} Success status
 */
exports.forgotPassword = async (email, req) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ErrorResponse("There is no user with that email", 404);
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/auth/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the link to reset your password: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    return true;
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    throw new ErrorResponse("Email could not be sent", 500);
  }
};

/**
 * Reset password
 * @param {string} resetToken - Reset token
 * @param {string} password - New password
 * @returns {Object} User data and token
 */
exports.resetPassword = async (resetToken, password) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ErrorResponse("Invalid token", 400);
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return this.getTokenResponse(user);
};

/**
 * Verify email
 * @param {string} verificationToken - Email verification token
 * @returns {Object} User data and token
 */
exports.verifyEmail = async (verificationToken) => {
  // Get hashed token
  const emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ErrorResponse("Invalid token", 400);
  }

  // Set email as verified
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  return this.getTokenResponse(user);
};

/**
 * Get token response for authenticated requests
 * @param {Object} user - User object
 * @returns {Object} Token response
 */
exports.getTokenResponse = (user) => {
  // Create token
  const token = user.getSignedJwtToken();

  return {
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      emailVerified: user.emailVerified,
      subscriptionStatus: user.subscriptionStatus,
    },
  };
};
