import express from "express";
import { checkAuth, signin, signup } from "../controllers/authController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.route("/signin").post(signin);
router.route("/signup").post(signup);
router.route("/check").post(protectRoute, checkAuth);

export default router;
