const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AccountabilityGroup",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: [true, "Message content is required"],
    trim: true,
    maxlength: [2000, "Message cannot be more than 2000 characters"],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for efficient queries
MessageSchema.index({ groupId: 1, timestamp: -1 });

module.exports = mongoose.model("Message", MessageSchema);
