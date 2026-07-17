import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { gamesTable } from "./games";

export const tournamentsTable = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  gameId: integer("game_id").notNull().references(() => gamesTable.id),
  status: text("status").notNull().default("upcoming"), // upcoming | live | completed
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  prizePool: text("prize_pool").notNull(),
  maxTeams: integer("max_teams").notNull(),
  registeredTeams: integer("registered_teams").notNull().default(0),
  bannerUrl: text("banner_url"),
  description: text("description"),
  rules: text("rules"),
  streamUrl: text("stream_url"),
  currentRound: integer("current_round").notNull().default(1),
  totalRounds: integer("total_rounds").notNull().default(6),
  teamsAlive: integer("teams_alive").notNull().default(0),
  currentZone: text("current_zone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTournamentSchema = createInsertSchema(tournamentsTable).omit({ id: true, createdAt: true });
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Tournament = typeof tournamentsTable.$inferSelect;
