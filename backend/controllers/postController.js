import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";

// Helper function to get the correct protocol
const getProtocol = (req) => {
  return process.env.NODE_ENV === "production" ? "https" : req.protocol;
};


export const createPost = async (req, res) => {
  try {
    const { title } = req.body;

    const authorId = req.user?.id;
    if (!authorId) {
      return res.status(401).json({ message: "Unauthorized: No user ID" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Get full image URL
    const imagePath = `/images/uploads/${req.file.filename}`;
    const fullImageUrl = `${getProtocol(req)}://${req.get("host")}${imagePath}`;

    // Fetch the author’s details once
    const author = await User.findById(authorId).select(
      "username fullName profilePicture"
    );
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    const profilePictureUrl = author.profilePicture
      ? `${getProtocol(req)}://${req.get("host")}${author.profilePicture}`
      : null;

    // Create post with author reference AND embedded public details
    const post = new Post({
      title,
      author: authorId, // still keep reference for relations
      imageUrl: fullImageUrl,
      authorUsername: author.username,
      authorFullName: author.fullName,
      authorProfilePicture: profilePictureUrl,
    });

    await post.save();

    // Push post ID into user's posts array
    await User.findByIdAndUpdate(authorId, {
      $push: { posts: post._id },
    });

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username profilePicture")
      .sort({ createdAt: -1 });

    const updatedPosts = posts.map((post) => {
      const postObj = post.toObject();

      return {
        ...postObj,
        imageUrl: post.imageUrl
          ? `${getProtocol(req)}://${req.get("host")}${post.imageUrl.replace(
              /^https?:\/\/[^/]+/,
              ""
            )}`
          : null,
        author: {
          ...post.author.toObject(),
          profilePicture: post.author?.profilePicture
            ? `${getProtocol(req)}://${req.get("host")}${
                post.author.profilePicture
              }`
            : null,
        },
        likes: post.likes.length, // return number of likes (not just array)
        likedByUser: req.user
          ? post.likes.some((id) => id.toString() === req.user.id)
          : false,
      };
    });

    res.status(200).json(updatedPosts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching posts", error: error.message });
  }
};


export const postLikes = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.id;
    const postOwnerId = post.author.toString();

    if (post.likes.includes(userId)) {
      // Unlike
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      // Like
      post.likes.push(userId);

      //  create notification only if not liking own post
      if (postOwnerId !== userId) {
        await Notification.create({
          recipient: postOwnerId,
          sender: userId,
          type: "like",
          post: post._id,
        });
      }
    }

    await post.save();
    res.json({
      likes: post.likes.length,
      likedByUser: post.likes.some((id) => id.toString() === userId),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Add a comment
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = { author: req.user.id, text };
    post.comments.push(comment);

    await post.save();
    await post.populate("comments.author", "username profilePicture");

    // Format comments with full profile picture URLs
    const formattedComments = post.comments.map(comment => ({
      ...comment.toObject(),
      author: {
        ...comment.author.toObject(),
        profilePicture: comment.author?.profilePicture
          ? `${getProtocol(req)}://${req.get("host")}${comment.author.profilePicture}`
          : null,
      }
    }));

    // 🔔 notify post owner
    if (post.author.toString() !== req.user.id) {
      await Notification.create({
        sender: req.user.id,
        recipient: post.author,
        type: "comment",
        post: post._id,
      });
    }

    res.status(201).json(formattedComments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all comments for a post
export const getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "comments.author",
      "username profilePicture"
    );
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Format comments with full profile picture URLs
    const formattedComments = post.comments.map(comment => ({
      ...comment.toObject(),
      author: {
        ...comment.author.toObject(),
        profilePicture: comment.author?.profilePicture
          ? `${getProtocol(req)}://${req.get("host")}${comment.author.profilePicture}`
          : null,
      }
    }));

    console.log("👉 Comments fetched:", JSON.stringify(formattedComments, null, 2));

    res.json(formattedComments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Edit a comment
export const editComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.text = text;
    await post.save();
    await post.populate("comments.author", "username profilePicture");

    // Format comments with full profile picture URLs
    const formattedComments = post.comments.map(comment => ({
      ...comment.toObject(),
      author: {
        ...comment.author.toObject(),
        profilePicture: comment.author?.profilePicture
          ? `${getProtocol(req)}://${req.get("host")}${comment.author.profilePicture}`
          : null,
      }
    }));

    res.json(formattedComments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // ✅ allow comment author OR post author
    if (
      comment.author.toString() !== req.user.id &&
      post.author.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.deleteOne(); // remove comment
    await post.save();
    await post.populate("comments.author", "username profilePicture");

    // Format comments with full profile picture URLs
    const formattedComments = post.comments.map(comment => ({
      ...comment.toObject(),
      author: {
        ...comment.author.toObject(),
        profilePicture: comment.author?.profilePicture
          ? `${getProtocol(req)}://${req.get("host")}${comment.author.profilePicture}`
          : null,
      }
    }));

    res.json({ message: "Comment deleted", comments: formattedComments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single post by ID
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "username profilePicture"
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    
    // Add like status for current user (if authenticated)
    let postWithLikeStatus = post.toObject();
    if (req.user) {
      postWithLikeStatus.likedByUser = post.likes.includes(req.user._id);
      postWithLikeStatus.likes = post.likes.length; // Convert array to count
    } else {
      postWithLikeStatus.likedByUser = false;
      postWithLikeStatus.likes = post.likes.length;
    }
    
    res.json(postWithLikeStatus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const { title, imageUrl } = req.body;

    // Build only provided fields
    const updates = {};
    if (typeof title !== "undefined") updates.title = title;

    // If a new image was uploaded via multer
    if (req.file) {
      // adjust the folder to whatever you use for post images
      updates.imageUrl = `/images/uploads/${req.file.filename}`;
    } else if (typeof imageUrl !== "undefined") {
      // allow direct url replacement if you send one
      updates.imageUrl = imageUrl;
    }

    updates.updatedAt = new Date();

    // Atomic: find by id AND author (ownership)
    const updated = await Post.findOneAndUpdate(
      { _id: id, author: req.user.id },
      { $set: updates },
      { new: true }
    )
      .populate("author", "username profilePicture")
      .lean();

    if (!updated) {
      // Either not found or not owned by current user
      return res
        .status(404)
        .json({ message: "Post not found or not authorized" });
    }

    // Normalize URLs like you do elsewhere
    const host = `${getProtocol(req)}://${req.get("host")}`;
    const normalize = (p) =>
      p ? `${host}${String(p).replace(/^https?:\/\/[^/]+/, "")}` : null;

    return res.status(200).json({
      ...updated,
      imageUrl: normalize(updated.imageUrl),
      author: updated.author && {
        ...updated.author,
        profilePicture: normalize(updated.author.profilePicture),
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error updating post", error: err.message });
  }
}

/**
 * Delete Post
 */
export async function deletePost(req, res) {
  try {
    const { id } = req.params;

    // Only delete if the logged-in user is the author
    const post = await Post.findOne({ _id: id, author: req.user.id });

    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found or not authorized" });
    }

    await post.deleteOne();
    // (Optional) also unlink the image file from disk here if you store locally.

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error deleting post", error: err.message });
  }
}
// postController.js
// Searching Posts
export async function searchPosts(req, res) {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const posts = await Post.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { "comments.text": { $regex: query, $options: "i" } },
      ],
    }).populate("author", "username");

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error searching posts", error });
  }
}

// Get trending posts (most likes + comments)
export const getTrendingPosts = async (req, res) => {
  try {
    const { limit = 20, timeframe = 'week' } = req.query;
    
    // Calculate date threshold based on timeframe
    const now = new Date();
    let dateThreshold;
    
    switch (timeframe) {
      case 'day':
        dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const posts = await Post.aggregate([
      // Filter posts within timeframe
      {
        $match: {
          createdAt: { $gte: dateThreshold }
        }
      },
      // Add calculated fields for trending score
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          commentsCount: { $size: "$comments" },
          // Trending score: likes * 2 + comments * 3 (comments weighted more)
          trendingScore: {
            $add: [
              { $multiply: [{ $size: "$likes" }, 2] },
              { $multiply: [{ $size: "$comments" }, 3] }
            ]
          },
          // Recency boost (newer posts get slight advantage)
          recencyBoost: {
            $divide: [
              { $subtract: ["$createdAt", dateThreshold] },
              1000000 // Convert to smaller number
            ]
          }
        }
      },
      // Final trending score with recency
      {
        $addFields: {
          finalScore: {
            $add: ["$trendingScore", { $multiply: ["$recencyBoost", 0.1] }]
          }
        }
      },
      // Sort by trending score
      { $sort: { finalScore: -1 } },
      // Limit results
      { $limit: parseInt(limit) },
      // Populate author info
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author"
        }
      },
      { $unwind: "$author" },
      // Project only needed fields
      {
        $project: {
          title: 1,
          imageUrl: 1,
          createdAt: 1,
          likes: 1,
          comments: 1,
          likesCount: 1,
          commentsCount: 1,
          trendingScore: 1,
          finalScore: 1,
          "author._id": 1,
          "author.username": 1,
          "author.profilePicture": 1
        }
      }
    ]);

    // Format the response with full URLs
    const formattedPosts = posts.map(post => ({
      ...post,
      imageUrl: post.imageUrl
        ? `${getProtocol(req)}://${req.get("host")}${post.imageUrl.replace(/^https?:\/\/[^/]+/, "")}`
        : null,
      author: {
        ...post.author,
        profilePicture: post.author?.profilePicture
          ? `${getProtocol(req)}://${req.get("host")}${post.author.profilePicture}`
          : null,
      },
      likes: post.likes.length,
      likedByUser: req.user
        ? post.likes.some((id) => id.toString() === req.user.id)
        : false,
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.error("Error fetching trending posts:", error);
    res.status(500).json({ message: "Error fetching trending posts", error: error.message });
  }
};

// Share post to friends
export const sharePost = async (req, res) => {
  try {
    const { postId, recipients, message } = req.body;
    const senderId = req.user.id;

    if (!postId || !recipients || recipients.length === 0) {
      return res.status(400).json({ message: "Post ID and recipients are required" });
    }

    // Import models needed for messaging
    const Message = (await import("../models/messageModel.js")).default;
    const Chat = (await import("../models/chatModel.js")).default;
    const User = (await import("../models/userModel.js")).default;

    // Verify post exists
    const post = await Post.findById(postId).populate("author", "username fullName");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Create actual messages for each recipient
    const sharePromises = recipients.map(async (recipientId) => {
      try {
        // Find or create chat between sender and recipient
        let chat = await Chat.findOne({
          participants: { $all: [senderId, recipientId] },
          isGroup: false
        });

        if (!chat) {
          // Create new chat
          chat = await Chat.create({
            participants: [senderId, recipientId],
            isGroup: false
          });
        }

        // Create the shared post message
        const sharedMessage = await Message.create({
          sender: senderId,
          chat: chat._id,
          content: message || `Shared a post`,
          messageType: 'shared_post',
          sharedPost: postId
        });

        // Populate the message with full details
        const fullMessage = await Message.findById(sharedMessage._id)
          .populate("sender", "username fullName profilePicture")
          .populate({
            path: "chat",
            populate: {
              path: "participants",
              select: "username fullName profilePicture"
            }
          })
          .populate({
            path: "sharedPost",
            populate: {
              path: "author",
              select: "username fullName profilePicture"
            }
          });

        // Update chat's latest message
        await Chat.findByIdAndUpdate(chat._id, {
          latestMessage: fullMessage._id,
          updatedAt: new Date()
        });

        console.log(`📤 Post shared to ${recipientId} via message`);
        
        // Emit message via socket to recipients in real-time
        const io = req.app.get('io'); // Get io instance from app
        if (io && fullMessage.chat?.participants) {
          fullMessage.chat.participants.forEach((participant) => {
            if (participant._id.toString() !== senderId.toString()) {
              console.log("📨 Emitting shared post message to user:", participant._id);
              io.to(participant._id.toString()).emit("message_received", fullMessage);
              io.to(fullMessage.chat._id.toString()).emit("message_received", fullMessage);
            }
          });
        }
        
        return fullMessage;
      } catch (error) {
        console.error(`Error sharing to user ${recipientId}:`, error);
        return null;
      }
    });

    const shareResults = await Promise.all(sharePromises);
    const successfulShares = shareResults.filter(result => result !== null);

    // Update post share count
    await Post.findByIdAndUpdate(postId, {
      $inc: { shareCount: successfulShares.length }
    });

    res.status(200).json({
      success: true,
      message: `Post shared with ${successfulShares.length} user${successfulShares.length !== 1 ? 's' : ''}`,
      sharedCount: successfulShares.length,
      sharedMessages: successfulShares
    });
  } catch (error) {
    console.error("Error sharing post:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error sharing post", 
      error: error.message 
    });
  }
};