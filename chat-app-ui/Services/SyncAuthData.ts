import http from "@/utils/AxiosInterceptor";

export const syncAuthData = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const userRes = await http.get(`/api/auth/decode`);
      resolve(userRes?.data?.decoded);
    } catch (e) {
      reject();
    }
  });
};
