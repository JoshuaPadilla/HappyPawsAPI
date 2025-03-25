import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import moment from "moment";

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
  appointmentHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment", // Reference to appointment model.
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

const User = mongoose.model("User", userSchema);

export default User;
