import express from 'express';
import { createUser, createAttendance, createAcademicResult, getUser, deleteUser, updateUser } from '../controllers/users.controllers.js';
import mongoose from 'mongoose';

const router = express.Router();

router.post('/', createUser);

router.get('/', getUser);

router.put('/:id', updateUser);

router.delete('/:id', deleteUser);

router.post("/:id/Attendances", createAttendance);

router.post("/:id/Results", createAcademicResult);


export default router;