# 💬 Messaging System Setup & Testing Guide

## Current Status ✅

Your messaging system is now fully implemented with the following features:

### Backend Features:

- ✅ Chat and Message models with proper relationships
- ✅ Real-time messaging with Socket.io
- ✅ One-to-one chat creation/retrieval
- ✅ Message sending and fetching
- ✅ Typing indicators
- ✅ User authentication for chat access
- ✅ Chat list sorted by recent activity

### Frontend Features:

- ✅ Modern chat interface with real-time updates
- ✅ Message bubbles with timestamps
- ✅ Typing indicators
- ✅ Chat list with last message preview
- ✅ Message button on user profiles
- ✅ Responsive design
- ✅ Error handling and loading states

## Installation & Setup

### 1. Install Missing Dependencies

```bash
# Backend - install socket.io
cd backend
npm install socket.io@^4.7.5

# Frontend dependencies are already installed
cd ../frontend
npm install
```

### 2. Environment Variables

Make sure your backend `.env` file includes:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
PORT=5000
```

### 3. Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Testing the Messaging System

### 1. Create Test Users

1. Register 2 different users (User A and User B)
2. Log in as User A

### 2. Start a Chat

1. Go to User B's profile (`/profile/userB_username`)
2. Click the "Message" button
3. You'll be redirected to `/messages` with the chat opened

### 3. Test Real-time Messaging

1. Send a message as User A
2. Open another browser/incognito window
3. Log in as User B and go to `/messages`
4. You should see the message from User A
5. Reply as User B - User A should see it in real-time

### 4. Test Features

- ✅ **Typing Indicators**: Start typing and see "typing..." appear
- ✅ **Message Timestamps**: Check message times
- ✅ **Chat List**: See conversations sorted by recent activity
- ✅ **Real-time Updates**: Messages appear instantly
- ✅ **Navigation**: Use `/messages` or click Messages in navbar

## API Endpoints

### Chat Routes (`/api/chats`)

- `POST /:userId` - Create or get 1:1 chat with user
- `GET /` - Get all chats for logged-in user
- `GET /:chatId` - Get specific chat by ID
- `POST /group` - Create group chat (future feature)

### Message Routes (`/api/messages`)

- `POST /:chatId` - Send message to chat
- `GET /:chatId` - Get all messages in chat

## Socket.io Events

### Client → Server

- `setup` - Join user's personal room
- `join_chat` - Join specific chat room
- `send_message` - Broadcast message to chat participants
- `typing` - Notify others user is typing
- `stop_typing` - Stop typing notification

### Server → Client

- `connected` - Confirm user setup
- `message_received` - New message received
- `typing` - Someone is typing
- `stop_typing` - Someone stopped typing

## Troubleshooting

### Common Issues:

1. **Messages not appearing in real-time**

   - Check browser console for socket connection errors
   - Verify backend Socket.io server is running
   - Check CORS settings

2. **"Chat not found" error**

   - Ensure users exist in database
   - Check user authentication
   - Verify chat creation API

3. **Socket connection fails**
   - Check if backend port 5000 is running
   - Verify frontend is connecting to correct backend URL
   - Check browser network tab for WebSocket connection

### Debug Commands:

```bash
# Check if socket.io is installed
cd backend && npm list socket.io

# Check backend logs
cd backend && npm run dev

# Check frontend console
# Open browser DevTools → Console tab
```

## Next Steps (Phase 4 Enhancements)

1. **Message Status**: Read receipts, delivery status
2. **File Attachments**: Image/file sharing
3. **Group Chats**: Multi-user conversations
4. **Message Search**: Find messages in chats
5. **Push Notifications**: Browser notifications for new messages
6. **Message Reactions**: Emoji reactions to messages
7. **Voice Messages**: Audio message support

## File Structure

```
backend/
├── models/
│   ├── chatModel.js      # Chat schema
│   └── messageModel.js   # Message schema
├── controllers/
│   ├── chatController.js # Chat operations
│   └── messageController.js # Message operations
├── routes/
│   ├── chatRoutes.js     # Chat API routes
│   └── messageRoutes.js  # Message API routes
└── app.js               # Socket.io server setup

frontend/
├── src/
│   ├── components/
│   │   └── ChatBox.jsx   # Main chat interface
│   ├── pages/
│   │   ├── MessagesPage.jsx # Chat list + chat view
│   │   └── ChatPage.jsx     # Individual chat page
│   └── socket.js         # Socket service
```

Your messaging system is now ready for production use! 🚀
