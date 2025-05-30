import express from "express";
import {
  createUser,
  createAttendance,
  createAcademicResult,
} from "../controllers/users.controllers.js";
import mongoose from "mongoose";

const router = express.Router();

router.post("/", async (req, res) => {
    
});
