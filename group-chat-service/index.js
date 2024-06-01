import express, { json } from "express";
import { getHealth } from "./HealthView.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import { connectToMongoDb } from "./db/ConnectToMongoDb.js";
import cookieParser from "cookie-parser";
import { publish, subscribe } from "./pubsub/redis/PubSub.js";
import groupRouter from "./routes/GroupConversationRouter.js";
import {
  createGroup,
  getGroupInfo,
  saveGroupChat,
} from "./services/ChatService.js";
import { deleteGroupChat } from "./services/ChatService.js";
import verifyToken from "./middleware/verifyToken.js";

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
    subscribe(`typing_${username}`, async (msgString) => {
      const msg = JSON.parse(msgString);
      const receiverSocket = userSocketMap.get(username);
      if (receiverSocket) {
        receiverSocket.emit("typing msg", msg);
      }
    });    
    subscribe(`delete_${username}`, async (msgString) => {
      const msg = JSON.parse(msgString);
      const receiverSocket = userSocketMap.get(username);
      if (receiverSocket) {
        receiverSocket.emit("delete msg", msg);
      }
    });
    subscribe(`add_group_${username}`, async (msgString) => {
      const payload = JSON.parse(msgString);
      const receiverSocket = userSocketMap.get(username);
      receiverSocket?.emit("added to group", payload);
    });    
  }

  userSocketMap.set(username, socket);

  socket.on("add group", async(group)=>{
    const name = group?.name;
    const participants = group.participants;
    const createdGroup = await createGroup(name,participants)
    participants?.forEach((participant)=>{
      const memberSocket = userSocketMap.get(participant)
      if(memberSocket){
        memberSocket?.emit("added to group",createdGroup);
      }else{
        publish(`add_group_${participant}`, JSON.stringify(createGroup));        
      }
    })
  })


  socket.on("typing msg", async(typingMsg) => {
    const cId = typingMsg?.cId;
    const receivers = await getGroupInfo(cId);
    const sender = typingMsg?.sender;
    receivers?.participants?.forEach((receiver) => {
      if (receiver !== sender) {
        const receiverSocket = userSocketMap.get(receiver);
        if (receiverSocket) {
          receiverSocket.emit("typing msg", typingMsg);
        } else {
          publish(`typing_${receiver}`, JSON.stringify(typingMsg));
        }
      }
    });
  });

  socket.on("delete group msg", async (msg) => {
    const cId = msg?.cId;
    const mId = msg?.mId;
    await deleteGroupChat(cId, mId);
    const receivers = await getGroupInfo(cId);
    const sender = msg?.sender;
    receivers?.participants?.forEach((receiver) => {
      if (receiver !== sender) {
        const receiverSocket = userSocketMap.get(receiver);
        if (receiverSocket) {
          receiverSocket.emit("delete msg", msg);
        } else {
          publish(`delete_${receiver}`, JSON.stringify(msg));
        }
      }
    });
  });

  socket.on("broadcast msg", async (msg) => {
    const cId = msg?.cId;
    const receivers = await getGroupInfo(cId);
    const sender = msg?.sender;
    const senderSocket = userSocketMap.get(sender);
    const text = msg?.text;
    const message = await saveGroupChat(cId, sender, text);
    const payload = { ...msg, mId: message?._id };
    senderSocket.emit("sender msg", { ...payload, isSender: true });
    receivers?.participants?.forEach((receiver) => {
      if (receiver !== sender) {
        const receiverSocket = userSocketMap.get(receiver);
        if (receiverSocket) {
          receiverSocket.emit("receive msg", payload);
        } else {
          publish(`chat_${receiver}`, JSON.stringify(payload));
        }
      }
    });
  });
});
app.use(verifyToken)

app.get("/health", getHealth);
app.use("/groupConversations", groupRouter);

server.listen(port, () => {
  connectToMongoDb();
  console.log(`Server is running on ${port}`);
});
