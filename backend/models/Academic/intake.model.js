import mongoose from "mongoose";

const intakeSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },

    intakeName: {
        type: String,
        required: true,
        trim: true,
    },
    intakeMonth: {
        type: String,
        enum: ['January', 'May', 'September'],
        required: true
    },
    academicYear: {
        type: String,
        required: true,
        // e.g., "2024/2025"
        validate: {
            validator: function (v) {
                return /^\d{4}\/\d{4}$/.test(v);
            },
            message: props => `${props.value} is not a valid academic year format (YYYY/YYYY)!`
        }
    },
    duration: {
        // 1 = week
        type: Number,
        required: true,
    },
});

const Intake = mongoose.model("Intake", intakeSchema);
export default Intake;

