import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios"; 
import ChatBox from "../components/ChatBox";
import useUserStore from "../store/userStore";
import socketService from "../socket";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { Home } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatPage() {
  const { chatId } = useParams();
  const [chat, setChat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const { user, loadUserFromCookie } = useUserStore();
  const navigate = useNavigate();

  // Load user from cookie first
  useEffect(() => {
    const initUser = async () => {
      try {
        loadUserFromCookie();
        // Also try to fetch fresh user data from API
        const response = await api.get("/auth/profile");
        if (response.data) {
          // User is authenticated, continue
        }
      } catch (error) {
        console.error("User not authenticated:", error);
        navigate("/login");
        return;
      } finally {
        setUserLoading(false);
      }
    };
    
    initUser();
  }, [loadUserFromCookie, navigate]);

  // Initialize socket connection
  useEffect(() => {
    if (user && !socketService.isSocketConnected()) {
      socketService.connect(user);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchChat = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get(`/chats/${chatId}`);
        setChat(data);
      } catch (err) {
        console.error("Error fetching chat:", err);
        toast.error("Chat not found");
        navigate("/messages");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChat();
  }, [chatId, user, navigate]);

  if (userLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-16">
      <Navbar />
      <div className="h-[calc(100vh-64px)]">
        <ChatBox user={user} selectedChat={chat} />
      </div>
    </div>
  );
}
