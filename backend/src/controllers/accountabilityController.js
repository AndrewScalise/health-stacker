const User = require("../models/User");
const Habit = require("../models/Habit");
const AccountabilityGroup = require("../models/AccountabilityGroup");
const Message = require("../models/Message");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// @desc    Get user's accountability groups
// @route   GET /api/accountability
// @access  Private/Premium
exports.getGroups = asyncHandler(async (req, res, next) => {
  const groups = await AccountabilityGroup.find({
    members: req.user.id,
  }).populate("members", "firstName lastName email");

  res.status(200).json({
    success: true,
    count: groups.length,
    data: groups,
  });
});

// @desc    Get single accountability group
// @route   GET /api/accountability/:id
// @access  Private/Premium
exports.getGroup = asyncHandler(async (req, res, next) => {
  const group = await AccountabilityGroup.findById(req.params.id)
    .populate("members", "firstName lastName email")
    .populate("habits", "title description category color");

  if (!group) {
    return next(
      new ErrorResponse(`Group not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is a member of the group
  if (!group.members.some((member) => member._id.toString() === req.user.id)) {
    return next(new ErrorResponse(`Not authorized to access this group`, 401));
  }

  res.status(200).json({
    success: true,
    data: group,
  });
});

// @desc    Create new accountability group
// @route   POST /api/accountability
// @access  Private/Premium
exports.createGroup = asyncHandler(async (req, res, next) => {
  // Check if user has premium subscription
  const user = await User.findById(req.user.id);

  if (user.subscriptionStatus !== "premium") {
    return next(
      new ErrorResponse("Creating groups requires a premium subscription", 403)
    );
  }

  req.body.ownerId = req.user.id;
  req.body.members = [req.user.id, ...(req.body.members || [])];

  // Generate a random invite code
  req.body.inviteCode = crypto.randomBytes(5).toString("hex");

  const group = await AccountabilityGroup.create(req.body);

  res.status(201).json({
    success: true,
    data: group,
  });
});

// @desc    Update accountability group
// @route   PUT /api/accountability/:id
// @access  Private/Premium
exports.updateGroup = asyncHandler(async (req, res, next) => {
  let group = await AccountabilityGroup.findById(req.params.id);

  if (!group) {
    return next(
      new ErrorResponse(`Group not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is the owner of the group
  if (group.ownerId.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`Only the group owner can update the group`, 401)
    );
  }

  // Don't allow updating the owner or invite code
  delete req.body.ownerId;
  delete req.body.inviteCode;

  group = await AccountabilityGroup.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: group,
  });
});

