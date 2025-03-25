import Appointment from "../models/appointmentModel.js";
import {
  countAppointmentsByWeekday,
  getAppointmentServicePopularity,
  getAppointmentsWeeklyStatus,
  newUsersThisWeek,
} from "../lib/utils.js";
import { thisWeek } from "../lib/constants.js";
import User from "../models/userModel.js";

export const getWeeklyAppointments = async (req, res) => {
  try {
    const thisWeeksAppointments = await Appointment.find({
      appointmentDate: {
        $gte: thisWeek.startDate.format("YYYY-MM-DD"), // Query as string
        $lt: thisWeek.endDate.format("YYYY-MM-DD"), // Query as string
      },
    });

    const allUsersCount = await User.find();

    const totalUsers = allUsersCount.length;

    const newUserCount = newUsersThisWeek(allUsersCount);

    const thisWeekServicePopularity = getAppointmentServicePopularity(
      thisWeeksAppointments
    );

    const thisWeekStatusCount = getAppointmentsWeeklyStatus(
      thisWeeksAppointments
    );

    const thisWeeksCountsByDay = countAppointmentsByWeekday(
      thisWeeksAppointments
    );

    const averageAppointmentsPerWeek = thisWeeksAppointments.length / 7;

    res.status(200).json({
      status: "success",
      insights: {
        numberOfWeeklyAppointment: thisWeeksAppointments.length,
        thisWeeksCountsByDay,
        thisWeekServicePopularity,
        thisWeekStatusCount,
        totalUsers,
        newUserCount,
        averageAppointmentsPerWeek,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "failed",
      message: "Server internal error",
    });
  }
};
