import mongoose from 'mongoose';

/**
 * Quick check to determine if data generation should be enabled
 * @param {string} schoolId - The school ID to check
 * @returns {Object} - Simple object with generation status
 */
export const isDataGenerationEnabled = async (schoolId) => {
    try {
        // Validate schoolId
        if (!schoolId || !mongoose.Types.ObjectId.isValid(schoolId)) {
            return {
                enabled: false,
                reason: 'Invalid school ID provided',
                details: null
            };
        }

        // Define collections to exclude from checking
        const excludedCollections = ['user', 'school', 'invoice', 'payment', 'subscription'];

        // Import all models dynamically
        const modelImports = {
            // Academic models
            'attendance': () => import('../models/Academic/attendance.model.js'),
            'classSchedule': () => import('../models/Academic/classSchedule.model.js'),
            'course': () => import('../models/Academic/course.model.js'),
            'department': () => import('../models/Academic/department.model.js'),
            'examSchedule': () => import('../models/Academic/examSchedule.model.js'),
            'intake': () => import('../models/Academic/intake.model.js'),
            'intakeCourse': () => import('../models/Academic/intakeCourse.model.js'),
            'lecturer': () => import('../models/Academic/lecturer.model.js'),
            'module': () => import('../models/Academic/module.model.js'),
            'result': () => import('../models/Academic/result.model.js'),
            'room': () => import('../models/Academic/room.model.js'),
            'semester': () => import('../models/Academic/semester.model.js'),
            'student': () => import('../models/Academic/student.model.js'),

            // Facility models
            'booking': () => import('../models/Facility/booking.model.js'),
            'lockerUnit': () => import('../models/Facility/lockerUnit.model.js'),
            'parkingLot': () => import('../models/Facility/parkingLot.model.js'),
            'resource': () => import('../models/Facility/resource.model.js'),

            // Service models
            'feedback': () => import('../models/Service/feedback.model.js'),
            'lostItem': () => import('../models/Service/lostItem.model.js'),
            'respond': () => import('../models/Service/respond.model.js'),

            // Transportation models
            'busSchedule': () => import('../models/Transportation/busSchedule.model.js'),
            'eHailing': () => import('../models/Transportation/eHailing.model.js'),
            'route': () => import('../models/Transportation/route.model.js'),
            'stop': () => import('../models/Transportation/stop.model.js'),
            'vehicle': () => import('../models/Transportation/vehicle.model.js')
        };

        let hasAnyData = false;
        const checkedCollections = [];
        const collectionsWithData = [];

        // Check each collection for existing data
        for (const [collectionName, importFn] of Object.entries(modelImports)) {
            // Skip excluded collections
            if (excludedCollections.includes(collectionName)) {
                continue;
            }

            try {
                const modelModule = await importFn();
                const Model = modelModule.default;

                // Determine the school field name based on model
                let schoolField = 'schoolId';

                // Some models might use different field names
                if (collectionName === 'lecturer') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'intake') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'intakeCourse') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'semester') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'module') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'course') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'department') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'room') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'classSchedule') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'examSchedule') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'attendance') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'result') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'student') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'booking') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'lockerUnit') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'parkingLot') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'resource') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'feedback') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'lostItem') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'respond') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'busSchedule') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'eHailing') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'route') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'stop') {
                    schoolField = 'schoolId';
                } else if (collectionName === 'vehicle') {
                    schoolField = 'schoolId';
                }

                const count = await Model.countDocuments({ [schoolField]: schoolId });
                checkedCollections.push(collectionName);

                if (count > 0) {
                    hasAnyData = true;
                    collectionsWithData.push({
                        collection: collectionName,
                        count: count
                    });
                }
            } catch (error) {
                console.error(`Error checking collection ${collectionName}:`, error);
                // Continue checking other collections
            }
        }

        return {
            enabled: !hasAnyData,
            reason: hasAnyData
                ? 'Some collections already contain data. Generation may overwrite existing data.'
                : 'All collections are empty. Data generation is safe.',
            details: {
                hasExistingData: hasAnyData,
                schoolId,
                checkedCollections,
                collectionsWithData,
                totalCollectionsChecked: checkedCollections.length
            }
        };
    } catch (error) {
        console.error('Error in comprehensive data generation check:', error);
        return {
            enabled: false,
            reason: 'Error occurred during check',
            details: null
        };
    }
};

