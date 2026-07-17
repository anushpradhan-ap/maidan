import { Router } from "express";
import { db } from "@workspace/db";
import {
  tournamentsTable,
  gamesTable,
  standingsTable,
  teamsTable,
  registrationsTable,
  bracketsTable,
  scheduleItemsTable,
  insertTournamentSchema,
  insertRegistrationSchema,
} from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import {
  ListTournamentsQueryParams,
  CreateTournamentBody,
  RegisterForTournamentBody,
  GetTournamentParams,
  RegisterForTournamentParams,
  GetTournamentStandingsParams,
} from "@workspace/api-zod";

const router = Router();

// List tournaments
router.get("/tournaments", async (req, res) => {
  const parsed = ListTournamentsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return void res.status(400).json({ error: "Invalid query params" });
  }
  const { status, gameId, limit = 20, offset = 0 } = parsed.data;

  const conditions = [];
  if (status) conditions.push(eq(tournamentsTable.status, status));
  if (gameId != null) conditions.push(eq(tournamentsTable.gameId, gameId));

  const rows = await db
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
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limit)
    .offset(offset);

  return void res.json(rows);
});

// Create tournament
router.post("/tournaments", async (req, res) => {
  const parsed = CreateTournamentBody.safeParse(req.body);
  if (!parsed.success) {
    return void res.status(400).json({ error: "Invalid body" });
  }
  const game = await db.select({ name: gamesTable.name }).from(gamesTable).where(eq(gamesTable.id, parsed.data.gameId)).limit(1);
  if (!game.length) return void res.status(400).json({ error: "Game not found" });

  const [row] = await db.insert(tournamentsTable).values(parsed.data).returning();
  const result = { ...row, gameName: game[0].name };
  return void res.status(201).json(result);
});

// Get tournament detail
router.get("/tournaments/:id", async (req, res) => {
  const parsed = GetTournamentParams.safeParse(req.params);
  if (!parsed.success) return void res.status(400).json({ error: "Invalid id" });

  const [row] = await db
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
      rules: tournamentsTable.rules,
    })
    .from(tournamentsTable)
    .leftJoin(gamesTable, eq(tournamentsTable.gameId, gamesTable.id))
    .where(eq(tournamentsTable.id, parsed.data.id))
    .limit(1);

  if (!row) return void res.status(404).json({ error: "Not found" });

  const schedule = await db
    .select()
    .from(scheduleItemsTable)
    .where(eq(scheduleItemsTable.tournamentId, parsed.data.id));

  const brackets = await db
    .select()
    .from(bracketsTable)
    .where(eq(bracketsTable.tournamentId, parsed.data.id));

  return void res.json({ ...row, schedule, brackets });
});

// Get tournament standings
router.get("/tournaments/:id/standings", async (req, res) => {
  const parsed = GetTournamentStandingsParams.safeParse(req.params);
  if (!parsed.success) return void res.status(400).json({ error: "Invalid id" });

  const rows = await db
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
    .where(eq(standingsTable.tournamentId, parsed.data.id))
    .orderBy(standingsTable.rank);

  return void res.json(rows);
});

// Register for tournament
router.post("/tournaments/:id/register", async (req, res) => {
  const paramsParsed = RegisterForTournamentParams.safeParse(req.params);
  if (!paramsParsed.success) return void res.status(400).json({ error: "Invalid id" });

  const bodyParsed = RegisterForTournamentBody.safeParse(req.body);
  if (!bodyParsed.success) return void res.status(400).json({ error: "Invalid body" });

  const [row] = await db
    .insert(registrationsTable)
    .values({ tournamentId: paramsParsed.data.id, teamId: bodyParsed.data.teamId })
    .returning();

  // Increment registered teams count
  await db
    .update(tournamentsTable)
    .set({ registeredTeams: sql`${tournamentsTable.registeredTeams} + 1` })
    .where(eq(tournamentsTable.id, paramsParsed.data.id));

  return void res.status(201).json({ ...row, registeredAt: row.registeredAt.toISOString() });
});

export default router;
