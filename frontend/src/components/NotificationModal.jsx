import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Bell, Heart, MessageCircle, UserPlus, Camera } from "lucide-react";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function NotificationModal({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications", {
        withCredentials: true,
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Mark as read
  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`, {}, { withCredentials: true });
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      // Mark all unread notifications as read
      await Promise.all(
        unreadNotifications.map(n => 
          api.put(`/notifications/${n._id}/read`, {}, { withCredentials: true })
        )
      );
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleFollowBack = async (userId) => {
    try {
      await api.put(`/auth/${userId}/follow`, {}, { withCredentials: true });
      
      setNotifications(prev =>
        prev.map(n =>
          n.sender._id === userId
            ? { ...n, sender: { ...n.sender, isFollowed: true } }
            : n
        )
      );
    } catch (err) {
      console.error("Error following back:", err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return <Heart className="text-red-500" size={20} />;
      case 'comment': return <MessageCircle className="text-blue-500" size={20} />;
      case 'follow': return <UserPlus className="text-green-500" size={20} />;
      case 'story': return <Camera className="text-purple-500" size={20} />;
      default: return <Bell className="text-gray-500" size={20} />;
    }
  };

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case 'like': return 'liked your post';
      case 'comment': return 'commented on your post';
      case 'follow': return 'started following you';
      case 'story': return 'viewed your story';
      default: return 'sent you a notification';
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-xl flex items-center justify-center z-[9999] p-4"
        onClick={onClose}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glass morphism container */}
          <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Gradient overlay for glass effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent pointer-events-none"></div>
            
            {/* Subtle animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-blue-500/10 animate-pulse pointer-events-none"></div>
            {/* Header */}
            <div className="relative flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500/80 to-pink-500/80 backdrop-blur-sm rounded-2xl shadow-lg">
                  <Bell size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-white drop-shadow-lg">Notifications</h2>
              </div>
              <div className="flex items-center gap-2">
                {notifications.some(n => !n.isRead) && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-purple-300 hover:text-purple-200 transition-colors px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 backdrop-blur-sm"
                >
                  <X size={20} className="text-white/80 hover:text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="relative overflow-y-auto max-h-96">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-white/70">
                  <div className="p-4 bg-white/10 rounded-full mb-4 backdrop-blur-sm">
                    <Bell size={48} className="opacity-60" />
                  </div>
                  <p className="text-lg font-medium text-white">No notifications yet</p>
                  <p className="text-sm text-white/60">When you get notifications, they'll show up here</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`relative p-4 hover:bg-white/10 transition-all duration-200 cursor-pointer backdrop-blur-sm ${
                        !notification.isRead ? 'bg-white/5' : ''
                      }`}
                      onClick={() => markAsRead(notification._id)}
                    >
                      {/* Subtle gradient overlay for unread notifications */}
                      {!notification.isRead && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 pointer-events-none"></div>
                      )}
                      
                      <div className="relative flex items-start gap-3">
                        {/* Profile Picture */}
                        <div className="relative">
                          <img
                            src={
                              notification.sender.profilePicture?.startsWith("http")
                                ? notification.sender.profilePicture
                                : `${API_BASE_URL}${notification.sender.profilePicture}`
                            }
                            alt={notification.sender.username}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-white/20 backdrop-blur-sm rounded-full p-1 border border-white/30">
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link 
                              to={`/profile/${notification.sender?.username}`}
                              className="font-semibold text-white hover:text-purple-300 transition-colors drop-shadow-sm"
                            >
                              {notification.sender.fullName || notification.sender.username}
                            </Link>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full shadow-lg"></div>
                            )}
                          </div>
                          
                          <p className="text-white/80 text-sm mt-1 drop-shadow-sm">
                            {getNotificationText(notification)}
                          </p>

                          <p className="text-white/50 text-xs mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>

                          {/* Follow Button */}
                          {notification.type === "follow" && (
                            <button
                              className={`mt-3 px-4 py-2 text-sm rounded-full transition-all duration-200 backdrop-blur-sm ${
                                notification.sender.isFollowed
                                  ? "bg-white/20 text-white/70 cursor-default border border-white/30"
                                  : "bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg border border-white/30"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!notification.sender.isFollowed) {
                                  handleFollowBack(notification.sender._id);
                                }
                              }}
                            >
                              {notification.sender.isFollowed ? "Following" : "Follow Back"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}