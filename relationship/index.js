import express, { json } from "express";
import { getHealth } from "./HealthView.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import { connectToMongoDb } from "./db/ConnectToMongoDb.js";
import cookieParser from "cookie-parser";
import { publish, subscribe } from "./pubsub/redis/PubSub.js";
import requestRouter from "./routes/ConversationRequestRouter.js";
import verifyToken from "./middleware/verifyToken.js";
import {
  createRequest,
  deleteRequest,
  updateStatus,
} from "./services/ChatRequestService.js";
import { createConversation } from "./services/ChatService.js";
import { invitationRouter } from "./routes/InvitationRouter.js";

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
    subscribe(`friend_request_${username}`, async (msgString) => {
      const payload = JSON.parse(msgString);
      const receiver = payload?.receiver;
      const senderSocket = userSocketMap.get(username);
      senderSocket?.emit(`friend_request_${receiver}`, payload);
    });
    subscribe(`friend_request_accept_${username}`, async (msgString) => {
      const msg = JSON.parse(msgString);
      const receiver = msg?.receiver;
      const senderSocket = userSocketMap.get(username);
      const room = createConversationRoom(username, receiver);
      const payload = { rId: rId, room: room };
      senderSocket?.emit(`friend_request_accept_${receiver}`, payload);
    });
    subscribe(`friend_request_reject_${username}`, async (msgString) => {
      const msg = JSON.parse(msgString);
      const receiver = msg?.receiver;
      const senderSocket = userSocketMap.get(username);
      const payload = { rId: msg?.rId };
      senderSocket?.emit(`friend_request_reject_${receiver}`, payload);
    });
  }

  userSocketMap.set(username, socket);

  socket.on(`friend_request`, async (msg) => {
    const sender = msg?.sender;
    const receiver = msg?.receiver;
    const receiverSocket = userSocketMap.get(receiver);
    const senderSocket = userSocketMap.get(sender);    
    const reqObj = await createRequest(sender, receiver);
    const payload = {rId: reqObj?._id, ...msg}
    senderSocket?.emit(`friend_request`, payload)
    if (receiverSocket) {
      receiverSocket?.emit(`friend_request`, payload);
    } else {
      publish(`friend_request_${receiver}`, JSON.stringify(msg));
    }
  });

  socket.on(`friend_request_accept`, async (msg) => {
    const receiver = msg?.receiver;
    const sender = msg?.sender;
    const rId = msg?.rId;
    await updateStatus(rId, true);
    const room = await createConversation(sender, receiver);
    await deleteRequest(rId)
    const senderSocket = userSocketMap.get(sender);
    const receiverSocket = userSocketMap.get(receiver);
    const payload = { rId: rId, room: room };
    receiverSocket?.emit("friend_request_accept_acknowledgement",payload)
    if (senderSocket) {
      senderSocket.emit(`friend_request_accept_${receiver}`, payload);
    } else {
      publish(`friend_request_accept_${receiver}`, JSON.stringify(msg));
    }
  });

  socket.on(`friend_request_reject`, async (msg) => {
    const receiver = msg?.receiver;
    const sender = msg?.sender;
    const rId = msg?.rId;
    updateStatus(rId, false);
    deleteRequest(rId)
    const senderSocket = userSocketMap.get(sender);
    if (senderSocket) {
      const payload = { rId: rId, room: room };
      senderSocket.emit(`friend_request_reject_${receiver}`, payload);
    } else {
      publish(`friend_request_reject_${receiver}`, JSON.stringify(msg));
    }
  });
});
app.get("/health", getHealth);

app.use(verifyToken);

app.use("/conversationRequest", requestRouter);
app.use("/invitation", invitationRouter);

server.listen(port, () => {
  connectToMongoDb();
  console.log(`Server is running on ${port}`);
});
