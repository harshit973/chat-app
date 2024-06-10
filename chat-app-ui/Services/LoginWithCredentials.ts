import http from "@/utils/AxiosInterceptor";

export const loginWithCredentials = (username: string, password: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await http.post(`/api/auth/signin`, {
        username: username,
        password: password,
      });
      resolve(res);
    } catch (e) {
      reject(e);
    }
  });
};
