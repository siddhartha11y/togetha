import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, X, Loader } from "lucide-react";

export default function GifSelector({ onSelectGif, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trendingGifs, setTrendingGifs] = useState([]);

  // Sample GIF data (in real app, you'd use GIPHY API)
  const sampleGifs = [
    {
      id: 1,
      url: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
      preview: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/200w.gif",
      title: "Happy Dance"
    },
    {
      id: 2,
      url: "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif",
      preview: "https://media.giphy.com/media/26u4cqiYI30juCOGY/200w.gif",
      title: "Celebration"
    },
    {
      id: 3,
      url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
      preview: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/200w.gif",
      title: "Love"
    },
    {
      id: 4,
      url: "https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/giphy.gif",
      preview: "https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/200w.gif",
      title: "Fire"
    },
    {
      id: 5,
      url: "https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif",
      preview: "https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/200w.gif",
      title: "Stars"
    },
    {
      id: 6,
      url: "https://media.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.gif",
      preview: "https://media.giphy.com/media/3o7abAHdYvZdBNnGZq/200w.gif",
      title: "Party"
    }
  ];

  useEffect(() => {
    setTrendingGifs(sampleGifs);
    setGifs(sampleGifs);
  }, []);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setGifs(trendingGifs);
      return;
    }

    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const filtered = sampleGifs.filter(gif => 
        gif.title.toLowerCase().includes(query.toLowerCase())
      );
      setGifs(filtered);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-white font-semibold text-lg">Choose a GIF</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for GIFs..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* GIF Grid */}
        <div className="p-4 overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader size={32} className="text-purple-500 animate-spin" />
            </div>
          ) : gifs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No GIFs found</div>
              <div className="text-gray-500">Try a different search term</div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {gifs.map((gif) => (
                <motion.button
                  key={gif.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectGif(gif)}
                  className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all"
                >
                  <img
                    src={gif.preview}
                    alt={gif.title}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex gap-2 overflow-x-auto">
            {["trending", "love", "happy", "party", "fire", "stars"].map((category) => (
              <button
                key={category}
                onClick={() => setSearchQuery(category)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white text-sm whitespace-nowrap transition-colors"
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
