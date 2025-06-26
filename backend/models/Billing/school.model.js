import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    Address: {
        type: String,
        required: true,
        trim: true
    },

    City: {
        type: String,
        required: true,
        trim: true
    },

    Country: {
        type: String,
        required: true,
        trim: true
    },

    Status: {
        type: String,
        required: true,
        enum: ['active', 'inactive'],
        default: 'active'
    },

});

const School = mongoose.model('School', schoolSchema);
export default School;
