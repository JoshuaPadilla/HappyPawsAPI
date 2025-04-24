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
  getUserAppointmentHistory,
  getAppointmentHistoryOfUser,
  getActiveAppointmentOfUser,
  markAppointmentAsCompleted,
  getOneAppointment,
} from "../controllers/appointmentController.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { restrictToAdmin } from "../middleware/adminRoute.js";

const router = express.Router();

// Protect all routes
router.use(protectRoute);

// User routes
router.route("/").post(createAppointment).get(getUserAppointments);
router.get("/all/:id", getOneAppointment);

router.patch("/cancel/:id", cancelAppointment);
router.get("/times/:date", getAppointmentTimesByDate);
router.route("/:id").patch(rescheduleAppointment);
router.get("/history", getUserAppointmentHistory);

// Admin routes
router.use(restrictToAdmin);
router.get("/all", getAllAppointments);
router
  .route("/admin/:id")
  .get(getAppointment)
  .patch(updateAppointment)
  .delete(deleteAppointment);

router.route("/by-date/:date").get(getAppointmentByDate);
router.get("/history/:userID", getAppointmentHistoryOfUser);
router.get("/active/:userID", getActiveAppointmentOfUser);
router.patch("/completed/:id", markAppointmentAsCompleted);

export default router;
