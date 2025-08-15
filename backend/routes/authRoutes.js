import express from 'express';
import verifytoken from '../middleware/JWT.auth.js'; // your JWT auth middleware
import uploadProfile from '../config/multerProfile.js'; // your multer config for profile picture upload
 
const router = express.Router();
import { authRegister, authLogin, authProfile, updateProfile } from "../controllers/authController.js";


router.post('/register', authRegister);
router.post('/login', authLogin);
router.get("/profile", verifytoken, authProfile);
// Update profile
router.put("/update-profile", verifytoken, uploadProfile.single("profilePicture"), updateProfile);

export default router;


