import mongoose, { isObjectIdOrHexString } from 'mongoose';

const facilitySchema = new mongoose.Schema({
    FacilitiesName: {
        type: String,
        required: true,
    },
    Type: {
        type: String,
        require: true,
    },
    Description: {
        type: String,
        require: true,
    },
    Availability: {
        type: String,
        require: true,
    }
},{ timestamps: true });

const Facility = mongoose.model('Facility', facilitySchema);
export default Facility;