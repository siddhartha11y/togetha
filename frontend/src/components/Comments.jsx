import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { FaTrash, FaHeart, FaSmile, FaPaperPlane } from "react-icons/fa";
import { HiOutlineEmojiHappy } from "react-icons/hi";
import { formatCommentTime } from "../utils/timeUtils";

export default function Comments({ postId, postAuthorId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const commentsEndRef = useRef(null);

  // Popular emojis for quick access
  const quickEmojis = ['😀', '😂', '❤️', '👍', '🔥', '😍', '🎉', '👏', '😊', '🤔', '😢', '😮'];



  // ✅ Fetch current user (only once)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/profile", { withCredentials: true }); 
        setCurrentUser(res.data); // must return { _id, username, ... }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  // Fetch comments when component loads
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.get(`/posts/${postId}/comments`, {
          withCredentials: true,
        });
        setComments(res.data);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };
    fetchComments();
  }, [postId]);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  // Scroll to bottom when new comment is added
  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Add new comment with animation
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await api.post(
        `/posts/${postId}/comments`,
        { text: newComment },
        { withCredentials: true }
      );
      setComments(res.data);
      setNewComment("");
      setShowEmojiPicker(false);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      // Scroll to show new comment
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add emoji to comment
  const addEmoji = (emoji) => {
    setNewComment(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
    setTimeout(adjustTextareaHeight, 0);
  };

  // ✅ Delete comment
  const handleDelete = async (commentId) => {
    try {
      const res = await api.delete(
        `/posts/${postId}/comments/${commentId}`,
        { withCredentials: true }
      );
      setComments(res.data.comments);
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0, scaleY: 0 }}
      animate={{ opacity: 1, height: "auto", scaleY: 1 }}
      exit={{ opacity: 0, height: 0, scaleY: 0 }}
      transition={{ 
        duration: 0.4, 
        ease: "easeInOut",
        height: { duration: 0.4 },
        opacity: { duration: 0.3 },
        scaleY: { duration: 0.4 }
      }}
      style={{ originY: 0 }}
      className="border-t border-gray-800/50 bg-gradient-to-br from-gray-900/80 via-purple-900/10 to-gray-900/90 backdrop-blur-md overflow-hidden shadow-2xl"
    >
      {/* Comments Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 py-4 border-b border-gray-700/50 bg-gradient-to-r from-purple-900/20 to-pink-900/20"
      >
        <motion.h4 
          whileHover={{ scale: 1.02 }}
          className="text-base font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text flex items-center gap-2 tracking-wide cursor-default"
        >
          💬 Comments ({comments?.length || 0})
        </motion.h4>
      </motion.div>

      {/* Comments List */}
      <div className="px-4 py-2 max-h-64 overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {(comments ?? []).length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              className="text-center py-12"
            >
              <motion.div 
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="text-5xl mb-4 inline-block"
              >
                💭
              </motion.div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-lg font-bold tracking-wide"
              >
                No comments yet. Be the first to share your thoughts!
              </motion.p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {(comments ?? []).map((c, index) => (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.05,
                    ease: "easeOut"
                  }}
                  className="group flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-gray-800/40 to-gray-800/20 hover:from-purple-900/30 hover:to-pink-900/20 transition-all duration-300 border border-gray-700/40 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 backdrop-blur-sm"
                >
                  {/* Avatar */}
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
                    <img
                      src={c.author?.profilePicture || "/default-avatar.png"}
                      className="relative h-9 w-9 rounded-full object-cover border-2 border-purple-500/30 group-hover:border-purple-400/60 transition-all duration-300 shadow-lg"
                      alt="profile"
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                  </motion.div>

                  {/* Comment Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Link to={`/profile/${c.author?.username}`}>
                        <motion.span 
                          whileHover={{ scale: 1.05 }}
                          className="font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-sm hover:from-purple-300 hover:to-pink-300 transition-all duration-200 cursor-pointer tracking-wide"
                        >
                          {c.author?.username}
                        </motion.span>
                      </Link>
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xs text-gray-400 font-medium px-2 py-1 bg-gray-800/50 rounded-full"
                      >
                        {formatCommentTime(c.createdAt)}
                      </motion.span>
                    </div>
                    <motion.p 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-gray-100 text-base leading-relaxed break-words font-medium tracking-wide hover:text-white transition-colors duration-200"
                    >
                      {c.text}
                    </motion.p>
                    
                    {/* Comment Actions */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 0, y: 0 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-4 mt-3 group-hover:opacity-100 transition-all duration-300"
                    >
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-xs text-gray-500 hover:text-red-400 transition-all duration-200 flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-red-500/10"
                      >
                        <FaHeart size={11} />
                        Like
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-xs text-gray-500 hover:text-blue-400 transition-all duration-200 px-2 py-1 rounded-full hover:bg-blue-500/10"
                      >
                        Reply
                      </motion.button>
                    </motion.div>
                  </div>

                  {/* Delete Button */}
                  {currentUser &&
                    (c.author?._id === currentUser._id ||
                      postAuthorId === currentUser._id) && (
                      <motion.button
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        whileTap={{ scale: 0.8 }}
                        onClick={() => handleDelete(c._id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all duration-300 p-2 rounded-full hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-500/20 hover:shadow-lg hover:shadow-red-500/20"
                      >
                        <FaTrash size={12} />
                      </motion.button>
                    )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
        <div ref={commentsEndRef} />
      </div>

      {/* Comment Input */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-4 py-4 border-t border-gray-700/50 bg-gradient-to-r from-purple-900/10 to-pink-900/10"
      >
        <form onSubmit={handleAddComment} className="relative">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 blur-sm"></div>
              <img
                src={
                  currentUser?.profilePicture || "/default-avatar.png"
                }
                className="relative h-9 w-9 rounded-full object-cover border-2 border-purple-500/40 hover:border-purple-400/60 transition-all duration-300 shadow-lg"
                alt="Your profile"
                onError={(e) => {
                  e.target.src = "/default-avatar.png";
                }}
              />
            </motion.div>

            {/* Input Container */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => {
                  setNewComment(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment(e);
                  }
                }}
                placeholder="Write a comment... (Press Enter to send)"
                className="w-full bg-gradient-to-r from-gray-800/60 to-gray-800/40 border border-gray-600/50 rounded-2xl px-4 py-3 pr-20 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-400/60 focus:shadow-lg focus:shadow-purple-500/20 hover:border-purple-500/40 transition-all duration-300 resize-none min-h-[48px] max-h-32 leading-relaxed text-base font-medium tracking-wide backdrop-blur-sm comment-textarea"
                rows={1}
              />
              
              {/* Emoji Button */}
              <div className="absolute right-12 top-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-gray-400 hover:text-yellow-400 transition-all duration-300 p-2 rounded-full hover:bg-gradient-to-r hover:from-yellow-500/20 hover:to-orange-500/20 hover:shadow-lg hover:shadow-yellow-500/20"
                >
                  <HiOutlineEmojiHappy size={18} />
                </motion.button>
              </div>

              {/* Send Button */}
              <div className="absolute right-2 top-2.5">
                <motion.button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-600 text-white p-3 rounded-full transition-all duration-300 disabled:cursor-not-allowed shadow-xl hover:shadow-purple-500/40 animate-pulse hover:animate-none"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FaPaperPlane size={14} />
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Emoji Picker */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, y: 20, scale: 0.8, rotateX: -15 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                className="absolute bottom-full right-0 mb-3 bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 border border-purple-500/30 rounded-2xl p-4 shadow-2xl shadow-purple-500/20 z-10 backdrop-blur-md"
              >
                <div className="grid grid-cols-6 gap-2">
                  {quickEmojis.map((emoji, index) => (
                    <motion.button
                      key={emoji}
                      type="button"
                      initial={{ opacity: 0, scale: 0, rotate: -180 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ delay: index * 0.03, type: "spring", stiffness: 300 }}
                      whileHover={{ scale: 1.3, rotate: 10, y: -2 }}
                      whileTap={{ scale: 0.8 }}
                      onClick={() => addEmoji(emoji)}
                      className="text-2xl p-2 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-pink-600/20 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
        
        /* Hide scrollbar for comment textarea */
        .comment-textarea::-webkit-scrollbar {
          display: none;
        }
        .comment-textarea {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </motion.div>
  );
}
