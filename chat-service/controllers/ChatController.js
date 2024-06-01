import {
  getChats as getChatsFromModel,
  deleteChat as deleteChatFromModal,
  searchMessages,
  getFriends,
  createConversation as createConversationFromModal,
  addParticipantToConversation
} from "../services/ChatService.js";

export const getChats = async (req, res) => {
  const { cId } = req?.params;
  const {search} = req?.query;
  try {
    if (!cId || cId === "") {
      res.status(404).send("Conversation Id not found");
    }
    let messages = [];
    if(search && search !== ""){
      messages = await searchMessages(cId,search);
    }else{
      messages = await getChatsFromModel(cId);
    }
    res.status(200).json(messages ?? []);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteChat = async (req, res) => {
  const { cId, mId } = req?.params;
  try {
    const messages = await deleteChatFromModal(cId, mId);
    res.status(200).json(messages || []);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAllGroups = async (req, res) => {
  const {sender} = req?.query;
  try {
    const conversations = await getGroups(sender);
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
      const group = await createGroupFromModal(name,participants);
      res.status(200).json(group || {});
    }else{
      res.status(400).send(`You are unauthorized to form group with these participants`);      
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAllConversations = async (req, res) => {
  const { search } = req?.query;
  const {authName} = req?.session;
  try {
    const conversations = await getFriends(authName,search);
    res.status(200).json(conversations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
export const createConversation = async (req, res) => {
  const { participants } = req?.body;
  try {
    const conversation = await createConversationFromModal(participants);
    res.status(200).json(conversation || []);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const addParticipant = async(req,res) =>{
  const {conversationId} = req?.params;
  const {participantName}=  req?.body;
  try{
    await addParticipantToConversation(conversationId,participantName)
    res?.status(200).send()
  }catch(e){
    console.log(e)
    res?.status(400).send("Unknown error")
  }
}