import express, { json } from "express";
import { getHealth } from "./HealthView.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import { connectToMongoDb } from "./db/ConnectToMongoDb.js";
import cookieParser from "cookie-parser";
import { publish, subscribe } from "./pubsub/redis/PubSub.js";
import router from "./routes/ConversationRouter.js";
import {
  deleteChat,
  getFriends,
  saveChat,
  updateStatus,
} from "./services/ChatService.js";

const app = express();
dotenv.config();
const port = process.env.PORT || 8091;
const server = http.createServer(app);
const io = new Server(server, JSON.parse(process.env.CORS));
const userSocketMap = new Map();
app.use(cookieParser());
app.use(json());
io.on("connection", (socket) => {
  const username = socket.handshake.query.username;

  if (!userSocketMap.get(username)) {
    subscribe(`chat_${username}`, async (msgString) => {
      const msg = JSON.parse(msgString);
      const receiverSocket = userSocketMap.get(username);
      if (receiverSocket) {
        receiverSocket.emit("receive msg", msg);
      }
    });
    subscribe(`delete_${username}`, async (msgString) => {
      const msg = JSON.parse(msgString);
      const receiverSocket = userSocketMap.get(username);
      if (receiverSocket) {
        receiverSocket.emit("delete msg", msg);
      }
    });
    subscribe(`typing_${username}`, async (msgString) => {
      const msg = JSON.parse(msgString);
      const receiverSocket = userSocketMap.get(username);
      if (receiverSocket) {
        receiverSocket.emit("typing msg", msg);
      }
    });
    subscribe(`status_${username}`, async (msgString) => {
      const payload = JSON.parse(msgString);
      const receiverSocket = userSocketMap.get(username);
      receiverSocket?.emit("status msg", payload);
    });
  }

  userSocketMap.set(username, socket);

  updateStatus(username, 1);

  getFriends(username).then((rooms) => {
    rooms.forEach((room) => {
      const participants = room?.participants;
      const receiver =
        participants?.[0] === username ? participants?.[1] : participants?.[0];
      const receiverSocket = userSocketMap.get(receiver);
      const payload = { username: username, status: 1 };
      if (receiverSocket) {
        receiverSocket.emit("status msg", payload);
      } else {
        publish(`status_${receiver}`, JSON.stringify(payload));
      }
    });
  });

  socket.on("disconnect", (reason) => {
    updateStatus(username, 0);
    getFriends(username).then((rooms) => {
      rooms.forEach((room) => {
        const participants = room?.participants;
        const receiver =
          participants?.[0] === username
            ? participants?.[1]
            : participants?.[0];
        const receiverSocket = userSocketMap.get(receiver);
        const payload = { username: username, status: 0 };
        if (receiverSocket) {
          receiverSocket.emit("status msg", payload);
        } else {
          publish(`status_${receiver}`, JSON.stringify(payload));
        }
      });
    });
  });


  socket.on("msg", async (msg) => {
    const receiver = msg?.receiver;
    const receiverSocket = userSocketMap.get(receiver);
    const sender = msg?.sender;
    const senderSocket = userSocketMap.get(sender);
    const cId = msg?.cId;
    const text = msg?.text;
    const message = await saveChat(sender, cId, text);
    const payload = { ...msg,createdOn: message?.createdOn, mId: message._id };
    senderSocket.emit("sender msg", { ...payload, isSender: true });
    if (receiverSocket) {
      receiverSocket.emit("receive msg", payload);
    } else if (receiver) {
      publish(`chat_${receiver}`, JSON.stringify(payload));
    }
  });

  socket.on("typing msg", async (msg) => {
    const receiver = msg?.receiver;
    const receiverSocket = userSocketMap.get(receiver);
    if (receiverSocket) {
      receiverSocket.emit("typing msg", msg);
    } else if (receiver) {
      publish(`typing_${receiver}`, JSON.stringify(msg));
    }
  });

  socket.on("delete msg", async (msg) => {
    const cId = msg?.cId;
    const mId = msg?.mId;
    await deleteChat(cId, mId);
    const receiver = msg?.receiver;
    const receiverSocket = userSocketMap.get(receiver);
    if (receiverSocket) {
      receiverSocket.emit("delete msg", msg);
    } else if (receiver) {
      publish(`delete_${receiver}`, JSON.stringify(msg));
    }
  });
});
app.get("/health", getHealth);
app.use("/conversations", router);

server.listen(port, () => {
  connectToMongoDb();
  console.log(`Server is running on ${port}`);
});
