import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  creator: integer("creator")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  format: text("format").notNull(),
  description: text("description").notNull(),
  maxPlayers: integer("max_players").notNull(),
  isStarted: boolean("is_started").notNull().default(false),
  isEnded: boolean("is_ended").notNull().default(false),
  joinsDisabled: boolean("joins_disabled").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
