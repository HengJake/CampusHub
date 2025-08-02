import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useAdminStore = create(
  persist(
    (set, get) => ({
      // Dashboard Stats
      dashboardStats: {
        totalStudents: 2847,
        activeBookings: 156,
        facilityUsage: 78,
        pendingApprovals: 23,
        totalFacilities: 45,
        totalLockers: 850,
        parkingSpots: 600,
        announcements: 12,
      },

      // Students Data
      students: [
        {
          id: 1,
          name: "Alice Johnson",
          email: "alice.johnson@university.edu",
          studentId: "STU001",
          department: "Computer Science",
          year: "Junior",
          status: "Active",
          joinDate: "2022-09-01",
          phone: "+1-555-0123",
          address: "123 Campus Drive",
        },
        {
          id: 2,
          name: "Bob Smith",
          email: "bob.smith@university.edu",
          studentId: "STU002",
          department: "Engineering",
          year: "Senior",
          status: "Active",
          joinDate: "2021-09-01",
          phone: "+1-555-0124",
          address: "456 University Ave",
        },
        {
          id: 3,
          name: "Carol Davis",
          email: "carol.davis@university.edu",
          studentId: "STU003",
          department: "Business",
          year: "Sophomore",
          status: "Inactive",
          joinDate: "2023-09-01",
          phone: "+1-555-0125",
          address: "789 College St",
        },
      ],

      // Facilities Data
      facilities: [
        {
          id: 1,
          name: "Basketball Court A",
          type: "Sports",
          capacity: 20,
          status: "Available",
          location: "Sports Complex",
          maintenance: "Good",
          bookings: 45,
        },
        {
          id: 2,
          name: "Study Room 101",
          type: "Academic",
          capacity: 8,
          status: "Occupied",
          location: "Library",
          maintenance: "Excellent",
          bookings: 78,
        },
        {
          id: 3,
          name: "Conference Hall",
          type: "Meeting",
          capacity: 100,
          status: "Maintenance",
          location: "Admin Building",
          maintenance: "Under Repair",
          bookings: 12,
        },
      ],

      // Lockers Data
      lockers: Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        number: `L${String(i + 1).padStart(3, "0")}`,
        status: Math.random() > 0.3 ? "Occupied" : "Available",
        assignedTo: Math.random() > 0.3 ? `Student ${i + 1}` : null,
        floor: Math.floor(i / 25) + 1,
        section: String.fromCharCode(65 + Math.floor((i % 25) / 5)),
      })),

      // Parking Data
      parkingLots: [
        {
          id: 1,
          name: "Main Parking Lot",
          totalSpots: 200,
          occupiedSpots: 156,
          type: "Student",
          location: "Main Campus",
        },
        {
          id: 2,
          name: "Faculty Parking",
          totalSpots: 100,
          occupiedSpots: 78,
          type: "Faculty",
          location: "Academic Building",
        },
        {
          id: 3,
          name: "Visitor Parking",
          totalSpots: 50,
          occupiedSpots: 23,
          type: "Visitor",
          location: "Main Entrance",
        },
      ],

      // Bookings Data
      bookings: [
        {
          id: 1,
          studentName: "Alice Johnson",
          facility: "Basketball Court A",
          date: "2024-01-20",
          time: "14:00-16:00",
          status: "Pending",
          purpose: "Basketball practice",
        },
        {
          id: 2,
          studentName: "Bob Smith",
          facility: "Study Room 101",
          date: "2024-01-21",
          time: "10:00-12:00",
          status: "Approved",
          purpose: "Group study",
        },
      ],

      // Feedback Data
      feedback: [
        {
          id: 1,
          studentName: "Alice Johnson",
          category: "Facility",
          subject: "Basketball Court Lighting",
          message: "The lighting in Basketball Court A needs improvement.",
          status: "Open",
          priority: "Medium",
          date: "2024-01-15",
        },
        {
          id: 2,
          studentName: "Bob Smith",
          category: "Service",
          subject: "Booking System",
          message: "The booking system is very user-friendly.",
          status: "Resolved",
          priority: "Low",
          date: "2024-01-14",
        },
      ],

      // Announcements Data
      announcements: [
        {
          id: 1,
          title: "Maintenance Schedule",
          content: "Basketball Court A will be under maintenance from Jan 25-27.",
          category: "Maintenance",
          targetAudience: "All Students",
          status: "Active",
          publishDate: "2024-01-15",
          expiryDate: "2024-01-30",
        },
        {
          id: 2,
          title: "New Study Rooms Available",
          content: "Two new study rooms have been added to the library.",
          category: "Facility",
          targetAudience: "Students",
          status: "Draft",
          publishDate: "2024-01-20",
          expiryDate: "2024-02-20",
        },
      ],

      systemSettings: {
        maintenanceMode: false,
        allowRegistrations: true,
        maxBookingDuration: 2,
        autoApproveBookings: false,
        emailNotifications: true,
      },

      // Actions
      addStudent: (student) =>
        set((state) => ({
          students: [...state.students, { ...student, id: Date.now() }],
        })),

      updateStudent: (id, updates) =>
        set((state) => ({
          students: state.students.map((student) => (student.id === id ? { ...student, ...updates } : student)),
        })),

      deleteStudent: (id) =>
        set((state) => ({
          students: state.students.filter((student) => student.id !== id),
        })),

      updateBookingStatus: (id, status) =>
        set((state) => ({
          bookings: state.bookings.map((booking) => (booking.id === id ? { ...booking, status } : booking)),
        })),

      addAnnouncement: (announcement) =>
        set((state) => ({
          announcements: [...state.announcements, { ...announcement, id: Date.now() }],
        })),

      updateFeedbackStatus: (id, status) =>
        set((state) => ({
          feedback: state.feedback.map((item) => (item.id === id ? { ...item, status } : item)),
        })),
      updateSystemSettings: (newSettings) =>
        set({ systemSettings: { ...get().systemSettings, ...newSettings } }),
    }),
    {
      name: "campushub-admin-storage",
    },
  ),
)
