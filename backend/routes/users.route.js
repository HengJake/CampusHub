import express from 'express';
import { createUser, createAttendance, createAcademicResult } from '../controllers/users.controllers.js';
import mongoose from 'mongoose';

const router = express.Router();

router.post('/', createUser);

router.post("/:id/Attendances", createAttendance);

router.post("/:id/Results", createAcademicResult);


export default router;