import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";

import { tournaments } from "./tournaments";
import { users } from "./users";

export const tourPlayers = pgTable("tour_players", {
	id: serial("id").primaryKey(),
	tournamentId: integer("tournament_id")
		.notNull()
		.references(() => tournaments.id),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id),
	joinedAt: timestamp("joined_at").notNull().defaultNow(),
});
