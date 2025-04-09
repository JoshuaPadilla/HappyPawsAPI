import moment from "moment";
import Appointment from "../models/appointmentModel.js";
import Aftercare from "../models/aftercareModel.js";

export const getReminders = async (req, res) => {
  try {
    const userID = req.user._id;

    let reminders = [];

    const todaysAppointment = await Appointment.find({
      userID,
      appointmentDate: moment().format("YYYY-MM-DD"),
    }).populate("petID", "petName");

    const todaysAftercare = await Aftercare.find({
      userID,
      endDate: { $gte: moment().format("YYYY-MM-DD") },
    }).populate("petID", "petName");

    todaysAppointment.forEach((appointment) => {
      const newReminder = {
        id: appointment._id,
        remindersType: "Appointment",
        type: appointment.typeOfService,
        title: `${appointment.petID.petName}'s ${appointment.typeOfService}`,
        time: appointment.appointmentTime,
      };

      reminders.push(newReminder);
    });

    todaysAftercare.forEach((aftercare) => {
      const newReminder = {
        id: aftercare._id,
        remindersType: "Aftercare",
        type: aftercare.type,
        title: `${aftercare.petID.petName}'s ${aftercare.type}`,
      };

      reminders.push(newReminder);
    });

    res.status(200).json({
      status: "success",
      reminders,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message || "failed to fetch reminders",
    });
  }
};
