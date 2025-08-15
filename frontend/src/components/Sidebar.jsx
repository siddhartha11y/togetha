import { Link, useLocation } from "react-router-dom";
import { UserCircle, Users, PlusCircle, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar() {
  const location = useLocation();

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

    { to: "/create-post", icon: <PlusCircle size={22} />, label: "Create Post" },
    { to: "/friends", icon: <Users size={22} />, label: "Friends" },
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
            <Link
              to={link.to}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-600 hover:shadow-[0_0_15px_#6C63FF] transition-all duration-300 text-white"
            >
              {link.icon}
              <span className="font-medium">{link.label}</span>
            </Link>
          </motion.div>
        ))}
      </nav>
    </aside>
  );
}
