import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createMedicalRecord,
  deleteMedicalRecord,
  getAllMedicalRecordsOfUser,
  getMedicalRecordById,
  getMedicalRecordsOfPet,
  updateMedicalRecord,
} from "../controllers/medicalController.js";
import { restrictToAdmin } from "../middleware/adminRoute.js";

const router = express.Router();

// Protect all routes
router.use(protectRoute);

// User routes (view only)
router.get("/", getAllMedicalRecordsOfUser);
router.get("/:petID", getMedicalRecordsOfPet);
router.get("/:petID/:medicalID", getMedicalRecordById);

// Admin routes (full CRUD)
router.use(restrictToAdmin);
router.post("/:petID", createMedicalRecord);
router.patch("/:petID/:medicalID", updateMedicalRecord);
router.delete("/:petID/:medicalID", deleteMedicalRecord);

export default router;
