import Redis from "ioredis";

import dotenv from "dotenv";

dotenv.config();

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PWD,
  username: process.env.REDIS_USER,
  tls: {},
});

