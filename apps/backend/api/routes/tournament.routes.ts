import { Hono } from "hono";
import { tournamentsController } from "../controllers/tournaments.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const tournamentRoutes = new Hono();

tournamentRoutes.use("/*", authMiddleware);

tournamentRoutes.post("/", (c) => tournamentsController.createTournament(c));
tournamentRoutes.get("/", (c) => tournamentsController.getUserTournaments(c));
tournamentRoutes.get("/available", (c) => tournamentsController.getAvailableTournaments(c));
tournamentRoutes.get("/:id", (c) => tournamentsController.getTournament(c));
// tournamentRoutes.get("/:id/details", (c) => tournamentsController.getTournamentDetails(c));

tournamentRoutes.get("/:id/basic", (c) => tournamentsController.getTournamentBasic(c));
tournamentRoutes.get("/:id/stages", (c) => tournamentsController.getTournamentStages(c));
tournamentRoutes.get("/:id/players", (c) => tournamentsController.getTournamentPlayers(c));
tournamentRoutes.get("/:id/matches", (c) => tournamentsController.getTournamentMatches(c));

tournamentRoutes.post("/:id/join", (c) => tournamentsController.joinTournament(c));
tournamentRoutes.post("/:id/stage-team", (c) => tournamentsController.submitStageTeam(c));
tournamentRoutes.get("/:id/stage/:stageId/team", (c) => tournamentsController.getStageTeam(c));

tournamentRoutes.put("/:id/stages", (c) => tournamentsController.updateTournamentStages(c));

tournamentRoutes.post("/:id/disable-joins", (c) => tournamentsController.disableJoins(c));
tournamentRoutes.post("/:id/start", (c) => tournamentsController.startTournament(c));
tournamentRoutes.post("/:id/end", (c) => tournamentsController.endTournament(c));
tournamentRoutes.patch("/:id/stage/:stageId", (c) => tournamentsController.updateStageStatus(c));

export { tournamentRoutes };
