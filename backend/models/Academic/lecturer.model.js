import mongoose from 'mongoose';
import Department from './department.model';
import Module from './module.model';

const lecturerSchema = new mongoose.Schema({
    UserID: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    StaffName: {
        type: String,
        required: true,
        trim: true
    },

    Title: {
        type: Array,
        required: true,
        validate: {
            validator: function(v) {
                return v.length > 0;
            },
            message: props => 'At least one title is required!'
        }
    },

    DepartmentID: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
        required: true,
        validate: {
            validator: async function(v) {
                const departmentExists = await Department.exists({ _id: v });
                return departmentExists;
            },
            message: props => 'Department does not exist!'
        }
    },

    ModuleID : {
        type: Schema.Types.ObjectId,
        ref: 'Module',
        required: true,
        validate: {
            validator: async function(v) {
                const moduleExists = await Module.exists({ _id: v });
                return moduleExists;
            },
            message: props => 'Module does not exist!'
        }
    },

});

const Lecturer = mongoose.model('Lecturer', lecturerSchema);
export default Lecturer;
