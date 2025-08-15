import Post from "../models/postModel.js";
import User from "../models/userModel.js";

export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

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
    const author = await User.findById(authorId).select("username fullName profilePicture");
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    const profilePictureUrl = author.profilePicture
      ? `${req.protocol}://${req.get("host")}${author.profilePicture}`
      : null;

    // Create post with author reference AND embedded public details
    const post = new Post({
      title,
      content,
      author: authorId, // still keep reference for relations
      imageUrl: fullImageUrl,
      authorUsername: author.username,
      authorFullName: author.fullName,
      authorProfilePicture: profilePictureUrl,
    });

    await post.save();

    // Push post ID into user's posts array
    await User.findByIdAndUpdate(authorId, {
      $push: { posts: post._id }
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
      .populate("author", "username profilePicture") // so we get author info
      .sort({ createdAt: -1 });

    const updatedPosts = posts.map(post => ({
      ...post.toObject(), // convert Mongoose document to plain object
      imageUrl: post.imageUrl
        ? `${req.protocol}://${req.get("host")}${post.imageUrl.replace(/^https?:\/\/[^/]+/, "")}`
        : null,
      author: {
        ...post.author.toObject(),
        profilePicture: post.author?.profilePicture
          ? `${req.protocol}://${req.get("host")}${post.author.profilePicture}`
            : null
      }
    }));

    res.status(200).json(updatedPosts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error: error.message });
  }
};
