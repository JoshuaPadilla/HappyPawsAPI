import Pet from "../models/petModel.js";
import User from "../models/userModel.js";
import MedicalRecord from "../models/medicalRecordModel.js";
import Vaccine from "../models/vaccineModel.js";

// Helper function to check pet ownership
const checkPetOwnership = async (userId, petId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  if (!user.pets.includes(petId)) {
    throw new Error("This pet does not belong to you");
  }
  return user;
};

// user only controllers (GET only  - view only)

export const getVaccineHistoryOfPet = async (req, res) => {
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

    const vaccineHistory = await Vaccine.find({ petID })
      .sort("-createdAt")
      .select("-__v");

    res.status(200).json({
      status: "success",
      results: vaccineHistory.length,
      vaccineHistory,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getVaccineById = async (req, res) => {
  try {
    const { petID, vaccineID } = req.params;

    console.log(petID);
    console.log(vaccineID);

    // Check if user is admin or owns the pet
    const pet = await Pet.findById(petID);
    if (!pet) {
      return res.status(404).json({
        status: "error",
        message: "Pet not found",
      });
    }

    await checkPetOwnership(req.user._id, petID);

    const vaccine = await Vaccine.findOne({
      _id: vaccineID,
      petID,
    });

    if (!vaccine) {
      return res.status(404).json({
        status: "error",
        message: "vaccine record not found",
      });
    }

    res.status(200).json({
      status: "success",
      vaccine,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// admin only controllers

export const createVaccine = async (req, res) => {
  console.log("Creating Vaccine History");
  try {
    const { petID } = req.params;
    const newVaccineHistory = {
      ...req.body,
    };

    // Check if pet exists
    const pet = await Pet.findById(petID);
    if (!pet) {
      return res.status(404).json({
        status: "error",
        message: "Pet not found",
      });
    }

    const vaccineHistory = await Vaccine.create({
      ...newVaccineHistory,
      petID,
    });

    // Update the pet document with the new aftercare reference
    await Pet.findByIdAndUpdate(
      petID,
      {
        $push: { vaccinationsRecord: vaccineHistory._id },
      },
      { new: true }
    );

    // to exclude the version field
    const retreivedVaccine = await Vaccine.findById(vaccineHistory._id).select(
      "-__v"
    );

    res.status(201).json({
      status: "success",
      newVaccineHistory: retreivedVaccine,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

export const updateVaccine = async (req, res) => {
  try {
    const { petID, vaccineID } = req.params;

    const updatedVaccine = {
      ...req.body,
    };

    const vaccine = await Vaccine.findOneAndUpdate(
      { _id: vaccineID, petID },
      updatedVaccine,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!vaccine) {
      return res.status(404).json({
        status: "error",
        message: "medical record not found",
      });
    }

    res.status(200).json({
      status: "success",
      vaccine,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

export const deleteVaccine = async (req, res) => {
  try {
    const { petID, vaccineID } = req.params;

    // remove aftercare from pet
    await Pet.findByIdAndUpdate(
      petID,
      { $pull: { vaccinationsRecord: vaccineID } },
      { runValidators: true }
    );

    // delete the aftercare record
    const vaccine = await MedicalRecord.findOneAndDelete({
      _id: vaccineID,
      petID,
    });

    if (!vaccine) {
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
