import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Notification from "../models/notificationModel.js";

// Register Controller
export async function authRegister(req, res) {
  try {
    console.log("Register request received:", req.body);
    if (!req.body) {
      return res.status(400).json({ message: "Request body is required" });
    }
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true only in prod
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        profilePicture: savedUser.profilePicture
          ? `${req.protocol}://${req.get("host")}${savedUser.profilePicture}`
          : null,
        bio: savedUser.bio,
      },
      token,
    });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Login Controller
export async function authLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true only in prod
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful.",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture
          ? `${req.protocol}://${req.get("host")}${user.profilePicture}`
          : null,
        bio: user.bio,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function authProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password").populate({
      path: "posts",
      select: "title  imageUrl createdAt author",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      ...user._doc,
      profilePicture: user.profilePicture
        ? `${req.protocol}://${req.get("host")}${user.profilePicture}`
        : null,
      posts: (user.posts || []).map((post) => ({
        ...post._doc,
        imageUrl: post.imageUrl
          ? `${req.protocol}://${req.get("host")}${post.imageUrl.replace(
              /^https?:\/\/[^/]+/,
              ""
            )}`
          : null,
        author: post.author
          ? {
              ...post.author._doc,
              profilePicture: post.author.profilePicture
                ? `${req.protocol}://${req.get("host")}${
                    post.author.profilePicture
                  }`
                : null,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateProfile(req, res) {
  try {
    const { username, fullName, bio } = req.body;

    // Prepare update object
    const updateData = {
      username,
      fullName,
      bio,
    };

    // If a file is uploaded, update profilePicture field
    if (req.file) {
      updateData.profilePicture = `/images/profiles/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select("-password"); // exclude password from response

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update profile" });
  }
}

// Logout route
export const authLogout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // cookie only over HTTPS in prod
    sameSite: "strict",
  });
  return res.status(200).json({ message: "Logged out successfully" });
};

// Get user by username
export async function getUserByUsername(req, res) {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("-password")
      .populate("posts", "title imageUrl createdAt");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      ...user._doc,
      profilePicture: user.profilePicture
        ? `${req.protocol}://${req.get("host")}${user.profilePicture}`
        : null,
      posts: (user.posts || []).map((post) => ({
        ...post._doc,
        imageUrl: post.imageUrl
          ? `${req.protocol}://${req.get("host")}${post.imageUrl.replace(
              /^https?:\/\/[^/]+/,
              ""
            )}`
          : null,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// Search users by username
export async function searchUsers(req, res) {
  try {
    const query = req.query.q?.trim();

    if (!query) {
      return res.json([]);
    }

    // Find users by username (case-insensitive)
    const users = await User.find({
      username: { $regex: query, $options: "i" },
    }).select("username fullName profilePicture followers");

    // Format response (and check if logged-in user follows them)
    const formattedUsers = users.map((user) => ({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      profilePicture: user.profilePicture
        ? `${req.protocol}://${req.get("host")}${user.profilePicture}`
        : null,
      isFollowing: user.followers.includes(req.user?.id), // true/false
    }));

    res.json(formattedUsers);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export const followUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow.followers.includes(req.user.id)) {
      userToFollow.followers.push(req.user.id);
      currentUser.following.push(req.params.id);

      await userToFollow.save();
      await currentUser.save();

      // 🔔 notify followed user
      await Notification.create({
        sender: req.user.id,
        recipient: userToFollow._id,
        type: "follow",
      });

      res.status(200).json({ message: "User followed" });
    } else {
      res.status(400).json({ message: "You already follow this user" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// 👉 Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: "You can't unfollow yourself" });
    }

    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (userToUnfollow.followers.includes(req.user.id)) {
      userToUnfollow.followers.pull(req.user.id);
      currentUser.following.pull(req.params.id);

      await userToUnfollow.save();
      await currentUser.save();

      res.status(200).json({ message: "User unfollowed" });
    } else {
      res.status(400).json({ message: "You don't follow this user" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
// Get user's following list
export const getFollowing = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .populate('following', 'username fullName profilePicture')
      .select('following');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Format the following list with full URLs
    const formattedFollowing = user.following.map(followedUser => ({
      _id: followedUser._id,
      username: followedUser.username,
      fullName: followedUser.fullName,
      profilePicture: followedUser.profilePicture
        ? `${req.protocol}://${req.get("host")}${followedUser.profilePicture}`
        : null
    }));

    res.status(200).json(formattedFollowing);
  } catch (error) {
    console.error("Error fetching following list:", error);
    res.status(500).json({ message: "Error fetching following list", error: error.message });
  }
};

// Get user's followers list
export const getFollowers = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .populate('followers', 'username fullName profilePicture')
      .select('followers');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Format the followers list with full URLs
    const formattedFollowers = user.followers.map(follower => ({
      _id: follower._id,
      username: follower.username,
      fullName: follower.fullName,
      profilePicture: follower.profilePicture
        ? `${req.protocol}://${req.get("host")}${follower.profilePicture}`
        : null
    }));

    res.status(200).json(formattedFollowers);
  } catch (error) {
    console.error("Error fetching followers list:", error);
    res.status(500).json({ message: "Error fetching followers list", error: error.message });
  }
};