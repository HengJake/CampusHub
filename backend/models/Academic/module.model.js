import mongoose from "mongoose"; 

const moduleSchema = new mongoose.Schema({
    ModuleName: {
        type: String,
        required: true,
        trim: true
    },

    Code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    CreditHour: {
        type: Number,
        required: true,
        min: 1 // Minimum credit hour
    },  

});

const Module = mongoose.model("Module", moduleSchema);
export default Module;