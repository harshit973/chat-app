import axios from "axios";

export const syncAuthData = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const userRes = await axios.get(
        `${process.env.NEXT_PUBLIC_FE_HOST}:9000/api/auth/decode`,
        {
          withCredentials: true,
        }
      );
      resolve(userRes?.data?.decoded);
    } catch (e) {
      reject();
    }
  });
};
