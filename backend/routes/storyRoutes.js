import express from "express";
import {
  upload,
  createStory,
  getStories,
  getUserStories,
  viewStory,
  deleteStory,
  getStoryViews,
} from "../controllers/storyController.js";
import verifyToken from "../middleware/JWT.auth.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Create a new story
router.post("/", upload.single("media"), createStory);

// Get all stories from followed users
router.get("/", getStories);

// Get stories by specific user
router.get("/user/:userId", getUserStories);

// View a specific story
router.get("/:storyId", viewStory);

// Delete a story
router.delete("/:storyId", deleteStory);

// Get story views (analytics)
router.get("/:storyId/views", getStoryViews);

export default router;