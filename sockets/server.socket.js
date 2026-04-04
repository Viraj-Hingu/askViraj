import { Server } from "socket.io";
let io;

const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || "";
const allowedOrigins = FRONTEND_URL
  ? FRONTEND_URL.split(",").map((origin) => origin.trim()).filter(Boolean)
  : true;

export const initServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });
  console.log("Http server is running");

  io.on("connection", (socket) => {
    console.log("A user conneted:" + socket.id);
  });
};
