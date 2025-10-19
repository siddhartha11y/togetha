import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Play, 
  Pause, 
  X, 
  Music, 
  Volume2, 
  Check,
  Headphones,
  TrendingUp
} from "lucide-react";
import api from "../api/axios";

export default function MusicSelector({ onSelectMusic, onClose, selectedMusic }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Popular");
  const [selectedMood, setSelectedMood] = useState("All");
  const [tracks, setTracks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [previewAudio, setPreviewAudio] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(selectedMusic);
  const [showTrending, setShowTrending] = useState(true);
  const audioRef = useRef(null);

  // Fetch music library
  useEffect(() => {
    fetchMusicLibrary();
  }, [selectedCategory, selectedMood, searchQuery]);

  const fetchMusicLibrary = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (selectedMood !== "All") params.append("mood", selectedMood);
      if (searchQuery) params.append("search", searchQuery);
      
      const { data } = await api.get(`/music/library?${params}`);
      setTracks(data.tracks);
      setCategories(data.categories);
      setMoods([{ name: "All", icon: "🎵" }, ...data.moods]);
    } catch (error) {
      console.error("Error fetching music:", error);
    } finally {
      setLoading(false);
    }
  };

  const playPreview = (track) => {
    if (currentlyPlaying === track.id) {
      // Pause current track
      if (audioRef.current) {
        audioRef.current.pause();
        setCurrentlyPlaying(null);
      }
    } else {
      // Play new track
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // In a real app, you'd use the actual audio URL
      // For demo purposes, we'll simulate audio playback
      const audio = new Audio();
      // audio.src = track.audioUrl; // This would be the real audio file
      audio.volume = 0.3; // Keep it low for preview
      
      audioRef.current = audio;
      setCurrentlyPlaying(track.id);
      
      // Simulate audio playback for demo
      setTimeout(() => {
        setCurrentlyPlaying(null);
      }, 3000); // Stop after 3 seconds for demo
    }
  };

  const selectTrack = (track) => {
    setSelectedTrack(track);
  };

  const confirmSelection = () => {
    onSelectMusic(selectedTrack);
    onClose();
  };

  const removeMusic = () => {
    setSelectedTrack(null);
    onSelectMusic(null);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Headphones className="text-purple-400" size={24} />
            <h2 className="text-xl font-bold text-white">Add Music</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search songs, artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category.name
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <span>{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mood Filter */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {moods.map((mood) => (
              <button
                key={mood.name}
                onClick={() => setSelectedMood(mood.name)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full whitespace-nowrap text-sm transition-colors ${
                  selectedMood === mood.name
                    ? "bg-pink-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <span>{mood.icon}</span>
                <span>{mood.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Music List */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Music size={48} className="mb-4" />
              <p>No tracks found</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {tracks.map((track) => (
                <motion.div
                  key={track.id}
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedTrack?.id === track.id
                      ? "bg-purple-600/20 border border-purple-500"
                      : "bg-gray-800/50 hover:bg-gray-800"
                  }`}
                  onClick={() => selectTrack(track)}
                >
                  {/* Album Cover */}
                  <div className="relative w-12 h-12 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Music size={20} className="text-white" />
                    </div>
                    
                    {/* Play/Pause Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playPreview(track);
                      }}
                      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    >
                      {currentlyPlaying === track.id ? (
                        <Pause size={16} className="text-white" />
                      ) : (
                        <Play size={16} className="text-white" />
                      )}
                    </button>
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{track.title}</h3>
                    <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300">
                        {track.mood}
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedTrack?.id === track.id && (
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-800 flex gap-3">
          {selectedMusic && (
            <button
              onClick={removeMusic}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Remove Music
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmSelection}
            disabled={!selectedTrack}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Volume2 size={16} />
            Add Music
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

