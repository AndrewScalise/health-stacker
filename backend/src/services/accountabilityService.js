const User = require("../models/User");
const Habit = require("../models/Habit");
const AccountabilityGroup = require("../models/AccountabilityGroup");
const Message = require("../models/Message");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

/**
 * Get all accountability groups for a user
 * @param {string} userId - User ID
 * @returns {Array} Array of accountability groups
 */
exports.getUserGroups = async (userId) => {
  const groups = await AccountabilityGroup.find({
    members: userId,
  }).populate("members", "firstName lastName email");

  return groups;
};

/**
 * Get a single accountability group
 * @param {string} groupId - Group ID
 * @param {string} userId - User ID
 * @returns {Object} Group data
 */
exports.getGroup = async (groupId, userId) => {
  const group = await AccountabilityGroup.findById(groupId)
    .populate("members", "firstName lastName email")
    .populate("habits", "title description category color");

  if (!group) {
    throw new ErrorResponse(`Group not found with id of ${groupId}`, 404);
  }

  // Make sure user is a member of the group
  if (!group.members.some((member) => member._id.toString() === userId)) {
    throw new ErrorResponse(`Not authorized to access this group`, 401);
  }

  return group;
};

/**
 * Create a new accountability group
 * @param {Object} groupData - Group data
 * @param {string} userId - User ID
 * @returns {Object} Created group
 */
exports.createGroup = async (groupData, userId) => {
  // Check if user has premium subscription
  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorResponse("User not found", 404);
  }

  if (user.subscriptionStatus !== "premium") {
    throw new ErrorResponse(
      "Creating groups requires a premium subscription",
      403
    );
  }

  // Prepare group data
  groupData.ownerId = userId;
  groupData.members = [userId, ...(groupData.members || [])];

  // Generate a random invite code
  groupData.inviteCode = crypto.randomBytes(5).toString("hex");

  // Create group
  const group = await AccountabilityGroup.create(groupData);
  return group;
};

/**
 * Update an accountability group
 * @param {string} groupId - Group ID
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated group
 */
exports.updateGroup = async (groupId, userId, updateData) => {
  let group = await AccountabilityGroup.findById(groupId);

  if (!group) {
    throw new ErrorResponse(`Group not found with id of ${groupId}`, 404);
  }

  // Make sure user is the owner of the group
  if (group.ownerId.toString() !== userId) {
    throw new ErrorResponse(`Only the group owner can update the group`, 401);
  }

  // Don't allow updating the owner or invite code directly
  delete updateData.ownerId;
  delete updateData.inviteCode;

  // Update group
  group = await AccountabilityGroup.findByIdAndUpdate(groupId, updateData, {
    new: true,
    runValidators: true,
  });

  return group;
};

/**
 * Delete an accountability group
 * @param {string} groupId - Group ID
 * @param {string} userId - User ID
 * @returns {boolean} Success status
 */
exports.deleteGroup = async (groupId, userId) => {
  const group = await AccountabilityGroup.findById(groupId);

  if (!group) {
    throw new ErrorResponse(`Group not found with id of ${groupId}`, 404);
  }

  // Make sure user is the owner of the group
  if (group.ownerId.toString() !== userId) {
    throw new ErrorResponse(`Only the group owner can delete the group`, 401);
  }

  // Delete all associated messages
  await Message.deleteMany({ groupId });

  // Delete the group
  await group.remove();

  return true;
};

/**
 * Generate a new invite code for a group
 * @param {string} groupId - Group ID
 * @param {string} userId - User ID
 * @returns {string} New invite code
 */
exports.generateInviteCode = async (groupId, userId) => {
  const group = await AccountabilityGroup.findById(groupId);

  if (!group) {
    throw new ErrorResponse(`Group not found with id of ${groupId}`, 404);
  }

  // Make sure user is the owner of the group
  if (group.ownerId.toString() !== userId) {
    throw new ErrorResponse(
      `Only the group owner can generate invite codes`,
      401
    );
  }

  // Generate a new invite code
  const inviteCode = crypto.randomBytes(5).toString("hex");

  // Update the group
  group.inviteCode = inviteCode;
  await group.save();

  return inviteCode;
};

/**
 * Join a group with an invite code
 * @param {string} inviteCode - Invite code
 * @param {string} userId - User ID
 * @returns {Object} Group data
 */
exports.joinGroupWithCode = async (inviteCode, userId) => {
  // Check if user has premium subscription
  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorResponse("User not found", 404);
  }

  if (user.subscriptionStatus !== "premium") {
    throw new ErrorResponse(
      "Joining groups requires a premium subscription",
      403
    );
  }

  const group = await AccountabilityGroup.findOne({
    inviteCode,
  });

  if (!group) {
    throw new ErrorResponse("Invalid or expired invite code", 404);
  }

  // Check if user is already a member
  if (group.members.includes(userId)) {
    throw new ErrorResponse("You are already a member of this group", 400);
  }

  // Add user to group members
  group.members.push(userId);
  await group.save();

  return group;
};

