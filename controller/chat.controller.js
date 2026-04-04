import chatModel from "../model/chat.model.js";
import messageModel from "../model/message.model.js";
import { generateResponse, generateTitle } from "../service/ai.service.js";
import mongoose from "mongoose";

const sendSuccess = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export const sendMessage = async (req, res) => {
  try {
    const { message, chat: chatID } = req.body;
    const trimmedMessage = message?.trim();

    if (!trimmedMessage) {
      return sendError(res, 400, "Message is required");
    }

    let chat = null;
    let chatId = chatID;

    if (!chatId) {
      const title = await generateTitle(message);
      chat = await chatModel.create({
        user: req.user.id,
        title,
      });
      chatId = chat._id;
    } else {
      chat = await chatModel.findOne({ _id: chatId, user: req.user.id });
      if (!chat) {
        return sendError(res, 404, "Chat not found");
      }
    }

    // persist user's message
    const userMessage = await messageModel.create({
      chat: chatId,
      content: trimmedMessage,
      role: "user",
    });

    // load recent conversation history to pass to the model
    const recentMessages = await messageModel
      .find({ chat: chatId })
      .sort({ createdAt: 1 })
      .limit(50)
      .lean();

    const history = recentMessages
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const aiText = await generateResponse(trimmedMessage, history);

    const aiMessage = await messageModel.create({
      chat: chatId,
      content: aiText,
      role: "assistant",
    });

    const updatedChat = await chatModel.findByIdAndUpdate(
      chatId,
      { $set: { updatedAt: new Date() } },
      { new: true },
    );

    return sendSuccess(res, 201, "Message sent successfully", {
      title: updatedChat.title,
      chat: {
        id: updatedChat._id,
        user: updatedChat.user,
        title: updatedChat.title,
        createdAt: updatedChat.createdAt,
        updatedAt: updatedChat.updatedAt,
      },
      aiMessage,
      userMessage,
    });
  } catch (error) {
    console.log("sendMessage error:", error);
    return sendError(res, 500, "Failed to send message");
  }
};

export const getchat = async (req, res) => {
  try {
    const user = req.user.id;
    const chats = await chatModel.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "_id",
          foreignField: "chat",
          as: "messages",
        },
      },
      {
        $addFields: {
          messageCount: { $size: "$messages" },
        },
      },
      {
        $project: {
          messages: 0,
        },
      },
      {
        $sort: {
          updatedAt: -1,
        },
      },
    ]);

    return sendSuccess(res, 200, "Chats fetched successfully", {
      chats,
    });
  } catch (error) {
    console.log("getchat error:", error);
    return sendError(res, 500, "Failed to fetch chats");
  }
};

export const getMessages = async (req, res) => {
  try {
    const { chatID } = req.params;

    const chat = await chatModel.findOne({
      _id: chatID,
      user: req.user.id,
    });

    if (!chat) {
      return sendError(res, 404, "Chat not found");
    }

    const messages = await messageModel.find({
      chat: chatID,
    }).sort({ createdAt: 1 });

    return sendSuccess(res, 200, "Messages fetched successfully", {
      chat: {
        id: chat._id,
        title: chat.title,
      },
      messages,
    });
  } catch (error) {
    console.log("getMessages error:", error);
    return sendError(res, 500, "Failed to fetch messages");
  }
};

export const delMessage = async (req, res) => {
  try {
    const { chatID } = req.params;

    const chat = await chatModel.findOneAndDelete({
      _id: chatID,
      user: req.user.id,
    });

    if (!chat) {
      return sendError(res, 404, "Chat not found");
    }

    await messageModel.deleteMany({
      chat: chatID,
    });

    return sendSuccess(res, 200, "Chat deleted successfully", {
      deletedChatId: chatID,
    });
  } catch (error) {
    console.log("delMessage error:", error);
    return sendError(res, 500, "Failed to delete chat");
  }
};
