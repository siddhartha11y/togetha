import { use, useState } from "react";
import { Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";


export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await api.post("/api/auth/register", {
        username: form.username,
        email: form.email,
        password: form.password,
      });

      console.log("Registration successful:", res.data);
      alert("Account created successfully!");
      navigate('/home'); // Redirect to home page after successful registration
      // Optional: redirect user to login page here
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  // Modern, premium input style
  const inputStyle =
    "mt-1 w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-200 placeholder-gray-400 shadow-sm";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* LEFT SIDE */}
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
            Create an Account
          </h2>
          <p className="text-gray-500 mb-6">
            Join us and start your journey today!
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                name="username"
                placeholder="johndoe"
                className={inputStyle}
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                className={inputStyle}
                value={form.email}
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
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="********"
                className={inputStyle}
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {/* Terms */}
            <div className="flex items-center text-sm">
              <input
                type="checkbox"
                className="checkbox checkbox-sm mr-2"
                required
              />
              <span className="text-gray-600">
                I agree to the{" "}
                <span className="text-green-600 hover:underline cursor-pointer">
                  terms of service
                </span>{" "}
                and{" "}
                <span className="text-green-600 hover:underline cursor-pointer">
                  privacy policy
                </span>
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
            >
              Create Account
            </button>

            {/* Link */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-green-600 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-100 to-blue-100 items-center justify-center">
          <div className="max-w-md p-6 text-center">
            <img
              src="/i.png"
              alt="Illustration"
              className="w-80 mx-auto drop-shadow-lg"
            />
            <h3 className="text-xl font-semibold mt-6 text-gray-800">
              Connect with people worldwide
            </h3>
            <p className="text-gray-600 mt-2">
              Learn, share, and grow together in our vibrant community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
