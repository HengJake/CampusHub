import mongoose from 'mongoose';

const lostItemSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    lostLocation: {
        type: String,
        required: true,
        trim: true,
        enum: ['library', 'cafeteria', 'classroom', 'court', 'parking lot', 'lobby', 'office', 'gym', 'outdoor_area', 'other']
    },
    lostDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        required: true,
        enum: ['reported', 'in_search', 'found', 'claimed', 'archived'],
        default: 'reported'
    },
    matchedItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoundItem',
        default: null
    }
});

const LostItem = mongoose.model('LostItem', lostItemSchema);
export default LostItem;