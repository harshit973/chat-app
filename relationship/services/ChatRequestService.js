import { ChatRequestModel } from "../db/modals/ChatRequestSchema.js";

export const getAllRequests = async (sender, receiver, status) => {
  let body = { active: true };
  if (sender) {
    body = { ...body, sender: sender };
  }
  if (receiver) {
    body = { ...body, receiver: receiver };
  }
  if (typeof status === "boolean" || status === null) {
    body = { ...body, status: status };
  }
  return await ChatRequestModel.aggregate([
    { $match: { ...body } },
    {
      $project: {
        _id: 0,
        rId: "$_id",
        sender: "$sender",
        receiver: "$receiver",
        status: "$status",
      },
    },
  ]);
};

export const updateStatus = async (rId, status) => {
  const statusUpdated = await isStatusUpdated(rId);
  if (!statusUpdated) {
    return await ChatRequestModel.findOneAndUpdate(
      { _id: rId, active: true },
      { status: status }
    );
  }
  return null;
};

export const deleteRequest = async (rId) => {
  await ChatRequestModel.findByIdAndUpdate({ _id: rId }, { active: false });
};

const isStatusUpdated = async (rId) => {
  const request = await ChatRequestModel.findOne({ _id: rId, active: true });
  return request && !(request?.status === null);
};

const requestExists = async (sender, receiver) => {
  const request = await ChatRequestModel.findOne({
    sender: sender,
    receiver: receiver,
    active: true,
  });
  return request ? true : false;
};

export const createRequest = async (sender, receiver) => {
  if (!sender || !receiver || (await requestExists(sender, receiver))) {
    return null;
  }
  return await ChatRequestModel.create({ sender: sender, receiver: receiver });
};