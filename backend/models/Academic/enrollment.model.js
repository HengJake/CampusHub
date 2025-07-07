const enrollmentSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    semester: { type: String, required: true },
    academicYear: { type: String, required: true },
    enrollmentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['enrolled', 'dropped', 'completed'], default: 'enrolled' }
});