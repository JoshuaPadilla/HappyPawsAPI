import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";

// routers
import petRouter from "./routes/petRoutes.js";
import userRouter from "./routes/userRoutes.js";
import authRouter from "./routes/authRoute.js";
import appointmentRouter from "./routes/appointmentRoutes.js";
import aftercareRoutes from "./routes/aftercareRoutes.js";
import medicalRoutes from "./routes/medicalRoutes.js";
import vaccineRoutes from "./routes/vaccineRoute.js";
import insightsRoutes from "./routes/insightsRoute.js";
import remindersRoute from "./routes/remindersRoute.js";

export const app = express();

dotenv.config({ path: "./config.env" });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

app.use("/api/happy-paws/pets", petRouter);
app.use("/api/happy-paws/users", userRouter);
app.use("/api/happy-paws/auth", authRouter);
app.use("/api/happy-paws/appointments", appointmentRouter);
app.use("/api/happy-paws/aftercare", aftercareRoutes);
app.use("/api/happy-paws/medical", medicalRoutes);
app.use("/api/happy-paws/vaccine", vaccineRoutes);
app.use("/api/happy-paws/insights", insightsRoutes);
app.use("/api/happy-paws/reminders", remindersRoute);
