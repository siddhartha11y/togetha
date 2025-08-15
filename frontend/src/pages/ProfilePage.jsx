import { useState, useEffect, useRef } from "react";
import { FiSettings } from "react-icons/fi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Images, Clapperboard, Bookmark } from "lucide-react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import { toast } from "react-toastify"; // ✅ correct

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const toastShownRef = useRef(false);
  useEffect(() => {
    if (location.state?.showSuccessToast && !toastShownRef.current) {
      toastShownRef.current = true; // Mark toast as shown
      toast.success("Profile updated successfully!");
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/auth/profile");
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  if (!user)
    return <div className="text-center mt-10 text-white">Loading...</div>;

  return (
    <div className="bg-black text-white min-h-screen flex">
      {/* Sidebar */}
      <div className="hidden md:block border-r border-gray-800 w-64">
        <Sidebar />
      </div>

      {/* Main profile section */}
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-5xl px-4 mt-8">
          {/* Profile header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-16">
            <div className="flex justify-center sm:justify-start">
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-36 h-36 rounded-full object-cover border border-gray-500"
              />
            </div>

            <div className="flex-1 mt-6 sm:mt-0">
              <div className="flex items-center space-x-4 mb-4">
                <h2 className="text-2xl">{user.username}</h2>
                <button
                  onClick={() => navigate("/edit-profile")}
                  className="px-4 py-1 border rounded-md border-gray-500 hover:bg-gray-800 transition"
                >
                  Edit profile
                </button>
                <FiSettings className="text-xl cursor-pointer" />
              </div>

              <div className="flex space-x-8 mb-4 text-sm">
                <span>
                  <b>{user.posts?.length || 0}</b> posts
                </span>
                <span>
                  <b>120</b> followers
                </span>
                <span>
                  <b>200</b> following
                </span>
              </div>

              <div className="text-sm">
                <p className="font-semibold">{user.fullName || "Full Name"}</p>
                <p>{user.bio || "No bio yet"}</p>
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400"
                  >
                    {user.website}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Story highlights */}
          <div className="flex space-x-6 mt-10 border-t border-gray-800 pt-6">
            {["Highlight 1", "Highlight 2", "Highlight 3"].map((title, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border border-gray-500 flex items-center justify-center text-gray-400">
                  +
                </div>
                <span className="text-xs mt-1">{title}</span>
              </div>
            ))}
          </div>

          {/* Post type icons */}
          <div className="flex justify-center space-x-12 mt-8 border-t border-gray-800 pt-4 text-gray-400">
            <button className="flex items-center space-x-1 hover:text-white">
              <Images size={20} />{" "}
              <span className="hidden sm:inline">POSTS</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-white">
              <Clapperboard size={20} />{" "}
              <span className="hidden sm:inline">REELS</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-white">
              <Bookmark size={20} />{" "}
              <span className="hidden sm:inline">SAVED</span>
            </button>
          </div>

          {/* Posts grid */}
          <div className="grid grid-cols-3 gap-1 mt-2">
            {user.posts?.map((post) => (
              <Link to={`/post/${post._id}`} key={post._id}>
                <div className="aspect-square overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover hover:opacity-80 transition"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
