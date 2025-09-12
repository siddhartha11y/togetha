import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import socketService from "../socket";
import useUserStore from "../store/userStore";

export default function MessageNotification() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useUserStore();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    const handleMessageReceived = (message) => {
      // Only count if message is not from current user
      if (message.sender._id !== user._id) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on("message_received", handleMessageReceived);

    return () => {
      socket.off("message_received", handleMessageReceived);
    };
  }, [user]);

  // Reset count when user visits messages page
  useEffect(() => {
    const resetCount = () => setUnreadCount(0);

    // Listen for navigation to messages page
    if (window.location.pathname === "/messages") {
      resetCount();
    }

    // Listen for route changes
    window.addEventListener("popstate", () => {
      if (window.location.pathname === "/messages") {
        resetCount();
      }
    });

    return () => {
      window.removeEventListener("popstate", resetCount);
    };
  }, []);

  return (
    <motion.div whileHover={{ scale: 1.1 }} className="relative">
      <Link
        to="/messages"
        className="text-gray-300 hover:text-purple-400 transition-all duration-300"
        onClick={() => setUnreadCount(0)}
      >
        <MessageCircle size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>
    </motion.div>
  );
}
