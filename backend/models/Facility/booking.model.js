// Programmer Name : Heng Jun Kai, Project Manager, Leader Full Stack developer
// Program Name: booking.model.js
// Description: Booking model schema defining facility reservation system, time slot management, and booking confirmation workflow
// First Written on: July 9, 2024
// Edited on: Friday, July 10, 2024

import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
        required: true,
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
    },
    bookingDate: {
        type: Date,
        required: true
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending',
    },
}, { timestamps: true });

export default mongoose.model('Booking', BookingSchema);