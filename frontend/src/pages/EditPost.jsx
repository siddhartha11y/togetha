// src/pages/EditPost.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";
import PostForm from "../components/PostForm";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/api/posts/${id}`, { withCredentials: true });
        setPost(res.data);
      } catch (err) {
        toast.error("Failed to fetch post");
      }
    };
    fetchPost();
  }, [id]);

  const updatePost = async (formData) => {
    const res = await api.put(`/api/posts/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    toast.success("Post updated successfully!");
    navigate("/home"); // optional redirect
    return res.data;
  };

  if (!post) return <p>Loading...</p>;

  return <PostForm initialValues={post} submitLabel="Update Post" onSubmit={updatePost} />;
}
