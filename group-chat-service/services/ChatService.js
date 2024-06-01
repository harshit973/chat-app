import { GroupConversationModel } from "../db/models/GroupConversationSchema.js";
import { redisGetter, redisSetter } from "../caching/Redis/RedisTemplate.js";
import { refineForSearch } from "../utill/Text.js";
import mongoose, { Types } from "mongoose";
import {
  addToIndex,
  createIndex,
  deleteDoc,
  getSearchDocument,
  searchDoc,
} from "../opensearch/SearchService.js";
import axios from "axios";

export const getChats = async (cId) => {
  const conversation = await ConversationModel.findOne(
    { _id: cId, active: true },
    "messages"
  );
  return conversation?.messages;
};

export const saveChat = async (sender, cId, text) => {
  try {
    const newMessage = {
      _id: new Types.ObjectId(),
      sender: sender,
      text: text,
      createdOn: new Date(),
      active: true
    };
    ConversationModel.findOne({
      _id: cId,
      active: true,
    })
      .then((conversation) => {
        if (!conversation) {
          throw new Error("This conversation room does not exists");
        }
        if (!conversation?.messages) {
          conversation.messages = [newMessage];
        } else {
          conversation?.messages?.push(newMessage);
        }
        conversation.save().then(() => {
          addToIndex(cId, newMessage._id, getSearchDocument(newMessage));
        });
      })
      .catch((err) => {
        console.log(err);
      });
    return newMessage;
  } catch (error) {
    console.log(error);
  }
};

export const searchMessages = async (cId, searchText) => {
  const searchRes = await searchDoc(cId, {
    fuzzy: {
      text: {
        value: searchText,
        fuzziness: 2,
      },
    },
  });
  return (
    searchRes?.hits?.hits
      ?.filter((doc) => doc?._score === searchRes?.hits?.max_score)
      ?.map((doc) => {
        const mappedDoc = { ...doc?._source, _id: doc?._source?.id };
        delete mappedDoc?.id
        return mappedDoc;
      }) ?? []
  );
};

export const deleteChat = async (cId, mId) => {
  try {
    let conversation = await ConversationModel.findOne({
      _id: cId,
      active: true,
    });
    if (!conversation) {
      throw new Error("This conversation room does not exists");
    }
    conversation.messages = conversation.messages.filter((msg) => {
      msg._id !== new mongoose.Types.ObjectId(mId);
    });
    await conversation.save();
    deleteDoc(cId, mId);
  } catch (error) {
    console.log(error);
  }
};

export const deleteGroupChat = async (gId, mId) => {
  try {
    let conversation = await GroupConversationModel.findOne({
      _id: gId,
      active: true,
    });
    if (!conversation) {
      throw new Error("This conversation room does not exists");
    }
    conversation.messages = conversation.messages.filter((msg) => {
      msg._id !== new mongoose.Types.ObjectId(mId);
    });
    await conversation.save();
    deleteDoc(gId, mId);
  } catch (error) {
    console.log(error);
  }
};

export const saveGroupChat = async (id, sender, text) => {
  try {
    let conversation = await GroupConversationModel.findOne({
      _id: id,
      active: true,
    });
    if (!conversation) {
      throw new Error("This group does not exists");
    }
    const newMessage = {
      _id: new Types.ObjectId(),
      sender: sender,
      text: text,
      createdOn: new Date(),
      active: true      
    };
    conversation.messages.push(newMessage);
    conversation.save().then(() => {
      addToIndex(id, newMessage._id, getSearchDocument(newMessage));
    });
    return newMessage;
  } catch (error) {
    console.log(error.message);
  }
};

export const getGroupChats = async (id) => {
  try {
    let conversation = await GroupConversationModel.findOne({
      _id: id,
      active: true,
    });
    return conversation?.messages || [];
  } catch (error) {
    console.log(error.message);
  }
};

export const renameGroup = async (id, text) => {
  try {
    await GroupConversationModel.updateOne(
      { _id: id, active: true },
      { name: text }
    );
  } catch (error) {
    console.log(error.message);
  }
};

export const getFriends = async (authName, search = "") => {
  let queryBody = {
    $and: [{ participants: { $in: [authName] } }, { active: true }],
  };
  if (search !== "") {
    queryBody = {
      $and: [
        ...queryBody?.$and,
        {
          participants: {
            $regex: new RegExp(`.*${refineForSearch(search)}.*`),
            $options: "i",
          },
        },
      ],
    };
  }
  const conversations = await ConversationModel.find(queryBody, [
    "participants",
  ]);
  return conversations;
};

export const getGroups = async (authName, search = "") => {
  let queryBody = {
    $and: [{ participants: { $in: [authName] } }, { active: true }],
  };
  if (search !== "") {
    queryBody = {
      $and: [
        ...queryBody?.$and,
        {
          name: {
            $regex: new RegExp(`.*${refineForSearch(search)}.*`),
            $options: "i",
          },
        },
      ],
    };
  }
  const conversations = await GroupConversationModel.find(queryBody, [
    "participants",
    "name",
  ]);
  return conversations;
};

export const getGroupInfo = async (cId) => {
  const conversationCache = await redisGetter(cId);
  if (conversationCache) {
    return JSON.parse(conversationCache);
  }
  const conversation = await GroupConversationModel.findOne(
    {
      _id: cId,
      active: true,
    },
    ["participants", "name"]
  );
  redisSetter(
    cId,
    JSON.stringify({
      _id: conversation._id,
      participants: conversation.participants,
      name: conversation.name,
    })
  );
  return conversation;
};

export const createConversation = async (participants) => {
  try {
    if (!(await conversationExists(participants))) {
      const id = new Types.ObjectId();
      const conversation = await ConversationModel.create({
        _id: id,
        participants: participants,
      });
      createIndex(id);
      return conversation;
    }
  } catch (error) {
    console.log(error);
  }
  return {};
};

export const addParticipantToConversation = async (cId, participant) => {
  const conversation = await GroupConversationModel.findOne(
    {
      _id: cId,
      active: true,
    },
  );
  if(![...conversation.participants].includes(participant)){
    conversation.participants.push(participant);
  }
  await conversation.save()  
};


const conversationExists = async (participants) => {
  try {
    const conversation = await ConversationModel.findOne({
      participants: participants,
    });
    return conversation ? true : false;
  } catch (error) {
    console.log(error);
  }
  return false;
};

export const createGroup = async (name, participants) => {
  try {
    const id = new Types.ObjectId();
    const conversation = await GroupConversationModel.create({
      _id: id,
      name: name,
      participants: participants,
    });
    createIndex(id);
    return conversation;
  } catch (error) {
    console.log(error);
  }
};

export const isAuthorizedForGroup = async (participants) => {
  if (!participants || participants?.length === 0) {
    return false;
  }
  const rooms = await ConversationModel.find(
    { participants: { $in: participants } },
    "participants"
  );
  const connectedParticipants = new Set();
  rooms.forEach((room) => {
    const participants = [...room?.participants];
    participants.forEach((participant) =>
      connectedParticipants.add(participant)
    );
  });
  const unauthorizedParticipants = participants?.filter(
    (participant) => !connectedParticipants.has(participant)
  );
  return unauthorizedParticipants?.length === 0;
};

export const updateStatus = async (authName,flag) => {
  try{
    await axios.patch(`${process.env.AUTH_HOST}/users/${authName}/status`,{status: flag})
  }catch(e){
    console.log(e)
  }
}