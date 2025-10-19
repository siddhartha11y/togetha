// src/pages/CreatePost.jsx
import api from "../api/axios";
import { toast } from "react-toastify"; // keep same lib you’re using
import PostForm from "../components/PostForm";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const navigate = useNavigate();

  const createPost = async (formData) => {
    const res = await api.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });

    toast.success("Post created successfully!");
    navigate("/home"); // or wherever you redirect
    return res.data;
  };

  return <PostForm submitLabel="Create Post" onSubmit={createPost} />;
}
