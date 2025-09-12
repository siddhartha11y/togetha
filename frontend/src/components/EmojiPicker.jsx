import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, Heart, Star, Sun, Flower, Coffee, Music, Camera, Search, X } from "lucide-react";

const emojiCategories = {
  popular: {
    name: "Popular",
    icon: <Star size={20} />,
    emojis: [
      "😀", "😂", "😍", "🥰", "😘", "😊", "😉", "😎", "🤔", "😅", "😭", "😱", "😴",
      "🙄", "😏", "🤯", "🥳", "🤩", "😇", "🤗", "🤫", "🤭", "🥺", "😳", "🥴", "😵",
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "💕", "💖", "💗", "💘",
      "💝", "💞", "💟", "❣️", "💌", "💋", "👍", "👎", "👌", "🤝", "🙏", "👏", "💪",
      "🔥", "⭐", "🌟", "✨", "💫", "💯", "💥", "👑", "💎", "🎉", "🎊", "🥇", "🏆",
      "🌹", "🌸", "🌺", "🌻", "🌷", "🍀", "🌈", "☀️", "🌙", "⚡", "🎈", "🎁", "🎂"
    ]
  },
  expressions: {
    name: "Expressions",
    icon: <Smile size={20} />,
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇",
      "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "😋", "😛", "😜", "🤪", "😝", "🤑",
      "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬",
      "🤥", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶",
      "🥴", "😵", "🤯", "🤠", "🥳", "😎", "🤓", "🧐", "😕", "😟", "🙁", "☹️", "😮",
      "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖",
      "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "👿", "💀",
      "💩", "🤡", "👹", "👺", "👻", "👽", "👾", "🤖", "😺", "😸", "😹", "😻", "😼",
      "😽", "🙀", "😿", "😾", "🙈", "🙉", "🙊", "👋", "🤚", "🖐️", "✋", "🖖", "👌"
    ]
  },
  hearts: {
    name: "Hearts & Love",
    icon: <Heart size={20} />,
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞",
      "💓", "💗", "💖", "💘", "💝", "💟", "♥️", "💋", "😍", "🥰", "😘", "💌", "💐",
      "🌹", "🌺", "🌸", "🌻", "🌷", "💒", "👰", "🤵", "💏", "💑", "👨‍❤️‍👨", "👩‍❤️‍👩", 
      "👨‍❤️‍👩", "👪", "👨‍👩‍👧", "👨‍👩‍👦", "👨‍👩‍👧‍👦", "👨‍👨‍👧", "👨‍👨‍👦", "👨‍👨‍👧‍👦", "👩‍👩‍👧", "👩‍👩‍👦", "👩‍👩‍👧‍👦",
      "💞", "💓", "💗", "💖", "💘", "💝", "💟", "♥️", "💋", "🎀", "💎", "🌟", "✨",
      "💫", "⭐", "🌈", "🦄", "🧚", "👼", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙"
    ]
  },
  flowers: {
    name: "Flowers & Nature",
    icon: <Flower size={20} />,
    emojis: [
      "🌸", "🌺", "🌻", "🌷", "🌹", "🥀", "🌼", "💐", "🌿", "🍀", "🍃", "🌱", "🌵",
      "🌲", "🌳", "🌴", "☘️", "🎋", "🎍", "🌾", "🌰", "🍂", "🍁", "🌚", "🌝", "🌞",
      "🌛", "🌜", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌙", "⭐", "🌟",
      "✨", "💫", "☄️", "🌈", "☀️", "🌤️", "⛅", "🌦️", "🌧️", "⛈️", "🌩️", "🌨️",
      "❄️", "☃️", "⛄", "🌬️", "💨", "🌊", "💧", "💦", "🔥", "🌍", "🌎", "🌏", "🪐",
      "🌋", "🏔️", "⛰️", "🗻", "🏕️", "🏖️", "🏜️", "🏝️", "🏞️", "🦋", "🐝", "🐞", "🌱"
    ]
  },
  stars: {
    name: "Stars & Magic",
    icon: <Star size={20} />,
    emojis: [
      "⭐", "🌟", "✨", "💫", "☄️", "🌠", "🎆", "🎇", "🎉", "🎊", "✨", "💥", "💢",
      "💯", "🔥", "💎", "👑", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "🏵️", "🎗️",
      "🌈", "☀️", "🌞", "🌙", "🌛", "🌜", "🌚", "🌝", "🌕", "🌖", "🌗", "🌘", "🌑",
      "🌒", "🌓", "🌔", "⚡", "🔮", "🪄", "✨", "💫", "🌟", "⭐", "🌠", "☄️", "💥",
      "🎯", "🎪", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼", "🎵", "🎶", "🎹", "🥁", "🎷",
      "🎺", "🎸", "🪕", "🎻", "🪗", "🎲", "🧩", "🃏", "🀄", "🎰", "🔔", "🔕", "📯"
    ]
  },
  activities: {
    name: "Activities & Fun",
    icon: <Star size={20} />,
    emojis: [
      "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸",
      "🏒", "🏑", "🥍", "🏏", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹",
      "🛷", "⛸️", "🥌", "🎿", "⛷️", "🏂", "🪂", "🏋️", "🤸", "🤾", "🏌️", "🧘", "🏃",
      "🚶", "🧗", "🤺", "🏇", "⛹️", "🏊", "🚣", "🧜", "🧞", "🧝", "🧙", "🧚", "🧛"
    ]
  },
  food: {
    name: "Food & Drinks",
    icon: <Coffee size={20} />,
    emojis: [
      "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭",
      "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕",
      "🫒", "🧄", "🧅", "🥔", "🍠", "🥐", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈",
      "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🌭", "🍔", "🍟", "🍕", "🥪", "🥙", "🧆",
      "🌮", "🌯", "🫔", "🥗", "🥘", "🫕", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟",
      "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡", "🍧", "🍨", "🍦",
      "🥧", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪", "🌰", "🥜",
      "🍯", "🥛", "🍼", "☕", "🫖", "🍵", "🧃", "🥤", "🧋", "🍶", "🍺", "🍻", "🥂",
      "🍷", "🥃", "🍸", "🍹", "🧉", "🍾", "🥄", "🍴", "🥢", "🍽️", "🧊", "🥫", "🥤"
    ]
  },
  animals: {
    name: "Animals & Nature",
    icon: <Heart size={20} />,
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨", "🐯", "🦁", "🐮",
      "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣",
      "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🪱", "🐛", "🦋",
      "🐌", "🐞", "🐜", "🪰", "🪲", "🪳", "🦟", "🦗", "🕷️", "🕸️", "🦂", "🐢", "🐍",
      "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐳", "🐋",
      "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🐘", "🦣", "🦏", "🦛", "🐪", "🐫",
      "🦒", "🦘", "🦬", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙", "🐐", "🦌"
    ]
  },
  objects: {
    name: "Objects & Symbols",
    icon: <Camera size={20} />,
    emojis: [
      "📱", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "🕹️", "🗜️", "💽", "💾", "💿", "📀",
      "📼", "📷", "📸", "📹", "🎥", "📽️", "🎞️", "📞", "☎️", "📟", "📠", "📺", "📻",
      "🎙️", "🎚️", "🎛️", "🧭", "⏱️", "⏲️", "⏰", "🕰️", "⌛", "⏳", "📡", "🔋", "🔌",
      "💡", "🔦", "🕯️", "🪔", "🧯", "🛢️", "💸", "💵", "💴", "💶", "💷", "🪙", "💰",
      "💳", "💎", "⚖️", "🪜", "🧰", "🔧", "🔨", "⚒️", "🛠️", "⛏️", "🪓", "🪚", "🔩",
      "⚙️", "🪤", "🧲", "🔫", "💣", "🧨", "🪓", "🗡️", "⚔️", "🛡️", "🚬", "⚰️", "⚱️",
      "🏺", "🔮", "📿", "🧿", "💈", "⚗️", "🔭", "🔬", "🕳️", "🩹", "🩺", "💊", "💉",
      "🧬", "🦠", "🧫", "🧪", "🌡️", "🧹", "🧺", "🧻", "🚽", "🚰", "🚿", "🛁", "🛀"
    ]
  },
  music: {
    name: "Music & Entertainment",
    icon: <Music size={20} />,
    emojis: [
      "🎵", "🎶", "🎼", "🎹", "🥁", "🪘", "🎷", "🎺", "🎸", "🪕", "🎻", "🪗", "🎤",
      "🎧", "🎚️", "🎛️", "📻", "🎙️", "🎬", "🎭", "🎪", "🎨", "🎰", "🎲", "🧩", "🃏",
      "🀄", "🎯", "🎳", "🎮", "🕹️", "🎊", "🎉", "🎈", "🎁", "🎀", "🪅", "🪆", "🎄",
      "🎃", "🎆", "🎇", "🧨", "✨", "🎋", "🎍", "🎎", "🎏", "🎐", "🎑", "🧧", "🎫",
      "🎟️", "🏆", "🏅", "🥇", "🥈", "🥉", "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐"
    ]
  },
  gestures: {
    name: "Gestures & People",
    icon: <Heart size={20} />,
    emojis: [
      "👍", "👎", "👌", "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉",
      "👆", "🖕", "👇", "☝️", "🫵", "👋", "🤚", "🖐️", "✋", "🖖", "👏", "🙌", "🫶",
      "👐", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻",
      "👃", "🧠", "🫀", "🫁", "🦷", "🦴", "👀", "👁️", "👅", "👄", "🫦", "💋", "🩸",
      "👶", "🧒", "👦", "👧", "🧑", "👱", "👨", "🧔", "👨‍🦰", "👨‍🦱", "👨‍🦳", "👨‍🦲", "👩",
      "👩‍🦰", "🧑‍🦰", "👩‍🦱", "🧑‍🦱", "👩‍🦳", "🧑‍🦳", "👩‍🦲", "🧑‍🦲", "👱‍♀️", "👱‍♂️", "🧓", "👴", "👵",
      "🙍", "🙍‍♂️", "🙍‍♀️", "🙎", "🙎‍♂️", "🙎‍♀️", "🙅", "🙅‍♂️", "🙅‍♀️", "🙆", "🙆‍♂️", "🙆‍♀️", "💁", "💁‍♂️", "💁‍♀️"
    ]
  },
  travel: {
    name: "Travel & Places",
    icon: <Sun size={20} />,
    emojis: [
      "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🚚", "🚛", "🚜",
      "🛴", "🚲", "🛵", "🏍️", "🛺", "🚁", "🛸", "🚀", "✈️", "🛩️", "🛫", "🛬", "🪂",
      "⛵", "🚤", "🛥️", "🛳️", "⛴️", "🚢", "⚓", "⛽", "🚧", "🚦", "🚥", "🗺️", "🏟️",
      "🏛️", "🏗️", "🧱", "🪨", "🪵", "🛖", "🏘️", "🏚️", "🏠", "🏡", "🏢", "🏣", "🏤",
      "🏥", "🏦", "🏨", "🏩", "🏪", "🏫", "🏬", "🏭", "🏯", "🏰", "🗼", "🗿", "⛪",
      "🕌", "🛕", "🕍", "⛩️", "🕋", "⛲", "⛺", "🌁", "🌃", "🏙️", "🌄", "🌅", "🌆",
      "🌇", "🌉", "♨️", "🎠", "🎡", "🎢", "💈", "🎪", "🚂", "🚃", "🚄", "🚅", "🚆"
    ]
  },
  symbols: {
    name: "Symbols & Signs",
    icon: <Star size={20} />,
    emojis: [
      "💯", "🔥", "💥", "💫", "💦", "💨", "🕳️", "💣", "💢", "💤", "💬", "👁️‍🗨️", "🗨️",
      "🗯️", "💭", "💮", "♨️", "💈", "🛑", "🕛", "🕧", "🕐", "🕜", "🕑", "🕝", "🕒",
      "🕞", "🕓", "🕟", "🕔", "🕠", "🕕", "🕡", "🕖", "🕢", "🕗", "🕣", "🕘", "🕤",
      "🕙", "🕥", "🕚", "🕦", "🌀", "♠️", "♥️", "♦️", "♣️", "🃏", "🀄", "🎴", "🔇",
      "🔈", "🔉", "🔊", "📢", "📣", "📯", "🔔", "🔕", "🎵", "🎶", "💹", "🏧", "🚮",
      "🚰", "♿", "🚹", "🚺", "🚻", "🚼", "🚾", "⚠️", "🚸", "⛔", "🚫", "🚳", "🚭",
      "🚯", "🚱", "🚷", "📵", "🔞", "☢️", "☣️", "⬆️", "↗️", "➡️", "↘️", "⬇️", "↙️",
      "⬅️", "↖️", "↕️", "↔️", "↩️", "↪️", "⤴️", "⤵️", "🔃", "🔄", "🔙", "🔚", "🔛"
    ]
  },
  flags: {
    name: "Flags & Countries",
    icon: <Star size={20} />,
    emojis: [
      "🏁", "🚩", "🎌", "🏴", "🏳️", "🏳️‍🌈", "🏳️‍⚧️", "🏴‍☠️", "🇺🇸", "🇬🇧", "🇩🇪", "🇫🇷",
      "🇮🇹", "🇪🇸", "🇵🇹", "🇷🇺", "🇨🇳", "🇯🇵", "🇰🇷", "🇮🇳", "🇦🇺", "🇨🇦", "🇧🇷", "🇲🇽",
      "🇦🇷", "🇨🇱", "🇨🇴", "🇵🇪", "🇻🇪", "🇪🇨", "🇺🇾", "🇵🇾", "🇧🇴", "🇬🇾", "🇸🇷", "🇫🇰",
      "🇳🇱", "🇧🇪", "🇱🇺", "🇨🇭", "🇦🇹", "🇱🇮", "🇲🇨", "🇸🇲", "🇻🇦", "🇲🇹", "🇦🇩", "🇪🇺",
      "🌍", "🌎", "🌏", "🗺️", "🧭", "🏔️", "⛰️", "🌋", "🗻", "🏕️", "🏖️", "🏜️", "🏝️", "🏞️"
    ]
  }
};

