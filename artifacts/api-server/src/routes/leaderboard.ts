import { Router } from "express";
import { db } from "@workspace/db";
import { playersTable, teamsTable, gamesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetLeaderboardQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/leaderboard", async (req, res) => {
  const parsed = GetLeaderboardQueryParams.safeParse(req.query);
  if (!parsed.success) return void res.status(400).json({ error: "Invalid query" });

  const { type = "individual", gameId, limit = 50 } = parsed.data;

  if (type === "team") {
    const conditions = gameId != null ? eq(teamsTable.gameId, gameId) : undefined;
    const rows = await db
      .select({
        rank: teamsTable.rank,
        entityId: teamsTable.id,
        entityName: teamsTable.name,
        avatarUrl: teamsTable.logoUrl,
        gameName: gamesTable.name,
        points: teamsTable.points,
        wins: teamsTable.wins,
      })
      .from(teamsTable)
      .leftJoin(gamesTable, eq(teamsTable.gameId, gamesTable.id))
      .where(conditions)
      .limit(limit)
      .orderBy(teamsTable.rank);

    return void res.json(
      rows.map(r => ({
        ...r,
        entityType: "team" as const,
        kills: 0,
        country: null,
      }))
    );
  }

  const conditions = gameId != null ? eq(playersTable.gameId, gameId) : undefined;
  const rows = await db
    .select({
      rank: playersTable.rank,
      entityId: playersTable.id,
      entityName: playersTable.username,
      avatarUrl: playersTable.avatarUrl,
      gameName: gamesTable.name,
      kills: playersTable.kills,
      tournamentWins: playersTable.tournamentWins,
      country: playersTable.country,
    })
    .from(playersTable)
    .leftJoin(gamesTable, eq(playersTable.gameId, gamesTable.id))
    .where(conditions)
    .limit(limit)
    .orderBy(playersTable.rank);

  return void res.json(
    rows.map(r => ({
      rank: r.rank,
      entityId: r.entityId,
      entityName: r.entityName,
      entityType: "player" as const,
      avatarUrl: r.avatarUrl,
      gameName: r.gameName,
      points: r.kills * 10,
      kills: r.kills,
      wins: r.tournamentWins,
      country: r.country,
    }))
  );
});

export default router;
