import mongoose from "mongoose";

const AcademicResultSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  course_code: { type: String, required: true },
  course_name: { type: String, required: true },
  grade: { type: Number, required: true },
  semester: { type: String, required: true },
});

export const AcademicResult = mongoose.model("AcademicResult", AcademicResultSchema);