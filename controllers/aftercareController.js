import Aftercare from "../models/aftercareModel.js";
import Pet from "../models/petModel.js";
import User from "../models/userModel.js";

// Create aftercare record (Admin only)
export const createAftercare = async (req, res) => {
  try {
    const { petID, userID } = req.params;
    const newAftercare = {
      ...req.body,
      userID,
    };

    // Check if pet exists
    const pet = await Pet.findById(petID);
    if (!pet) {
      return res.status(404).json({
        status: "error",
        message: "Pet not found",
      });
    }

    const aftercare = await Aftercare.create({
      ...newAftercare,
      petID,
    });

    // Update the pet document with the new aftercare reference
    await Pet.findByIdAndUpdate(
      petID,
      {
        $push: { aftercares: aftercare._id },
      },
      { new: true }
    );

    // to exclude the version field
    const retrievedAftercare = await Aftercare.findById(aftercare._id).select(
      "-__v"
    );

    res.status(201).json({
      status: "success",
      newAftercare: retrievedAftercare,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get all aftercare records for a pet
export const getAftercare = async (req, res) => {
  try {
    const { petID } = req.params;

    // Check if user is admin or owns the pet
    const pet = await Pet.findById(petID);
    if (!pet) {
      return res.status(404).json({
        status: "error",
        message: "Pet not found",
      });
    }

    const aftercare = await Aftercare.find({ petID })
      .sort("-createdAt")
      .select("-__v")
      .populate({
        path: "petID",
        select: "petName",
      });

    res.status(200).json({
      status: "success",
      results: aftercare.length,
      aftercares: aftercare,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getOneAftercare = async (req, res) => {
  try {
    const { aftercareID } = req.params;

    const aftercare = await Aftercare.findById({ _id: aftercareID })
      .sort("-createdAt")
      .select("-__v")
      .populate({
        path: "petID",
        select: "petName",
      });

    res.status(200).json({
      status: "success",
      aftercare,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get single aftercare record
export const getAftercareById = async (req, res) => {
  try {
    const { petID, aftercareId } = req.params;

    // Check if user is admin or owns the pet
    const pet = await Pet.findById(petID);
    if (!pet) {
      return res.status(404).json({
        status: "error",
        message: "Pet not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      pet.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to view this record",
      });
    }

    const aftercare = await Aftercare.findOne({
      _id: aftercareId,
      petID,
    });

    if (!aftercare) {
      return res.status(404).json({
        status: "error",
        message: "Aftercare record not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        aftercare,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update aftercare record (Admin only)
export const updateAftercare = async (req, res) => {
  try {
    const updatedForm = req.body;
    const { aftercareID } = req.params;

    const updatedAftercare = await Aftercare.findOneAndUpdate(
      { _id: aftercareID },
      updatedForm,
      {
        new: true,
        runValidators: true,
      }
    ).populate("petID", "petName");

    if (!updatedAftercare) {
      return res.status(404).json({
        status: "error",
        message: "Aftercare record not found",
      });
    }

    res.status(200).json({
      status: "success",
      updatedAftercare,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete aftercare record (Admin only)
export const deleteAftercare = async (req, res) => {
  try {
    const { petID, aftercareID } = req.params;

    // remove aftercare from pet
    await Pet.findByIdAndUpdate(
      petID,
      { $pull: { aftercares: aftercareID } },
      { runValidators: true }
    );

    // delete the aftercare record
    const aftercare = await Aftercare.findOneAndDelete({
      _id: aftercareID,
      petID,
    });

    if (!aftercare) {
      return res.status(404).json({
        status: "error",
        message: "Aftercare record not found",
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

// Get all aftercare records for a user's pets
export const getUserAftercare = async (req, res) => {
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

    // If user has no pets, return empty array
    if (!user.pets || user.pets.length === 0) {
      return res.status(200).json({
        status: "success",
        results: 0,
        aftercares: [],
        message: "No pets found for this user",
      });
    }

    // Extract pet IDs from the user's pets array
    const petIDs = user.pets.map((pet) => pet._id);

    // Find all aftercare records where the petID matches any of user's pets
    const aftercares = await Aftercare.find({ petID: { $in: petIDs } })
      .sort("-createdAt") // Sort by newest first
      .populate({
        path: "petID", // Populate the pet information
        select: "petName petSpecie petBreed", // Select only these fields
      })
      .select("-__v"); // Exclude the version field

    res.status(200).json({
      status: "success",
      results: aftercares.length,
      aftercares,
    });
  } catch (error) {
    console.error("Error in getUserAftercare:", error);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
