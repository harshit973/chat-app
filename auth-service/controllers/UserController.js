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
