import { statusModal } from "../db/models/StatusSchema.js";

export const getStatus = async (req, res) => {
  const {users} = req?.body;
  if(!users){
    res.status(404).send("User not found")
  }else{
    const status = await statusModal.find({username: {$in: users}},["username","status"]);
    res.status(200).json(status)  
  }
};
