import express, { json } from "express";
import { getHealth } from "./HealthView.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import { connectToMongoDb } from "./db/ConnectToMongoDb.js";
import cookieParser from "cookie-parser";
import { publish } from "./pubsub/redis/PubSub.js";
import { updateStatus } from "./services/ChatService.js";
import router from "./routes/StatusRouter.js";

const app = express();
dotenv.config();
const port = process.env.PORT || 8091;
const server = http.createServer(app);
const io = new Server(server, JSON.parse(process.env.CORS));
app.use(cookieParser());
app.use(json());
io.on("connection", (socket) => {
  const username = socket.handshake.query.username;

  updateStatus(username, 1);

  publish(`status_msg_${username}`, JSON.stringify({ authName: username, status: 1 }));

  socket.on("disconnect", () => {
    updateStatus(username, 0);
    publish(`status_msg_${username}`, JSON.stringify({ authName: username, status: 0 }));
  });
});
app.get("/health", getHealth);

app.use("/status", router);

server.listen(port, () => {
  connectToMongoDb();
  console.log(`Server is running on ${port}`);
});
