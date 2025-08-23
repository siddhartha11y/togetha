import express from "express";
import {
  createNotification,
  getUserNotifications,
  markAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import verifyToken from "../middleware/JWT.auth.js"; // assuming you already have JWT auth

const router = express.Router();

// Create a notification
router.post("/", verifyToken, createNotification);

// Get all notifications for logged-in user
router.get("/", verifyToken, getUserNotifications);

// Mark as read
router.put("/:id/read", verifyToken, markAsRead);

// Delete a notification
router.delete("/:id", verifyToken, deleteNotification);

export default router;
