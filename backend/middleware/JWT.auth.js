import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

 const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
      
    }
    console.log("Token received:", token); // Debugging line to check token value

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // verify token
    console.log("Decoded token:", decoded); // Debugging line to check decoded token
     // ✅ Fetch user (only necessary fields to reduce payload)
    const user = await User.findById(decoded.id).select(
      "_id username fullName profilePicture"
    );
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ Attach user to request for downstream routes
    req.user = user;
    console.log("User data set in request:", req.user); // Debugging line to check user data
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};
export default verifyToken;