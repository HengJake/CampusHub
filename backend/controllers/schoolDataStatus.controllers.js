// Programmer Name : Ritchie Boon Win Yew, Backend Developer
// Program Name: schoolDataStatus.controllers.js
// Description: School data status controller managing academic year status, data synchronization, and system state management
// First Written on: July 14, 2024
// Edited on: Friday, July 17, 2024

import { isDataGenerationEnabled } from "../utils/checkExist.js";
import { controllerWrapper } from "../utils/reusable.js";

// Import all models to get collection counts
import Student from "../models/Academic/student.model.js";
import Course from "../models/Academic/course.model.js";
import Module from "../models/Academic/module.model.js";
import Lecturer from "../models/Academic/lecturer.model.js";
import Department from "../models/Academic/department.model.js";
import Intake from "../models/Academic/intake.model.js";
import IntakeCourse from "../models/Academic/intakeCourse.model.js";
import ClassSchedule from "../models/Academic/classSchedule.model.js";
import ExamSchedule from "../models/Academic/examSchedule.model.js";
import Attendance from "../models/Academic/attendance.model.js";
import Result from "../models/Academic/result.model.js";
import Room from "../models/Academic/room.model.js";
import Semester from "../models/Academic/semester.model.js";
import User from "../models/Academic/user.model.js";

import Invoice from "../models/Billing/invoice.model.js";
import Payment from "../models/Billing/payment.model.js";
import School from "../models/Billing/school.model.js";
import Subscription from "../models/Billing/subscription.model.js";

import Booking from "../models/Facility/booking.model.js";
import LockerUnit from "../models/Facility/lockerUnit.model.js";
import ParkingLot from "../models/Facility/parkingLot.model.js";
import Resource from "../models/Facility/resource.model.js";

import Feedback from "../models/Service/feedback.model.js";
import LostItem from "../models/Service/lostItem.model.js";
import Respond from "../models/Service/respond.model.js";

import BusSchedule from "../models/Transportation/busSchedule.model.js";
import EHailing from "../models/Transportation/eHailing.model.js";
import Route from "../models/Transportation/route.model.js";
import Stop from "../models/Transportation/stop.model.js";
import Vehicle from "../models/Transportation/vehicle.model.js";

const checkDataGenerationStatus = async (req, res) => {
    const { schoolId } = req.params;

    if (!schoolId) {
        return {
            success: false,
            message: 'School ID is required',
            statusCode: 400
        };
    }

    const result = await isDataGenerationEnabled(schoolId);
    return {
        success: true,
        data: result,
        message: 'Data generation status checked successfully',
        statusCode: 200
    };
};

const getDatabaseStats = async (req, res) => {
    const { schoolId } = req.params;

    if (!schoolId) {
        return {
            success: false,
            message: 'School ID is required',
            statusCode: 400
        };
    }

    try {
        // Get counts for all collections with proper error handling
        const stats = {
            // Academic collections
            students: await Student.countDocuments({ schoolId }).catch(() => 0),
            courses: await Course.countDocuments({ schoolId }).catch(() => 0),
            modules: await Module.countDocuments({ schoolId }).catch(() => 0),
            lecturers: await Lecturer.countDocuments({ schoolId }).catch(() => 0),
            departments: await Department.countDocuments({ schoolId }).catch(() => 0),
            intakes: await Intake.countDocuments({ schoolId }).catch(() => 0),
            intakeCourses: await IntakeCourse.countDocuments({ schoolId }).catch(() => 0),
            classSchedules: await ClassSchedule.countDocuments({ schoolId }).catch(() => 0),
            examSchedules: await ExamSchedule.countDocuments({ schoolId }).catch(() => 0),
            attendance: await Attendance.countDocuments({ schoolId }).catch(() => 0),
            results: await Result.countDocuments({ schoolId }).catch(() => 0),
            rooms: await Room.countDocuments({ schoolId }).catch(() => 0),
            semesters: await Semester.countDocuments({ schoolId }).catch(() => 0),

            // Billing collections
            invoices: await Invoice.countDocuments({ schoolId }).catch(() => 0),
            payments: await Payment.countDocuments({ schoolId }).catch(() => 0),
            subscriptions: await Subscription.countDocuments({ schoolId }).catch(() => 0),

            // Facility collections
            bookings: await Booking.countDocuments({ schoolId }).catch(() => 0),
            lockerUnits: await LockerUnit.countDocuments({ schoolId }).catch(() => 0),
            parkingLots: await ParkingLot.countDocuments({ schoolId }).catch(() => 0),
            resources: await Resource.countDocuments({ schoolId }).catch(() => 0),

            // Service collections
            feedback: await Feedback.countDocuments({ schoolId }).catch(() => 0),
            lostItems: await LostItem.countDocuments({ schoolId }).catch(() => 0),
            responses: await Respond.countDocuments({ schoolId }).catch(() => 0),

            // Transportation collections
            busSchedules: await BusSchedule.countDocuments({ schoolId }).catch(() => 0),
            eHailing: await EHailing.countDocuments({ schoolId }).catch(() => 0),
            routes: await Route.countDocuments({ schoolId }).catch(() => 0),
            stops: await Stop.countDocuments({ schoolId }).catch(() => 0),
            vehicles: await Vehicle.countDocuments({ schoolId }).catch(() => 0),

            // Global collections (not school-specific)
            schools: await School.countDocuments().catch(() => 0),
        };

        // Ensure all values are numbers
        Object.keys(stats).forEach(key => {
            stats[key] = Number(stats[key]) || 0;
        });

        // Calculate totals by category
        const totals = {
            academic: stats.students + stats.courses + stats.modules +
                stats.lecturers + stats.departments + stats.intakes + stats.intakeCourses +
                stats.classSchedules + stats.examSchedules + stats.attendance +
                stats.results + stats.rooms + stats.semesters,
            billing: stats.invoices + stats.payments + stats.subscriptions,
            facility: stats.bookings + stats.lockerUnits + stats.parkingLots + stats.resources,
            service: stats.feedback + stats.lostItems + stats.responses,
            transportation: stats.busSchedules + stats.eHailing + stats.routes + stats.stops + stats.vehicles,
            total: 0
        };

        // Calculate grand total
        totals.total = totals.academic + totals.billing + totals.facility + totals.service + totals.transportation;

        // Ensure all totals are numbers
        Object.keys(totals).forEach(key => {
            totals[key] = Number(totals[key]) || 0;
        });

        return {
            success: true,
            data: {
                collections: stats,
                totals: totals
            },
            message: 'Database statistics retrieved successfully',
            statusCode: 200
        };
    } catch (error) {
        console.error('Error in getDatabaseStats:', error);
        return {
            success: false,
            message: 'Error retrieving database statistics',
            error: error.message,
            statusCode: 500
        };
    }
};

