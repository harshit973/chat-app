import { deleteGroupChat, getGroupChats, getGroups, isAuthorizedForGroup,createGroup as createGrooupFromModal } from "../services/ChatService.js";

export const getAllGroups = async (req, res) => {
  const {authName} = req?.session;
  try {
    const conversations = await getGroups(authName);
    res.status(200).json(conversations || []);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const createGroup = async (req, res) => {
  const {name,participants} = req?.body;
  try {
    if(await isAuthorizedForGroup(participants)){
      const group = await createGrooupFromModal(name,participants);
      res.status(200).json(group || {});
    }else{
      res.status(400).send(`You are unauthorized to form group with these participants`);      
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getChats = async (req, res) => {
  const { gId } = req?.params;
  try {
    if(!gId || gId === ''){
      res.status(404).send("Group Conversation Id not found");      
    }
    const messages = await getGroupChats(gId);
    res.status(200).json(messages || []);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteChat = async (req, res) => {
  const { gId,mId } = req?.params;
  try {
    const messages = await deleteGroupChat(gId,mId);
    res.status(200).json(messages || []);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
