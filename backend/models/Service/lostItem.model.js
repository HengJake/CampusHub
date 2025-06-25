import mongoose from 'mongoose';

const lostItemschema = new mongoose.Schema({
    Owner: {
        type: String,
        ref: 'User',
        required: true,
        trim: true
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

    Lostlocation: {
        type: String,
        required: true,
        trim: true,
        enum: ['library', 'cafeteria', 'classroom', 'court', 'parking lot', 'other']
    },

    MatchedItem: {
        type: String,
        ref: 'FoundItem',
        default: null
    },

});

const LostItem = mongoose.model('LostItem', lostItemschema);
export default LostItem;