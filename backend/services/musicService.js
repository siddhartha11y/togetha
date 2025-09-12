import axios from 'axios';

class MusicService {
  constructor() {
    // API Keys (you'll need to get these from respective platforms)
    this.spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
    this.spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.youtubeApiKey = process.env.YOUTUBE_API_KEY;
    this.deezerApiKey = process.env.DEEZER_API_KEY;
    
    this.spotifyToken = null;
    this.tokenExpiry = null;
  }

  // Get Spotify access token
  async getSpotifyToken() {
    if (this.spotifyToken && this.tokenExpiry > Date.now()) {
      return this.spotifyToken;
    }

    if (!this.spotifyClientId || !this.spotifyClientSecret) {
      console.log('⚠️ Spotify credentials not found, skipping Spotify API');
      return null;
    }

    try {
      console.log('🔑 Getting Spotify token...');
      const response = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.spotifyClientId}:${this.spotifyClientSecret}`).toString('base64')}`
          }
        }
      );

      this.spotifyToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      console.log('✅ Spotify token obtained successfully');
      return this.spotifyToken;
    } catch (error) {
      console.error('❌ Error getting Spotify token:', error.response?.data || error.message);
      return null;
    }
  }

  // Search Spotify for tracks
  async searchSpotify(query, limit = 20) {
    try {
      const token = await this.getSpotifyToken();
      if (!token) return [];

      const response = await axios.get(`https://api.spotify.com/v1/search`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          q: query,
          type: 'track',
          limit: limit,
          market: 'US'
        }
      });

      return response.data.tracks.items.map(track => ({
        id: `spotify_${track.id}`,
        title: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        duration: Math.floor(track.duration_ms / 1000),
        cover: track.album.images[0]?.url || '',
        preview_url: track.preview_url,
        external_url: track.external_urls.spotify,
        popularity: track.popularity,
        release_date: track.album.release_date,
        genre: track.album.genres?.[0] || 'Unknown',
        language: 'English', // Spotify doesn't provide language info
        source: 'spotify'
      }));
    } catch (error) {
      console.error('Error searching Spotify:', error);
      return [];
    }
  }

  // Search YouTube Music
  async searchYouTube(query, limit = 20) {
    try {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
        params: {
          key: this.youtubeApiKey,
          q: query + ' music',
          part: 'snippet',
          type: 'video',
          videoCategoryId: '10', // Music category
          maxResults: limit,
          order: 'relevance'
        }
      });

      return response.data.items.map(item => ({
        id: `youtube_${item.id.videoId}`,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        album: 'YouTube',
        duration: 0, // Would need additional API call to get duration
        cover: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        preview_url: null,
        external_url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        popularity: 0,
        release_date: item.snippet.publishedAt,
        genre: 'Unknown',
        language: 'Unknown',
        source: 'youtube'
      }));
    } catch (error) {
      console.error('Error searching YouTube:', error);
      return [];
    }
  }

  // Search Deezer
  async searchDeezer(query, limit = 20) {
    try {
      const response = await axios.get(`https://api.deezer.com/search`, {
        params: {
          q: query,
          limit: limit
        }
      });

      return response.data.data.map(track => ({
        id: `deezer_${track.id}`,
        title: track.title,
        artist: track.artist.name,
        album: track.album.title,
        duration: track.duration,
        cover: track.album.cover_medium || track.album.cover,
        preview_url: track.preview,
        external_url: track.link,
        popularity: track.rank || 0,
        release_date: track.album.release_date,
        genre: 'Unknown',
        language: 'Unknown',
        source: 'deezer'
      }));
    } catch (error) {
      console.error('Error searching Deezer:', error);
      return [];
    }
  }

  // Get trending music from multiple sources
  async getTrendingMusic(limit = 50) {
    try {
      const results = await Promise.allSettled([
        this.searchSpotify('top hits 2024', 30),
        this.searchYouTube('trending music 2024', 20)
      ]);

      const allTracks = results
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => result.value)
        .slice(0, limit);

      // Sort by popularity
      return allTracks.sort((a, b) => b.popularity - a.popularity);
    } catch (error) {
      console.error('Error getting trending music:', error);
      return [];
    }
  }

  // Search across all platforms
  async searchAllPlatforms(query, limit = 50) {
    try {
      const results = await Promise.allSettled([
        this.searchSpotify(query, 30),
        this.searchYouTube(query, 20)
      ]);

      const allTracks = results
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => result.value)
        .slice(0, limit);

      // Remove duplicates based on title and artist
      const uniqueTracks = allTracks.filter((track, index, self) => 
        index === self.findIndex(t => 
          t.title.toLowerCase() === track.title.toLowerCase() && 
          t.artist.toLowerCase() === track.artist.toLowerCase()
        )
      );

      return uniqueTracks.sort((a, b) => b.popularity - a.popularity);
    } catch (error) {
      console.error('Error searching all platforms:', error);
      return [];
    }
  }

  // Get music by language/region
  async getMusicByLanguage(language, limit = 30) {
    const queries = {
      hindi: 'bollywood hindi songs',
      english: 'top english songs',
      spanish: 'latin pop spanish',
      french: 'french pop',
      korean: 'kpop korean',
      japanese: 'jpop japanese'
    };

    const query = queries[language.toLowerCase()] || `${language} music`;
    return await this.searchAllPlatforms(query, limit);
  }

  // Get lyrics (using a lyrics API like Genius or Musixmatch)
  async getLyrics(title, artist) {
    try {
      // This would integrate with a lyrics API
      // For now, returning a placeholder
      return {
        lyrics: "Lyrics not available",
        source: "placeholder"
      };
    } catch (error) {
      console.error('Error getting lyrics:', error);
      return { lyrics: "Lyrics not available", source: "error" };
    }
  }

  // Convert YouTube video to audio stream (for preview)
  async getYouTubeAudioStream(videoId) {
    try {
      // This would use youtube-dl or similar to extract audio stream
      // For legal reasons, this is just a placeholder
      return null;
    } catch (error) {
      console.error('Error getting YouTube audio stream:', error);
      return null;
    }
  }
}

export default new MusicService();