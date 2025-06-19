import mongoose, { isObjectIdOrHexString } from 'mongoose';

const facilitySchema = new mongoose.Schema({
    FacilitiesName: {
        type: String,
        required: true,
    },
    Type: {
        type: String,
        enum: ['classroom', 'laboratory', 'outdoor', 'indoor', 'meeting_room'],
        require: true,
    },
    Description: {
        type: String,
        require: true,
    },
    Availability: {
        type: String,
        enum: ['available', 'unavailable','booked','maintenance'],
        require: true,
    }
},{ timestamps: true });

const Facility = mongoose.model('Facility', facilitySchema);
export default Facility;