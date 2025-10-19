import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    maxlength: 500, // Stories can have text content
  },
  media: {
    type: String, // Path to image/video file
  },
  mediaType: {
    type: String,
    enum: ["image", "video"],
  },
  backgroundColor: {
    type: String,
    default: "#000000", // For text-only stories
  },
  textColor: {
    type: String,
    default: "#ffffff",
  },
  textElements: [{
    id: { type: String },
    text: { type: String },
    x: { type: Number, default: 50 },
    y: { type: Number, default: 50 },
    color: { type: String, default: "#ffffff" },
    size: { type: Number, default: 24 },
    font: { type: String, default: "modern" },
    background: { type: String, default: "none" },
    rotation: { type: Number, default: 0 }
  }],
  stickers: [{
    id: { type: String },
    type: { type: String },
    x: { type: Number },
    y: { type: Number },
    size: { type: Number, default: 50 }
  }],
  music: {
    title: { type: String },
    artist: { type: String },
    duration: { type: Number }, // in seconds
    startTime: { type: Number, default: 0 }, // start time for the clip in seconds
    endTime: { type: Number }, // end time for the clip in seconds
    audioUrl: { type: String }, // URL to the audio file
    coverArt: { type: String }, // URL to album cover
    isCustom: { type: Boolean, default: false }, // true if user uploaded custom music
  },
  gif: {
    url: { type: String }, // GIPHY URL
    width: { type: Number },
    height: { type: Number },
    title: { type: String },
  },
  duration: {
    type: Number,
    default: 5000, // Default 5 seconds in milliseconds
  },
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from creation
  },
}, {
  timestamps: true,
});

// Index for efficient querying
storySchema.index({ author: 1, createdAt: -1 });
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Virtual for view count
storySchema.virtual("viewCount").get(function() {
  return this.views.length;
});

// Method to check if story is expired
storySchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Method to add a view
storySchema.methods.addView = async function(userId) {
  const userIdStr = userId.toString();
  const authorIdStr = this.author.toString();
  
  // NEVER add view if it's the story owner
  if (authorIdStr === userIdStr) {
    console.log(`🚫 Owner ${userIdStr} viewing their own story - BLOCKED`);
    return this;
  }

  // Don't add view if user already viewed this story
  const existingView = this.views.find(view => view.user.toString() === userIdStr);
  if (existingView) {
    console.log(`🚫 User ${userIdStr} already viewed story ${this._id} - BLOCKED duplicate`);
    return this;
  }

  // Add the view
  this.views.push({ user: userId });
  console.log(`✅ Adding view for user ${userIdStr} to story ${this._id}`);
  return await this.save();
};

// Method to clean up invalid views (owner views and duplicates)
storySchema.methods.cleanupViews = async function() {
  const authorId = this.author.toString();
  const uniqueViews = [];
  const seenUsers = new Set();

  for (const view of this.views) {
    const userId = view.user.toString();
    
    // Skip owner views and duplicate views
    if (userId !== authorId && !seenUsers.has(userId)) {
      uniqueViews.push(view);
      seenUsers.add(userId);
    }
  }

  if (uniqueViews.length !== this.views.length) {
    this.views = uniqueViews;
    console.log(`Cleaned up views for story ${this._id}: ${this.views.length} valid views remaining`);
    return await this.save();
  }
  
  return this;
};

export default mongoose.model("Story", storySchema);