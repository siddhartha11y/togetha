import { useState } from "react";
import SharePostModal from "./SharePostModal";

// Test component to verify sharing functionality
export default function ShareTest() {
  const [showModal, setShowModal] = useState(false);

  // Mock post data for testing
  const mockPost = {
    _id: "507f1f77bcf86cd799439011",
    title: "This is a test post for sharing functionality! 🚀",
    imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop",
    author: {
      _id: "507f1f77bcf86cd799439012",
      username: "testuser",
      fullName: "Test User",
      profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    shareCount: 5,
    likes: 42,
    createdAt: new Date()
  };

  const mockCurrentUser = {
    _id: "507f1f77bcf86cd799439013",
    username: "currentuser",
    fullName: "Current User"
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full">
        <h1 className="text-white text-2xl font-bold mb-6 text-center">
          🧪 Share Functionality Test
        </h1>
        
        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-white font-medium mb-2">Mock Post Data:</h3>
            <p className="text-gray-300 text-sm">Title: {mockPost.title}</p>
            <p className="text-gray-300 text-sm">Author: @{mockPost.author.username}</p>
            <p className="text-gray-300 text-sm">Share Count: {mockPost.shareCount}</p>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium"
          >
            🚀 Test Share Modal
          </button>
          
          <div className="text-gray-400 text-sm space-y-1">
            <p>✅ Click button to open share modal</p>
            <p>✅ Test external sharing links</p>
            <p>✅ Test copy link functionality</p>
            <p>✅ Test friend search (uses mock data)</p>
            <p>✅ Check browser console for errors</p>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showModal && (
        <SharePostModal
          post={mockPost}
          currentUser={mockCurrentUser}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}