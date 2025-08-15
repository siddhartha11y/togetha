import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";

// Ensure profiles folder exists
const profileDir = "public/images/profiles";
if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
}

// Storage for profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileDir); // safe directory
  },
  filename: (req, file, cb) => {
    crypto.randomBytes(12, (err, name) => {
      if (err) return cb(err);
      const filename = name.toString("hex") + path.extname(file.originalname).toLowerCase();
      cb(null, filename);
    });
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, gif) are allowed"));
  }
};

const uploadProfile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

export default uploadProfile;
