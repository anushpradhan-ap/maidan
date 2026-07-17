import { Router } from "express";
import { db } from "@workspace/db";
import { newsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListNewsQueryParams,
  CreateNewsPostBody,
  GetNewsPostParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/news", async (req, res) => {
  const parsed = ListNewsQueryParams.safeParse(req.query);
  if (!parsed.success) return void res.status(400).json({ error: "Invalid query" });

  const { category, limit = 20, offset = 0 } = parsed.data;
  const rows = await db
    .select()
    .from(newsTable)
    .where(category ? eq(newsTable.category, category) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(newsTable.publishedAt);

  const formatted = rows.map(r => ({
    ...r,
    publishedAt: r.publishedAt.toISOString(),
    tags: r.tags ?? [],
  }));
  return void res.json(formatted);
});

router.post("/news", async (req, res) => {
  const parsed = CreateNewsPostBody.safeParse(req.body);
  if (!parsed.success) return void res.status(400).json({ error: "Invalid body" });
  const [row] = await db.insert(newsTable).values(parsed.data).returning();
  return void res.status(201).json({ ...row, publishedAt: row.publishedAt.toISOString(), tags: row.tags ?? [] });
});

router.get("/news/:id", async (req, res) => {
  const parsed = GetNewsPostParams.safeParse(req.params);
  if (!parsed.success) return void res.status(400).json({ error: "Invalid id" });

  const [row] = await db.select().from(newsTable).where(eq(newsTable.id, parsed.data.id)).limit(1);
  if (!row) return void res.status(404).json({ error: "Not found" });
  return void res.json({ ...row, publishedAt: row.publishedAt.toISOString(), tags: row.tags ?? [] });
});

export default router;
