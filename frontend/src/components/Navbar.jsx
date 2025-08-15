import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/auth/profile", { withCredentials: true });
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };
    fetchProfile();
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full bg-black/80 backdrop-blur-md text-white shadow-lg z-50 pl-[256px] h-[64px] flex items-center justify-between px-4 border-b border-gray-800">
      <motion.h1
        className="text-3xl font-extrabold text-purple-400 tracking-wide cursor-pointer"
        whileHover={{ scale: 1.05, textShadow: "0 0 15px #6C63FF" }}
      >
        Socia
      </motion.h1>

      <div className="flex items-center gap-4">
        <motion.div whileHover={{ scale: 1.05 }}>
          <Link
            to="/create-post"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 hover:shadow-[0_0_15px_#6C63FF] transition-all duration-300"
          >
            <PlusCircle size={20} /> Create
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Link
            to="/profile"
            className="flex items-center gap-2 text-gray-300 hover:text-purple-400 transition-all duration-300"
          >
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover border border-gray-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <span className="hidden sm:inline font-medium">Profile</span>
          </Link>
        </motion.div>
      </div>
    </nav>
  );
}
