import { Router } from "express";
import { db } from "@workspace/db";
import {
  tournamentsTable,
  gamesTable,
  standingsTable,
  teamsTable,
  newsTable,
  announcementsTable,
  liveUpdatesTable,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

// ── Auth middleware — scoped to /admin/* only ────────────────────────────────
const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "ggmaidan2024";

router.use("/admin", (req, res, next) => {
  // Allow the auth-check POST through without a token so the login page can
  // validate the password and receive a 401 on wrong credentials.
  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : req.headers["x-admin-password"];

  if (token !== ADMIN_PASSWORD) {
    return void res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// ── Auth check ──────────────────────────────────────────────────────────────
router.post("/admin/auth", (_req, res) => {
  return void res.json({ ok: true });
});

// ── Tournaments ─────────────────────────────────────────────────────────────

// List all tournaments (admin view — all statuses)
router.get("/admin/tournaments", async (_req, res) => {
  const rows = await db
    .select({
      id: tournamentsTable.id,
      title: tournamentsTable.title,
      status: tournamentsTable.status,
      gameName: gamesTable.name,
      gameId: tournamentsTable.gameId,
      startDate: tournamentsTable.startDate,
      endDate: tournamentsTable.endDate,
      prizePool: tournamentsTable.prizePool,
      maxTeams: tournamentsTable.maxTeams,
      registeredTeams: tournamentsTable.registeredTeams,
      currentRound: tournamentsTable.currentRound,
      totalRounds: tournamentsTable.totalRounds,
      teamsAlive: tournamentsTable.teamsAlive,
      currentZone: tournamentsTable.currentZone,
      streamUrl: tournamentsTable.streamUrl,
    })
    .from(tournamentsTable)
    .leftJoin(gamesTable, eq(tournamentsTable.gameId, gamesTable.id))
    .orderBy(desc(tournamentsTable.startDate));

  return void res.json(rows);
});

// Update tournament (status, round, zone, teamsAlive, streamUrl)
router.patch("/admin/tournaments/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!id) return void res.status(400).json({ error: "Invalid id" });

  const allowed = [
    "status",
    "currentRound",
    "totalRounds",
    "teamsAlive",
    "currentZone",
    "streamUrl",
    "title",
    "prizePool",
    "description",
    "rules",
    "startDate",
    "endDate",
  ] as const;

  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }

  if (Object.keys(update).length === 0)
    return void res.status(400).json({ error: "No fields to update" });

  const [row] = await db
    .update(tournamentsTable)
    .set(update as Parameters<typeof db.update>[0]["set"] & object)
    .where(eq(tournamentsTable.id, id))
    .returning();

  if (!row) return void res.status(404).json({ error: "Not found" });
  return void res.json(row);
});

// ── Standings ───────────────────────────────────────────────────────────────

// Upsert a standings row
router.post("/admin/standings", async (req, res) => {
  const { tournamentId, teamId, rank, kills, points, placement } = req.body;
  if (!tournamentId || !teamId)
    return void res.status(400).json({ error: "tournamentId and teamId required" });

  // Check if exists
  const existing = await db
    .select()
    .from(standingsTable)
    .where(
      eq(standingsTable.tournamentId, tournamentId)
    )
    .then((rows) => rows.find((r) => r.teamId === teamId));

  let row;
  if (existing) {
    [row] = await db
      .update(standingsTable)
      .set({ rank, kills, points, placement })
      .where(eq(standingsTable.id, existing.id))
      .returning();
  } else {
    [row] = await db
      .insert(standingsTable)
      .values({ tournamentId, teamId, rank, kills, points, placement })
      .returning();
  }
  return void res.status(200).json(row);
});

// Get standings for a tournament
router.get("/admin/standings/:tournamentId", async (req, res) => {
  const tournamentId = Number(req.params["tournamentId"]);
  const rows = await db
    .select({
      id: standingsTable.id,
      rank: standingsTable.rank,
      teamId: standingsTable.teamId,
      teamName: teamsTable.name,
      kills: standingsTable.kills,
      points: standingsTable.points,
      placement: standingsTable.placement,
    })
    .from(standingsTable)
    .leftJoin(teamsTable, eq(standingsTable.teamId, teamsTable.id))
    .where(eq(standingsTable.tournamentId, tournamentId))
    .orderBy(standingsTable.rank);
  return void res.json(rows);
});

// ── Live Updates ────────────────────────────────────────────────────────────

// Delete a live update
router.delete("/admin/live-updates/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!id) return void res.status(400).json({ error: "Invalid id" });
  await db.delete(liveUpdatesTable).where(eq(liveUpdatesTable.id, id));
  return void res.status(204).send();
});

// Clear all live updates for a tournament
router.delete("/admin/live-updates/tournament/:tournamentId", async (req, res) => {
  const tournamentId = Number(req.params["tournamentId"]);
  await db.delete(liveUpdatesTable).where(eq(liveUpdatesTable.tournamentId, tournamentId));
  return void res.status(204).send();
});

// ── News ────────────────────────────────────────────────────────────────────

router.get("/admin/news", async (_req, res) => {
  const rows = await db
    .select()
    .from(newsTable)
    .orderBy(desc(newsTable.publishedAt));
  return void res.json(
    rows.map((r) => ({
      ...r,
      publishedAt: r.publishedAt.toISOString(),
      tags: r.tags ?? [],
    }))
  );
});

router.delete("/admin/news/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!id) return void res.status(400).json({ error: "Invalid id" });
  await db.delete(newsTable).where(eq(newsTable.id, id));
  return void res.status(204).send();
});

// ── Announcements ───────────────────────────────────────────────────────────

router.get("/admin/announcements", async (_req, res) => {
  const rows = await db
    .select()
    .from(announcementsTable)
    .orderBy(desc(announcementsTable.createdAt));
  return void res.json(
    rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      expiresAt: r.expiresAt?.toISOString() ?? null,
    }))
  );
});

router.delete("/admin/announcements/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!id) return void res.status(400).json({ error: "Invalid id" });
  await db.delete(announcementsTable).where(eq(announcementsTable.id, id));
  return void res.status(204).send();
});

// ── Teams (read-only for dropdowns) ─────────────────────────────────────────
router.get("/admin/teams", async (_req, res) => {
  const rows = await db
    .select({ id: teamsTable.id, name: teamsTable.name, gameId: teamsTable.gameId })
    .from(teamsTable)
    .orderBy(teamsTable.name);
  return void res.json(rows);
});

export default router;
