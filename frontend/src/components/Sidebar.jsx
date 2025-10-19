import { Link, useLocation } from "react-router-dom";
import { UserCircle, Users, PlusCircle, Home, MessageCircle, Camera, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import InstagramStoryCreator from "./InstagramStoryCreator";
import CreatePostModal from "./CreatePostModal";

export default function Sidebar({ user }) {
  const location = useLocation();
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  // Dynamic links depending on current route
  const links = [
    // Show Home link only when not on homepage
    ...(location.pathname !== "/home"
      ? [{ to: "/home", icon: <Home size={22} />, label: "Home" }]
      : []),

    // Show Profile link only when not on profile page
    ...(location.pathname !== "/profile"
      ? [{ to: "/profile", icon: <UserCircle size={22} />, label: "My Profile" }]
      : []),

    { action: () => setShowCreatePostModal(true), icon: <PlusCircle size={22} />, label: "Create Post" },
    { action: () => setShowCreateStoryModal(true), icon: <Camera size={22} />, label: "Create Story" },
    { to: "/explore", icon: <Compass size={22} />, label: "Explore" },
    { to: "/messages", icon: <MessageCircle size={22} />, label: "Messages" },
  ];

  return (
    <aside className="w-64 bg-black border-r border-gray-800 p-4 h-[calc(100vh-64px)] fixed left-0 top-[64px]">
      <nav className="flex flex-col gap-2">
        {links.map((link, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05, x: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {link.to ? (
              <Link
                to={link.to}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-600 hover:shadow-[0_0_15px_#6C63FF] transition-all duration-300 text-white"
              >
                {link.icon}
                <span className="font-medium">{link.label}</span>
              </Link>
            ) : (
              <button
                onClick={link.action}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-600 hover:shadow-[0_0_15px_#6C63FF] transition-all duration-300 text-white w-full text-left"
              >
                {link.icon}
                <span className="font-medium">{link.label}</span>
              </button>
            )}
          </motion.div>
        ))}
      </nav>

      {/* Create Story Modal */}
      <AnimatePresence>
        {showCreateStoryModal && (
          <InstagramStoryCreator
            user={user}
            onClose={() => setShowCreateStoryModal(false)}
            onStoryCreated={() => {
              setShowCreateStoryModal(false);
              // Optionally refresh stories or show success message
            }}
          />
        )}
      </AnimatePresence>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePostModal && (
          <CreatePostModal
            user={user}
            onClose={() => setShowCreatePostModal(false)}
            onPostCreated={() => {
              setShowCreatePostModal(false);
              // Optionally refresh the feed or show success message
              window.location.reload(); // Simple refresh for now
            }}
          />
        )}
      </AnimatePresence>
    </aside>
  );
}
