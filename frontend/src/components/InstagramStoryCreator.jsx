import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Camera, Type, Music, Smile, Sticker, Palette, 
  Download, Send, RotateCcw, ZoomIn, ZoomOut, Move,
  Volume2, VolumeX, Play, Pause, SkipBack, SkipForward,
  Search, Heart, Star, Sun, Moon, Coffee, Pizza, Image
} from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";
import GifSelector from "./GifSelector";
import SimpleMusicSelector from "./SimpleMusicSelector";

export default function InstagramStoryCreator({ user, onClose, onStoryCreated }) {
  const [currentStep, setCurrentStep] = useState("capture"); // capture, edit, share
  const [storyType, setStoryType] = useState("camera"); // camera, text, media
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Text editing states
  const [textElements, setTextElements] = useState([]);
  const [activeTextId, setActiveTextId] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textSize, setTextSize] = useState(24);
  const [textFont, setTextFont] = useState("modern");
  const [textBackground, setTextBackground] = useState("none");
  
  // Music states
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [showMusicSelector, setShowMusicSelector] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicCurrentTime, setMusicCurrentTime] = useState(0);
  
  // Sticker states
  const [stickers, setStickers] = useState([]);
  const [showStickerPanel, setShowStickerPanel] = useState(false);
  
  // GIF states
  const [showGifSelector, setShowGifSelector] = useState(false);
  const [selectedGifs, setSelectedGifs] = useState([]);
  
  // Background states
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [backgroundGradient, setBackgroundGradient] = useState(null);
  
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Sample music data (in real app, this would come from an API)
  const sampleMusic = [
    {
      id: 1,
      title: "Blinding Lights",
      artist: "The Weeknd",
      duration: 200,
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop"
    },
    {
      id: 2,
      title: "Levitating",
      artist: "Dua Lipa",
      duration: 203,
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=100&h=100&fit=crop"
    },
    {
      id: 3,
      title: "Good 4 U",
      artist: "Olivia Rodrigo",
      duration: 178,
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop"
    }
  ];

  // Sample stickers
  const sampleStickers = [
    { id: 1, emoji: "❤️", category: "emotions" },
    { id: 2, emoji: "😍", category: "emotions" },
    { id: 3, emoji: "🔥", category: "emotions" },
    { id: 4, emoji: "✨", category: "effects" },
    { id: 5, emoji: "🌟", category: "effects" },
    { id: 6, emoji: "💫", category: "effects" },
    { id: 7, emoji: "🎵", category: "music" },
    { id: 8, emoji: "🎶", category: "music" },
    { id: 9, emoji: "🎤", category: "music" },
    { id: 10, emoji: "📍", category: "location" },
    { id: 11, emoji: "🏠", category: "location" },
    { id: 12, emoji: "🌍", category: "location" }
  ];

  const backgroundGradients = [
    { id: 1, gradient: "linear-gradient(45deg, #ff6b6b, #feca57)" },
    { id: 2, gradient: "linear-gradient(45deg, #48cae4, #023e8a)" },
    { id: 3, gradient: "linear-gradient(45deg, #f72585, #b5179e)" },
    { id: 4, gradient: "linear-gradient(45deg, #06ffa5, #0077b6)" },
    { id: 5, gradient: "linear-gradient(45deg, #ffbe0b, #fb8500)" },
    { id: 6, gradient: "linear-gradient(45deg, #8338ec, #3a86ff)" }
  ];

  const textFonts = [
    { id: "modern", name: "Modern", style: { fontFamily: "Arial, sans-serif", fontWeight: "bold" } },
    { id: "classic", name: "Classic", style: { fontFamily: "Times, serif", fontWeight: "normal" } },
    { id: "typewriter", name: "Typewriter", style: { fontFamily: "Courier, monospace", fontWeight: "normal" } },
    { id: "neon", name: "Neon", style: { fontFamily: "Arial, sans-serif", fontWeight: "bold", textShadow: "0 0 10px currentColor" } }
  ];

  const textBackgrounds = [
    { id: "none", name: "None", style: {} },
    { id: "solid", name: "Solid", style: { backgroundColor: "rgba(0,0,0,0.7)", padding: "8px 16px", borderRadius: "20px" } },
    { id: "outline", name: "Outline", style: { textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" } }
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setStoryType("media");
      setCurrentStep("edit");
    }
  };

  const addTextElement = () => {
    if (!textInput.trim()) return;
    
    const newText = {
      id: Date.now(),
      text: textInput,
      x: 50,
      y: 50,
      color: textColor,
      size: textSize,
      font: textFont,
      background: textBackground,
      rotation: 0
    };
    
    setTextElements([...textElements, newText]);
    setTextInput("");
    setActiveTextId(newText.id);
  };

  const updateTextElement = (id, updates) => {
    setTextElements(prev => prev.map(text => 
      text.id === id ? { ...text, ...updates } : text
    ));
  };

  const deleteTextElement = (id) => {
    setTextElements(prev => prev.filter(text => text.id !== id));
    setActiveTextId(null);
  };

  const addSticker = (sticker) => {
    const newSticker = {
      id: Date.now(),
      emoji: sticker.emoji,
      x: Math.random() * 200 + 100,
      y: Math.random() * 200 + 100,
      size: 40,
      rotation: 0
    };
    setStickers([...stickers, newSticker]);
    setShowStickerPanel(false);
  };

  const addGif = (gif) => {
    const newGif = {
      id: Date.now(),
      url: gif.url,
      x: Math.random() * 150 + 50,
      y: Math.random() * 200 + 100,
      width: 120,
      height: 120,
      rotation: 0
    };
    setSelectedGifs([...selectedGifs, newGif]);
    setShowGifSelector(false);
  };

  const handleMusicSelect = (music) => {
    setSelectedMusic(music);
    setShowMusicSelector(false);
    if (audioRef.current) {
      audioRef.current.src = music.url;
    }
  };

  const toggleMusicPlay = () => {
    if (audioRef.current) {
      if (musicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setMusicPlaying(!musicPlaying);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const formData = new FormData();
      
      if (selectedFile) {
        formData.append("media", selectedFile);
      }
      
      // Add story data
      const storyData = {
        type: storyType,
        textElements,
        stickers,
        selectedGifs,
        backgroundColor,
        backgroundGradient
      };
      
      // Add music data if selected
      if (selectedMusic) {
        formData.append("music", JSON.stringify({
          title: selectedMusic.title,
          artist: selectedMusic.artist,
          duration: selectedMusic.duration,
          startTime: selectedMusic.startTime || 0,
          audioUrl: selectedMusic.url,
          coverArt: selectedMusic.cover
        }));
      }
      
      formData.append("storyData", JSON.stringify(storyData));

      await api.post("/api/stories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Story shared successfully!");
      onStoryCreated();
    } catch (error) {
      console.error("Error creating story:", error);
      toast.error("Failed to share story");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-[99999] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={24} className="text-white" />
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">Your Story</span>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Sharing..." : "Share"}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Story Canvas */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div 
            className="relative w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: backgroundGradient || backgroundColor
            }}
          >
            {/* Background Media */}
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Story background"
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Text Elements */}
            {textElements.map((text) => (
              <div
                key={text.id}
                className="absolute cursor-move select-none"
                style={{
                  left: `${text.x}px`,
                  top: `${text.y}px`,
                  color: text.color,
                  fontSize: `${text.size}px`,
                  transform: `rotate(${text.rotation}deg)`,
                  ...textFonts.find(f => f.id === text.font)?.style,
                  ...textBackgrounds.find(b => b.id === text.background)?.style
                }}
                onClick={() => setActiveTextId(text.id)}
              >
                {text.text}
                {activeTextId === text.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTextElement(text.id);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            
            {/* Stickers */}
            {stickers.map((sticker) => (
              <div
                key={sticker.id}
                className="absolute cursor-move select-none"
                style={{
                  left: `${sticker.x}px`,
                  top: `${sticker.y}px`,
                  fontSize: `${sticker.size}px`,
                  transform: `rotate(${sticker.rotation}deg)`
                }}
              >
                {sticker.emoji}
              </div>
            ))}
            
            {/* GIFs */}
            {selectedGifs.map((gif) => (
              <div
                key={gif.id}
                className="absolute cursor-move select-none"
                style={{
                  left: `${gif.x}px`,
                  top: `${gif.y}px`,
                  width: `${gif.width}px`,
                  height: `${gif.height}px`,
                  transform: `rotate(${gif.rotation}deg)`
                }}
              >
                <img
                  src={gif.url}
                  alt="GIF"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
            
            {/* Music Indicator */}
            {selectedMusic && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-2">
                <img
                  src={selectedMusic.cover}
                  alt={selectedMusic.title}
                  className="w-6 h-6 rounded-full"
                />
                <div className="text-white text-xs">
                  <div className="font-medium">{selectedMusic.title}</div>
                  <div className="text-gray-300">{selectedMusic.artist}</div>
                </div>
                <button
                  onClick={toggleMusicPlay}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  {musicPlaying ? (
                    <Pause size={12} className="text-white" />
                  ) : (
                    <Play size={12} className="text-white" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tools Panel */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
          {/* Tool Tabs */}
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 p-4 text-center hover:bg-gray-800 transition-colors"
            >
              <Camera size={20} className="text-white mx-auto mb-1" />
              <span className="text-xs text-gray-300">Media</span>
            </button>
            <button
              onClick={() => setShowStickerPanel(!showStickerPanel)}
              className="flex-1 p-4 text-center hover:bg-gray-800 transition-colors"
            >
              <Smile size={20} className="text-white mx-auto mb-1" />
              <span className="text-xs text-gray-300">Stickers</span>
            </button>
            <button
              onClick={() => setShowGifSelector(true)}
              className="flex-1 p-4 text-center hover:bg-gray-800 transition-colors"
            >
              <Image size={20} className="text-white mx-auto mb-1" />
              <span className="text-xs text-gray-300">GIFs</span>
            </button>
            <button
              onClick={() => setShowMusicSelector(!showMusicSelector)}
              className="flex-1 p-4 text-center hover:bg-gray-800 transition-colors"
            >
              <Music size={20} className="text-white mx-auto mb-1" />
              <span className="text-xs text-gray-300">Music</span>
            </button>
          </div>

          {/* Tool Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Text Tool */}
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Type size={16} />
                Add Text
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your text..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && addTextElement()}
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={addTextElement}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Add Text
                  </button>
                  <select
                    value={textFont}
                    onChange={(e) => setTextFont(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                  >
                    {textFonts.map(font => (
                      <option key={font.id} value={font.id}>{font.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-8 h-8 rounded border border-gray-700"
                  />
                  <input
                    type="range"
                    min="12"
                    max="48"
                    value={textSize}
                    onChange={(e) => setTextSize(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-gray-400 text-sm">{textSize}px</span>
                </div>
              </div>
            </div>

            {/* Background Tool */}
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Palette size={16} />
                Background
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-6 gap-2">
                  {backgroundGradients.map(bg => (
                    <button
                      key={bg.id}
                      onClick={() => setBackgroundGradient(bg.gradient)}
                      className="w-8 h-8 rounded border-2 border-gray-600 hover:border-white transition-colors"
                      style={{ background: bg.gradient }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => {
                    setBackgroundColor(e.target.value);
                    setBackgroundGradient(null);
                  }}
                  className="w-full h-10 rounded border border-gray-700"
                />
              </div>
            </div>

            {/* Sticker Panel */}
            {showStickerPanel && (
              <div className="mb-6">
                <h3 className="text-white font-medium mb-3">Stickers</h3>
                <div className="grid grid-cols-6 gap-2">
                  {sampleStickers.map(sticker => (
                    <button
                      key={sticker.id}
                      onClick={() => addSticker(sticker)}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-2xl"
                    >
                      {sticker.emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}


          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Audio Element */}
      {selectedMusic && (
        <audio
          ref={audioRef}
          onTimeUpdate={(e) => setMusicCurrentTime(e.target.currentTime)}
          onEnded={() => setMusicPlaying(false)}
        />
      )}

      {/* Simple Music Selector */}
      <AnimatePresence>
        {showMusicSelector && (
          <SimpleMusicSelector
            onSelectMusic={handleMusicSelect}
            onClose={() => setShowMusicSelector(false)}
            selectedMusic={selectedMusic}
          />
        )}
      </AnimatePresence>

      {/* GIF Selector */}
      <AnimatePresence>
        {showGifSelector && (
          <GifSelector
            onSelectGif={addGif}
            onClose={() => setShowGifSelector(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
}