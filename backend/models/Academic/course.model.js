import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    CourseName: {
        type: String,
        required: true,
        trim: true
    },

    Duration: {
        type: Number,
        required: true,
        min: 1 // Duration in months
    },

    ModuleID:{
        type: Schema.Types.ObjectId,
        ref: "Module",
        required: true
    }

});

const Course = mongoose.model("Course", courseSchema);

export default Course;