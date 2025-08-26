import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from "http";             // ⬅ new
import { Server } from "socket.io";  // ⬅ new
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON & form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware (allow cookies from frontend)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Cookie parser
app.use(cookieParser());


// Serve your frontend build files (React/Vue/Angular/etc) at root URL
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Serve uploaded images statically at /images URL prefix
// So that requests to /images/uploads/filename.jpg serve files from public/images/uploads/
app.use(
  '/images',
  express.static(path.join(process.cwd(), 'public/images'))
);
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);


// start server with socket.io
const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 60000, // close idle sockets
  cors: {
    origin: process.env.CLIENT_URL || "*", // your React frontend URL
  },
});

// SOCKET.IO LOGIC
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  // Join a personal room (userId)
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log("User joined room:", userData._id);
    socket.emit("connected");
  });

  // Join a chat room
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log("User joined chat:", chatId);
  });

  // Send message
  socket.on("send_message", (newMessage) => {
    const chat = newMessage.chat;
    if (!chat?.participants) return;

    chat.participants.forEach((user) => {
      if (user._id.toString() === newMessage.sender._id.toString()) return;
      socket.in(user._id).emit("message_received", newMessage);
    });
  });

  // Typing indicators
  socket.on("typing", (chatId) => socket.in(chatId).emit("typing", chatId));
  socket.on("stop_typing", (chatId) => socket.in(chatId).emit("stop_typing", chatId));

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});


// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// 404 fallback
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../frontend/dist/404.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server + Socket.io running on port ${PORT}`);
});

export default app;
