import express from "express";
import upload from "../config/multer.js";
import { createPost, getAllPosts } from "../controllers/postController.js";
import verifyToken from "../middleware/JWT.auth.js"; // your JWT verify file

const router = express.Router();

router.post("/", verifyToken, upload.single("image"), createPost);
router.get("/", getAllPosts);

export default router;
