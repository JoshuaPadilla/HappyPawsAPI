import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { ask } from "../controllers/askMessageController.js";

const router = express.Router();

router.use(protectRoute);

router.route("/").post(ask);

export default router;
