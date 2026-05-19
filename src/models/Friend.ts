import mongoose from "mongoose";

const friendSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    friend: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    nickname: {
      type: String,
      trim: true,
      default: "",
    },
    isMuted: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// One owner can have each friend only once
friendSchema.index({ owner: 1, friend: 1 }, { unique: true });

const Friend = mongoose.model("Friend", friendSchema);
export default Friend;
