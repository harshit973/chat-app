import { generateInvitationUrl, processInvitation } from "../services/InvitationService.js";
import {publish} from "../pubsub/redis/PubSub.js"

export const createInvitationUrl = async(req, res) => {
  const { groupId, expiryInSec } = req?.body;
  const url = await generateInvitationUrl(groupId, expiryInSec);
  res?.status(200).json({ url: url });
};

export const joinViaInvitationUrl = async(req, res) => {
  const { invitationId } = req?.params;
  const { authName } = req?.session;
  try {
    const invitationInfo = await processInvitation(invitationId, authName);
    const cId = invitationInfo.conversationId;
    publish(`member_joined_${authName}`,JSON.stringify({conversationId: cId,member: authName}))
    res?.redirect(`${process.env.FE_HOST}/chat`);
  } catch (e) {
    console.log(e)
    res.status(400).send();
  }
};
