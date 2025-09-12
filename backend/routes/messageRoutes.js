import express from "express";
import verifyToken from "../middleware/JWT.auth.js";
import { sendMessage, getChatMessages, clearChatMessages } from "../controllers/messageController.js";

const router = express.Router();

router.post("/:chatId", verifyToken, sendMessage);
router.get("/:chatId", verifyToken, getChatMessages);
router.delete("/:chatId/clear", verifyToken, clearChatMessages);

export default router;
