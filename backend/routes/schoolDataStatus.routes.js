// Programmer Name : Ritchie Boon Win Yew, Backend Developer
// Program Name: schoolDataStatus.routes.js
// Description: School data status route definitions for managing academic year status and data synchronization endpoints
// First Written on: July 14, 2024
// Edited on: Friday, July 17, 2024

import express from 'express';
import { userAuth } from '../utils/authMiddleware.js';
import schoolDataStatusController from '../controllers/schoolDataStatus.controllers.js';

const router = express.Router();

// Quick check for data generation status - requires authentication
router.get('/:schoolId/generation-status', userAuth, schoolDataStatusController.checkDataGenerationStatus);

// Get database statistics for a school - requires authentication
router.get('/:schoolId/stats', userAuth, schoolDataStatusController.getDatabaseStats);

// Delete all data for a school - requires authentication
router.delete('/:schoolId/all-data', userAuth, schoolDataStatusController.deleteAllSchoolData);

export default router;