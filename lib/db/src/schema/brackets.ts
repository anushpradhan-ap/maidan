import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tournamentsTable } from "./tournaments";

export const bracketsTable = pgTable("brackets", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournamentsTable.id),
  round: integer("round").notNull(),
  team1Name: text("team1_name"),
  team2Name: text("team2_name"),
  winner: text("winner"),
  score1: integer("score1"),
  score2: integer("score2"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBracketSchema = createInsertSchema(bracketsTable).omit({ id: true, createdAt: true });
export type InsertBracket = z.infer<typeof insertBracketSchema>;
export type Bracket = typeof bracketsTable.$inferSelect;
