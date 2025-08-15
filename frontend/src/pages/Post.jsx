import { useState } from "react";
    import api from "../api/axios"; // if you created the axios instance
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Add this at the top


export default function CreatePost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    content: "",
    image: null,
  });

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setForm({ ...form, image: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("image", form.image);


try {
  const res = await api.post("/api/posts", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });
  if (res.status === 201) {
        toast.success("Post created successfully!");
        setTimeout(() => {
          navigate("/home"); // navigate after toast shows
        }, 1500);
      }
} catch (error) {
  console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Error creating post");
}

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white relative overflow-hidden">
      {/* Left Illustration */}
      <img
        src="https://undraw.co/api/illustrations/random?color=6C63FF"
        alt="illustration"
        className="absolute left-0 top-1/2 -translate-y-1/2 w-64 opacity-30 pointer-events-none"
      />

      {/* Right Illustration */}
      <img
        src="https://undraw.co/api/illustrations/random?color=FF6584"
        alt="illustration"
        className="absolute right-0 top-1/2 -translate-y-1/2 w-64 opacity-30 pointer-events-none"
      />

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-lg relative z-10 border border-gray-700 hover:shadow-[0_0_20px_#6C63FF] transition-all duration-300"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Create Post</h2>

        <input
          type="text"
          name="title"
          placeholder="Post Title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-3 mb-4 bg-gray-700 rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none transition"
        />

        <textarea
          name="content"
          placeholder="Write your content..."
          value={form.content}
          onChange={handleChange}
          rows="5"
          className="w-full p-3 mb-4 bg-gray-700 rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none transition"
        />

        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="w-full p-3 mb-4 bg-gray-700 rounded-lg border border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-white file:bg-purple-600 hover:file:bg-purple-700 transition"
        />

        <button
          type="submit"
          className="w-full bg-purple-600 py-3 rounded-lg hover:bg-purple-700 transition-all duration-300 shadow-[0_0_10px_#6C63FF] hover:shadow-[0_0_20px_#6C63FF] font-semibold"
        >
          Post
        </button>
      </form>
    </div>
  );
}
