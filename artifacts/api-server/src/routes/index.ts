import { Router, type IRouter } from "express";
import healthRouter from "./health";
import narrativeRouter from "./narrative/index";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/narrative", narrativeRouter);

export default router;
