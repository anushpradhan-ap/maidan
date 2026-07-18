import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tournamentsTable } from "./tournaments";

export const liveUpdatesTable = pgTable("live_updates", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournamentsTable.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  type: text("type").notNull().default("event"), // kill | zone | round_start | round_end | event
  teamName: text("team_name"),
  playerName: text("player_name"),
  kills: integer("kills"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLiveUpdateSchema = createInsertSchema(liveUpdatesTable).omit({ id: true, createdAt: true });
export type InsertLiveUpdate = z.infer<typeof insertLiveUpdateSchema>;
export type LiveUpdate = typeof liveUpdatesTable.$inferSelect;
