import express from 'express';
import { createUser,getUser, deleteUser, updateUser } from '../controllers/users.controllers.js';
import mongoose from 'mongoose';

const router = express.Router();

router.post('/', createUser);

router.get('/', getUser);

router.put('/:id', updateUser);

router.delete('/:id', deleteUser);


export default router;