import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { tourStages } from "./tourStages";
import { tourTeams } from "./tourTeams";

export const teamPokemon = pgTable("team_pokemon", {
	id: serial("id").primaryKey(),
	teamId: integer("team_id")
		.references(() => tourTeams.id, { onDelete: "cascade" })
		.notNull(),
	stageId: integer("stage_id")
		.references(() => tourStages.id, { onDelete: "cascade" })
		.notNull(),
	pokemonName: text("pokemon_name").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
