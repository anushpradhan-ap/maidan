import { Router } from "express";
import { db } from "@workspace/db";
import {
  teamsTable,
  gamesTable,
  playersTable,
  matchResultsTable,
  tournamentsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListTeamsQueryParams,
  CreateTeamBody,
  GetTeamParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/teams", async (req, res) => {
  const parsed = ListTeamsQueryParams.safeParse(req.query);
  if (!parsed.success) return void res.status(400).json({ error: "Invalid query" });

  const { gameId, limit = 20, offset = 0 } = parsed.data;
  const conditions = [];
  if (gameId != null) conditions.push(eq(teamsTable.gameId, gameId));

  const rows = await db
    .select({
      id: teamsTable.id,
      name: teamsTable.name,
      tag: teamsTable.tag,
      logoUrl: teamsTable.logoUrl,
      gameId: teamsTable.gameId,
      gameName: gamesTable.name,
      wins: teamsTable.wins,
      losses: teamsTable.losses,
      points: teamsTable.points,
      rank: teamsTable.rank,
    })
    .from(teamsTable)
    .leftJoin(gamesTable, eq(teamsTable.gameId, gamesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(teamsTable.rank);

  const withCount = rows.map(r => ({ ...r, memberCount: 0 }));
  return void res.json(withCount);
});

router.post("/teams", async (req, res) => {
  const parsed = CreateTeamBody.safeParse(req.body);
  if (!parsed.success) return void res.status(400).json({ error: "Invalid body" });
  const [row] = await db.insert(teamsTable).values(parsed.data).returning();
  const [game] = await db.select({ name: gamesTable.name }).from(gamesTable).where(eq(gamesTable.id, row.gameId)).limit(1);
  return void res.status(201).json({ ...row, gameName: game?.name ?? "", memberCount: 0 });
});

router.get("/teams/:id", async (req, res) => {
  const parsed = GetTeamParams.safeParse(req.params);
  if (!parsed.success) return void res.status(400).json({ error: "Invalid id" });

  const [row] = await db
    .select({
      id: teamsTable.id,
      name: teamsTable.name,
      tag: teamsTable.tag,
      logoUrl: teamsTable.logoUrl,
      bannerUrl: teamsTable.bannerUrl,
      gameId: teamsTable.gameId,
      gameName: gamesTable.name,
      wins: teamsTable.wins,
      losses: teamsTable.losses,
      points: teamsTable.points,
      rank: teamsTable.rank,
      description: teamsTable.description,
    })
    .from(teamsTable)
    .leftJoin(gamesTable, eq(teamsTable.gameId, gamesTable.id))
    .where(eq(teamsTable.id, parsed.data.id))
    .limit(1);

  if (!row) return void res.status(404).json({ error: "Not found" });

  const members = await db
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
    .where(eq(playersTable.teamId, parsed.data.id));

  const recentMatches = await db
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
    .where(eq(matchResultsTable.teamId, parsed.data.id))
    .limit(10);

  return void res.json({ ...row, members, recentMatches });
});

export default router;