/**
 * Leave an accountability group
 * @param {string} groupId - Group ID
 * @param {string} userId - User ID
 * @returns {boolean} Success status
 */
exports.leaveGroup = async (groupId, userId) => {
  const group = await AccountabilityGroup.findById(groupId);

  if (!group) {
    throw new ErrorResponse(`Group not found with id of ${groupId}`, 404);
  }

  // Check if user is a member
  if (!group.members.includes(userId)) {
    throw new ErrorResponse("You are not a member of this group", 400);
  }

  // Don't allow the owner to leave (they should delete the group instead)
  if (group.ownerId.toString() === userId) {
    throw new ErrorResponse(
      "The owner cannot leave the group. Transfer ownership or delete the group instead.",
      400
    );
  }

  // Remove user from group members
  group.members = group.members.filter(
    (memberId) => memberId.toString() !== userId
  );

  await group.save();

  return true;
};

/**
 * Add a habit to a group
 * @param {string} groupId - Group ID
 * @param {string} habitId - Habit ID
 * @param {string} userId - User ID
 * @returns {Object} Updated group
 */
exports.addHabitToGroup = async (groupId, habitId, userId) => {
  const group = await AccountabilityGroup.findById(groupId);

  if (!group) {
    throw new ErrorResponse(`Group not found with id of ${groupId}`, 404);
  }

  // Check if user is a member
  if (!group.members.includes(userId)) {
    throw new ErrorResponse("You are not a member of this group", 401);
  }

  // Verify the habit exists and belongs to the user
  const habit = await Habit.findOne({
    _id: habitId,
    userId,
  });

  if (!habit) {
    throw new ErrorResponse(`Habit not found with id of ${habitId}`, 404);
  }

  // Check if habit is already in the group
  if (group.habits.includes(habitId)) {
    throw new ErrorResponse("This habit is already shared with the group", 400);
  }

  // Add habit to group
  group.habits.push(habitId);
  await group.save();

  return group;
};

/**
 * Remove a habit from a group
 * @param {string} groupId - Group ID
 * @param {string} habitId - Habit ID
 * @param {string} userId - User ID
 * @returns {Object} Updated group
 */
exports.removeHabitFromGroup = async (groupId, habitId, userId) => {
  const group = await AccountabilityGroup.findById(groupId);

  if (!group) {
    throw new ErrorResponse(`Group not found with id of ${groupId}`, 404);
  }

  // Check if user is a member
  if (!group.members.includes(userId)) {
    throw new ErrorResponse("You are not a member of this group", 401);
  }

  // Verify the habit exists and belongs to the user
  const habit = await Habit.findOne({
    _id: habitId,
    userId,
  });

  if (!habit) {
    throw new ErrorResponse(`Habit not found with id of ${habitId}`, 404);
  }

  // Remove habit from group
  group.habits = group.habits.filter((id) => id.toString() !== habitId);

  await group.save();

  return group;
};

/**
 * Get all messages for a group
 * @param {string} groupId - Group ID
 * @param {string} userId - User ID
 * @returns {Array} Array of messages
 */
exports.getGroupMessages = async (groupId, userId) => {
  const group = await AccountabilityGroup.findById(groupId);

  if (!group) {
    throw new ErrorResponse(`Group not found with id of ${groupId}`, 404);
  }

  // Check if user is a member
  if (!group.members.includes(userId)) {
    throw new ErrorResponse("You are not a member of this group", 401);
  }

  const messages = await Message.find({ groupId })
    .populate("userId", "firstName lastName")
    .sort({ timestamp: -1 });

  return messages;
};

/**
 * Add a message to a group
 * @param {string} groupId - Group ID
 * @param {string} userId - User ID
 * @param {string} content - Message content
 * @returns {Object} Created message
 */
exports.addMessage = async (groupId, userId, content) => {
  const group = await AccountabilityGroup.findById(groupId);

  if (!group) {
    throw new ErrorResponse(`Group not found with id of ${groupId}`, 404);
  }

  // Check if user is a member
  if (!group.members.includes(userId)) {
    throw new ErrorResponse("You are not a member of this group", 401);
  }

  // Create message
  const message = await Message.create({
    groupId,
    userId,
    content,
    timestamp: Date.now(),
  });

  // Return the populated message
  const populatedMessage = await Message.findById(message._id).populate(
    "userId",
    "firstName lastName"
  );

  return populatedMessage;
};
