import http from "@/utils/AxiosInterceptor";

export const syncParticipantData = async (
  search: string = ""
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userRes = await http.get(`/api/conversations?search=${search}`);
      const userGroupsRes = await http.get(
        `/api/groupConversations?search=${search}`
      );
      resolve([...userRes?.data, ...userGroupsRes.data]);
    } catch (e) {
      reject();
    }
  });
};
