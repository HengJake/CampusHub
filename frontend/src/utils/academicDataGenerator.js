// Academic Data Generator Utility
// Generates realistic academic and service data for an existing school
// Uses store functions to create real objects and get actual IDs

import { useAcademicStore } from '../store/academic.js';
import { useUserStore } from '../store/user.js';
import { useFacilityStore } from '../store/facility.js';
import { useServiceStore } from '../store/service.js';
import { useTransportationStore } from '../store/transportation.js';

// Function to delete all school data
export const deleteAllSchoolData = async (schoolId) => {
    try {
        const response = await fetch(`/api/school-data-status/${schoolId}/all-data`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            if (result.data.errors && result.data.errors.length > 0) {
                console.warn('Some deletions had errors:', result.data.errors);
            }
            return result.data;
        } else {
            throw new Error(result.message || 'Deletion failed');
        }
    } catch (error) {
        console.error('Error deleting school data:', error);
        throw error;
    }
};

// Standalone function to just clear data (for Clear Data button)
export const clearSchoolData = async (schoolId) => {
    try {
        const result = await deleteAllSchoolData(schoolId);
        return result;
    } catch (error) {
        console.error('Error clearing school data:', error);
        throw error;
    }
};

// Helper function to generate random dates within a range
const generateRandomDate = (startYear = 2024, endYear = 2025) => {
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 11, 31);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to generate random phone numbers
const generatePhoneNumber = (baseNumber = 60123456789) => {
    const randomOffset = Math.floor(Math.random() * 1000);
    return baseNumber + randomOffset;
};

// Helper function to generate random names
const generateNames = () => {
    const firstNames = [
        'Ahmad', 'Muhammad', 'Siti', 'Nor', 'Mohd', 'Abdul', 'Fatimah', 'Aminah',
        'John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emily',
        'Chen', 'Li', 'Wang', 'Zhang', 'Liu', 'Yang', 'Wu', 'Zhou',
        'Raj', 'Priya', 'Arun', 'Meera', 'Vikram', 'Anjali', 'Suresh', 'Kavita'
    ];

    const lastNames = [
        'Bin Abdullah', 'Binti Ahmad', 'Bin Hassan', 'Binti Ismail',
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia',
        'Chen', 'Wang', 'Li', 'Zhang', 'Liu', 'Yang', 'Wu',
        'Patel', 'Singh', 'Kumar', 'Sharma', 'Verma', 'Gupta', 'Malhotra'
    ];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
};

