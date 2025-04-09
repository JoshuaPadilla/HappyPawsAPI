import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import moment from "moment";
import Pet from "./petModel.js";
import Appointment from "./appointmentModel.js";

const userBirthdaySchema = new mongoose.Schema({
  date: { type: String, required: true },
  month: { type: String, required: true },
  year: { type: String, required: true },
});

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  birthday: {
    type: userBirthdaySchema,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Optional: store emails in lowercase
    trim: true, // Optional: remove leading/trailing whitespace
    validate: [validator.isEmail, "enter a valid email"],
  },
  phone: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female"], // Optional: restrict to specific genders
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  profilePicture: {
    type: String,
    default: null,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  confirmPassword: {
    type: String,
    required: true,
    validate: {
      // This is works on CREATE and SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: "password are not the same",
    },
  },
  pets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet", // Reference to a Pet model (if you have one)
    },
  ],
  appointments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment", // Reference to appointment model.
    },
  ],
  joinedAt: {
    type: String,
    default: moment().format("YYYY-MM-DD"),
  },
});

userSchema.pre("save", async function (next) {
  // ONly run this function if password is modified
  if (!this.isModified("password")) return next();

  //  hash the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // delete the confirm password field
  this.confirmPassword = undefined;

  next();
});

userSchema.statics.deleteUserAndRelatedData = async function (userID) {
  try {
    const user = await this.findById(userID);

    if (!user) {
      return null; // User not found
    }

    // Delete related Pets
    for (const petID of user.pets) {
      await Pet.deletePetAndRelatedData(petID);
    }

    // Delete related Appointments (both appointments and appointmentHistory)
    await Appointment.deleteMany({
      _id: { $in: [...user.appointments] },
    });

    // Delete the user
    await this.findByIdAndDelete(userID);

    return { message: "User and related data deleted successfully." };
  } catch (error) {
    console.error("Error deleting user and related data:", error);
    throw error; // Rethrow the error for handling in the controller
  }
};

const User = mongoose.model("User", userSchema);

export default User;
