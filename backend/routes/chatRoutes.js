import express from "express";
import verifyToken from "../middleware/JWT.auth.js";
import {
  createOrGetOneToOneChat,
  getMyChats,
  createGroupChat,
} from "../controllers/chatController.js";

const router = express.Router();

router.use(verifyToken);

// 1:1 chat
router.post("/:userId", createOrGetOneToOneChat);

// my chats
router.get("/", getMyChats);

// group chat (optional for later UI)
router.post("/group", createGroupChat);

export default router;
