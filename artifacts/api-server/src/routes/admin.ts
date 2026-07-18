import { Router } from "express";
import { db } from "@workspace/db";
import {
  tournamentsTable,
  gamesTable,
  standingsTable,
  teamsTable,
  playersTable,
  newsTable,
  announcementsTable,
  liveUpdatesTable,
  galleryTable,
  sponsorsTable,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

// ── Auth middleware — scoped to /admin/* only ────────────────────────────────
const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "ggmaidan2024";

router.use("/admin", (req, res, next) => {
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

// ══════════════════════════════════════════════════════════════════════════════
// TOURNAMENTS
// ══════════════════════════════════════════════════════════════════════════════

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
      description: tournamentsTable.description,
    })
    .from(tournamentsTable)
    .leftJoin(gamesTable, eq(tournamentsTable.gameId, gamesTable.id))
    .orderBy(desc(tournamentsTable.startDate));
  return void res.json(rows);
});

router.post("/admin/tournaments", async (req, res) => {
  const { title, gameId, startDate, endDate, prizePool, maxTeams, totalRounds, description, rules } = req.body;
  if (!title || !gameId || !startDate || !prizePool || !maxTeams) {
    return void res.status(400).json({ error: "title, gameId, startDate, prizePool, maxTeams required" });
  }
  const [row] = await db.insert(tournamentsTable).values({
    title,
    gameId: Number(gameId),
    startDate,
    endDate: endDate || null,
    prizePool,
    maxTeams: Number(maxTeams),
    totalRounds: totalRounds ? Number(totalRounds) : null,
    description: description || null,
    rules: rules || null,
    status: "upcoming",
  }).returning();
  return void res.status(201).json(row);
});

router.patch("/admin/tournaments/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!id) return void res.status(400).json({ error: "Invalid id" });
  const allowed = [
    "status", "currentRound", "totalRounds", "teamsAlive", "currentZone",
    "streamUrl", "title", "prizePool", "description", "rules", "startDate",
    "endDate", "maxTeams", "gameId",
  ] as const;
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }
  if (Object.keys(update).length === 0)
    return void res.status(400).json({ error: "No fields to update" });
  const [row] = await db.update(tournamentsTable)
    .set(update as Parameters<typeof db.update>[0]["set"] & object)
    .where(eq(tournamentsTable.id, id))
    .returning();
  if (!row) return void res.status(404).json({ error: "Not found" });
  return void res.json(row);
});

router.delete("/admin/tournaments/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!id) return void res.status(400).json({ error: "Invalid id" });
  await db.delete(tournamentsTable).where(eq(tournamentsTable.id, id));
  return void res.status(204).send();
});

// ══════════════════════════════════════════════════════════════════════════════
// STANDINGS
// ══════════════════════════════════════════════════════════════════════════════

router.post("/admin/standings", async (req, res) => {
  const { tournamentId, teamId, rank, kills, points, placement } = req.body;
  if (!tournamentId || !teamId)
    return void res.status(400).json({ error: "tournamentId and teamId required" });
  const existing = await db.select().from(standingsTable)
    .where(eq(standingsTable.tournamentId, tournamentId))
    .then((rows) => rows.find((r) => r.teamId === teamId));
  let row;
  if (existing) {
    [row] = await db.update(standingsTable)
      .set({ rank, kills, points, placement })
      .where(eq(standingsTable.id, existing.id))
      .returning();
  } else {
    [row] = await db.insert(standingsTable)
      .values({ tournamentId, teamId, rank, kills, points, placement })
      .returning();
  }
  return void res.status(200).json(row);
});

