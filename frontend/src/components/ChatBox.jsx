import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import socketService from "../socket";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Phone, Video, MoreVertical, Smile, Paperclip, Mic, Home, Share2, Heart, MessageCircle, User, VolumeX, Volume2, Shield, Trash2, MessageSquare, PhoneCall, VideoIcon } from "lucide-react";
import PostModal from "./PostModal";
import agoraService from "../services/agoraService";

export default function ChatBox({ selectedChat, user, onMessageSent }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [showThreeDotMenu, setShowThreeDotMenu] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState(null); // 'audio' or 'video'
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const threeDotMenuRef = useRef(null);
  const navigate = useNavigate();

  // Get other user info for chat header
  const otherUser = selectedChat?.participants?.find(p => p._id !== user._id);
  const chatTitle = selectedChat?.isGroup 
    ? selectedChat.name || "Group Chat"
    : otherUser?.fullName || otherUser?.username || "Unknown User";

  // Handle clicking on shared post to open modal
  const handleSharedPostClick = (postId) => {
    setSelectedPostId(postId);
    setShowPostModal(true);
  };

  // Close post modal
  const closePostModal = () => {
    setShowPostModal(false);
    setSelectedPostId(null);
  };

  // Handle audio call
  const handleAudioCall = async () => {
    try {
      // FIRST: Send initiate_call event to backend to trigger incoming call notification
      const socket = socketService.getSocket();
      if (socket) {
        socket.emit("initiate_call", {
          chatId: selectedChat._id,
          callType: 'audio',
          caller: user,
          recipient: otherUser
        });

        // Add call start message to chat
        try {
          const response = await api.post(`/api/messages/${selectedChat._id}`, {
            content: "📞 Audio call started",
            messageType: 'call_history',
            callInfo: {
              type: 'audio',
              status: 'started'
            }
          });

          if (response.data) {
            // Add to local state immediately
            setMessages((prev) => [...prev, response.data]);
            // Emit the saved message to other participants
            socket.emit("send_message", response.data);
          }
        } catch (error) {
          console.error("Error saving call start message:", error);
        }
      }
      
      // THEN: Use Global Call Interface to start call properly
      if (window.globalCallInterface && window.globalCallInterface.startCall) {
        await window.globalCallInterface.startCall(selectedChat._id, 'audio', otherUser);
      } else {
        // Fallback: Use Agora service directly
        await agoraService.startCall(selectedChat._id, 'audio');
      }
      
      // The GlobalCallInterface will handle the UI for the call
    } catch (error) {
      console.error("Error starting audio call:", error);
      toast.error("Failed to start audio call");
    }
  };

  // Handle video call
  const handleVideoCall = async () => {
    try {

      
      // FIRST: Send initiate_call event to backend to trigger incoming call notification
      const socket = socketService.getSocket();
      if (socket) {
        socket.emit("initiate_call", {
          chatId: selectedChat._id,
          callType: 'video',
          caller: user,
          recipient: otherUser
        });

        // Add call start message to chat
        try {
          const response = await api.post(`/api/messages/${selectedChat._id}`, {
            content: "📹 Video call started",
            messageType: 'call_history',
            callInfo: {
              type: 'video',
              status: 'started'
            }
          });

          if (response.data) {
            // Add to local state immediately
            setMessages((prev) => [...prev, response.data]);
            // Emit the saved message to other participants
            socket.emit("send_message", response.data);
          }
        } catch (error) {
          console.error("Error saving call start message:", error);
        }
      }
      
      // THEN: Use Global Call Interface to start call properly
      if (window.globalCallInterface && window.globalCallInterface.startCall) {
        await window.globalCallInterface.startCall(selectedChat._id, 'video', otherUser);
      } else {
        // Fallback: Use Agora service directly
        await agoraService.startCall(selectedChat._id, 'video');
      }
      
      // The GlobalCallInterface will handle the UI for the call
    } catch (error) {
      console.error("Error starting video call:", error);
      toast.error("Failed to start video call");
    }
  };

  // End call
  const endCall = () => {
    agoraService.endCall();
    toast.info("Call ended");
  };

  // Toggle mute
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    agoraService.toggleMute(newMutedState);
  };
  
  // Toggle video
  const toggleVideo = () => {
    const newVideoState = !isVideoOn;
    setIsVideoOn(newVideoState);
    agoraService.toggleVideo(newVideoState);
  };

  // Handle three dot menu options
  const handleViewProfile = () => {
    setShowThreeDotMenu(false);
    navigate(`/profile/${otherUser._id}`);
  };

  const handleMuteChat = () => {
    setShowThreeDotMenu(false);
    toast.success("Chat muted");
    // TODO: Implement mute functionality
  };

  const handleBlockUser = () => {
    setShowThreeDotMenu(false);
    toast.success(`${otherUser.fullName || otherUser.username} has been blocked`);
    // TODO: Implement block functionality
  };

  const handleClearChat = async () => {
    setShowThreeDotMenu(false);
    try {
      await api.delete(`/api/messages/${selectedChat._id}/clear`);
      setMessages([]);
      toast.success("Chat cleared");
    } catch (error) {
      toast.error("Failed to clear chat");
    }
  };

  const handleDeleteChat = async () => {
    setShowThreeDotMenu(false);
    try {
      await api.delete(`/api/chats/${selectedChat._id}`);
      toast.success("Chat deleted");
      // Navigate back or refresh chat list
      navigate('/messages');
    } catch (error) {
      toast.error("Failed to delete chat");
    }
  };

  // Close three dot menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (threeDotMenuRef.current && !threeDotMenuRef.current.contains(event.target)) {
        setShowThreeDotMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Expose function to add messages to current chat (for call history)
  useEffect(() => {
    if (selectedChat) {
      window.addMessageToCurrentChat = (message) => {
        if (message.chat === selectedChat._id || message.chat._id === selectedChat._id) {
          setMessages((prev) => [...prev, message]);
        }
      };
      
      // Set flag to prevent global call interface from showing when in active chat
      if (agoraService.chatId === selectedChat._id) {
        window.isInActiveCallChat = true;
      }
    } else {
      window.addMessageToCurrentChat = null;
      window.isInActiveCallChat = false;
    }

    return () => {
      window.addMessageToCurrentChat = null;
      window.isInActiveCallChat = false;
    };
  }, [selectedChat]);

  // Debug logging
  useEffect(() => {
    if (selectedChat && otherUser) {
      console.log("=== CHAT DEBUG ===");
      console.log("Selected chat:", selectedChat);
      console.log("Other user:", otherUser);
      console.log("Other user profile picture:", otherUser?.profilePicture);
      console.log("Full profile picture URL:", `${import.meta.env.VITE_API_BASE_URL}${otherUser?.profilePicture}`);
      console.log("==================");
    }
  }, [selectedChat, otherUser]);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat?._id) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/api/messages/${selectedChat._id}`);
        setMessages(data);
        
        // Join chat room for real-time updates
        const socket = socketService.getSocket();
        if (socket) {
          socket.emit("join_chat", selectedChat._id);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        toast.error("Failed to load messages");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  // Socket listeners
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket || !selectedChat) return;

    console.log("Setting up socket listeners for chat:", selectedChat._id);

    const handleMessageReceived = (msg) => {
      console.log("Message received:", msg);
      if (msg.chat._id === selectedChat._id || msg.chat === selectedChat._id) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some(m => m._id === msg._id)) {
            console.log("Duplicate message, ignoring");
            return prev;
          }
          console.log("Adding new message to state");
          return [...prev, msg];
        });
      }
    };

    const handleTyping = (chatId) => {
      console.log("Typing event for chat:", chatId);
      if (chatId === selectedChat._id) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = (chatId) => {
      console.log("Stop typing event for chat:", chatId);
      if (chatId === selectedChat._id) {
        setIsTyping(false);
      }
    };

    // Remove any existing listeners first
    socket.off("message_received");
    socket.off("typing");
    socket.off("stop_typing");

    // Add new listeners
    socket.on("message_received", handleMessageReceived);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.off("message_received", handleMessageReceived);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
    };
  }, [selectedChat]);

  // Handle typing indicators
  const handleTyping = () => {
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.emit("typing", selectedChat._id);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", selectedChat._id);
    }, 3000);
  };

  // Listen for call events
  useEffect(() => {
    if (!selectedChat) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    const handleCallAccepted = (callData) => {
      console.log("✅ Call accepted:", callData);

      setIsCallActive(true);
    };

    const handleCallRejected = (callData) => {
      console.log("❌ Call rejected:", callData);
      toast.error("Call rejected");
      setIsCallActive(false);
      setCallType(null);
    };

    const handleCallEnded = (callData) => {
      console.log("📞 Call ended:", callData);
      toast.info("Call ended");
      setIsCallActive(false);
      setCallType(null);
      setIsMuted(false);
      setIsVideoOn(true);
    };

    socket.on("call_accepted", handleCallAccepted);
    socket.on("call_rejected", handleCallRejected);
    socket.on("call_ended", handleCallEnded);

    return () => {
      socket.off("call_accepted", handleCallAccepted);
      socket.off("call_rejected", handleCallRejected);
      socket.off("call_ended", handleCallEnded);
    };
  }, [selectedChat]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    // Stop typing indicator
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit("stop_typing", selectedChat._id);
    }

    try {
      const { data } = await api.post(`/api/messages/${selectedChat._id}`, {
        content: messageContent,
      });

      // Add message to local state immediately
      setMessages((prev) => [...prev, data]);

      // Emit to other users via socket
      if (socket) {
        socket.emit("send_message", data);
      }

      // Notify parent component about new message
      if (onMessageSent) {
        onMessageSent(data);
      }

    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
      // Restore message in input on error
      setNewMessage(messageContent);
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format message time
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!selectedChat) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-900 min-h-full"
      >
        <div className="text-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="mb-6 flex justify-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Send size={40} className="text-white" />
            </div>
          </motion.div>
          <h3 className="text-xl font-semibold mb-2 text-center">Select a chat to start messaging</h3>
          <p className="text-gray-500 text-center">Choose a conversation from the sidebar</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Chat Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 border-b border-gray-800 bg-gray-900"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-purple-500"
            >
              {otherUser?.profilePicture && otherUser.profilePicture !== "/images/default-avatar.png" ? (
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}${otherUser.profilePicture}`}
                  alt={chatTitle}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log("Chat header image failed to load:", otherUser.profilePicture);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold"
                style={{ display: otherUser?.profilePicture && otherUser.profilePicture !== "/images/default-avatar.png" ? 'none' : 'flex' }}
              >
                {chatTitle.charAt(0).toUpperCase()}
              </div>
            </motion.div>
            <div>
              <h3 className="font-semibold text-white text-lg">{chatTitle}</h3>
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center space-x-1 text-purple-400"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="w-2 h-2 bg-purple-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-purple-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-purple-400 rounded-full"
                    />
                    <span className="text-sm ml-2">typing...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "#2563eb" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/home")}
              className="p-2 rounded-full bg-gray-800 text-gray-300 hover:text-white transition-colors"
              title="Go to Home"
            >
              <Home size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "#7c3aed" }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAudioCall}
              className="p-2 rounded-full bg-gray-800 text-gray-300 hover:text-white transition-colors"
              title="Audio Call"
            >
              <Phone size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "#7c3aed" }}
              whileTap={{ scale: 0.9 }}
              onClick={handleVideoCall}
              className="p-2 rounded-full bg-gray-800 text-gray-300 hover:text-white transition-colors"
              title="Video Call"
            >
              <Video size={20} />
            </motion.button>
            <div className="relative" ref={threeDotMenuRef}>
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "#7c3aed" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowThreeDotMenu(!showThreeDotMenu)}
                className="p-2 rounded-full bg-gray-800 text-gray-300 hover:text-white transition-colors"
                title="More Options"
              >
                <MoreVertical size={20} />
              </motion.button>

              {/* Three Dot Dropdown Menu */}
              <AnimatePresence>
                {showThreeDotMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-12 bg-gray-800 rounded-lg shadow-lg py-2 min-w-[180px] z-50 border border-gray-700"
                  >
                    <button
                      onClick={handleViewProfile}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <User size={16} />
                      View Profile
                    </button>
                    <button
                      onClick={handleMuteChat}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <VolumeX size={16} />
                      Mute Chat
                    </button>
                    <button
                      onClick={handleBlockUser}
                      className="w-full px-4 py-2 text-left text-orange-400 hover:bg-gray-700 hover:text-orange-300 transition-colors flex items-center gap-2"
                    >
                      <Shield size={16} />
                      Block User
                    </button>
                    <div className="border-t border-gray-700 my-1"></div>
                    <button
                      onClick={handleClearChat}
                      className="w-full px-4 py-2 text-left text-yellow-400 hover:bg-gray-700 hover:text-yellow-300 transition-colors flex items-center gap-2"
                    >
                      <MessageSquare size={16} />
                      Clear Chat
                    </button>
                    <button
                      onClick={handleDeleteChat}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete Chat
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>



      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-900 to-black scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
            />
          </div>
        ) : messages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-gray-400"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <Send size={24} className="text-white" />
            </div>
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, index) => {
              const isMyMessage = msg.sender._id === user._id;
              return (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                      isMyMessage
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md"
                        : "bg-gray-800 text-white rounded-bl-md border border-gray-700"
                    }`}
                  >
                    {/* Regular text message */}
                    {(!msg.messageType || msg.messageType === 'text') && (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}
                    
                    {/* Call history message */}
                    {msg.messageType === 'call_history' && (
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        {msg.callType === 'video' ? (
                          <VideoIcon size={16} className="text-purple-400" />
                        ) : (
                          <PhoneCall size={16} className="text-purple-400" />
                        )}
                        <p className="italic">{msg.content}</p>
                      </div>
                    )}
                    
                    {/* Shared post message */}
                    {msg.messageType === 'shared_post' && msg.sharedPost && (
                      <div className="space-y-3">
                        {/* Share message text */}
                        {msg.content && (
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        )}
                        
                        {/* Shared post preview */}
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handleSharedPostClick(msg.sharedPost._id)}
                          className="bg-gray-700 rounded-lg overflow-hidden border border-gray-600 cursor-pointer"
                        >
                          {/* Post image */}
                          {msg.sharedPost.imageUrl && (
                            <div className="aspect-square overflow-hidden">
                              <img
                                src={msg.sharedPost.imageUrl.startsWith('http') 
                                  ? msg.sharedPost.imageUrl 
                                  : `${import.meta.env.VITE_API_BASE_URL}${msg.sharedPost.imageUrl}`}
                                alt={msg.sharedPost.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.log("Shared post image failed to load:", msg.sharedPost.imageUrl);
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          
                          {/* Post info */}
                          <div className="p-3 space-y-2">
                            <h4 className="text-sm font-medium text-white" style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {msg.sharedPost.title}
                            </h4>
                            
                            {/* Author info */}
                            <div className="flex items-center gap-2">
                              <img
                                src={msg.sharedPost.author?.profilePicture 
                                  ? `${import.meta.env.VITE_API_BASE_URL}${msg.sharedPost.author.profilePicture}`
                                  : '/default-avatar.png'
                                }
                                alt={msg.sharedPost.author?.username}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <span className="text-xs text-gray-300">
                                @{msg.sharedPost.author?.username}
                              </span>
                            </div>
                            
                            {/* Post stats */}
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <div className="flex items-center gap-1">
                                <Heart size={12} />
                                <span>{msg.sharedPost.likes?.length || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle size={12} />
                                <span>{msg.sharedPost.comments?.length || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Share2 size={12} />
                                <span>{msg.sharedPost.shareCount || 0}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    )}
                    
                    <p className={`text-xs mt-2 ${
                      isMyMessage ? "text-purple-100" : "text-gray-400"
                    }`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <motion.form
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={sendMessage}
        className="p-4 border-t border-gray-800 bg-gray-900"
      >
        <div className="flex items-center space-x-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-purple-400 hover:bg-gray-700 transition-colors"
          >
            <Paperclip size={20} />
          </motion.button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-full px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
            >
              <Smile size={20} />
            </motion.button>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-purple-400 hover:bg-gray-700 transition-colors"
          >
            <Mic size={20} />
          </motion.button>

          <motion.button
            type="submit"
            disabled={!newMessage.trim() || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            <Send size={20} />
          </motion.button>
        </div>
      </motion.form>

      {/* Post Modal */}
      <PostModal
        postId={selectedPostId}
        isOpen={showPostModal}
        onClose={closePostModal}
        currentUser={user}
      />
    </div>
  );
}
