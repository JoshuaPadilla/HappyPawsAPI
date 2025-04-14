import mongoose from "mongoose";
import Vaccine from "./vaccineModel.js";
import MedicalRecord from "./medicalRecordModel.js";
import Aftercare from "./aftercareModel.js";
import { DeleteObjectCommand, s3Client } from "../lib/s3Client.js";

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

petSchema.statics.deletePetAndRelatedData = async function (petID) {
  try {
    const pet = await this.findById(petID);

    if (!pet) {
      return null;
    }

    await Vaccine.deleteMany({ _id: { $in: pet.vaccinationsRecord } });
    await MedicalRecord.deleteMany({ _id: { $in: pet.medicalRecord } });
    await Aftercare.deleteMany({ _id: { $in: pet.aftercares } });

    let imageKey;

    if (pet.petImage) {
      imageKey = `pet-images/${pet.petImage.split("/").at(-1)}`;
    }

    if (imageKey) {
      const deleteParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: imageKey,
      };

      try {
        const deleteCommand = new DeleteObjectCommand(deleteParams);
        await s3Client.send(deleteCommand);
      } catch (err) {
        console.error("Error deleting from S3 (pet model statics):", err);
      }
    }

    await this.findByIdAndDelete(petID);

    return { message: "Pet and related resources deleted successfully." };
  } catch (error) {
    console.error("Error deleting pet and related resources:", error);
    throw error;
  }
};

const Pet = mongoose.model("Pet", petSchema);
export default Pet;
