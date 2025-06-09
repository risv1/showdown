import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

import { tourMatches } from "./tourMatches.js";
import { users } from "./users.js";

export const matchPokemon = pgTable("match_pokemon", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id")
    .notNull()
    .references(() => tourMatches.id),
  playerId: integer("player_id")
    .notNull()
    .references(() => users.id),
  pokemonName: text("pokemon_name").notNull(),
});
