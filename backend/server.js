import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import stopRoutes from "./routes/Transportation/stop.routes.js";
// import busSchedule from "./routes/Transportation/busSchedule.routes.js";
import vehicleRoutes from "./routes/Transportation/vehicle.routes.js";
import cookieParser from "cookie-parser";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cookieParser());
// allow json in requests
app.use(express.json());

app.use("/auth", authRoutes);

app.use("/api/user", userRoutes);

app.use("/api/stop", stopRoutes);
// app.use("/api/bus-schedule", busSchedule);
app.use("/api/vehicle", vehicleRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port: " + PORT);
});
