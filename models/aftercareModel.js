import mongoose from "mongoose";

const aftercareSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user id is required"],
    },
    petID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: [true, "Pet ID is required"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["Medication", "Wound Care", "Diet and Nutrition", "Follow-up"],
      trim: true,
    },

    medications: [
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
    followUpDate: {
      type: String,
      required: [true, "Follow-up date is required"],
    },
    restrictions: [
      {
        type: String,
        trim: true,
      },
    ],
    careInstructions: {
      type: String,
      required: [true, "Care instructions are required"],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    startDate: {
      type: String,
    },
    endDate: {
      type: String,
      required: [true, "End date is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
aftercareSchema.index({ petId: 1, createdAt: -1 });

const Aftercare = mongoose.model("Aftercare", aftercareSchema);

export default Aftercare;