export default function EmojiPicker({ isOpen, onClose, onEmojiSelect, position = "bottom" }) {
  const [activeCategory, setActiveCategory] = useState("popular");
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  const filteredEmojis = searchTerm
    ? Object.values(emojiCategories)
        .flatMap(category => category.emojis)
        .filter(emoji => {
          // Simple search - could be enhanced with emoji names/descriptions
          return true; // For now, show all emojis when searching
        })
    : emojiCategories[activeCategory]?.emojis || [];

  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji);
    // Small haptic feedback animation
    const button = event.target;
    button.style.transform = "scale(1.2)";
    setTimeout(() => {
      button.style.transform = "scale(1)";
    }, 150);
  };

  if (!mounted || !isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={pickerRef}
        initial={{ opacity: 0, scale: 0.9, y: position === "top" ? 20 : -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: position === "top" ? 20 : -20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute z-50 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
        style={{
          [position]: "100%",
          right: "0",
          width: "350px",
          maxHeight: "420px"
        }}
      >
        {/* Header */}
        <div className="p-3 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">Emojis</h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            >
              <X size={14} />
            </motion.button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search emojis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
            />
          </div>
        </div>

        {/* Categories */}
        {!searchTerm && (
          <div 
            className="flex overflow-x-auto p-2 border-b border-gray-700 bg-gray-800/50 gap-1"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(156, 163, 175, 0.5) rgba(55, 65, 81, 0.3)'
            }}
          >
            {Object.entries(emojiCategories).map(([key, category]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(key)}
                className={`flex-shrink-0 p-2.5 rounded-xl transition-all ${
                  activeCategory === key
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                }`}
                title={category.name}
              >
                {category.icon}
              </motion.button>
            ))}
          </div>
        )}

        {/* Emoji Grid */}
        <div 
          className="p-4 overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(156, 163, 175, 0.5) rgba(55, 65, 81, 0.3)',
            maxHeight: '280px'
          }}
        >
          {searchTerm && (
            <div className="mb-3">
              <span className="text-gray-400 text-sm">All Emojis</span>
            </div>
          )}
          {!searchTerm && (
            <div className="mb-3">
              <span className="text-gray-400 text-sm">{emojiCategories[activeCategory]?.name}</span>
            </div>
          )}
          
          <div className="grid grid-cols-8 gap-2">
            {filteredEmojis.map((emoji, index) => (
              <motion.button
                key={`${emoji}-${index}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.005, duration: 0.15 }}
                whileHover={{ scale: 1.3, zIndex: 10 }}
                whileTap={{ scale: 1.5 }}
                onClick={() => handleEmojiClick(emoji)}
                className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:shadow-lg cursor-pointer"
                style={{ transformOrigin: "center" }}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-700 bg-gray-800/50">
          <div className="text-xs text-gray-400 text-center">
            Click an emoji to add it to your post
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
