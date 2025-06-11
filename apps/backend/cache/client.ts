import { Redis } from "@upstash/redis";

import { env } from "../config/env.js";

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis({
      url: env.REDIS_URL,
      token: env.REDIS_TOKEN,
    });
  }

  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  redisClient = null;
};

export const getRedis = () => getRedisClient();
