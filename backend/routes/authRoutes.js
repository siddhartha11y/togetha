import express from 'express';
import verifytoken from '../middleware/JWT.auth.js';
import uploadProfile from '../config/multerProfile.js';
import { authRegister, authLogin, authProfile, updateProfile, authLogout, followUser, unfollowUser, getUserByUsername, searchUsers, getFollowing, getFollowers } from "../controllers/authController.js";

const router = express.Router();


router.post('/register', authRegister);
router.post('/login', authLogin);
router.get("/profile", verifytoken, authProfile);
// Update profile
router.put("/update-profile", verifytoken, uploadProfile.single("profilePicture"), updateProfile);
router.post("/logout", authLogout);

router.get("/search", verifytoken, searchUsers);
router.get("/following", verifytoken, getFollowing);
router.get("/followers", verifytoken, getFollowers);
router.get("/:username", getUserByUsername);
router.put("/:id/follow", verifytoken, followUser);
router.put("/:id/unfollow", verifytoken, unfollowUser);

export default router;


