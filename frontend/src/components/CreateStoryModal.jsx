import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, Camera, Type, Palette, Upload, Send, Music } from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";
import MusicSelector from "./MusicSelector";

export default function CreateStoryModal({ user, onClose, onStoryCreated }) {
  const [storyType, setStoryType] = useState("text"); // "text" or "media"
  const [content, setContent] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [textColor, setTextColor] = useState("#ffffff");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [showMusicSelector, setShowMusicSelector] = useState(false);
  const fileInputRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const backgroundColors = [
    "#000000", "#1a1a1a", "#333333", "#4a4a4a",
    "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4",
    "#feca57", "#ff9ff3", "#54a0ff", "#5f27cd",
    "#00d2d3", "#ff9f43", "#ee5a24", "#0abde3"
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setStoryType("media");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && !selectedFile) {
      toast.error("Please add content or select a media file");
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      
      if (selectedFile) {
        formData.append("media", selectedFile);
      }
      
      formData.append("content", content);
      formData.append("backgroundColor", backgroundColor);
      formData.append("textColor", textColor);
      
      // Add music data if selected
      if (selectedMusic) {
        formData.append("music", JSON.stringify(selectedMusic));
      }

      await api.post("/stories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Story created successfully!");
      onStoryCreated();
    } catch (error) {
      console.error("Error creating story:", error);
      toast.error("Failed to create story");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setContent("");
    setSelectedFile(null);
    setPreviewUrl("");
    setStoryType("text");
    setBackgroundColor("#000000");
    setTextColor("#ffffff");
    setSelectedMusic(null);
  };

  if (!mounted) return null;

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        zIndex: 99999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ 
          scale: 0.6, 
          opacity: 0,
          y: 80,
          rotateX: -20
        }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          y: 0,
          rotateX: 0
        }}
        exit={{ 
          scale: 0.7, 
          opacity: 0,
          y: 40,
          rotateX: 15
        }}
        transition={{
          type: "spring",
          damping: 35,
          stiffness: 200,
          mass: 1.2,
          duration: 1.0
        }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900/95 backdrop-blur-md rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700/50"
        style={{ perspective: 1000 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Create Story</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Story Type Selector */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setStoryType("text")}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                storyType === "text"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              <Type size={18} />
              <span>Text</span>
            </button>
            <button
              onClick={() => {
                setStoryType("media");
                fileInputRef.current?.click();
              }}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                storyType === "media"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              <Camera size={18} />
              <span>Media</span>
            </button>
          </div>

          {/* Music Selection */}
          <div className="mb-4">
            <button
              onClick={() => setShowMusicSelector(true)}
              className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                selectedMusic
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 border-2 border-dashed border-gray-600"
              }`}
            >
              <Music size={18} />
              <span>{selectedMusic ? selectedMusic.title : "Add Music"}</span>
            </button>
            
            {selectedMusic && (
              <div className="mt-2 p-3 bg-gray-800/50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                    <Music size={12} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{selectedMusic.title}</p>
                    <p className="text-gray-400 text-xs">{selectedMusic.artist}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMusic(null)}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                >
                  <X size={14} className="text-gray-400" />
                </button>
              </div>
            )}
          </div>

          {/* Preview Area */}
          <div
            className="relative w-full h-64 rounded-lg mb-4 flex items-center justify-center overflow-hidden"
            style={{
              backgroundColor: storyType === "text" ? backgroundColor : "#000",
            }}
          >
            {storyType === "media" && previewUrl ? (
              <img
                src={previewUrl}
                alt="Story preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                {content ? (
                  <p
                    className="text-lg font-medium break-words"
                    style={{ color: textColor }}
                  >
                    {content}
                  </p>
                ) : (
                  <div className="text-gray-500">
                    <Type size={48} className="mx-auto mb-2" />
                    <p>Your story preview</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Text Input */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your story..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={3}
            maxLength={500}
          />
          <div className="text-right text-xs text-gray-400 mt-1">
            {content.length}/500
          </div>

          {/* Color Customization for Text Stories */}
          {storyType === "text" && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Palette size={16} className="inline mr-1" />
                  Background Color
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {backgroundColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setBackgroundColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        backgroundColor === color
                          ? "border-white"
                          : "border-gray-600"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Text Color
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTextColor("#ffffff")}
                    className={`w-8 h-8 rounded-full border-2 ${
                      textColor === "#ffffff" ? "border-purple-500" : "border-gray-600"
                    }`}
                    style={{ backgroundColor: "#ffffff" }}
                  />
                  <button
                    onClick={() => setTextColor("#000000")}
                    className={`w-8 h-8 rounded-full border-2 ${
                      textColor === "#000000" ? "border-purple-500" : "border-gray-600"
                    }`}
                    style={{ backgroundColor: "#000000" }}
                  />
                  <button
                    onClick={() => setTextColor("#ff6b6b")}
                    className={`w-8 h-8 rounded-full border-2 ${
                      textColor === "#ff6b6b" ? "border-purple-500" : "border-gray-600"
                    }`}
                    style={{ backgroundColor: "#ff6b6b" }}
                  />
                  <button
                    onClick={() => setTextColor("#4ecdc4")}
                    className={`w-8 h-8 rounded-full border-2 ${
                      textColor === "#4ecdc4" ? "border-purple-500" : "border-gray-600"
                    }`}
                    style={{ backgroundColor: "#4ecdc4" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={resetForm}
              className="flex-1 py-2 px-4 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || (!content.trim() && !selectedFile)}
              className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  <span>Share Story</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Music Selector Modal */}
      {showMusicSelector && (
        <MusicSelector
          onSelectMusic={setSelectedMusic}
          onClose={() => setShowMusicSelector(false)}
          selectedMusic={selectedMusic}
        />
      )}
    </motion.div>
  );

  return createPortal(modalContent, document.body);
}