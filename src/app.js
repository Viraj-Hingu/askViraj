import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import connect from "../config/database.config.js";
import authRouter from "../routes/auth.routes.js";
import chatRouter from "../routes/chat.routes.js";

const app = express();

// ================= PATH FIX =================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= DB =================
connect();

// ================= MIDDLEWARE =================
const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ================= ROUTES =================
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

// ================= STATIC FRONTEND =================
app.use(express.static(path.join(__dirname, "..", "public")));

// ================= REACT FALLBACK =================
app.get("*name", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

export default app;