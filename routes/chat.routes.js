import { Router } from "express";
import { identify } from "../middleware/auth.middleware.js";
import {
  delMessage,
  getchat,
  getMessages,
  sendMessage,
} from "../controller/chat.controller.js";
const chatRouter = Router();

chatRouter.post("/message", identify, sendMessage);
chatRouter.get("/", identify, getchat);
chatRouter.get("/:chatID/message", identify, getMessages);
chatRouter.delete("/delete/:chatID", identify, delMessage);
export default chatRouter;
