import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";
import Post from "../components/Post";
import Navbar from "../components/Navbar";

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user and post data in parallel
        const [userRes, postRes] = await Promise.all([
          api.get("/auth/profile", { withCredentials: true }),
          api.get(`/posts/${id}`, { withCredentials: true })
        ]);
        
        setCurrentUser(userRes.data);
        setPost(postRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load post");
        navigate("/home");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96 text-gray-400">
          <h2 className="text-xl font-semibold mb-2">Post not found</h2>
          <p className="text-gray-500 mb-4">The post you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/home")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Home size={20} />
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </motion.button>
            <h1 className="text-white text-lg font-semibold">Post</h1>
          </div>
        </div>
      </div>

      {/* Post content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Post post={post} currentUser={currentUser} />
        </motion.div>
      </div>
    </div>
  );
}

