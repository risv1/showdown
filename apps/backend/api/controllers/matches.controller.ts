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

      const matchesCacheKey = `tournament:matches:${tournamentId}`;
      const redis = getRedis();
      await redis.del(matchesCacheKey);

      const playersCacheKey = `tournament:players:${tournamentId}`;
      await redis.del(playersCacheKey);

      const playerStatsCacheKeys = [
        `player:stats:${tournamentId}:${match.player1Id}`,
        `player:stats:${tournamentId}:${match.player2Id}`,
      ];

      for (const key of playerStatsCacheKeys) {
        await redis.del(key);
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

      const matchesCacheKey = `tournament:matches:${tournamentId}`;
      const redis = getRedis();
      await redis.del(matchesCacheKey);

      const playersCacheKey = `tournament:players:${tournamentId}`;
      await redis.del(playersCacheKey);

      const playerStatsCacheKeys = [
        `player:stats:${tournamentId}:${match.player1Id}`,
        `player:stats:${tournamentId}:${match.player2Id}`,
      ];

      for (const key of playerStatsCacheKeys) {
        await redis.del(key);
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
