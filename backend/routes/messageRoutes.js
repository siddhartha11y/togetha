import express from "express";
import verifyToken from "../middleware/JWT.auth.js";
import {
  sendMessage,
  getChatMessages,
} from "../controllers/messageController.js";

const router = express.Router();

router.use(verifyToken);

// send message
router.post("/:chatId", sendMessage);

// get messages
router.get("/:chatId", getChatMessages);

export default router;
