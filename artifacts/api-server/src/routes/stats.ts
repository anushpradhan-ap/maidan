import { Router } from "express";
import { db } from "@workspace/db";
import {
  tournamentsTable,
  gamesTable,
  newsTable,
  eventRegistrationsTable,
} from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";

const router = Router();

router.get("/stats/community", async (_req, res) => {
  const [{ totalTournaments }] = await db.select({ totalTournaments: count() }).from(tournamentsTable);
  const [{ activeTournaments }] = await db
    .select({ activeTournaments: count() })
    .from(tournamentsTable)
    .where(eq(tournamentsTable.status, "live"));
  const [{ totalRegistrations }] = await db.select({ totalRegistrations: count() }).from(eventRegistrationsTable);

  return void res.json({
    totalPlayers: totalRegistrations,
    totalTeams: totalTournaments,
    totalTournaments,
    totalRegistrations,
    totalPrizeDistributed: "NPR 10,00,000",
    activeTournaments,
    countriesRepresented: 3,
  });
});

router.get("/stats/featured", async (_req, res) => {
  const featuredTournaments = await db
    .select({
      id: tournamentsTable.id,
      title: tournamentsTable.title,
      gameId: tournamentsTable.gameId,
      gameName: gamesTable.name,
      status: tournamentsTable.status,
      startDate: tournamentsTable.startDate,
      endDate: tournamentsTable.endDate,
      prizePool: tournamentsTable.prizePool,
      maxTeams: tournamentsTable.maxTeams,
      registeredTeams: tournamentsTable.registeredTeams,
      bannerUrl: tournamentsTable.bannerUrl,
      description: tournamentsTable.description,
    })
    .from(tournamentsTable)
    .leftJoin(gamesTable, eq(tournamentsTable.gameId, gamesTable.id))
    .where(eq(tournamentsTable.status, "upcoming"))
    .limit(3);

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
    .where(eq(tournamentsTable.status, "live"))
    .limit(2);

  const latestNews = await db
    .select()
    .from(newsTable)
    .where(eq(newsTable.status, "published"))
    .orderBy(desc(newsTable.publishedAt))
    .limit(4);

  return void res.json({
    featuredTournaments,
    liveTournaments: liveTournaments.map(t => ({
      ...t,
      standings: [],
      recentUpdates: [],
      topFragger: null,
      topFraggerKills: null,
    })),
    topPlayers: [],
    latestNews: latestNews.map(n => ({
      ...n,
      publishedAt: n.publishedAt.toISOString(),
      createdAt: n.createdAt.toISOString(),
      tags: n.tags ?? [],
    })),
    upcomingHighlight: featuredTournaments[0] ?? null,
  });
});

export default router;
