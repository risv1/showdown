import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

import { verifyJwt } from "../../utils/jwt.utils";

export const authMiddleware = async (c: Context, next: Next) => {
	try {
		const authHeader = c.req.header("Authorization");

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			throw new HTTPException(401, {
				message: "Authorization header missing or invalid",
			});
		}

		const token = authHeader.substring(7);

		if (!token) {
			throw new HTTPException(401, { message: "Token missing" });
		}

		const decoded = verifyJwt(token);

		if (typeof decoded === "object" && decoded.userId) {
			c.set("userId", decoded.userId);
		} else {
			throw new HTTPException(401, { message: "Invalid token payload" });
		}

		await next();
	} catch (error) {
		if (error instanceof HTTPException) {
			throw error;
		}

		console.error("Auth middleware error:", error);
		throw new HTTPException(401, { message: "Invalid or expired token" });
	}
};
