import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRegHeart, FaHeart, FaRegComment, FaComment, FaRegPaperPlane, FaPaperPlane, FaShare } from "react-icons/fa";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Comments from "./Comments";
import SharePostModal from "./SharePostModal";
import { toast } from "react-toastify";

export default function Post({ post, currentUser }) {
  // Determine if current user has liked this post
  const isLikedByCurrentUser = Boolean(post.likedByUser);

  const [liked, setLiked] = useState(isLikedByCurrentUser);
  const [likes, setLikes] = useState(Number(post.likes) || 0);
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const navigate = useNavigate();

  // Update state when post data changes (for async loading)
  useEffect(() => {
    // Use the likedByUser field from backend which is already calculated correctly
    setLiked(Boolean(post.likedByUser));
    setLikes(
      typeof post.likes === 'number' ? post.likes : 
      Array.isArray(post.likes) ? post.likes.length : 0
    );
  }, [post.likedByUser, post.likes, post._id]);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);

    // optimistic update
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));

    try {
      const res = await api.post(
        `/posts/${post._id}/like`,
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
      await api.delete(`/posts/${post._id}`, { withCredentials: true });
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
              src={`${import.meta.env.VITE_API_BASE_URL}${post.author.profilePicture}`}
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
          className="w-full max-h-[400px] object-contain bg-gray-800"
          loading="lazy"
        />
      )}

      {/* Post Actions */}
      <div className="flex items-center gap-6 px-4 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          {liked ? (
            <FaHeart
              onClick={handleLike}
              className="cursor-pointer text-red-500 text-2xl hover:scale-110 transition-all duration-200 drop-shadow-[0_0_8px_#ef4444]"
            />
          ) : (
            <FaRegHeart
              onClick={handleLike}
              className="cursor-pointer text-gray-300 text-2xl hover:text-red-500 hover:scale-110 transition-all duration-200"
            />
          )}
          <span className="text-gray-400 text-sm font-medium">{likes} {likes === 1 ? 'like' : 'likes'}</span>
        </div>

        <div className="flex items-center gap-2">
          {showComments ? (
            <FaComment
              onClick={() => setShowComments((prev) => !prev)}
              className="cursor-pointer text-blue-500 text-2xl hover:scale-110 transition-all duration-200 drop-shadow-[0_0_8px_#3b82f6]"
            />
          ) : (
            <FaRegComment
              onClick={() => setShowComments((prev) => !prev)}
              className="cursor-pointer text-gray-300 text-2xl hover:text-blue-500 hover:scale-110 transition-all duration-200"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <FaShare
            onClick={() => setShowShareModal(true)}
            className="cursor-pointer text-gray-300 text-2xl hover:text-green-500 hover:scale-110 transition-all duration-200"
          />
          {post.shareCount > 0 && (
            <span className="text-gray-400 text-sm">{post.shareCount}</span>
          )}
        </div>
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
      <AnimatePresence>
        {showComments && (
          <Comments postId={post._id} postAuthorId={post.author?._id} />
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <SharePostModal
            post={post}
            currentUser={currentUser}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </AnimatePresence>

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
