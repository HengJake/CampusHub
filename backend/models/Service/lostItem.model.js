import mongoose from 'mongoose';

const lostItemSchema = new mongoose.Schema({
    personId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    itemDetails: {
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
        location: {
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
    },
    status: {
        type: String,
        required: true,
        enum: ['reported', 'in_search', 'found', 'claimed', 'archived'],
        default: 'reported'
    },
    matchedItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LostItem',
        default: null
    },
    resolution: {
        status: {
            type: String,
        },
        date: {
            type: Date,
        },
        notes: {
            type: String,
        }
    }
}, {
    timestamps: true
});

const LostItem = mongoose.model('LostItem', lostItemSchema);
export default LostItem;