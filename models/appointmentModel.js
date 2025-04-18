import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  appointmentDate: { type: String, required: true },
  appointmentTime: { type: String, required: true },
  appointmentNotes: { type: String },
  typeOfService: {
    type: String,
    required: true,
    enum: ["Vaccination", "Checkup", "Grooming", "Dental"],
  },
  status: {
    type: String,
    required: true,
    enum: ["Confirmed", "Cancelled", "Rescheduled", "Completed"],
    default: "Confirmed",
  },
  petID: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

appointmentSchema.index(
  { appointmentDate: 1, appointmentTime: 1 },
  { unique: true }
); // Add unique index
const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
