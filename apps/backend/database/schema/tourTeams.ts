import { integer, pgTable, serial } from "drizzle-orm/pg-core";

import { tournaments } from "./tournaments.js";
import { users } from "./users.js";

export const tourTeams = pgTable("tour_teams", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id")
    .notNull()
    .references(() => tournaments.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
});
