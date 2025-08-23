import express from "express";
import upload from "../config/multer.js";
import { createPost, getAllPosts, postLikes, addComment, editComment, deleteComment, getComments, deletePost, updatePost, getPostById, searchPosts } from "../controllers/postController.js";
import verifyToken from "../middleware/JWT.auth.js"; // your JWT verify file

const router = express.Router();

router.post("/", verifyToken, upload.single("image"), createPost);
router.get("/", getAllPosts);

// Like / Unlike a post
router.post("/:id/like", verifyToken, postLikes );
router.post("/:id/comments", verifyToken, addComment);
// Get all comments for a post
router.get("/:id/comments", verifyToken, getComments);

router.put("/:postId/comments/:commentId", verifyToken, editComment);
router.delete("/:postId/comments/:commentId", verifyToken, deleteComment);
router.get("/:id", getPostById);

// Update: accepts JSON or multipart/form-data with field name "image"
router.put("/:id", verifyToken, upload.single("image"), updatePost);

// Delete
router.delete("/:id", verifyToken, deletePost);

router.get("/search", verifyToken, searchPosts);


export default router;
