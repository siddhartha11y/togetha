import jwt from "jsonwebtoken";

 const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.token; // get token from cookies

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
      
    }
    console.log("Token received:", token); // Debugging line to check token value

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // verify token
    console.log("Decoded token:", decoded); // Debugging line to check decoded token
    req.user = decoded; // store user data in request
    console.log("User data set in request:", req.user); // Debugging line to check user data
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};
export default verifyToken;