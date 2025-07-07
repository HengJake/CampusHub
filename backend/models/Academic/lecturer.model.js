import mongoose from 'mongoose';
import Department from './department.model.js';
import Module from './module.model.js';

const lecturerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // job title
    title: { type: [String], required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    moduleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }], // Array!
    specialization: { type: [String], default: [] },
    isActive: { type: Boolean, default: true }
});

const Lecturer = mongoose.model('Lecturer', lecturerSchema);
export default Lecturer;
