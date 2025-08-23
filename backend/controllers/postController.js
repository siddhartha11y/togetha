import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";


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
    const fullImageUrl = `${req.protocol}://${req.get("host")}${imagePath}`;

    // Fetch the author’s details once
    const author = await User.findById(authorId).select(
      "username fullName profilePicture"
    );
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    const profilePictureUrl = author.profilePicture
      ? `${req.protocol}://${req.get("host")}${author.profilePicture}`
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
          ? `${req.protocol}://${req.get("host")}${post.imageUrl.replace(
              /^https?:\/\/[^/]+/,
              ""
            )}`
          : null,
        author: {
          ...post.author.toObject(),
          profilePicture: post.author?.profilePicture
            ? `${req.protocol}://${req.get("host")}${
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

      // 🔔 create notification only if not liking own post
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

    // 🔔 notify post owner
    if (post.author.toString() !== req.user.id) {
      await Notification.create({
        sender: req.user.id,
        recipient: post.author,
        type: "comment",
        post: post._id,
      });
    }

    res.status(201).json(post.comments);
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

    console.log("👉 Comments fetched:", JSON.stringify(post.comments, null, 2));

    res.json(post.comments); // return only comments
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

    res.json(post.comments);
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

    res.json({ message: "Comment deleted", comments: post.comments });
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
    res.json(post);
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
    const host = `${req.protocol}://${req.get("host")}`;
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
