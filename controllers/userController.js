import User from "../models/userModel.js";
import { s3Client, PutObjectCommand } from "../lib/s3Client.js";

import { generateUniqueFileName } from "../lib/utils.js";

// Generate a unique filename to prevent overwriting existing files

// Handle file upload to S3
const uploadProfileToS3 = async (file) => {
  try {
    // Generate unique filename
    const filename = generateUniqueFileName(file.originalname, "profile");

    // Set up the S3 upload parameters
    const uploadParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: `profile-pictures/${filename}`, // Store in profile-pictures folder
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read", // Make file publicly accessible
    };

    // Upload file to S3
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Return the URL where the file can be accessed
    return `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/profile-pictures/${filename}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
};

export const updateUser = async (req, res) => {
  try {
    // Get update data from request body
    let updateData = { ...req.body };

    if (req.body.birthday) {
      const parsedBirthday = JSON.parse(req.body.birthday);
      updateData.birthday = parsedBirthday;
    }

    const userId = req.user._id;

    // Handle file upload if a file is included in the request
    if (req.file) {
      try {
        // Upload file to S3 and get the URL
        const imageUrl = await uploadProfileToS3(req.file);

        // Add the image URL to the update data
        updateData.profilePicture = imageUrl;
      } catch (uploadError) {
        return res.status(400).json({
          status: "error",
          message: "Failed to upload profile picture: " + uploadError.message,
        });
      }
    }

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Run model validators
      select: "-password -confirmPassword", // Exclude sensitive fields
    });

    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Send successful response
    res.status(200).json({
      status: "success",

      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getAllUser = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      status: "success",
      result: users.length,
      users,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message || "Failed to fetch users",
    });
  }
};
