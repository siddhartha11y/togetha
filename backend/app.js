import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
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

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// 404 fallback
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../frontend/dist/404.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
