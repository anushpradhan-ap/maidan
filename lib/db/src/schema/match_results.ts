import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tournamentsTable } from "./tournaments";
import { teamsTable } from "./teams";
import { playersTable } from "./players";

export const matchResultsTable = pgTable("match_results", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournamentsTable.id),
  teamId: integer("team_id").references(() => teamsTable.id),
  playerId: integer("player_id").references(() => playersTable.id),
  result: text("result").notNull().default("loss"), // win | loss | draw
  kills: integer("kills").notNull().default(0),
  placement: integer("placement"),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMatchResultSchema = createInsertSchema(matchResultsTable).omit({ id: true, createdAt: true });
export type InsertMatchResult = z.infer<typeof insertMatchResultSchema>;
export type MatchResult = typeof matchResultsTable.$inferSelect;
