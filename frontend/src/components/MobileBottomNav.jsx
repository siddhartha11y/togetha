import { Link, useLocation } from "react-router-dom";
import { Home, MessageCircle, Compass, UserCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function MobileBottomNav() {
  const location = useLocation();

  const navItems = [
    { to: "/home", icon: Home, label: "Home" },
    { to: "/messages", icon: MessageCircle, label: "Messages" },
    { to: "/explore", icon: Compass, label: "Explore" },
    { to: "/profile", icon: UserCircle, label: "Profile" },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-gray-800 z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          
          return (
            <Link key={item.to} to={item.to}>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  isActive 
                    ? "text-purple-400" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}