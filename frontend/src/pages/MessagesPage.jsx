// src/pages/MessagesPage.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios"; // adjust path if different
import ChatBox from "../components/ChatBox";
import useUserStore from "../store/userStore";

export default function MessagesPage() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const { user, clearUser } = useUserStore();

  const location = useLocation();
  const navigate = useNavigate();

  // Extract ?user=ID from query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get("user");

    if (userId) {
      // Backend expects userId in URL param, not body
      api
        .post(`/api/chats/${userId}`)
        .then((res) => {
          setSelectedChat(res.data);
          // remove query param from URL after resolving
          navigate("/messages", { replace: true });
        })
        .catch((err) => console.error("Error accessing chat:", err));
    }
  }, [location.search, navigate]);

  // Load all chats for logged-in user
  useEffect(() => {
    api
      .get("/api/chats")
      .then((res) => {
        console.log("Fetched chats:",res.data);
        setChats(res.data)})
      .catch((err) => console.error("Error fetching chats:", err));
  }, []);

  return (
    <div className="flex h-[calc(100vh-60px)]">
      {/* Sidebar with chats */}
      <div className="w-1/3 border-r border-gray-300 overflow-y-auto">
        <h2 className="p-4 font-bold text-lg border-b">Chats</h2>
        {chats.map((chat) => {
          const otherUsers = chat.participants.filter((u) => u._id !== user._id);
          const chatLabel = chat.isGroup
            ? chat.name || "Unnamed group"
            : otherUsers.map((u) => u.username).join(", ");

          return (
            <div
              key={chat._id}
              onClick={() => setSelectedChat(chat)}
              className={`p-3 cursor-pointer hover:bg-gray-100 ${
                selectedChat?._id === chat._id ? "bg-gray-200" : ""
              }`}
            >
              {chatLabel}
            </div>
          );
        })}
      </div>

      {/* Chat area */}
      <div className="flex-1">
        {selectedChat ? (
          <ChatBox user={user} chat={selectedChat} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
