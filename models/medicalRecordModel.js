import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    petID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    treatment: {
      type: String,
      required: true,
    },
    prescribedMedications: [
      {
        name: {
          type: String,
          required: [true, "Medication name is required"],
          trim: true,
        },
        dosage: {
          type: String,
          required: [true, "Medication dosage is required"],
          trim: true,
        },
        frequency: {
          type: String,
          required: [true, "Medication frequency is required"],
          trim: true,
        },
        startDate: {
          type: String,
          required: [true, "Medication duration is required"],
          trim: true,
        },
        endDate: {
          type: String,
          required: [true, "Medication duration is required"],
          trim: true,
        },
      },
    ],
    date: {
      type: String,
      required: true,
    },
    notes: String,
    // dateUpdated: String,
  },
  {
    timestamps: true,
  }
);

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);
export default MedicalRecord;
