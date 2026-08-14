import { Router } from "express";
import { db } from "@workspace/db";
import {
  tournamentsTable,
  gamesTable,
  newsTable,
  announcementsTable,
  sponsorsTable,
  eventRegistrationsTable,
} from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

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
      bannerUrl: tournamentsTable.bannerUrl,
    })
    .from(tournamentsTable)
    .leftJoin(gamesTable, eq(tournamentsTable.gameId, gamesTable.id))
    .orderBy(desc(tournamentsTable.startDate));
  return void res.json(rows);
});

router.post("/admin/tournaments", async (req, res) => {
  const { title, gameName, startDate, endDate, prizePool, maxTeams, totalRounds, description, rules, bannerUrl } = req.body;
  if (!title || !gameName || !startDate || !prizePool || !maxTeams) {
    return void res.status(400).json({ error: "title, gameName, startDate, prizePool, maxTeams required" });
  }

  // Find or create the game by name
  const existing = await db.select().from(gamesTable).where(eq(gamesTable.name, gameName)).limit(1);
  let gameId: number;
  if (existing.length > 0) {
    gameId = existing[0].id;
  } else {
    const slug = String(gameName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const [newGame] = await db.insert(gamesTable).values({ name: gameName, slug }).returning();
    gameId = newGame.id;
  }

  const values: Record<string, unknown> = {
    title, gameId, startDate, prizePool, maxTeams: Number(maxTeams), status: "upcoming",
  };
  if (endDate) values["endDate"] = endDate;
  if (totalRounds) values["totalRounds"] = Number(totalRounds);
  if (description) values["description"] = description;
  if (rules) values["rules"] = rules;
  if (bannerUrl) values["bannerUrl"] = bannerUrl;

  const [row] = await db.insert(tournamentsTable).values(values as Parameters<typeof db.insert>[0]["values"] & object).returning();
  return void res.status(201).json({ ...row, gameName });
});

router.patch("/admin/tournaments/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!id) return void res.status(400).json({ error: "Invalid id" });
  const allowed = [
    "status", "currentRound", "totalRounds", "teamsAlive", "currentZone",
    "streamUrl", "title", "prizePool", "description", "rules", "startDate",
    "endDate", "maxTeams", "bannerUrl",
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
  // event_registrations cascade-delete automatically
  await db.delete(tournamentsTable).where(eq(tournamentsTable.id, id));
  return void res.status(204).send();
});

// ══════════════════════════════════════════════════════════════════════════════
// NEWS
// ══════════════════════════════════════════════════════════════════════════════

router.get("/admin/news", async (_req, res) => {
  const rows = await db.select().from(newsTable).orderBy(desc(newsTable.createdAt));
  return void res.json(rows.map(r => ({
    ...r,
    publishedAt: r.publishedAt.toISOString(),
    createdAt: r.createdAt.toISOString(),
    tags: r.tags ?? [],
  })));
});

router.post("/admin/news", async (req, res) => {
  const { title, slug, excerpt, content, category, coverUrl, author, tags, status, isBreaking, publishedAt } = req.body;
  if (!title || !excerpt || !content || !author) {
    return void res.status(400).json({ error: "title, excerpt, content, author required" });
  }
  const autoSlug = slug || String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const parsedTags = tags
    ? (Array.isArray(tags) ? tags : String(tags).split(",").map((t: string) => t.trim()).filter(Boolean))
    : null;

  const [row] = await db.insert(newsTable).values({
    title: String(title),
    slug: autoSlug,
    excerpt: String(excerpt),
    content: String(content),
    category: category || "gaming",
    coverUrl: coverUrl || null,
    author: String(author),
    tags: parsedTags,
    status: status || "published",
    isBreaking: isBreaking === true || isBreaking === "true",
    publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
  }).returning();

  return void res.status(201).json({
    ...row,
    publishedAt: row.publishedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    tags: row.tags ?? [],
  });
});

router.patch("/admin/news/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!id) return void res.status(400).json({ error: "Invalid id" });

  const allowed = ["title", "slug", "excerpt", "content", "category", "coverUrl", "author", "tags", "status", "isBreaking", "publishedAt"] as const;
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }
  if (Object.keys(update).length === 0) return void res.status(400).json({ error: "No fields to update" });
  if (update["publishedAt"]) update["publishedAt"] = new Date(update["publishedAt"] as string);
  if (update["isBreaking"] !== undefined) update["isBreaking"] = update["isBreaking"] === true || update["isBreaking"] === "true";
  if (update["tags"] && !Array.isArray(update["tags"])) {
    update["tags"] = String(update["tags"]).split(",").map((t: string) => t.trim()).filter(Boolean);
  }

  const [row] = await db.update(newsTable)
    .set(update as Parameters<typeof db.update>[0]["set"] & object)
    .where(eq(newsTable.id, id))
    .returning();
  if (!row) return void res.status(404).json({ error: "Not found" });
  return void res.json({ ...row, publishedAt: row.publishedAt.toISOString(), createdAt: row.createdAt.toISOString(), tags: row.tags ?? [] });
});

router.delete("/admin/news/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!id) return void res.status(400).json({ error: "Invalid id" });
  await db.delete(newsTable).where(eq(newsTable.id, id));
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
  const { name, logoUrl, websiteUrl, website, tier, description } = req.body;
  if (!name || !tier) return void res.status(400).json({ error: "name, tier required" });
  const [row] = await db.insert(sponsorsTable).values({
    name, tier,
    logoUrl: logoUrl || "",
    websiteUrl: websiteUrl || website || null,
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
  return void res.json(rows.map(r => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    expiresAt: r.expiresAt?.toISOString() ?? null,
  })));
});

router.post("/announcements", async (req, res) => {
  const { title, content, type } = req.body;
  if (!title || !content) return void res.status(400).json({ error: "title, content required" });
  const [row] = await db.insert(announcementsTable).values({
    title, content, type: type || "info",
  }).returning();
  return void res.status(201).json({ ...row, createdAt: row.createdAt.toISOString(), expiresAt: null });
});

router.delete("/admin/announcements/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!id) return void res.status(400).json({ error: "Invalid id" });
  await db.delete(announcementsTable).where(eq(announcementsTable.id, id));
  return void res.status(204).send();
});

// ══════════════════════════════════════════════════════════════════════════════
// EVENT REGISTRATIONS (read-only for admin)
// ══════════════════════════════════════════════════════════════════════════════

router.get("/admin/registrations", async (_req, res) => {
  const rows = await db
    .select({
      id: eventRegistrationsTable.id,
      tournamentId: eventRegistrationsTable.tournamentId,
      tournamentName: tournamentsTable.title,
      fullName: eventRegistrationsTable.fullName,
      email: eventRegistrationsTable.email,
      phone: eventRegistrationsTable.phone,
      teamName: eventRegistrationsTable.teamName,
      message: eventRegistrationsTable.message,
      createdAt: eventRegistrationsTable.createdAt,
    })
    .from(eventRegistrationsTable)
    .leftJoin(tournamentsTable, eq(eventRegistrationsTable.tournamentId, tournamentsTable.id))
    .orderBy(desc(eventRegistrationsTable.createdAt));
  return void res.json(rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

router.get("/admin/registrations/:tournamentId", async (req, res) => {
  const tournamentId = Number(req.params["tournamentId"]);
  const rows = await db
    .select()
    .from(eventRegistrationsTable)
    .where(eq(eventRegistrationsTable.tournamentId, tournamentId))
    .orderBy(desc(eventRegistrationsTable.createdAt));
  return void res.json(rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

export default router;
