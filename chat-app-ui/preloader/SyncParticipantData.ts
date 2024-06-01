import axios from "axios";

export const syncParticipantData = async (authName:any, search:string = "") => {
  return new Promise(async (resolve, reject) => {
    try {
      const userRes = await axios.get(
        `${process.env.NEXT_PUBLIC_FE_HOST}:9000/api/conversations?search=${search}`,
        {
          withCredentials: true,
        }
      );
      const userGroupsRes = await axios.get(
        `${process.env.NEXT_PUBLIC_FE_HOST}:9000/api/groupConversations?search=${search}`,
        {
          withCredentials: true,
        }
      );      
      resolve([...userRes?.data,...userGroupsRes.data]);
    } catch (e) {
      reject();
    }
  });
};
