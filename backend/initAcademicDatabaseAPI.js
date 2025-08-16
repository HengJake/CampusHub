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
        },
        {
            moduleName: "Computer Networks",
            code: "CS304",
            totalCreditHours: 3,
            courseId: createdIds.courses[0],
            prerequisites: [],
            moduleDescription: "Fundamentals of computer networking",
            learningOutcomes: [
                "Understand network protocols",
                "Configure network devices",
                "Troubleshoot network issues"
            ],
            assessmentMethods: ["exam", "assignment"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "Data Structures & Algorithms",
            code: "CS305",
            totalCreditHours: 4,
            courseId: createdIds.courses[0],
            prerequisites: [],
            moduleDescription: "Advanced data structures and algorithm analysis",
            learningOutcomes: [
                "Implement complex data structures",
                "Analyze algorithm efficiency",
                "Solve algorithmic problems"
            ],
            assessmentMethods: ["exam", "assignment", "project"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "Artificial Intelligence",
            code: "CS306",
            totalCreditHours: 3,
            courseId: createdIds.courses[0],
            prerequisites: [],
            moduleDescription: "Introduction to AI and machine learning",
            learningOutcomes: [
                "Understand AI concepts",
                "Implement ML algorithms",
                "Build AI applications"
            ],
            assessmentMethods: ["exam", "project"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "IT Infrastructure",
            code: "IT301",
            totalCreditHours: 3,
            courseId: createdIds.courses[1],
            prerequisites: [],
            moduleDescription: "IT infrastructure and system administration",
            learningOutcomes: [
                "Manage IT infrastructure",
                "Configure servers",
                "Implement security measures"
            ],
            assessmentMethods: ["exam", "assignment"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "Cybersecurity",
            code: "IT302",
            totalCreditHours: 3,
            courseId: createdIds.courses[1],
            prerequisites: [],
            moduleDescription: "Cybersecurity principles and practices",
            learningOutcomes: [
                "Understand security threats",
                "Implement security measures",
                "Conduct security audits"
            ],
            assessmentMethods: ["exam", "project"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "Cloud Computing",
            code: "IT303",
            totalCreditHours: 3,
            courseId: createdIds.courses[1],
            prerequisites: [],
            moduleDescription: "Cloud computing technologies and services",
            learningOutcomes: [
                "Deploy cloud applications",
                "Manage cloud resources",
                "Understand cloud security"
            ],
            assessmentMethods: ["exam", "assignment"],
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
        },
        {
            roomId: createdIds.rooms.tech_lab,
            moduleId: createdIds.modules[2],
            lecturerId: createdIds.lecturers[0],
            dayOfWeek: "Wednesday",
            startTime: "10:00",
            endTime: "13:00",
            intakeCourseId: createdIds.intakeCourses[0],
            semesterId: createdIds.semesters[0],
            schoolId: createdIds.school,
            moduleStartDate: "2024-02-01T00:00:00.000Z",
            moduleEndDate: "2024-06-30T23:59:59.000Z"
        },
        {
            roomId: createdIds.rooms.classroom,
            moduleId: createdIds.modules[3],
            lecturerId: createdIds.lecturers[1],
            dayOfWeek: "Thursday",
            startTime: "14:00",
            endTime: "17:00",
            intakeCourseId: createdIds.intakeCourses[1],
            semesterId: createdIds.semesters[1],
            schoolId: createdIds.school,
            moduleStartDate: "2024-06-01T00:00:00.000Z",
            moduleEndDate: "2024-10-31T23:59:59.000Z"
        },
        {
            roomId: createdIds.rooms.tech_lab,
            moduleId: createdIds.modules[4],
            lecturerId: createdIds.lecturers[0],
            dayOfWeek: "Friday",
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
            moduleId: createdIds.modules[5],
            lecturerId: createdIds.lecturers[1],
            dayOfWeek: "Monday",
            startTime: "14:00",
            endTime: "17:00",
            intakeCourseId: createdIds.intakeCourses[1],
            semesterId: createdIds.semesters[1],
            schoolId: createdIds.school,
            moduleStartDate: "2024-06-01T00:00:00.000Z",
            moduleEndDate: "2024-10-31T23:59:59.000Z"
        },
        {
            roomId: createdIds.rooms.tech_lab,
            moduleId: createdIds.modules[6],
            lecturerId: createdIds.lecturers[0],
            dayOfWeek: "Tuesday",
            startTime: "09:00",
            endTime: "12:00",
            intakeCourseId: createdIds.intakeCourses[2],
            semesterId: createdIds.semesters[2],
            schoolId: createdIds.school,
            moduleStartDate: "2024-10-01T00:00:00.000Z",
            moduleEndDate: "2025-02-28T23:59:59.000Z"
        },
        {
            roomId: createdIds.rooms.classroom,
            moduleId: createdIds.modules[7],
            lecturerId: createdIds.lecturers[1],
            dayOfWeek: "Wednesday",
            startTime: "13:00",
            endTime: "16:00",
            intakeCourseId: createdIds.intakeCourses[2],
            semesterId: createdIds.semesters[2],
            schoolId: createdIds.school,
            moduleStartDate: "2024-10-01T00:00:00.000Z",
            moduleEndDate: "2025-02-28T23:59:59.000Z"
        },
        {
            roomId: createdIds.rooms.tech_lab,
            moduleId: createdIds.modules[8],
            lecturerId: createdIds.lecturers[0],
            dayOfWeek: "Thursday",
            startTime: "10:00",
            endTime: "13:00",
            intakeCourseId: createdIds.intakeCourses[2],
            semesterId: createdIds.semesters[2],
            schoolId: createdIds.school,
            moduleStartDate: "2024-10-01T00:00:00.000Z",
            moduleEndDate: "2025-02-28T23:59:59.000Z"
        }
    ];
    for (let i = 0; i < classSchedulesData.length; i++) {
        const classScheduleResponse = await apiCall('POST', '/api/class-schedule', classSchedulesData[i]);
        createdIds.classSchedules.push(classScheduleResponse.data._id);
        console.log(`[${schoolPrefix}] ✅ Class Schedule created: ${classSchedulesData[i].dayOfWeek} (${classScheduleResponse.data._id})`);
    }

    // 12. Create Exam Schedules
    console.log(`[${schoolPrefix}] 12. Creating Exam Schedules...`);
    // Calculate exam dates: current date + 1 week
    const currentDate = new Date();
    const examDate1 = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000); // +1 week
    const examDate2 = new Date(currentDate.getTime() + 8 * 24 * 60 * 60 * 1000); // +1 week + 1 day

    const examSchedulesData = [
        {
            intakeCourseId: createdIds.intakeCourses[0],
            courseId: createdIds.courses[0],
            moduleId: createdIds.modules[0],
            examDate: examDate1.toISOString().split('T')[0],
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
            examDate: examDate2.toISOString().split('T')[0],
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
    console.log(`[${schoolPrefix}] Facility: Creating Resources...`);
    const resourceData = [
        {
            schoolId: createdIds.school,
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
                },
                {
                    dayOfWeek: "Tuesday",
                    slots: [
                        { start: "09:00", end: "11:00" },
                        { start: "13:00", end: "15:00" }
                    ]
                }
            ]
        },
        {
            schoolId: createdIds.school,
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
                },
                {
                    dayOfWeek: "Wednesday",
                    slots: [
                        { start: "10:00", end: "12:00" },
                        { start: "15:00", end: "17:00" }
                    ]
                }
            ]
        },
        {
            schoolId: createdIds.school,
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
                },
                {
                    dayOfWeek: "Wednesday",
                    slots: [
                        { start: "17:00", end: "19:00" }
                    ]
                },
                {
                    dayOfWeek: "Friday",
                    slots: [
                        { start: "15:00", end: "17:00" }
                    ]
                }
            ]
        },
        {
            schoolId: createdIds.school,
            name: "Meeting Room 1",
            location: "Block A",
            type: "meeting_room",
            capacity: 15,
            status: true,
            timeslots: [
                {
                    dayOfWeek: "Tuesday",
                    slots: [
                        { start: "09:00", end: "11:00" },
                        { start: "14:00", end: "16:00" }
                    ]
                },
                {
                    dayOfWeek: "Thursday",
                    slots: [
                        { start: "10:00", end: "12:00" }
                    ]
                }
            ]
        },
        {
            schoolId: createdIds.school,
            name: "Seminar Hall",
            location: "Block B",
            type: "seminar_room",
            capacity: 100,
            status: true,
            timeslots: [
                {
                    dayOfWeek: "Monday",
                    slots: [
                        { start: "14:00", end: "16:00" }
                    ]
                },
                {
                    dayOfWeek: "Wednesday",
                    slots: [
                        { start: "10:00", end: "12:00" }
                    ]
                },
                {
                    dayOfWeek: "Friday",
                    slots: [
                        { start: "15:00", end: "17:00" }
                    ]
                }
            ]
        },
        {
            schoolId: createdIds.school,
            name: "A100",
            location: "Block D",
            type: "locker",
            capacity: 1,
            status: true,
            timeslots: [
                {
                    dayOfWeek: "Monday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Tuesday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Wednesday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Thursday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Friday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                }
            ]
        },
        {
            schoolId: createdIds.school,
            name: "A101",
            location: "Block D",
            type: "locker",
            capacity: 1,
            status: true,
            timeslots: [
                {
                    dayOfWeek: "Monday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Tuesday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Wednesday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Thursday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Friday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                }
            ]
        },
        {
            schoolId: createdIds.school,
            name: "A102",
            location: "Block D",
            type: "locker",
            capacity: 1,
            status: true,
            timeslots: [
                {
                    dayOfWeek: "Monday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Tuesday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Wednesday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Thursday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Friday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                }
            ]
        },
        {
            schoolId: createdIds.school,
            name: "A103",
            location: "Block D",
            type: "locker",
            capacity: 1,
            status: true,
            timeslots: [
                {
                    dayOfWeek: "Monday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Tuesday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Wednesday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Thursday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Friday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                }
            ]
        },
        {
            schoolId: createdIds.school,
            name: "A104",
            location: "Block D",
            type: "locker",
            capacity: 1,
            status: true,
            timeslots: [
                {
                    dayOfWeek: "Monday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Tuesday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Wednesday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Thursday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Friday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                }
            ]
        },
        {
            schoolId: createdIds.school,
            name: "A105",
            location: "Block D",
            type: "locker",
            capacity: 1,
            status: true,
            timeslots: [
                {
                    dayOfWeek: "Monday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Tuesday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Wednesday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Thursday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                },
                {
                    dayOfWeek: "Friday",
                    slots: [
                        { start: "08:00", end: "18:00" }
                    ]
                }
            ]
        }
    ];

    for (let i = 0; i < resourceData.length; i++) {
        const resourceRes = await apiCall('POST', '/api/resource', resourceData[i]);
        createdIds.resources.push(resourceRes.data._id);
        console.log(`[${schoolPrefix}] ✅ Resource created: ${resourceData[i].name} (${resourceRes.data._id})`);
    }

    console.log(`[${schoolPrefix}] Facility: Creating Bookings...`);
    const bookingData = [
        // Current month bookings (for active bookings calculation)
        {
            studentId: createdIds.students[0],
            resourceId: createdIds.resources[0],
            schoolId: createdIds.school,
            bookingDate: new Date(),
            startTime: "09:00",
            endTime: "11:00",
            status: "confirmed"
        },
        {
            studentId: createdIds.students[1],
            resourceId: createdIds.resources[1],
            schoolId: createdIds.school,
            bookingDate: new Date(),
            startTime: "13:00",
            endTime: "15:00",
            status: "pending"
        },
        {
            studentId: createdIds.students[2],
            resourceId: createdIds.resources[2],
            schoolId: createdIds.school,
            bookingDate: new Date(),
            startTime: "10:00",
            endTime: "12:00",
            status: "confirmed"
        },
        {
            studentId: createdIds.students[3],
            resourceId: createdIds.resources[3],
            schoolId: createdIds.school,
            bookingDate: new Date(),
            startTime: "14:00",
            endTime: "16:00",
            status: "confirmed"
        },
        {
            studentId: createdIds.students[4],
            resourceId: createdIds.resources[4],
            schoolId: createdIds.school,
            bookingDate: new Date(),
            startTime: "16:00",
            endTime: "18:00",
            status: "completed"
        },
        {
            studentId: createdIds.students[5],
            resourceId: createdIds.resources[0],
            schoolId: createdIds.school,
            bookingDate: new Date(),
            startTime: "08:00",
            endTime: "10:00",
            status: "confirmed"
        },
        {
            studentId: createdIds.students[6],
            resourceId: createdIds.resources[1],
            schoolId: createdIds.school,
            bookingDate: new Date(),
            startTime: "11:00",
            endTime: "13:00",
            status: "pending"
        },
        {
            studentId: createdIds.students[7],
            resourceId: createdIds.resources[2],
            schoolId: createdIds.school,
            bookingDate: new Date(),
            startTime: "15:00",
            endTime: "17:00",
            status: "confirmed"
        },
        // Last month bookings (for comparison)
        {
            studentId: createdIds.students[0],
            resourceId: createdIds.resources[0],
            schoolId: createdIds.school,
            bookingDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 15),
            startTime: "09:00",
            endTime: "11:00",
            status: "confirmed"
        },
        {
            studentId: createdIds.students[1],
            resourceId: createdIds.resources[1],
            schoolId: createdIds.school,
            bookingDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 16),
            startTime: "13:00",
            endTime: "15:00",
            status: "cancelled"
        },
        {
            studentId: createdIds.students[2],
            resourceId: createdIds.resources[2],
            schoolId: createdIds.school,
            bookingDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 17),
            startTime: "10:00",
            endTime: "12:00",
            status: "completed"
        },
        {
            studentId: createdIds.students[3],
            resourceId: createdIds.resources[3],
            schoolId: createdIds.school,
            bookingDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 18),
            startTime: "14:00",
            endTime: "16:00",
            status: "confirmed"
        },
        // Additional current month bookings for variety
        {
            studentId: createdIds.students[4],
            resourceId: createdIds.resources[4],
            schoolId: createdIds.school,
            bookingDate: new Date(),
            startTime: "09:00",
            endTime: "11:00",
            status: "confirmed"
        },
        {
            studentId: createdIds.students[5],
            resourceId: createdIds.resources[0],
            schoolId: createdIds.school,
            bookingDate: new Date(),
            startTime: "14:00",
            endTime: "16:00",
            status: "pending"
        },
        {
            studentId: createdIds.students[6],
            resourceId: createdIds.resources[1],
            schoolId: createdIds.school,
            bookingDate: new Date(),
            startTime: "10:00",
            endTime: "12:00",
            status: "confirmed"
        }
    ];

    for (let i = 0; i < bookingData.length; i++) {
        const bookingRes = await apiCall('POST', '/api/booking', bookingData[i]);
        createdIds.bookings.push(bookingRes.data._id);
        console.log(`[${schoolPrefix}] ✅ Booking created: ${bookingData[i].status} (${bookingRes.data._id})`);
    }

    console.log(`[${schoolPrefix}] Facility: Creating LockerUnits...`);

    // Create multiple locker units with variety for dashboard display
    const lockerUnitData = [
        // Available lockers (current month) - A100 to A105
        {
            resourceId: createdIds.resources[5], // A100
            schoolId: createdIds.school,
            isAvailable: true,
            createdAt: new Date() // Current month
        },
        {
            resourceId: createdIds.resources[6], // A101
            schoolId: createdIds.school,
            isAvailable: true,
            createdAt: new Date()
        },
        {
            resourceId: createdIds.resources[7], // A102
            schoolId: createdIds.school,
            isAvailable: true,
            createdAt: new Date()
        },
        {
            resourceId: createdIds.resources[8], // A103
            schoolId: createdIds.school,
            isAvailable: true,
            createdAt: new Date()
        },
        {
            resourceId: createdIds.resources[9], // A104
            schoolId: createdIds.school,
            isAvailable: true,
            createdAt: new Date()
        },
        // Used lockers (current month)
        {
            resourceId: createdIds.resources[10], // A105
            schoolId: createdIds.school,
            isAvailable: false,
            createdAt: new Date()
        },
        // Additional variety for better statistics
        {
            resourceId: createdIds.resources[5], // A100
            schoolId: createdIds.school,
            isAvailable: false,
            createdAt: new Date()
        },
        {
            resourceId: createdIds.resources[6], // A101
            schoolId: createdIds.school,
            isAvailable: false,
            createdAt: new Date()
        },
        // Last month lockers (for comparison)
        {
            resourceId: createdIds.resources[7], // A102
            schoolId: createdIds.school,
            isAvailable: false,
            createdAt: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 15)
        },
        {
            resourceId: createdIds.resources[8], // A103
            schoolId: createdIds.school,
            isAvailable: true,
            createdAt: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 20)
        },
        {
            resourceId: createdIds.resources[9], // A104
            schoolId: createdIds.school,
            isAvailable: false,
            createdAt: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 25)
        },
        // Two months ago lockers
        {
            resourceId: createdIds.resources[10], // A105
            schoolId: createdIds.school,
            isAvailable: true,
            createdAt: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 10)
        },
        {
            resourceId: createdIds.resources[5], // A100
            schoolId: createdIds.school,
            isAvailable: false,
            createdAt: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 15)
        },
        {
            resourceId: createdIds.resources[6], // A101
            schoolId: createdIds.school,
            isAvailable: true,
            createdAt: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 20)
        },
        // Additional variety for better statistics
        {
            resourceId: createdIds.resources[7], // A102
            schoolId: createdIds.school,
            isAvailable: false,
            createdAt: new Date()
        },
        {
            resourceId: createdIds.resources[8], // A103
            schoolId: createdIds.school,
            isAvailable: true,
            createdAt: new Date()
        },
        {
            resourceId: createdIds.resources[9], // A104
            schoolId: createdIds.school,
            isAvailable: false,
            createdAt: new Date()
        },
        {
            resourceId: createdIds.resources[10], // A105
            schoolId: createdIds.school,
            isAvailable: true,
            createdAt: new Date()
        }
    ];

    for (let i = 0; i < lockerUnitData.length; i++) {
        const lockerUnitRes = await apiCall('POST', '/api/locker-unit', lockerUnitData[i]);
        createdIds.lockerUnits.push(lockerUnitRes.data._id);
        console.log(`[${schoolPrefix}] ✅ Locker Unit created: ${lockerUnitData[i].isAvailable ? 'Available' : 'Used'} (${lockerUnitRes.data._id})`);
    }

    console.log(`[${schoolPrefix}] Facility: Creating ParkingLots...`);

    // Create multiple parking lots with variety for dashboard display
    const parkingLotData = [
        // Zone A parking lots
        {
            schoolId: createdIds.school,
            zone: "A",
            slotNumber: 1,
            active: true,
            createdAt: new Date()
        },
        {
            schoolId: createdIds.school,
            zone: "A",
            slotNumber: 2,
            active: true,
            createdAt: new Date()
        },
        {
            schoolId: createdIds.school,
            zone: "A",
            slotNumber: 3,
            active: false,
            createdAt: new Date()
        },
        {
            schoolId: createdIds.school,
            zone: "A",
            slotNumber: 4,
            active: true,
            createdAt: new Date()
        },
        {
            schoolId: createdIds.school,
            zone: "A",
            slotNumber: 5,
            active: false,
            createdAt: new Date()
        },
        // Zone B parking lots
        {
            schoolId: createdIds.school,
            zone: "B",
            slotNumber: 1,
            active: true,
            createdAt: new Date()
        },
        {
            schoolId: createdIds.school,
            zone: "B",
            slotNumber: 2,
            active: true,
            createdAt: new Date()
        },
        {
            schoolId: createdIds.school,
            zone: "B",
            slotNumber: 3,
            active: false,
            createdAt: new Date()
        },
        {
            schoolId: createdIds.school,
            zone: "B",
            slotNumber: 4,
            active: true,
            createdAt: new Date()
        },
        {
            schoolId: createdIds.school,
            zone: "B",
            slotNumber: 5,
            active: false,
            createdAt: new Date()
        },
        // Last month parking lots (for comparison)
        {
            schoolId: createdIds.school,
            zone: "A",
            slotNumber: 6,
            active: true,
            createdAt: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 10)
        },
        {
            schoolId: createdIds.school,
            zone: "A",
            slotNumber: 7,
            active: false,
            createdAt: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 15)
        },
        {
            schoolId: createdIds.school,
            zone: "B",
            slotNumber: 6,
            active: true,
            createdAt: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 20)
        },
        {
            schoolId: createdIds.school,
            zone: "B",
            slotNumber: 7,
            active: false,
            createdAt: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 25)
        }
    ];

    for (let i = 0; i < parkingLotData.length; i++) {
        const parkingLotRes = await apiCall('POST', '/api/parking-lot', parkingLotData[i]);
        createdIds.parkingLots.push(parkingLotRes.data._id);
        console.log(`[${schoolPrefix}] ✅ Parking Lot created: Zone ${parkingLotData[i].zone} Slot ${parkingLotData[i].slotNumber} - ${parkingLotData[i].active ? 'Active' : 'Inactive'} (${parkingLotRes.data._id})`);
    }

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

    console.log(`[${schoolPrefix}] Transportation: Creating Vehicles...`);

    // Generate unique timestamp for plate numbers
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp

    // Create bus for busSchedule
    const busData = {
        plateNumber: `${schoolPrefix}-BUS-${timestamp}`, // e.g., "APU-BUS-123456", "BPU-BUS-123456"
        type: "bus",
        capacity: 40,
        status: "available",
        schoolId: createdIds.school
    };
    const busRes = await apiCall('POST', '/api/vehicle', busData);
    createdIds.vehicles.push(busRes.data._id);

    // Create cars for eHailing
    const carData1 = {
        plateNumber: `${schoolPrefix}-CAR-${timestamp}-01`, // e.g., "APU-CAR-123456-01", "BPU-CAR-123456-01"
        type: "car",
        capacity: 4,
        status: "available",
        schoolId: createdIds.school
    };
    const carRes1 = await apiCall('POST', '/api/vehicle', carData1);
    createdIds.vehicles.push(carRes1.data._id);

    const carData2 = {
        plateNumber: `${schoolPrefix}-CAR-${timestamp}-02`, // e.g., "APU-CAR-123456-02", "BPU-CAR-123456-02"
        type: "car",
        capacity: 4,
        status: "available",
        schoolId: createdIds.school
    };
    const carRes2 = await apiCall('POST', '/api/vehicle', carData2);
    createdIds.vehicles.push(carRes2.data._id);

    const carData3 = {
        plateNumber: `${schoolPrefix}-CAR-${timestamp}-03`, // e.g., "APU-CAR-123456-03", "BPU-CAR-123456-03"
        type: "car",
        capacity: 4,
        status: "available",
        schoolId: createdIds.school
    };
    const carRes3 = await apiCall('POST', '/api/vehicle', carData3);
    createdIds.vehicles.push(carRes3.data._id);

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

    console.log(`[${schoolPrefix}] Transportation: Creating BusSchedules...`);

    // Create multiple bus schedules with different time slots and recurring patterns
    const busSchedulesData = [
        // Morning route - Monday to Friday
        {
            routeTiming: [
                {
                    routeId: createdIds.routes[0],
                    startTime: "07:30",
                    endTime: "08:00"  // Will be auto-calculated by controller
                }
            ],
            vehicleId: createdIds.vehicles[0], // Bus vehicle
            dayOfWeek: 1, // Monday
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
            active: true,
            schoolId: createdIds.school
        },
        {
            routeTiming: [
                {
                    routeId: createdIds.routes[0],
                    startTime: "08:00",
                    endTime: "08:30"  // Will be auto-calculated by controller
                }
            ],
            vehicleId: createdIds.vehicles[0], // Bus vehicle
            dayOfWeek: 1, // Monday
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            active: true,
            schoolId: createdIds.school
        },
        // Afternoon route - Monday to Friday
        {
            routeTiming: [
                {
                    routeId: createdIds.routes[0],
                    startTime: "12:00",
                    endTime: "12:30"  // Will be auto-calculated by controller
                }
            ],
            vehicleId: createdIds.vehicles[0], // Bus vehicle
            dayOfWeek: 1, // Monday
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            active: true,
            schoolId: createdIds.school
        },
        {
            routeTiming: [
                {
                    routeId: createdIds.routes[0],
                    startTime: "13:00",
                    endTime: "13:30"  // Will be auto-calculated by controller
                }
            ],
            vehicleId: createdIds.vehicles[0], // Bus vehicle
            dayOfWeek: 1, // Monday
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            active: true,
            schoolId: createdIds.school
        },
        // Evening route - Monday to Friday
        {
            routeTiming: [
                {
                    routeId: createdIds.routes[0],
                    startTime: "17:00",
                    endTime: "17:30"  // Will be auto-calculated by controller
                }
            ],
            vehicleId: createdIds.vehicles[0], // Bus vehicle
            dayOfWeek: 1, // Monday
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            active: true,
            schoolId: createdIds.school
        },
        {
            routeTiming: [
                {
                    routeId: createdIds.routes[0],
                    startTime: "18:00",
                    endTime: "18:30"  // Will be auto-calculated by controller
                }
            ],
            vehicleId: createdIds.vehicles[0], // Bus vehicle
            dayOfWeek: 1, // Monday
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            active: true,
            schoolId: createdIds.school
        },
        // Weekend route - Saturday only
        {
            routeTiming: [
                {
                    routeId: createdIds.routes[0],
                    startTime: "09:00",
                    endTime: "09:30"  // Will be auto-calculated by controller
                }
            ],
            vehicleId: createdIds.vehicles[0], // Bus vehicle
            dayOfWeek: 6, // Saturday
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            active: true,
            schoolId: createdIds.school
        },
        {
            routeTiming: [
                {
                    routeId: createdIds.routes[0],
                    startTime: "14:00",
                    endTime: "14:30"  // Will be auto-calculated by controller
                }
            ],
            vehicleId: createdIds.vehicles[0], // Bus vehicle
            dayOfWeek: 6, // Saturday
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            active: true,
            schoolId: createdIds.school
        }
    ];

    for (let i = 0; i < busSchedulesData.length; i++) {
        const busScheduleRes = await apiCall('POST', '/api/bus-schedule', busSchedulesData[i]);
        createdIds.busSchedules.push(busScheduleRes.data._id);
        console.log(`[${schoolPrefix}] ✅ Bus Schedule created: ${busSchedulesData[i].startTime} - ${busSchedulesData[i].endTime} (${busScheduleRes.data._id})`);
    }

    console.log(`[${schoolPrefix}] Transportation: Creating EHailing...`);
    const eHailingData = {
        studentId: createdIds.students[0],
        routeId: createdIds.routes[0],
        status: "waiting",
        requestAt: new Date().toISOString(),
        vehicleId: createdIds.vehicles[1], // Car vehicle (second vehicle)
        schoolId: createdIds.school
    };
    const eHailingRes = await apiCall('POST', '/api/e-hailing', eHailingData);
    createdIds.eHailings.push(eHailingRes.data._id);

    // 5. Service
    console.log(`[${schoolPrefix}] Service: Creating Feedback...`);

    // Create multiple varied feedback entries
    const feedbackEntries = [
        {
            studentId: createdIds.students[0],
            schoolId: createdIds.school,
            feedbackType: "complaint",
            priority: "High",
            message: "Air conditioning not working in the library. It's very hot and difficult to study.",
            status: "open"
        },
        {
            studentId: createdIds.students[1] || createdIds.students[0],
            schoolId: createdIds.school,
            feedbackType: "compliment",
            priority: "Low",
            message: "The new study rooms are excellent! Great addition to the campus.",
            status: "resolved"
        },
        {
            studentId: createdIds.students[2] || createdIds.students[0],
            schoolId: createdIds.school,
            feedbackType: "suggestion",
            priority: "Medium",
            message: "Would it be possible to extend the library hours during exam periods?",
            status: "in_progress"
        },
        {
            studentId: createdIds.students[3] || createdIds.students[0],
            schoolId: createdIds.school,
            feedbackType: "query",
            priority: "Low",
            message: "What are the operating hours for the computer lab during weekends?",
            status: "sent"
        },
        {
            studentId: createdIds.students[4] || createdIds.students[0],
            schoolId: createdIds.school,
            feedbackType: "issue",
            priority: "Urgent",
            message: "There's a broken window in Room 201 that needs immediate attention.",
            status: "open"
        },
        {
            studentId: createdIds.students[5] || createdIds.students[0],
            schoolId: createdIds.school,
            feedbackType: "complaint",
            priority: "Medium",
            message: "The cafeteria food quality has declined recently. Hoping for improvement.",
            status: "in_progress"
        },
        {
            studentId: createdIds.students[6] || createdIds.students[0],
            schoolId: createdIds.school,
            feedbackType: "suggestion",
            priority: "Low",
            message: "Consider adding more water fountains around the campus.",
            status: "sent"
        },
        {
            studentId: createdIds.students[7] || createdIds.students[0],
            schoolId: createdIds.school,
            feedbackType: "compliment",
            priority: "Medium",
            message: "The online course registration system is very user-friendly and efficient.",
            status: "resolved"
        },
        {
            studentId: createdIds.students[8] || createdIds.students[0],
            schoolId: createdIds.school,
            feedbackType: "issue",
            priority: "High",
            message: "WiFi connection is very slow in the student lounge area.",
            status: "open"
        },
        {
            studentId: createdIds.students[9] || createdIds.students[0],
            schoolId: createdIds.school,
            feedbackType: "query",
            priority: "Low",
            message: "When will the new sports facilities be available for student use?",
            status: "sent"
        }
    ];

    // Create all feedback entries
    for (const feedbackData of feedbackEntries) {
        const feedbackRes = await apiCall('POST', '/api/feedback', feedbackData);
        createdIds.feedbacks.push(feedbackRes.data._id);
        console.log(`[${schoolPrefix}] Created feedback: ${feedbackData.feedbackType} - ${feedbackData.priority} priority`);
    }

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
