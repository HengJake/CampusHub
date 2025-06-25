import mongoose from "mongoose";

const intakeSchema = new mongoose.Schema({
    CourseID: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },

    IntakeName: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    StartDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{4}-\d{2}-\d{2}$/.test(v);
            },
            message: props => `${props.value} is not a valid date format!`
        }
    },

    EndDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{4}-\d{2}-\d{2}$/.test(v);
            },
            message: props => `${props.value} is not a valid date format!`  
        }
    },
});

const Intake = mongoose.model("Intake", intakeSchema);
export default Intake;

