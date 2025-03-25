import express from "express";
import {
  createAftercare,
  getAftercare,
  getAftercareById,
  updateAftercare,
  deleteAftercare,
  getUserAftercare,
} from "../controllers/aftercareController.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { restrictToAdmin } from "../middleware/adminRoute.js";

const router = express.Router();

// Protect all routes
router.use(protectRoute);

// User routes (view only)
router.get("/", getUserAftercare);
router.get("/:petID", getAftercare);
router.get("/:petID/:aftercareId", getAftercareById);

// Admin routes (full CRUD)
router.use(restrictToAdmin);
router.post("/:petID", createAftercare);
router.patch("/:petID/:aftercareID", updateAftercare);
router.delete("/:petID/:aftercareID", deleteAftercare);

export default router;
