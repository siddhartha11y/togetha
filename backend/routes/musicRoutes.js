import express from 'express';
import {
  searchMusic,
  getTrendingMusic,
  getMusicByLanguage,
  getMusicFromPlatform,
  getLyrics,
  getMusicCategories
} from '../controllers/musicController.js';
import verifyToken from '../middleware/JWT.auth.js';

const router = express.Router();

// Music routes don't require authentication for basic search
// router.use(verifyToken);

// Search music across all platforms
router.get('/search', searchMusic);

// Get trending music
router.get('/trending', getTrendingMusic);

// Get music by language
router.get('/language', getMusicByLanguage);

// Get music from specific platform
router.get('/platform/:platform', getMusicFromPlatform);

// Get lyrics for a song
router.get('/lyrics', getLyrics);

// Get music categories
router.get('/categories', getMusicCategories);

export default router;