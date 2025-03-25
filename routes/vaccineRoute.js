import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createVaccine,
  deleteVaccine,
  getVaccineById,
  getVaccineHistoryOfPet,
  updateVaccine,
} from "../controllers/vaccineController.js";
import { restrictToAdmin } from "../middleware/adminRoute.js";

const router = express.Router();

// Protect all routes
router.use(protectRoute);

// User routes (view only)
router.get("/:petID", getVaccineHistoryOfPet);
router.get("/:petID/:vaccineID", getVaccineById);

// Admin routes (full CRUD)
router.use(restrictToAdmin);
router.post("/:petID", createVaccine);
router.patch("/:petID/:vaccineID", updateVaccine);
router.delete("/:petID/:vaccineID", deleteVaccine);

export default router;
