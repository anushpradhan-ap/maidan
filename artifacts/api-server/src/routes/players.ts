import { Router } from "express";
import { db } from "@workspace/db";
import {
  playersTable,
  gamesTable,
  teamsTable,
  matchResultsTable,
  badgesTable,
  tournamentsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListPlayersQueryParams,
  GetPlayerParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/players", async (req, res) => {
  const parsed = ListPlayersQueryParams.safeParse(req.query);
  if (!parsed.success) return void res.status(400).json({ error: "Invalid query" });

  const { gameId, teamId, limit = 20, offset = 0 } = parsed.data;
  const conditions = [];
  if (gameId != null) conditions.push(eq(playersTable.gameId, gameId));
  if (teamId != null) conditions.push(eq(playersTable.teamId, teamId));

  const rows = await db
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
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(playersTable.rank);

  return void res.json(rows);
});

router.get("/players/:id", async (req, res) => {
  const parsed = GetPlayerParams.safeParse(req.params);
  if (!parsed.success) return void res.status(400).json({ error: "Invalid id" });

  const [row] = await db
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
      bio: playersTable.bio,
    })
    .from(playersTable)
    .leftJoin(gamesTable, eq(playersTable.gameId, gamesTable.id))
    .leftJoin(teamsTable, eq(playersTable.teamId, teamsTable.id))
    .where(eq(playersTable.id, parsed.data.id))
    .limit(1);

  if (!row) return void res.status(404).json({ error: "Not found" });

  const matchHistory = await db
    .select({
      id: matchResultsTable.id,
      tournamentName: tournamentsTable.title,
      date: matchResultsTable.date,
      result: matchResultsTable.result,
      kills: matchResultsTable.kills,
      placement: matchResultsTable.placement,
    })
    .from(matchResultsTable)
    .leftJoin(tournamentsTable, eq(matchResultsTable.tournamentId, tournamentsTable.id))
    .where(eq(matchResultsTable.playerId, parsed.data.id))
    .limit(10);

  const badges = await db
    .select({
      id: badgesTable.id,
      name: badgesTable.name,
      description: badgesTable.description,
      iconUrl: badgesTable.iconUrl,
      earnedAt: badgesTable.earnedAt,
    })
    .from(badgesTable)
    .where(eq(badgesTable.playerId, parsed.data.id));

  const formattedBadges = badges.map(b => ({ ...b, earnedAt: b.earnedAt.toISOString() }));

  return void res.json({ ...row, matchHistory, badges: formattedBadges });
});

export default router;
