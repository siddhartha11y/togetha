import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
      expiresIn: "1h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true only in prod
      sameSite: "strict",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        profilePicture: savedUser.profilePicture,
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
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true only in prod
      sameSite: "strict",
    });

    res.status(200).json({
      message: "Login successful.",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
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
    const user = await User.findById(req.user.id)
  .select("-password")
  .populate({
    path: "posts",
    select: "title content imageUrl createdAt author",
  });


    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      ...user._doc,
      posts: user.posts || [],
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
