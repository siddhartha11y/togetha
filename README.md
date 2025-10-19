# 🌟 Togetha - Modern Social Media Platform

A full-stack social media application built with React, Node.js, and MongoDB. Experience seamless social interactions with Instagram-like stories, real-time messaging, and beautiful glass morphism UI.

![Togetha Banner](https://via.placeholder.com/1200x400/6366f1/ffffff?text=Togetha+Social+Media+Platform)

## ✨ Features

### 🎭 **Stories & Content**
- **Instagram-like Stories** - Create, view, and interact with 24-hour stories
- **Interactive Story Creation** - Add text, emojis, music, GIFs, and media
- **Story Analytics** - View who saw your stories (like Instagram)
- **Drag & Drop Elements** - Move, resize, and rotate text/emojis in stories
- **Image Zoom & Pan** - Professional photo editing tools

### 💬 **Real-time Communication**
- **Live Messaging** - Instant messaging with Socket.IO
- **Voice & Video Calls** - Integrated calling system with Agora SDK
- **Call History** - Track call duration and history
- **Typing Indicators** - See when someone is typing
- **Message Status** - Read receipts and delivery status

### 🎵 **Rich Media Integration**
- **Music Integration** - Add Spotify/YouTube music to stories
- **GIF Support** - GIPHY integration for animated content
- **Media Upload** - Support for images and videos
- **Emoji Picker** - Comprehensive emoji collection (200+ emojis)

### 🔔 **Smart Notifications**
- **Glass Morphism UI** - Beautiful futuristic notification panel
- **Real-time Updates** - Instant notifications for likes, comments, follows
- **Smart Badges** - Unread count with automatic updates
- **Interactive Actions** - Follow back directly from notifications

### 👥 **Social Features**
- **User Profiles** - Customizable profiles with bio and profile pictures
- **Follow System** - Follow/unfollow users with real-time updates
- **Post Interactions** - Like, comment, and share posts
- **User Search** - Find users and posts with smart search
- **Trending Content** - Discover popular posts and users

### 🎨 **Modern UI/UX**
- **Glass Morphism Design** - Futuristic transparent interfaces
- **Responsive Layout** - Works perfectly on all devices
- **Dark Theme** - Elegant dark mode interface
- **Smooth Animations** - Framer Motion powered transitions
- **Professional Design** - Instagram-inspired clean interface

## 🚀 Tech Stack

### **Frontend**
- **React 18** - Modern React with hooks
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Socket.IO Client** - Real-time communication
- **Agora SDK** - Voice and video calling
- **Zustand** - State management

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Token authentication
- **Multer** - File upload handling
- **bcrypt** - Password hashing

### **APIs & Services**
- **Spotify API** - Music integration
- **YouTube API** - Video and music content
- **GIPHY API** - GIF integration
- **Agora.io** - Voice and video calling
- **MongoDB Atlas** - Cloud database

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Spotify Developer account
- YouTube API key
- Agora.io account

### 1. Clone the repository
```bash
git clone https://github.com/siddhartha11y/togetha.git
cd togetha
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

Create `.env` files in both backend and frontend directories:

**Backend `.env`:**
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=production
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173

# API Keys
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
YOUTUBE_API_KEY=your_youtube_api_key
```

**Frontend `.env`:**
```env
VITE_API_BASE_URL=http://localhost:5000
MODE=development
```

### 4. Start the application
```bash
# From root directory
npm start
```

This will start both frontend and backend servers:
- Frontend: http://localhost:5000 (served by backend)
- Backend API: http://localhost:5000/api

## 🎯 Usage

### Getting Started
1. **Register** - Create your account with email and password
2. **Setup Profile** - Add profile picture and bio
3. **Create Content** - Share posts and stories
4. **Connect** - Follow other users and interact with content
5. **Chat** - Send messages and make voice/video calls

### Story Creation
1. Click **"Create Story"** from sidebar
2. **Upload media** or choose background color
3. **Add elements**:
   - Text with custom fonts and colors
   - Emojis from comprehensive picker
   - Music from Spotify/YouTube
   - GIFs from GIPHY
4. **Edit elements**:
   - Drag to move
   - Resize with handles
   - Rotate with rotation controls
   - Zoom and pan images
5. **Share** your story

### Messaging & Calls
1. **Start Chat** - Click on any user to start messaging
2. **Send Messages** - Type and send instant messages
3. **Voice Call** - Click phone icon for audio call
4. **Video Call** - Click video icon for video call
5. **Call Features**:
   - Mute/unmute
   - Camera on/off
   - End call
   - Call history tracking

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post

### Stories
- `GET /api/stories` - Get all active stories
- `POST /api/stories` - Create new story
- `GET /api/stories/:id` - View specific story
- `GET /api/stories/:id/views` - Get story views
- `DELETE /api/stories/:id` - Delete story

### Messages & Chats
- `GET /api/chats` - Get user chats
- `POST /api/chats/:userId` - Create/get chat
- `GET /api/messages/:chatId` - Get chat messages
- `POST /api/messages/:chatId` - Send message

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read

## 🎨 UI Components

### Glass Morphism Design
- **Notification Modal** - Futuristic glass panel with backdrop blur
- **Story Creator** - Professional editing interface
- **Chat Interface** - Clean messaging design
- **Profile Cards** - Elegant user information display

### Interactive Elements
- **Draggable Components** - Move text and emojis freely
- **Resizable Handles** - Adjust element sizes
- **Rotation Controls** - Rotate elements with precision
- **Zoom Controls** - Professional image editing

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt encryption
- **Input Validation** - Server-side validation
- **CORS Protection** - Cross-origin request security
- **Environment Variables** - Secure credential storage

## 📱 Responsive Design

- **Mobile First** - Optimized for mobile devices
- **Tablet Support** - Perfect tablet experience
- **Desktop Layout** - Full desktop functionality
- **Cross-browser** - Works on all modern browsers

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Configure proper CORS origins
- Set secure JWT secret

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Siddhartha Jaiswar**
- GitHub: [@siddhartha11y](https://github.com/siddhartha11y)
- Email: siddharthjaiswar30495@gmail.com

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Framer Motion** - For smooth animations
- **Socket.IO** - For real-time communication
- **Agora.io** - For voice and video calling
- **MongoDB** - For the flexible database
- **Spotify & YouTube** - For music integration APIs

## 📸 Screenshots

### Homepage
![Homepage](https://via.placeholder.com/800x600/1f2937/ffffff?text=Homepage+with+Stories+and+Feed)

### Story Creation
![Story Creator](https://via.placeholder.com/800x600/6366f1/ffffff?text=Interactive+Story+Creator)

### Messaging
![Chat Interface](https://via.placeholder.com/800x600/059669/ffffff?text=Real-time+Messaging)

### Notifications
![Notifications](https://via.placeholder.com/800x600/7c3aed/ffffff?text=Glass+Morphism+Notifications)

---

⭐ **Star this repository if you found it helpful!**

🐛 **Found a bug?** [Open an issue](https://github.com/siddhartha11y/togetha/issues)

💡 **Have a feature request?** [Start a discussion](https://github.com/siddhartha11y/togetha/discussions)