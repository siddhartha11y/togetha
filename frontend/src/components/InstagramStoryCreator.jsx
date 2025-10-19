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
  
  // Zoom states
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageRotation, setImageRotation] = useState(0);
  
  // Emoji picker for text
  const [showTextEmojiPicker, setShowTextEmojiPicker] = useState(false);
  
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

  // Comprehensive sticker collection
  const sampleStickers = [
    // Emotions & Faces
    { id: 1, emoji: "❤️", category: "emotions" },
    { id: 2, emoji: "😍", category: "emotions" },
    { id: 3, emoji: "🥰", category: "emotions" },
    { id: 4, emoji: "😘", category: "emotions" },
    { id: 5, emoji: "😊", category: "emotions" },
    { id: 6, emoji: "😂", category: "emotions" },
    { id: 7, emoji: "🤣", category: "emotions" },
    { id: 8, emoji: "😭", category: "emotions" },
    { id: 9, emoji: "🥺", category: "emotions" },
    { id: 10, emoji: "😎", category: "emotions" },
    { id: 11, emoji: "🤩", category: "emotions" },
    { id: 12, emoji: "🥳", category: "emotions" },
    { id: 13, emoji: "😴", category: "emotions" },
    { id: 14, emoji: "🤔", category: "emotions" },
    { id: 15, emoji: "😏", category: "emotions" },
    
    // Hearts & Love
    { id: 16, emoji: "💕", category: "hearts" },
    { id: 17, emoji: "💖", category: "hearts" },
    { id: 18, emoji: "💗", category: "hearts" },
    { id: 19, emoji: "💓", category: "hearts" },
    { id: 20, emoji: "💝", category: "hearts" },
    { id: 21, emoji: "💘", category: "hearts" },
    { id: 22, emoji: "💞", category: "hearts" },
    { id: 23, emoji: "💟", category: "hearts" },
    { id: 24, emoji: "🖤", category: "hearts" },
    { id: 25, emoji: "🤍", category: "hearts" },
    { id: 26, emoji: "🤎", category: "hearts" },
    { id: 27, emoji: "💜", category: "hearts" },
    { id: 28, emoji: "💙", category: "hearts" },
    { id: 29, emoji: "💚", category: "hearts" },
    { id: 30, emoji: "💛", category: "hearts" },
    
    // Effects & Sparkles
    { id: 31, emoji: "✨", category: "effects" },
    { id: 32, emoji: "🌟", category: "effects" },
    { id: 33, emoji: "💫", category: "effects" },
    { id: 34, emoji: "⭐", category: "effects" },
    { id: 35, emoji: "🔥", category: "effects" },
    { id: 36, emoji: "💥", category: "effects" },
    { id: 37, emoji: "⚡", category: "effects" },
    { id: 38, emoji: "🌈", category: "effects" },
    { id: 39, emoji: "☀️", category: "effects" },
    { id: 40, emoji: "🌙", category: "effects" },
    { id: 41, emoji: "⭐", category: "effects" },
    { id: 42, emoji: "🎆", category: "effects" },
    { id: 43, emoji: "🎇", category: "effects" },
    
    // Music & Entertainment
    { id: 44, emoji: "🎵", category: "music" },
    { id: 45, emoji: "🎶", category: "music" },
    { id: 46, emoji: "🎤", category: "music" },
    { id: 47, emoji: "🎧", category: "music" },
    { id: 48, emoji: "🎸", category: "music" },
    { id: 49, emoji: "🥳", category: "music" },
    { id: 50, emoji: "🎉", category: "music" },
    { id: 51, emoji: "🎊", category: "music" },
    { id: 52, emoji: "🎈", category: "music" },
    
    // Food & Drinks
    { id: 53, emoji: "🍕", category: "food" },
    { id: 54, emoji: "🍔", category: "food" },
    { id: 55, emoji: "🍟", category: "food" },
    { id: 56, emoji: "🌮", category: "food" },
    { id: 57, emoji: "🍦", category: "food" },
    { id: 58, emoji: "🍰", category: "food" },
    { id: 59, emoji: "🧁", category: "food" },
    { id: 60, emoji: "🍪", category: "food" },
    { id: 61, emoji: "☕", category: "food" },
    { id: 62, emoji: "🥤", category: "food" },
    { id: 63, emoji: "🍺", category: "food" },
    { id: 64, emoji: "🍷", category: "food" },
    
    // Animals
    { id: 65, emoji: "🐶", category: "animals" },
    { id: 66, emoji: "🐱", category: "animals" },
    { id: 67, emoji: "🦄", category: "animals" },
    { id: 68, emoji: "🐼", category: "animals" },
    { id: 69, emoji: "🐨", category: "animals" },
    { id: 70, emoji: "🦊", category: "animals" },
    { id: 71, emoji: "🐸", category: "animals" },
    { id: 72, emoji: "🦋", category: "animals" },
    { id: 73, emoji: "🐝", category: "animals" },
    
    // Activities & Sports
    { id: 74, emoji: "⚽", category: "sports" },
    { id: 75, emoji: "🏀", category: "sports" },
    { id: 76, emoji: "🎾", category: "sports" },
    { id: 77, emoji: "🏈", category: "sports" },
    { id: 78, emoji: "🎯", category: "sports" },
    { id: 79, emoji: "🎮", category: "sports" },
    { id: 80, emoji: "🎲", category: "sports" },
    
    // Travel & Places
    { id: 81, emoji: "📍", category: "location" },
    { id: 82, emoji: "🏠", category: "location" },
    { id: 83, emoji: "🌍", category: "location" },
    { id: 84, emoji: "✈️", category: "location" },
    { id: 85, emoji: "🚗", category: "location" },
    { id: 86, emoji: "🏖️", category: "location" },
    { id: 87, emoji: "🏔️", category: "location" },
    { id: 88, emoji: "🌴", category: "location" },
    { id: 89, emoji: "🗽", category: "location" },
    { id: 90, emoji: "🎡", category: "location" }
  ];

  // Text emojis - comprehensive collection for text input
  const textEmojis = [
    // Faces & Emotions
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "☺️", "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "🥸", "😎", "🤓", "🧐",
    
    // Hearts & Love
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟",
    
    // Hand Gestures
    "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "👊", "✊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏",
    
    // Objects & Symbols
    "💯", "💢", "💥", "💫", "💦", "💨", "🕳️", "💣", "💬", "👁️‍🗨️", "🗨️", "🗯️", "💭", "💤", "👋", "✨", "🌟", "💫", "⭐", "🌈", "☀️", "🌙", "⚡", "🔥", "💥",
    
    // Food & Drinks
    "🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔", "🍠", "🥐", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔", "🍟", "🍕", "🥪", "🥙", "🧆", "🌮", "🌯", "🫔", "🥗", "🥘", "🫕", "🥫", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟", "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡", "🍧", "🍨", "🍦", "🥧", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪", "🌰", "🥜", "🍯", "🥛", "🍼", "☕", "🫖", "🍵", "🧃", "🥤", "🧋", "🍶", "🍺", "🍻", "🥂", "🍷", "🥃", "🍸", "🍹", "🧉", "🍾",
    
    // Animals & Nature
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🪱", "🐛", "🦋", "🐌", "🐞", "🐜", "🪰", "🪲", "🪳", "🦟", "🦗", "🕷️", "🕸️", "🦂", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙", "🐐", "🦌", "🐕", "🐩", "🦮", "🐕‍🦺", "🐈", "🐈‍⬛", "🪶", "🐓", "🦃", "🦚", "🦜", "🦢", "🦩", "🕊️", "🐇", "🦝", "🦨", "🦡", "🦦", "🦥", "🐁", "🐀", "🐿️", "🦔",
    
    // Activities & Sports
    "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛷", "⛸️", "🥌", "🎿", "⛷️", "🏂", "🪂", "🏋️‍♀️", "🏋️", "🏋️‍♂️", "🤼‍♀️", "🤼", "🤼‍♂️", "🤸‍♀️", "🤸", "🤸‍♂️", "⛹️‍♀️", "⛹️", "⛹️‍♂️", "🤺", "🤾‍♀️", "🤾", "🤾‍♂️", "🏌️‍♀️", "🏌️", "🏌️‍♂️", "🏇", "🧘‍♀️", "🧘", "🧘‍♂️", "🏄‍♀️", "🏄", "🏄‍♂️", "🏊‍♀️", "🏊", "🏊‍♂️", "🤽‍♀️", "🤽", "🤽‍♂️", "🚣‍♀️", "🚣", "🚣‍♂️", "🧗‍♀️", "🧗", "🧗‍♂️", "🚵‍♀️", "🚵", "🚵‍♂️", "🚴‍♀️", "🚴", "🚴‍♂️", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "🏵️", "🎗️"
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

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setImageRotation(0);
  };

  const rotateImage = () => {
    setImageRotation(prev => prev + 90);
  };

  const rotateElement = (elementType, id, direction = 1) => {
    const rotationAmount = 15 * direction; // 15 degrees per click
    
    if (elementType === 'text') {
      updateTextElement(id, { 
        rotation: (textElements.find(t => t.id === id)?.rotation || 0) + rotationAmount 
      });
    } else if (elementType === 'sticker') {
      setStickers(prev => prev.map(s => 
        s.id === id ? { 
          ...s, 
          rotation: (s.rotation || 0) + rotationAmount 
        } : s
      ));
    }
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

      await api.post("/stories", formData, {
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
            className="relative w-full max-w-md aspect-[9/14] rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: backgroundGradient || backgroundColor,
              width: '400px',
              height: '620px'
            }}
          >
            {/* Background Media */}
            {previewUrl && (
              <>
                <img
                  src={previewUrl}
                  alt="Story background"
                  className="w-full h-full object-cover transition-transform duration-200 cursor-grab active:cursor-grabbing"
                  style={{
                    transform: `scale(${zoomLevel}) translate(${imagePosition.x}px, ${imagePosition.y}px) rotate(${imageRotation}deg)`
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const startX = e.clientX - imagePosition.x;
                    const startY = e.clientY - imagePosition.y;
                    
                    const handleMouseMove = (e) => {
                      const newX = e.clientX - startX;
                      const newY = e.clientY - startY;
                      setImagePosition({ x: newX, y: newY });
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                  onWheel={(e) => {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -0.1 : 0.1;
                    const newZoom = Math.max(0.5, Math.min(zoomLevel + delta, 3));
                    setZoomLevel(newZoom);
                  }}
                />
                
                {/* Zoom Controls - Only show when not in sticker panel */}
                {!showStickerPanel && (
                  <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                    <button
                      onClick={handleZoomIn}
                      className="w-8 h-8 bg-black bg-opacity-70 text-white rounded-full flex items-center justify-center hover:bg-opacity-90 transition-all"
                    >
                      <ZoomIn size={16} />
                    </button>
                    <button
                      onClick={handleZoomOut}
                      className="w-8 h-8 bg-black bg-opacity-70 text-white rounded-full flex items-center justify-center hover:bg-opacity-90 transition-all"
                    >
                      <ZoomOut size={16} />
                    </button>
                    <button
                      onClick={rotateImage}
                      className="w-8 h-8 bg-black bg-opacity-70 text-white rounded-full flex items-center justify-center hover:bg-opacity-90 transition-all"
                    >
                      ↻
                    </button>
                    <button
                      onClick={resetZoom}
                      className="w-8 h-8 bg-black bg-opacity-70 text-white rounded-full flex items-center justify-center hover:bg-opacity-90 transition-all"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                )}
              </>
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
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX - text.x;
                  const startY = e.clientY - text.y;
                  
                  const handleMouseMove = (e) => {
                    const newX = Math.max(0, Math.min(e.clientX - startX, 300));
                    const newY = Math.max(0, Math.min(e.clientY - startY, 500));
                    updateTextElement(text.id, { x: newX, y: newY });
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                {text.text}
                {activeTextId === text.id && (
                  <>
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTextElement(text.id);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                    >
                      ×
                    </button>
                    
                    {/* Resize handle */}
                    <div
                      className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-500 rounded-full cursor-nw-resize flex items-center justify-center text-white text-xs"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const startSize = text.size;
                        const startX = e.clientX;
                        
                        const handleMouseMove = (e) => {
                          const deltaX = e.clientX - startX;
                          const newSize = Math.max(12, Math.min(startSize + deltaX / 2, 72));
                          updateTextElement(text.id, { size: newSize });
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      ⤡
                    </div>
                    
                    {/* Rotation handle */}
                    <div
                      className="absolute -top-2 -left-2 w-6 h-6 bg-green-500 rounded-full cursor-pointer flex items-center justify-center text-white text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        rotateElement('text', text.id);
                      }}
                    >
                      ↻
                    </div>
                  </>
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
                onClick={() => setActiveTextId(sticker.id)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX - sticker.x;
                  const startY = e.clientY - sticker.y;
                  
                  const handleMouseMove = (e) => {
                    const newX = Math.max(0, Math.min(e.clientX - startX, 300));
                    const newY = Math.max(0, Math.min(e.clientY - startY, 500));
                    setStickers(prev => prev.map(s => 
                      s.id === sticker.id ? { ...s, x: newX, y: newY } : s
                    ));
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                {sticker.emoji}
                {activeTextId === sticker.id && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setStickers(prev => prev.filter(s => s.id !== sticker.id));
                        setActiveTextId(null);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                    >
                      ×
                    </button>
                    <div
                      className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-500 rounded-full cursor-nw-resize flex items-center justify-center text-white text-xs"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const startSize = sticker.size;
                        const startX = e.clientX;
                        
                        const handleMouseMove = (e) => {
                          const deltaX = e.clientX - startX;
                          const newSize = Math.max(20, Math.min(startSize + deltaX / 2, 100));
                          setStickers(prev => prev.map(s => 
                            s.id === sticker.id ? { ...s, size: newSize } : s
                          ));
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      ⤡
                    </div>
                    
                    {/* Rotation handle */}
                    <div
                      className="absolute -top-2 -left-2 w-6 h-6 bg-green-500 rounded-full cursor-pointer flex items-center justify-center text-white text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        rotateElement('sticker', sticker.id);
                      }}
                    >
                      ↻
                    </div>
                  </>
                )}
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
                <div className="relative">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type your text..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onKeyPress={(e) => e.key === 'Enter' && addTextElement()}
                  />
                  <button
                    onClick={() => setShowTextEmojiPicker(!showTextEmojiPicker)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-400 hover:text-yellow-300 text-xl"
                  >
                    😀
                  </button>
                </div>
                
                {/* Text Emoji Picker */}
                {showTextEmojiPicker && (
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 max-h-40 overflow-y-auto">
                    <div className="grid grid-cols-8 gap-1">
                      {textEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setTextInput(prev => prev + emoji);
                            setShowTextEmojiPicker(false);
                          }}
                          className="p-1 hover:bg-gray-700 rounded text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
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