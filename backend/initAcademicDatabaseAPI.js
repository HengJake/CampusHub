import dotenv from 'dotenv';

dotenv.config();

// Helper function to make API calls
const apiCall = async (method, endpoint, data = null) => {
    const url = `http://localhost:5000${endpoint}`;
    try {
        let response;
        if (method === "GET") {
            response = await fetch(url, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
        } else if (method === "DELETE") {
            response = await fetch(url, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });
        } else {
            response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        }
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error(`❌ API Error (${method} ${endpoint}):`, error.message);
        throw error;
    }
};

// Clear existing data (optional)
const clearDatabase = async () => {
    console.log('🗑️  Clearing existing Academic data...');
    try {
        await apiCall('DELETE', '/api/result/all');
        await apiCall('DELETE', '/api/attendance/all');
        await apiCall('DELETE', '/api/student/all');
        await apiCall('DELETE', '/api/exam-schedule/all');
        await apiCall('DELETE', '/api/class-schedule/all');
        await apiCall('DELETE', '/api/intake-course/all');
        await apiCall('DELETE', '/api/module/all');
        await apiCall('DELETE', '/api/lecturer/all');
        await apiCall('DELETE', '/api/intake/all');
        await apiCall('DELETE', '/api/course/all');
        await apiCall('DELETE', '/api/department/all');
        await apiCall('DELETE', '/api/room/all');
        await apiCall('DELETE', '/api/school/all');
        await apiCall('DELETE', '/api/user/all');
        console.log('✅ All Academic data cleared successfully');
    } catch (error) {
        console.error('❌ Error clearing database:', error.message);
    }
};

