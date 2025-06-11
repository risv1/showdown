import { and, count, eq } from "drizzle-orm";

import { db } from "../db.js";
import { teamPokemon } from "../schema/teamPokemon.js";
import { tourPlayers } from "../schema/tourPlayers.js";
import { tourStages } from "../schema/tourStages.js";
import { tourTeams } from "../schema/tourTeams.js";
import { tournaments } from "../schema/tournaments.js";
import { matchesRepository } from "./matches.repository.js";

export class TournamentsRepository {
  async createTournament(data: {
    creator: number;
    name: string;
    format: string;
    description: string;
    maxPlayers: number;
  }) {
    const [tournament] = await db.insert(tournaments).values(data).returning();
    return tournament;
  }

  async createTournamentWithStages(data: {
    creator: number;
    name: string;
    format: string;
    description: string;
    maxPlayers: number;
    stages: Array<{ name: string; playersSelected: number }>;
  }) {
    const { stages, ...tournamentData } = data;

    return await db.transaction(async (tx) => {
      const [tournament] = await tx.insert(tournaments).values(tournamentData).returning();

      const stageData = stages.map((stage, index) => ({
        tournamentId: tournament.id,
        name: stage.name,
        playersSelected: stage.playersSelected,
        stageOrder: index + 1,
      }));

      await tx.insert(tourStages).values(stageData);

      return tournament;
    });
  }

  async getTournamentStages(tournamentId: number) {
    return await db
      .select()
      .from(tourStages)
      .where(eq(tourStages.tournamentId, tournamentId))
      .orderBy(tourStages.stageOrder);
  }

  async updateTournamentStages(
    tournamentId: number,
    stages: Array<{ name: string; playersSelected: number }>
  ) {
    return await db.transaction(async (tx) => {
      await tx.delete(tourStages).where(eq(tourStages.tournamentId, tournamentId));

      const stageData = stages.map((stage, index) => ({
        tournamentId,
        name: stage.name,
        playersSelected: stage.playersSelected,
        stageOrder: index + 1,
      }));

      await tx.insert(tourStages).values(stageData);
    });
  }

  async findById(id: number) {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    return tournament;
  }

  async findByCreator(creatorId: number) {
    return await db.select().from(tournaments).where(eq(tournaments.creator, creatorId));
  }

