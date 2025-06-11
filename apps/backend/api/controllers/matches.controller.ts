import type { Context } from "hono";
import { z } from "zod";

import { getRedis } from "../../cache/client.js";
import { matchesRepository } from "../../database/repositories/matches.repository.js";
import { tournamentsRepository } from "../../database/repositories/tournaments.repository.js";

const createMatchSchema = z.object({
  replayUrl: z.string().url(),
  pointsWon: z.number().min(0).optional(),
});

const updateMatchSchema = z.object({
  winnerId: z.number().optional(),
  loserId: z.number().optional(),
  pointsWon: z.number().min(0).optional(),
  replayUrl: z.string().url().optional(),
});

const CACHE_TTL = {
  TOURNAMENT_MATCHES: 86400,
  TOURNAMENT_PLAYERS: 86400,
  PLAYER_STATS: 86400,
} as const;

export class MatchesController {
  async createMatch(c: Context) {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const stageId = Number.parseInt(c.req.param("stageId"));
      if (!stageId) {
        return c.json({ error: "Invalid stage ID" }, 400);
      }

      const body = await c.req.json();
      const validatedData = createMatchSchema.parse(body);

      const tournamentId = Number.parseInt(c.req.param("tournamentId"));
      if (!tournamentId) {
        return c.json({ error: "Invalid tournament ID" }, 400);
      }

      const tournament = await tournamentsRepository.findById(tournamentId);
      if (!tournament) {
        return c.json({ error: "Tournament not found" }, 404);
      }

      const match = await matchesRepository.createMatch({
        tournamentId,
        stageId,
        replayUrl: validatedData.replayUrl,
        pointsWon: validatedData.pointsWon,
      });

      const redis = getRedis();

      const matchesCacheKey = `tournament:matches:${tournamentId}`;
      const cachedMatches = await redis.get(matchesCacheKey);
      if (cachedMatches) {
        const matches = cachedMatches as any;
        const pokemon = await matchesRepository.getMatchPokemon(match.id);
        const matchWithPokemon = { ...match, pokemon };
        const updatedMatches = [matchWithPokemon, ...matches];
        await redis.setex(
          matchesCacheKey,
          CACHE_TTL.TOURNAMENT_MATCHES,
          JSON.stringify(updatedMatches)
        );
      }

      const playerStatsCacheKeys = [
        `player:stats:${tournamentId}:${match.player1Id}`,
        `player:stats:${tournamentId}:${match.player2Id}`,
      ];

      for (const key of playerStatsCacheKeys) {
        const cachedStats = await redis.get(key);
        if (cachedStats) {
          const playerId = key.split(":")[3];
          const freshStats = await matchesRepository.getPlayerStats(
            tournamentId,
            Number.parseInt(playerId)
          );
          await redis.setex(key, CACHE_TTL.PLAYER_STATS, JSON.stringify(freshStats));
        }
      }

      const playersCacheKey = `tournament:players:${tournamentId}`;
      const cachedPlayers = await redis.get(playersCacheKey);
      if (cachedPlayers) {
        const players = cachedPlayers as any;
        const updatedPlayers = await Promise.all(
          players.map(async (player: any) => {
            if (player.id === match.player1Id || player.id === match.player2Id) {
              const stats = await matchesRepository.getPlayerStats(tournamentId, player.id);
              return {
                ...player,
                wins: stats.wins,
                losses: stats.losses,
                points: stats.points,
              };
            }
            return player;
          })
        );

        updatedPlayers.sort((a, b) => {
          if (b.wins !== a.wins) return b.wins - a.wins;
          return b.points - a.points;
        });

        const rankedPlayers = updatedPlayers.map((player, index) => ({
          ...player,
          rank: index + 1,
        }));

        await redis.setex(
          playersCacheKey,
          CACHE_TTL.TOURNAMENT_PLAYERS,
          JSON.stringify(rankedPlayers)
        );
      }

      return c.json({
        message: "Match created successfully",
        match,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: "Validation failed", details: error.errors }, 400);
      }
      console.error("Create match error:", error);
      return c.json(
        {
          error: error instanceof Error ? error.message : "Internal server error",
        },
        500
      );
    }
  }

  async getMatch(c: Context) {
    try {
      const matchId = Number.parseInt(c.req.param("id"));
      if (!matchId) {
        return c.json({ error: "Invalid match ID" }, 400);
      }

      const match = await matchesRepository.findById(matchId);
      if (!match) {
        return c.json({ error: "Match not found" }, 404);
      }

      const pokemon = await matchesRepository.getMatchPokemon(matchId);

      return c.json({ match, pokemon });
    } catch (error) {
      console.error("Get match error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  async getTournamentMatches(c: Context) {
    try {
      const tournamentId = Number.parseInt(c.req.param("tournamentId"));
      if (!tournamentId) {
        return c.json({ error: "Invalid tournament ID" }, 400);
      }

      const refresh = c.req.query("refresh") === "true";
      const cacheKey = `tournament:matches:${tournamentId}`;
      const redis = getRedis();

      if (!refresh) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return c.json({ matches: cached as any });
        }
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

      return c.json({ matches: matchesWithPokemon });
    } catch (error) {
      console.error("Get tournament matches error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  async updateMatch(c: Context) {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const matchId = Number.parseInt(c.req.param("id"));
      if (!matchId) {
        return c.json({ error: "Invalid match ID" }, 400);
      }

      const body = await c.req.json();
      const validatedData = updateMatchSchema.parse(body);

      const match = await matchesRepository.findById(matchId);
      if (!match) {
        return c.json({ error: "Match not found" }, 404);
      }

      const tournament = await tournamentsRepository.findById(match.tournamentId);
      if (!tournament) {
        return c.json({ error: "Tournament not found" }, 404);
      }

      const isParticipant =
        match.player1Id === Number.parseInt(userId) || match.player2Id === Number.parseInt(userId);
      const isCreator = tournament.creator === Number.parseInt(userId);

      if (!isParticipant && !isCreator) {
        return c.json({ error: "Not authorized to update this match" }, 403);
      }

      const updatedMatch = await matchesRepository.updateMatch(matchId, validatedData);

      const tournamentId = match.tournamentId;
      const redis = getRedis();

      const matchesCacheKey = `tournament:matches:${tournamentId}`;
      const cachedMatches = await redis.get(matchesCacheKey);
      if (cachedMatches) {
        const matches = cachedMatches as any;
        const pokemon = await matchesRepository.getMatchPokemon(matchId);
        const updatedMatchWithPokemon = { ...updatedMatch, pokemon };

        const updatedMatches = matches.map((m: any) =>
          m.id === matchId ? updatedMatchWithPokemon : m
        );

        await redis.setex(
          matchesCacheKey,
          CACHE_TTL.TOURNAMENT_MATCHES,
          JSON.stringify(updatedMatches)
        );
      }

      const playerStatsCacheKeys = [
        `player:stats:${tournamentId}:${match.player1Id}`,
        `player:stats:${tournamentId}:${match.player2Id}`,
      ];

      for (const key of playerStatsCacheKeys) {
        const cachedStats = await redis.get(key);
        if (cachedStats) {
          const playerId = key.split(":")[3];
          const freshStats = await matchesRepository.getPlayerStats(
            tournamentId,
            Number.parseInt(playerId)
          );
          await redis.setex(key, CACHE_TTL.PLAYER_STATS, JSON.stringify(freshStats));
        }
      }

      const playersCacheKey = `tournament:players:${tournamentId}`;
      const cachedPlayers = await redis.get(playersCacheKey);
      if (cachedPlayers) {
        const players = cachedPlayers as any;
        const updatedPlayers = await Promise.all(
          players.map(async (player: any) => {
            if (player.id === match.player1Id || player.id === match.player2Id) {
              const stats = await matchesRepository.getPlayerStats(tournamentId, player.id);
              return {
                ...player,
                wins: stats.wins,
                losses: stats.losses,
                points: stats.points,
              };
            }
            return player;
          })
        );

        updatedPlayers.sort((a, b) => {
          if (b.wins !== a.wins) return b.wins - a.wins;
          return b.points - a.points;
        });

        const rankedPlayers = updatedPlayers.map((player, index) => ({
          ...player,
          rank: index + 1,
        }));

        await redis.setex(
          playersCacheKey,
          CACHE_TTL.TOURNAMENT_PLAYERS,
          JSON.stringify(rankedPlayers)
        );
      }

      return c.json({
        message: "Match updated successfully",
        match: updatedMatch,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: "Validation failed", details: error.errors }, 400);
      }
      console.error("Update match error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
}

export const matchesController = new MatchesController();
