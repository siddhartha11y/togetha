import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import api from "../api/axios";
import NotificationModal from "./NotificationModal";
import MessageNotification from "./MessageNotification";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchType, setSearchType] = useState("users"); // "users" or "posts"
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // 🔹 Fetch logged-in user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile", { withCredentials: true });
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };
    fetchProfile();
  }, []);

  // 🔹 Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get("/notifications", { withCredentials: true });
        const unread = res.data.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchUnreadCount();
  }, []);

  // 🔹 Logout
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // 🔹 Close search if clicked outside
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setQuery("");
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 🔹 Fetch users by query
  useEffect(() => {
  const fetchResults = async () => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }
    try {
      setLoading(true);
      const endpoint =
        searchType === "users"
          ? `/auth/search?q=${query}`
          : `/posts/search?q=${query}`;
      const res = await api.get(endpoint, { withCredentials: true });
      setResults(res.data);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };
  const delayDebounce = setTimeout(fetchResults, 400);
  return () => clearTimeout(delayDebounce);
}, [query, searchType]);


  // 🔹 Follow/Unfollow
  const toggleFollow = async (id, isFollowing) => {
    try {
      if (isFollowing) {
        await api.put(`/auth/${id}/unfollow`, {}, { withCredentials: true });
        setResults((prev) =>
          prev.map((u) => (u._id === id ? { ...u, isFollowing: false } : u))
        );
      } else {
        await api.put(`/auth/${id}/follow`, {}, { withCredentials: true });
        setResults((prev) =>
          prev.map((u) => (u._id === id ? { ...u, isFollowing: true } : u))
        );
      }
    } catch (err) {
      console.error("Follow/Unfollow failed:", err);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-black/80 backdrop-blur-md text-white shadow-lg z-50 pl-[256px] h-[64px] flex items-center justify-between px-4 border-b border-gray-800">
      {/* Logo */}
      <motion.h1
        className="text-3xl font-extrabold text-purple-400 tracking-wide cursor-pointer"
        whileHover={{ scale: 1.05, textShadow: "0 0 15px #6C63FF" }}
        onClick={() => navigate("/home")}
      >
        togetha
      </motion.h1>

      <div className="flex items-center gap-4">
        {/* 🔍 Search */}
        <div className="relative" ref={searchRef}>
          <FiSearch
            className="text-2xl cursor-pointer"
            onClick={() => setSearchOpen(!searchOpen)}
          />

          {searchOpen && (
  <div className="absolute right-0 mt-2 w-80 bg-gray-900 rounded-lg shadow-lg p-3 z-50">
    <input
      type="text"
      placeholder={`Search ${searchType}...`}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="w-full px-3 py-2 rounded bg-gray-800 text-white focus:outline-none"
    />

    {/* Toggle Buttons */}
    <div className="flex gap-2 mt-2">
      <button
        className={`px-3 py-1 text-xs rounded-full ${
          searchType === "users"
            ? "bg-purple-600 text-white"
            : "bg-gray-700 text-gray-300"
        }`}
        onClick={() => setSearchType("users")}
      >
        Users
      </button>
      <button
        className={`px-3 py-1 text-xs rounded-full ${
          searchType === "posts"
            ? "bg-purple-600 text-white"
            : "bg-gray-700 text-gray-300"
        }`}
        onClick={() => setSearchType("posts")}
      >
        Posts
      </button>
    </div>

    {loading && <p className="text-gray-400 text-sm mt-2">Searching...</p>}

    {/* Results */}
    <ul className="mt-2 max-h-64 overflow-y-auto">
      {results.length > 0 ? (
        searchType === "users" ? (
          results.map((u) => (
            <li
              key={u._id}
              className="flex items-center justify-between gap-3 p-2 hover:bg-gray-800 rounded"
            >
              {/* Profile info */}
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => {
                  navigate(`/profile/${u.username}`);
                  setSearchOpen(false);
                  setQuery("");
                  setResults([]);
                }}
              >
                <img
                  src={u.profilePicture || "/avatar.png"}
                  alt={u.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold">{u.username}</p>
                  <p className="text-xs text-gray-400">{u.fullName || ""}</p>
                </div>
              </div>

              {/* Follow button */}
              {u._id !== user?._id && (
                <button
                  onClick={() => toggleFollow(u._id, u.isFollowing)}
                  className={`px-3 py-1 text-xs rounded-full ${
                    u.isFollowing
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                >
                  {u.isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
            </li>
          ))
        ) : (
          results.map((post) => (
            <li
              key={post._id}
              className="p-2 hover:bg-gray-800 rounded cursor-pointer"
              onClick={() => {
                navigate(`/post/${post._id}`);
                setSearchOpen(false);
                setQuery("");
                setResults([]);
              }}
            >
              <p className="text-sm text-gray-300">{post.title}</p>
              <span className="text-xs text-gray-500">
                by {post.author.username}
              </span>
            </li>
          ))
        )
      ) : (
        query &&
        !loading && (
          <p className="text-gray-400 text-sm mt-2">
            No {searchType} found
          </p>
        )
      )}
    </ul>
  </div>
)}

        </div>

        {/* Notifications */}
        <motion.div 
          whileHover={{ scale: 1.1 }}
          className="relative cursor-pointer"
          onClick={() => setShowNotificationModal(true)}
        >
          <div className="p-2 rounded-full hover:bg-gray-800 transition-colors">
            <Bell size={24} className="text-gray-300 hover:text-purple-400" />
          </div>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </motion.div>

             {/* 💬 Messages */}
        <MessageNotification />
        {/* Profile */}
        <motion.div whileHover={{ scale: 1.05 }}>
          <Link
            to="/profile"
            className="flex items-center gap-2 text-gray-300 hover:text-purple-400 transition-all duration-300"
          >
            {user?.profilePicture ? (
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}${user.profilePicture}`}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover border border-gray-700  transition-transform duration-200 ease-in-out 
             hover:scale-110 hover:text-purple-400 
             hover:drop-shadow-[0_0_6px_#c084fc]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <span className="hidden sm:inline font-medium  transition-transform duration-200 ease-in-out 
             hover:scale-110 hover:text-purple-400 
             hover:drop-shadow-[0_0_6px_#c084fc]">Profile</span>
          </Link>
        </motion.div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-300 hover:text-red-400 transition-all duration-300"
        >
          <LogOut size={20} />
          <span className="hidden sm:inline font-medium">Logout</span>
        </motion.button>
      </div>

      {/* Notification Modal */}
      <NotificationModal 
        isOpen={showNotificationModal} 
        onClose={() => {
          setShowNotificationModal(false);
          // Refresh unread count after closing modal
          const fetchUnreadCount = async () => {
            try {
              const res = await api.get("/notifications", { withCredentials: true });
              const unread = res.data.filter(n => !n.isRead).length;
              setUnreadCount(unread);
            } catch (err) {
              console.error("Error fetching notifications:", err);
            }
          };
          fetchUnreadCount();
        }} 
      />
    </nav>
  );
}
