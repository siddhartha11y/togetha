import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";
import InstagramStoryCreator from "./InstagramStoryCreator";
import StoryViewer from "./StoryViewer";

export default function StoriesCarousel({ user }) {
  // Add styles to hide scrollbar
  const scrollbarHideStyle = `
    .stories-scroll::-webkit-scrollbar {
      display: none;
    }
    .stories-scroll {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `;

  // Inject styles
  if (
    typeof document !== "undefined" &&
    !document.getElementById("stories-scrollbar-hide")
  ) {
    const style = document.createElement("style");
    style.id = "stories-scrollbar-hide";
    style.textContent = scrollbarHideStyle;
    document.head.appendChild(style);
  }
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUserStories, setSelectedUserStories] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  // Fetch stories from followed users
  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/stories");
      setStories(data);
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast.error("Failed to load stories");
    } finally {
      setLoading(false);
    }
  };

  const handleStoryCreated = () => {
    fetchStories(); // Refresh stories after creating new one
    setShowCreateModal(false);
  };

  const openStoryViewer = (userStories, startIndex = 0) => {
    setSelectedUserStories(userStories);
    setCurrentStoryIndex(startIndex);
  };

  const closeStoryViewer = () => {
    setSelectedUserStories(null);
    setCurrentStoryIndex(0);
    // Refresh stories to update viewed status
    fetchStories();
  };

  if (loading) {
    return (
      <div className="flex space-x-4 p-4 overflow-x-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <div className="w-28 h-28 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-24 h-3 bg-gray-700 rounded mt-2 mx-auto animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  // Separate own stories from others
  const ownStory = stories.find((story) => story.author._id === user?._id);
  const otherStories = stories.filter(
    (story) => story.author._id !== user?._id
  );

  return (
    <>
      <div className="mb-4 lg:mb-6">
        <div className="max-w-2xl mx-auto px-2 lg:pr-4 py-3 lg:py-6">
          <div className="flex space-x-3 lg:space-x-4 overflow-x-auto stories-scroll">
            {/* Your Story - Show your story if you have one, otherwise show create button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (ownStory) {
                  openStoryViewer(ownStory.stories, 0);
                } else {
                  setShowCreateModal(true);
                }
              }}
              className="flex-shrink-0 cursor-pointer p-2"
            >
              <div className="relative">
                {/* Always show user's profile picture */}
                <div
                  className={`w-20 h-20 lg:w-28 lg:h-28 rounded-full ${
                    ownStory
                      ? `p-1 ${
                          ownStory.hasUnviewed
                            ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
                            : "bg-gray-600"
                        }`
                      : ""
                  }`}
                >
                  <div
                    className={`w-full h-full rounded-full ${
                      ownStory ? "bg-black p-1" : ""
                    }`}
                  >
                    <img
                      src={
                        user?.profilePicture && user.profilePicture !== null
                          ? user.profilePicture
                          : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%236B7280'/%3E%3Ccircle cx='40' cy='30' r='12' fill='%239CA3AF'/%3E%3Cpath d='M15 65 C15 52, 27 45, 40 45 C53 45, 65 52, 65 65' fill='%239CA3AF'/%3E%3C/svg%3E"
                      }
                      alt={user?.username}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%236B7280'/%3E%3Ccircle cx='40' cy='30' r='12' fill='%239CA3AF'/%3E%3Cpath d='M15 65 C15 52, 27 45, 40 45 C53 45, 65 52, 65 65' fill='%239CA3AF'/%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </div>

                {/* Plus icon for creating story (only when no story exists) */}
                {!ownStory && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 lg:w-7 lg:h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                    <Plus size={12} className="lg:size-3.5 text-white" />
                  </div>
                )}

                {/* Story count indicator for your stories */}
                {ownStory && ownStory.stories.length > 1 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                    {ownStory.stories.length}
                  </div>
                )}
              </div>
              <p className="text-xs text-center mt-2 text-gray-300 max-w-[112px] truncate">
                {ownStory ? "Your Story" : "Your Story"}
              </p>
            </motion.div>

            {/* Stories from other users */}
            {otherStories.map((userStory) => (
              <motion.div
                key={userStory.author._id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openStoryViewer(userStory.stories, 0)}
                className="flex-shrink-0 cursor-pointer p-2"
              >
                <div className="relative">
                  {/* Story Ring - Different colors based on viewed status */}
                  <div
                    className={`w-28 h-28 rounded-full p-1 ${
                      userStory.hasUnviewed
                        ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
                        : "bg-gray-600"
                    }`}
                  >
                    <div className="w-full h-full rounded-full bg-black p-1">
                      <img
                        src={
                          userStory.author.profilePicture &&
                          userStory.author.profilePicture !==
                            "/images/default-avatar.png" &&
                          userStory.author.profilePicture !==
                            "/images/default-avatar.svg"
                            ? `${import.meta.env.MODE === "development" ? "http://localhost:5000" : "https://togetha.onrender.com"}${userStory.author.profilePicture}`
                            : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%236B7280'/%3E%3Ccircle cx='40' cy='30' r='12' fill='%239CA3AF'/%3E%3Cpath d='M15 65 C15 52, 27 45, 40 45 C53 45, 65 52, 65 65' fill='%239CA3AF'/%3E%3C/svg%3E"
                        }
                        alt={userStory.author.username}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%236B7280'/%3E%3Ccircle cx='40' cy='30' r='12' fill='%239CA3AF'/%3E%3Cpath d='M15 65 C15 52, 27 45, 40 45 C53 45, 65 52, 65 65' fill='%239CA3AF'/%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  </div>

                  {/* Story count indicator */}
                  {userStory.stories.length > 1 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      {userStory.stories.length}
                    </div>
                  )}
                </div>
                <p className="text-xs text-center mt-2 text-gray-300 max-w-[112px] truncate">
                  {userStory.author.username}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Instagram Story Creator */}
      <AnimatePresence>
        {showCreateModal && (
          <InstagramStoryCreator
            user={user}
            onClose={() => setShowCreateModal(false)}
            onStoryCreated={handleStoryCreated}
          />
        )}
      </AnimatePresence>

      {/* Story Viewer */}
      <AnimatePresence>
        {selectedUserStories && (
          <StoryViewer
            stories={selectedUserStories}
            currentIndex={currentStoryIndex}
            user={user}
            onClose={closeStoryViewer}
            onNext={() => {
              if (currentStoryIndex < selectedUserStories.length - 1) {
                setCurrentStoryIndex(currentStoryIndex + 1);
              } else {
                closeStoryViewer();
              }
            }}
            onPrevious={() => {
              if (currentStoryIndex > 0) {
                setCurrentStoryIndex(currentStoryIndex - 1);
              }
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
