import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function EditProfile() {
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    bio: "",
    profilePicture: null,
  });
  const navigate = useNavigate();

  const [preview, setPreview] = useState("");

  useEffect(() => {
    // Fetch current profile details
    api.get("/auth/profile").then((res) => {
      setForm({
        username: res.data.username || "",
        fullName: res.data.fullName || "",
        bio: res.data.bio || "",
        profilePicture: null,
      });
      setPreview(res.data.profilePicture || "");
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePicture" && files[0]) {
      setForm({ ...form, profilePicture: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key]) formData.append(key, form[key]);
    });

    try {
      await api.put("/auth/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/profile", { state: { showSuccessToast: true } });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile, please try again with jpeg, png, jpg, gif format.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto mt-10 bg-black p-6 rounded-lg shadow-lg text-white"
    >
      <h2 className="text-2xl font-semibold mb-6 text-center">Edit Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Profile Picture */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <img
              src={preview || "/default-avatar.png"}
              alt="Preview"
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-500 group-hover:shadow-[0_0_10px_#0095F6] transition"
            />
            <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 cursor-pointer hover:bg-blue-600 transition">
              <input
                type="file"
                name="profilePicture"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
              />
              ✏
            </label>
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm text-gray-400">Username</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full p-2 rounded-md bg-gray-900 border border-gray-700 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm text-gray-400">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            className="w-full p-2 rounded-md bg-gray-900 border border-gray-700 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm text-gray-400">Bio</label>
          <textarea
            name="bio"
            rows="3"
            value={form.bio}
            onChange={handleChange}
            className="w-full p-2 rounded-md bg-gray-900 border border-gray-700 focus:border-blue-500 outline-none"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="bg-[#0095F6] hover:bg-[#1877F2] text-white px-6 py-2 rounded-md font-semibold transition-all shadow hover:shadow-[0_0_15px_#0095F6]"
          >
            Save Changes
          </button>
        </div>
      </form>
    </motion.div>
  );
}