// @desc    Delete accountability group
// @route   DELETE /api/accountability/:id
// @access  Private/Premium
exports.deleteGroup = asyncHandler(async (req, res, next) => {
  const group = await AccountabilityGroup.findById(req.params.id);

  if (!group) {
    return next(
      new ErrorResponse(`Group not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is the owner of the group
  if (group.ownerId.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`Only the group owner can delete the group`, 401)
    );
  }

  // Delete all associated messages
  await Message.deleteMany({ groupId: req.params.id });

  // Delete the group
  await group.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Generate new invite code
// @route   PUT /api/accountability/:id/invite
// @access  Private/Premium
exports.generateInvite = asyncHandler(async (req, res, next) => {
  const group = await AccountabilityGroup.findById(req.params.id);

  if (!group) {
    return next(
      new ErrorResponse(`Group not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is the owner of the group
  if (group.ownerId.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`Only the group owner can generate invite codes`, 401)
    );
  }

  // Generate a new invite code
  const inviteCode = crypto.randomBytes(5).toString("hex");

  // Update the group
  group.inviteCode = inviteCode;
  await group.save();

  res.status(200).json({
    success: true,
    data: {
      inviteCode,
    },
  });
});

// @desc    Join group with invite code
// @route   POST /api/accountability/join/:code
// @access  Private/Premium
exports.joinGroup = asyncHandler(async (req, res, next) => {
  // Check if user has premium subscription
  const user = await User.findById(req.user.id);

  if (user.subscriptionStatus !== "premium") {
    return next(
      new ErrorResponse("Joining groups requires a premium subscription", 403)
    );
  }

  const group = await AccountabilityGroup.findOne({
    inviteCode: req.params.code,
  });

  if (!group) {
    return next(new ErrorResponse("Invalid or expired invite code", 404));
  }

  // Check if user is already a member
  if (group.members.includes(req.user.id)) {
    return next(
      new ErrorResponse("You are already a member of this group", 400)
    );
  }

  // Add user to group members
  group.members.push(req.user.id);
  await group.save();

  res.status(200).json({
    success: true,
    data: group,
  });
});

// @desc    Leave accountability group
// @route   PUT /api/accountability/:id/leave
// @access  Private/Premium
exports.leaveGroup = asyncHandler(async (req, res, next) => {
  const group = await AccountabilityGroup.findById(req.params.id);

  if (!group) {
    return next(
      new ErrorResponse(`Group not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is a member
  if (!group.members.includes(req.user.id)) {
    return next(new ErrorResponse("You are not a member of this group", 400));
  }

  // Don't allow the owner to leave (they should delete the group instead)
  if (group.ownerId.toString() === req.user.id) {
    return next(
      new ErrorResponse(
        "The owner cannot leave the group. Transfer ownership or delete the group instead.",
        400
      )
    );
  }

  // Remove user from group members
  group.members = group.members.filter(
    (memberId) => memberId.toString() !== req.user.id
  );

  await group.save();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Add habit to accountability group
// @route   PUT /api/accountability/:id/habits/:habitId
// @access  Private/Premium
exports.addHabitToGroup = asyncHandler(async (req, res, next) => {
  const group = await AccountabilityGroup.findById(req.params.id);

  if (!group) {
    return next(
      new ErrorResponse(`Group not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is a member
  if (!group.members.includes(req.user.id)) {
    return next(new ErrorResponse("You are not a member of this group", 401));
  }

  // Verify the habit exists and belongs to the user
  const habit = await Habit.findOne({
    _id: req.params.habitId,
    userId: req.user.id,
  });

  if (!habit) {
    return next(
      new ErrorResponse(`Habit not found with id of ${req.params.habitId}`, 404)
    );
  }

  // Check if habit is already in the group
  if (group.habits.includes(req.params.habitId)) {
    return next(
      new ErrorResponse("This habit is already shared with the group", 400)
    );
  }

  // Add habit to group
  group.habits.push(req.params.habitId);
  await group.save();

  res.status(200).json({
    success: true,
    data: group,
  });
});

// @desc    Remove habit from accountability group
// @route   DELETE /api/accountability/:id/habits/:habitId
// @access  Private/Premium
exports.removeHabitFromGroup = asyncHandler(async (req, res, next) => {
  const group = await AccountabilityGroup.findById(req.params.id);

  if (!group) {
    return next(
      new ErrorResponse(`Group not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is a member
  if (!group.members.includes(req.user.id)) {
    return next(new ErrorResponse("You are not a member of this group", 401));
  }

  // Verify the habit exists and belongs to the user
  const habit = await Habit.findOne({
    _id: req.params.habitId,
    userId: req.user.id,
  });

  if (!habit) {
    return next(
      new ErrorResponse(`Habit not found with id of ${req.params.habitId}`, 404)
    );
  }

  // Remove habit from group
  group.habits = group.habits.filter(
    (habitId) => habitId.toString() !== req.params.habitId
  );

  await group.save();

  res.status(200).json({
    success: true,
    data: group,
  });
});

// @desc    Get messages for a group
// @route   GET /api/accountability/:id/messages
// @access  Private/Premium
exports.getMessages = asyncHandler(async (req, res, next) => {
  const group = await AccountabilityGroup.findById(req.params.id);

  if (!group) {
    return next(
      new ErrorResponse(`Group not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is a member
  if (!group.members.includes(req.user.id)) {
    return next(new ErrorResponse("You are not a member of this group", 401));
  }

  const messages = await Message.find({ groupId: req.params.id })
    .populate("userId", "firstName lastName")
    .sort({ timestamp: -1 });

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages,
  });
});

// @desc    Add message to a group
// @route   POST /api/accountability/:id/messages
// @access  Private/Premium
exports.addMessage = asyncHandler(async (req, res, next) => {
  const group = await AccountabilityGroup.findById(req.params.id);

  if (!group) {
    return next(
      new ErrorResponse(`Group not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is a member
  if (!group.members.includes(req.user.id)) {
    return next(new ErrorResponse("You are not a member of this group", 401));
  }

  // Create message
  const message = await Message.create({
    groupId: req.params.id,
    userId: req.user.id,
    content: req.body.content,
    timestamp: Date.now(),
  });

  // Return the populated message
  const populatedMessage = await Message.findById(message._id).populate(
    "userId",
    "firstName lastName"
  );

  res.status(201).json({
    success: true,
    data: populatedMessage,
  });
});
