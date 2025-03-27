import moment from "moment";

export const thisWeek = {
  startDate: moment().subtract(7, "days"),
  endDate: moment(),
};

export const previousWeek = {
  endDate: moment().subtract(8, "days"),
  startDate: moment().subtract(14, "days"),
};

export const thisMonth = {
  startDate: moment().subtract(30, "days"),
  endDate: moment(),
};

export const previousMonth = {
  startDate: moment().subtract(31, "days"),
  endDate: moment().subtract(60),
};
