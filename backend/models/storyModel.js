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
storySchema.methods.addView = function(userId) {
  // Don't add view if user already viewed this story
  const existingView = this.views.find(view => view.user.toString() === userId.toString());
  if (!existingView && this.author.toString() !== userId.toString()) {
    this.views.push({ user: userId });
    return this.save();
  }
  return Promise.resolve(this);
};

export default mongoose.model("Story", storySchema);