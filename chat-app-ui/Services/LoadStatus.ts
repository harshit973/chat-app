import http from "@/utils/AxiosInterceptor";

export const getStatus = (friends: any):any => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await http.post(
        `/api/status`,
        { users: friends },
        {
          withCredentials: true,
        }
      );
      resolve(res.data);
    } catch (e) {
      reject(e);
    }
  });
};
