import express from "express";
import { welcome } from "../controllers/homeController";

const router = express.Router();

router.route("/").get(welcome);

export default router;
