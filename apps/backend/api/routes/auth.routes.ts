import { Hono } from "hono";

import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const authRoutes = new Hono();

authRoutes.post("/register", (c) => authController.register(c));
authRoutes.post("/login", (c) => authController.login(c));

authRoutes.use("/*", authMiddleware);
authRoutes.get("/session", (c) => authController.checkSession(c));
authRoutes.get("/profile", (c) => authController.getProfile(c));
authRoutes.post("/refresh-showdown", (c) =>
	authController.refreshShowdownData(c),
);

export { authRoutes };
