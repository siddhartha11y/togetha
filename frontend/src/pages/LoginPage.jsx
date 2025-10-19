import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Users } from "lucide-react";
import useUserStore from "../store/userStore";
import { toast } from "react-toastify";
import api from "../api/axios";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post(
        "/api/auth/login",
        formData,
        { withCredentials: true }
      );
      
      // Get user profile after successful login
      const profileResponse = await api.get(
        "/api/auth/profile",
        { withCredentials: true }
      );
      
      // Store user data in Zustand store
      setUser(profileResponse.data);
      
      console.log("Login successful:", profileResponse.data);
      toast.success("Login successful!");
      navigate("/home");
    } catch (error) {
      console.error("Login failed", error);
      toast.error(error.response?.data?.message || "Login failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle =
    "mt-1 w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-200 placeholder-gray-400 shadow-sm";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* LEFT SIDE - Login Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          {/* Logo */}
          <div className="mb-6 flex items-center gap-2">
            <Users className="size-10 text-green-600" />
            <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600">
              Socia
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-500 mb-6">
            Log in to continue your journey with us!
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                className={inputStyle}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="********"
                className={inputStyle}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            {/* Link */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Don’t have an account?{" "}
              <Link to="/" className="text-green-600 hover:underline">
                Create one
              </Link>
            </p>
          </form>
        </div>

        {/* RIGHT SIDE - Illustration */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-100 to-blue-100 items-center justify-center">
          <div className="max-w-md p-6 text-center">
            <img
              src="/i.png"
              alt="Illustration"
              className="w-80 mx-auto drop-shadow-lg"
            />
            <h3 className="text-xl font-semibold mt-6 text-gray-800">
              Welcome to Our Community
            </h3>
            <p className="text-gray-600 mt-2">
              Stay connected, share your thoughts, and grow with us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
