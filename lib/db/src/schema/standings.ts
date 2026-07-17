import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tournamentsTable } from "./tournaments";
import { teamsTable } from "./teams";

export const standingsTable = pgTable("standings", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournamentsTable.id),
  teamId: integer("team_id").notNull().references(() => teamsTable.id),
  rank: integer("rank").notNull().default(0),
  kills: integer("kills").notNull().default(0),
  points: integer("points").notNull().default(0),
  placement: integer("placement").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStandingSchema = createInsertSchema(standingsTable).omit({ id: true, createdAt: true });
export type InsertStanding = z.infer<typeof insertStandingSchema>;
export type Standing = typeof standingsTable.$inferSelect;
