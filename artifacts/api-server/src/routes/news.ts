import { Router } from "express";
import { db } from "@workspace/db";
import { newsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

// GET /news/breaking — latest breaking published post (must be before /:id)
router.get("/news/breaking", async (_req, res) => {
  const [row] = await db
    .select()
    .from(newsTable)
    .where(and(eq(newsTable.status, "published"), eq(newsTable.isBreaking, true)))
    .orderBy(desc(newsTable.publishedAt))
    .limit(1);
  if (!row) return void res.status(404).json({ error: "No breaking news" });
  return void res.json({ ...row, publishedAt: row.publishedAt.toISOString(), tags: row.tags ?? [] });
});

// GET /news — published posts only, newest first, with optional category & search filters
router.get("/news", async (req, res) => {
  const category = req.query["category"] as string | undefined;
  const search = (req.query["search"] as string | undefined)?.toLowerCase();

  const conditions: ReturnType<typeof eq>[] = [eq(newsTable.status, "published")];
  if (category) conditions.push(eq(newsTable.category, category));

  let rows = await db
    .select()
    .from(newsTable)
    .where(and(...conditions))
    .orderBy(desc(newsTable.publishedAt));

  // In-memory search (title + excerpt)
  if (search) {
    rows = rows.filter(r =>
      r.title.toLowerCase().includes(search) || r.excerpt.toLowerCase().includes(search)
    );
  }

  return void res.json(rows.map(r => ({
    ...r,
    publishedAt: r.publishedAt.toISOString(),
    createdAt: r.createdAt.toISOString(),
    tags: r.tags ?? [],
  })));
});

// GET /news/:id — single published post
router.get("/news/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!id) return void res.status(400).json({ error: "Invalid id" });
  const [row] = await db
    .select()
    .from(newsTable)
    .where(and(eq(newsTable.id, id), eq(newsTable.status, "published")))
    .limit(1);
  if (!row) return void res.status(404).json({ error: "Not found" });
  return void res.json({ ...row, publishedAt: row.publishedAt.toISOString(), createdAt: row.createdAt.toISOString(), tags: row.tags ?? [] });
});

export default router;
