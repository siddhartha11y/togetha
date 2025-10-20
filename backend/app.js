import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import musicRoutes from "./routes/musicRoutes.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON & form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware (allow cookies from frontend)
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:5178",
    ],
    credentials: true,
  })
);

// Cookie parser
app.use(cookieParser());

// Serve uploaded images statically at /images URL prefix
// So that requests to /images/uploads/filename.jpg serve files from public/images/uploads/
app.use("/images", express.static(path.join(process.cwd(), "public/images")));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// API Routes - MUST come before static file serving
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/music", musicRoutes);

// Serve frontend static files AFTER API routes
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// start server with socket.io
const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io instance available to routes
app.set("io", io);

// SOCKET.IO LOGIC
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  // Join a personal room (userId)
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.userId = userData._id; // Store user ID on socket
    console.log("✅ User joined room:", userData._id);
    socket.emit("connected");
  });

  // Join a chat room
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log("✅ User joined chat:", chatId);
  });

  // Send message
  socket.on("send_message", (newMessage) => {
    console.log("📤 Message sent:", newMessage);
    const chat = newMessage.chat;

    if (!chat?.participants) {
      console.log("❌ No participants found in chat");
      return;
    }

    // Emit to all participants except sender
    chat.participants.forEach((user) => {
      if (user._id.toString() !== newMessage.sender._id.toString()) {
        console.log("📨 Sending message to user:", user._id);
        // Send to both user room and chat room
        socket.to(user._id).emit("message_received", newMessage);
        socket.to(chat._id).emit("message_received", newMessage);
      }
    });
  });

  // Typing indicators
  socket.on("typing", (chatId) => {
    console.log("⌨️ User typing in chat:", chatId);
    socket.to(chatId).emit("typing", chatId);
  });

  socket.on("stop_typing", (chatId) => {
    console.log("⌨️ User stopped typing in chat:", chatId);
    socket.to(chatId).emit("stop_typing", chatId);
  });

  // Call events
  socket.on("initiate_call", (callData) => {
    console.log("📞 Call initiated:", callData);
    const { chatId, callType, caller, recipient } = callData;

    // Send call notification to recipient
    socket.to(recipient._id).emit("incoming_call", {
      chatId,
      callType,
      caller,
      callId: socket.id + Date.now(),
    });
  });

  socket.on("accept_call", (callData) => {
    console.log("✅ Call accepted:", callData);
    const { callId, chatId, accepter } = callData;

    // Notify caller that call was accepted
    socket.to(chatId).emit("call_accepted", {
      callId,
      accepter,
    });

    // Also notify the chat room for history
    io.to(chatId).emit("call_status_update", {
      status: "accepted",
      chatId: chatId,
      callType: callData.callType,
    });
  });

  socket.on("reject_call", (callData) => {
    console.log("❌ Call rejected:", callData);
    const { callId, chatId, rejector } = callData;

    // Notify caller that call was rejected
    socket.to(chatId).emit("call_rejected", {
      callId,
      rejector,
    });

    // Also notify the chat room for history
    io.to(chatId).emit("call_status_update", {
      status: "rejected",
      chatId: chatId,
      callType: callData.callType,
    });
  });

  socket.on("end_call", (callData) => {
    console.log("📞 Call ended:", callData);
    const { chatId, user } = callData;

    // Notify other participants that call ended
    socket.to(chatId).emit("call_ended", {
      endedBy: user,
    });
  });

  socket.on("call_connected", (callData) => {
    console.log("🔗 Call connected:", callData);
    const { chatId, callType } = callData;

    // Notify all participants that call is now connected (for timer sync)
    io.to(chatId).emit("call_connected", {
      chatId,
      callType,
      status: "connected",
    });
  });

  // Add call history to chat
  socket.on("add_call_history", async (callData) => {
    console.log("📝 Adding call history:", callData);
    try {
      // Create a system message for call history
      const callMessage = {
        sender: socket.userId,
        content: `${
          callData.callType === "audio" ? "📞" : "📹"
        } Call (${Math.floor(callData.duration / 60)}:${(callData.duration % 60)
          .toString()
          .padStart(2, "0")})`,
        chat: callData.chatId,
        isSystemMessage: true,
        callInfo: {
          type: callData.callType,
          duration: callData.duration,
        },
      };

      // Broadcast to chat room
      io.to(callData.chatId).emit("message_received", callMessage);
    } catch (error) {
      console.error("Error adding call history:", error);
    }
  });

  // WebRTC signaling events
  socket.on("offer", (data) => {
    console.log("📡 WebRTC offer:", data.chatId);
    socket.to(data.chatId).emit("offer", data);
  });

  socket.on("answer", (data) => {
    console.log("📡 WebRTC answer:", data.chatId);
    socket.to(data.chatId).emit("answer", data);
  });

  socket.on("ice-candidate", (data) => {
    console.log("📡 ICE candidate:", data.chatId);
    socket.to(data.chatId).emit("ice-candidate", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server + Socket.io running on port ${PORT}`);
});

export default app;
