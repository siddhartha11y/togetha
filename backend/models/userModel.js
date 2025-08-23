import mongoose from "mongoose";



const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePicture: {
      type: String,
      default: "/images/default-avatar.png", // better local default image
    },
    bio: {
      type: String,
      default: "",
    },
    fullName: { type: String, trim: true, default: "" }, // 👈 added

    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,

      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
const User = mongoose.model("User", userSchema);
export default User;
