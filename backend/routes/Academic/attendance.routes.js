import express from 'express';
import {
  createAttendance,
  getattendance,
  updateAttendance,
  deleteAttendance,
} from '../../controllers/Academic/attendance.controllers.js';  
import { get } from 'mongoose';

const router = express.Router();

// Create Attendance Record
router.post('/', createAttendance);

// Get all attendance records
router.get('/', getattendance);

// Update Attendance Record
router.put('/:id', updateAttendance);

// Delete Attendance Record     
router.delete('/:id', deleteAttendance);

export default router;
