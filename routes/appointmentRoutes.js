import express from "express";
import {
  createAppointment,
  getUserAppointments,
  rescheduleAppointment,
  cancelAppointment,
  getAllAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentTimesByDate,
  getAppointmentByDate,
} from "../controllers/appointmentController.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { restrictToAdmin } from "../middleware/adminRoute.js";

const router = express.Router();

// Protect all routes
router.use(protectRoute);

// User routes
router.route("/").post(createAppointment).get(getUserAppointments);
router.get("/times/:date", getAppointmentTimesByDate);
router.route("/:id").patch(rescheduleAppointment);
router.patch("/cancel/:id", cancelAppointment);

// Admin routes
router.use(restrictToAdmin);
router.get("/all", getAllAppointments);
router
  .route("/:id")
  .get(getAppointment)
  .patch(updateAppointment)
  .delete(deleteAppointment);

router.route("/by-date/:date").get(getAppointmentByDate);
export default router;
