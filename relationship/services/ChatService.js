import axios from "axios";

export const createConversation = async (sender, receiver) => {
  try {
    const res = await axios.post(
      `${process.env.CHAT_HOST}/conversations`,
      {
        participants: [sender, receiver],
      },
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
  return {};
};
