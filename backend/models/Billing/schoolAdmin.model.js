import mongoose from 'mongoose';

const schoolAdminSchema = new mongoose.Schema({
    UserID: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    SchoolID: {
        type: Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        validate: {
            validator: async function(v) {
                const schoolExists = await mongoose.model('School').exists({ _id: v });
                return schoolExists;
            },
            message: props => 'School does not exist!'
        }
    },  

    Status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
        required: true
    },

});

const SchoolAdmin = mongoose.model('SchoolAdmin', schoolAdminSchema);
export default SchoolAdmin;