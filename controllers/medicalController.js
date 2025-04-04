import Pet from "../models/petModel.js";
import moment from "moment";
import User from "../models/userModel.js";
import MedicalRecord from "../models/medicalRecordModel.js";

// Helper function to check pet ownership
const checkPetOwnership = async (userId, petId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  if (!user.pets.includes(petId) && user.role !== "admin") {
    throw new Error("This pet does not belong to you");
  }
  return user;
};

// user only controllers (GET only  - view only)

export const getAllMedicalRecordsOfUser = async (req, res) => {
  try {
    // Get the authenticated user's ID from req.user
    const userID = req.user._id;

    // Get the user with their pets populated
    const user = await User.findById(userID).populate("pets");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Find all aftercare records where the petID matches any of user's pets
    const medicalRecords = await MedicalRecord.find({ userID })
      .sort("-createdAt") // Sort by newest first
      .select("-__v"); // Exclude the version field

    res.status(200).json({
      status: "success",
      results: medicalRecords.length,
      medicalRecords,
    });
  } catch (error) {
    console.error("Error in getAllMedicalRecords:", error);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getMedicalRecordsOfPet = async (req, res) => {
  try {
    const { petID } = req.params;

    const userID = req.user._id;

    await checkPetOwnership(userID, petID);

    const pet = await Pet.findById(petID);
    if (!pet) {
      return res.status(404).json({
        status: "error",
        message: "Pet not found",
      });
    }

    const medicalRecords = await MedicalRecord.find({ petID })
      .sort("-createdAt")
      .select("-__v")
      .populate("petID");

    res.status(200).json({
      status: "success",
      results: medicalRecords.length,
      medicalRecords: medicalRecords,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getMedicalRecordById = async (req, res) => {
  try {
    const { petID, medicalID } = req.params;

    // Check if user is admin or owns the pet
    const pet = await Pet.findById(petID);
    if (!pet) {
      return res.status(404).json({
        status: "error",
        message: "Pet not found",
      });
    }

    await checkPetOwnership(req.user._id, petID);

    const medicalRecord = await MedicalRecord.findOne({
      _id: medicalID,
      petID,
    });

    if (!medicalRecord) {
      return res.status(404).json({
        status: "error",
        message: "medical record not found",
      });
    }

    res.status(200).json({
      status: "success",
      medicalRecord,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// admin only controllers

export const createMedicalRecord = async (req, res) => {
  try {
    const { petID } = req.params;
    const newMedicalRecord = {
      ...req.body,
      date: moment().format("YYYY-MM-DD"),
    };

    // Check if pet exists
    const pet = await Pet.findById(petID);
    if (!pet) {
      return res.status(404).json({
        status: "error",
        message: "Pet not found",
      });
    }

    const medicalRecord = await MedicalRecord.create({
      ...newMedicalRecord,
      petID,
    });

    // Update the pet document with the new aftercare reference
    await Pet.findByIdAndUpdate(
      petID,
      {
        $push: { medicalRecord: medicalRecord._id },
      },
      { new: true }
    );

    // to exclude the version field
    const retrievedMedicalRecord = await MedicalRecord.findById(
      medicalRecord._id
    ).select("-__v");

    res.status(201).json({
      status: "success",
      newMedicalRecord: retrievedMedicalRecord,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

export const updateMedicalRecord = async (req, res) => {
  try {
    const { petID, medicalID } = req.params;

    const updatedMedicalRecord = {
      ...req.body,
    };

    const medicalRecord = await MedicalRecord.findOneAndUpdate(
      { _id: medicalID, petID },
      updatedMedicalRecord,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!medicalRecord) {
      return res.status(404).json({
        status: "error",
        message: "medical record not found",
      });
    }

    res.status(200).json({
      status: "success",
      medicalRecord,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

export const deleteMedicalRecord = async (req, res) => {
  try {
    const { petID, medicalID } = req.params;

    // remove aftercare from pet
    await Pet.findByIdAndUpdate(
      petID,
      { $pull: { medicalRecord: medicalID } },
      { runValidators: true }
    );

    // delete the aftercare record
    const medicalRecord = await MedicalRecord.findOneAndDelete({
      _id: medicalID,
      petID,
    });

    if (!medicalRecord) {
      return res.status(404).json({
        status: "error",
        message: "medical record not found",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
