import { useEffect, useState } from "react";
import api from "../api/axios";
import Post from "./Post";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. get current user from backend (cookie-based auth)
        const userRes = await api.get("/auth/profile", { withCredentials: true });
        setCurrentUser(userRes.data);

        // 2. fetch posts
        const postsRes = await api.get("/posts", { withCredentials: true });
        setPosts(postsRes.data);

        console.log("📊 Feed Debug - User:", userRes.data);
        console.log("📊 Feed Debug - Posts:", postsRes.data);
        console.log("📊 Feed Debug - First post likes:", postsRes.data[0]?.likes, postsRes.data[0]?.likedByUser);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p className="text-center mt-10 text-gray-300">Loading posts...</p>;
  }

  if (posts.length === 0) {
    return <p className="text-center mt-10 text-gray-300">No posts yet.</p>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 lg:space-y-6 pb-4">
      {posts.map((post) => (
        <Post key={post._id} post={post} currentUser={currentUser} />
      ))}
    </div>
  );
}
