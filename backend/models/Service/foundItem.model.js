import mongoose from 'mongoose';

const foundItemSchema = new mongoose.Schema({
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
    foundLocation: {
        type: String,
        required: true,
        trim: true,
        enum: ['library', 'cafeteria', 'classroom', 'court', 'parking lot', 'lobby', 'office', 'gym', 'outdoor_area', 'other']
    },
    foundDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    image: {
        type: String // Base64
    },
    claimedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    status: {
        type: String,
        required: true,
        enum: ['unclaimed', 'claimed', 'pending', 'archived'],
        default: 'unclaimed'
    }
});

const FoundItem = mongoose.model('FoundItem', foundItemSchema);
export default FoundItem;