// Generate academic data for an existing school
export const generateAcademicData = async (schoolId, schoolPrefix = 'SCH', userCounts = { lecturer: 8, student: 50 }) => {
    const { lecturer: lecturerCount, student: studentCount } = userCounts;

    // Get store instances
    const academicStore = useAcademicStore.getState();
    const userStore = useUserStore.getState();

    try {
        // First, delete all existing data for this school
        await deleteAllSchoolData(schoolId);

        // 1. Generate Rooms
        const rooms = [];
        const roomData = [
            {
                block: "Block A",
                floor: "Ground Floor",
                roomNumber: 101,
                roomStatus: "available",
                type: "office",
                capacity: 10,
                facilities: ["air_conditioning", "whiteboard"],
                isActive: true,
                schoolId: schoolId
            },
            {
                block: "Block B",
                floor: "Level 1",
                roomNumber: 201,
                roomStatus: "available",
                type: "classroom",
                capacity: 30,
                facilities: ["projector", "whiteboard", "air_conditioning"],
                isActive: true,
                schoolId: schoolId
            },
            {
                block: "Block C",
                floor: "Level 2",
                roomNumber: 301,
                roomStatus: "available",
                type: "tech_lab",
                capacity: 25,
                facilities: ["computers", "projector", "air_conditioning"],
                isActive: true,
                schoolId: schoolId
            },
            {
                block: "Block D",
                floor: "Level 1",
                roomNumber: 401,
                roomStatus: "available",
                type: "seminar_room",
                capacity: 100,
                facilities: ["projector", "sound_system", "air_conditioning"],
                isActive: true,
                schoolId: schoolId
            }
        ];

        // Create rooms and get their IDs
        for (const roomDataItem of roomData) {
            try {
                const createdRoom = await academicStore.createRoom(roomDataItem);
                rooms.push(createdRoom.data);
            } catch (error) {
                console.error('Failed to create room:', error);
                throw error;
            }
        }

        // 2. Generate Departments
        const departments = [];
        const departmentData = [
            {
                departmentName: "Computer Science",
                departmentDescription: "Department of Computer Science and Information Technology",
                roomId: rooms[0]._id,
                isActive: true,
                contactEmail: `cs@${schoolPrefix.toLowerCase()}.edu.my`,
                contactPhone: "03-12345678",
                schoolId: schoolId
            },
            {
                departmentName: "Information Technology",
                departmentDescription: "Department of IT and Digital Systems",
                roomId: rooms[0]._id,
                isActive: true,
                contactEmail: `it@${schoolPrefix.toLowerCase()}.edu.my`,
                contactPhone: "03-87654321",
                schoolId: schoolId
            },
            {
                departmentName: "Business Administration",
                departmentDescription: "Department of Business and Management",
                roomId: rooms[0]._id,
                isActive: true,
                contactEmail: `business@${schoolPrefix.toLowerCase()}.edu.my`,
                contactPhone: "03-11223344",
                schoolId: schoolId
            }
        ];

        // Create departments and get their IDs
        for (const deptDataItem of departmentData) {
            try {
                const createdDept = await academicStore.createDepartment(deptDataItem);
                departments.push(createdDept.data);
            } catch (error) {
                console.error('Failed to create department:', error);
                throw error;
            }
        }

        // 3. Generate Courses
        const courses = [];
        const courseData = [
            {
                courseName: "Bachelor of Computer Science (Hons)",
                courseCode: "BCS",
                courseDescription: "A comprehensive program covering software development, database systems, and web technologies",
                courseLevel: "Bachelor",
                courseType: "Full Time",
                totalCreditHours: 120,
                minimumCGPA: 2.0,
                departmentId: departments[0]._id,
                duration: 36,
                totalYear: 3,
                totalSemester: 6,
                entryRequirements: ["SPM with 5 credits", "Mathematics"],
                careerProspects: ["Software Developer", "System Analyst", "Database Administrator"],
                isActive: true,
                schoolId: schoolId
            },
            {
                courseName: "Bachelor of Information Technology (Hons)",
                courseCode: "BIT",
                courseDescription: "Covers IT infrastructure, networking, and security",
                courseLevel: "Bachelor",
                courseType: "Full Time",
                totalCreditHours: 120,
                minimumCGPA: 2.0,
                departmentId: departments[1]._id,
                duration: 36,
                totalYear: 3,
                totalSemester: 6,
                entryRequirements: ["SPM with 5 credits", "English"],
                careerProspects: ["IT Consultant", "Network Engineer", "Security Analyst"],
                isActive: true,
                schoolId: schoolId
            },
            {
                courseName: "Bachelor of Business Administration (Hons)",
                courseCode: "BBA",
                courseDescription: "Comprehensive business management program",
                courseLevel: "Bachelor",
                courseType: "Full Time",
                totalCreditHours: 120,
                minimumCGPA: 2.0,
                departmentId: departments[2]._id,
                duration: 36,
                totalYear: 3,
                totalSemester: 6,
                entryRequirements: ["SPM with 5 credits", "Mathematics"],
                careerProspects: ["Business Analyst", "Marketing Manager", "Financial Advisor"],
                isActive: true,
                schoolId: schoolId
            }
        ];

        // Create courses and get their IDs
        for (const courseDataItem of courseData) {
            try {
                const createdCourse = await academicStore.createCourse(courseDataItem);
                courses.push(createdCourse.data);
            } catch (error) {
                console.error('Failed to create course:', error);
                throw error;
            }
        }

        // 4. Generate Intakes
        const intakes = [];
        const intakeData = [
            {
                intakeName: "January 2024 Intake",
                intakeMonth: "January",
                registrationStartDate: "2024-01-01T00:00:00.000Z",
                registrationEndDate: "2024-01-31T23:59:59.000Z",
                orientationDate: "2024-02-01T00:00:00.000Z",
                examinationStartDate: "2024-06-01T00:00:00.000Z",
                examinationEndDate: "2024-06-15T23:59:59.000Z",
                academicEvents: [
                    {
                        name: "Orientation Day",
                        date: "2024-02-01T00:00:00.000Z",
                        type: "orientation",
                        description: "Student orientation program"
                    }
                ],
                isActive: true,
                status: "registration_open",
                schoolId: schoolId,
                completionDate: "2024-06-15T23:59:59.000Z"
            },
            {
                intakeName: "May 2024 Intake",
                intakeMonth: "May",
                registrationStartDate: "2024-05-01T00:00:00.000Z",
                registrationEndDate: "2024-05-31T23:59:59.000Z",
                orientationDate: "2024-06-01T00:00:00.000Z",
                examinationStartDate: "2024-10-01T00:00:00.000Z",
                examinationEndDate: "2024-10-15T23:59:59.000Z",
                academicEvents: [
                    {
                        name: "Orientation Day",
                        date: "2024-06-01T00:00:00.000Z",
                        type: "orientation",
                        description: "Student orientation program"
                    }
                ],
                isActive: true,
                status: "registration_open",
                schoolId: schoolId,
                completionDate: "2024-10-15T23:59:59.000Z"
            },
            {
                intakeName: "September 2024 Intake",
                intakeMonth: "September",
                registrationStartDate: "2024-09-01T00:00:00.000Z",
                registrationEndDate: "2024-09-30T23:59:59.000Z",
                orientationDate: "2024-10-01T00:00:00.000Z",
                examinationStartDate: "2025-02-01T00:00:00.000Z",
                examinationEndDate: "2025-02-15T23:59:59.000Z",
                academicEvents: [
                    {
                        name: "Orientation Day",
                        date: "2024-10-01T00:00:00.000Z",
                        type: "orientation",
                        description: "Student orientation program"
                    }
                ],
                isActive: true,
                status: "registration_open",
                schoolId: schoolId,
                completionDate: "2025-02-15T23:59:59.000Z"
            }
        ];

        // Create intakes and get their IDs
        for (const intakeDataItem of intakeData) {
            try {
                const createdIntake = await academicStore.createIntake(intakeDataItem);
                intakes.push(createdIntake.data);
            } catch (error) {
                console.error('Failed to create intake:', error);
                throw error;
            }
        }

        // 5. Generate Modules
        const modules = [];
        const moduleData = [
            {
                moduleName: "Database Systems",
                code: "CS301",
                totalCreditHours: 3,
                courseId: [courses[0]._id, courses[1]._id], // Shared between CS and IT
                prerequisites: [],
                moduleDescription: "Introduction to database design and management",
                learningOutcomes: [
                    "Understand database concepts",
                    "Design relational databases",
                    "Write SQL queries"
                ],
                assessmentMethods: ["exam", "assignment", "project"],
                isActive: true,
                schoolId: schoolId
            },
            {
                moduleName: "Web Development",
                code: "CS302",
                totalCreditHours: 3,
                courseId: [courses[0]._id], // CS only
                prerequisites: [],
                moduleDescription: "Learn to build modern web applications",
                learningOutcomes: [
                    "Understand web technologies",
                    "Build responsive websites",
                    "Deploy web apps"
                ],
                assessmentMethods: ["exam", "assignment"],
                isActive: true,
                schoolId: schoolId
            },
            {
                moduleName: "Software Engineering",
                code: "CS303",
                totalCreditHours: 3,
                courseId: [courses[0]._id], // CS only
                prerequisites: [],
                moduleDescription: "Principles of software engineering",
                learningOutcomes: [
                    "Understand SDLC",
                    "Apply design patterns",
                    "Work in teams"
                ],
                assessmentMethods: ["exam", "project"],
                isActive: true,
                schoolId: schoolId
            },
            {
                moduleName: "Computer Networks",
                code: "CS304",
                totalCreditHours: 3,
                courseId: [courses[0]._id, courses[1]._id], // Shared between CS and IT
                prerequisites: [],
                moduleDescription: "Fundamentals of computer networking",
                learningOutcomes: [
                    "Understand network protocols",
                    "Configure network devices",
                    "Troubleshoot network issues"
                ],
                assessmentMethods: ["exam", "assignment"],
                isActive: true,
                schoolId: schoolId
            },
            {
                moduleName: "IT Infrastructure",
                code: "IT301",
                totalCreditHours: 3,
                courseId: [courses[1]._id], // IT only
                prerequisites: [],
                moduleDescription: "IT infrastructure and system administration",
                learningOutcomes: [
                    "Manage IT infrastructure",
                    "Configure servers",
                    "Implement security measures"
                ],
                assessmentMethods: ["exam", "assignment"],
                isActive: true,
                schoolId: schoolId
            },
            {
                moduleName: "Cybersecurity",
                code: "IT302",
                totalCreditHours: 3,
                courseId: [courses[1]._id], // IT only
                prerequisites: [],
                moduleDescription: "Cybersecurity principles and practices",
                learningOutcomes: [
                    "Understand security threats",
                    "Implement security measures",
                    "Conduct security audits"
                ],
                assessmentMethods: ["exam", "project"],
                isActive: true,
                schoolId: schoolId
            },
            {
                moduleName: "Business Management",
                code: "BA301",
                totalCreditHours: 3,
                courseId: [courses[2]._id], // Business only
                prerequisites: [],
                moduleDescription: "Principles of business management",
                learningOutcomes: [
                    "Understand business concepts",
                    "Apply management principles",
                    "Analyze business cases"
                ],
                assessmentMethods: ["exam", "assignment"],
                isActive: true,
                schoolId: schoolId
            },
            {
                moduleName: "Mathematics for Computing",
                code: "MATH101",
                totalCreditHours: 3,
                courseId: [courses[0]._id, courses[1]._id], // Shared between CS and IT
                prerequisites: [],
                moduleDescription: "Foundation mathematics for computing students",
                learningOutcomes: [
                    "Solve mathematical problems",
                    "Apply mathematical concepts to computing",
                    "Develop logical thinking"
                ],
                assessmentMethods: ["exam", "assignment"],
                isActive: true,
                schoolId: schoolId
            },
            {
                moduleName: "Business Statistics",
                code: "STAT101",
                totalCreditHours: 3,
                courseId: [courses[2]._id], // Business only
                prerequisites: [],
                moduleDescription: "Statistical methods for business analysis",
                learningOutcomes: [
                    "Understand statistical concepts",
                    "Analyze business data",
                    "Make data-driven decisions"
                ],
                assessmentMethods: ["exam", "assignment"],
                isActive: true,
                schoolId: schoolId
            }
        ];

        // Create modules and get their IDs
        for (const moduleDataItem of moduleData) {
            try {
                const createdModule = await academicStore.createModule(moduleDataItem);
                modules.push(createdModule.data);
            } catch (error) {
                console.error('Failed to create module:', error);
                throw error;
            }
        }

        // 6. Generate Intake Courses
        const intakeCourses = [];
        const intakeCourseData = [
            {
                intakeId: intakes[0]._id,
                courseId: courses[0]._id,
                maxStudents: 50,
                currentEnrollment: 0,
                feeStructure: { localStudent: 25000, internationalStudent: 35000 },
                duration: 36,
                maxDuration: 48,
                requirements: ["SPM with 5 credits", "Mathematics"],
                isActive: true,
                status: "available",
                schoolId: schoolId
            },
            {
                intakeId: intakes[1]._id,
                courseId: courses[1]._id,
                maxStudents: 40,
                currentEnrollment: 0,
                feeStructure: { localStudent: 22000, internationalStudent: 32000 },
                duration: 36,
                maxDuration: 48,
                requirements: ["SPM with 5 credits", "English"],
                isActive: true,
                status: "available",
                schoolId: schoolId
            },
            {
                intakeId: intakes[2]._id,
                courseId: courses[2]._id,
                maxStudents: 45,
                currentEnrollment: 0,
                feeStructure: { localStudent: 24000, internationalStudent: 34000 },
                duration: 36,
                maxDuration: 48,
                requirements: ["SPM with 5 credits", "Mathematics"],
                isActive: true,
                status: "available",
                schoolId: schoolId
            }
        ];

        // Create intake courses and get their IDs
        for (const intakeCourseDataItem of intakeCourseData) {
            try {
                const createdIntakeCourse = await academicStore.createIntakeCourse(intakeCourseDataItem);
                intakeCourses.push(createdIntakeCourse.data);
            } catch (error) {
                console.error('Failed to create intake course:', error);
                throw error;
            }
        }

        // 7. Generate Semesters
        const semesters = [];

        // Generate semesters for each course
        for (let courseIndex = 0; courseIndex < courses.length; courseIndex++) {
            const course = courses[courseIndex];
            for (let year = 1; year <= course.totalYear; year++) {
                for (let semesterInYear = 1; semesterInYear <= 2; semesterInYear++) {
                    const semesterNumber = semesterInYear;
                    const baseYear = 2024;
                    const yearOffset = year - 1;
                    const isFirstSemester = semesterInYear === 1;

                    const startMonth = isFirstSemester ? 1 : 6;
                    const endMonth = isFirstSemester ? 5 : 10;

                    const startDate = new Date(baseYear + yearOffset, startMonth, 1);
                    const endDate = new Date(baseYear + yearOffset, endMonth, 30);
                    const regStartDate = new Date(baseYear + yearOffset, startMonth - 1, 15);
                    const regEndDate = new Date(baseYear + yearOffset, startMonth - 1, 28);
                    const examStartDate = new Date(baseYear + yearOffset, endMonth, 1);
                    const examEndDate = new Date(baseYear + yearOffset, endMonth, 15);

                    const semesterData = {
                        courseId: course._id,
                        semesterNumber: semesterNumber,
                        year: year,
                        semesterName: `Year ${year} Semester ${semesterNumber}`,
                        startDate: startDate.toISOString(),
                        endDate: endDate.toISOString(),
                        registrationStartDate: regStartDate.toISOString(),
                        registrationEndDate: regEndDate.toISOString(),
                        examStartDate: examStartDate.toISOString(),
                        examEndDate: examEndDate.toISOString(),
                        status: year === 1 && semesterInYear === 1 ? "in_progress" : "upcoming",
                        schoolId: schoolId
                    };

                    try {
                        const createdSemester = await academicStore.createSemester(semesterData);
                        semesters.push(createdSemester.data);
                    } catch (error) {
                        console.error('Failed to create semester:', error);
                        throw error;
                    }
                }
            }
        }

        // 8. Generate Lecturers
        const lecturers = [];
        const lecturerUsers = []; // Array to store user documents for lecturers

        for (let i = 0; i < lecturerCount; i++) {
            const departmentIndex = i % departments.length;

            // Create user document for this lecturer
            const lecturerUserData = {
                name: `${schoolPrefix} Dr. ${generateNames()}`,
                email: `lecturer${i + 1}@${schoolPrefix.toLowerCase()}.edu.my`,
                password: "password123",
                phoneNumber: generatePhoneNumber(60123456790 + i),
                role: "lecturer",
                twoFA_enabled: false,
                schoolId: schoolId
            };

            try {
                // Create user first
                const createdUser = await userStore.createUserWithoutJWT(lecturerUserData);
                lecturerUsers.push(createdUser.data);

                // Create lecturer with the user ID
                const lecturerData = {
                    userId: createdUser.data._id,
                    title: ["Dr.", "Associate Professor"],
                    departmentId: departments[departmentIndex]._id,
                    moduleIds: [],
                    specialization: ["Computer Science", "Information Technology", "Business Administration"],
                    qualification: "PhD",
                    experience: Math.floor(Math.random() * 10) + 3,
                    isActive: true,
                    officeHours: [
                        { day: "Monday", startTime: "10:00", endTime: "12:00" }
                    ],
                    schoolId: schoolId
                };

                const createdLecturer = await academicStore.createLecturer(lecturerData);
                lecturers.push(createdLecturer.data);
            } catch (error) {
                console.error('Failed to create lecturer:', error);
                throw error;
            }
        }

        // 9. Generate Students
        const students = [];
        const studentUsers = []; // Array to store user documents for students

        for (let i = 0; i < studentCount; i++) {
            // Ensure each student gets assigned to a valid intake course with matching courseId
            const intakeCourseIndex = i % intakeCourses.length;
            const currentYear = (i % 4) + 1;
            const currentSemester = (i % 3) + 1;
            const statuses = ['enrolled', 'in_progress', 'graduated', 'dropped', 'suspended'];
            const standings = ['good', 'warning', 'probation', 'suspended'];

            // Create user document for this student
            const studentUserData = {
                name: `${schoolPrefix} Student_${i + 1}`,
                email: `student${i + 1}@student.${schoolPrefix.toLowerCase()}.edu.my`,
                password: "password123",
                phoneNumber: generatePhoneNumber(60123456800 + i),
                role: "student",
                twoFA_enabled: false,
                schoolId: schoolId
            };

            try {
                // Create user first
                const createdUser = await userStore.createUserWithoutJWT(studentUserData);

                studentUsers.push(createdUser.data);

                // Create student with the user ID
                const studentData = {
                    userId: createdUser.data._id,
                    schoolId: schoolId,
                    intakeCourseId: intakeCourses[intakeCourseIndex]._id,
                    currentYear: currentYear,
                    currentSemester: currentSemester,
                    cgpa: (Math.random() * 2) + 2, // 2.0 to 4.0
                    status: statuses[i % statuses.length],
                    totalCreditHours: currentYear * 20,
                    completedCreditHours: Math.floor(currentYear * 20 * 0.8),
                    academicStanding: standings[i % standings.length]
                };

                const createdStudent = await academicStore.createStudent(studentData);
                students.push(createdStudent.data);

                // Debug: Log the relationship for verification
                // console.log(`🔗 Student ${i + 1} assigned to intake course ${intakeCourseIndex + 1} with courseId: ${intakeCourses[intakeCourseIndex].courseId}`);
            } catch (error) {
                console.error('Failed to create student:', error);
                throw error;
            }
        }

        // 10. Generate Class Schedules
        const classSchedules = [];

        for (let i = 0; i < Math.min(modules.length, 8); i++) {
            const module = modules[i];
            const lecturer = lecturers[i % lecturers.length];
            const room = rooms[i % rooms.length];
            const intakeCourse = intakeCourses[i % intakeCourses.length];
            const semester = semesters[i % semesters.length];

            const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
            const dayOfWeek = days[i % days.length];
            const startTime = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"][i % 6];
            const endTime = ["12:00", "13:00", "14:00", "16:00", "17:00", "18:00"][i % 6];

            const classScheduleData = {
                roomId: room._id,
                moduleId: module._id,
                lecturerId: lecturer._id,
                dayOfWeek: dayOfWeek,
                startTime: startTime,
                endTime: endTime,
                intakeCourseId: intakeCourse._id,
                semesterId: semester._id,
                schoolId: schoolId,
                moduleStartDate: semester.startDate,
                moduleEndDate: semester.endDate
            };

            try {
                const createdClassSchedule = await academicStore.createClassSchedule(classScheduleData);
                classSchedules.push(createdClassSchedule.data);
            } catch (error) {
                console.error('Failed to create class schedule:', error);
                throw error;
            }
        }

        // 11. Generate Exam Schedules
        const examSchedules = [];

        for (let i = 0; i < Math.min(modules.length, 5); i++) {
            const module = modules[i];
            const intakeCourse = intakeCourses[i % intakeCourses.length];
            const semester = semesters[i % semesters.length];
            const room = rooms[i % rooms.length];
            const lecturer = lecturers[i % lecturers.length];

            const examDate = new Date();
            examDate.setDate(examDate.getDate() + (i + 1) * 7); // Spread exams over weeks

            const examScheduleData = {
                intakeCourseId: intakeCourse._id,
                courseId: intakeCourse.courseId,
                moduleId: module._id,
                examDate: examDate.toISOString().split('T')[0],
                examTime: ["09:00", "14:00"][i % 2],
                semesterId: semester._id,
                roomId: room._id,
                invigilators: [lecturer._id],
                durationMinute: 120,
                schoolId: schoolId
            };

            try {
                const createdExamSchedule = await academicStore.createExamSchedule(examScheduleData);
                examSchedules.push(createdExamSchedule.data);
            } catch (error) {
                console.error('Failed to create exam schedule:', error);
                throw error;
            }
        }

        // 12. Generate Attendance Records
        const attendance = [];

        students.forEach(async (student, studentIndex) => {
            const classSchedule = classSchedules[studentIndex % classSchedules.length];
            const attendanceStatuses = ["present", "absent", "late"];

            for (let k = 0; k < 3; k++) { // 3 records per student
                const attendanceDate = new Date();
                attendanceDate.setDate(attendanceDate.getDate() - (k + 1) * 2);

                const attendanceData = {
                    studentId: student._id,
                    scheduleId: classSchedule._id,
                    status: attendanceStatuses[(studentIndex + k) % attendanceStatuses.length],
                    date: attendanceDate.toISOString(),
                    schoolId: schoolId
                };

                try {
                    const createdAttendance = await academicStore.createAttendance(attendanceData);
                    attendance.push(createdAttendance.data);
                } catch (error) {
                    console.error('Failed to create attendance:', error);
                    throw error;
                }
            }
        });

        // 13. Generate Results
        const results = [];

        // Generate results for each student based on their enrolled modules
        // Count total students that should have modules
        let totalStudentsWithModules = 0;
        let totalStudentsWithoutModules = 0;

        for (let studentIndex = 0; studentIndex < students.length; studentIndex++) {
            const student = students[studentIndex];

            // Find the student's intake course
            const studentIntakeCourse = intakeCourses.find(ic => ic._id === student.intakeCourseId);
            if (!studentIntakeCourse) {
                totalStudentsWithoutModules++;
                continue;
            }

            // Find modules for the student's course
            const studentModules = modules.filter(module => {
                // Handle courseId as array since modules can belong to multiple courses
                if (Array.isArray(module.courseId)) {
                    return module.courseId.includes(studentIntakeCourse.courseId);
                } else {
                    // Fallback for single courseId (if model was changed)
                    return module.courseId === studentIntakeCourse.courseId;
                }
            });

            // Find semesters for the student's course
            const studentSemesters = semesters.filter(semester =>
                semester.courseId === studentIntakeCourse.courseId
            );

            if (studentModules.length === 0) {
                totalStudentsWithoutModules++;
                continue;
            }

            if (studentSemesters.length === 0) {
                totalStudentsWithoutModules++;
                continue;
            }

            // Student has modules and semesters, increment counter
            totalStudentsWithModules++;

            // Generate results for each module the student should have taken
            const maxModules = Math.min(studentModules.length, 4);

            for (let moduleIndex = 0; moduleIndex < maxModules; moduleIndex++) {
                const module = studentModules[moduleIndex];
                const semester = studentSemesters[moduleIndex % studentSemesters.length];

                // Generate realistic grades based on student performance
                const grades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];
                const gradeToGPA = {
                    "A+": 4.0, "A": 4.0, "A-": 3.7,
                    "B+": 3.3, "B": 3.0, "B-": 2.7,
                    "C+": 2.3, "C": 2.0, "C-": 1.7,
                    "D": 1.0, "F": 0.0
                };

                // Select grade based on student's CGPA and some randomness
                let selectedGrade;
                if (student.cgpa >= 3.5) {
                    // High performing students mostly get A's and B's
                    selectedGrade = grades[Math.floor(Math.random() * 6)]; // A+ to B-
                } else if (student.cgpa >= 2.5) {
                    // Average students mostly get B's and C's
                    selectedGrade = grades[Math.floor(Math.random() * 6) + 3]; // B+ to C-
                } else {
                    // Lower performing students mostly get C's, D's, and F's
                    selectedGrade = grades[Math.floor(Math.random() * 5) + 6]; // C+ to F
                }

                const totalMarks = 100;
                let marks;

                // Generate marks based on grade
                if (selectedGrade === 'F') {
                    marks = Math.floor(Math.random() * 40); // 0-39
                } else if (selectedGrade.startsWith('A')) {
                    marks = Math.floor(Math.random() * 20) + 80; // 80-99
                } else if (selectedGrade.startsWith('B')) {
                    marks = Math.floor(Math.random() * 20) + 60; // 60-79
                } else if (selectedGrade.startsWith('C')) {
                    marks = Math.floor(Math.random() * 20) + 40; // 40-59
                } else {
                    marks = Math.floor(Math.random() * 20) + 20; // 20-39
                }

                const resultData = {
                    studentId: student._id,
                    moduleId: module._id,
                    semesterId: semester._id,
                    grade: selectedGrade,
                    creditHours: module.totalCreditHours,
                    marks: marks,
                    totalMarks: totalMarks,
                    gpa: gradeToGPA[selectedGrade],
                    remark: `Performance in ${module.moduleName} - Score: ${marks}/${totalMarks}`,
                    schoolId: schoolId
                };

                try {
                    const createdResult = await academicStore.createResult(resultData);
                    results.push(createdResult.data);
                } catch (error) {
                    console.error(`Failed to create result for ${module.moduleName}:`, error);
                    throw error;
                }
            }
        }

        // 14. Generate Facility Resources
        const resources = [];
        const resourceData = [
            {
                schoolId: schoolId,
                name: "Main Library",
                location: "Block D",
                type: "study_room",
                capacity: 50,
                status: true,
                timeslots: [
                    {
                        dayOfWeek: "Monday",
                        slots: [
                            { start: "08:00", end: "10:00" },
                            { start: "10:00", end: "12:00" },
                            { start: "14:00", end: "16:00" }
                        ]
                    }
                ]
            },
            {
                schoolId: schoolId,
                name: "Computer Lab A",
                location: "Block C",
                type: "study_room",
                capacity: 30,
                status: true,
                timeslots: [
                    {
                        dayOfWeek: "Monday",
                        slots: [
                            { start: "09:00", end: "11:00" },
                            { start: "14:00", end: "16:00" }
                        ]
                    }
                ]
            },
            {
                schoolId: schoolId,
                name: "Basketball Court",
                location: "Sports Complex",
                type: "court",
                capacity: 20,
                status: true,
                timeslots: [
                    {
                        dayOfWeek: "Monday",
                        slots: [
                            { start: "16:00", end: "18:00" }
                        ]
                    }
                ]
            },
            // Locker resources
            {
                schoolId: schoolId,
                name: "Library Locker 1",
                location: "Main Library",
                type: "locker",
                capacity: 1,
                status: true,
                timeslots: [
                    {
                        dayOfWeek: "Monday",
                        slots: [
                            { start: "08:00", end: "18:00" }
                        ]
                    }
                ]
            },
            {
                schoolId: schoolId,
                name: "Library Locker 2",
                location: "Main Library",
                type: "locker",
                capacity: 1,
                status: true,
                timeslots: [
                    {
                        dayOfWeek: "Monday",
                        slots: [
                            { start: "08:00", end: "18:00" }
                        ]
                    }
                ]
            },
            {
                schoolId: schoolId,
                name: "Library Locker 3",
                location: "Main Library",
                type: "locker",
                capacity: 1,
                status: false,
                timeslots: [
                    {
                        dayOfWeek: "Monday",
                        slots: [
                            { start: "08:00", end: "18:00" }
                        ]
                    }
                ]
            },
            {
                schoolId: schoolId,
                name: "Computer Lab Locker 1",
                location: "Computer Lab A",
                type: "locker",
                capacity: 1,
                status: true,
                timeslots: [
                    {
                        dayOfWeek: "Monday",
                        slots: [
                            { start: "09:00", end: "17:00" }
                        ]
                    }
                ]
            },
            {
                schoolId: schoolId,
                name: "Computer Lab Locker 2",
                location: "Computer Lab A",
                type: "locker",
                capacity: 1,
                status: true,
                timeslots: [
                    {
                        dayOfWeek: "Monday",
                        slots: [
                            { start: "09:00", end: "17:00" }
                        ]
                    }
                ]
            },
            {
                schoolId: schoolId,
                name: "Computer Lab Locker 3",
                location: "Computer Lab A",
                type: "locker",
                capacity: 1,
                status: true,
                timeslots: [
                    {
                        dayOfWeek: "Monday",
                        slots: [
                            { start: "09:00", end: "17:00" }
                        ]
                    }
                ]
            },
            {
                schoolId: schoolId,
                name: "Sports Complex Locker 1",
                location: "Sports Complex",
                type: "locker",
                capacity: 1,
                status: true,
                timeslots: [
                    {
                        dayOfWeek: "Monday",
                        slots: [
                            { start: "16:00", end: "20:00" }
                        ]
                    }
                ]
            },
            {
                schoolId: schoolId,
                name: "Sports Complex Locker 2",
                location: "Sports Complex",
                type: "locker",
                capacity: 1,
                status: true,
                timeslots: [
                    {
                        dayOfWeek: "Monday",
                        slots: [
                            { start: "16:00", end: "20:00" }
                        ]
                    }
                ]
            }
        ];

        // Create resources and get their IDs
        const facilityStore = useFacilityStore.getState();
        for (const resourceDataItem of resourceData) {
            try {
                const createdResource = await facilityStore.createResource(resourceDataItem);
                resources.push(createdResource.data);
            } catch (error) {
                console.error('Failed to create resource:', error);
                throw error;
            }
        }

        // 14.5. Generate Locker Units from locker resources
        const lockerUnits = [];
        const lockerResources = resources.filter(resource => resource.type === 'locker');

        for (const lockerResource of lockerResources) {
            const lockerUnitData = {
                name: lockerResource.name,
                resourceId: lockerResource._id,
                schoolId: schoolId,
                status: lockerResource.status ? 'Available' : 'Maintenance',
                isAvailable: lockerResource.status
            };

            try {
                const createdLockerUnit = await facilityStore.createLockerUnit(lockerUnitData);
                lockerUnits.push(createdLockerUnit.data);
            } catch (error) {
                console.error('Failed to create locker unit:', error);
                throw error;
            }
        }

        // 14.6. Generate Parking Lots
        const parkingLots = [];
        const parkingData = [
            {
                schoolId: schoolId,
                zone: "Zone A",
                slotNumber: 1,
                active: true
            },
            {
                schoolId: schoolId,
                zone: "Zone A",
                slotNumber: 2,
                active: true
            },
            {
                schoolId: schoolId,
                zone: "Zone A",
                slotNumber: 3,
                active: true
            },
            {
                schoolId: schoolId,
                zone: "Zone A",
                slotNumber: 4,
                active: false
            },
            {
                schoolId: schoolId,
                zone: "Zone B",
                slotNumber: 1,
                active: true
            },
            {
                schoolId: schoolId,
                zone: "Zone B",
                slotNumber: 2,
                active: true
            },
            {
                schoolId: schoolId,
                zone: "Zone B",
                slotNumber: 3,
                active: true
            },
            {
                schoolId: schoolId,
                zone: "Zone C",
                slotNumber: 1,
                active: true
            },
            {
                schoolId: schoolId,
                zone: "Zone C",
                slotNumber: 2,
                active: true
            },
            {
                schoolId: schoolId,
                zone: "Zone C",
                slotNumber: 3,
                active: true
            },
            {
                schoolId: schoolId,
                zone: "Zone C",
                slotNumber: 4,
                active: true
            },
            {
                schoolId: schoolId,
                zone: "Zone C",
                slotNumber: 5,
                active: true
            }
        ];

        // Create parking lots and get their IDs
        for (const parkingDataItem of parkingData) {
            try {
                const createdParkingLot = await facilityStore.createParkingLot(parkingDataItem);
                parkingLots.push(createdParkingLot.data);
            } catch (error) {
                console.error('Failed to create parking lot:', error);
                throw error;
            }
        }

        // 15. Generate Bookings
        const bookings = [];

        students.forEach(async (student, studentIndex) => {
            if (studentIndex < 10) { // Limit to 10 bookings
                const resource = resources[studentIndex % resources.length];
                const statuses = ["confirmed", "pending", "completed"];

                const bookingData = {
                    studentId: student._id,
                    resourceId: resource._id,
                    schoolId: schoolId,
                    bookingDate: new Date().toISOString(),
                    startTime: "09:00",
                    endTime: "11:00",
                    status: statuses[studentIndex % statuses.length]
                };

                try {
                    const createdBooking = await facilityStore.createBooking(bookingData);
                    bookings.push(createdBooking.data);
                } catch (error) {
                    console.error('Failed to create booking:', error);
                    throw error;
                }
            }
        });

        // 16. Generate Feedback
        const feedbacks = [];

        students.forEach(async (student, studentIndex) => {
            if (studentIndex < 8) { // Limit to 8 feedback entries
                const feedbackTypes = ["complaint", "compliment", "suggestion", "query", "issue"];
                const priorities = ["Low", "Medium", "High", "Urgent"];
                const statuses = ["open", "in_progress", "resolved", "sent"];

                const feedbackData = {
                    studentId: student._id,
                    schoolId: schoolId,
                    feedbackType: feedbackTypes[studentIndex % feedbackTypes.length],
                    priority: priorities[studentIndex % priorities.length],
                    message: `Sample feedback message ${studentIndex + 1} from student`,
                    status: statuses[studentIndex % statuses.length]
                };

                try {
                    const serviceStore = useServiceStore.getState();
                    const createdFeedback = await serviceStore.createFeedback(feedbackData);
                    feedbacks.push(createdFeedback.data);
                } catch (error) {
                    console.error('Failed to create feedback:', error);
                    throw error;
                }
            }
        });

        // 17. Generate Lost Items
        const lostItems = [];

        students.forEach(async (student, studentIndex) => {
            if (studentIndex < 5) { // Limit to 5 lost items
                const statuses = ["reported", "found", "claimed"];

                const lostItemData = {
                    personId: student._id,
                    schoolId: schoolId,
                    itemDetails: {
                        name: "Sample Item",
                        description: `Lost item description ${studentIndex + 1}`,
                        location: "cafeteria",
                        lostDate: new Date().toISOString()
                    },
                    status: statuses[studentIndex % statuses.length]
                };

                try {
                    const serviceStore = useServiceStore.getState();
                    const createdLostItem = await serviceStore.createLostItem(lostItemData);
                    lostItems.push(createdLostItem.data);
                } catch (error) {
                    console.error('Failed to create lost item:', error);
                    throw error;
                }
            }
        });

        // 18. Generate Transportation Data
        const transportationStore = useTransportationStore.getState();

        // Generate Stops (Stations)
        const stops = [];
        const stopData = [
            {
                name: "Main Campus Station",
                type: "campus",
                schoolId: schoolId
            },
            {
                name: "Student Dormitory A",
                type: "dorm",
                schoolId: schoolId
            },
            {
                name: "Student Dormitory B",
                type: "dorm",
                schoolId: schoolId
            },
            {
                name: "Shopping Mall Station",
                type: "bus_station",
                schoolId: schoolId
            },
            {
                name: "City Center Station",
                type: "bus_station",
                schoolId: schoolId
            },
            {
                name: "Sports Complex Station",
                type: "campus",
                schoolId: schoolId
            }
        ];

        // Create stops and get their IDs
        for (const stopDataItem of stopData) {
            try {
                const createdStop = await transportationStore.createStop(stopDataItem);
                stops.push(createdStop.data);
            } catch (error) {
                console.error('Failed to create stop:', error);
                throw error;
            }
        }

        // Generate Vehicles (Parent class for bus and car)
        const vehicles = [];
        const vehicleData = [
            {
                plateNumber: `${schoolPrefix}001A`,
                type: "bus",
                capacity: 50,
                status: "available",
                schoolId: schoolId
            },
            {
                plateNumber: `${schoolPrefix}002A`,
                type: "bus",
                capacity: 45,
                status: "available",
                schoolId: schoolId
            },
            {
                plateNumber: `${schoolPrefix}003A`,
                type: "car",
                capacity: 4,
                status: "available",
                schoolId: schoolId
            },
            {
                plateNumber: `${schoolPrefix}004A`,
                type: "car",
                capacity: 4,
                status: "available",
                schoolId: schoolId
            },
            {
                plateNumber: `${schoolPrefix}005A`,
                type: "car",
                capacity: 4,
                status: "in_service",
                schoolId: schoolId
            }
        ];

        // Create vehicles and get their IDs
        for (const vehicleDataItem of vehicleData) {
            try {
                const createdVehicle = await transportationStore.createVehicle(vehicleDataItem);
                vehicles.push(createdVehicle.data);
            } catch (error) {
                console.error('Failed to create vehicle:', error);
                throw error;
            }
        }

        // Generate Routes (containing two stops each)
        const routes = [];
        const routeData = [
            {
                name: "Campus to Dormitory A",
                stopIds: [stops[0]._id, stops[1]._id], // Main Campus to Dorm A
                estimateTimeMinute: 15,
                fare: 2.00,
                schoolId: schoolId
            },
            {
                name: "Campus to Dormitory B",
                stopIds: [stops[0]._id, stops[2]._id], // Main Campus to Dorm B
                estimateTimeMinute: 20,
                fare: 2.50,
                schoolId: schoolId
            },
            {
                name: "Campus to Shopping Mall",
                stopIds: [stops[0]._id, stops[3]._id], // Main Campus to Shopping Mall
                estimateTimeMinute: 25,
                fare: 3.00,
                schoolId: schoolId
            },
            {
                name: "Campus to City Center",
                stopIds: [stops[0]._id, stops[4]._id], // Main Campus to City Center
                estimateTimeMinute: 35,
                fare: 4.00,
                schoolId: schoolId
            },
            {
                name: "Campus to Sports Complex",
                stopIds: [stops[0]._id, stops[5]._id], // Main Campus to Sports Complex
                estimateTimeMinute: 10,
                fare: 1.50,
                schoolId: schoolId
            }
        ];

        // Create routes and get their IDs
        for (const routeDataItem of routeData) {
            try {
                const createdRoute = await transportationStore.createRoute(routeDataItem);
                routes.push(createdRoute.data);
            } catch (error) {
                console.error('Failed to create route:', error);
                throw error;
            }
        }

        // Generate Bus Schedules (recurring schedules utilizing routes)
        const busSchedules = [];
        const busScheduleData = [
            {
                routeTiming: [
                    {
                        routeId: routes[0]._id, // Campus to Dormitory A
                        startTime: "07:00",
                        endTime: "07:15"
                    },
                    {
                        routeId: routes[0]._id,
                        startTime: "17:00",
                        endTime: "17:15"
                    }
                ],
                vehicleId: vehicles[0]._id, // Bus 1
                dayOfWeek: 1, // Monday
                startDate: new Date(2024, 0, 1), // January 1, 2024
                endDate: new Date(2024, 11, 31), // December 31, 2024
                active: true,
                schoolId: schoolId
            },
            {
                routeTiming: [
                    {
                        routeId: routes[1]._id, // Campus to Dormitory B
                        startTime: "07:30",
                        endTime: "07:50"
                    },
                    {
                        routeId: routes[1]._id,
                        startTime: "17:30",
                        endTime: "17:50"
                    }
                ],
                vehicleId: vehicles[1]._id, // Bus 2
                dayOfWeek: 1, // Monday
                startDate: new Date(2024, 0, 1),
                endDate: new Date(2024, 11, 31),
                active: true,
                schoolId: schoolId
            },
            {
                routeTiming: [
                    {
                        routeId: routes[2]._id, // Campus to Shopping Mall
                        startTime: "12:00",
                        endTime: "12:25"
                    },
                    {
                        routeId: routes[2]._id,
                        startTime: "18:00",
                        endTime: "18:25"
                    }
                ],
                vehicleId: vehicles[0]._id, // Bus 1
                dayOfWeek: 2, // Tuesday
                startDate: new Date(2024, 0, 1),
                endDate: new Date(2024, 11, 31),
                active: true,
                schoolId: schoolId
            }
        ];

        // Create bus schedules and get their IDs
        for (const scheduleDataItem of busScheduleData) {
            try {
                const createdBusSchedule = await transportationStore.createBusSchedule(scheduleDataItem);
                busSchedules.push(createdBusSchedule.data);
            } catch (error) {
                console.error('Failed to create bus schedule:', error);
                throw error;
            }
        }

        // Generate E-Hailing (ordered by students)
        const eHailings = [];

        students.forEach(async (student, studentIndex) => {
            if (studentIndex < 8) { // Limit to 8 e-hailing requests
                const route = routes[studentIndex % routes.length];
                const vehicle = vehicles.filter(v => v.type === "car")[studentIndex % 3]; // Use cars for e-hailing
                const statuses = ["waiting", "in_progress", "completed", "cancelled"];
                const status = statuses[studentIndex % statuses.length];

                const eHailingData = {
                    studentId: student._id,
                    routeId: route._id,
                    status: status,
                    requestAt: new Date(),
                    vehicleId: vehicle ? vehicle._id : null,
                    schoolId: schoolId
                };

                try {
                    const createdEHailing = await transportationStore.createEHailing(eHailingData);
                    eHailings.push(createdEHailing.data);
                } catch (error) {
                    console.error('Failed to create e-hailing:', error);
                    throw error;
                }
            }
        });

        return {
            rooms,
            departments,
            courses,
            intakes,
            intakeCourses,
            modules,
            semesters,
            lecturers,
            students,
            classSchedules,
            examSchedules,
            attendance,
            results,
            resources,
            parkingLots,
            bookings,
            feedbacks,
            lostItems,
            lecturerUsers,
            studentUsers,
            // Transportation data
            stops,
            vehicles,
            routes,
            busSchedules,
            eHailings,
            // Facility data
            lockerUnits
        };
    } catch (error) {
        console.error('Error generating academic data:', error);
        throw error;
    }
};

