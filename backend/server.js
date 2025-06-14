import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
// import userRoutes from "./routes/users.route.js";
import facilityRoutes from "./routes/facility.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

// allow json in requests
app.use(express.json());

// manage Facility routes
app.use("/api/facility", facilityRoutes);
app.use("/api/user", userRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port: " + PORT);
});
