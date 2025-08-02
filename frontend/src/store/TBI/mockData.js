import { format, subDays, addDays } from "date-fns"

export const mockData = {
  users: [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice.johnson@university.edu",
      role: "Student",
      status: "Active",
      lastLogin: format(subDays(new Date(), 1), "yyyy-MM-dd HH:mm"),
      department: "Computer Science",
      studentId: "CS2024001",
      joinDate: "2024-01-15",
      avatar: null,
    },
    {
      id: 2,
      name: "Dr. Robert Smith",
      email: "r.smith@university.edu",
      role: "Staff",
      status: "Active",
      lastLogin: format(new Date(), "yyyy-MM-dd HH:mm"),
      department: "Engineering",
      employeeId: "ENG001",
      joinDate: "2020-08-15",
      avatar: null,
    },
    {
      id: 3,
      name: "Maria Garcia",
      email: "maria.garcia@university.edu",
      role: "Student",
      status: "Inactive",
      lastLogin: format(subDays(new Date(), 5), "yyyy-MM-dd HH:mm"),
      department: "Business",
      studentId: "BUS2024002",
      joinDate: "2024-01-10",
      avatar: null,
    },
    {
      id: 4,
      name: "Prof. James Wilson",
      email: "j.wilson@university.edu",
      role: "Faculty",
      status: "Active",
      lastLogin: format(subDays(new Date(), 2), "yyyy-MM-dd HH:mm"),
      department: "Mathematics",
      employeeId: "MATH001",
      joinDate: "2018-09-01",
      avatar: null,
    },
  ],

  pendingBookings: [
    {
      id: 1,
      user: "Sarah Johnson",
      userId: 101,
      facility: "Basketball Court 1",
      facilityId: 1,
      date: format(addDays(new Date(), 1), "MMM dd, yyyy"),
      time: "2:00 PM - 4:00 PM",
      status: "pending",
      type: "court",
      requestDate: format(new Date(), "yyyy-MM-dd HH:mm"),
      purpose: "Basketball practice with team",
    },
    {
      id: 2,
      user: "Mike Chen",
      userId: 102,
      facility: "Study Room A",
      facilityId: 2,
      date: format(addDays(new Date(), 1), "MMM dd, yyyy"),
      time: "10:00 AM - 12:00 PM",
      status: "pending",
      type: "room",
      requestDate: format(subDays(new Date(), 1), "yyyy-MM-dd HH:mm"),
      purpose: "Group study session",
    },
    {
      id: 3,
      user: "Emily Davis",
      userId: 103,
      facility: "Gym Locker 45",
      facilityId: 3,
      date: format(new Date(), "MMM dd, yyyy"),
      time: "All Day",
      status: "pending",
      type: "locker",
      requestDate: format(subDays(new Date(), 2), "yyyy-MM-dd HH:mm"),
      purpose: "Semester locker assignment",
    },
  ],

  facilities: [
    {
      id: 1,
      name: "Basketball Court 1",
      type: "Sports Court",
      category: "court",
      capacity: 10,
      status: "Available",
      location: "Sports Complex A",
      equipment: ["Basketball hoops", "Scoreboard", "Sound system"],
      bookingRules: {
        maxDuration: 4,
        advanceBooking: 7,
        requiresApproval: true,
      },
      maintenanceSchedule: "Weekly - Sundays 6AM-8AM",
    },
    {
      id: 2,
      name: "Study Room A",
      type: "Study Room",
      category: "room",
      capacity: 8,
      status: "Occupied",
      location: "Library Building - Floor 2",
      equipment: ["Whiteboard", "Projector", "WiFi", "Power outlets"],
      bookingRules: {
        maxDuration: 3,
        advanceBooking: 14,
        requiresApproval: false,
      },
      maintenanceSchedule: "Daily cleaning - 11PM-12AM",
    },
    {
      id: 3,
      name: "Parking Zone A",
      type: "Parking",
      category: "parking",
      capacity: 150,
      status: "67% Occupied",
      location: "Main Campus Entrance",
      equipment: ["Security cameras", "Lighting", "Payment kiosks"],
      bookingRules: {
        maxDuration: 24,
        advanceBooking: 1,
        requiresApproval: false,
      },
      maintenanceSchedule: "Monthly inspection",
    },
  ],

  chartData: [
    { name: "Mon", bookings: 45, users: 120, revenue: 850 },
    { name: "Tue", bookings: 52, users: 135, revenue: 920 },
    { name: "Wed", bookings: 48, users: 128, revenue: 880 },
    { name: "Thu", bookings: 61, users: 145, revenue: 1050 },
    { name: "Fri", bookings: 55, users: 140, revenue: 980 },
    { name: "Sat", bookings: 67, users: 160, revenue: 1200 },
    { name: "Sun", bookings: 43, users: 110, revenue: 750 },
  ],

  recentActivity: [
    {
      id: 1,
      user: "Sarah Johnson",
      action: "booked Basketball Court 1",
      time: "2 minutes ago",
      type: "booking",
      severity: "info",
    },
    {
      id: 2,
      user: "Mike Chen",
      action: "requested locker access",
      time: "5 minutes ago",
      type: "request",
      severity: "warning",
    },
    {
      id: 3,
      user: "Emily Davis",
      action: "checked in to parking zone A",
      time: "12 minutes ago",
      type: "checkin",
      severity: "success",
    },
    {
      id: 4,
      user: "System",
      action: "automated backup completed",
      time: "1 hour ago",
      type: "system",
      severity: "info",
    },
    {
      id: 5,
      user: "John Smith",
      action: "updated profile information",
      time: "2 hours ago",
      type: "profile",
      severity: "info",
    },
  ],

  academicCalendar: [
    {
      id: 1,
      title: "Fall Semester 2024",
      startDate: "2024-08-26",
      endDate: "2024-12-15",
      status: "Active",
      type: "semester",
    },
    {
      id: 2,
      title: "Final Examinations",
      startDate: "2024-12-16",
      endDate: "2024-12-22",
      status: "Upcoming",
      type: "exam",
    },
    {
      id: 3,
      title: "Winter Break",
      startDate: "2024-12-23",
      endDate: "2025-01-15",
      status: "Upcoming",
      type: "break",
    },
  ],

  attendanceStats: {
    "Computer Science": { rate: 94, total: 450, present: 423 },
    "Business Administration": { rate: 91, total: 380, present: 346 },
    Engineering: { rate: 89, total: 520, present: 463 },
    Mathematics: { rate: 96, total: 280, present: 269 },
    "Liberal Arts": { rate: 88, total: 320, present: 282 },
  },

  systemStats: {
    totalBookingsToday: 23,
    totalBookingsWeek: 156,
    totalBookingsMonth: 678,
    averageBookingDuration: 2.5,
    mostPopularFacility: "Basketball Court 1",
    peakUsageTime: "2:00 PM - 4:00 PM",
    systemUptime: "99.8%",
    lastBackup: format(subDays(new Date(), 1), "yyyy-MM-dd HH:mm"),
  },

  // Academic Mock Data
  semesters: [
    {
      _id: "sem_001",
      courseId: {
        _id: "course_001",
        courseName: "Bachelor of Computer Science",
        courseCode: "BCS",
        courseLevel: "Undergraduate",
        duration: 36
      },
      semesterNumber: 1,
      year: 2024,
      semesterName: "Semester 1 - 2024",
      startDate: "2024-09-01",
      endDate: "2024-12-20",
      registrationStartDate: "2024-08-01",
      registrationEndDate: "2024-08-31",
      examStartDate: "2024-12-10",
      examEndDate: "2024-12-20",
      isActive: true,
      status: "in_progress",
      schoolId: "school_001"
    },
    {
      _id: "sem_002",
      courseId: {
        _id: "course_001",
        courseName: "Bachelor of Computer Science",
        courseCode: "BCS",
        courseLevel: "Undergraduate",
        duration: 36
      },
      semesterNumber: 2,
      year: 2024,
      semesterName: "Semester 2 - 2024",
      startDate: "2025-01-15",
      endDate: "2025-05-15",
      registrationStartDate: "2024-12-15",
      registrationEndDate: "2025-01-10",
      examStartDate: "2025-05-05",
      examEndDate: "2025-05-15",
      isActive: true,
      status: "upcoming",
      schoolId: "school_001"
    },
    {
      _id: "sem_003",
      courseId: {
        _id: "course_002",
        courseName: "Bachelor of Business Administration",
        courseCode: "BBA",
        courseLevel: "Undergraduate",
        duration: 36
      },
      semesterNumber: 1,
      year: 2024,
      semesterName: "Semester 1 - 2024",
      startDate: "2024-09-01",
      endDate: "2024-12-20",
      registrationStartDate: "2024-08-01",
      registrationEndDate: "2024-08-31",
      examStartDate: "2024-12-10",
      examEndDate: "2024-12-20",
      isActive: true,
      status: "in_progress",
      schoolId: "school_001"
    },
    {
      _id: "sem_004",
      courseId: {
        _id: "course_003",
        courseName: "Master of Engineering",
        courseCode: "MEng",
        courseLevel: "Postgraduate",
        duration: 24
      },
      semesterNumber: 1,
      year: 2024,
      semesterName: "Semester 1 - 2024",
      startDate: "2024-09-01",
      endDate: "2024-12-20",
      registrationStartDate: "2024-08-01",
      registrationEndDate: "2024-08-31",
      examStartDate: "2024-12-10",
      examEndDate: "2024-12-20",
      isActive: true,
      status: "in_progress",
      schoolId: "school_001"
    }
  ],

  intakeCourses: [
    {
      _id: "ic_001",
      intakeId: {
        _id: "intake_001",
        intakeName: "September 2024 Intake",
        intakeCode: "SEP2024",
        startDate: "2024-09-01",
        endDate: "2024-12-20",
        isActive: true
      },
      courseId: {
        _id: "course_001",
        courseName: "Bachelor of Computer Science",
        courseCode: "BCS",
        courseLevel: "Undergraduate",
        duration: 36
      },
      maxStudents: 100,
      currentStudents: 85,
      isActive: true
    },
    {
      _id: "ic_002",
      intakeId: {
        _id: "intake_001",
        intakeName: "September 2024 Intake",
        intakeCode: "SEP2024",
        startDate: "2024-09-01",
        endDate: "2024-12-20",
        isActive: true
      },
      courseId: {
        _id: "course_002",
        courseName: "Bachelor of Business Administration",
        courseCode: "BBA",
        courseLevel: "Undergraduate",
        duration: 36
      },
      maxStudents: 80,
      currentStudents: 72,
      isActive: true
    },
    {
      _id: "ic_003",
      intakeId: {
        _id: "intake_002",
        intakeName: "January 2025 Intake",
        intakeCode: "JAN2025",
        startDate: "2025-01-15",
        endDate: "2025-05-15",
        isActive: true
      },
      courseId: {
        _id: "course_003",
        courseName: "Master of Engineering",
        courseCode: "MEng",
        courseLevel: "Postgraduate",
        duration: 24
      },
      maxStudents: 50,
      currentStudents: 38,
      isActive: true
    }
  ],

  courses: [
    {
      _id: "course_001",
      courseName: "Bachelor of Computer Science",
      courseCode: "BCS",
      courseLevel: "Undergraduate",
      duration: 36,
      description: "A comprehensive program covering software development, algorithms, and computer systems.",
      isActive: true
    },
    {
      _id: "course_002",
      courseName: "Bachelor of Business Administration",
      courseCode: "BBA",
      courseLevel: "Undergraduate",
      duration: 36,
      description: "Business management and administration program with focus on leadership and strategy.",
      isActive: true
    },
    {
      _id: "course_003",
      courseName: "Master of Engineering",
      courseCode: "MEng",
      courseLevel: "Postgraduate",
      duration: 24,
      description: "Advanced engineering program with specialization in various engineering disciplines.",
      isActive: true
    }
  ],

  intakes: [
    {
      _id: "intake_001",
      intakeName: "September 2024 Intake",
      intakeCode: "SEP2024",
      startDate: "2024-09-01",
      endDate: "2024-12-20",
      isActive: true
    },
    {
      _id: "intake_002",
      intakeName: "January 2025 Intake",
      intakeCode: "JAN2025",
      startDate: "2025-01-15",
      endDate: "2025-05-15",
      isActive: true
    }
  ]
}
