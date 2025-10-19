import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Send, Search, Copy, ExternalLink, MessageCircle,
  Users, Link, Check, Share2, Twitter, Facebook
} from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function SharePostModal({ post, onClose, currentUser }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Fetch friends, followers, and other users (Instagram style)
  useEffect(() => {
    const fetchUsers = async () => {
      setFriendsLoading(true);
      try {
        console.log('🔍 Fetching users for sharing...');
        
        // Fetch following and followers in parallel
        const [followingRes, followersRes] = await Promise.all([
          api.get('/auth/following', { withCredentials: true }).catch(() => ({ data: [] })),
          api.get('/auth/followers', { withCredentials: true }).catch(() => ({ data: [] }))
        ]);
        
        const followingList = followingRes.data || [];
        const followersList = followersRes.data || [];
        
        console.log('📋 Following:', followingList.length, 'Followers:', followersList.length);
        
        // Combine and deduplicate users
        const combinedUsers = [];
        const seenIds = new Set();
        
        // Add following first (people you follow)
        followingList.forEach(user => {
          if (!seenIds.has(user._id)) {
            combinedUsers.push({ ...user, relationship: 'following' });
            seenIds.add(user._id);
          }
        });
        
        // Add followers (people who follow you)
        followersList.forEach(user => {
          if (!seenIds.has(user._id)) {
            combinedUsers.push({ ...user, relationship: 'follower' });
            seenIds.add(user._id);
          }
        });
        
        if (combinedUsers.length > 0) {
          setFriends(followingList);
          setFollowers(followersList);
          setAllUsers(combinedUsers);
          setFilteredUsers(combinedUsers);
          console.log(`✅ Loaded ${combinedUsers.length} users for sharing`);
        } else {
          console.log('📭 No users found, using mock data for demo');
          // Mock users for demo
          const mockUsers = [
            {
              _id: '1',
              username: 'john_doe',
              fullName: 'John Doe',
              profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
              relationship: 'following'
            },
            {
              _id: '2',
              username: 'jane_smith',
              fullName: 'Jane Smith',
              profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
              relationship: 'following'
            },
            {
              _id: '3',
              username: 'mike_wilson',
              fullName: 'Mike Wilson',
              profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
              relationship: 'follower'
            },
            {
              _id: '4',
              username: 'sarah_jones',
              fullName: 'Sarah Jones',
              profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
              relationship: 'follower'
            }
          ];
          setAllUsers(mockUsers);
          setFilteredUsers(mockUsers);
        }
      } catch (error) {
        console.error('❌ Error fetching users:', error);
        // Fallback mock data
        const mockUsers = [
          {
            _id: '1',
            username: 'john_doe',
            fullName: 'John Doe',
            profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            relationship: 'following'
          },
          {
            _id: '2',
            username: 'jane_smith',
            fullName: 'Jane Smith',
            profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
            relationship: 'following'
          }
        ];
        setAllUsers(mockUsers);
        setFilteredUsers(mockUsers);
      } finally {
        setFriendsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, allUsers]);

  const toggleUserSelection = (user) => {
    setSelectedFriends(prev => {
      const isSelected = prev.find(f => f._id === user._id);
      if (isSelected) {
        return prev.filter(f => f._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };

  const shareToFriends = async () => {
    if (selectedFriends.length === 0) {
      toast.error("Please select at least one friend to share with");
      return;
    }

    setLoading(true);
    try {
      const shareData = {
        postId: post._id,
        recipients: selectedFriends.map(f => f._id),
        message: shareMessage.trim() || `Check out this post from @${post.author.username}!`
      };

      await api.post('/posts/share', shareData, {
        withCredentials: true
      });

      toast.success(`Post shared with ${selectedFriends.length} friend${selectedFriends.length > 1 ? 's' : ''}!`);
      onClose();
    } catch (error) {
      console.error('Error sharing post:', error);
      toast.error("Failed to share post");
    } finally {
      setLoading(false);
    }
  };

  const copyPostLink = async () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error("Failed to copy link");
    }
  };

  const shareToExternal = (platform) => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    const text = `Check out this post from @${post.author.username}!`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${postUrl}`)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  if (!mounted) return null;

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-white font-semibold text-lg">Share</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Users List - Instagram Style */}
        <div className="flex-1 overflow-y-auto">
          {friendsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-lg">No people found</p>
              <p className="text-gray-500 text-sm mt-1">Try searching for someone</p>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredUsers.map(user => {
                const isSelected = selectedFriends.find(f => f._id === user._id);
                return (
                  <button
                    key={user._id}
                    onClick={() => toggleUserSelection(user)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-800 transition-colors"
                  >
                    <img
                      src={user.profilePicture || '/default-avatar.png'}
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">{user.username}</p>
                      <p className="text-gray-400 text-sm">{user.fullName}</p>
                      {user.relationship && (
                        <p className="text-gray-500 text-xs">
                          {user.relationship === 'following' ? 'Following' : 'Follows you'}
                        </p>
                      )}
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-gray-400'
                    }`}>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Users Bar */}
        {selectedFriends.length > 0 && (
          <div className="p-4 border-t border-gray-800 bg-gray-850">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-white font-medium">
                {selectedFriends.length} selected
              </span>
              <div className="flex -space-x-2">
                {selectedFriends.slice(0, 3).map(user => (
                  <img
                    key={user._id}
                    src={user.profilePicture || '/default-avatar.png'}
                    alt={user.username}
                    className="w-8 h-8 rounded-full border-2 border-gray-900 object-cover"
                  />
                ))}
                {selectedFriends.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center">
                    <span className="text-white text-xs">+{selectedFriends.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={shareToFriends}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'Send'
              )}
            </button>
          </div>
        )}

        {/* External Sharing Options - At Bottom */}
        <div className="p-4 border-t border-gray-800">
          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={copyPostLink}
              className="flex flex-col items-center gap-2 p-3 hover:bg-gray-800 rounded-lg transition-colors"
            >
              {copied ? (
                <Check size={24} className="text-green-400" />
              ) : (
                <Copy size={24} className="text-gray-400" />
              )}
              <span className="text-gray-400 text-xs">Copy Link</span>
            </button>
            
            <button
              onClick={() => shareToExternal('whatsapp')}
              className="flex flex-col items-center gap-2 p-3 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <MessageCircle size={24} className="text-green-500" />
              <span className="text-gray-400 text-xs">WhatsApp</span>
            </button>
            
            <button
              onClick={() => shareToExternal('twitter')}
              className="flex flex-col items-center gap-2 p-3 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Twitter size={24} className="text-blue-400" />
              <span className="text-gray-400 text-xs">Twitter</span>
            </button>
            
            <button
              onClick={() => shareToExternal('facebook')}
              className="flex flex-col items-center gap-2 p-3 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Facebook size={24} className="text-blue-600" />
              <span className="text-gray-400 text-xs">Facebook</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
}