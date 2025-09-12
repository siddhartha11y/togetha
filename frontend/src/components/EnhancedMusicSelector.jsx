import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, X, Play, Pause, Volume2, VolumeX, 
  SkipBack, SkipForward, Heart, Download,
  Music, Mic, Globe, TrendingUp, Clock
} from "lucide-react";

export default function EnhancedMusicSelector({ onSelectMusic, onClose, selectedMusic }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCategory, setCurrentCategory] = useState("trending");
  const [musicList, setMusicList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedStartTime, setSelectedStartTime] = useState(0);
  const [lyrics, setLyrics] = useState("");
  const [showLyrics, setShowLyrics] = useState(false);
  
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  // Enhanced music database with real-like data
  const musicDatabase = {
    trending: [
      {
        id: 1,
        title: "Blinding Lights",
        artist: "The Weeknd",
        album: "After Hours",
        duration: 200,
        genre: "Pop",
        language: "English",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
        waveform: "https://via.placeholder.com/400x60/6366f1/ffffff?text=Waveform",
        lyrics: "Yeah, I've been tryin' to call\nI've been on my own for long enough\nMaybe you can show me how to love, maybe\nI feel like I'm just missin' somethin' when you're gone",
        popularity: 95,
        releaseYear: 2019
      },
      {
        id: 2,
        title: "Levitating",
        artist: "Dua Lipa",
        album: "Future Nostalgia",
        duration: 203,
        genre: "Pop",
        language: "English",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop",
        waveform: "https://via.placeholder.com/400x60/ec4899/ffffff?text=Waveform",
        lyrics: "If you wanna run away with me\nI know a galaxy and I can take you for a ride\nI had a premonition that we fell into a rhythm",
        popularity: 92,
        releaseYear: 2020
      },
      {
        id: 3,
        title: "Good 4 U",
        artist: "Olivia Rodrigo",
        album: "SOUR",
        duration: 178,
        genre: "Pop Rock",
        language: "English",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
        waveform: "https://via.placeholder.com/400x60/f59e0b/ffffff?text=Waveform",
        lyrics: "Well, good for you, I guess you moved on really easily\nYou found a new girl and it only took a couple weeks",
        popularity: 89,
        releaseYear: 2021
      }
    ],
    hindi: [
      {
        id: 4,
        title: "Kesariya",
        artist: "Arijit Singh",
        album: "Brahmastra",
        duration: 245,
        genre: "Bollywood",
        language: "Hindi",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
        waveform: "https://via.placeholder.com/400x60/f97316/ffffff?text=Waveform",
        lyrics: "केसरिया तेरा इश्क़ है पिया\nरंग जाऊं जो मैं हारा तो\nकेसरिया तेरा इश्क़ है पिया",
        popularity: 94,
        releaseYear: 2022
      },
      {
        id: 5,
        title: "Apna Bana Le",
        artist: "Arijit Singh",
        album: "Bhediya",
        duration: 267,
        genre: "Bollywood",
        language: "Hindi",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop",
        waveform: "https://via.placeholder.com/400x60/10b981/ffffff?text=Waveform",
        lyrics: "अपना बना ले, पिया अपना बना ले\nमैं तो तेरे रंग में रंग जाऊं\nअपना बना ले",
        popularity: 91,
        releaseYear: 2022
      }
    ],
    english: [
      {
        id: 6,
        title: "As It Was",
        artist: "Harry Styles",
        album: "Harry's House",
        duration: 167,
        genre: "Pop",
        language: "English",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
        waveform: "https://via.placeholder.com/400x60/8b5cf6/ffffff?text=Waveform",
        lyrics: "Holdin' me back\nGravity's holdin' me back\nI want you to hold out the palm of your hand",
        popularity: 96,
        releaseYear: 2022
      },
      {
        id: 7,
        title: "Heat Waves",
        artist: "Glass Animals",
        album: "Dreamland",
        duration: 238,
        genre: "Indie Pop",
        language: "English",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop",
        waveform: "https://via.placeholder.com/400x60/ef4444/ffffff?text=Waveform",
        lyrics: "Road shimmer wigglin' the vision\nHeat heat waves been fakin' me out\nCan't make you happier now",
        popularity: 88,
        releaseYear: 2020
      }
    ],
    recent: [
      {
        id: 8,
        title: "Flowers",
        artist: "Miley Cyrus",
        album: "Endless Summer Vacation",
        duration: 200,
        genre: "Pop",
        language: "English",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
        waveform: "https://via.placeholder.com/400x60/06b6d4/ffffff?text=Waveform",
        lyrics: "I can buy myself flowers\nWrite my name in the sand\nTalk to myself for hours",
        popularity: 93,
        releaseYear: 2023
      }
    ]
  };

  const categories = [
    { id: "trending", name: "Trending", icon: TrendingUp },
    { id: "hindi", name: "Hindi", icon: Globe },
    { id: "english", name: "English", icon: Mic },
    { id: "recent", name: "Recent", icon: Clock }
  ];

  useEffect(() => {
    console.log('🎵 Loading music for category:', currentCategory);
    console.log('📊 Available sample music:', Object.keys(musicDatabase));
    console.log('📱 Sample trending music:', musicDatabase.trending);
    loadMusic(currentCategory);
  }, [currentCategory]);

  const loadMusic = async (category) => {
    setLoading(true);
    
    try {
      let endpoint = '';
      
      switch (category) {
        case 'trending':
          endpoint = '/api/music/trending?limit=30';
          break;
        case 'hindi':
          endpoint = '/api/music/language?language=hindi&limit=30';
          break;
        case 'english':
          endpoint = '/api/music/language?language=english&limit=30';
          break;
        case 'recent':
          endpoint = '/api/music/trending?limit=20';
          break;
        default:
          endpoint = '/api/music/trending?limit=30';
      }

      console.log('Fetching music from:', `http://localhost:3000${endpoint}`);
      
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.data && data.data.length > 0) {
          console.log('✅ Using API results:', data.data.length, 'songs');
          setMusicList(data.data);
        } else {
          console.log('⚠️ No API data, using sample music for category:', category);
          const sampleData = musicDatabase[category] || musicDatabase.trending;
          console.log('📱 Sample music loaded:', sampleData.length, 'songs');
          setMusicList(sampleData);
        }
      } else {
        console.log('API failed, using sample music');
        // Fallback to sample music if API fails
        setMusicList(musicDatabase[category] || musicDatabase.trending);
      }
    } catch (error) {
      console.error('Error loading music:', error);
      // Fallback to sample music
      setMusicList(musicDatabase[category] || musicDatabase.trending);
    } finally {
      setLoading(false);
    }
  };

  const searchMusic = async (query) => {
    if (!query.trim()) {
      loadMusic(currentCategory);
      return;
    }

    setLoading(true);
    
    try {
      console.log('Searching for:', query);
      
      const response = await fetch(`http://localhost:5000/api/music/search?query=${encodeURIComponent(query)}&limit=30`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Search response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Search API Response:', data);
        
        if (data.data && data.data.length > 0) {
          console.log('✅ Using API results:', data.data.length, 'songs');
          setMusicList(data.data);
        } else {
          console.log('⚠️ No API results, using local search');
          // Fallback to local search
          const allMusic = Object.values(musicDatabase).flat();
          const filtered = allMusic.filter(music => 
            music.title.toLowerCase().includes(query.toLowerCase()) ||
            music.artist.toLowerCase().includes(query.toLowerCase()) ||
            music.album.toLowerCase().includes(query.toLowerCase())
          );
          console.log('📱 Local search results:', filtered.length, 'songs');
          setMusicList(filtered);
        }
      } else {
        console.log('Search API failed, using local search');
        // Fallback to local search
        const allMusic = Object.values(musicDatabase).flat();
        const filtered = allMusic.filter(music => 
          music.title.toLowerCase().includes(query.toLowerCase()) ||
          music.artist.toLowerCase().includes(query.toLowerCase()) ||
          music.album.toLowerCase().includes(query.toLowerCase())
        );
        setMusicList(filtered);
      }
    } catch (error) {
      console.error('Error searching music:', error);
      // Fallback to local search
      const allMusic = Object.values(musicDatabase).flat();
      const filtered = allMusic.filter(music => 
        music.title.toLowerCase().includes(query.toLowerCase()) ||
        music.artist.toLowerCase().includes(query.toLowerCase()) ||
        music.album.toLowerCase().includes(query.toLowerCase())
      );
      setMusicList(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchMusic(searchQuery);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const playMusic = (music) => {
    if (currentPlaying?.id === music.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentPlaying(music);
      setLyrics(music.lyrics);
      if (audioRef.current) {
        audioRef.current.src = music.url;
        audioRef.current.load();
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleProgressClick = (e) => {
    if (audioRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      audioRef.current.currentTime = newTime;
      setSelectedStartTime(newTime);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const selectMusicForStory = (music) => {
    const musicData = {
      ...music,
      startTime: selectedStartTime,
      duration: 15 // Instagram stories use 15 seconds
    };
    onSelectMusic(musicData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100001] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex"
      >
        {/* Left Panel - Music List */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <Music size={24} className="text-purple-500" />
              <h2 className="text-white font-bold text-xl">Choose Music</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-gray-800">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search songs, artists, albums..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 p-6 border-b border-gray-800 overflow-x-auto">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setCurrentCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                    currentCategory === category.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <IconComponent size={16} />
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* Music List */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : musicList.length === 0 ? (
              <div className="text-center py-12">
                <Music size={48} className="text-gray-600 mx-auto mb-4" />
                <div className="text-gray-400 text-lg mb-2">No music found</div>
                <div className="text-gray-500">Try a different search term</div>
              </div>
            ) : (
              <div className="space-y-3">
                {musicList.map((music) => (
                  <motion.div
                    key={music.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      currentPlaying?.id === music.id
                        ? 'bg-purple-600/20 border-purple-500'
                        : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Album Cover */}
                      <div className="relative">
                        <img
                          src={music.cover}
                          alt={music.album}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <button
                          onClick={() => playMusic(music)}
                          className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        >
                          {currentPlaying?.id === music.id && isPlaying ? (
                            <Pause size={20} className="text-white" />
                          ) : (
                            <Play size={20} className="text-white ml-1" />
                          )}
                        </button>
                      </div>

                      {/* Music Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">{music.title}</h3>
                        <p className="text-gray-400 text-sm truncate">{music.artist}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-gray-500 text-xs">{music.album}</span>
                          <span className="text-gray-500 text-xs">{formatTime(music.duration)}</span>
                          <span className="text-gray-500 text-xs">{music.language}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => selectMusicForStory(music)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors text-sm font-medium"
                        >
                          Use
                        </button>
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                          <Heart size={16} className="text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Waveform Preview */}
                    {currentPlaying?.id === music.id && (
                      <div className="mt-4">
                        <img
                          src={music.waveform}
                          alt="Waveform"
                          className="w-full h-12 object-cover rounded opacity-70"
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Now Playing & Lyrics */}
        {currentPlaying && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            {/* Now Playing */}
            <div className="p-6 border-b border-gray-700">
              <div className="text-center">
                <img
                  src={currentPlaying.cover}
                  alt={currentPlaying.album}
                  className="w-32 h-32 rounded-xl mx-auto mb-4 shadow-lg"
                />
                <h3 className="text-white font-bold text-lg mb-1">{currentPlaying.title}</h3>
                <p className="text-gray-400 mb-4">{currentPlaying.artist}</p>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div
                    ref={progressRef}
                    onClick={handleProgressClick}
                    className="w-full h-2 bg-gray-700 rounded-full cursor-pointer relative"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    {/* Selection indicator */}
                    <div
                      className="absolute top-0 w-1 h-full bg-yellow-400 rounded-full"
                      style={{ left: `${(selectedStartTime / duration) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div className="text-center text-xs text-yellow-400">
                    Story will start from: {formatTime(selectedStartTime)}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
                    <SkipBack size={20} className="text-gray-400" />
                  </button>
                  <button
                    onClick={() => playMusic(currentPlaying)}
                    className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause size={20} className="text-white" />
                    ) : (
                      <Play size={20} className="text-white ml-1" />
                    )}
                  </button>
                  <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
                    <SkipForward size={20} className="text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Lyrics */}
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-semibold">Lyrics</h4>
                <button
                  onClick={() => setShowLyrics(!showLyrics)}
                  className="text-purple-400 text-sm hover:text-purple-300 transition-colors"
                >
                  {showLyrics ? 'Hide' : 'Show'}
                </button>
              </div>
              
              <AnimatePresence>
                {showLyrics && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-gray-300 text-sm leading-relaxed whitespace-pre-line"
                  >
                    {lyrics || "Lyrics not available for this song."}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          volume={volume}
        />
      </motion.div>
    </motion.div>
  );
}
