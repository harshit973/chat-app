import { userModal } from "../db/models/UserSchema.js";
import { refineForSearch } from "../utill/Text.js";

export const getUsers = async (req, res) => {
  const { search } = req?.query;
  const refinedText = `.*${refineForSearch(search)}.*`;
  try {
    const usersRes = await userModal.find({
      username: { $regex: refinedText, $options: "i" }
    },"username");
    res.status(200).json(usersRes);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateStatus = async (req, res) => {
  const { status } = req?.body;
  const {authName} = req?.params;
  console.log(authName,status)
  if(!authName){
    res.status(404).send("User not found")
  }
  await userModal.updateOne({ username: authName }, { status: status });
  res.status(200).send("updated everything");
};

export const getStatus = async (req, res) => {
  const {users} = req?.body;
  if(!users){
    res.status(404).send("User not found")
  }else{
    const mRes = await userModal.find({username: {$in: users}},["username","status"]);
    res.status(200).json(mRes)  
  }
};
