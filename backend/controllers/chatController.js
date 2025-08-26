import mongoose from "mongoose";
import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

// Start or fetch a 1:1 chat with another user
export async function createOrGetOneToOneChat(req, res) {
  try {
    const { userId } = req.params; // other user's id
    const me = req.user._id;
        console.log("Fetching chats for user:", userId);


    if (!mongoose.isValidObjectId(userId) || userId.toString() === me.toString()) {
        console.log("❌ Invalid userId or same as me");

      return res.status(400).json({ message: "Invalid userId" });
    }

    // Ensure other user exists
    const other = await User.findById(userId).select("_id");
    if (!other) {
        console.log("❌ User not found in DB:", userId);

      return res.status(404).json({ message: "User not found" });
    }

    // Find existing 1:1 chat
    let chat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [me, userId], $size: 2 },
    })
      .populate("participants", "_id username fullName avatar")
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "_id username fullName avatar" },
      });

    if (!chat) {
      chat = await Chat.create({
        isGroup: false,
        participants: [me, userId],
      });
      chat = await Chat.findById(chat._id)
        .populate("participants", "_id username fullName avatar");
    }

    return res.status(200).json(chat);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

// Get all chats for logged-in user (sorted by recent activity)
export async function getMyChats(req, res) {
  try {
    const me = req.user._id;

    const chats = await Chat.find({ participants: me })
      .sort({ updatedAt: -1 })
      .populate("participants", "_id username fullName avatar")
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "_id username fullName avatar" },
      });

    return res.status(200).json(chats);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

// (Optional for later) Create group chat
export async function createGroupChat(req, res) {
  try {
    const { name, participantIds } = req.body; // includes others; we'll add me
    if (!name || !Array.isArray(participantIds) || participantIds.length < 2) {
      return res.status(400).json({ message: "Group requires name + >=2 participants" });
    }

    const uniqueIds = [...new Set([...participantIds.map(String), String(req.user._id)])];
    const chat = await Chat.create({
      isGroup: true,
      name,
      participants: uniqueIds,
    });

    const populated = await Chat.findById(chat._id)
      .populate("participants", "_id username fullName avatar");

    return res.status(201).json(populated);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}
