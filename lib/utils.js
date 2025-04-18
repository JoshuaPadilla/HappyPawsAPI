import moment from "moment";
import User from "../models/userModel.js";

export const generateUniqueFileName = (originalname, folderName) => {
  const extension = originalname.split(".").pop();
  const timestamp = Date.now(); // Get current timestamp
  return `${folderName}-${timestamp}.${extension}`;
};

export const groupedAppointments = (appointments) => {
  return appointments.reduce((grouped, appointment) => {
    const date = appointment.appointmentDate; // Extract the appointmentDate for grouping
    if (!grouped[date]) {
      // If the date doesn't exist as a key in the grouped object, create an empty array
      grouped[date] = [];
    }
    // Push the current appointment into the array associated with its appointmentDate
    grouped[date].push(appointment);
    return grouped; // Return the updated grouped object
  }, {});
};

export const getAppointmentServicePopularity = (appointments) => {
  const allServiceType = ["Vaccination", "Checkup", "Grooming", "Dental"];

  const mappedApointmentServiceType = appointments.reduce(
    (counts, appointment) => {
      const serviceType = appointment.typeOfService;
      counts[serviceType] = (counts[serviceType] || 0) + 1; // Increment count for each date
      return counts;
    },
    {}
  );

  return allServiceType.map((service) => {
    return {
      serviceType: service,
      count: mappedApointmentServiceType[service] || 0,
    };
  });
};

export const getAppointmentStatusCount = (appointments) => {
  // Define an array containing all the possible appointment statuses we want to track.
  const allStatuses = ["Confirmed", "Cancelled", "Completed", "Rescheduled"];

  // Use the reduce method to iterate over the appointments array and count occurrences of each status.
  const mappedAppointmentsStatus = appointments.reduce(
    (counts, appointment) => {
      const status = appointment.status;
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    },
    {}
  );

  return allStatuses.map((status) => {
    return { status: status, count: mappedAppointmentsStatus[status] || 0 };
  });
};

export const countAppointmentsByWeekday = (appointments) => {
  const weekdayCounts = {};
  const today = moment();
  const endOfWeek = today.clone(); // Today as the end of the week
  const startOfWeek = today.clone().subtract(6, "days"); // 7 days ago, including today

  // Initialize weekday counts for the past week including today
  for (let i = 0; i < 7; i++) {
    weekdayCounts[startOfWeek.clone().add(i, "days").format("ddd")] = 0;
  }

  if (!appointments || appointments.length === 0) {
    return weekdayCounts;
  }

  appointments.forEach((appointment) => {
    try {
      const appointmentDateStr = appointment.appointmentDate;
      if (appointmentDateStr) {
        const appointmentDate = moment(appointmentDateStr, "YYYY-MM-DD");
        if (
          appointmentDate.isBetween(
            startOfWeek.clone().subtract(1, "days"),
            endOfWeek,
            null,
            "[]"
          )
        ) {
          // Include start and end dates
          weekdayCounts[appointmentDate.format("ddd")] += 1;
        }
      }
    } catch (error) {
      console.error("Error processing appointment:", error);
    }
  });

  return Object.entries(weekdayCounts).map(([key, value]) => {
    return { date: key, count: value };
  });
};

export const countMonthlyAppointmentsByday = (appointments) => {
  const weekdayCounts = {};
  const today = moment();
  const endOfMonth = today.clone(); // Today as the end of the week
  const startOfMonth = today.clone().subtract(30, "days"); // 7 days ago, including today

  // Initialize weekday counts for the past week including today
  for (let i = 0; i < 31; i++) {
    weekdayCounts[startOfMonth.clone().add(i, "days").format("MMM DD")] = 0;
  }

  if (!appointments || appointments.length === 0) {
    return weekdayCounts;
  }

  appointments.forEach((appointment) => {
    try {
      const appointmentDateStr = appointment.appointmentDate;
      if (appointmentDateStr) {
        const appointmentDate = moment(appointmentDateStr, "YYYY-MM-DD");
        if (
          appointmentDate.isBetween(
            startOfMonth.clone().subtract(1, "days"),
            endOfMonth,
            null,
            "[]"
          )
        ) {
          // Include start and end dates
          weekdayCounts[appointmentDate.format("MMM DD")] += 1;
        }
      }
    } catch (error) {
      console.error("Error processing appointment:", error);
    }
  });

  return Object.entries(weekdayCounts).map(([key, value]) => {
    return { date: key, count: value };
  });
};

export const newUsersThisWeek = async (startDate, endDate) => {
  const newUsers = await User.find({
    joinedAt: {
      $gte: startDate.format("YYYY-MM-DD"), // Query as string
      $lt: endDate.format("YYYY-MM-DD"), // Query as string
    },
  });

  return newUsers.length;
};

export const newUsersThisMonth = async (startDate, endDate) => {
  const newUsers = await User.find({
    joinedAt: {
      $gte: startDate.format("YYYY-MM-DD"), // Query as string
      $lt: endDate.format("YYYY-MM-DD"), // Query as string
    },
  });

  return newUsers.length;
};

export const getVaccineDueDate = (vaccineValidity, dateAdministered) => {
  const startDate = moment(dateAdministered) || moment();

  let value;
  let unit;

  switch (vaccineValidity) {
    case "3 Months":
      (value = 3), (unit = "months");
      break;
    case "6 Months":
      (value = 6), (unit = "months");
      break;
    case "9 Months":
      (value = 9), (unit = "months");
      break;
    case "1 Year":
      (value = 1), (unit = "year");
      break;
    default:
      break;
  }

  return startDate.clone().add(value, unit).format("YYYY-MM-DD");
};
