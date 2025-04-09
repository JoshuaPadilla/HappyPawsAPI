import express from "express";
import { getReminders } from "../controllers/remindersController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.use(protectRoute);

router.route("/").get(getReminders);

export default router;
