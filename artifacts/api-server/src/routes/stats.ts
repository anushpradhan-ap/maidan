import { Router } from "express";
import { db } from "@workspace/db";
import {
  playersTable,
  teamsTable,
  tournamentsTable,
  gamesTable,
  newsTable,
  liveUpdatesTable,
  standingsTable,
} from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";

const router = Router();

router.get("/stats/community", async (_req, res) => {
  const [{ totalPlayers }] = await db.select({ totalPlayers: count() }).from(playersTable);
  const [{ totalTeams }] = await db.select({ totalTeams: count() }).from(teamsTable);
  const [{ totalTournaments }] = await db.select({ totalTournaments: count() }).from(tournamentsTable);
  const [{ activeTournaments }] = await db
    .select({ activeTournaments: count() })
    .from(tournamentsTable)
    .where(eq(tournamentsTable.status, "live"));

  return void res.json({
    totalPlayers,
    totalTeams,
    totalTournaments,
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

  const liveWithDetails = await Promise.all(
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
        .limit(5);

      const recentUpdates = await db
        .select()
        .from(liveUpdatesTable)
        .where(eq(liveUpdatesTable.tournamentId, t.id))
        .limit(5);

      return {
        ...t,
        topFragger: null,
        topFraggerKills: null,
        standings,
        recentUpdates: recentUpdates.map(u => ({ ...u, createdAt: u.createdAt.toISOString() })),
      };
    })
  );

  const topPlayers = await db
    .select({
      id: playersTable.id,
      username: playersTable.username,
      fullName: playersTable.fullName,
      avatarUrl: playersTable.avatarUrl,
      gameId: playersTable.gameId,
      gameName: gamesTable.name,
      teamId: playersTable.teamId,
      teamName: teamsTable.name,
      kills: playersTable.kills,
      deaths: playersTable.deaths,
      assists: playersTable.assists,
      tournamentWins: playersTable.tournamentWins,
      rank: playersTable.rank,
      country: playersTable.country,
      role: playersTable.role,
    })
    .from(playersTable)
    .leftJoin(gamesTable, eq(playersTable.gameId, gamesTable.id))
    .leftJoin(teamsTable, eq(playersTable.teamId, teamsTable.id))
    .orderBy(playersTable.kills)
    .limit(6);

  const latestNews = await db
    .select()
    .from(newsTable)
    .orderBy(newsTable.publishedAt)
    .limit(4);

  const latestNewsFormatted = latestNews.map(n => ({
    ...n,
    publishedAt: n.publishedAt.toISOString(),
    tags: n.tags ?? [],
  }));

  return void res.json({
    featuredTournaments,
    liveTournaments: liveWithDetails,
    topPlayers,
    latestNews: latestNewsFormatted,
    upcomingHighlight: featuredTournaments[0] ?? null,
  });
});

export default router;
