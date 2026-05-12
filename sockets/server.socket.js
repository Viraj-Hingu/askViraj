import { Server } from "socket.io";
let io;

export const initServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
  });
  console.log("Http server is running");

  io.on("connection", (socket) => {
    console.log("A user conneted:" + socket.id);
  });
};
