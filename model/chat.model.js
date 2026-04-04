import mongoose from "mongoose";

const chatSchema =  mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    title: {
      type: String,
      default: "New chat",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const chatModel = mongoose.model("chat", chatSchema);
export default chatModel;
