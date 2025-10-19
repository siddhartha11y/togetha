import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import ChatBox from "../components/ChatBox";
import useUserStore from "../store/userStore";
import socketService from "../socket";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { Search, MessageCircle, Home, MoreVertical, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MessagesPage() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [contextMenuOpen, setContextMenuOpen] = useState(null);
  const [deletingChat, setDeletingChat] = useState(null);
  const { user, loadUserFromCookie } = useUserStore();

  const location = useLocation();
  const navigate = useNavigate();

  // Load user from cookie first
  useEffect(() => {
    const initUser = async () => {
      try {
        loadUserFromCookie();
        // Also try to fetch fresh user data from API
        const response = await api.get("/api/auth/profile");
        if (response.data) {
          // User is authenticated, continue
        }
      } catch (error) {
        console.error("User not authenticated:", error);
        navigate("/login");
        return;
      } finally {
        setUserLoading(false);
      }
    };

    initUser();
  }, [loadUserFromCookie, navigate]);

  // Initialize socket connection
  useEffect(() => {
    if (user && !socketService.isSocketConnected()) {
      socketService.connect(user);
    }
  }, [user]);

  // Extract ?user=ID from query string to start new chat
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get("user");

    if (userId && user) {
      // Create or get existing chat with this user
      api
        .post(`/api/chats/${userId}`)
        .then((res) => {
          setSelectedChat(res.data);
          // Update chats list to include this new/existing chat
          setChats((prevChats) => {
            const existingIndex = prevChats.findIndex(
              (c) => c._id === res.data._id
            );
            if (existingIndex >= 0) {
              return prevChats; // Chat already exists
            }
            return [res.data, ...prevChats]; // Add new chat to top
          });
          // Remove query param from URL after resolving
          navigate("/messages", { replace: true });
        })
        .catch((err) => {
          console.error("Error accessing chat:", err);
          toast.error("Failed to start chat");
        });
    }
  }, [location.search, navigate, user]);

  // Load all chats for logged-in user
  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get("/api/chats");
        console.log("Fetched chats:", data);
        setChats(data);
      } catch (err) {
        console.error("Error fetching chats:", err);
        toast.error("Failed to load chats");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [user]);

  // Listen for new messages to update chat list
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleMessageReceived = (message) => {
      // Update the latest message and move chat to top
      setChats((prevChats) => {
        const updatedChats = prevChats.map((chat) => {
          if (chat._id === message.chat._id || chat._id === message.chat) {
            return {
              ...chat,
              latestMessage: message,
              updatedAt: new Date().toISOString(),
            };
          }
          return chat;
        });

        // Sort by updatedAt to show most recent chats first
        return updatedChats.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      });
    };

    socket.on("message_received", handleMessageReceived);

    return () => {
      socket.off("message_received", handleMessageReceived);
    };
  }, []);

  // Handle message sent to update chat list
  const handleMessageSent = (message) => {
    setChats((prevChats) => {
      const updatedChats = prevChats.map((chat) => {
        if (chat._id === message.chat._id || chat._id === message.chat) {
          return {
            ...chat,
            latestMessage: message,
            updatedAt: new Date().toISOString(),
          };
        }
        return chat;
      });

      // Sort by updatedAt
      return updatedChats.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
    });
  };

  // Delete chat function
  const handleDeleteChat = async (chatId) => {
    if (deletingChat) return; // Prevent multiple deletions
    
    setDeletingChat(chatId);
    try {
      await api.delete(`/api/chats/${chatId}`, { withCredentials: true });
      
      // Remove chat from state
      setChats(prevChats => prevChats.filter(chat => chat._id !== chatId));
      
      // Clear selected chat if it was the deleted one
      if (selectedChat?._id === chatId) {
        setSelectedChat(null);
      }
      
      toast.success("Chat deleted successfully");
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    } finally {
      setDeletingChat(null);
      setContextMenuOpen(null);
    }
  };

  // Close context menu when clicking outside
  const handleClickOutside = () => {
    setContextMenuOpen(null);
  };

  // Close context menu when clicking outside
  useEffect(() => {
    if (contextMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenuOpen]);

  // Format last message time
  const formatLastMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Please log in
          </h2>
          <p className="text-gray-600">
            You need to be logged in to access messages.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <Navbar />
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar with chats */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Messages
              </h2>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate("/home")}
                  className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
                  title="Go to Home"
                >
                  <Home size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors"
                >
                  <MessageCircle size={20} />
                </motion.button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full bg-gray-800 border border-gray-700 rounded-full py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
                />
              </div>
            ) : chats.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 text-center text-gray-400"
              >
                <MessageCircle
                  size={48}
                  className="mx-auto mb-4 text-gray-600"
                />
                <p className="text-lg font-medium">No conversations yet</p>
                <p className="text-sm mt-1">
                  Start a chat from someone's profile
                </p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {chats.map((chat, index) => {
                  const otherUsers = chat.participants.filter(
                    (u) => u._id !== user._id
                  );
                  const otherUser = otherUsers[0];
                  const chatName = chat.isGroup
                    ? chat.name || "Unnamed Group"
                    : otherUser?.fullName ||
                      otherUser?.username ||
                      "Unknown User";

                  // Debug logging for each chat
                  console.log(`Chat ${index}:`, {
                    chatId: chat._id,
                    otherUser: otherUser,
                    profilePicture: otherUser?.profilePicture,
                    fullURL: `${import.meta.env.VITE_API_BASE_URL}${otherUser?.profilePicture}`,
                  });

                  const lastMessage = chat.latestMessage;
                  const isSelected = selectedChat?._id === chat._id;

                  return (
                    <motion.div
                      key={chat._id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative p-4 border-b border-gray-800 transition-all duration-300 hover:bg-gray-800 ${
                        isSelected ? "bg-purple-900/30 border-purple-500" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Avatar with profile picture */}
                        <div 
                          className="relative cursor-pointer"
                          onClick={() => setSelectedChat(chat)}
                        >
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-700 hover:ring-purple-500 transition-all"
                          >
                            {otherUser?.profilePicture &&
                            otherUser.profilePicture !==
                              "/images/default-avatar.png" ? (
                              <img
                                src={`${import.meta.env.VITE_API_BASE_URL}${otherUser.profilePicture}`}
                                alt={chatName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.log(
                                    "Image failed to load:",
                                    otherUser.profilePicture
                                  );
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg"
                              style={{
                                display:
                                  otherUser?.profilePicture &&
                                  otherUser.profilePicture !==
                                    "/images/default-avatar.png"
                                    ? "none"
                                    : "flex",
                              }}
                            >
                              {chatName.charAt(0).toUpperCase()}
                            </div>
                          </motion.div>
                          {/* Online indicator */}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                        </div>

                        {/* Chat Info */}
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => setSelectedChat(chat)}
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white truncate">
                              {chatName}
                            </h3>
                            {lastMessage && (
                              <span className="text-xs text-gray-400 flex-shrink-0">
                                {formatLastMessageTime(lastMessage.createdAt)}
                              </span>
                            )}
                          </div>

                          {lastMessage && (
                            <p className="text-sm text-gray-400 truncate mt-1">
                              {lastMessage.sender._id === user._id
                                ? "You: "
                                : ""}
                              {lastMessage.content}
                            </p>
                          )}
                        </div>

                        {/* Context Menu Button */}
                        <div className="relative">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setContextMenuOpen(contextMenuOpen === chat._id ? null : chat._id);
                            }}
                            className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                          >
                            <MoreVertical size={16} />
                          </motion.button>

                          {/* Context Menu */}
                          <AnimatePresence>
                            {contextMenuOpen === chat._id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-10 z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl min-w-[120px]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => handleDeleteChat(chat._id)}
                                  disabled={deletingChat === chat._id}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-400 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  {deletingChat === chat._id ? (
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                      className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full"
                                    />
                                  ) : (
                                    <Trash2 size={16} />
                                  )}
                                  <span className="text-sm">
                                    {deletingChat === chat._id ? "Deleting..." : "Delete Chat"}
                                  </span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </motion.div>

        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex-1 bg-gray-900"
        >
          <ChatBox
            user={user}
            selectedChat={selectedChat}
            onMessageSent={handleMessageSent}
          />
        </motion.div>
      </div>
    </div>
  );
}