// Helper function to create all data for a school
async function createSchoolData({
    schoolName,
    schoolEmailDomain,
    schoolAddress,
    schoolCity,
    schoolCountry,
    adminPhoneBase,
    lecturerPhoneBase,
    studentPhoneBase,
    schoolPrefix
}) {
    const createdIds = {
        school: null,
        users: {},
        rooms: {},
        departments: [],
        courses: [],
        intakes: [],
        lecturers: [],
        modules: [],
        intakeCourses: [],
        classSchedules: [],
        examSchedules: [],
        students: [],
        attendance: [],
        results: []
    };

    console.log(`\n==============================`);
    console.log(`🚀 Starting data creation for: ${schoolName}`);
    console.log(`==============================`);

    // 1. Create Users (Admins, Lecturers, Students)
    console.log(`[${schoolPrefix}] 1. Creating Users...`);
    const usersData = [
        // Admins
        {
            name: `${schoolPrefix} Admin User`,
            email: `admin@${schoolEmailDomain}`,
            password: "password123",
            phoneNumber: adminPhoneBase + 0,
            role: "schoolAdmin",
            twoFA_enabled: false
        },
        {
            name: `${schoolPrefix} Second Admin`,
            email: `admin2@${schoolEmailDomain}`,
            password: "password123",
            phoneNumber: adminPhoneBase + 1,
            role: "schoolAdmin",
            twoFA_enabled: false
        },
        // Lecturers
        {
            name: `${schoolPrefix} Dr. John Smith`,
            email: `john.smith@${schoolEmailDomain}`,
            password: "password123",
            phoneNumber: lecturerPhoneBase + 0,
            role: "lecturer",
            twoFA_enabled: false
        },
        {
            name: `${schoolPrefix} Dr. Jane Lee`,
            email: `jane.lee@${schoolEmailDomain}`,
            password: "password123",
            phoneNumber: lecturerPhoneBase + 1,
            role: "lecturer",
            twoFA_enabled: false
        },
        {
            name: `${schoolPrefix} Dr. Alan Turing`,
            email: `alan.turing@${schoolEmailDomain}`,
            password: "password123",
            phoneNumber: lecturerPhoneBase + 2,
            role: "lecturer",
            twoFA_enabled: false
        }
    ];

    for (let i = 0; i < usersData.length; i++) {
        const userResponse = await apiCall('POST', '/api/user', usersData[i]);
        const role = usersData[i].role;
        if (!createdIds.users[role]) createdIds.users[role] = [];
        createdIds.users[role].push(userResponse.data._id);
        console.log(`[${schoolPrefix}] ✅ ${role} user created: ${usersData[i].name} (${userResponse.data._id})`);
        await new Promise(res => setTimeout(res, 150)); // 150ms delay
    }

    // 2. Create School
    console.log(`[${schoolPrefix}] 2. Creating School...`);
    const schoolData = {
        userId: createdIds.users.schoolAdmin[0],
        name: schoolName,
        address: schoolAddress,
        city: schoolCity,
        country: schoolCountry,
        status: "Active"
    };
    const schoolResponse = await apiCall('POST', '/api/school', schoolData);
    createdIds.school = schoolResponse.data._id;
    console.log(`[${schoolPrefix}] ✅ School created: ${schoolName} (${createdIds.school})`);

    // 3. Create Rooms
    console.log(`[${schoolPrefix}] 3. Creating Rooms...`);
    const roomsData = [
        {
            block: "Block A",
            floor: "Ground Floor",
            roomNumber: 101,
            roomStatus: "available",
            type: "office",
            capacity: 10,
            facilities: ["air_conditioning", "whiteboard"],
            isActive: true,
            schoolId: createdIds.school
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
            schoolId: createdIds.school
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
            schoolId: createdIds.school
        }
    ];
    for (let i = 0; i < roomsData.length; i++) {
        const roomResponse = await apiCall('POST', '/api/room', roomsData[i]);
        const roomType = roomsData[i].type;
        createdIds.rooms[roomType] = roomResponse.data._id;
        console.log(`[${schoolPrefix}] ✅ Room created: ${roomType} (${roomResponse.data._id})`);
    }

    // 4. Create Departments
    console.log(`[${schoolPrefix}] 4. Creating Departments...`);
    const departmentsData = [
        {
            departmentName: "Computer Science",
            departmentDescription: "Department of Computer Science and Information Technology",
            roomId: createdIds.rooms.office,
            isActive: true,
            contactEmail: `cs@${schoolEmailDomain}`,
            contactPhone: "03-12345678",
            schoolId: createdIds.school
        },
        {
            departmentName: "Information Technology",
            departmentDescription: "Department of IT",
            roomId: createdIds.rooms.office,
            isActive: true,
            contactEmail: `it@${schoolEmailDomain}`,
            contactPhone: "03-87654321",
            schoolId: createdIds.school
        }
    ];
    for (let i = 0; i < departmentsData.length; i++) {
        const departmentResponse = await apiCall('POST', '/api/department', departmentsData[i]);
        createdIds.departments.push(departmentResponse.data._id);
        console.log(`[${schoolPrefix}] ✅ Department created: ${departmentsData[i].departmentName} (${departmentResponse.data._id})`);
    }

    // 5. Create Courses
    console.log(`[${schoolPrefix}] 5. Creating Courses...`);
    const coursesData = [
        {
            courseName: "Bachelor of Computer Science (Hons)",
            courseCode: "BCS",
            courseDescription: "A comprehensive program covering software development, database systems, and web technologies",
            courseLevel: "Bachelor",
            courseType: "Full Time",
            totalCreditHours: 120,
            minimumCGPA: 2.0,
            departmentId: createdIds.departments[0],
            duration: 36,
            entryRequirements: ["SPM with 5 credits", "Mathematics"],
            careerProspects: ["Software Developer", "System Analyst", "Database Administrator"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            courseName: "Bachelor of Information Technology (Hons)",
            courseCode: "BIT",
            courseDescription: "Covers IT infrastructure, networking, and security",
            courseLevel: "Bachelor",
            courseType: "Full Time",
            totalCreditHours: 120,
            minimumCGPA: 2.0,
            departmentId: createdIds.departments[1],
            duration: 36,
            entryRequirements: ["SPM with 5 credits", "English"],
            careerProspects: ["IT Consultant", "Network Engineer", "Security Analyst"],
            isActive: true,
            schoolId: createdIds.school
        }
    ];
    for (let i = 0; i < coursesData.length; i++) {
        const courseResponse = await apiCall('POST', '/api/course', coursesData[i]);
        createdIds.courses.push(courseResponse.data._id);
        console.log(`[${schoolPrefix}] ✅ Course created: ${coursesData[i].courseName} (${courseResponse.data._id})`);
    }

    // 6. Create Intakes
    console.log(`[${schoolPrefix}] 6. Creating Intakes...`);
    const intakesData = [
        {
            intakeName: "January 2024 Intake",
            intakeMonth: "January",
            totalYear: 4, // Added for schema compliance
            totalSemester: 8, // Added for schema compliance
            academicYear: "2024/2025",
            semester: 1,
            registrationStartDate: "2024-01-01T00:00:00.000Z",
            registrationEndDate: "2024-01-31T23:59:59.000Z",
            orientationDate: "2024-02-01T00:00:00.000Z",
            classesStartDate: "2024-02-05T00:00:00.000Z",
            classesEndDate: "2024-05-30T23:59:59.000Z",
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
            schoolId: createdIds.school,
            completionDate: "2024-06-15T23:59:59.000Z"
        },
        {
            intakeName: "May 2024 Intake",
            intakeMonth: "May",
            totalYear: 4, // Added for schema compliance
            totalSemester: 8, // Added for schema compliance
            academicYear: "2024/2025",
            semester: 2,
            registrationStartDate: "2024-05-01T00:00:00.000Z",
            registrationEndDate: "2024-05-31T23:59:59.000Z",
            orientationDate: "2024-06-01T00:00:00.000Z",
            classesStartDate: "2024-06-05T00:00:00.000Z",
            classesEndDate: "2024-09-30T23:59:59.000Z",
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
            schoolId: createdIds.school,
            completionDate: "2024-10-15T23:59:59.000Z"
        },
        {
            intakeName: "September 2024 Intake",
            intakeMonth: "September",
            totalYear: "4", // Added for schema compliance
            totalSemester: 8, // Added for schema compliance
            academicYear: "2024/2025",
            semester: 3,
            registrationStartDate: "2024-09-01T00:00:00.000Z",
            registrationEndDate: "2024-09-30T23:59:59.000Z",
            orientationDate: "2024-10-01T00:00:00.000Z",
            classesStartDate: "2024-10-05T00:00:00.000Z",
            classesEndDate: "2025-01-30T23:59:59.000Z",
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
            schoolId: createdIds.school,
            completionDate: "2025-02-15T23:59:59.000Z"
        }
    ];
    for (let i = 0; i < intakesData.length; i++) {
        const intakeResponse = await apiCall('POST', '/api/intake', intakesData[i]);
        createdIds.intakes.push(intakeResponse.data._id);
        console.log(`[${schoolPrefix}] ✅ Intake created: ${intakesData[i].intakeName} (${intakeResponse.data._id})`);
    }

    // 7. Create Lecturers
    console.log(`[${schoolPrefix}] 7. Creating Lecturers...`);
    const lecturersData = [
        {
            userId: createdIds.users.lecturer[0],
            title: ["Dr.", "Associate Professor"],
            departmentId: createdIds.departments[0],
            moduleIds: [],
            specialization: ["Database Systems", "Artificial Intelligence"],
            qualification: "PhD",
            experience: 8,
            isActive: true,
            officeHours: [
                { day: "Monday", startTime: "10:00", endTime: "12:00" }
            ],
            schoolId: createdIds.school
        },
        {
            userId: createdIds.users.lecturer[1],
            title: ["Dr.", "Senior Lecturer"],
            departmentId: createdIds.departments[0],
            moduleIds: [],
            specialization: ["Web Development", "Software Engineering"],
            qualification: "PhD",
            experience: 5,
            isActive: true,
            officeHours: [
                { day: "Wednesday", startTime: "14:00", endTime: "16:00" }
            ],
            schoolId: createdIds.school
        }
    ];
    for (let i = 0; i < lecturersData.length; i++) {
        const lecturerResponse = await apiCall('POST', '/api/lecturer', lecturersData[i]);
        createdIds.lecturers.push(lecturerResponse.data._id);
        console.log(`[${schoolPrefix}] ✅ Lecturer created: ${lecturersData[i].userId} (${lecturerResponse.data._id})`);
    }

    // 8. Create Modules
    console.log(`[${schoolPrefix}] 8. Creating Modules...`);
    const modulesData = [
        {
            moduleName: "Database Systems",
            code: "CS301",
            totalCreditHour: 3,
            courseId: createdIds.courses[0],
            prerequisites: [],
            moduleDescription: "Introduction to database design and management",
            learningOutcomes: [
                "Understand database concepts",
                "Design relational databases",
                "Write SQL queries"
            ],
            assessmentMethods: ["exam", "assignment", "project"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "Web Development",
            code: "CS302",
            totalCreditHour: 3,
            courseId: createdIds.courses[0],
            prerequisites: [],
            moduleDescription: "Learn to build modern web applications",
            learningOutcomes: [
                "Understand web technologies",
                "Build responsive websites",
                "Deploy web apps"
            ],
            assessmentMethods: ["exam", "assignment"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "Software Engineering",
            code: "CS303",
            totalCreditHour: 3,
            courseId: createdIds.courses[0],
            prerequisites: [],
            moduleDescription: "Principles of software engineering",
            learningOutcomes: [
                "Understand SDLC",
                "Apply design patterns",
                "Work in teams"
            ],
            assessmentMethods: ["exam", "project"],
            isActive: true,
            schoolId: createdIds.school
        }
    ];
    for (let i = 0; i < modulesData.length; i++) {
        const moduleResponse = await apiCall('POST', '/api/module', modulesData[i]);
        createdIds.modules.push(moduleResponse.data._id);
        console.log(`[${schoolPrefix}] ✅ Module created: ${modulesData[i].moduleName} (${moduleResponse.data._id})`);
    }

    // 9. Create Intake Courses
    console.log(`[${schoolPrefix}] 9. Creating Intake Courses...`);
    const intakeCoursesData = [
        {
            intakeId: createdIds.intakes[0],
            courseId: createdIds.courses[0],
            maxStudents: 50,
            currentEnrollment: 0,
            feeStructure: { localStudent: 25000, internationalStudent: 35000 },
            duration: 36,
            maxDuration: 48,
            requirements: ["SPM with 5 credits", "Mathematics"],
            isActive: true,
            status: "available",
            schoolId: createdIds.school
        },
        {
            intakeId: createdIds.intakes[1],
            courseId: createdIds.courses[1],
            maxStudents: 40,
            currentEnrollment: 0,
            feeStructure: { localStudent: 22000, internationalStudent: 32000 },
            duration: 36,
            maxDuration: 48,
            requirements: ["SPM with 5 credits", "English"],
            isActive: true,
            status: "available",
            schoolId: createdIds.school
        },
        {
            intakeId: createdIds.intakes[2],
            courseId: createdIds.courses[0],
            maxStudents: 45,
            currentEnrollment: 0,
            feeStructure: { localStudent: 24000, internationalStudent: 34000 },
            duration: 36,
            maxDuration: 48,
            requirements: ["SPM with 5 credits", "Mathematics"],
            isActive: true,
            status: "available",
            schoolId: createdIds.school
        }
    ];
    for (let i = 0; i < intakeCoursesData.length; i++) {
        const intakeCourseResponse = await apiCall('POST', '/api/intake-course', intakeCoursesData[i]);
        createdIds.intakeCourses.push(intakeCourseResponse.data._id);
        console.log(`[${schoolPrefix}] ✅ Intake Course created: ${intakeCoursesData[i].intakeId} + ${intakeCoursesData[i].courseId} (${intakeCourseResponse.data._id})`);
    }

    // 10. Create Class Schedules
    console.log(`[${schoolPrefix}] 10. Creating Class Schedules...`);
    const classSchedulesData = [
        {
            roomId: createdIds.rooms.classroom,
            moduleId: createdIds.modules[0],
            lecturerId: createdIds.lecturers[0],
            dayOfWeek: "Monday",
            startTime: "09:00",
            endTime: "12:00",
            intakeCourseId: createdIds.intakeCourses[0],
            schoolId: createdIds.school
        },
        {
            roomId: createdIds.rooms.classroom,
            moduleId: createdIds.modules[1],
            lecturerId: createdIds.lecturers[1],
            dayOfWeek: "Tuesday",
            startTime: "13:00",
            endTime: "16:00",
            intakeCourseId: createdIds.intakeCourses[1],
            schoolId: createdIds.school
        }
    ];
    for (let i = 0; i < classSchedulesData.length; i++) {
        const classScheduleResponse = await apiCall('POST', '/api/class-schedule', classSchedulesData[i]);
        createdIds.classSchedules.push(classScheduleResponse.data._id);
        console.log(`[${schoolPrefix}] ✅ Class Schedule created: ${classSchedulesData[i].dayOfWeek} (${classScheduleResponse.data._id})`);
    }

    // 11. Create Exam Schedules
    console.log(`[${schoolPrefix}] 11. Creating Exam Schedules...`);
    const examSchedulesData = [
        {
            intakeCourseId: createdIds.intakeCourses[0],
            courseId: createdIds.courses[0],
            moduleId: createdIds.modules[0],
            examDate: "2024-06-01",
            examTime: "09:00",
            roomId: createdIds.rooms.tech_lab,
            invigilators: [createdIds.lecturers[0]],
            durationMinute: 120,
            schoolId: createdIds.school
        },
        {
            intakeCourseId: createdIds.intakeCourses[1],
            courseId: createdIds.courses[1],
            moduleId: createdIds.modules[1],
            examDate: "2024-08-01",
            examTime: "14:00",
            roomId: createdIds.rooms.tech_lab,
            invigilators: [createdIds.lecturers[1]],
            durationMinute: 120,
            schoolId: createdIds.school
        }
    ];
    for (let i = 0; i < examSchedulesData.length; i++) {
        const examScheduleResponse = await apiCall('POST', '/api/exam-schedule', examSchedulesData[i]);
        createdIds.examSchedules.push(examScheduleResponse.data._id);
        console.log(`[${schoolPrefix}] ✅ Exam Schedule created: ${examSchedulesData[i].examDate} (${examScheduleResponse.data._id})`);
    }

    // 12. Create Students (limit to 20 per school)
    console.log(`[${schoolPrefix}] 12. Creating Students...`);
    const completionStatuses = ["completed", "in progress", "dropped"];
    const years = [1, 2, 3, 4];
    const semesters = [1, 2, 3];
    const statuses = ['enrolled', 'active', 'graduated', 'dropped', 'suspended'];
    const standings = ['good', 'warning', 'probation', 'suspended'];

    const newStudentUsers = [];
    let studentUserIndex = 0;
    outerUser:
    for (let i = 0; i < createdIds.intakeCourses.length; i++) {
        for (let cs of completionStatuses) {
            for (let y of years) {
                for (let sem of semesters) {
                    for (let st of statuses) {
                        for (let as of standings) {
                            if (studentUserIndex >= 20) break outerUser;
                            const userData = {
                                name: `${schoolPrefix} Student_${studentUserIndex}`,
                                email: `student${studentUserIndex}@student.${schoolEmailDomain}`,
                                password: "password123",
                                phoneNumber: studentPhoneBase + 100 + studentUserIndex,
                                role: "student",
                                twoFA_enabled: false
                            };
                            const userResponse = await apiCall('POST', '/api/user', userData);
                            newStudentUsers.push(userResponse.data._id);
                            studentUserIndex++;
                        }
                    }
                }
            }
        }
    }

    const studentsData = [];
    let userIdx = 0;
    outerStudent:
    for (let i = 0; i < createdIds.intakeCourses.length; i++) {
        for (let cs of completionStatuses) {
            for (let y of years) {
                for (let sem of semesters) {
                    for (let st of statuses) {
                        for (let as of standings) {
                            if (userIdx >= 20) break outerStudent;
                            studentsData.push({
                                userId: newStudentUsers[userIdx],
                                schoolId: createdIds.school,
                                intakeCourseId: createdIds.intakeCourses[i],
                                completionStatus: cs,
                                year: y,
                                currentSemester: sem,
                                cgpa: 0,
                                status: st,
                                totalCreditHours: 0,
                                completedCreditHours: 0,
                                academicStanding: as
                            });
                            userIdx++;
                        }
                    }
                }
            }
        }
    }

    for (let i = 0; i < studentsData.length; i++) {
        const studentResponse = await apiCall('POST', '/api/student', studentsData[i]);
        createdIds.students.push(studentResponse.data._id);
        console.log(`[${schoolPrefix}] ✅ Student created: ${studentsData[i].userId} (${studentResponse.data._id})`);
    }

    // 13. Create Attendance
    console.log(`[${schoolPrefix}] 13. Creating Attendance...`);
    const attendanceStatuses = ["present", "absent", "late"];
    for (let i = 0; i < createdIds.students.length; i++) {
        for (let j = 0; j < createdIds.classSchedules.length; j++) {
            for (let k = 0; k < 2; k++) { // 2 records per schedule
                const attendanceData = {
                    studentId: createdIds.students[i],
                    scheduleId: createdIds.classSchedules[j],
                    status: attendanceStatuses[(i + j + k) % attendanceStatuses.length],
                    date: `2024-02-${(5 + k + j * 3).toString().padStart(2, '0')}T00:00:00.000Z`,
                    schoolId: createdIds.school
                };
                const attendanceResponse = await apiCall('POST', '/api/attendance', attendanceData);
                createdIds.attendance.push(attendanceResponse.data._id);
                console.log("🚀 ~ attendanceResponse:", attendanceResponse)
                // Optionally log each attendance record
            }
        }
    }
    console.log(`[${schoolPrefix}] ✅ Attendance records created: ${createdIds.attendance.length}`);

    // 14. Create Results
    console.log(`[${schoolPrefix}] 14. Creating Results...`);
    const grades = ["A", "B", "C", "D", "F"];
    for (let i = 0; i < createdIds.students.length; i++) {
        for (let j = 0; j < createdIds.modules.length; j++) {
            const resultData = {
                studentId: createdIds.students[i],
                moduleId: createdIds.modules[j],
                grade: grades[(i + j) % grades.length],
                creditHour: 3,
                remark: `Performance in module ${j + 1}`,
                schoolId: createdIds.school
            };
            const resultResponse = await apiCall('POST', '/api/result', resultData);
            createdIds.results.push(resultResponse.data._id);
        }
    }
    console.log(`[${schoolPrefix}] ✅ Results created: ${createdIds.results.length}`);

    // Save IDs to file for reference
    const fs = await import('fs');
    fs.writeFileSync(`created_ids_${schoolPrefix}.json`, JSON.stringify(createdIds, null, 2));
    console.log(`\n💾 Created IDs for ${schoolName} saved to created_ids_${schoolPrefix}.json`);
    console.log(`==============================`);
    console.log(`✅ Finished data creation for: ${schoolName}`);
    console.log(`==============================\n`);
}

// Toggle which school to create: "APU" or "BPU"
const SCHOOL_TO_CREATE = "APU"; // Change to "BPU" to create the second school
const clearDB = false;
// Main execution 
const main = async () => {
    try {
        console.log('🔗 Testing API connection...');
        await apiCall('GET', '/api/school');
        console.log('✅ API connection successful\n');

        if (clearDB) {
            await clearDatabase();
        }

        if (SCHOOL_TO_CREATE === "APU") {
            // Create Asia Pacific University
            await createSchoolData({
                schoolName: "Asia Pacific University",
                schoolEmailDomain: "apu.edu.my",
                schoolAddress: "Technology Park Malaysia, Bukit Jalil",
                schoolCity: "Kuala Lumpur",
                schoolCountry: "Malaysia",
                adminPhoneBase: 60123456780,
                lecturerPhoneBase: 60123456790,
                studentPhoneBase: 60123456800,
                schoolPrefix: "APU"
            });
        } else if (SCHOOL_TO_CREATE === "BPU") {
            // Create Borneo Pacific University
            await createSchoolData({
                schoolName: "Borneo Pacific University",
                schoolEmailDomain: "bpu.edu.my",
                schoolAddress: "Borneo Tech Park, Kota Kinabalu",
                schoolCity: "Kota Kinabalu",
                schoolCountry: "Malaysia",
                adminPhoneBase: 60133456780,
                lecturerPhoneBase: 60133456790,
                studentPhoneBase: 60133456800,
                schoolPrefix: "BPU"
            });
        } else {
            console.error('❌ Invalid SCHOOL_TO_CREATE value. Use "APU" or "BPU".');
            process.exit(1);
        }

        console.log(`\n✅ API-based database initialization for ${SCHOOL_TO_CREATE} completed successfully!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ API-based database initialization failed:', error.message);
        process.exit(1);
    }
};

main();

export default main; 
