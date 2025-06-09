import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { tournaments } from "./tournaments";

export const tourStages = pgTable("tour_stages", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id")
    .notNull()
    .references(() => tournaments.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  playersSelected: integer("players_selected").notNull(),
  stageOrder: integer("stage_order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
