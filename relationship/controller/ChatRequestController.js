import {getAllRequests as getRequestsFromModal} from "../services/ChatRequestService.js";

export const getAllRequests = async (req, res) => {
  const { sender, receiver,status } = req?.query;
  if ((!sender || sender === "") && (!receiver || receiver === "")) {
    res.status(404).send("Sender or receiver is required");
  }else{
    const requests = await getRequestsFromModal(sender, receiver,status === 'true' ? true : status === 'false' ? false : null);
    res.status(200).json(requests);  
  }
};