import { useState, useEffect } from "react";
import api from "../api/axios";
import { FaTrash } from "react-icons/fa";

export default function Comments({ postId, postAuthorId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // ✅ Fetch current user (only once)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/auth/profile", { withCredentials: true }); 
        setCurrentUser(res.data); // must return { _id, username, ... }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  // Fetch comments when component loads
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.get(`/api/posts/${postId}/comments`, {
          withCredentials: true,
        });
        setComments(res.data);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };
    fetchComments();
  }, [postId]);

  // Add new comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await api.post(
        `/api/posts/${postId}/comments`,
        { text: newComment },
        { withCredentials: true }
      );
      setComments(res.data);
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  // ✅ Delete comment
  const handleDelete = async (commentId) => {
    try {
      const res = await api.delete(
        `/api/posts/${postId}/comments/${commentId}`,
        { withCredentials: true }
      );
      setComments(res.data.comments);
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  return (
    <div className="px-4 py-3 border-t border-gray-800">
      {/* Show comments */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {(comments ?? []).length === 0 ? (
          <p className="text-gray-400 text-sm">No comments yet.</p>
        ) : (
          (comments ?? []).map((c) => (
            <div
              key={c._id}
              className="flex items-start gap-2 text-sm text-gray-300 justify-between"
            >
              <div className="flex items-start gap-2">
                <img
                  src={
                    c.author?.profilePicture
                      ? `http://localhost:5000${c.author.profilePicture}`
                      : "/default.png"
                  }
                  className="h-6 w-6 rounded-full object-cover border border-gray-700"
                  alt="profile"
                />
                <p>
                  <span className="font-semibold text-purple-400">
                    {c.author?.username}
                  </span>{" "}
                  {c.text}
                </p>
              </div>

              {/* ✅ Show delete only if comment.author or post.author */}
              {currentUser &&
                (c.author?._id === currentUser._id ||
                  postAuthorId === currentUser._id) && (
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="text-red-500 hover:text-red-400 text-xs ml-2"
                  >
                    <FaTrash />
                  </button>
                )}
            </div>
          ))
        )}
      </div>

      {/* Add comment input */}
      <form onSubmit={handleAddComment} className="flex gap-2 mt-3">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-gray-800 text-gray-200 px-3 py-1 rounded-lg focus:outline-none"
        />
        <button
          type="submit"
          className="px-3 py-1 bg-purple-600 rounded-lg text-white hover:bg-purple-500"
        >
          Post
        </button>
      </form>
    </div>
  );
}