router.get("/admin/standings/:tournamentId", async (req, res) => {
  const tournamentId = Number(req.params["tournamentId"]);
  const rows = await db.select({
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

// ══════════════════════════════════════════════════════════════════════════════
// LIVE UPDATES
// ══════════════════════════════════════════════════════════════════════════════

router.delete("/admin/live-updates/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!id) return void res.status(400).json({ error: "Invalid id" });
  await db.delete(liveUpdatesTable).where(eq(liveUpdatesTable.id, id));
  return void res.status(204).send();
});

router.delete("/admin/live-updates/tournament/:tournamentId", async (req, res) => {
  const tournamentId = Number(req.params["tournamentId"]);
  await db.delete(liveUpdatesTable).where(eq(liveUpdatesTable.tournamentId, tournamentId));
  return void res.status(204).send();
});

// ══════════════════════════════════════════════════════════════════════════════
// GAMES
// ══════════════════════════════════════════════════════════════════════════════

router.get("/admin/games", async (_req, res) => {
  const rows = await db.select().from(gamesTable).orderBy(gamesTable.name);
  return void res.json(rows);
});

router.post("/admin/games", async (req, res) => {
  const { name, logoUrl, description } = req.body;
  if (!name) return void res.status(400).json({ error: "name required" });
  const slug = String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const [row] = await db.insert(gamesTable).values({ name, slug, logoUrl: logoUrl || null, description: description || null }).returning();
  return void res.status(201).json(row);
});

router.delete("/admin/games/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!id) return void res.status(400).json({ error: "Invalid id" });
  await db.delete(gamesTable).where(eq(gamesTable.id, id));
  return void res.status(204).send();
});

// ══════════════════════════════════════════════════════════════════════════════
// TEAMS
// ══════════════════════════════════════════════════════════════════════════════

router.get("/admin/teams", async (_req, res) => {
  const rows = await db.select({
    id: teamsTable.id,
    name: teamsTable.name,
    tag: teamsTable.tag,
    gameId: teamsTable.gameId,
    gameName: gamesTable.name,
    logoUrl: teamsTable.logoUrl,
    wins: teamsTable.wins,
    losses: teamsTable.losses,
    rank: teamsTable.rank,
  })
    .from(teamsTable)
    .leftJoin(gamesTable, eq(teamsTable.gameId, gamesTable.id))
    .orderBy(teamsTable.name);
  return void res.json(rows);
});

router.post("/admin/teams", async (req, res) => {
  const { name, tag, gameId, logoUrl, description } = req.body;
  if (!name || !tag || !gameId) return void res.status(400).json({ error: "name, tag, gameId required" });
  const [row] = await db.insert(teamsTable).values({
    name, tag,
    gameId: Number(gameId),
    logoUrl: logoUrl || null,
    description: description || null,
  }).returning();
  return void res.status(201).json(row);
});

router.delete("/admin/teams/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!id) return void res.status(400).json({ error: "Invalid id" });
  await db.delete(teamsTable).where(eq(teamsTable.id, id));
  return void res.status(204).send();
});

// ══════════════════════════════════════════════════════════════════════════════
// PLAYERS
// ══════════════════════════════════════════════════════════════════════════════

router.get("/admin/players", async (_req, res) => {
  const rows = await db.select({
    id: playersTable.id,
    username: playersTable.username,
    fullName: playersTable.fullName,
    gameId: playersTable.gameId,
    gameName: gamesTable.name,
    teamId: playersTable.teamId,
    teamName: teamsTable.name,
    role: playersTable.role,
    country: playersTable.country,
    rank: playersTable.rank,
    kills: playersTable.kills,
    tournamentWins: playersTable.tournamentWins,
  })
    .from(playersTable)
    .leftJoin(gamesTable, eq(playersTable.gameId, gamesTable.id))
    .leftJoin(teamsTable, eq(playersTable.teamId, teamsTable.id))
    .orderBy(playersTable.rank);
  return void res.json(rows);
});

router.post("/admin/players", async (req, res) => {
  const { username, fullName, gameId, teamId, role, country, bio, avatarUrl } = req.body;
  if (!username || !gameId) return void res.status(400).json({ error: "username, gameId required" });
  const [row] = await db.insert(playersTable).values({
    username, fullName: fullName || null,
    gameId: Number(gameId),
    teamId: teamId ? Number(teamId) : null,
    role: role || null,
    country: country || null,
    bio: bio || null,
    avatarUrl: avatarUrl || null,
  }).returning();
  return void res.status(201).json(row);
});

router.delete("/admin/players/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!id) return void res.status(400).json({ error: "Invalid id" });
  await db.delete(playersTable).where(eq(playersTable.id, id));
  return void res.status(204).send();
});

