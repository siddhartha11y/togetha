// src/components/ChatBox.jsx
import { useEffect, useState, useRef } from "react";
import api from "../api/axios"; // axios instance with auth headers
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // adjust backend URL

export default function ChatBox({ selectedChat, user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat?._id) return;

    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/api/messages/${selectedChat._id}`);
        setMessages(data);
        socket.emit("join chat", selectedChat._id);
      } catch (err) {
        console.error("Error fetching messages", err);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  // Socket listeners
  useEffect(() => {
    socket.on("message received", (msg) => {
      if (msg.chat._id === selectedChat._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("message received");
    };
  }, [selectedChat]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { data } = await api.post("/api/messages", {
        chatId: selectedChat._id,
        content: newMessage,
      });

      setMessages((prev) => [...prev, data]);
      socket.emit("new message", data); // notify others
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full border-l">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`p-2 rounded-xl max-w-xs ${
              msg.sender._id === user._id
                ? "bg-blue-500 text-white self-end ml-auto"
                : "bg-gray-200 text-black"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="p-3 border-t flex items-center space-x-2"
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded-lg p-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </form>
    </div>
  );
}
