import { Routes, Route } from 'react-router-dom';
import Register from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import { useThemeStore } from './store/useThemeStore';
import CreatePost from './pages/Post';


// Toastify imports
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditProfile from './pages/EditProfile';
export default function App() {
  const { theme } = useThemeStore();

  return (
    <div data-theme={theme} className="min-h-screen">
      <>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/edit-profile" element={<EditProfile />} />
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
