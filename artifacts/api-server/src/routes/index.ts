import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tournamentsRouter from "./tournaments";
import gamesRouter from "./games";
import teamsRouter from "./teams";
import playersRouter from "./players";
import newsRouter from "./news";
import galleryRouter from "./gallery";
import sponsorsRouter from "./sponsors";
import announcementsRouter from "./announcements";
import leaderboardRouter from "./leaderboard";
import liveRouter from "./live";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tournamentsRouter);
router.use(gamesRouter);
router.use(teamsRouter);
router.use(playersRouter);
router.use(newsRouter);
router.use(galleryRouter);
router.use(sponsorsRouter);
router.use(announcementsRouter);
router.use(leaderboardRouter);
router.use(liveRouter);
router.use(statsRouter);

export default router;
