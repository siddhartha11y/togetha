import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Feed from "../components/Feed";
import StoriesCarousel from "../components/StoriesCarousel";
import api from "../api/axios";

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRes = await api.get("/api/auth/profile", { withCredentials: true });
        setCurrentUser(userRes.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="bg-black min-h-screen font-sans text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen font-sans text-white">
      <Navbar />
      <div className="flex">
        <Sidebar user={currentUser} />
        <div className="ml-[256px] pt-[64px] flex-grow">
          <div className="max-w-2xl mx-auto">
            {/* Stories Carousel */}
            {currentUser && <StoriesCarousel user={currentUser} />}
            
            {/* Feed */}
            <Feed />
          </div>
        </div>
      </div>
    </div>
  );
}
