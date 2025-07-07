import mongoose from "mongoose";

const academicPeriodSchema = new mongoose.Schema({
    academicYear: { type: String, required: true }, // "2024/2025"
    semester: {
        type: String,
        enum: ['Semester 1', 'Semester 2', 'Short Semester'],
        required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
});

export default mongoose.model("AcademicCalendar", academicCalendarSchema);

