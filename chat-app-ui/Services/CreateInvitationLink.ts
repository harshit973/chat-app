import http from "@/utils/AxiosInterceptor";

export const CreateInvitationLink = (conversationId: string, expiryInSec: number):any => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await http.post(
        `/api/invitation`,
        {
          groupId: conversationId,
          expiryInSec: expiryInSec,
        }
      );
      resolve(res.data);
    } catch (e) {
      reject(e);
    }
  });
};
