import moment from "moment";

export const thisWeek = {
  startDate: moment().subtract(7, "days"),
  endDate: moment(),
};

export const previousWeek = {
  endDate: moment().subtract(8, "days"),
  startDate: moment().subtract(14, "days"),
};
