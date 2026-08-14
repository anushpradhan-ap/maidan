import { Router } from "express";
import { db } from "@workspace/db";
import { announcementsTable } from "@workspace/db";
import {
  ListAnnouncementsQueryParams,
  CreateAnnouncementBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/announcements", async (req, res) => {
  const parsed = ListAnnouncementsQueryParams.safeParse(req.query);
  if (!parsed.success) return void res.status(400).json({ error: "Invalid query" });

  const { limit = 10 } = parsed.data;
  const rows = await db
    .select()
    .from(announcementsTable)
    .limit(limit)
    .orderBy(announcementsTable.createdAt);

  const formatted = rows.map(r => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    expiresAt: r.expiresAt?.toISOString() ?? null,
  }));
  return void res.json(formatted);
});

router.post("/announcements", async (req, res) => {
  const parsed = CreateAnnouncementBody.safeParse(req.body);
  if (!parsed.success) return void res.status(400).json({ error: "Invalid body" });
  const insertData = {
    ...parsed.data,
    expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
  };
  const [row] = await db.insert(announcementsTable).values(insertData).returning();
  return void res.status(201).json({
    ...row,
    createdAt: row.createdAt.toISOString(),
    expiresAt: row.expiresAt?.toISOString() ?? null,
  });
});

export default router;
