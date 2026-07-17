import { Router } from "express";
import { db } from "@workspace/db";
import { sponsorsTable } from "@workspace/db";
import { CreateSponsorBody } from "@workspace/api-zod";

const router = Router();

router.get("/sponsors", async (_req, res) => {
  const rows = await db.select().from(sponsorsTable).orderBy(sponsorsTable.tier);
  return void res.json(rows);
});

router.post("/sponsors", async (req, res) => {
  const parsed = CreateSponsorBody.safeParse(req.body);
  if (!parsed.success) return void res.status(400).json({ error: "Invalid body" });
  const [row] = await db.insert(sponsorsTable).values(parsed.data).returning();
  return void res.status(201).json(row);
});

export default router;
