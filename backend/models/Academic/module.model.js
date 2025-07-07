import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
    moduleName: {
        type: String,
        required: true,
        trim: true
    },

    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    totalCreditHour: {
        type: Number,
        required: true,
        min: 1 // Minimum credit hour
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }]
});

const Module = mongoose.model("Module", moduleSchema);
export default Module;