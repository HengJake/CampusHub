// Programmer Name : Heng Jun Kai, Project Manager, Leader Full Stack developer
// Program Name: lostItem.model.js
// Description: LostItem model schema defining lost and found item management, claim processes, and item categorization
// First Written on: July 9, 2024
// Edited on: Friday, July 10, 2024

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
        image: {
            type: String,
            trim: true,
            default: null
        },
        imageData: {
            type: String, // Base64 encoded image data
            default: null
        },
        imageType: {
            type: String, // MIME type (e.g., "image/jpeg", "image/png")
            default: null
        }
    },
    status: {
        type: String,
            required: true,
            enum: ['reported', 'found', 'claimed'],
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