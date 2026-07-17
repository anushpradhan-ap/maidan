import { Router } from "express";
import { db } from "@workspace/db";
import { gamesTable, insertGameSchema } from "@workspace/db";
import { CreateGameBody } from "@workspace/api-zod";

const router = Router();

router.get("/games", async (_req, res) => {
  const rows = await db.select().from(gamesTable).orderBy(gamesTable.name);
  return void res.json(rows);
});

router.post("/games", async (req, res) => {
  const parsed = CreateGameBody.safeParse(req.body);
  if (!parsed.success) return void res.status(400).json({ error: "Invalid body" });
  const [row] = await db.insert(gamesTable).values(parsed.data).returning();
  return void res.status(201).json(row);
});

export default router;
