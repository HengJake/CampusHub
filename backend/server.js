import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";

// 1 Academic
import userRoutes from "./routes/Academic/user.routes.js";
import authRoutes from "./routes/auth.routes.js";

// 2 Billing
import subscriptionRoutes from "./routes/Billing/subscription.routes.js";

// 3 Transportation
import stopRoutes from "./routes/Transportation/stop.routes.js";
// import busSchedule from "./routes/Transportation/busSchedule.routes.js";
import vehicleRoutes from "./routes/Transportation/vehicle.routes.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cookieParser());
// allow json in requests
app.use(express.json());

// 1 Academic
app.use("/auth", authRoutes);
app.use("/api/user", userRoutes);

// 2 Billing
app.use("/api/subscription", subscriptionRoutes);

// 3 Transportation
app.use("/api/stop", stopRoutes);
// app.use("/api/bus-schedule", busSchedule);
app.use("/api/vehicle", vehicleRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port: " + PORT);
});
