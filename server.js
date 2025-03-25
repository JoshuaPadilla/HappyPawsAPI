/* eslint-env node */
import mongoose from "mongoose";
import { app } from "./app.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

// getWeeklyAppointments();
// const LOCAL_DB = process.env.DATABASE_LOCAL;

mongoose.connect(DB).then(() => {
  console.log("DB successfully connected");
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`HappyPaws backend is running on port: ${port}`);
});