const deleteAllSchoolData = async (req, res) => {
    const { schoolId } = req.params;

    if (!schoolId) {
        return {
            success: false,
            message: 'School ID is required',
            statusCode: 400
        };
    }

    try {

        // First, get all student and lecturer IDs for this school to delete their user accounts (excluding school admins)
        const students = await Student.find({ schoolId }).select('userId').lean();
        const lecturers = await Lecturer.find({ schoolId }).select('userId').lean();

        const studentUserIds = students.map(student => student.userId);
        const lecturerUserIds = lecturers.map(lecturer => lecturer.userId);
        const allUserIds = [...studentUserIds, ...lecturerUserIds];

        console.log(`Found ${studentUserIds.length} students and ${lecturerUserIds.length} lecturers to delete user accounts for (school admins preserved)`);

        // Delete all documents from each collection for the specific school
        const deletionResults = {
            // Academic collections
            students: await Student.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),
            courses: await Course.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),
            modules: await Module.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),
            lecturers: await Lecturer.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),
            departments: await Department.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),
            intakes: await Intake.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),
            intakeCourses: await IntakeCourse.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),
            classSchedules: await ClassSchedule.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),
            examSchedules: await ExamSchedule.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),
            attendance: await Attendance.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),
            results: await Result.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),
            rooms: await Room.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),
            semesters: await Semester.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),

            // Facility collections
            bookings: await Booking.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),
            lockerUnits: await LockerUnit.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),
            parkingLots: await ParkingLot.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),
            resources: await Resource.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),

            // Service collections
            feedback: await Feedback.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),
            lostItems: await LostItem.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),
            responses: await Respond.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),

            // Transportation collections
            busSchedules: await BusSchedule.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),
            eHailing: await EHailing.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),
            routes: await Route.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),
            stops: await Stop.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),
            vehicles: await Vehicle.deleteMany({ schoolId }).catch(err => ({ error: err.message, deletedCount: 0 })),
        };

        // Delete user accounts that were referenced by students, lecturers, and school admins
        let userDeletionResult = { deletedCount: 0, error: null };
        if (allUserIds.length > 0) {
            userDeletionResult = await User.deleteMany({
                _id: { $in: allUserIds }
            }).catch(err => ({ error: err.message, deletedCount: 0 }));
        }

        // Add user deletion to results
        deletionResults.academicUsers = userDeletionResult;

        console.log(`Deleted ${userDeletionResult.deletedCount || 0} user accounts (${studentUserIds.length} students + ${lecturerUserIds.length} lecturers)`);

        // Calculate total deleted documents
        let totalDeleted = 0;
        let errors = [];

        Object.keys(deletionResults).forEach(key => {
            const result = deletionResults[key];
            if (result.error) {
                errors.push(`${key}: ${result.error}`);
            } else {
                totalDeleted += result.deletedCount || 0;
            }
        });

        console.log(`Deletion completed. Total documents deleted: ${totalDeleted}`);

        return {
            success: true,
            data: {
                totalDeleted,
                deletionResults,
                errors: errors.length > 0 ? errors : null
            },
            message: `Successfully deleted ${totalDeleted} documents for school ${schoolId}`,
            statusCode: 200
        };
    } catch (error) {
        console.error('Error in deleteAllSchoolData:', error);
        return {
            success: false,
            message: 'Error deleting school data',
            error: error.message,
            statusCode: 500
        };
    }
};

export default {
    checkDataGenerationStatus: controllerWrapper(checkDataGenerationStatus),
    getDatabaseStats: controllerWrapper(getDatabaseStats),
    deleteAllSchoolData: controllerWrapper(deleteAllSchoolData)
};