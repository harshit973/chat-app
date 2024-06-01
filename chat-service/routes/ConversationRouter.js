import express from "express"
import { createConversation, deleteChat, getAllConversations, getChats, addParticipant } from "../controllers/ChatController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post('/', createConversation);

router.patch("/:conversationId/addParticipant",addParticipant)

router.use(verifyToken)

router.get('/', getAllConversations);
router.get('/:cId/messages', getChats);
router.delete('/:cId/message/:mId', deleteChat);


export default router;