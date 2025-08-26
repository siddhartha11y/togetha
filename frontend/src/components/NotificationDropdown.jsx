// src/components/NotificationsDropdown.jsx
import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/api/notifications", {
          withCredentials: true,
        });
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n) => !n.isRead).length);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifications();
  }, []);

  // Close if clicked outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Mark as read
  const markAsRead = async (id) => {
    try {
      await api.put(
        `/api/notifications/${id}/read`,
        {},
        { withCredentials: true }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleFollowBack = async (userId) => {
    try {
      await api.put(
        `/api/auth/${userId}/follow`,
        {},
        { withCredentials: true }
      );

      // ✅ update sender.isFollowed to true, so button changes text
      setNotifications((prev) =>
        prev.map((n) =>
          n.sender._id === userId
            ? { ...n, sender: { ...n.sender, isFollowed: true } }
            : n
        )
      );
    } catch (err) {
      console.error("Error following back:", err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="relative cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <Bell size={24} className="text-gray-300 hover:text-purple-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </motion.div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-gray-900 rounded-lg shadow-lg p-3 z-50"
          >
            <h3 className="text-sm font-semibold text-purple-400 border-b border-gray-700 pb-2 mb-2">
              Notifications
            </h3>

            {notifications.length === 0 ? (
              <p className="text-gray-400 text-sm">No notifications</p>
            ) : (
              <ul
                className="max-h-64 overflow-y-auto space-y-2 pr-2"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {notifications.map((n) => (
                  <li
                    key={n._id}
                    className={`flex items-start space-x-3 p-2 rounded cursor-pointer ${
                      n.isRead ? "bg-gray-800/50" : "bg-gray-800"
                    } hover:bg-gray-700`}
                    onClick={() => markAsRead(n._id)}
                  >
                    {/* ✅ Sender profile picture */}
                    <img
                      src={
                        n.sender.profilePicture?.startsWith("http")
                          ? n.sender.profilePicture
                          : `${API_BASE_URL}${n.sender.profilePicture}`
                      }
                      alt={n.sender.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />

                    {/* ✅ Content wrapper */}
                    <div className="flex-1 flex flex-col">
                      <p className="text-sm text-gray-200">
                        <Link to={`/profile/${n.sender?.username}`}>
                          <strong>{n.sender.username}</strong>{" "}
                        </Link>
                        {n.type === "like" && "liked your post"}
                        {n.type === "comment" && "commented on your post"}
                        {n.type === "follow" && "started following you"}
                      </p>

                      {/* ✅ Follow button always aligned left */}
                      {n.type === "follow" && (
                        <div className="mt-1">
                          <button
                            className={`px-2 py-0.5 text-xs rounded-full transition-colors
            ${
              n.sender.isFollowed
                ? "bg-gray-700 text-gray-300 cursor-default"
                : "bg-purple-500 hover:bg-purple-600 text-white"
            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!n.sender.isFollowed) {
                                handleFollowBack(n.sender._id);
                              }
                            }}
                          >
                            {n.sender.isFollowed ? "Following" : "Follow Back"}
                          </button>
                        </div>
                      )}

                      <span className="text-xs text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Hide scrollbar but keep scrolling */}
      <style jsx>{`
        ul::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
