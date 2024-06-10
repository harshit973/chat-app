import Tinyurl from "tinyurl";
import { InvitationModal } from "../db/modals/InvitationSchema.js";
import axios from "axios";

export const generateInvitationUrl = async (conversationId, expiryInSec) => {
  if (!conversationId || !expiryInSec) {
    throw new Error("Conversation id and expiry is required");
  }
  const invitation = await InvitationModal.create({
    conversationId: conversationId,
    expiryInSec: expiryInSec,
  });
  const invitationId = invitation._id;
  const originalInvitationUrl = `${process.env.API_GATEWAY}/api/invitation/${invitationId}/join`;
  const shortInvitationUrl = await getTinyUrl(originalInvitationUrl);
  return shortInvitationUrl;
};

export const getTinyUrl = async (invitationUrl) => {
  try {
    const shortUrl = await Tinyurl.shorten(invitationUrl);
    return shortUrl;
  } catch (e) {
    console.log(e);
  }
};
const isInvitationValid = (invitation) => {
  if (!invitation) {
    return false;
  }
  const createdDate = invitation.createdOn;
  const expiryDate = createdDate.setSeconds(
    createdDate.getSeconds() + (invitation?.expiryInSec ?? 0)
  );
  const currentDate = new Date();
  if (expiryDate < currentDate) {
    return false;
  }
  return true;
};

export const processInvitation = async (invitationId, authName) => {
  const invitation = await InvitationModal.findById(invitationId);
  if (!isInvitationValid(invitation)) {
    throw new Error("Invalid invitation Url");
  }
  const conversationId = invitation.conversationId;
  await axios.patch(
    `${process.env.CHAT_HOST}/conversations/${conversationId}/addParticipant`,
    { participantName: authName }
  );
  return invitation;
};
