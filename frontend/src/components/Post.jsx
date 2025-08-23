import { useState } from "react";
import { FaRegHeart, FaRegComment, FaRegPaperPlane } from "react-icons/fa";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Comments from "./Comments";
import { toast } from "react-toastify";

export default function Post({ post, currentUser }) {
  const [liked, setLiked] = useState(post.likedByUser || false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const navigate = useNavigate();

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);

    // optimistic update
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));

    try {
      const res = await api.post(
        `/api/posts/${post._id}/like`,
        {},
        { withCredentials: true }
      );
      setLikes(res.data.likes);
      setLiked(res.data.likedByUser);
    } catch (err) {
      console.error("Error liking post:", err);
      // rollback
      setLiked((prev) => !prev);
      setLikes((prev) => (liked ? prev + 1 : prev - 1));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/posts/${post._id}`, { withCredentials: true });
      toast.success("Post deleted successfully");
      setConfirmDelete(false);
      // refresh feed or redirect
      navigate(0); // reload current page
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error deleting post");
    }
  };

  return (
    <div className="relative bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-md hover:shadow-[0_0_25px_#6C63FF] transition-all duration-300">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-3 font-semibold text-purple-400">
          {post.author?.profilePicture ? (
            <img
              src={post.author.profilePicture}
              alt={post.author.username}
              className="w-10 h-10 rounded-full object-cover border border-gray-700"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
              {post.author?.username?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <Link
            to={`/profile/${post.author?.username}`}
            className="font-semibold text-purple-300 mr-1 
               transition-transform duration-200 ease-in-out 
               hover:scale-110 hover:text-purple-400 
               hover:drop-shadow-[0_0_6px_#c084fc]">
            {post.author?.username || "Unknown"}
          </Link>
        </div>

        {/* Three dot menu (only for author) */}
        {currentUser?._id === post.author?._id && (
          <div className="relative">
            <HiOutlineDotsVertical
              onClick={() => setMenuOpen((prev) => !prev)}
              className="text-gray-400 cursor-pointer hover:text-white text-xl"
            />

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20">
                <button
                  onClick={() => navigate(`/posts/${post._id}/edit`)}
                  className="block w-full text-left px-4 py-2 text-sm text-purple-300 hover:bg-gray-700 rounded-t-lg">
                  Edit
                </button>
                <button
                  onClick={() => {
                    setConfirmDelete(true);
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-b-lg">
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post"
          className="w-full max-h-[500px] object-cover"
          loading="lazy"
        />
      )}

      {/* Post Actions */}
      <div className="flex items-center gap-4 px-4 py-3 text-xl border-b border-gray-800">
        <FaRegHeart
          onClick={handleLike}
          className={`cursor-pointer transition ${
            liked ? "text-red-500" : "hover:text-red-500"
          }`}
        />
        <span className="text-gray-400 text-sm">{likes} likes</span>

        <FaRegComment
          onClick={() => setShowComments((prev) => !prev)}
          className="cursor-pointer hover:text-blue-500 transition"
        />

        <FaRegPaperPlane className="cursor-pointer hover:text-green-500 transition" />
      </div>

      {/* Caption */}
      <div className="px-4 py-3">
        <p className="text-sm text-gray-300">
          <Link
            to={`/profile/${post.author?.username}`}
            className="font-semibold text-purple-300 mr-1 
               transition-transform duration-200 ease-in-out 
               hover:scale-110 hover:text-purple-400 
               hover:drop-shadow-[0_0_6px_#c084fc]">
            {post.author?.username || "Unknown"}
          </Link>
          {post.title}
        </p>
      </div>

      {/* Comments */}
      {showComments && (
        <Comments postId={post._id} postAuthorId={post.author?._id} />
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-30">
          <div className="bg-gray-800 p-6 rounded-xl w-80 text-center shadow-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Delete this post?
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className="flex justify-around">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 text-white">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 text-white">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
