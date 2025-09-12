import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // The user who will receive notification
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // The user who triggered notification
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "comment", "follow", "story"], // Type of notification
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post", // If related to post (like/comment), else null for follow
    },
    isRead: {
      type: Boolean,
      default: false, // Notifications unread by default
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
