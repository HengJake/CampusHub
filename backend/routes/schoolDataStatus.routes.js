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