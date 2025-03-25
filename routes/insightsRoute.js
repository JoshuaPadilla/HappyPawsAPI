import express from "express";
import { restrictToAdmin } from "../middleware/adminRoute.js";
import { getWeeklyAppointments } from "../controllers/insightsController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.use(protectRoute);
router.use(restrictToAdmin);
router.route("/weekly").get(getWeeklyAppointments);

export default router;
