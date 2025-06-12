import express from 'express';
import {createFacility, deleteFacility,getFacility, updateFacilty} from '../controllers/facility.controllers.js';    

const router = express.Router();

//api for viewing all facilities
router.get('/', getFacility);

//api for creating a facility
router.post('/', createFacility);

router.put('/:id', updateFacilty);

//dynamic api for deleting a facility
router.delete('/:id', deleteFacility);

export default router;