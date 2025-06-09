import jwt from "jsonwebtoken";

import { env } from "../config/env";

export const generateJwt = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.EXPIRY_TIME });
};

export const verifyJwt = (token: string): string | jwt.JwtPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
