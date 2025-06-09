import { Hono } from "hono";
import { tournamentsController } from "../controllers/tournaments.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const tournamentRoutes = new Hono();

tournamentRoutes.use("/*", authMiddleware);

tournamentRoutes.post("/", (c) => tournamentsController.createTournament(c));
tournamentRoutes.get("/", (c) => tournamentsController.getUserTournaments(c));
tournamentRoutes.get("/available", (c) =>
	tournamentsController.getAvailableTournaments(c),
);
tournamentRoutes.get("/:id", (c) => tournamentsController.getTournament(c));
tournamentRoutes.get("/:id/details", (c) =>
	tournamentsController.getTournamentDetails(c),
);

tournamentRoutes.post("/:id/join", (c) =>
	tournamentsController.joinTournament(c),
);
tournamentRoutes.post("/:id/stage-team", (c) =>
	tournamentsController.submitStageTeam(c),
);
tournamentRoutes.get("/:id/stage/:stageId/team", (c) =>
	tournamentsController.getStageTeam(c),
);

tournamentRoutes.put("/:id/stages", (c) =>
	tournamentsController.updateTournamentStages(c),
);

tournamentRoutes.post("/:id/disable-joins", (c) =>
	tournamentsController.disableJoins(c),
);
tournamentRoutes.post("/:id/start", (c) =>
	tournamentsController.startTournament(c),
);
tournamentRoutes.post("/:id/end", (c) =>
	tournamentsController.endTournament(c),
);

export { tournamentRoutes };
