import Appointment from "../models/appointmentModel.js";
import {
  countAppointmentsByWeekday,
  countMonthlyAppointmentsByday,
  getAppointmentServicePopularity,
  getAppointmentStatusCount,
  newUsersThisMonth,
  // getAppointmentStatusCount,
  // getAppointmentsWeeklyStatus,
  // newUsersThisMonth,
  newUsersThisWeek,
} from "../lib/utils.js";
import {
  previousMonth,
  previousWeek,
  thisMonth,
  thisWeek,
} from "../lib/constants.js";
import User from "../models/userModel.js";

export const getWeeklyAppointments = async (req, res) => {
  try {
    const { week } = req.params;

    let startDate;
    let endDate;

    if (week === "currWeek") {
      startDate = thisWeek.startDate;
      endDate = thisWeek.endDate;
    } else {
      startDate = previousWeek.startDate;
      endDate = previousWeek.endDate;
    }

    const weeklyAppointments = await Appointment.find({
      appointmentDate: {
        $gte: startDate.format("YYYY-MM-DD"), // Query as string
        $lte: endDate.format("YYYY-MM-DD"), // Query as string
      },
    });

    const allUsersCount = await User.find();

    const totalUsers = allUsersCount.length;

    const newUserCount = await newUsersThisWeek(startDate, endDate);

    const weeklyServicePopularity =
      getAppointmentServicePopularity(weeklyAppointments);

    const weeklyStatusCount = getAppointmentStatusCount(weeklyAppointments);

    const weeklyCountsByDay = countAppointmentsByWeekday(weeklyAppointments);

    const averageAppointmentsPerWeek = weeklyAppointments.length / 7;

    res.status(200).json({
      status: "success",
      insights: {
        numberOfWeeklyAppointment: weeklyAppointments.length,
        weeklyCountsByDay,
        weeklyServicePopularity,
        weeklyStatusCount,
        totalUsers,
        newUserCount,
        averageAppointmentsPerWeek,
        startDate: startDate.format("MMM-DD"),
        endDate: endDate.format("MMM-DD"),
      },
    });
  } catch (error) {
    console.log("error in get weekly appintments: ", error);
    res.status(400).json({
      status: "failed",
      message: "Server internal error",
    });
  }
};

export const getMonthlyAppointments = async (req, res) => {
  try {
    const { month } = req.params;

    let startDate;
    let endDate;

    if (month === "currMonth") {
      startDate = thisMonth.startDate;
      endDate = thisMonth.endDate;
    } else {
      startDate = previousMonth.startDate;
      endDate = previousMonth.endDate;
    }

    const monthlyAppointments = await Appointment.find({
      appointmentDate: {
        $gte: startDate.format("YYYY-MM-DD"), // Query as string
        $lte: endDate.format("YYYY-MM-DD"), // Query as string
      },
    });

    const allUsersCount = await User.find();

    const totalUsers = allUsersCount.length;

    const newUserCount = await newUsersThisMonth(startDate, endDate);

    const monthlyServicePopularity =
      getAppointmentServicePopularity(monthlyAppointments);

    const monthlyStatusCount = getAppointmentStatusCount(monthlyAppointments);

    const monthlyCountsByDay =
      countMonthlyAppointmentsByday(monthlyAppointments);

    const averageAppointmentsPerMonth = monthlyAppointments.length / 30;

    res.status(200).json({
      status: "success",
      insights: {
        numberOfMonthlyAppointments: monthlyAppointments.length,
        monthlyServicePopularity,
        monthlyCountsByDay,
        monthlyStatusCount,
        totalUsers,
        newUserCount,
        averageAppointmentsPerMonth,
        startDate: startDate.format("MMM-DD"),
        endDate: endDate.format("MMM-DD"),
      },
    });
  } catch (error) {
    console.log("error in get monthly appointments: ", error);
    res.status(400).json({
      status: "failed",
      message: "Server internal error",
    });
  }
};
