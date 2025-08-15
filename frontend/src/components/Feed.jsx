import { useEffect, useState } from "react";
import { FaRegHeart, FaRegComment, FaRegPaperPlane } from "react-icons/fa";
import api from "../api/axios";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get("/api/posts", { withCredentials: true });
        setPosts(res.data);
        console.log("Posts fetched successfully:", res.data);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <p className="text-center mt-10 text-gray-300">Loading posts...</p>;
  }

  if (posts.length === 0) {
    return <p className="text-center mt-10 text-gray-300">No posts yet.</p>;
  }

  return (
    <div className="w-full max-w-lg space-y-8 pt-7">
      {posts.map((post) => (
        <div
          key={post._id}
          className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-md hover:shadow-[0_0_25px_#6C63FF] transition-all duration-300"
        >
          {/* Post Header */}
          <div className="flex items-center gap-3 p-3 font-semibold text-purple-400 border-b border-gray-800">
            {post.author?.profilePicture ? (
              <img
                src={post.author.profilePicture}
                alt={post.author.username}
                className="w-10 h-10 rounded-full object-cover border border-gray-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                {post.author?.username?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <span>{post.author?.username || "Unknown"}</span>
          </div>

          {/* Post Image */}
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt="Post"
              className="w-full max-h-[500px] object-cover"
              loading="lazy"
            />
          )}

          {/* Post Actions */}
          <div className="flex items-center gap-4 px-4 py-3 text-xl border-b border-gray-800">
            <FaRegHeart className="cursor-pointer hover:text-red-500 transition" />
            <FaRegComment className="cursor-pointer hover:text-blue-500 transition" />
            <FaRegPaperPlane className="cursor-pointer hover:text-green-500 transition" />
          </div>

          {/* Post Caption */}
          <div className="px-4 py-3">
            <p className="text-sm text-gray-300">
              <span className="font-semibold text-purple-300 mr-1">
                {post.author?.username || "Unknown"}
              </span>
              {post.caption || post.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
