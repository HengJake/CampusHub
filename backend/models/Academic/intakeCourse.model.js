const intakeCourseSchema = new mongoose.Schema({
    intakeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Intake', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    maxStudents: { type: Number, required: true, min: 1 },
    currentEnrollment: { type: Number, default: 0, min: 0 },
    feeStructure: {
        localStudent: { type: Number, required: true },
        internationalStudent: { type: Number, required: true }
    },
    isActive: { type: Boolean, default: true }
});