// Generate summary statistics
export const generateAcademicSummary = (academicData) => {
    return {
        totalRooms: academicData.rooms.length,
        totalDepartments: academicData.departments.length,
        totalCourses: academicData.courses.length,
        totalIntakes: academicData.intakes.length,
        totalModules: academicData.modules.length,
        totalSemesters: academicData.semesters.length,
        totalLecturers: academicData.lecturers.length,
        totalStudents: academicData.students.length,
        totalClassSchedules: academicData.classSchedules.length,
        totalExamSchedules: academicData.examSchedules.length,
        totalAttendanceRecords: academicData.attendance.length,
        totalResults: academicData.results.length,
        totalResources: academicData.resources.length,
        totalParkingLots: academicData.parkingLots?.length || 0,
        totalBookings: academicData.bookings.length,
        totalFeedbacks: academicData.feedbacks.length,
        totalLostItems: academicData.lostItems.length,
        totalLecturerUsers: academicData.lecturerUsers?.length || 0,
        totalStudentUsers: academicData.studentUsers?.length || 0,
        // Transportation statistics
        totalStops: academicData.stops?.length || 0,
        totalVehicles: academicData.vehicles?.length || 0,
        totalRoutes: academicData.routes?.length || 0,
        totalBusSchedules: academicData.busSchedules?.length || 0,
        totalEHailings: academicData.eHailings?.length || 0,
        // Facility statistics
        totalLockerUnits: academicData.lockerUnits?.length || 0
    };
};
