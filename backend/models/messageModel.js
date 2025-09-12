import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, trim: true, default: "" },
    messageType: { 
      type: String, 
      enum: ['text', 'shared_post', 'image', 'file', 'call_history'], 
      default: 'text' 
    },
    sharedPost: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Post",
      required: function() { return this.messageType === 'shared_post'; }
    },
    callInfo: {
      type: {
        type: String,
        enum: ['audio', 'video']
      },
      duration: String,
      status: {
        type: String,
        enum: ['started', 'ended', 'missed']
      }
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // attachments: [{ url: String, type: String }] // (optional future)
  },
  { timestamps: true }
);

messageSchema.index({ chat: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
