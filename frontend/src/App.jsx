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
import ChatPage from "./pages/ChatPage";
import MessagesPage from "./pages/MessagesPage";
import useUserStore from "./store/userStore";
import { useEffect } from "react";


export default function App() {
  const { theme } = useThemeStore();
  
  const { user, loadUserFromCookie } = useUserStore();

  useEffect(() => {
    loadUserFromCookie(); // ✅ load user into Zustand
  }, [loadUserFromCookie]);

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
          <Route path="/chats/:chatId" element={<ChatPage />} />
            <Route path="/messages" element={<MessagesPage />} />
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
      </>
    </div>
  );
}
