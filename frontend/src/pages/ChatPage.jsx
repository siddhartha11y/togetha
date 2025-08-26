import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios"; 
import ChatBox from "../components/ChatBox";

export default function ChatPage() {
  const { chatId } = useParams(); // /chats/:chatId route
  const [user, setUser] = useState(null);
  const [chat, setChat] = useState(null);

  useEffect(() => {
    async function fetchData() {
      // ✅ get current logged-in user (from cookies via backend)
      const userRes = await api.get("/api/auth/profile", { withCredentials: true });
      setUser(userRes.data);

      // ✅ get chat info
      const chatRes = await api.get(`/api/chats/${chatId}`, { withCredentials: true });
      setChat(chatRes.data);
    }

    fetchData();
  }, [chatId]);

  if (!user || !chat) return <p>Loading chat...</p>;

  return <ChatBox user={user} chat={chat} />;
}
