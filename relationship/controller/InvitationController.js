import { generateInvitationUrl, processInvitation } from "../services/InvitationService.js";

export const createInvitationUrl = async(req, res) => {
  const { groupId, expiryInSec } = req?.body;
  const url = await generateInvitationUrl(groupId, expiryInSec);
  res?.status(200).json({ url: url });
};

export const joinViaInvitationUrl = (req, res) => {
  const { invitationId } = req?.params;
  const { authName } = req?.session;
  try {
    processInvitation(invitationId, authName);
    res?.status(200).send();
  } catch (e) {
    console.log(e)
    res.status(400).send();
  }
};
