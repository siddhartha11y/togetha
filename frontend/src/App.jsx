import { Routes, Route } from "react-router-dom";
import Register from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import HomePage from "./pages/HomePage";
import { useThemeStore } from "./store/useThemeStore";
import CreatePost from "./pages/CreatePost";

// Toastify imports
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditProfile from "./pages/EditProfile";
import EditPost from "./pages/EditPost";
import PostPage from "./pages/PostPage";
import ChatPage from "./pages/ChatPage";
import MessagesPage from "./pages/MessagesPage";
import ExplorePage from "./pages/ExplorePage";
import useUserStore from "./store/userStore";
import socketService from "./socket";
import { useEffect } from "react";
import CallNotification from "./components/CallNotification";
import GlobalCallInterface from "./components/GlobalCallInterface";


export default function App() {
  const { theme } = useThemeStore();
  
  const { user, loadUserFromCookie } = useUserStore();

  useEffect(() => {
    loadUserFromCookie(); // ✅ load user into Zustand
  }, [loadUserFromCookie]);

  // Initialize socket connection when user is loaded
  useEffect(() => {
    if (user && !socketService.isSocketConnected()) {
      socketService.connect(user);
    }
    
    // Cleanup on unmount
    return () => {
      if (!user) {
        socketService.disconnect();
      }
    };
  }, [user]);

  return (
    <div data-theme={theme} className="min-h-screen">
      <>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          {/* ✅ own profile */}
          <Route path="/profile" element={<ProfilePage />} />
          {/* ✅ others' profiles */}
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/posts/:id/edit" element={<EditPost />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/chats/:chatId" element={<ChatPage />} />
            <Route path="/messages" element={<MessagesPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/friends" element={<div>Friends Page</div>} />
        </Routes>

        {/* Toast notifications container */}
        <ToastContainer
          position="top-center"
          autoClose={3000} // optional: auto close after 3 sec
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />

        {/* Global Call Components */}
        {user && (
          <>
            <CallNotification />
            <GlobalCallInterface />
          </>
        )}
      </>
    </div>
  );
}
