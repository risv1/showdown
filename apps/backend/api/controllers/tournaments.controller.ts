import type { Context } from "hono";
import { z } from "zod";

import { redis } from "../../cache/client.js";
import { matchesRepository } from "../../database/repositories/matches.repository.js";
import { tournamentsRepository } from "../../database/repositories/tournaments.repository.js";
import { usersRepository } from "../../database/repositories/users.repository.js";

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

const updateStageStatusSchema = z.object({
  started: z.boolean(),
});

const CACHE_TTL = {
  TOURNAMENT_BASIC: 300,
  TOURNAMENT_STAGES: 180,
  TOURNAMENT_PLAYERS: 120,
  TOURNAMENT_MATCHES: 60,
  PLAYER_STATS: 90,
  USER_TOURNAMENTS: 300,
  STAGE_TEAM: 240,
} as const;

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
          {
            error: "First stage cannot select more players than tournament maximum",
          },
          400
        );
      }

      for (let i = 1; i < stages.length; i++) {
        if (stages[i].playersSelected > stages[i - 1].playersSelected) {
          return c.json(
            {
              error: "Each stage must select fewer or equal players than the previous stage",
            },
            400
          );
        }
      }

      const tournament = await tournamentsRepository.createTournamentWithStages({
        creator: Number.parseInt(userId),
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

      const tournamentId = Number.parseInt(c.req.param("id"));
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
        Number.parseInt(userId)
      );
      if (isAlreadyJoined) {
        return c.json({ error: "You are already registered for this tournament" }, 400);
      }

      const currentPlayerCount = await tournamentsRepository.getPlayerCount(tournamentId);
      if (currentPlayerCount >= tournament.maxPlayers) {
        return c.json({ error: "Tournament is full" }, 400);
      }

      await tournamentsRepository.addPlayerToTournament(tournamentId, Number.parseInt(userId));

      await tournamentsRepository.createTeamForPlayer(tournamentId, Number.parseInt(userId));

      const newPlayerCount = await tournamentsRepository.getPlayerCount(tournamentId);
      if (newPlayerCount >= tournament.maxPlayers) {
        await tournamentsRepository.updateTournament(tournamentId, {
          joinsDisabled: true,
        });
      }

      const userTournamentsCacheKey = `user:tournaments:${userId}`;
      const cachedTournaments = await redis.get(userTournamentsCacheKey);

      if (cachedTournaments) {
        const freshTournaments = await tournamentsRepository.getUserTournaments(
          Number.parseInt(userId)
        );
        await redis.setex(
          userTournamentsCacheKey,
          CACHE_TTL.USER_TOURNAMENTS,
          JSON.stringify(freshTournaments)
        );
      }

      const basicCacheKey = `tournament:basic:${tournamentId}`;
      const cachedBasic = await redis.get(basicCacheKey);
      if (cachedBasic) {
        const basicData = JSON.parse(cachedBasic);
        const updatedBasic = {
          ...basicData,
          currentPlayers: newPlayerCount,
          joinsDisabled: newPlayerCount >= tournament.maxPlayers,
        };
        await redis.setex(basicCacheKey, CACHE_TTL.TOURNAMENT_BASIC, JSON.stringify(updatedBasic));
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

      const tournamentId = Number.parseInt(c.req.param("id"));
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
        Number.parseInt(userId)
      );
      if (!isParticipating) {
        return c.json({ error: "You are not participating in this tournament" }, 400);
      }

      const team = await tournamentsRepository.getPlayerTeam(tournamentId, Number.parseInt(userId));
      if (!team) {
        return c.json({ error: "Team not found" }, 404);
      }

      await tournamentsRepository.updateStageTeam(
        team.id,
        validatedData.stageId,
        validatedData.pokemonTeam
      );

      const stageTeamCacheKey = `stage:team:${tournamentId}:${userId}:${validatedData.stageId}`;
      const stageTeamData = {
        tournamentId,
        stageId: validatedData.stageId,
        pokemonTeam: validatedData.pokemonTeam,
      };
      await redis.setex(stageTeamCacheKey, CACHE_TTL.STAGE_TEAM, JSON.stringify(stageTeamData));

      const playersCacheKey = `tournament:players:${tournamentId}`;
      const cachedPlayers = await redis.get(playersCacheKey);

      if (cachedPlayers) {
        const players = JSON.parse(cachedPlayers);
        const updatedPlayers = players.map((player: any) => {
          if (player.id === Number.parseInt(userId)) {
            return {
              ...player,
              stageTeams: {
                ...player.stageTeams,
                [validatedData.stageId]: validatedData.pokemonTeam,
              },
            };
          }
          return player;
        });

        await redis.setex(
          playersCacheKey,
          CACHE_TTL.TOURNAMENT_PLAYERS,
          JSON.stringify(updatedPlayers)
        );
      }

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

      const tournamentId = Number.parseInt(c.req.param("id"));
      const stageId = Number.parseInt(c.req.param("stageId"));

      if (!tournamentId || !stageId) {
        return c.json({ error: "Invalid tournament or stage ID" }, 400);
      }

      const refresh = c.req.query("refresh") === "true";
      const cacheKey = `stage:team:${tournamentId}:${userId}:${stageId}`;

      if (!refresh) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return c.json(JSON.parse(cached));
        }
      }

      const tournament = await tournamentsRepository.findById(tournamentId);
      if (!tournament) {
        return c.json({ error: "Tournament not found" }, 404);
      }

      const isParticipating = await tournamentsRepository.isPlayerInTournament(
        tournamentId,
        Number.parseInt(userId)
      );

      if (!isParticipating && tournament.creator !== Number.parseInt(userId)) {
        return c.json({ error: "Not authorized to view stage team" }, 403);
      }

      const pokemonTeam = await tournamentsRepository.getPlayerStageTeam(
        tournamentId,
        Number.parseInt(userId),
        stageId
      );

      const stageTeamData = {
        tournamentId,
        stageId,
        pokemonTeam,
      };

      await redis.setex(cacheKey, CACHE_TTL.STAGE_TEAM, JSON.stringify(stageTeamData));

      return c.json(stageTeamData);
    } catch (error) {
      console.error("Get stage team error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  async getTournament(c: Context) {
    try {
      const tournamentId = Number.parseInt(c.req.param("id"));
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

      const refresh = c.req.query("refresh") === "true";
      const userTournamentsCacheKey = `user:tournaments:${userId}`;

      if (!refresh) {
        const cachedTournaments = await redis.get(userTournamentsCacheKey);
        if (cachedTournaments) {
          return c.json({
            tournaments: JSON.parse(cachedTournaments),
          });
        }
      }

      const tournaments = await tournamentsRepository.getUserTournaments(Number.parseInt(userId));

      await redis.setex(
        userTournamentsCacheKey,
        CACHE_TTL.USER_TOURNAMENTS,
        JSON.stringify(tournaments)
      );

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

      const tournaments = await tournamentsRepository.getAvailableTournaments(
        Number.parseInt(userId)
      );

      return c.json({
        tournaments,
      });
    } catch (error) {
      console.error("Get available tournaments error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  // async getTournamentDetails(c: Context) {
  //   try {
  //     const userId = c.get("userId");
  //     if (!userId) {
  //       return c.json({ error: "Unauthorized" }, 401);
  //     }

  //     const tournamentId = Number.parseInt(c.req.param("id"));
  //     if (!tournamentId) {
  //       return c.json({ error: "Invalid tournament ID" }, 400);
  //     }

  //     const tournament = await tournamentsRepository.findById(tournamentId);
  //     if (!tournament) {
  //       return c.json({ error: "Tournament not found" }, 404);
  //     }

  //     const isParticipating = await tournamentsRepository.isPlayerInTournament(
  //       tournamentId,
  //       Number.parseInt(userId)
  //     );

  //     if (!isParticipating && tournament.creator !== Number.parseInt(userId)) {
  //       return c.json({ error: "Not authorized to view tournament details" }, 403);
  //     }

  //     const playerCount = await tournamentsRepository.getPlayerCount(tournamentId);
  //     const stages = await tournamentsRepository.getTournamentStages(tournamentId);
  //     const matches = await matchesRepository.getTournamentMatches(tournamentId);

  //     const matchesWithPokemon = await Promise.all(
  //       matches.map(async (match) => {
  //         const pokemon = await matchesRepository.getMatchPokemon(match.id);
  //         return {
  //           ...match,
  //           pokemon,
  //         };
  //       })
  //     );

  //     const players = await tournamentsRepository.getTournamentPlayers(tournamentId);
  //     const playersWithStats = await Promise.all(
  //       players.map(async (player) => {
  //         const stats = await matchesRepository.getPlayerStats(tournamentId, player.userId);
  //         const user = await usersRepository.findById(player.userId);
  //         const stageTeams = await tournamentsRepository.getAllPlayerStageTeams(
  //           tournamentId,
  //           player.userId
  //         );

  //         return {
  //           id: player.userId,
  //           username: user?.username || "Unknown",
  //           email: user?.email || "Unknown",
  //           joinDate: user?.showdownJoinDate || user?.createdAt,
  //           wins: stats.wins,
  //           losses: stats.losses,
  //           points: stats.points,
  //           stageTeams,
  //           isCurrentUser: player.userId === Number.parseInt(userId),
  //         };
  //       })
  //     );

  //     playersWithStats.sort((a, b) => {
  //       if (b.points !== a.points) return b.points - a.points;
  //       return b.wins - a.wins;
  //     });

  //     const rankedPlayers = playersWithStats.map((player, index) => ({
  //       ...player,
  //       rank: index + 1,
  //     }));

  //     return c.json({
  //       tournament: {
  //         ...tournament,
  //         currentPlayers: playerCount,
  //         stages,
  //         players: rankedPlayers,
  //         matches: matchesWithPokemon,
  //         isCreator: tournament.creator === Number.parseInt(userId),
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Get tournament details error:", error);
  //     return c.json({ error: "Internal server error" }, 500);
  //   }
  // }

  async getTournamentBasic(c: Context) {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const tournamentId = Number.parseInt(c.req.param("id"));
      if (!tournamentId) {
        return c.json({ error: "Invalid tournament ID" }, 400);
      }

      const refresh = c.req.query("refresh") === "true";
      const cacheKey = `tournament:basic:${tournamentId}`;

      if (!refresh) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          const cachedData = JSON.parse(cached);
          return c.json({
            tournament: {
              ...cachedData,
              isCreator: cachedData.creator === Number.parseInt(userId),
            },
          });
        }
      }

      const tournament = await tournamentsRepository.findById(tournamentId);
      if (!tournament) {
        return c.json({ error: "Tournament not found" }, 404);
      }

      const isParticipating = await tournamentsRepository.isPlayerInTournament(
        tournamentId,
        Number.parseInt(userId)
      );

      if (!isParticipating && tournament.creator !== Number.parseInt(userId)) {
        return c.json({ error: "Not authorized to view tournament details" }, 403);
      }

      const playerCount = await tournamentsRepository.getPlayerCount(tournamentId);

      const basicData = {
        ...tournament,
        currentPlayers: playerCount,
      };

      await redis.setex(cacheKey, CACHE_TTL.TOURNAMENT_BASIC, JSON.stringify(basicData));

      return c.json({
        tournament: {
          ...basicData,
          isCreator: tournament.creator === Number.parseInt(userId),
        },
      });
    } catch (error) {
      console.error("Get tournament basic error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  async getTournamentStages(c: Context) {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const tournamentId = Number.parseInt(c.req.param("id"));
      if (!tournamentId) {
        return c.json({ error: "Invalid tournament ID" }, 400);
      }

      const refresh = c.req.query("refresh") === "true";
      const cacheKey = `tournament:stages:${tournamentId}`;

      if (!refresh) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return c.json({
            stages: JSON.parse(cached),
          });
        }
      }

      const tournament = await tournamentsRepository.findById(tournamentId);
      if (!tournament) {
        return c.json({ error: "Tournament not found" }, 404);
      }

      const isParticipating = await tournamentsRepository.isPlayerInTournament(
        tournamentId,
        Number.parseInt(userId)
      );

      if (!isParticipating && tournament.creator !== Number.parseInt(userId)) {
        return c.json({ error: "Not authorized to view tournament stages" }, 403);
      }

      const stages = await tournamentsRepository.getTournamentStages(tournamentId);

      await redis.setex(cacheKey, CACHE_TTL.TOURNAMENT_STAGES, JSON.stringify(stages));

      return c.json({
        stages,
      });
    } catch (error) {
      console.error("Get tournament stages error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  async getTournamentPlayers(c: Context) {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const tournamentId = Number.parseInt(c.req.param("id"));
      if (!tournamentId) {
        return c.json({ error: "Invalid tournament ID" }, 400);
      }

      const refresh = c.req.query("refresh") === "true";
      const cacheKey = `tournament:players:${tournamentId}`;

      if (!refresh) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          const cachedData = JSON.parse(cached);
          const playersWithCurrentUser = cachedData.map((player: any) => ({
            ...player,
            isCurrentUser: player.id === Number.parseInt(userId),
          }));
          return c.json({
            players: playersWithCurrentUser,
          });
        }
      }

      const tournament = await tournamentsRepository.findById(tournamentId);
      if (!tournament) {
        return c.json({ error: "Tournament not found" }, 404);
      }

      const isParticipating = await tournamentsRepository.isPlayerInTournament(
        tournamentId,
        Number.parseInt(userId)
      );

      if (!isParticipating && tournament.creator !== Number.parseInt(userId)) {
        return c.json({ error: "Not authorized to view tournament players" }, 403);
      }

      const players = await tournamentsRepository.getTournamentPlayers(tournamentId);
      const playersWithStats = await Promise.all(
        players.map(async (player) => {
          let stats;
          if (refresh) {
            stats = await matchesRepository.getPlayerStats(tournamentId, player.userId);
          } else {
            const playerStatsCacheKey = `player:stats:${tournamentId}:${player.userId}`;
            const cachedStats = await redis.get(playerStatsCacheKey);
            if (cachedStats) {
              stats = JSON.parse(cachedStats);
            } else {
              stats = await matchesRepository.getPlayerStats(tournamentId, player.userId);
              await redis.setex(playerStatsCacheKey, CACHE_TTL.PLAYER_STATS, JSON.stringify(stats));
            }
          }

          if (refresh) {
            const playerStatsCacheKey = `player:stats:${tournamentId}:${player.userId}`;
            await redis.setex(playerStatsCacheKey, CACHE_TTL.PLAYER_STATS, JSON.stringify(stats));
          }

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
          };
        })
      );

      playersWithStats.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.points - a.points;
      });

      const rankedPlayers = playersWithStats.map((player, index) => ({
        ...player,
        rank: index + 1,
      }));

      await redis.setex(cacheKey, CACHE_TTL.TOURNAMENT_PLAYERS, JSON.stringify(rankedPlayers));

      const playersWithCurrentUser = rankedPlayers.map((player) => ({
        ...player,
        isCurrentUser: player.id === Number.parseInt(userId),
      }));

      return c.json({
        players: playersWithCurrentUser,
      });
    } catch (error) {
      console.error("Get tournament players error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  async getTournamentMatches(c: Context) {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const tournamentId = Number.parseInt(c.req.param("id"));
      if (!tournamentId) {
        return c.json({ error: "Invalid tournament ID" }, 400);
      }

      const refresh = c.req.query("refresh") === "true";
      const cacheKey = `tournament:matches:${tournamentId}`;

      if (!refresh) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return c.json({
            matches: JSON.parse(cached),
          });
        }
      }

      const tournament = await tournamentsRepository.findById(tournamentId);
      if (!tournament) {
        return c.json({ error: "Tournament not found" }, 404);
      }

      const isParticipating = await tournamentsRepository.isPlayerInTournament(
        tournamentId,
        Number.parseInt(userId)
      );

      if (!isParticipating && tournament.creator !== Number.parseInt(userId)) {
        return c.json({ error: "Not authorized to view tournament matches" }, 403);
      }

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

      await redis.setex(cacheKey, CACHE_TTL.TOURNAMENT_MATCHES, JSON.stringify(matchesWithPokemon));

      return c.json({
        matches: matchesWithPokemon,
      });
    } catch (error) {
      console.error("Get tournament matches error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  async getPlayerTeam(c: Context) {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const tournamentId = Number.parseInt(c.req.param("id"));
      if (!tournamentId) {
        return c.json({ error: "Invalid tournament ID" }, 400);
      }

      const pokemonTeam = await tournamentsRepository.getPlayerTeamPokemon(
        tournamentId,
        Number.parseInt(userId)
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

      const tournamentId = Number.parseInt(c.req.param("id"));
      if (!tournamentId) {
        return c.json({ error: "Invalid tournament ID" }, 400);
      }

      const tournament = await tournamentsRepository.findById(tournamentId);
      if (!tournament) {
        return c.json({ error: "Tournament not found" }, 404);
      }

      if (tournament.creator !== Number.parseInt(userId)) {
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

      const tournamentId = Number.parseInt(c.req.param("id"));
      if (!tournamentId) {
        return c.json({ error: "Invalid tournament ID" }, 400);
      }

      const tournament = await tournamentsRepository.findById(tournamentId);
      if (!tournament) {
        return c.json({ error: "Tournament not found" }, 404);
      }

      if (tournament.creator !== Number.parseInt(userId)) {
        return c.json({ error: "Only tournament creator can start the tournament" }, 403);
      }

      if (tournament.isStarted) {
        return c.json({ error: "Tournament has already started" }, 400);
      }

      await tournamentsRepository.updateTournament(tournamentId, {
        isStarted: true,
        joinsDisabled: true,
      });

      const basicCacheKey = `tournament:basic:${tournamentId}`;
      const cachedBasic = await redis.get(basicCacheKey);

      if (cachedBasic) {
        const basicData = JSON.parse(cachedBasic);
        const updatedBasic = {
          ...basicData,
          isStarted: true,
          joinsDisabled: true,
        };
        await redis.setex(basicCacheKey, CACHE_TTL.TOURNAMENT_BASIC, JSON.stringify(updatedBasic));
      }

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

      const tournamentId = Number.parseInt(c.req.param("id"));
      if (!tournamentId) {
        return c.json({ error: "Invalid tournament ID" }, 400);
      }

      const body = await c.req.json();
      const { stages } = z.object({ stages: z.array(stageSchema).min(1) }).parse(body);

      const tournament = await tournamentsRepository.findById(tournamentId);
      if (!tournament) {
        return c.json({ error: "Tournament not found" }, 404);
      }

      if (tournament.creator !== Number.parseInt(userId)) {
        return c.json({ error: "Only tournament creator can update stages" }, 403);
      }

      if (tournament.isStarted) {
        return c.json({ error: "Cannot update stages after tournament has started" }, 400);
      }

      if (stages[0].playersSelected > tournament.maxPlayers) {
        return c.json(
          {
            error: "First stage cannot select more players than tournament maximum",
          },
          400
        );
      }

      for (let i = 1; i < stages.length; i++) {
        if (stages[i].playersSelected > stages[i - 1].playersSelected) {
          return c.json(
            {
              error: "Each stage must select fewer or equal players than the previous stage",
            },
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

      const tournamentId = Number.parseInt(c.req.param("id"));
      if (!tournamentId) {
        return c.json({ error: "Invalid tournament ID" }, 400);
      }

      const tournament = await tournamentsRepository.findById(tournamentId);
      if (!tournament) {
        return c.json({ error: "Tournament not found" }, 404);
      }

      if (tournament.creator !== Number.parseInt(userId)) {
        return c.json({ error: "Only tournament creator can end the tournament" }, 403);
      }

      if (!tournament.isStarted) {
        return c.json({ error: "Cannot end tournament that hasn't started" }, 400);
      }

      if (tournament.isEnded) {
        return c.json({ error: "Tournament has already ended" }, 400);
      }

      await tournamentsRepository.endTournament(tournamentId);

      const basicCacheKey = `tournament:basic:${tournamentId}`;
      const cachedBasic = await redis.get(basicCacheKey);

      if (cachedBasic) {
        const basicData = JSON.parse(cachedBasic);
        const updatedBasic = {
          ...basicData,
          isEnded: true,
        };
        await redis.setex(basicCacheKey, CACHE_TTL.TOURNAMENT_BASIC, JSON.stringify(updatedBasic));
      }

      return c.json({
        message: "Tournament ended successfully",
      });
    } catch (error) {
      console.error("End tournament error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  async updateStageStatus(c: Context) {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const tournamentId = Number.parseInt(c.req.param("id"));
      const stageId = Number.parseInt(c.req.param("stageId"));

      if (!tournamentId || !stageId) {
        return c.json({ error: "Invalid tournament or stage ID" }, 400);
      }

      const body = await c.req.json();
      const { started } = updateStageStatusSchema.parse(body);

      const tournament = await tournamentsRepository.findById(tournamentId);
      if (!tournament) {
        return c.json({ error: "Tournament not found" }, 404);
      }

      if (tournament.creator !== Number.parseInt(userId)) {
        return c.json({ error: "Only tournament creator can update stage status" }, 403);
      }

      if (!tournament.isStarted) {
        return c.json({ error: "Tournament must be started before managing stages" }, 400);
      }

      if (tournament.isEnded) {
        return c.json({ error: "Cannot update stages of ended tournament" }, 400);
      }

      await tournamentsRepository.updateStageStatus(stageId, started);

      const stagesCacheKey = `tournament:stages:${tournamentId}`;
      const cachedStages = await redis.get(stagesCacheKey);

      if (cachedStages) {
        const stages = JSON.parse(cachedStages);
        const updatedStages = stages.map((stage: any) => {
          if (stage.id === stageId) {
            return {
              ...stage,
              stageStarted: started,
              updatedAt: new Date().toISOString(),
            };
          }
          return stage;
        });

        await redis.setex(
          stagesCacheKey,
          CACHE_TTL.TOURNAMENT_STAGES,
          JSON.stringify(updatedStages)
        );
      }

      return c.json({
        message: `Stage ${started ? "started" : "stopped"} successfully`,
        stageId,
        started,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: "Validation failed", details: error.errors }, 400);
      }
      console.error("Update stage status error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
}

export const tournamentsController = new TournamentsController();
