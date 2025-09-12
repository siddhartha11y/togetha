import Story from "../models/storyModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for story media uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "public/images/stories";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter,
});

// Create a new story
const createStory = async (req, res) => {
  try {
    const { content, backgroundColor, textColor, music, gif, duration } = req.body;
    const userId = req.user.id;

    // Validate input - story must have content, media, or GIF
    if (!content && !req.file && !gif) {
      return res.status(400).json({ message: "Story must have content, media, or GIF" });
    }

    const storyData = {
      author: userId,
      content: content || "",
      backgroundColor: backgroundColor || "#000000",
      textColor: textColor || "#ffffff",
      duration: duration ? parseInt(duration) : 5000, // Default 5 seconds
    };

    // Add media if uploaded
    if (req.file) {
      storyData.media = `/images/stories/${req.file.filename}`;
      storyData.mediaType = req.file.mimetype.startsWith("video") ? "video" : "image";
    }

    // Add GIF if provided
    if (gif) {
      try {
        storyData.gif = JSON.parse(gif);
      } catch (error) {
        console.error("Error parsing GIF data:", error);
      }
    }

    // Add music if provided
    if (music) {
      try {
        storyData.music = JSON.parse(music);
      } catch (error) {
        console.error("Error parsing music data:", error);
      }
    }

    const story = new Story(storyData);
    await story.save();

    // Populate author info
    await story.populate("author", "username fullName profilePicture");

    res.status(201).json({
      message: "Story created successfully",
      story,
    });
  } catch (error) {
    console.error("Error creating story:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all active stories from followed users + own stories
const getStories = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get current user to access following list
    const currentUser = await User.findById(userId);
    const followingIds = currentUser.following || [];
    
    // Include own stories and stories from followed users
    // Convert to ObjectId for MongoDB aggregation
    const userIds = [new mongoose.Types.ObjectId(userId), ...followingIds.map(id => new mongoose.Types.ObjectId(id))];

    // Get active stories grouped by user
    const stories = await Story.aggregate([
      {
        $match: {
          author: { $in: userIds },
          isActive: true,
          expiresAt: { $gt: new Date() },
        },
      },
      {
        $sort: { createdAt: 1 }, // Changed to ascending order (oldest first)
      },
      {
        $group: {
          _id: "$author",
          stories: { $push: "$$ROOT" },
          latestStory: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $unwind: "$author",
      },
      {
        $project: {
          author: {
            _id: 1,
            username: 1,
            fullName: 1,
            profilePicture: 1,
          },
          stories: {
            $map: {
              input: "$stories",
              as: "story",
              in: {
                $mergeObjects: [
                  "$$story",
                  {
                    author: {
                      _id: "$author._id",
                      username: "$author.username",
                      fullName: "$author.fullName",
                      profilePicture: "$author.profilePicture",
                    },
                  },
                ],
              },
            },
          },
          latestStory: 1,
          hasUnviewed: {
            $anyElementTrue: {
              $map: {
                input: "$stories",
                as: "story",
                in: {
                  $not: {
                    $in: [new mongoose.Types.ObjectId(userId), "$$story.views.user"],
                  },
                },
              },
            },
          },
        },
      },
      {
        $sort: { "latestStory.createdAt": -1 },
      },
    ]);

    res.json(stories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get stories by specific user
const getUserStories = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const stories = await Story.find({
      author: userId,
      isActive: true,
      expiresAt: { $gt: new Date() },
    })
      .populate("author", "username fullName profilePicture")
      .populate("views.user", "username fullName profilePicture")
      .sort({ createdAt: -1 });

    // Mark stories as viewed by current user
    for (const story of stories) {
      await story.addView(currentUserId);
    }

    res.json(stories);
  } catch (error) {
    console.error("Error fetching user stories:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// View a specific story
const viewStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    const story = await Story.findById(storyId)
      .populate("author", "username fullName profilePicture")
      .populate("views.user", "username fullName profilePicture");

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (story.isExpired()) {
      return res.status(410).json({ message: "Story has expired" });
    }

    // Add view if not already viewed
    await story.addView(userId);

    res.json(story);
  } catch (error) {
    console.error("Error viewing story:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a story (only by author)
const deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (story.author.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this story" });
    }

    // Delete media file if exists
    if (story.media) {
      const mediaPath = path.join(__dirname, "..", "public", story.media);
      if (fs.existsSync(mediaPath)) {
        fs.unlinkSync(mediaPath);
      }
    }

    await Story.findByIdAndDelete(storyId);

    res.json({ message: "Story deleted successfully" });
  } catch (error) {
    console.error("Error deleting story:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get story views (only for story author)
const getStoryViews = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    const story = await Story.findById(storyId)
      .populate("views.user", "username fullName profilePicture");

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (story.author.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to view story analytics" });
    }

    res.json({
      totalViews: story.viewCount,
      views: story.views,
    });
  } catch (error) {
    console.error("Error fetching story views:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  upload,
  createStory,
  getStories,
  getUserStories,
  viewStory,
  deleteStory,
  getStoryViews,
};