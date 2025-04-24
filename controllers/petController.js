import Pet from "../models/petModel.js";
import User from "../models/userModel.js";
import {
  s3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "../lib/s3Client.js";
import { generateUniqueFileName } from "../lib/utils.js";

const uploadPetProfileToS3 = async (file, nameToChange = null) => {
  try {
    // Generate unique filename
    const filename = generateUniqueFileName(file.originalname, "petImage");

    // Set up the S3 upload parameters
    const uploadParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: `pet-images/${nameToChange || filename}`, // pass name to change if update function
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read", // Make file publicly accessible
    };

    // Upload file to S3
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Return the URL where the file can be accessed
    return `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/pet-images/${filename}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
};

// Helper function to check pet ownership
const checkPetOwnership = async (userId, petId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }
  if (user.role !== "admin" && !user.pets.includes(petId)) {
    throw new Error("This pet does not belong to you");
  }
  return user;
};

// Helper function to add pet to user
const addPetToUserHelper = async (userId, petData) => {
  // Create new pet

  const newPet = await Pet.create(petData);

  // Add pet to user's pets array
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $push: { pets: newPet._id } },
    {
      new: true,
      runValidators: true,
    }
  ).populate("pets");

  if (!updatedUser) {
    // Rollback pet creation if user update fails
    await Pet.findByIdAndDelete(newPet._id);
    throw new Error("User not found");
  }

  return newPet;
};

// User: Create pet for themselves
export const createUserPet = async (req, res) => {
  try {
    const userId = req.user._id;
    let petData = { ...req.body };

    // Handle file upload if a file is included in the request
    if (req.file) {
      try {
        // Upload file to S3 and get the URL
        const imageUrl = await uploadPetProfileToS3(req.file);

        // Add the image URL to the update data
        petData = { ...petData, petImage: imageUrl };
      } catch (uploadError) {
        return res.status(400).json({
          status: "error",
          message: "Failed to upload profile picture: " + uploadError.message,
        });
      }
    }

    const result = await addPetToUserHelper(userId, petData);

    res.status(201).json({
      status: "success",
      data: { newPet: result },
    });
  } catch (error) {
    res.status(error.message.includes("not found") ? 404 : 400).json({
      status: "failed",
      message: error.message || "Failed to create pet",
    });
  }
};

// get all pets (user)
// Get user's pets
export const getUserPets = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "pets",
      select: "-__v",
    });

    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      results: user.pets.length,
      pets: user.pets,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message || "Failed to fetch user's pets",
    });
  }
};

// Get specific pet (admin or owner)
export const getPet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({
        status: "failed",
        message: "Pet not found",
      });
    }

    // If user is not admin, check ownership
    if (req.user.role !== "admin") {
      const user = await User.findById(req.user._id);
      if (!user.pets.includes(pet._id)) {
        return res.status(403).json({
          status: "failed",
          message: "You don't have permission to view this pet",
        });
      }
    }

    res.status(200).json({
      status: "success",
      data: { pet },
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message || "Failed to fetch pet",
    });
  }
};

// Update user's pet (user)
export const updateUserPet = async (req, res) => {
  try {
    const { petId } = req.params;
    await checkPetOwnership(req.user._id, petId);

    let updatedPetData = req.body;

    if (req.file) {
      try {
        // Upload file to S3 and get the URL
        const imageUrl = await uploadPetProfileToS3(
          req.file,
          req.body.petImage
        );

        // Add the image URL to the update data
        updatedPetData = { ...updatedPetData, petImage: imageUrl };
      } catch (uploadError) {
        return res.status(400).json({
          status: "error",
          message: "Failed to upload profile picture: " + uploadError.message,
        });
      }
    }

    const updatedPet = await Pet.findByIdAndUpdate(petId, updatedPetData, {
      new: true,
      runValidators: true,
      select: "-__v",
    });

    if (!updatedPet) {
      return res.status(404).json({
        status: "failed",
        message: "Pet not found",
      });
    }

    res.status(200).json({
      status: "success",
      pet: updatedPet,
    });
  } catch (error) {
    res.status(error.message.includes("not found") ? 404 : 403).json({
      status: "failed",
      message: error.message || "Failed to update pet",
    });
  }
};

// User: Delete pet (user)
// Delete user's pet
export const deleteUserPet = async (req, res) => {
  try {
    const { petId } = req.params;
    await checkPetOwnership(req.user._id, petId);

    // Remove pet from user's pets array

    const pet = await Pet.findById(petId);

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

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
        console.error("Error deleting from S3:", err);
      }
    }

    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { pets: petId } },
      { runValidators: true }
    );

    // Delete the pet
    const deletedPet = await Pet.findByIdAndDelete(petId);
    if (!deletedPet) {
      return res.status(404).json({
        status: "failed",
        message: "Pet not found",
      });
    }

    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(error.message.includes("not found") ? 404 : 403).json({
      status: "failed",
      message: error.message || "Failed to delete pet",
    });
  }
};

// Admin functions
export const createPetForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const petData = req.body;

    const result = await addPetToUserHelper(userId, petData);

    res.status(201).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    res.status(error.message.includes("not found") ? 404 : 400).json({
      status: "failed",
      message: error.message || "Failed to create pet for user",
    });
  }
};

export const updatePet = async (req, res) => {
  try {
    const updatedPet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedPet) {
      return res.status(404).json({
        status: "failed",
        message: "Pet not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { pet: updatedPet },
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message || "Failed to update pet",
    });
    console.log("updatePet error:", error);
  }
};

export const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({
        status: "failed",
        message: "Pet not found",
      });
    }

    // Find all users who have this pet and remove it from their pets array
    await User.updateMany({ pets: pet._id }, { $pull: { pets: pet._id } });

    // Delete the pet
    await Pet.deletePetAndRelatedData(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message || "Failed to delete pet",
    });
  }
};

export const getAllUsersPet = async (req, res) => {
  try {
    const { userID } = req.params;
    const user = await User.findById(userID).populate({
      path: "pets",
      select: "-__v",
      populate: {
        path: "medicalRecord vaccinationsRecord aftercares",
        select: "-__v",
      },
    });

    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      results: user.pets.length,
      pets: user.pets,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message || "Failed to fetch user's pets",
    });
  }
};

export const getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find();
    res.status(200).json({
      status: "success",
      results: pets.length,
      data: { pets },
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message || "Failed to fetch pets",
    });
  }
};
