import express from "express";
import { restrictToAdmin } from "../middleware/adminRoute.js";
import {
  getMonthlyAppointments,
  getWeeklyAppointments,
} from "../controllers/insightsController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.use(protectRoute);
router.use(restrictToAdmin);
router.route("/weekly/:week").get(getWeeklyAppointments); // specify this week or previous
router.route("/monthly/:month").get(getMonthlyAppointments);

export default router;
