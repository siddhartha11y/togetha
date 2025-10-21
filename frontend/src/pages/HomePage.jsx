import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Feed from "../components/Feed";
import StoriesCarousel from "../components/StoriesCarousel";
import MobileBottomNav from "../components/MobileBottomNav";
import api from "../api/axios";

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRes = await api.get("/auth/profile", { withCredentials: true });
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
        <Sidebar 
          user={currentUser} 
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="lg:ml-[256px] pt-[64px] flex-grow pb-16 lg:pb-0">
          <div className="max-w-2xl mx-auto px-2 lg:px-4">
            {/* Stories Carousel */}
            {currentUser && (
              <div className="mb-4 lg:mb-6">
                <StoriesCarousel user={currentUser} />
              </div>
            )}
            
            {/* Feed */}
            <Feed />
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
