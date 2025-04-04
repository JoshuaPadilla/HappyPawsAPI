import mongoose from "mongoose";
import Appointment from "../models/appointmentModel.js";
import User from "../models/userModel.js";
import moment from "moment";

// Helper function to check if appointment belongs to user
const checkAppointmentOwnership = async (userId, appointmentId) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new Error("Appointment not found");
  }
  if (appointment.userID.toString() !== userId.toString()) {
    throw new Error("This appointment does not belong to you");
  }
  return appointment;
};

// Get appointment times for a specific date
export const getAppointmentTimesByDate = async (req, res) => {
  try {
    const { date } = req.params;

    // Find all appointments for the specified date
    const appointments = await Appointment.find({
      appointmentDate: date,
      status: { $ne: "Cancelled" }, // Exclude cancelled appointments
    });

    // Map the times and their status
    const appointmentTimes = appointments.map((apt) => ({
      time: apt.appointmentTime,
    }));

    res.status(200).json({
      status: "success",
      bookedTimes: appointmentTimes,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message || "Failed to fetch appointment times",
    });
  }
};

// User Controllers

export const createAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user._id;
    const appointmentData = { ...req.body, user: userId };

    // Check if the appointment time is already booked
    // Use findOneAndUpdate with upsert: false to handle race condition
    const existingAppointment = await Appointment.findOneAndUpdate(
      {
        appointmentDate: appointmentData.appointmentDate,
        appointmentTime: appointmentData.appointmentTime,
        status: { $ne: "Cancelled" },
      },
      {}, // No update, just checking existence
      {
        session,
        new: true,
        runValidators: true,
      }
    );

    // If appointment already exists, reject the booking
    if (existingAppointment) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        status: "failed",
        message: "Appointment time already booked",
      });
    }

    const newAppointment = await Appointment.create([appointmentData], {
      session,
    });

    // Add appointment to user's appointments array
    await User.findByIdAndUpdate(
      userId,
      { $push: { appointments: newAppointment[0]._id } },
      { session }
    );

    await session.commitTransaction(); // Commit the transaction
    session.endSession();

    res.status(201).json({
      status: "success",
      appointment: newAppointment,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message || "Failed to create appointment",
    });
  }
};

export const getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      appointmentDate: { $gte: moment().format("YYYY-MM-DD") },
      userID: req.user._id,
    }).populate("petID");

    res.status(200).json({
      status: "success",
      appointments: appointments,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message || "Failed to fetch appointments",
    });
  }
};

export const getUserAppointmentHistory = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      appointmentDate: { $lt: moment().format("YYYY-MM-DD") },
      userID: req.user._id,
    }).populate("petID");

    res.status(200).json({
      status: "success",
      appointments: appointments,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message || "Failed to fetch appointments",
    });
  }
};
export const rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAppointmentForm = req.body;

    // Check ownership
    await checkAppointmentOwnership(req.user._id, id);

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      {
        ...updatedAppointmentForm,
        status: "Rescheduled",
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("petID");

    res.status(200).json({
      status: "success",
      updatedAppointment,
    });
  } catch (error) {
    res.status(error.message.includes("not found") ? 404 : 400).json({
      status: "failed",
      message: error.message || "Failed to reschedule appointment",
    });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    await checkAppointmentOwnership(req.user._id, id);

    await Appointment.findByIdAndUpdate(
      id,
      { status: "Cancelled" },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    res.status(error.message.includes("not found") ? 404 : 400).json({
      status: "failed",
      message: error.message || "Failed to cancel appointment",
    });
  }
};

// Admin Controllers

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("petID")
      .populate("userID", "firstName lastName phone profilePicture address")
      .sort({ appointmentDate: 1 });

    res.status(200).json({
      status: "success",
      results: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message || "Failed to fetch appointments",
    });
  }
};

export const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("petID", "name breed age")
      .populate("userID", "firstName lastName email phone");

    if (!appointment) {
      return res.status(404).json({
        status: "failed",
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        appointment,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message || "Failed to fetch appointment",
    });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("petID");

    if (!updatedAppointment) {
      return res.status(404).json({
        status: "failed",
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      status: "success",
      updatedAppointment,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message || "Failed to update appointment",
    });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        status: "failed",
        message: "Appointment not found",
      });
    }

    // Remove appointment from user's appointments array
    await User.findByIdAndUpdate(appointment.user, {
      $pull: { appointments: appointment._id },
    });

    // Delete the appointment
    await Appointment.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message || "Failed to delete appointment",
    });
  }
};

export const getAppointmentByDate = async (req, res) => {
  try {
    const { date } = req.params;

    const appointments = await Appointment.find({ appointmentDate: date })
      .populate("petID")
      .populate("userID");

    if (!appointments) {
      return res.status(404).json({
        status: "failed",
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      status: "success",
      appointments,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message || "Failed to fetch appointment",
    });
  }
};

export const getAppointmentHistoryOfUser = async (req, res) => {
  try {
    const { userID } = req.params;

    const appointments = await Appointment.find({
      appointmentDate: { $lt: moment().format("YYYY-MM-DD") },
      userID,
    }).populate("petID");

    res.status(200).json({
      status: "success",
      appointments: appointments,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message || "Failed to fetch appointments",
    });
  }
};

export const getActiveAppointmentOfUser = async (req, res) => {
  try {
    const { userID } = req.params;

    const appointments = await Appointment.find({
      appointmentDate: { $gte: moment().format("YYYY-MM-DD") },
      userID,
    }).populate("petID");

    res.status(200).json({
      status: "success",
      appointments: appointments,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message || "Failed to fetch appointments",
    });
  }
};