// ══════════════════════════════════════════════════════════════════════════════
// NEWS
// ══════════════════════════════════════════════════════════════════════════════

router.get("/admin/news", async (_req, res) => {
  const rows = await db.select().from(newsTable).orderBy(desc(newsTable.publishedAt));
  return void res.json(rows.map((r) => ({ ...r, publishedAt: r.publishedAt.toISOString(), tags: r.tags ?? [] })));
});

router.delete("/admin/news/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!id) return void res.status(400).json({ error: "Invalid id" });
  await db.delete(newsTable).where(eq(newsTable.id, id));
  return void res.status(204).send();
});

// ══════════════════════════════════════════════════════════════════════════════
// GALLERY
// ══════════════════════════════════════════════════════════════════════════════

router.get("/admin/gallery", async (_req, res) => {
  const rows = await db.select({
    id: galleryTable.id,
    title: galleryTable.title,
    type: galleryTable.type,
    url: galleryTable.url,
    thumbnailUrl: galleryTable.thumbnailUrl,
    tournamentId: galleryTable.tournamentId,
    tournamentName: tournamentsTable.title,
    uploadedAt: galleryTable.uploadedAt,
  })
    .from(galleryTable)
    .leftJoin(tournamentsTable, eq(galleryTable.tournamentId, tournamentsTable.id))
    .orderBy(desc(galleryTable.uploadedAt));
  return void res.json(rows.map(r => ({ ...r, uploadedAt: r.uploadedAt.toISOString() })));
});

router.post("/admin/gallery", async (req, res) => {
  const { title, type, url, thumbnailUrl, tournamentId } = req.body;
  if (!title || !type || !url) return void res.status(400).json({ error: "title, type, url required" });
  const [row] = await db.insert(galleryTable).values({
    title, type, url,
    thumbnailUrl: thumbnailUrl || null,
    tournamentId: tournamentId ? Number(tournamentId) : null,
  }).returning();
  return void res.status(201).json({ ...row, uploadedAt: row.uploadedAt.toISOString(), tournamentName: null });
});

router.delete("/admin/gallery/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!id) return void res.status(400).json({ error: "Invalid id" });
  await db.delete(galleryTable).where(eq(galleryTable.id, id));
  return void res.status(204).send();
});

// ══════════════════════════════════════════════════════════════════════════════
// SPONSORS
// ══════════════════════════════════════════════════════════════════════════════

router.get("/admin/sponsors", async (_req, res) => {
  const rows = await db.select().from(sponsorsTable).orderBy(sponsorsTable.tier);
  return void res.json(rows);
});

router.post("/admin/sponsors", async (req, res) => {
  const { name, logoUrl, website, tier, description } = req.body;
  if (!name || !tier) return void res.status(400).json({ error: "name, tier required" });
  const [row] = await db.insert(sponsorsTable).values({
    name, tier,
    logoUrl: logoUrl || null,
    website: website || null,
    description: description || null,
  }).returning();
  return void res.status(201).json(row);
});

router.delete("/admin/sponsors/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!id) return void res.status(400).json({ error: "Invalid id" });
  await db.delete(sponsorsTable).where(eq(sponsorsTable.id, id));
  return void res.status(204).send();
});

// ══════════════════════════════════════════════════════════════════════════════
// ANNOUNCEMENTS
// ══════════════════════════════════════════════════════════════════════════════

router.get("/admin/announcements", async (_req, res) => {
  const rows = await db.select().from(announcementsTable).orderBy(desc(announcementsTable.createdAt));
  return void res.json(rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    expiresAt: r.expiresAt?.toISOString() ?? null,
  })));
});

router.delete("/admin/announcements/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!id) return void res.status(400).json({ error: "Invalid id" });
  await db.delete(announcementsTable).where(eq(announcementsTable.id, id));
  return void res.status(204).send();
});

export default router;
