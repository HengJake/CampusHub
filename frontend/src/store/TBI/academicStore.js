import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useAcademicStore = create(
  persist(
    (set, get) => ({
      // Dashboard Stats
      dashboardStats: {
        totalStudents: 2847,
        totalLecturers: 156,
        totalCourses: 45,
        totalModules: 234,
        totalDepartments: 12,
        totalIntakes: 8,
        upcomingExams: 23,
        todayAttendance: 89,
      },

      // Students Data
      students: [
        {
          id: 1,
          studentId: "STU001",
          firstName: "Alice",
          lastName: "Johnson",
          email: "alice.johnson@university.edu",
          phone: "+1-555-0123",
          dateOfBirth: "2000-05-15",
          address: "123 Campus Drive",
          department: "Computer Science",
          intake: "2024-Fall",
          courses: ["CS101", "CS102"],
          status: "Active",
          enrollmentDate: "2024-01-15",
        },
        {
          id: 2,
          studentId: "STU002",
          firstName: "Bob",
          lastName: "Smith",
          email: "bob.smith@university.edu",
          phone: "+1-555-0124",
          dateOfBirth: "1999-08-22",
          address: "456 University Ave",
          department: "Engineering",
          intake: "2023-Fall",
          courses: ["ENG101", "ENG102"],
          status: "Active",
          enrollmentDate: "2023-09-01",
        },
        {
          id: 3,
          studentId: "STU003",
          firstName: "Carol",
          lastName: "Davis",
          email: "carol.davis@university.edu",
          phone: "+1-555-0125",
          dateOfBirth: "2001-03-10",
          address: "789 College St",
          department: "Business",
          intake: "2024-Spring",
          courses: ["BUS101"],
          status: "Inactive",
          enrollmentDate: "2024-02-01",
        },
      ],

      // Lecturers Data
      lecturers: [
        {
          id: 1,
          lecturerId: "LEC001",
          firstName: "Dr. John",
          lastName: "Wilson",
          email: "j.wilson@university.edu",
          phone: "+1-555-0200",
          department: "Computer Science",
          specialization: "Software Engineering",
          modules: ["CS101", "CS201"],
          status: "Active",
          hireDate: "2018-08-15",
        },
        {
          id: 2,
          lecturerId: "LEC002",
          firstName: "Prof. Sarah",
          lastName: "Brown",
          email: "s.brown@university.edu",
          phone: "+1-555-0201",
          department: "Engineering",
          specialization: "Mechanical Engineering",
          modules: ["ENG101", "ENG201"],
          status: "Active",
          hireDate: "2015-09-01",
        },
      ],

      // Courses Data
      courses: [
        {
          id: 1,
          courseCode: "CS101",
          courseName: "Introduction to Computer Science",
          description: "Basic concepts of computer science and programming",
          credits: 3,
          department: "Computer Science",
          modules: ["CS101-M1", "CS101-M2"],
          lecturers: ["LEC001"],
          students: ["STU001"],
          duration: "1 Semester",
          status: "Active",
        },
        {
          id: 2,
          courseCode: "ENG101",
          courseName: "Engineering Fundamentals",
          description: "Basic engineering principles and mathematics",
          credits: 4,
          department: "Engineering",
          modules: ["ENG101-M1", "ENG101-M2"],
          lecturers: ["LEC002"],
          students: ["STU002"],
          duration: "1 Semester",
          status: "Active",
        },
      ],

      // Modules Data
      modules: [
        {
          id: 1,
          moduleCode: "CS101-M1",
          moduleName: "Programming Basics",
          description: "Introduction to programming concepts",
          credits: 2,
          course: "CS101",
          lecturer: "LEC001",
          students: ["STU001"],
          duration: "8 weeks",
          status: "Active",
        },
        {
          id: 2,
          moduleCode: "CS101-M2",
          moduleName: "Data Structures",
          description: "Basic data structures and algorithms",
          credits: 2,
          course: "CS101",
          lecturer: "LEC001",
          students: ["STU001"],
          duration: "8 weeks",
          status: "Active",
        },
      ],

      // Departments Data
      departments: [
        {
          id: 1,
          departmentCode: "CS",
          departmentName: "Computer Science",
          description: "Department of Computer Science and Information Technology",
          head: "Dr. John Wilson",
          courses: ["CS101", "CS102"],
          lecturers: ["LEC001"],
          students: ["STU001"],
          established: "1995",
          status: "Active",
        },
        {
          id: 2,
          departmentCode: "ENG",
          departmentName: "Engineering",
          description: "Department of Engineering and Technology",
          head: "Prof. Sarah Brown",
          courses: ["ENG101", "ENG102"],
          lecturers: ["LEC002"],
          students: ["STU002"],
          established: "1990",
          status: "Active",
        },
      ],

      // Intakes Data
      intakes: [
        {
          id: 1,
          intakeCode: "2024-Fall",
          intakeName: "Fall 2024",
          startDate: "2024-09-01",
          endDate: "2024-12-15",
          students: ["STU001"],
          courses: ["CS101", "ENG101"],
          capacity: 500,
          enrolled: 450,
          status: "Active",
        },
        {
          id: 2,
          intakeCode: "2024-Spring",
          intakeName: "Spring 2024",
          startDate: "2024-02-01",
          endDate: "2024-05-15",
          students: ["STU003"],
          courses: ["BUS101"],
          capacity: 400,
          enrolled: 380,
          status: "Completed",
        },
      ],

      // Class Schedules Data
      classSchedules: [
        {
          id: 1,
          scheduleId: "SCH001",
          module: "CS101-M1",
          lecturer: "LEC001",
          room: "ROOM101",
          dayOfWeek: "Monday",
          startTime: "09:00",
          endTime: "11:00",
          students: ["STU001"],
          status: "Active",
        },
        {
          id: 2,
          scheduleId: "SCH002",
          module: "ENG101-M1",
          lecturer: "LEC002",
          room: "ROOM102",
          dayOfWeek: "Tuesday",
          startTime: "10:00",
          endTime: "12:00",
          students: ["STU002"],
          status: "Active",
        },
      ],

      // Rooms Data
      rooms: [
        {
          id: 1,
          roomCode: "ROOM101",
          roomName: "Computer Lab 1",
          building: "Science Building",
          floor: "1st Floor",
          capacity: 30,
          type: "Computer Lab",
          equipment: ["Computers", "Projector", "Whiteboard"],
          status: "Available",
        },
        {
          id: 2,
          roomCode: "ROOM102",
          roomName: "Lecture Hall A",
          building: "Main Building",
          floor: "2nd Floor",
          capacity: 100,
          type: "Lecture Hall",
          equipment: ["Projector", "Sound System", "Whiteboard"],
          status: "Available",
        },
      ],

      // Exam Schedules Data
      examSchedules: [
        {
          id: 1,
          examId: "EXAM001",
          module: "CS101-M1",
          examType: "Midterm",
          date: "2024-03-15",
          startTime: "09:00",
          endTime: "11:00",
          room: "ROOM101",
          students: ["STU001"],
          duration: "2 hours",
          status: "Scheduled",
        },
        {
          id: 2,
          examId: "EXAM002",
          module: "ENG101-M1",
          examType: "Final",
          date: "2024-05-20",
          startTime: "14:00",
          endTime: "17:00",
          room: "ROOM102",
          students: ["STU002"],
          duration: "3 hours",
          status: "Scheduled",
        },
      ],

      // Results Data
      results: [
        {
          id: 1,
          resultId: "RES001",
          student: "STU001",
          module: "CS101-M1",
          examType: "Midterm",
          score: 85,
          grade: "A",
          maxScore: 100,
          date: "2024-03-15",
          lecturer: "LEC001",
          status: "Published",
        },
        {
          id: 2,
          resultId: "RES002",
          student: "STU002",
          module: "ENG101-M1",
          examType: "Assignment",
          score: 78,
          grade: "B+",
          maxScore: 100,
          date: "2024-03-10",
          lecturer: "LEC002",
          status: "Published",
        },
      ],

      // Attendance Data
      attendance: [
        {
          id: 1,
          attendanceId: "ATT001",
          student: "STU001",
          module: "CS101-M1",
          date: "2024-01-20",
          status: "Present",
          lecturer: "LEC001",
          classType: "Lecture",
          notes: "",
        },
        {
          id: 2,
          attendanceId: "ATT002",
          student: "STU002",
          module: "ENG101-M1",
          date: "2024-01-20",
          status: "Absent",
          lecturer: "LEC002",
          classType: "Practical",
          notes: "Medical leave",
        },
      ],

      // CRUD Actions
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

      addLecturer: (lecturer) =>
        set((state) => ({
          lecturers: [...state.lecturers, { ...lecturer, id: Date.now() }],
        })),

      updateLecturer: (id, updates) =>
        set((state) => ({
          lecturers: state.lecturers.map((lecturer) => (lecturer.id === id ? { ...lecturer, ...updates } : lecturer)),
        })),

      deleteLecturer: (id) =>
        set((state) => ({
          lecturers: state.lecturers.filter((lecturer) => lecturer.id !== id),
        })),

      addCourse: (course) =>
        set((state) => ({
          courses: [...state.courses, { ...course, id: Date.now() }],
        })),

      updateCourse: (id, updates) =>
        set((state) => ({
          courses: state.courses.map((course) => (course.id === id ? { ...course, ...updates } : course)),
        })),

      deleteCourse: (id) =>
        set((state) => ({
          courses: state.courses.filter((course) => course.id !== id),
        })),

      // Add similar CRUD actions for other entities...
    }),
    {
      name: "academic-admin-storage",
    },
  ),
)
