import { integer, pgTable, serial } from "drizzle-orm/pg-core";

import { tournaments } from "./tournaments";
import { users } from "./users";

export const tourTeams = pgTable("tour_teams", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id")
    .notNull()
    .references(() => tournaments.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
});
