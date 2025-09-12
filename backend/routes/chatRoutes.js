import express from "express";
import verifyToken from "../middleware/JWT.auth.js";
import {
  createOrGetOneToOneChat,
  getMyChats,
  createGroupChat,
  getChatById,
  deleteChat,
} from "../controllers/chatController.js";

const router = express.Router();


// 1:1 chat
router.post("/:userId", verifyToken, createOrGetOneToOneChat);

// my chats
router.get("/", verifyToken, getMyChats);

// group chat (optional for later UI)
router.post("/group", verifyToken, createGroupChat);

// ✅ get single chat by id
router.get("/:chatId", verifyToken, getChatById);

// ✅ delete chat by id
router.delete("/:chatId", verifyToken, deleteChat);

export default router;
