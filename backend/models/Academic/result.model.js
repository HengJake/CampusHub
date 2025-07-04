import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
    ModuleID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module",
        required: true,
    },
    CreditHour: {
        type: Number,
        required: true,
    },
    StudentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    },
}, { timestamps: true });

const Result = mongoose.model("Result", resultSchema);

export default Result;