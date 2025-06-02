import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/users.route.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

// allow json in requests
app.use(express.json());

// manage user routes
app.use("/api/Users", userRoutes);



app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port: " + PORT);
});
