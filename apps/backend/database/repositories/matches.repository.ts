import { and, desc, eq } from "drizzle-orm";

import { db } from "../db.js";
import { matchPokemon } from "../schema/matchPokemon.js";
import { tourMatches } from "../schema/tourMatches.js";
import { users } from "../schema/users.js";

export type CreateMatchData = {
	tournamentId: number;
	stageId: number;
	replayUrl: string;
	pointsWon?: number;
};

export type Match = {
	id: number;
	tournamentId: number;
	stageId: number;
	player1Id: number;
	player2Id: number;
	winnerId: number | null;
	loserId: number | null;
	pointsWon: number | null;
	replayUrl: string | null;
	createdAt: Date;
	updatedAt: Date;
};

interface ReplayData {
	players: string[];
	log: string;
}

interface ParsedMatchData {
	player1Username: string;
	player2Username: string;
	winnerUsername: string;
	player1Pokemon: string[];
	player2Pokemon: string[];
}

export class MatchesRepository {
	private async parseReplayData(replayUrl: string): Promise<ParsedMatchData> {
		try {
			const jsonUrl = replayUrl.endsWith(".json")
				? replayUrl
				: `${replayUrl}.json`;

			const response = await fetch(jsonUrl);
			if (!response.ok) {
				throw new Error(`Failed to fetch replay data: ${response.status}`);
			}

			const data: ReplayData = await response.json();

			const [player1Username, player2Username] = data.players;

			const logLines = data.log.split("\n");
			const winLine = logLines.find((line) => line.startsWith("|win|"));
			if (!winLine) {
				throw new Error("Could not determine winner from replay");
			}
			const winnerUsername = winLine.split("|")[2];

			const player1Pokemon: string[] = [];
			const player2Pokemon: string[] = [];

			for (const line of logLines) {
				if (line.startsWith("|poke|p1|")) {
					const pokemonName = line.split("|")[3].split(",")[0];
					player1Pokemon.push(pokemonName);
				} else if (line.startsWith("|poke|p2|")) {
					const pokemonName = line.split("|")[3].split(",")[0];
					player2Pokemon.push(pokemonName);
				}
			}

			return {
				player1Username,
				player2Username,
				winnerUsername,
				player1Pokemon,
				player2Pokemon,
			};
		} catch (error) {
			throw new Error(
				`Failed to parse replay data: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	private async getUserByUsername(
		username: string,
	): Promise<{ id: number } | null> {
		const [user] = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.username, username))
			.limit(1);

		return user || null;
	}

	async createMatch(matchData: CreateMatchData): Promise<Match> {
		const parsedData = await this.parseReplayData(matchData.replayUrl);

		const player1 = await this.getUserByUsername(parsedData.player1Username);
		const player2 = await this.getUserByUsername(parsedData.player2Username);
		const winner = await this.getUserByUsername(parsedData.winnerUsername);

		if (!player1 || !player2 || !winner) {
			throw new Error("One or more players not found in the system");
		}

		const loserId = winner.id === player1.id ? player2.id : player1.id;

		const [match] = await db
			.insert(tourMatches)
			.values({
				tournamentId: matchData.tournamentId,
				stageId: matchData.stageId,
				player1Id: player1.id,
				player2Id: player2.id,
				winnerId: winner.id,
				loserId: loserId,
				pointsWon: matchData.pointsWon || null,
				replayUrl: matchData.replayUrl,
			})
			.returning();

		const pokemonEntries = [
			...parsedData.player1Pokemon.map((pokemon) => ({
				matchId: match.id,
				playerId: player1.id,
				pokemonName: pokemon,
			})),
			...parsedData.player2Pokemon.map((pokemon) => ({
				matchId: match.id,
				playerId: player2.id,
				pokemonName: pokemon,
			})),
		];

		if (pokemonEntries.length > 0) {
			await db.insert(matchPokemon).values(pokemonEntries);
		}

		return match;
	}

	async findById(id: number): Promise<Match | null> {
		const [match] = await db
			.select()
			.from(tourMatches)
			.where(eq(tourMatches.id, id))
			.limit(1);
		return match || null;
	}

	async getTournamentMatches(tournamentId: number): Promise<Match[]> {
		return await db
			.select()
			.from(tourMatches)
			.where(eq(tourMatches.tournamentId, tournamentId))
			.orderBy(desc(tourMatches.createdAt));
	}

	async getMatchPokemon(
		matchId: number,
	): Promise<Array<{ playerId: number; pokemonName: string }>> {
		return await db
			.select({
				playerId: matchPokemon.playerId,
				pokemonName: matchPokemon.pokemonName,
			})
			.from(matchPokemon)
			.where(eq(matchPokemon.matchId, matchId));
	}

	async getPlayerStats(
		tournamentId: number,
		playerId: number,
	): Promise<{ wins: number; losses: number; points: number }> {
		const playerMatches = await db
			.select()
			.from(tourMatches)
			.where(
				and(
					eq(tourMatches.tournamentId, tournamentId),
					eq(tourMatches.winnerId, playerId),
				),
			);

		const losses = await db
			.select()
			.from(tourMatches)
			.where(
				and(
					eq(tourMatches.tournamentId, tournamentId),
					eq(tourMatches.loserId, playerId),
				),
			);

		const points = playerMatches.reduce(
			(acc, match) => acc + (match.pointsWon || 0),
			0,
		);

		return {
			wins: playerMatches.length,
			losses: losses.length,
			points,
		};
	}

	async updateMatch(
		id: number,
		updates: Partial<CreateMatchData>,
	): Promise<Match | null> {
		const [match] = await db
			.update(tourMatches)
			.set({
				...updates,
				updatedAt: new Date(),
			})
			.where(eq(tourMatches.id, id))
			.returning();

		return match || null;
	}
}

export const matchesRepository = new MatchesRepository();
