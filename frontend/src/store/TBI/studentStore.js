import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useStudentStore = create(
  persist(
    (set, get) => ({
      // Student Profile
      studentProfile: {
        id: "STU001",
        name: "John Doe",
        email: "john.doe@university.edu",
        studentId: "2024001",
        program: "Computer Science",
        year: 3,
        semester: "Fall 2024",
        avatar: null,
      },

      // Facility Management
      parkingSpots: [
        { id: "P1", zone: "Zone A", available: 45, total: 100, status: "available" },
        { id: "P2", zone: "Zone B", available: 12, total: 80, status: "limited" },
        { id: "P3", zone: "Zone C", available: 0, total: 60, status: "full" },
        { id: "P4", zone: "Faculty Parking", available: 8, total: 40, status: "available" },
      ],

      gymLockers: [
        { id: "L001", location: "Main Gym - Floor 1", status: "available", price: 5 },
        { id: "L002", location: "Main Gym - Floor 1", status: "occupied", price: 5 },
        { id: "L003", location: "Main Gym - Floor 2", status: "available", price: 5 },
        { id: "L004", location: "Sports Complex", status: "available", price: 7 },
      ],

      sportsCourtBookings: [
        { id: "SC001", name: "Basketball Court A", available: true, nextSlot: "2:00 PM - 3:00 PM" },
        { id: "SC002", name: "Tennis Court 1", available: false, nextSlot: "4:00 PM - 5:00 PM" },
        { id: "SC003", name: "Badminton Court 1", available: true, nextSlot: "1:00 PM - 2:00 PM" },
        { id: "SC004", name: "Volleyball Court", available: true, nextSlot: "3:00 PM - 4:00 PM" },
      ],

      studyRooms: [
        { id: "SR001", name: "Study Room A1", capacity: 4, available: true, equipment: ["Whiteboard", "Projector"] },
        { id: "SR002", name: "Study Room B2", capacity: 8, available: false, equipment: ["Whiteboard", "TV Screen"] },
        {
          id: "SR003",
          name: "Seminar Room C1",
          capacity: 20,
          available: true,
          equipment: ["Projector", "Sound System"],
        },
      ],

      myBookings: [
        {
          id: "B001",
          type: "Study Room",
          resource: "Study Room A1",
          date: "2024-01-15",
          time: "2:00 PM - 4:00 PM",
          status: "confirmed",
        },
        {
          id: "B002",
          type: "Sports Court",
          resource: "Basketball Court A",
          date: "2024-01-16",
          time: "6:00 PM - 7:00 PM",
          status: "pending",
        },
      ],

      lostFoundItems: [
        {
          id: "LF001",
          item: "iPhone 13",
          location: "Library - 2nd Floor",
          date: "2024-01-10",
          status: "found",
          claimed: false,
        },
        {
          id: "LF002",
          item: "Blue Backpack",
          location: "Student Center",
          date: "2024-01-12",
          status: "found",
          claimed: false,
        },
        {
          id: "LF003",
          item: "Laptop Charger",
          location: "Engineering Building",
          date: "2024-01-14",
          status: "found",
          claimed: true,
        },
      ],

      // Transportation
      shuttleSchedule: [
        {
          id: "S001",
          route: "Main Campus - Dormitory",
          nextArrival: "10:15 AM",
          frequency: "15 mins",
          status: "on-time",
        },
        {
          id: "S002",
          route: "Library - Sports Complex",
          nextArrival: "10:22 AM",
          frequency: "20 mins",
          status: "delayed",
        },
        {
          id: "S003",
          route: "Cafeteria - Parking Lot",
          nextArrival: "10:18 AM",
          frequency: "10 mins",
          status: "on-time",
        },
      ],

      campusRideRequests: [
        { id: "CR001", from: "Library", to: "Dormitory Block A", requestTime: "2024-01-15 14:30", status: "pending" },
        { id: "CR002", from: "Sports Complex", to: "Main Gate", requestTime: "2024-01-14 18:45", status: "completed" },
      ],

      // Academic Services
      academicSchedule: [
        {
          id: "AS001",
          course: "CS301 - Database Systems",
          time: "9:00 AM - 10:30 AM",
          room: "Room 201",
          instructor: "Dr. Smith",
          day: "Monday",
        },
        {
          id: "AS002",
          course: "CS302 - Software Engineering",
          time: "11:00 AM - 12:30 PM",
          room: "Room 305",
          instructor: "Prof. Johnson",
          day: "Monday",
        },
        {
          id: "AS003",
          course: "CS303 - Computer Networks",
          time: "2:00 PM - 3:30 PM",
          room: "Lab 101",
          instructor: "Dr. Brown",
          day: "Tuesday",
        },
      ],

      examSchedule: [
        {
          id: "EX001",
          course: "CS301 - Database Systems",
          date: "2024-01-25",
          time: "9:00 AM - 12:00 PM",
          room: "Exam Hall A",
          type: "Final",
        },
        {
          id: "EX002",
          course: "CS302 - Software Engineering",
          date: "2024-01-27",
          time: "2:00 PM - 5:00 PM",
          room: "Exam Hall B",
          type: "Final",
        },
        {
          id: "EX003",
          course: "CS303 - Computer Networks",
          date: "2024-01-30",
          time: "9:00 AM - 11:00 AM",
          room: "Lab 101",
          type: "Practical",
        },
      ],

      attendanceRecords: [
        { id: "AT001", course: "CS301", attended: 28, total: 30, percentage: 93.3, status: "good" },
        { id: "AT002", course: "CS302", attended: 25, total: 30, percentage: 83.3, status: "warning" },
        { id: "AT003", course: "CS303", attended: 22, total: 25, percentage: 88.0, status: "good" },
      ],

      academicResults: [
        { id: "AR001", course: "CS201 - Data Structures", grade: "A", gpa: 4.0, semester: "Spring 2023", credits: 3 },
        { id: "AR002", course: "CS202 - Algorithms", grade: "B+", gpa: 3.5, semester: "Spring 2023", credits: 3 },
        {
          id: "AR003",
          course: "CS203 - Object Oriented Programming",
          grade: "A-",
          gpa: 3.7,
          semester: "Fall 2023",
          credits: 4,
        },
      ],

      // Actions
      bookResource: (type, resourceId, date, time) => {
        const newBooking = {
          id: `B${Date.now()}`,
          type,
          resource: resourceId,
          date,
          time,
          status: "pending",
        }
        set((state) => ({
          myBookings: [...state.myBookings, newBooking],
        }))
      },

      cancelBooking: (bookingId) => {
        set((state) => ({
          myBookings: state.myBookings.filter((booking) => booking.id !== bookingId),
        }))
      },

      requestCampusRide: (from, to) => {
        const newRequest = {
          id: `CR${Date.now()}`,
          from,
          to,
          requestTime: new Date().toISOString(),
          status: "pending",
        }
        set((state) => ({
          campusRideRequests: [...state.campusRideRequests, newRequest],
        }))
      },

      submitFeedback: (feedback) => {
        // In a real app, this would send to an API
        console.log("Feedback submitted:", feedback)
      },

      reportLostItem: (item) => {
        const newItem = {
          id: `LF${Date.now()}`,
          ...item,
          date: new Date().toISOString().split("T")[0],
          status: "reported",
          claimed: false,
        }
        set((state) => ({
          lostFoundItems: [...state.lostFoundItems, newItem],
        }))
      },
    }),
    {
      name: "student-store",
    },
  ),
)
