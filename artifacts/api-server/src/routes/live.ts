import { Router } from "express";
import { db } from "@workspace/db";
import {
  tournamentsTable,
  gamesTable,
  liveUpdatesTable,
  standingsTable,
  teamsTable,
  playersTable,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { PostLiveUpdateBody, PostLiveUpdateParams } from "@workspace/api-zod";

const router = Router();

router.get("/live", async (_req, res) => {
  const liveTournaments = await db
    .select({
      id: tournamentsTable.id,
      title: tournamentsTable.title,
      gameName: gamesTable.name,
      currentRound: tournamentsTable.currentRound,
      totalRounds: tournamentsTable.totalRounds,
      teamsAlive: tournamentsTable.teamsAlive,
      currentZone: tournamentsTable.currentZone,
      streamUrl: tournamentsTable.streamUrl,
      startedAt: tournamentsTable.startDate,
    })
    .from(tournamentsTable)
    .leftJoin(gamesTable, eq(tournamentsTable.gameId, gamesTable.id))
    .where(eq(tournamentsTable.status, "live"));

  const results = await Promise.all(
    liveTournaments.map(async (t) => {
      const standings = await db
        .select({
          rank: standingsTable.rank,
          teamId: standingsTable.teamId,
          teamName: teamsTable.name,
          teamLogoUrl: teamsTable.logoUrl,
          kills: standingsTable.kills,
          points: standingsTable.points,
          placement: standingsTable.placement,
        })
        .from(standingsTable)
        .leftJoin(teamsTable, eq(standingsTable.teamId, teamsTable.id))
        .where(eq(standingsTable.tournamentId, t.id))
        .orderBy(standingsTable.rank)
        .limit(20);

      const recentUpdates = await db
        .select()
        .from(liveUpdatesTable)
        .where(eq(liveUpdatesTable.tournamentId, t.id))
        .orderBy(desc(liveUpdatesTable.createdAt))
        .limit(20);

      // Top fragger: player with most kills in any standing or update
      const topFragger = recentUpdates
        .filter((u) => u.type === "kill" && u.playerName && u.kills)
        .sort((a, b) => (b.kills ?? 0) - (a.kills ?? 0))[0];

      return {
        ...t,
        topFragger: topFragger?.playerName ?? null,
        topFraggerKills: topFragger?.kills ?? null,
        standings,
        recentUpdates: recentUpdates.map(u => ({
          ...u,
          createdAt: u.createdAt.toISOString(),
        })),
      };
    })
  );

  return void res.json(results);
});

router.post("/live/:tournamentId/update", async (req, res) => {
  const paramsParsed = PostLiveUpdateParams.safeParse(req.params);
  if (!paramsParsed.success) return void res.status(400).json({ error: "Invalid id" });

  const bodyParsed = PostLiveUpdateBody.safeParse(req.body);
  if (!bodyParsed.success) return void res.status(400).json({ error: "Invalid body" });

  const [row] = await db
    .insert(liveUpdatesTable)
    .values({ tournamentId: paramsParsed.data.tournamentId, ...bodyParsed.data })
    .returning();

  return void res.status(201).json({ ...row, createdAt: row.createdAt.toISOString() });
});

export default router;
