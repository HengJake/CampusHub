import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
    departmentName: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    DepartmentDescription: {
        type: String,   
        required: true,
        trim: true
    },  

    RoomID: {
        type: Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },

});

const Department = mongoose.model('Department', departmentSchema);
export default Department;
