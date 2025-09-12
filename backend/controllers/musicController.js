import musicService from '../services/musicService.js';

// Search music across all platforms
export const searchMusic = async (req, res) => {
  try {
    console.log('🎵 Music search request:', req.query);
    const { query, limit = 50 } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    console.log('🔍 Searching for:', query);
    const results = await musicService.searchAllPlatforms(query, parseInt(limit));
    console.log('📊 Search results count:', results.length);
    
    res.status(200).json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('❌ Error searching music:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error searching music', 
      error: error.message 
    });
  }
};

// Get trending music
export const getTrendingMusic = async (req, res) => {
  try {
    console.log('🔥 Trending music request:', req.query);
    const { limit = 50 } = req.query;
    
    const results = await musicService.getTrendingMusic(parseInt(limit));
    console.log('📊 Trending results count:', results.length);
    
    res.status(200).json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('❌ Error getting trending music:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error getting trending music', 
      error: error.message 
    });
  }
};

// Get music by language
export const getMusicByLanguage = async (req, res) => {
  try {
    const { language, limit = 30 } = req.query;
    
    if (!language) {
      return res.status(400).json({ message: 'Language parameter is required' });
    }

    const results = await musicService.getMusicByLanguage(language, parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: results,
      count: results.length,
      language: language
    });
  } catch (error) {
    console.error('Error getting music by language:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error getting music by language', 
      error: error.message 
    });
  }
};

// Get music from specific platform
export const getMusicFromPlatform = async (req, res) => {
  try {
    const { platform, query, limit = 20 } = req.query;
    
    if (!platform || !query) {
      return res.status(400).json({ message: 'Platform and query parameters are required' });
    }

    let results = [];
    
    switch (platform.toLowerCase()) {
      case 'spotify':
        results = await musicService.searchSpotify(query, parseInt(limit));
        break;
      case 'youtube':
        results = await musicService.searchYouTube(query, parseInt(limit));
        break;
      case 'deezer':
        results = await musicService.searchDeezer(query, parseInt(limit));
        break;
      default:
        return res.status(400).json({ message: 'Unsupported platform' });
    }
    
    res.status(200).json({
      success: true,
      data: results,
      count: results.length,
      platform: platform
    });
  } catch (error) {
    console.error(`Error getting music from ${platform}:`, error);
    res.status(500).json({ 
      success: false, 
      message: `Error getting music from ${platform}`, 
      error: error.message 
    });
  }
};

// Get lyrics for a song
export const getLyrics = async (req, res) => {
  try {
    const { title, artist } = req.query;
    
    if (!title || !artist) {
      return res.status(400).json({ message: 'Title and artist parameters are required' });
    }

    const lyrics = await musicService.getLyrics(title, artist);
    
    res.status(200).json({
      success: true,
      data: lyrics
    });
  } catch (error) {
    console.error('Error getting lyrics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error getting lyrics', 
      error: error.message 
    });
  }
};

// Get popular music categories
export const getMusicCategories = async (req, res) => {
  try {
    const categories = [
      {
        id: 'trending',
        name: 'Trending',
        description: 'Most popular songs right now',
        icon: 'trending-up'
      },
      {
        id: 'hindi',
        name: 'Hindi',
        description: 'Bollywood and Indian music',
        icon: 'globe'
      },
      {
        id: 'english',
        name: 'English',
        description: 'International pop and rock',
        icon: 'mic'
      },
      {
        id: 'spanish',
        name: 'Spanish',
        description: 'Latin and Spanish music',
        icon: 'music'
      },
      {
        id: 'korean',
        name: 'K-Pop',
        description: 'Korean pop music',
        icon: 'heart'
      },
      {
        id: 'recent',
        name: 'Recent',
        description: 'Latest releases',
        icon: 'clock'
      }
    ];

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error getting music categories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error getting music categories', 
      error: error.message 
    });
  }
};