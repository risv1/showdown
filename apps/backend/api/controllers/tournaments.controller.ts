import { Context } from "hono";
import { z } from "zod";
import { matchesRepository } from "../../database/repositories/matches.repository";
import { tournamentsRepository } from "../../database/repositories/tournaments.repository";
import { usersRepository } from "../../database/repositories/users.repository";

const stageSchema = z.object({
  name: z.string().min(1).max(100),
  playersSelected: z.number().min(1),
});

const createTournamentSchema = z.object({
  name: z.string().min(1).max(100),
  format: z.string().min(1).max(50),
  description: z.string().min(1).max(1000),
  maxPlayers: z.number().min(2).max(1000),
  stages: z.array(stageSchema).min(1),
});

const submitTeamSchema = z.object({
  pokemonTeam: z.array(z.string()).min(1),
  stageId: z.number().min(1),
});

export class TournamentsController {
  async createTournament(c: Context) {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const body = await c.req.json();
      const validatedData = createTournamentSchema.parse(body);

      const { stages, ...tournamentData } = validatedData;

      if (stages[0].playersSelected > tournamentData.maxPlayers) {
        return c.json(
          { error: "First stage cannot select more players than tournament maximum" },
          400
        );
      }

      for (let i = 1; i < stages.length; i++) {
        if (stages[i].playersSelected > stages[i - 1].playersSelected) {
          return c.json(
            { error: "Each stage must select fewer or equal players than the previous stage" },
            400
          );
        }
      }

      const tournament = await tournamentsRepository.createTournamentWithStages({
        creator: parseInt(userId),
        ...tournamentData,
        stages,
      });

      return c.json(
        {
          message: "Tournament created successfully",
          tournament,
        },
        201
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: "Validation failed", details: error.errors }, 400);
      }
      console.error("Create tournament error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  async joinTournament(c: Context) {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const tournamentId = parseInt(c.req.param("id"));
      if (!tournamentId) {
        return c.json({ error: "Invalid tournament ID" }, 400);
      }

      const tournament = await tournamentsRepository.findById(tournamentId);
      if (!tournament) {
        return c.json({ error: "Tournament not found" }, 404);
      }

      if (tournament.isStarted) {
        return c.json({ error: "Cannot join tournament that has already started" }, 400);
      }

      if (tournament.joinsDisabled) {
        return c.json({ error: "Joins are currently disabled for this tournament" }, 400);
      }

      const isAlreadyJoined = await tournamentsRepository.isPlayerInTournament(
        tournamentId,
        parseInt(userId)
      );
      if (isAlreadyJoined) {
        return c.json({ error: "You are already registered for this tournament" }, 400);
      }

      const currentPlayerCount = await tournamentsRepository.getPlayerCount(tournamentId);
      if (currentPlayerCount >= tournament.maxPlayers) {
        return c.json({ error: "Tournament is full" }, 400);
      }

      await tournamentsRepository.addPlayerToTournament(tournamentId, parseInt(userId));

      await tournamentsRepository.createTeamForPlayer(tournamentId, parseInt(userId));

      const newPlayerCount = await tournamentsRepository.getPlayerCount(tournamentId);
      if (newPlayerCount >= tournament.maxPlayers) {
        await tournamentsRepository.updateTournament(tournamentId, {
          joinsDisabled: true,
        });
      }

      return c.json({
        message: "Successfully joined tournament",
        tournament: {
          id: tournamentId,
          currentPlayers: newPlayerCount,
          maxPlayers: tournament.maxPlayers,
        },
      });
    } catch (error) {
      console.error("Join tournament error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  async submitStageTeam(c: Context) {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const tournamentId = parseInt(c.req.param("id"));
      const body = await c.req.json();
      const validatedData = submitTeamSchema.parse(body);

      const tournament = await tournamentsRepository.findById(tournamentId);
      if (!tournament) {
        return c.json({ error: "Tournament not found" }, 404);
      }

      if (!tournament.isStarted) {
        return c.json({ error: "Tournament hasn't started yet" }, 400);
      }

      const isParticipating = await tournamentsRepository.isPlayerInTournament(
        tournamentId,
        parseInt(userId)
      );
      if (!isParticipating) {
        return c.json({ error: "You are not participating in this tournament" }, 400);
      }

      const team = await tournamentsRepository.getPlayerTeam(tournamentId, parseInt(userId));
      if (!team) {
        return c.json({ error: "Team not found" }, 404);
      }

      await tournamentsRepository.updateStageTeam(
        team.id,
        validatedData.stageId,
        validatedData.pokemonTeam
      );

      return c.json({
        message: "Team submitted successfully",
        stageId: validatedData.stageId,
        pokemonTeam: validatedData.pokemonTeam,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: "Validation failed", details: error.errors }, 400);
      }
      console.error("Submit stage team error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  async getStageTeam(c: Context) {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const tournamentId = parseInt(c.req.param("id"));
      const stageId = parseInt(c.req.param("stageId"));

      const pokemonTeam = await tournamentsRepository.getPlayerStageTeam(
        tournamentId,
        parseInt(userId),
        stageId
      );

      return c.json({
        tournamentId,
        stageId,
        pokemonTeam,
      });
    } catch (error) {
      console.error("Get stage team error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  async getTournament(c: Context) {
    try {
      const tournamentId = parseInt(c.req.param("id"));
      if (!tournamentId) {
        return c.json({ error: "Invalid tournament ID" }, 400);
      }

      const tournament = await tournamentsRepository.findById(tournamentId);
      if (!tournament) {
        return c.json({ error: "Tournament not found" }, 404);
      }

      const playerCount = await tournamentsRepository.getPlayerCount(tournamentId);
      const stages = await tournamentsRepository.getTournamentStages(tournamentId);

      return c.json({
        tournament: {
          ...tournament,
          currentPlayers: playerCount,
          stages,
        },
      });
    } catch (error) {
      console.error("Get tournament error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  async getUserTournaments(c: Context) {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const tournaments = await tournamentsRepository.getUserTournaments(parseInt(userId));

      return c.json({
        tournaments,
      });
    } catch (error) {
      console.error("Get user tournaments error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  async getAvailableTournaments(c: Context) {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const tournaments = await tournamentsRepository.getAvailableTournaments(parseInt(userId));

      return c.json({
        tournaments,
      });
    } catch (error) {
      console.error("Get available tournaments error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  async getTournamentDetails(c: Context) {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const tournamentId = parseInt(c.req.param("id"));
      if (!tournamentId) {
        return c.json({ error: "Invalid tournament ID" }, 400);
      }

      const tournament = await tournamentsRepository.findById(tournamentId);
      if (!tournament) {
        return c.json({ error: "Tournament not found" }, 404);
      }

      const isParticipating = await tournamentsRepository.isPlayerInTournament(
        tournamentId,
        parseInt(userId)
      );

      if (!isParticipating && tournament.creator !== parseInt(userId)) {
        return c.json({ error: "Not authorized to view tournament details" }, 403);
      }

      const playerCount = await tournamentsRepository.getPlayerCount(tournamentId);
      const stages = await tournamentsRepository.getTournamentStages(tournamentId);
      const matches = await matchesRepository.getTournamentMatches(tournamentId);

      const matchesWithPokemon = await Promise.all(
        matches.map(async (match) => {
          const pokemon = await matchesRepository.getMatchPokemon(match.id);
          return {
            ...match,
            pokemon,
          };
        })
      );

      const players = await tournamentsRepository.getTournamentPlayers(tournamentId);
      const playersWithStats = await Promise.all(
        players.map(async (player) => {
          const stats = await matchesRepository.getPlayerStats(tournamentId, player.userId);
          const user = await usersRepository.findById(player.userId);
          const stageTeams = await tournamentsRepository.getAllPlayerStageTeams(
            tournamentId,
            player.userId
          );

          return {
            id: player.userId,
            username: user?.username || "Unknown",
            email: user?.email || "Unknown",
            joinDate: user?.showdownJoinDate || user?.createdAt,
            wins: stats.wins,
            losses: stats.losses,
            points: stats.points,
            stageTeams,
            isCurrentUser: player.userId === parseInt(userId),
          };
        })
      );

      playersWithStats.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.wins - a.wins;
      });

      const rankedPlayers = playersWithStats.map((player, index) => ({
        ...player,
        rank: index + 1,
      }));

      return c.json({
        tournament: {
          ...tournament,
          currentPlayers: playerCount,
          stages,
          players: rankedPlayers,
          matches: matchesWithPokemon,
          isCreator: tournament.creator === parseInt(userId),
        },
      });
    } catch (error) {
      console.error("Get tournament details error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  async getPlayerTeam(c: Context) {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const tournamentId = parseInt(c.req.param("id"));
      if (!tournamentId) {
        return c.json({ error: "Invalid tournament ID" }, 400);
      }

      const pokemonTeam = await tournamentsRepository.getPlayerTeamPokemon(
        tournamentId,
        parseInt(userId)
      );

      return c.json({
        tournamentId,
        pokemonTeam,
      });
    } catch (error) {
      console.error("Get player team error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  async disableJoins(c: Context) {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const tournamentId = parseInt(c.req.param("id"));
      if (!tournamentId) {
        return c.json({ error: "Invalid tournament ID" }, 400);
      }

      const tournament = await tournamentsRepository.findById(tournamentId);
      if (!tournament) {
        return c.json({ error: "Tournament not found" }, 404);
      }

      if (tournament.creator !== parseInt(userId)) {
        return c.json({ error: "Only tournament creator can disable joins" }, 403);
      }

      await tournamentsRepository.updateTournament(tournamentId, {
        joinsDisabled: true,
      });

      return c.json({
        message: "Joins disabled successfully",
      });
    } catch (error) {
      console.error("Disable joins error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  async startTournament(c: Context) {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const tournamentId = parseInt(c.req.param("id"));
      if (!tournamentId) {
        return c.json({ error: "Invalid tournament ID" }, 400);
      }

      const tournament = await tournamentsRepository.findById(tournamentId);
      if (!tournament) {
        return c.json({ error: "Tournament not found" }, 404);
      }

      if (tournament.creator !== parseInt(userId)) {
        return c.json({ error: "Only tournament creator can start the tournament" }, 403);
      }

      if (tournament.isStarted) {
        return c.json({ error: "Tournament has already started" }, 400);
      }

      await tournamentsRepository.updateTournament(tournamentId, {
        isStarted: true,
        joinsDisabled: true,
      });

      return c.json({
        message: "Tournament started successfully",
      });
    } catch (error) {
      console.error("Start tournament error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  async updateTournamentStages(c: Context) {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const tournamentId = parseInt(c.req.param("id"));
      if (!tournamentId) {
        return c.json({ error: "Invalid tournament ID" }, 400);
      }

      const body = await c.req.json();
      const { stages } = z.object({ stages: z.array(stageSchema).min(1) }).parse(body);

      const tournament = await tournamentsRepository.findById(tournamentId);
      if (!tournament) {
        return c.json({ error: "Tournament not found" }, 404);
      }

      if (tournament.creator !== parseInt(userId)) {
        return c.json({ error: "Only tournament creator can update stages" }, 403);
      }

      if (tournament.isStarted) {
        return c.json({ error: "Cannot update stages after tournament has started" }, 400);
      }

      if (stages[0].playersSelected > tournament.maxPlayers) {
        return c.json(
          { error: "First stage cannot select more players than tournament maximum" },
          400
        );
      }

      for (let i = 1; i < stages.length; i++) {
        if (stages[i].playersSelected > stages[i - 1].playersSelected) {
          return c.json(
            { error: "Each stage must select fewer or equal players than the previous stage" },
            400
          );
        }
      }

      await tournamentsRepository.updateTournamentStages(tournamentId, stages);

      return c.json({
        message: "Tournament stages updated successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: "Validation failed", details: error.errors }, 400);
      }
      console.error("Update tournament stages error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  async endTournament(c: Context) {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const tournamentId = parseInt(c.req.param("id"));
      if (!tournamentId) {
        return c.json({ error: "Invalid tournament ID" }, 400);
      }

      const tournament = await tournamentsRepository.findById(tournamentId);
      if (!tournament) {
        return c.json({ error: "Tournament not found" }, 404);
      }

      if (tournament.creator !== parseInt(userId)) {
        return c.json({ error: "Only tournament creator can end the tournament" }, 403);
      }

      if (!tournament.isStarted) {
        return c.json({ error: "Cannot end tournament that hasn't started" }, 400);
      }

      if (tournament.isEnded) {
        return c.json({ error: "Tournament has already ended" }, 400);
      }

      await tournamentsRepository.endTournament(tournamentId);

      return c.json({
        message: "Tournament ended successfully",
      });
    } catch (error) {
      console.error("End tournament error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
}

export const tournamentsController = new TournamentsController();
