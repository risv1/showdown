import { config } from "dotenv";
import { z } from "zod";

config();

type Environment = {
  PORT: number;
  NODE_ENV: string;
  DB_URL: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  EXPIRY_TIME: "1h" | "2h" | "24h" | "7d" | "30d";
};

const envSchema = z.object({
  PORT: z.coerce.number().default(8000),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  DB_URL: z.string().default("postgres://postgres:postgres@localhost:5432/showdown"),
  REDIS_URL: z.string().default("redis://redis:redis@localhost:6379"),
  JWT_SECRET: z.string().default("your_jwt_secret"),
  EXPIRY_TIME: z.string().default("1h"),
});

export const env = envSchema.parse(process.env) as Environment;
