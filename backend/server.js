import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import stopRoutes from "./routes/Transportation/stop.routes.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

// allow json in requests
app.use(express.json());

app.use("/api/user", userRoutes);

app.use("/api/stop", stopRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port: " + PORT);
});
