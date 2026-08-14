import { Router } from "express";
import { db } from "@workspace/db";
import { tournamentsTable, gamesTable, eventRegistrationsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

// List tournaments
router.get("/tournaments", async (req, res) => {
  const status = req.query["status"] as string | undefined;
  const conditions = status ? [eq(tournamentsTable.status, status)] : [];

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
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return void res.json(rows);
});

// Get tournament detail
router.get("/tournaments/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!id) return void res.status(400).json({ error: "Invalid id" });

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
    .where(eq(tournamentsTable.id, id))
    .limit(1);

  if (!row) return void res.status(404).json({ error: "Not found" });
  return void res.json({ ...row, schedule: [], brackets: [] });
});

// Register for a tournament (person-based)
router.post("/tournaments/:id/register", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!id) return void res.status(400).json({ error: "Invalid id" });

  const { fullName, email, phone, teamName, message } = req.body;
  if (!fullName || !email) {
    return void res.status(400).json({ error: "fullName and email are required" });
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return void res.status(400).json({ error: "Invalid email address" });
  }

  const [row] = await db.insert(eventRegistrationsTable).values({
    tournamentId: id,
    fullName: String(fullName).trim(),
    email: String(email).trim().toLowerCase(),
    phone: phone ? String(phone).trim() : null,
    teamName: teamName ? String(teamName).trim() : null,
    message: message ? String(message).trim() : null,
  }).returning();

  // Increment registered teams count
  await db.update(tournamentsTable)
    .set({ registeredTeams: sql`${tournamentsTable.registeredTeams} + 1` })
    .where(eq(tournamentsTable.id, id));

  return void res.status(201).json({ ...row, createdAt: row.createdAt.toISOString() });
});

export default router;
