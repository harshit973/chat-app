import { redis } from "./ConnectToRedis.js";

export const redisSetter = (key, value) => {
  redis.set(key, value, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Set key:", result);
    }
  });
};

export const redisGetter = async (key) => {
  try {
    return await redis.get(key);
  } catch (e) {
    console.log(e)
    return null;
  }
};
