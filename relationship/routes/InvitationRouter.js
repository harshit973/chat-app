import express from "express"
import { createInvitationUrl, joinViaInvitationUrl } from "../controller/InvitationController.js";

export const invitationRouter = express.Router();

invitationRouter.post("/",createInvitationUrl)
invitationRouter.get("/:invitationId/join",joinViaInvitationUrl)
