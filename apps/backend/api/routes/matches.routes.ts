import { Hono } from "hono";
import { matchesController } from "../controllers/matches.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const matchesRoutes = new Hono();

matchesRoutes.use("/*", authMiddleware);

matchesRoutes.post("/tournament/:tournamentId/stage/:stageId", (c) =>
	matchesController.createMatch(c),
);
matchesRoutes.get("/:id", (c) => matchesController.getMatch(c));
matchesRoutes.put("/:id", (c) => matchesController.updateMatch(c));
matchesRoutes.get("/tournament/:tournamentId", (c) =>
	matchesController.getTournamentMatches(c),
);

export { matchesRoutes };
