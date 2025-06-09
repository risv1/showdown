import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { tourStages } from "./tourStages";
import { tournaments } from "./tournaments";
import { users } from "./users";

export const tourMatches = pgTable("tour_matches", {
	id: serial("id").primaryKey(),
	tournamentId: integer("tournament_id")
		.references(() => tournaments.id, { onDelete: "cascade" })
		.notNull(),
	stageId: integer("stage_id")
		.references(() => tourStages.id, { onDelete: "cascade" })
		.notNull(),
	player1Id: integer("player1_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	player2Id: integer("player2_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	winnerId: integer("winner_id").references(() => users.id, {
		onDelete: "cascade",
	}),
	loserId: integer("loser_id").references(() => users.id, {
		onDelete: "cascade",
	}),
	pointsWon: integer("points_won"),
	replayUrl: text("replay_url"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
