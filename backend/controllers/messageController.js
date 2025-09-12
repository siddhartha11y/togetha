import Message from "../models/messageModel.js";
import Chat from "../models/chatModel.js";

// Send a new message
export const sendMessage = async (req, res) => {
  const { content, messageType, sharedPost, callInfo } = req.body;
  const { chatId } = req.params;

  if (!content || !chatId) {
    return res.status(400).json({ message: "Content and chatId are required" });
  }

  try {
    // Verify chat exists and user is a participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!chat.participants.includes(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to send messages in this chat" });
    }

    const messageData = {
      sender: req.user._id,
      content: content.trim(),
      chat: chatId,
      messageType: messageType || 'text'
    };

    // Add additional fields based on message type
    if (messageType === 'shared_post' && sharedPost) {
      messageData.sharedPost = sharedPost;
    }

    if (messageType === 'call_history' && callInfo) {
      messageData.callInfo = callInfo;
    }

    const message = await Message.create(messageData);

    const fullMessage = await Message.findById(message._id)
      .populate("sender", "username fullName profilePicture")
      .populate({
        path: "chat",
        populate: {
          path: "participants",
          select: "username fullName profilePicture",
        },
      });

    // Update latestMessage in chat
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: fullMessage._id,
      updatedAt: new Date(),
    });

    res.json(fullMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: error.message });
  }
};

// Fetch all messages in a chat
export const getChatMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "username fullName profilePicture")
      .populate("chat")
      .populate({
        path: "sharedPost",
        populate: {
          path: "author",
          select: "username fullName profilePicture"
        }
      })
      .sort({ createdAt: 1 }); // Sort by creation time (oldest first)

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear all messages in a chat
export const clearChatMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    // Verify chat exists and user is a participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!chat.participants.includes(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to clear messages in this chat" });
    }

    // Delete all messages in the chat
    await Message.deleteMany({ chat: chatId });

    // Clear latestMessage in chat
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: null,
      updatedAt: new Date(),
    });

    res.json({ message: "Chat messages cleared successfully" });
  } catch (error) {
    console.error("Error clearing chat messages:", error);
    res.status(500).json({ message: error.message });
  }
};