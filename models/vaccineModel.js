import mongoose from "mongoose";

const vaccineSchema = new mongoose.Schema(
  {
    petID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    vaccineName: {
      type: String,
      required: true,
    },
    dateAdministered: {
      type: String,
      required: true,
    },
    dueDate: {
      type: String,
      required: true,
    },
    validity: {
      type: String,
      required: true,
      enum: ["3 Months", "6 Months", "9 Months", "1 Year"],
    },
    administeredBy: {
      type: String,
      required: true,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

const Vaccine = mongoose.model("Vaccine", vaccineSchema);
export default Vaccine;
