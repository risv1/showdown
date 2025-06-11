import Redis from "ioredis";

import { env } from "../config/env.js";

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 3,
      lazyConnect: false,
    });

    redisClient.on("connect", () => {
      console.log("✅ Redis connected successfully");
    });

    redisClient.on("error", (error) => {
      console.error("❌ Redis connection error:", error);
    });

    redisClient.on("ready", () => {
      console.log("🚀 Redis is ready to accept commands");
    });
  }

  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};

export const redis = getRedisClient();
