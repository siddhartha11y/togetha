import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCommentTime, formatInstagramTime } from "../utils/timeUtils";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Eye,
  MoreVertical,
  Music,
  VolumeX,
  Volume2,
} from "lucide-react";
import api from "../api/axios";

export default function StoryViewer({
  stories,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  user,
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showViews, setShowViews] = useState(false);
  const [storyViews, setStoryViews] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.7);
  const progressRef = useRef(null);
  const timeoutRef = useRef(null);
  const musicAudioRef = useRef(null);

  const currentStory = stories[currentIndex];
  const STORY_DURATION = currentStory?.duration || 5000; // Use story's duration or default 5 seconds

  // Auto-progress story
  useEffect(() => {
    if (!isPlaying) return;

    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100);

      setProgress(newProgress);

      if (newProgress >= 100) {
        setTimeout(() => onNext(), 100); // Small delay before next story
      } else {
        progressRef.current = requestAnimationFrame(updateProgress);
      }
    };

    // Start the animation
    progressRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (progressRef.current) {
        cancelAnimationFrame(progressRef.current);
      }
    };
  }, [currentIndex, isPlaying, onNext]);

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
    setIsPlaying(true);
  }, [currentIndex]);

  // Handle music playback
  useEffect(() => {
    if (currentStory?.music && currentStory.music.audioUrl) {
      // In a real app, you'd use the actual audio URL
      // For demo purposes, we'll simulate music playback
      console.log("🎵 Playing music:", currentStory.music.title);

      // Create audio element
      const audio = new Audio();
      audio.src = currentStory.music.audioUrl;
      audio.volume = musicMuted ? 0 : musicVolume;
      audio.currentTime = currentStory.music.startTime || 0;

      musicAudioRef.current = audio;

      if (isPlaying) {
        audio.play().catch(error => {
          console.log("Audio play failed (this is normal for demo):", error.message);
        });
      }

      return () => {
        if (musicAudioRef.current) {
          musicAudioRef.current.pause();
          musicAudioRef.current = null;
        }
      };
    }
  }, [currentStory, isPlaying, musicMuted, musicVolume]);

  // Mark story as viewed
  useEffect(() => {
    if (currentStory) {
      api.get(`/stories/${currentStory._id}`).catch(console.error);
    }
  }, [currentStory]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStoryClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    if (clickX < width / 2) {
      onPrevious();
    } else {
      onNext();
    }
  };

  const fetchStoryViews = async () => {
    try {
      const { data } = await api.get(`/stories/${currentStory._id}/views`);
      setStoryViews(data.views);
      setShowViews(true);
    } catch (error) {
      console.error("Error fetching story views:", error);
    }
  };



  const deleteStory = async () => {
    try {
      await api.delete(`/stories/${currentStory._id}`);
      setShowMenu(false);
      onClose(); // Close the story viewer after deletion
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  const isMyStory = currentStory.author?._id === user?._id;

  if (!currentStory) return null;

  console.log("📱 Current story data:", currentStory);
  console.log("📱 Author data:", currentStory.author);
  console.log("📱 Profile picture:", currentStory.author?.profilePicture);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
    >
      {/* Progress Bars */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 flex space-x-1 z-10">
        {stories.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-white"
              style={{
                width:
                  index < currentIndex
                    ? "100%"
                    : index === currentIndex
                    ? `${progress}%`
                    : "0%",
                transition: index === currentIndex ? "none" : "width 0.3s ease",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <img
            src={
              currentStory.author?.profilePicture
                ? `${import.meta.env.MODE === "development" ? "http://localhost:5000" : "https://togetha.onrender.com"}${currentStory.author.profilePicture}`
                : user?.profilePicture
                ? `${import.meta.env.MODE === "development" ? "http://localhost:5000" : "https://togetha.onrender.com"}${user.profilePicture}`
                : "/default-avatar.png"
            }
            alt={currentStory.author?.username || user?.username}
            className="w-10 h-10 rounded-full object-cover border-2 border-white"
          />
          <div>
            <p className="text-white font-semibold">
              {currentStory.author?.username}
            </p>
            <p className="text-gray-300 text-sm">
              {formatInstagramTime(currentStory.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlayPause}
            className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          {/* Music Controls */}
          {currentStory.music && currentStory.music.title && (
            <button
              onClick={() => setMusicMuted(!musicMuted)}
              className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors"
            >
              {musicMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          )}

          {/* Views button (only for story author) */}
          {isMyStory && (
            <button
              onClick={fetchStoryViews}
              className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors"
            >
              <Eye size={20} />
            </button>
          )}

          {/* Three-dot menu (only for your own stories) */}
          {isMyStory && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors"
              >
                <MoreVertical size={20} />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 top-12 bg-gray-800 rounded-lg shadow-lg py-2 min-w-[120px] z-20">
                  <button
                    onClick={deleteStory}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 transition-colors"
                  >
                    Delete Story
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Story Content */}
      <div
        className="relative w-full max-w-md h-full max-h-[80vh] cursor-pointer"
        onClick={handleStoryClick}
      >
        {currentStory.gif ? (
          <img
            src={currentStory.gif.url}
            alt={currentStory.gif.title || "GIF"}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : currentStory.media ? (
          currentStory.mediaType === "video" ? (
            <video
              src={`${import.meta.env.VITE_API_BASE_URL}${currentStory.media}`}
              className="w-full h-full object-cover rounded-lg"
              autoPlay
              muted
              loop
            />
          ) : (
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}${currentStory.media}`}
              alt="Story"
              className="w-full h-full object-cover rounded-lg"
            />
          )
        ) : (
          <div
            className="w-full h-full rounded-lg flex items-center justify-center p-8"
            style={{ backgroundColor: currentStory.backgroundColor }}
          >
            <p
              className="text-center text-xl font-medium break-words"
              style={{ color: currentStory.textColor }}
            >
              {currentStory.content}
            </p>
          </div>
        )}

        {/* Text Elements Overlay */}
        {currentStory.textElements && currentStory.textElements.map((textElement) => (
          <div
            key={textElement.id}
            className="absolute pointer-events-none"
            style={{
              left: `${textElement.x}px`,
              top: `${textElement.y}px`,
              color: textElement.color,
              fontSize: `${textElement.size}px`,
              transform: `rotate(${textElement.rotation || 0}deg)`,
              fontFamily: textElement.font === 'modern' ? 'system-ui' : 
                         textElement.font === 'classic' ? 'serif' : 
                         textElement.font === 'bold' ? 'Arial Black' : 'system-ui',
              fontWeight: textElement.font === 'bold' ? 'bold' : 'normal',
              textShadow: textElement.background === 'shadow' ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none',
              backgroundColor: textElement.background === 'solid' ? 'rgba(0,0,0,0.5)' : 'transparent',
              padding: textElement.background === 'solid' ? '4px 8px' : '0',
              borderRadius: textElement.background === 'solid' ? '4px' : '0'
            }}
          >
            {textElement.text}
          </div>
        ))}

        {/* Stickers Overlay */}
        {currentStory.stickers && currentStory.stickers.map((sticker) => (
          <div
            key={sticker.id}
            className="absolute pointer-events-none"
            style={{
              left: `${sticker.x}px`,
              top: `${sticker.y}px`,
              fontSize: `${sticker.size}px`,
              transform: `rotate(${sticker.rotation || 0}deg)`
            }}
          >
            {sticker.emoji}
          </div>
        ))}

        {/* Navigation Areas */}
        <div className="absolute inset-0 flex">
          <div
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
          />
          <div
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
          />
        </div>

        {/* Text overlay for media/GIF stories */}
        {(currentStory.media || currentStory.gif) && currentStory.content && (
          <div className="absolute bottom-16 left-4 right-4">
            <p className="text-white text-lg font-medium bg-black bg-opacity-50 p-3 rounded-lg">
              {currentStory.content}
            </p>
          </div>
        )}

        {/* Music Info */}
        {currentStory.music && currentStory.music.title && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 right-4"
          >
            <div className="bg-black bg-opacity-60 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3">
              <motion.div
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{
                  duration: 3,
                  repeat: isPlaying ? Infinity : 0,
                  ease: "linear",
                }}
                className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <Music size={16} className="text-white" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {currentStory.music.title}
                </p>
                <p className="text-gray-300 text-xs truncate">
                  {currentStory.music.artist}
                </p>
              </div>
              <motion.div
                animate={{ scale: isPlaying ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.6, repeat: isPlaying ? Infinity : 0 }}
                className="flex space-x-1"
              >
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-4 bg-white rounded-full ${
                      isPlaying ? "animate-pulse" : ""
                    }`}
                    style={{
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation Buttons */}
      {currentIndex > 0 && (
        <button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {currentIndex < stories.length - 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Story Views Modal */}
      <AnimatePresence>
        {showViews && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl p-4 max-h-96 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">
                Views ({storyViews.length})
              </h3>
              <button
                onClick={() => setShowViews(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {storyViews.map((view) => (
                <div key={view._id} className="flex items-center space-x-3">
                  <img
                    src={
                      view.user.profilePicture
                        ? `${import.meta.env.MODE === "development" ? "http://localhost:5000" : "https://togetha.onrender.com"}${view.user.profilePicture}`
                        : "/default-avatar.png"
                    }
                    alt={view.user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {view.user.username}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {formatCommentTime(view.viewedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
