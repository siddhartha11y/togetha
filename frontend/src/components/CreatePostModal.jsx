import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, Image, Type, Send, Edit3, Smile } from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";
import ImageEditor from "./ImageEditor";
import EmojiPicker from "./EmojiPicker";

export default function CreatePostModal({ user, onClose, onPostCreated }) {
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
      // Cleanup preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Cleanup previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please add a title for your post");
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("title", title);
      
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      await api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      toast.success("Post created successfully!");
      onPostCreated();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(error?.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
  };

  const handleImageEditorSave = (editData) => {
    // In a real implementation, you would apply the transformations to the image
    // For now, we'll just close the editor
    console.log("Image edit data:", editData);
    setShowImageEditor(false);
    toast.success("Image edits applied!");
  };

  const handleEmojiSelect = (emoji) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newTitle = title.substring(0, start) + emoji + title.substring(end);
      setTitle(newTitle);
      
      // Set cursor position after emoji
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    } else {
      setTitle(prev => prev + emoji);
    }
    setShowEmojiPicker(false);
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
        className="bg-gray-900/95 backdrop-blur-md rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700/50"
        style={{ perspective: 1000 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">Create Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Title Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <Type size={16} className="inline mr-2" />
              Post Title
            </label>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind?"
                maxLength={200}
                className="w-full p-4 pr-12 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none h-24"
                required
              />
              
              {/* Emoji Button */}
              <div className="absolute top-3 right-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-2 rounded-lg transition-colors ${
                    showEmojiPicker
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
                  }`}
                >
                  <Smile size={18} />
                </motion.button>

                {/* Emoji Picker */}
                <EmojiPicker
                  isOpen={showEmojiPicker}
                  onClose={() => setShowEmojiPicker(false)}
                  onEmojiSelect={handleEmojiSelect}
                  position="bottom"
                />
              </div>
            </div>
            <div className="text-right text-xs text-gray-400 mt-2">
              {title.length}/200
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <Image size={16} className="inline mr-2" />
              Add Image (Optional)
            </label>
            
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-purple-500 transition-colors flex flex-col items-center justify-center text-gray-400 hover:text-purple-400"
              >
                <Image size={32} className="mb-2" />
                <span className="text-sm">
                  {selectedFile ? "Change Image" : "Click to upload image"}
                </span>
              </button>
            </div>
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Preview
              </label>
              <div className="relative group cursor-pointer" onClick={() => setShowImageEditor(true)}>
                <motion.img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-64 object-cover rounded-lg border border-gray-700"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center pointer-events-none">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-purple-600 p-3 rounded-full text-white"
                  >
                    <Edit3 size={24} />
                  </motion.div>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the image editor
                    setSelectedFile(null);
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl("");
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 rounded-full transition-colors z-20"
                >
                  <X size={16} className="text-white" />
                </button>

                {/* Edit hint */}
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none">
                  Click to edit
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 py-3 px-4 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 font-medium"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  <span>Create Post</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Image Editor Modal */}
      <ImageEditor
        imageUrl={previewUrl}
        isOpen={showImageEditor}
        onClose={() => setShowImageEditor(false)}
        onSave={handleImageEditorSave}
      />
    </motion.div>
  );

  return createPortal(modalContent, document.body);
}