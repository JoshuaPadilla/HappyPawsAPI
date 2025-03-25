import mongoose from "mongoose";

const petSchema = new mongoose.Schema({
  petName: {
    type: String,
    required: true,
  },
  petAge: { type: String },
  petBreed: { type: String },
  petSpecie: { type: String, required: true },
  petImage: { type: String, default: null },
  petGender: {
    type: String,
    enum: ["Male", "Female", "Unknown"],
    default: "Unknown",
  },
  vaccinationsRecord: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Vaccine", default: [] },
  ],
  medicalRecord: [
    { type: mongoose.Schema.Types.ObjectId, ref: "MedicalRecord", default: [] },
  ],
  aftercares: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Aftercare", default: [] },
  ],
});

const Pet = mongoose.model("Pet", petSchema);
export default Pet;
