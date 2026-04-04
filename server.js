import { initServer } from "./sockets/server.socket.js";
import app from "./src/app.js";
import http from "http";

const PORT = process.env.PORT || 3000;
if (!process.env.PORT) {
  console.warn("Environment variable PORT not set — defaulting to 3000");
}

const httpServer = http.createServer(app);
initServer(httpServer);
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
