import { Router } from "express";
import {
  getMe,
  loginUser,
  logoutUser,
  registerUser,
} from "../controller/auth.controller.js";
import {
  loginValiator,
  registerValidator,
} from "../validator/auth.validator.js";
import { identify, identifyOptional } from "../middleware/auth.middleware.js";

const authRouter = Router();
authRouter.post("/register", registerValidator, registerUser);
authRouter.post("/login", loginValiator, loginUser);
authRouter.get("/getme", identifyOptional, getMe);
authRouter.post("/logout", logoutUser);
export default authRouter;
