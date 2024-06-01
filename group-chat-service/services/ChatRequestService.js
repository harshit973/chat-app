import { ChatRequestModel } from "../db/models/ChatRequestSchema.js";

export const getAllRequests = async (sender, receiver,status) => {
  let body = {};
  if (sender) {
    body = { sender: sender };
  }
  if (receiver) {
    body = { ...body, receiver: receiver };
  }
  if(typeof status === 'boolean' || status === null){
    body = {...body, status: status}
  }
  return await ChatRequestModel.find({ ...body, active: true });
};

export const updateStatus = async (rId, status) => {
  const statusUpdated = await isStatusUpdated(rId);
  if(!statusUpdated){
    return await ChatRequestModel.findOneAndUpdate(
      { _id: rId, active: true },
      { status: status }
    );
  }
  return null
};

const isStatusUpdated = async(rId) => {
  const request = await ChatRequestModel.findOne({_id: rId,active: true})
  return request && !(request?.status === null)
}

const requestExists = async (sender, receiver) => {
  const request = await ChatRequestModel.findOne({
    sender: sender,
    receiver: receiver,
    active: true
  });
  return request ? true : false;
};

export const createRequest = async (sender, receiver) => {
  if (await requestExists(sender, receiver)) {
    return null;
  }
  return await ChatRequestModel.create({ sender: sender, receiver: receiver });
};
