import { Router } from "express";
import { db } from "@workspace/db";
import { galleryTable, tournamentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListGalleryQueryParams,
  CreateGalleryItemBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/gallery", async (req, res) => {
  const parsed = ListGalleryQueryParams.safeParse(req.query);
  if (!parsed.success) return void res.status(400).json({ error: "Invalid query" });

  const { type, limit = 20, offset = 0 } = parsed.data;
  const rows = await db
    .select({
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
    .where(type ? eq(galleryTable.type, type) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(galleryTable.uploadedAt);

  const formatted = rows.map(r => ({ ...r, uploadedAt: r.uploadedAt.toISOString() }));
  return void res.json(formatted);
});

router.post("/gallery", async (req, res) => {
  const parsed = CreateGalleryItemBody.safeParse(req.body);
  if (!parsed.success) return void res.status(400).json({ error: "Invalid body" });
  const [row] = await db.insert(galleryTable).values(parsed.data).returning();
  return void res.status(201).json({ ...row, uploadedAt: row.uploadedAt.toISOString(), tournamentName: null });
});

export default router;