  async updateTournament(id: number, data: Partial<typeof tournaments.$inferInsert>) {
    const [tournament] = await db
      .update(tournaments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tournaments.id, id))
      .returning();
    return tournament;
  }

  async getPlayerCount(tournamentId: number) {
    const [result] = await db
      .select({ count: count() })
      .from(tourPlayers)
      .where(eq(tourPlayers.tournamentId, tournamentId));
    return result.count;
  }

  async getAllPlayerStageTeams(tournamentId: number, userId: number) {
    const result = await db
      .select({
        stageId: teamPokemon.stageId,
        pokemonName: teamPokemon.pokemonName,
      })
      .from(tourTeams)
      .innerJoin(teamPokemon, eq(tourTeams.id, teamPokemon.teamId))
      .where(and(eq(tourTeams.tournamentId, tournamentId), eq(tourTeams.userId, userId)));

    const grouped = result.reduce((acc, row) => {
      if (!acc[row.stageId]) {
        acc[row.stageId] = [];
      }
      acc[row.stageId].push(row.pokemonName);
      return acc;
    }, {} as Record<number, string[]>);

    return grouped;
  }

  async getUserTournaments(userId: number) {
    const result = await db
      .select({
        id: tournaments.id,
        name: tournaments.name,
        format: tournaments.format,
        description: tournaments.description,
        maxPlayers: tournaments.maxPlayers,
        creator: tournaments.creator,
        isStarted: tournaments.isStarted,
        isEnded: tournaments.isEnded,
        joinsDisabled: tournaments.joinsDisabled,
        createdAt: tournaments.createdAt,
        updatedAt: tournaments.updatedAt,
      })
      .from(tournaments)
      .innerJoin(tourPlayers, eq(tournaments.id, tourPlayers.tournamentId))
      .where(eq(tourPlayers.userId, userId));

    const tournamentsWithCounts = await Promise.all(
      result.map(async (tournament) => {
        const currentPlayers = await this.getPlayerCount(tournament.id);
        const stages = await this.getTournamentStages(tournament.id);
        const pokemonTeam = await this.getPlayerTeamPokemon(tournament.id, userId);
        const stats = await matchesRepository.getPlayerStats(tournament.id, userId);

        return {
          ...tournament,
          currentPlayers,
          stages,
          pokemonTeam,
          wins: stats.wins,
          losses: stats.losses,
          points: stats.points,
        };
      })
    );

    return tournamentsWithCounts;
  }

  async getAvailableTournaments(userId: number) {
    const result = await db
      .select({
        id: tournaments.id,
        name: tournaments.name,
        format: tournaments.format,
        description: tournaments.description,
        maxPlayers: tournaments.maxPlayers,
        creator: tournaments.creator,
        isStarted: tournaments.isStarted,
        isEnded: tournaments.isEnded,
        joinsDisabled: tournaments.joinsDisabled,
        createdAt: tournaments.createdAt,
        updatedAt: tournaments.updatedAt,
      })
      .from(tournaments)
      .where(and(eq(tournaments.isStarted, false), eq(tournaments.isEnded, false)));

    const tournamentsWithStatus = await Promise.all(
      result.map(async (tournament) => {
        const currentPlayers = await this.getPlayerCount(tournament.id);
        const stages = await this.getTournamentStages(tournament.id);
        const isParticipating = await this.isPlayerInTournament(tournament.id, userId);

        return {
          ...tournament,
          currentPlayers,
          stages,
          isParticipating,
        };
      })
    );

    return tournamentsWithStatus;
  }

  async isPlayerInTournament(tournamentId: number, userId: number) {
    const [player] = await db
      .select()
      .from(tourPlayers)
      .where(and(eq(tourPlayers.tournamentId, tournamentId), eq(tourPlayers.userId, userId)));
    return !!player;
  }

  async addPlayerToTournament(tournamentId: number, userId: number) {
    const [player] = await db.insert(tourPlayers).values({ tournamentId, userId }).returning();
    return player;
  }

  async createTeamForPlayer(tournamentId: number, userId: number) {
    const [team] = await db.insert(tourTeams).values({ tournamentId, userId }).returning();
    return team;
  }

  async addPokemonToTeam(teamId: number, pokemonNames: string[], stageId: number) {
    const pokemonData = pokemonNames.map((name) => ({
      teamId,
      stageId,
      pokemonName: name,
    }));
    return await db.insert(teamPokemon).values(pokemonData).returning();
  }

  async getPlayerTeam(tournamentId: number, userId: number) {
    const [team] = await db
      .select()
      .from(tourTeams)
      .where(and(eq(tourTeams.tournamentId, tournamentId), eq(tourTeams.userId, userId)));
    return team;
  }

  async updateStageTeam(teamId: number, stageId: number, pokemonNames: string[]) {
    return await db.transaction(async (tx) => {
      await tx
        .delete(teamPokemon)
        .where(and(eq(teamPokemon.teamId, teamId), eq(teamPokemon.stageId, stageId)));

      if (pokemonNames.length > 0) {
        const pokemonData = pokemonNames.map((name) => ({
          teamId,
          stageId,
          pokemonName: name,
        }));
        await tx.insert(teamPokemon).values(pokemonData);
      }
    });
  }

  async getPlayerStageTeam(tournamentId: number, userId: number, stageId: number) {
    const result = await db
      .select({ pokemonName: teamPokemon.pokemonName })
      .from(tourTeams)
      .innerJoin(teamPokemon, eq(tourTeams.id, teamPokemon.teamId))
      .where(
        and(
          eq(tourTeams.tournamentId, tournamentId),
          eq(tourTeams.userId, userId),
          eq(teamPokemon.stageId, stageId)
        )
      );

    return result.map((row) => row.pokemonName);
  }

  async getPlayerTeamPokemon(tournamentId: number, userId: number) {
    const result = await db
      .select({ pokemonName: teamPokemon.pokemonName })
      .from(tourTeams)
      .innerJoin(teamPokemon, eq(tourTeams.id, teamPokemon.teamId))
      .where(and(eq(tourTeams.tournamentId, tournamentId), eq(tourTeams.userId, userId)));

    return result.map((row) => row.pokemonName);
  }

  async getTournamentPlayers(tournamentId: number) {
    return await db.select().from(tourPlayers).where(eq(tourPlayers.tournamentId, tournamentId));
  }

  async endTournament(tournamentId: number) {
    const [tournament] = await db
      .update(tournaments)
      .set({ isEnded: true, updatedAt: new Date() })
      .where(eq(tournaments.id, tournamentId))
      .returning();
    return tournament;
  }

  async updateStageStatus(stageId: number, started: boolean) {
    const [stage] = await db
      .update(tourStages)
      .set({
        stageStarted: started,
        updatedAt: new Date(),
      })
      .where(eq(tourStages.id, stageId))
      .returning();
    return stage;
  }
}

export const tournamentsRepository = new TournamentsRepository();
