import express from "express"
import { createGroup, deleteChat, getAllGroups, getChats } from "../controllers/GroupChatController.js";

const router = express.Router();

router.get('/', getAllGroups);
router.post("/",createGroup)
router.get('/:gId/messages', getChats);
router.delete('/message/:mId', deleteChat);


export default router