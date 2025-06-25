import mongoose from 'mongoose';

const foundItemSchema = new mongoose.Schema({
    SubmittedBy: {
        type: String,
        ref: 'User',
        required: true
    },

    Name: {
        type: String,
        required: true,
        trim: true
    },

    Description: {
        type: String,
        required: true,
        trim: true
    },

    FoundLocation: {
        type: String,
        required: true,
        trim: true,
        enum: ['library', 'cafeteria', 'classroom', 'court', 'parking lot', 'other']
    },

    FoundDate: {
        type: DateTime,
        required: true, 
        default: Date.now
    },

    ClaimedBy: {
        type: String,
        ref: 'User',
        default: null
    },

    Status: {
        type: String,
        required: true,
        enum: ['available', 'claimed', 'unclaimed'],
        default: 'available'
    },
});

const FoundItem = mongoose.model('FoundItem', foundItemSchema);
export default FoundItem;
