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
  saveGroupChat,
  updateStatus,
} from "./services/ChatService.js";
import { deleteGroupChat } from "./services/ChatService.js";

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
    subscribe(`status_${username}`, async (msgString) => {
      const payload = JSON.parse(msgString);
      const receiverSocket = userSocketMap.get(username);
      receiverSocket?.emit("status msg", payload);
    });    
    subscribe(`add_group_${username}`, async (msgString) => {
      const payload = JSON.parse(msgString);
      const receiverSocket = userSocketMap.get(username);
      receiverSocket?.emit("added to group", payload);
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
    const payload = { ...msg, mId: message._id };
    senderSocket.emit("sender msg", { ...payload, isSender: true });
    if (receiverSocket) {
      receiverSocket.emit("receive msg", payload);
    } else {
      publish(`chat_${receiver}`, JSON.stringify(payload));
    }
  });

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

  socket.on("delete msg", async (msg) => {
    const cId = msg?.cId;
    const mId = msg?.mId;
    await deleteChat(cId, mId);
    const receiver = msg?.receiver;
    const receiverSocket = userSocketMap.get(receiver);
    if (receiverSocket) {
      receiverSocket.emit("delete msg", msg);
    } else {
      publish(`delete_${receiver}`, JSON.stringify(msg));
    }
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
app.get("/health", getHealth);
app.use("/conversations", router);

server.listen(port, () => {
  connectToMongoDb();
  console.log(`Server is running on ${port}`);
});
