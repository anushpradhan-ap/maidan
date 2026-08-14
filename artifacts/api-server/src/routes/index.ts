import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tournamentsRouter from "./tournaments";
import newsRouter from "./news";
import sponsorsRouter from "./sponsors";
import announcementsRouter from "./announcements";
import statsRouter from "./stats";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(tournamentsRouter);
router.use(newsRouter);
router.use(sponsorsRouter);
router.use(announcementsRouter);
router.use(statsRouter);

export default router;
