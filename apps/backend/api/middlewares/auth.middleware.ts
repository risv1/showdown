import type { Context, Next } from "hono";

import { verifyJwt } from "../../utils/jwt.utils.js";

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json(
        {
          success: false,
          error: "Authorization header missing or invalid",
        },
        401
      );
    }

    const token = authHeader.substring(7);

    if (!token) {
      return c.json(
        {
          success: false,
          error: "Token missing",
        },
        401
      );
    }

    const decoded = verifyJwt(token);

    if (typeof decoded === "object" && decoded.userId) {
      c.set("userId", decoded.userId);
    } else {
      return c.json(
        {
          success: false,
          error: "Invalid token payload",
        },
        401
      );
    }

    await next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return c.json(
      {
        success: false,
        error: "Invalid or expired token",
      },
      401
    );
  }
};
