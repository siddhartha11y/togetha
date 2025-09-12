import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFire, FaClock, FaCalendarAlt, FaChartLine } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import api from "../api/axios";
import Post from "../components/Post";
import { toast } from "react-toastify";

export default function ExplorePage() {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/auth/profile", { withCredentials: true });
        setCurrentUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  // Fetch trending posts
  useEffect(() => {
    const fetchTrendingPosts = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/posts/trending/posts?timeframe=${timeframe}&limit=20`, {
          withCredentials: true,
        });
        setTrendingPosts(res.data);
      } catch (err) {
        console.error("Error fetching trending posts:", err);
        toast.error("Failed to load trending posts");
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingPosts();
  }, [timeframe]);

  const timeframeOptions = [
    { value: 'day', label: 'Today', icon: FaClock },
    { value: 'week', label: 'This Week', icon: FaChartLine },
    { value: 'month', label: 'This Month', icon: FaCalendarAlt },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50"
      >
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <HiSparkles className="text-3xl text-yellow-400" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <FaFire className="text-3xl text-orange-500 opacity-60" />
                </motion.div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text">
                  Explore
                </h1>
                <p className="text-gray-400 text-sm font-medium">
                  Discover trending posts and popular content
                </p>
              </div>
            </motion.div>

            {/* Timeframe Selector */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex bg-gray-800/50 rounded-2xl p-1 border border-gray-700/50"
            >
              {timeframeOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTimeframe(option.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      timeframe === option.value
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <IconComponent size={16} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/30"
              >
                <div className="animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/6"></div>
                    </div>
                  </div>
                  <div className="h-64 bg-gray-700 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : trendingPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
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
              className="text-6xl mb-6 inline-block"
            >
              🔍
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-300 mb-2">No Trending Posts</h3>
            <p className="text-gray-500 text-lg">
              No posts are trending in the selected timeframe. Check back later!
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <AnimatePresence>
              {trendingPosts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.95 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  className="relative"
                >
                  {/* Trending Badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="absolute top-4 right-4 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg"
                  >
                    <FaFire size={12} />
                    #{index + 1} Trending
                  </motion.div>

                  {/* Trending Score */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                    className="absolute top-4 left-4 z-10 bg-purple-600/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                  >
                    <HiSparkles size={12} />
                    {post.likesCount} likes • {post.commentsCount} comments
                  </motion.div>

                  <Post post={post} currentUser={currentUser} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}