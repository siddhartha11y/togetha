import Message from "../models/messageModel.js";
import Chat from "../models/chatModel.js";

// Send a new message
export const sendMessage = async (req, res) => {
  const { content } = req.body;
  const { chatId } = req.params; // get chatId from route params

  if (!content || !chatId) {
    return res.status(400).json({ message: "Content and chatId are required" });
  }

  try {
    const message = await Message.create({
      sender: req.user._id,
      content,
      chat: chatId,
    });

    const fullMessage = await message
      .populate("sender", "username fullName profilePic")
      .populate("chat");

    // update latestMessage in chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: fullMessage });

    res.json(fullMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch all messages in a chat
export const getChatMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "username fullName profilePic")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
