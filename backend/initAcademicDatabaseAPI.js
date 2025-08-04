import dotenv from 'dotenv';

dotenv.config();

// Helper function to add delay between API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to make API calls with retry and rate limiting
const apiCall = async (method, endpoint, data = null, retries = 3) => {
    const url = `http://localhost:5000${endpoint}`;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            // Add delay to prevent server overload during parallel execution
            if (attempt > 1) {
                await delay(1000 * attempt); // Exponential backoff
            }

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
            console.error(`❌ API Error (${method} ${endpoint}) - Attempt ${attempt}:`, error.message);

            // If this is the last attempt, throw the error
            if (attempt === retries) {
                throw error;
            }

            // For network errors like "fetch failed", retry with longer delay
            if (error.message.includes('fetch failed') || error.message.includes('ECONNRESET')) {
                console.log(`🔄 Retrying in ${2000 * attempt}ms...`);
                await delay(2000 * attempt);
            }
        }
    }
};

// Helper function to create all data for a school
async function createFullSchoolData({
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
        semesters: [],
        classSchedules: [],
        examSchedules: [],
        students: [],
        attendance: [],
        results: [],
        // Billing
        subscription: null,
        payment: null,
        invoice: null,
        // Facility
        resources: [],
        bookings: [],
        lockerUnits: [],
        timeSlots: [],
        parkingLots: [],
        // Transportation
        stops: [],
        vehicles: [],
        routes: [],
        busSchedules: [],
        eHailings: [],
        // Service
        feedbacks: [],
        responds: [],
        lostItems: []
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
        // Company Admin
        {
            name: "Company Admin",
            email: "company@gmail.com",
            password: "Password123",
            phoneNumber: adminPhoneBase + 2,
            role: "companyAdmin",
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
            totalYear: 3,
            totalSemester: 6,
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
            totalYear: 3,
            totalSemester: 6,
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
            schoolId: createdIds.school,
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
            schoolId: createdIds.school,
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
            totalCreditHours: 3,
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
            totalCreditHours: 3,
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
            totalCreditHours: 3,
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

    // 10. Create Semesters
    console.log(`[${schoolPrefix}] 10. Creating Semesters...`);

    // Generate semesters for each course
    for (let courseIndex = 0; courseIndex < coursesData.length; courseIndex++) {
        const courseData = coursesData[courseIndex];
        const courseId = createdIds.courses[courseIndex];
        const totalYears = courseData.totalYear;
        const semestersPerYear = 2; // Assuming 2 semesters per year

        console.log(`[${schoolPrefix}] Creating ${courseData.totalSemester} semesters for ${courseData.courseName}...`);

        for (let year = 1; year <= totalYears; year++) {
            for (let semesterInYear = 1; semesterInYear <= semestersPerYear; semesterInYear++) {
                // Calculate overall semester number
                const semesterNumber = semesterInYear;

                // Calculate dates based on year and semester
                const baseYear = 2024;
                const yearOffset = year - 1;
                const isFirstSemester = semesterInYear === 1;

                // First semester: Feb-Jun, Second semester: Jul-Nov
                const startMonth = isFirstSemester ? 1 : 6; // Feb = 1, Jul = 6
                const endMonth = isFirstSemester ? 5 : 10;   // Jun = 5, Nov = 10

                const startDate = new Date(baseYear + yearOffset, startMonth, 1);
                const endDate = new Date(baseYear + yearOffset, endMonth, 30);
                const regStartDate = new Date(baseYear + yearOffset, startMonth - 1, 15);
                const regEndDate = new Date(baseYear + yearOffset, startMonth - 1, 28);
                const examStartDate = new Date(baseYear + yearOffset, endMonth, 1);
                const examEndDate = new Date(baseYear + yearOffset, endMonth, 15);

                const semesterData = {
                    courseId: courseId,
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
                    schoolId: createdIds.school
                };

                try {
                    const semesterResponse = await apiCall('POST', '/api/semester', semesterData);
                    createdIds.semesters.push(semesterResponse.data._id);
                    console.log(`[${schoolPrefix}] ✅ Semester created: ${semesterData.semesterName} for ${courseData.courseCode} (${semesterResponse.data._id})`);
                } catch (error) {
                    console.error(`[${schoolPrefix}] ❌ Failed to create semester: ${semesterData.semesterName} for ${courseData.courseCode}`, error.message);
                }
            }
        }
    }

    // 11. Create Class Schedules
    console.log(`[${schoolPrefix}] 11. Creating Class Schedules...`);
    const classSchedulesData = [
        {
            roomId: createdIds.rooms.classroom,
            moduleId: createdIds.modules[0],
            lecturerId: createdIds.lecturers[0],
            dayOfWeek: "Monday",
            startTime: "09:00",
            endTime: "12:00",
            intakeCourseId: createdIds.intakeCourses[0],
            semesterId: createdIds.semesters[0],
            schoolId: createdIds.school,
            moduleStartDate: "2024-02-01T00:00:00.000Z",
            moduleEndDate: "2024-06-30T23:59:59.000Z"
        },
        {
            roomId: createdIds.rooms.classroom,
            moduleId: createdIds.modules[1],
            lecturerId: createdIds.lecturers[1],
            dayOfWeek: "Tuesday",
            startTime: "13:00",
            endTime: "16:00",
            intakeCourseId: createdIds.intakeCourses[1],
            semesterId: createdIds.semesters[1],
            schoolId: createdIds.school,
            moduleStartDate: "2024-06-01T00:00:00.000Z",
            moduleEndDate: "2024-10-31T23:59:59.000Z"
        }
    ];
    for (let i = 0; i < classSchedulesData.length; i++) {
        const classScheduleResponse = await apiCall('POST', '/api/class-schedule', classSchedulesData[i]);
        createdIds.classSchedules.push(classScheduleResponse.data._id);
        console.log(`[${schoolPrefix}] ✅ Class Schedule created: ${classSchedulesData[i].dayOfWeek} (${classScheduleResponse.data._id})`);
    }

    // 12. Create Exam Schedules
    console.log(`[${schoolPrefix}] 12. Creating Exam Schedules...`);
    const examSchedulesData = [
        {
            intakeCourseId: createdIds.intakeCourses[0],
            courseId: createdIds.courses[0],
            moduleId: createdIds.modules[0],
            examDate: "2024-06-01",
            examTime: "09:00",
            semesterId: createdIds.semesters[0],
            roomId: createdIds.rooms.tech_lab,
            invigilators: [createdIds.lecturers[0]],
            durationMinute: 120,
            schoolId: createdIds.school
        },
        {
            intakeCourseId: createdIds.intakeCourses[1],
            courseId: createdIds.courses[1],
            moduleId: createdIds.modules[1],
            semesterId: createdIds.semesters[1],
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

    // 13. Create Students (distributed across intakes and courses)
    console.log(`[${schoolPrefix}] 13. Creating Students...`);
    const years = [1, 2, 3, 4];
    const semesters = [1, 2, 3];
    const statuses = ['enrolled', 'active', 'in_progress', 'graduated', 'dropped', 'suspended'];
    const standings = ['good', 'warning', 'probation', 'suspended'];

    const newStudentUsers = [];
    const studentsData = [];
    let studentUserIndex = 0;

    // Calculate students per intake course (20 total students / 3 intake courses = ~7 students per intake course)
    const studentsPerIntakeCourse = Math.floor(20 / createdIds.intakeCourses.length);
    const remainingStudents = 20 % createdIds.intakeCourses.length;

    console.log(`[${schoolPrefix}] Distributing ${20} students across ${createdIds.intakeCourses.length} intake courses...`);

    for (let intakeCourseIndex = 0; intakeCourseIndex < createdIds.intakeCourses.length; intakeCourseIndex++) {
        // Calculate how many students for this intake course
        const studentsForThisIntake = studentsPerIntakeCourse + (intakeCourseIndex < remainingStudents ? 1 : 0);

        // Get intake and course info for logging
        const intakeCourseData = intakeCoursesData[intakeCourseIndex];
        const intakeData = intakesData[intakeCourseIndex % intakesData.length];
        const courseData = coursesData[intakeCourseIndex % coursesData.length];

        console.log(`[${schoolPrefix}] Creating ${studentsForThisIntake} students for ${intakeData.intakeName} - ${courseData.courseName}`);

        for (let studentInIntake = 0; studentInIntake < studentsForThisIntake; studentInIntake++) {
            // Create user for this student
            const userData = {
                name: `${schoolPrefix} Student_${studentUserIndex}`,
                email: `student${studentUserIndex}@student.${schoolEmailDomain}`,
                password: "password123",
                phoneNumber: studentPhoneBase + 100 + studentUserIndex,
                role: "student",
                twoFA_enabled: false
            };

            const userResponse = await apiCall('POST', '/api/user', userData);
            const userId = userResponse.data._id;
            newStudentUsers.push(userId);

            // Create student data with varied attributes
            const currentYear = years[studentInIntake % years.length];
            const currentSemester = semesters[studentInIntake % semesters.length];
            const status = statuses[studentInIntake % statuses.length];
            const academicStanding = standings[studentInIntake % standings.length];

            studentsData.push({
                userId: userId,
                schoolId: createdIds.school,
                intakeCourseId: createdIds.intakeCourses[intakeCourseIndex],
                currentYear: currentYear,
                currentSemester: currentSemester,
                cgpa: 0,
                status: status,
                totalCreditHours: 0,
                completedCreditHours: 0,
                academicStanding: academicStanding
            });

            studentUserIndex++;
        }
    }


    for (let i = 0; i < studentsData.length; i++) {
        const studentResponse = await apiCall('POST', '/api/student', studentsData[i]);
        createdIds.students.push(studentResponse.data._id);
        console.log(`[${schoolPrefix}] ✅ Student created: ${studentsData[i].userId} (${studentResponse.data._id})`);
    }

    // Log student distribution summary
    console.log(`\n[${schoolPrefix}] 📊 Student Distribution Summary:`);
    const distribution = {};
    for (let i = 0; i < studentsData.length; i++) {
        const intakeCourseId = studentsData[i].intakeCourseId;
        const intakeCourseIndex = createdIds.intakeCourses.indexOf(intakeCourseId);
        const intakeData = intakesData[intakeCourseIndex % intakesData.length];
        const courseData = coursesData[intakeCourseIndex % coursesData.length];
        const key = `${intakeData.intakeName} - ${courseData.courseName}`;
        distribution[key] = (distribution[key] || 0) + 1;
    }

    Object.entries(distribution).forEach(([key, count]) => {
        console.log(`[${schoolPrefix}]   ${key}: ${count} students`);
    });
    console.log(`[${schoolPrefix}]   Total: ${studentsData.length} students\n`);

    // 14. Create Attendance
    console.log(`[${schoolPrefix}] 14. Creating Attendance...`);
    const attendanceStatuses = ["present", "absent", "late"];

    // Create attendance records for students in their respective class schedules
    for (let i = 0; i < createdIds.students.length; i++) {
        // Get the student's intake course to match with appropriate class schedules
        const studentData = studentsData[i];
        const studentIntakeCourseId = studentData.intakeCourseId;

        // Find class schedules that match this student's intake course
        for (let j = 0; j < createdIds.classSchedules.length; j++) {
            // Only create attendance for schedules that match the student's intake course
            // This is a simplified check - in a real scenario, you'd match based on intakeCourseId
            if (j < 2) { // Limit to first 2 schedules for demonstration
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
                }
            }
        }
    }
    console.log(`[${schoolPrefix}] ✅ Attendance records created: ${createdIds.attendance.length}`);

    // 15. Create Results
    console.log(`[${schoolPrefix}] 15. Creating Results...`);
    const grades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];
    const gradeToGPA = {
        "A+": 4.0, "A": 4.0, "A-": 3.7,
        "B+": 3.3, "B": 3.0, "B-": 2.7,
        "C+": 2.3, "C": 2.0, "C-": 1.7,
        "D": 1.0, "F": 0.0
    };

    // Create results for each student based on their course and modules
    for (let i = 0; i < createdIds.students.length; i++) {
        const studentData = studentsData[i];
        const studentIntakeCourseId = studentData.intakeCourseId;

        // Find which course this student belongs to based on their intake course ID
        const studentIntakeCourseIndex = createdIds.intakeCourses.indexOf(studentData.intakeCourseId);
        const studentCourseId = studentIntakeCourseIndex >= 0 ? intakeCoursesData[studentIntakeCourseIndex].courseId : createdIds.courses[0];

        // Get modules for this student's course
        const courseModules = modulesData.filter(module => module.courseId === studentCourseId);

        // Create results for each module in the student's course
        for (let j = 0; j < courseModules.length; j++) {
            const selectedGrade = grades[(i + j) % grades.length];
            const totalMarks = 100;
            const marks = Math.floor(Math.random() * 40) + (selectedGrade === 'F' ? 0 : 50); // 50-90 for passing, 0-49 for F

            // Assign semester based on student's current semester and available semesters
            const semesterIndex = (studentData.currentSemester - 1) % createdIds.semesters.length;
            const semesterId = createdIds.semesters[semesterIndex];

            const resultData = {
                studentId: createdIds.students[i],
                moduleId: createdIds.modules[j],
                semesterId: semesterId,
                grade: selectedGrade,
                creditHours: 3,
                marks: marks,
                totalMarks: totalMarks,
                gpa: gradeToGPA[selectedGrade],
                remark: `Performance in module ${j + 1} - Score: ${marks}/${totalMarks}`,
                schoolId: createdIds.school
            };
            const resultResponse = await apiCall('POST', '/api/result', resultData);
            createdIds.results.push(resultResponse.data._id);
        }
    }
    console.log(`[${schoolPrefix}] ✅ Results created: ${createdIds.results.length}`);

    // 2. Billing
    console.log(`[${schoolPrefix}] Billing: Creating Subscription...`);
    const subscriptionData = {
        schoolId: createdIds.school,
        plan: "Standard",
        price: 1000,
        billingInterval: "Yearly"
    };
    const subscriptionRes = await apiCall('POST', '/api/subscription', subscriptionData);
    createdIds.subscription = subscriptionRes.data._id;

    console.log(`[${schoolPrefix}] Billing: Creating Payment...`);
    const paymentData = {
        schoolId: createdIds.school,
        cardHolderName: `${schoolPrefix} Admin User`,
        last4Digit: "1234",
        expiryDate: "12/29",
        paymentMethod: "VISA",
        status: "success"
    };
    const paymentRes = await apiCall('POST', '/api/payment', paymentData);
    createdIds.payment = paymentRes.data._id;

    console.log(`[${schoolPrefix}] Billing: Creating Invoice...`);
    const invoiceData = {
        paymentId: createdIds.payment,
        subscriptionId: createdIds.subscription,
        schoolId: createdIds.school,
        amount: 1000,
        status: "paid"
    };
    const invoiceRes = await apiCall('POST', '/api/invoice', invoiceData);
    createdIds.invoice = invoiceRes.data._id;

    // 3. Facility
    console.log(`[${schoolPrefix}] Facility: Creating Resource...`);
    const resourceData = {
        schoolId: createdIds.school,
        name: "Main Library",
        location: "Block D",
        type: "study_room",
        capacity: 50,
        status: true
    };
    const resourceRes = await apiCall('POST', '/api/resource', resourceData);
    createdIds.resources.push(resourceRes.data._id);

    console.log(`[${schoolPrefix}] Facility: Creating Booking...`);
    const bookingData = {
        studentId: createdIds.students[0],
        resourceId: createdIds.resources[0],
        schoolId: createdIds.school,
        startTime: "09:00",
        endTime: "11:00",
        status: "confirmed"
    };
    const bookingRes = await apiCall('POST', '/api/booking', bookingData);
    createdIds.bookings.push(bookingRes.data._id);

    console.log(`[${schoolPrefix}] Facility: Creating LockerUnit...`);
    const lockerUnitData = {
        resourceId: createdIds.resources[0],
        schoolId: createdIds.school,
        isAvailable: true
    };
    const lockerUnitRes = await apiCall('POST', '/api/locker-unit', lockerUnitData);
    createdIds.lockerUnits.push(lockerUnitRes.data._id);

    console.log(`[${schoolPrefix}] Facility: Creating TimeSlot...`);
    const timeSlotData = {
        resourceId: createdIds.resources[0],
        schoolId: createdIds.school,
        dayOfWeek: "Monday",
        timeslot: [{ start: "09:00", end: "10:00" }]
    };
    const timeSlotRes = await apiCall('POST', '/api/time-slot', timeSlotData);
    createdIds.timeSlots.push(timeSlotRes.data._id);

    console.log(`[${schoolPrefix}] Facility: Creating ParkingLot...`);
    const parkingLotData = {
        schoolId: createdIds.school,
        zone: "A",
        slotNumber: 10,
        active: true
    };
    const parkingLotRes = await apiCall('POST', '/api/parking-lot', parkingLotData);
    createdIds.parkingLots.push(parkingLotRes.data._id);

    // 4. Transportation
    console.log(`[${schoolPrefix}] Transportation: Creating Stop...`);
    const stopData = {
        name: "Main Gate",
        type: "campus",
        schoolId: createdIds.school
    };
    const stopRes = await apiCall('POST', '/api/stop', stopData);
    createdIds.stops.push(stopRes.data._id);
    const stopData1 = {
        name: "Goo goo Gate",
        type: "campus",
        schoolId: createdIds.school
    };
    const stopRes1 = await apiCall('POST', '/api/stop', stopData1);
    createdIds.stops.push(stopRes1.data._id);

    console.log(`[${schoolPrefix}] Transportation: Creating Vehicle...`);
    const vehicleData = {
        plateNumber: `${schoolPrefix}-BUS-1234`, // e.g., "APU-BUS-1234", "BPU-BUS-1234"
        type: "bus",
        capacity: 40,
        status: "available",
        schoolId: createdIds.school
    };
    const vehicleRes = await apiCall('POST', '/api/vehicle', vehicleData);
    createdIds.vehicles.push(vehicleRes.data._id);

    console.log(`[${schoolPrefix}] Transportation: Creating Route...`);
    const routeData = {
        name: "Campus Loop",
        stopIds: [createdIds.stops[0], createdIds.stops[1]],
        estimateTimeMinute: 30,
        fare: 2,
        schoolId: createdIds.school
    };

    const routeRes = await apiCall('POST', '/api/route', routeData);
    createdIds.routes.push(routeRes.data._id);

    console.log(`[${schoolPrefix}] Transportation: Creating BusSchedule...`);
    const busScheduleData = {
        routeId: [createdIds.routes[0]],
        vehicleId: createdIds.vehicles[0],
        departureTime: new Date().toISOString(),
        arrivalTime: new Date(Date.now() + 3600000).toISOString(),
        dayActive: 1,
        active: true
    };
    const busScheduleRes = await apiCall('POST', '/api/bus-schedule', busScheduleData);
    createdIds.busSchedules.push(busScheduleRes.data._id);

    console.log(`[${schoolPrefix}] Transportation: Creating EHailing...`);
    const eHailingData = {
        studentId: createdIds.students[0],
        routeId: createdIds.routes[0],
        status: "waiting",
        requestAt: new Date().toISOString(),
        vehicleId: createdIds.vehicles[0],
        schoolId: createdIds.school
    };
    const eHailingRes = await apiCall('POST', '/api/e-hailing', eHailingData);
    createdIds.eHailings.push(eHailingRes.data._id);

    // 5. Service
    console.log(`[${schoolPrefix}] Service: Creating Feedback...`);
    const feedbackData = {
        studentId: createdIds.students[0],
        schoolId: createdIds.school,
        feedbackType: "complaint",
        message: "Air conditioning not working in the library.",
        status: "open"
    };
    const feedbackRes = await apiCall('POST', '/api/feedback', feedbackData);
    createdIds.feedbacks.push(feedbackRes.data._id);

    console.log(`[${schoolPrefix}] Service: Creating Respond...`);
    const respondData = {
        feedbackId: createdIds.feedbacks[0],
        schoolId: createdIds.school,
        responderId: createdIds.users.schoolAdmin[0],
        message: "We are looking into the issue.",
    };
    const respondRes = await apiCall('POST', '/api/respond', respondData);
    createdIds.responds.push(respondRes.data._id);

    console.log(`[${schoolPrefix}] Service: Creating LostItem...`);
    const lostItemData = {
        personId: createdIds.students[0],
        schoolId: createdIds.school,
        itemDetails: {
            name: "Wallet",
            description: "Lost black leather wallet.",
            location: "cafeteria",
            lostDate: new Date().toISOString()
        },
        status: "reported"
    };
    const lostItemRes = await apiCall('POST', '/api/lost-item', lostItemData);
    createdIds.lostItems.push(lostItemRes.data._id);

    // Save IDs to file for reference
    const fs = await import('fs');
    fs.writeFileSync(`created_ids_${schoolPrefix}.json`, JSON.stringify(createdIds, null, 2));
    console.log(`\n💾 Created IDs for ${schoolName} saved to created_ids_${schoolPrefix}.json`);
    console.log(`==============================`);
    console.log(`✅ Finished data creation for: ${schoolName}`);
    console.log(`==============================\n`);
}

// Clear all data from all collections
const clearDatabase = async () => {
    console.log('🗑️  Clearing all data from all domains...');
    try {
        await apiCall('DELETE', '/api/school/all');
        // Academic
        await apiCall('DELETE', '/api/result/all');
        await apiCall('DELETE', '/api/attendance/all');
        await apiCall('DELETE', '/api/student/all');
        await apiCall('DELETE', '/api/exam-schedule/all');
        await apiCall('DELETE', '/api/class-schedule/all');
        await apiCall('DELETE', '/api/semester/all');
        await apiCall('DELETE', '/api/intake-course/all');
        await apiCall('DELETE', '/api/module/all');
        await apiCall('DELETE', '/api/lecturer/all');
        await apiCall('DELETE', '/api/intake/all');
        await apiCall('DELETE', '/api/course/all');
        await apiCall('DELETE', '/api/department/all');
        await apiCall('DELETE', '/api/room/all');
        await apiCall('DELETE', '/api/user/all');
        // Billing
        await apiCall('DELETE', '/api/invoice/all');
        await apiCall('DELETE', '/api/payment/all');
        await apiCall('DELETE', '/api/subscription/all');
        await apiCall('DELETE', '/api/school/all');
        // Facility
        await apiCall('DELETE', '/api/booking/all');
        await apiCall('DELETE', '/api/resource/all');
        await apiCall('DELETE', '/api/locker-unit/all');
        await apiCall('DELETE', '/api/time-slot/all');
        await apiCall('DELETE', '/api/parking-lot/all');
        // Transportation
        await apiCall('DELETE', '/api/bus-schedule/all');
        await apiCall('DELETE', '/api/vehicle/all');
        await apiCall('DELETE', '/api/route/all');
        await apiCall('DELETE', '/api/stop/all');
        await apiCall('DELETE', '/api/e-hailing/all');
        // Service
        await apiCall('DELETE', '/api/feedback/all');
        await apiCall('DELETE', '/api/respond/all');
        await apiCall('DELETE', '/api/lost-item/all');
        console.log('✅ All data cleared successfully');
    } catch (error) {
        console.error('❌ Error clearing database:', error.message);
    }
};

const main = async () => {
    try {
        console.log('🔗 Testing API connection...');
        await apiCall('GET', '/api/school');
        console.log('✅ API connection successful\n');

        // Clear all data before seeding (optional: only if you want to clear before both)
        await clearDatabase();

        // Define both schools' data
        const schools = [
            {
                schoolName: "Asia Pacific University",
                schoolEmailDomain: "apu.edu.my",
                schoolAddress: "Technology Park Malaysia, Bukit Jalil",
                schoolCity: "Kuala Lumpur",
                schoolCountry: "Malaysia",
                adminPhoneBase: 60123456780,
                lecturerPhoneBase: 60123456790,
                studentPhoneBase: 60123456800,
                schoolPrefix: "APU"
            },
            {
                schoolName: "Borneo Pacific University",
                schoolEmailDomain: "bpu.edu.my",
                schoolAddress: "Borneo Tech Park, Kota Kinabalu",
                schoolCity: "Kota Kinabalu",
                schoolCountry: "Malaysia",
                adminPhoneBase: 60133456780,
                lecturerPhoneBase: 60133456790,
                studentPhoneBase: 60133456800,
                schoolPrefix: "BPU"
            }
        ];

        // Create both schools in parallel for better performance
        await Promise.all(schools.map(schoolData => createFullSchoolData(schoolData)));

        console.log(`\n✅ API-based database initialization for both schools completed successfully!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ API-based database initialization failed:', error.message);
        process.exit(1);
    }
};

main();

export default main; 
