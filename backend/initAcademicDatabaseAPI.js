import dotenv from 'dotenv';

dotenv.config();

// Helper function to add delay between API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Standardized error handling utility
const handleError = (operation, error, context = '', schoolPrefix = '') => {
    const prefix = schoolPrefix ? `[${schoolPrefix}] ` : '';
    const errorMessage = `${prefix}❌ Failed to ${operation}${context ? ` for ${context}` : ''}: ${error.message || error}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
};

// Utility function to generate unique student names
const generateUniqueStudentName = (schoolPrefix, studentIndex, intakeIndex, courseIndex) => {
    const firstNames = [
        "Ahmad", "Aisha", "Ali", "Aminah", "Amir", "Anisa", "Arif", "Azizah", "Bilal", "Diana",
        "Elena", "Fadil", "Fatima", "Hassan", "Huda", "Ibrahim", "Iman", "Jamal", "Khadijah", "Layla",
        "Malik", "Mariam", "Nabil", "Nadia", "Omar", "Rania", "Rashid", "Sara", "Tariq", "Yasmin",
        "Zainab", "Zakir", "Alya", "Bakar", "Camelia", "Danish", "Ehsan", "Farah", "Ghazal", "Hakim",
        "Iqbal", "Jasmine", "Karim", "Laila", "Mahmoud", "Noor", "Othman", "Parveen", "Qasim", "Rashida"
    ];

    const lastNames = [
        "Abdullah", "Ahmad", "Ali", "Bakar", "Chowdhury", "Das", "Fernandez", "Garcia", "Hassan", "Ibrahim",
        "Jamil", "Khan", "Lee", "Mahmood", "Nguyen", "Omar", "Patel", "Qureshi", "Rahman", "Singh",
        "Tan", "Uddin", "Verma", "Wong", "Xavier", "Yusuf", "Zaman", "Ahmed", "Begum", "Chowdhury",
        "Das", "Fernandez", "Garcia", "Hassan", "Ibrahim", "Jamil", "Khan", "Lee", "Mahmood", "Nguyen"
    ];

    // Use a combination of indices to ensure uniqueness
    const firstNameIndex = (studentIndex + intakeIndex * 10 + courseIndex * 5) % firstNames.length;
    const lastNameIndex = (studentIndex + intakeIndex * 7 + courseIndex * 3) % lastNames.length;

    const firstName = firstNames[firstNameIndex];
    const lastName = lastNames[lastNameIndex];

    // Add a unique identifier to prevent any potential duplicates
    const uniqueId = `${schoolPrefix}_${intakeIndex}_${courseIndex}_${studentIndex}`;

    return {
        fullName: `${firstName} ${lastName}`,
        uniqueId: uniqueId
    };
};

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
        semesterModules: [],
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

    console.log(`==============================`);

    // 1. Create Users (Admins, Lecturers, Students)
    console.log(`[${schoolPrefix}] 1. Creating Users...`);
    const usersData = [
        // Admins
        {
            name: `${schoolPrefix} Admin User`,
            email: schoolPrefix === "APU" ? "schooltestacc818@gmail.com" : `admin@${schoolEmailDomain}`,
            password: "P@ssw0rd$$",
            phoneNumber: adminPhoneBase + 0,
            role: "schoolAdmin",
            twoFA_enabled: false
        },
        {
            name: `${schoolPrefix} Second Admin`,
            email: `admin2@${schoolEmailDomain}`,
            password: "P@ssw0rd$$",
            phoneNumber: adminPhoneBase + 1,
            role: "schoolAdmin",
            twoFA_enabled: false
        },
        // Company Admin
        {
            name: "Company Admin",
            email: "acampushub@gmail.com",
            password: "P@ssw0rd$$",
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
        console.log(`[${schoolPrefix}] ✅ ${role} user created: ${usersData[i].email} ${usersData[i].password} (${userResponse.data._id})`);
        await new Promise(res => setTimeout(res, 150)); // 150ms delay
    }

    // 2. Create School
    console.log(`[${schoolPrefix}] 2. Creating School...`);
    const schoolData = {
        userId: createdIds.users.schoolAdmin[0],
        name: schoolName,
        prefix: schoolPrefix,
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
        // Add the _id to the coursesData array for later use
        coursesData[i]._id = courseResponse.data._id;
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

    // Generate comprehensive modules for Computer Science course with proper prerequisites
    let csModules = [];

    // First, create foundation modules (no prerequisites)
    const foundationModules = [
        {
            moduleName: "Introduction to Programming",
            code: "CS101",
            totalCreditHours: 3,
            courseId: [createdIds.courses[0]], // BCS course
            prerequisites: [],
            moduleDescription: "Fundamentals of programming concepts and logic",
            learningOutcomes: [
                "Understand basic programming concepts",
                "Write simple programs",
                "Use control structures and functions"
            ],
            assessmentMethods: ["exam", "assignment"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "Mathematics for Computing",
            code: "CS102",
            totalCreditHours: 3,
            courseId: [createdIds.courses[0]], // BCS course
            prerequisites: [],
            moduleDescription: "Mathematical foundations for computer science",
            learningOutcomes: [
                "Apply mathematical concepts",
                "Solve computational problems",
                "Use mathematical tools"
            ],
            assessmentMethods: ["exam", "assignment"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "Computer Architecture",
            code: "CS103",
            totalCreditHours: 3,
            courseId: [createdIds.courses[0]], // BCS course
            prerequisites: [],
            moduleDescription: "Understanding computer hardware and organization",
            learningOutcomes: [
                "Understand computer components",
                "Analyze system performance",
                "Design simple circuits"
            ],
            assessmentMethods: ["exam", "lab"],
            isActive: true,
            schoolId: createdIds.school
        }
    ];

    // Create foundation modules first
    for (const moduleData of foundationModules) {
        try {
            const moduleResponse = await apiCall('POST', '/api/module', moduleData);
            if (moduleResponse.success) {
                csModules.push(moduleResponse.data._id);
                console.log(`[${schoolPrefix}] ✅ Created foundation module: ${moduleData.code}`);
            } else {
                console.warn(`[${schoolPrefix}] ⚠️ Failed to create foundation module ${moduleData.code}: ${moduleResponse.message}`);
            }
        } catch (error) {
            handleError('create foundation module', error, `module ${moduleData.code}`, schoolPrefix);
        }
    }

    // Now create intermediate modules with prerequisites
    const intermediateModules = [
        {
            moduleName: "Object-Oriented Programming",
            code: "CS201",
            totalCreditHours: 3,
            courseId: [createdIds.courses[0]], // BCS course
            prerequisites: [csModules[0]], // CS101
            moduleDescription: "Advanced programming with OOP principles",
            learningOutcomes: [
                "Implement OOP concepts",
                "Design class hierarchies",
                "Use inheritance and polymorphism"
            ],
            assessmentMethods: ["exam", "project"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "Data Structures",
            code: "CS202",
            totalCreditHours: 3,
            courseId: [createdIds.courses[0]], // BCS course
            prerequisites: [csModules[0]], // CS101
            moduleDescription: "Fundamental data structures and algorithms",
            learningOutcomes: [
                "Implement basic data structures",
                "Analyze algorithm complexity",
                "Choose appropriate structures"
            ],
            assessmentMethods: ["exam", "assignment"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "Digital Logic Design",
            code: "CS203",
            totalCreditHours: 3,
            courseId: [createdIds.courses[0]], // BCS course
            prerequisites: [csModules[1]], // CS102
            moduleDescription: "Digital circuit design and Boolean algebra",
            learningOutcomes: [
                "Design digital circuits",
                "Use Boolean algebra",
                "Implement logic gates"
            ],
            assessmentMethods: ["exam", "lab"],
            isActive: true,
            schoolId: createdIds.school
        }
    ];

    // Create intermediate modules
    for (const moduleData of intermediateModules) {
        try {
            const moduleResponse = await apiCall('POST', '/api/module', moduleData);
            if (moduleResponse.success) {
                csModules.push(moduleResponse.data._id);
                console.log(`[${schoolPrefix}] ✅ Created intermediate module: ${moduleData.code}`);
            } else {
                console.warn(`[${schoolPrefix}] ⚠️ Failed to create intermediate module ${moduleData.code}: ${moduleResponse.message}`);
            }
        } catch (error) {
            handleError('create intermediate module', error, `module ${moduleData.code}`, schoolPrefix);
        }
    }

    // Create advanced modules with multiple prerequisites
    const advancedModules = [
        {
            moduleName: "Advanced Data Structures & Algorithms",
            code: "CS301",
            totalCreditHours: 4,
            courseId: [createdIds.courses[0]], // BCS course
            prerequisites: [csModules[4]], // CS202 (Data Structures)
            moduleDescription: "Complex data structures and algorithm analysis",
            learningOutcomes: [
                "Implement advanced data structures",
                "Analyze algorithm efficiency",
                "Solve complex problems"
            ],
            assessmentMethods: ["exam", "project"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "Computer Networks",
            code: "CS302",
            totalCreditHours: 3,
            courseId: [createdIds.courses[0]], // BCS course
            prerequisites: [csModules[2]], // CS203 (Computer Architecture)
            moduleDescription: "Network protocols and communication",
            learningOutcomes: [
                "Understand network protocols",
                "Configure network devices",
                "Troubleshoot network issues"
            ],
            assessmentMethods: ["exam", "lab"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "Database Systems",
            code: "CS303",
            totalCreditHours: 3,
            courseId: [createdIds.courses[0]], // BCS course
            prerequisites: [csModules[0]], // CS101 (Programming)
            moduleDescription: "Database design and management",
            learningOutcomes: [
                "Design relational databases",
                "Write SQL queries",
                "Normalize database schemas"
            ],
            assessmentMethods: ["exam", "project"],
            isActive: true,
            schoolId: createdIds.school
        }
    ];

    // Create advanced modules
    for (const moduleData of advancedModules) {
        try {
            const moduleResponse = await apiCall('POST', '/api/module', moduleData);
            if (moduleResponse.success) {
                csModules.push(moduleResponse.data._id);
                console.log(`[${schoolPrefix}] ✅ Created advanced module: ${moduleData.code}`);
            } else {
                console.warn(`[${schoolPrefix}] ⚠️ Failed to create advanced module ${moduleData.code}: ${moduleResponse.message}`);
            }
        } catch (error) {
            handleError('create advanced module', error, `module ${moduleData.code}`, schoolPrefix);
        }
    }

    console.log(`[${schoolPrefix}] ✅ Created ${csModules.length} CS modules with proper prerequisites`);

    // 8.5. Create IT Modules with staged approach (similar to CS modules)
    console.log(`[${schoolPrefix}] 8.5. Creating IT Modules with staged approach...`);

    let itModules = [];

    // First, create foundation IT modules (no prerequisites)
    const itFoundationModules = [
        {
            moduleName: "Introduction to Information Technology",
            code: "IT101",
            totalCreditHours: 3,
            courseId: [createdIds.courses[1]], // BIT course
            prerequisites: [],
            moduleDescription: "Fundamentals of IT concepts and systems",
            learningOutcomes: [
                "Understand basic IT concepts",
                "Identify IT components",
                "Use basic IT tools"
            ],
            assessmentMethods: ["exam", "assignment"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "IT Mathematics",
            code: "IT102",
            totalCreditHours: 3,
            courseId: [createdIds.courses[1]], // BIT course
            prerequisites: [],
            moduleDescription: "Mathematical foundations for IT",
            learningOutcomes: [
                "Apply mathematical concepts",
                "Solve IT-related problems",
                "Use mathematical tools"
            ],
            assessmentMethods: ["exam", "assignment"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "Computer Systems",
            code: "IT103",
            totalCreditHours: 3,
            courseId: [createdIds.courses[1]], // BIT course
            prerequisites: [],
            moduleDescription: "Understanding computer systems and hardware",
            learningOutcomes: [
                "Understand computer components",
                "Analyze system performance",
                "Configure basic systems"
            ],
            assessmentMethods: ["exam", "lab"],
            isActive: true,
            schoolId: createdIds.school
        }
    ];

    // Create IT foundation modules first
    for (const moduleData of itFoundationModules) {
        try {
            const moduleResponse = await apiCall('POST', '/api/module', moduleData);
            if (moduleResponse.success) {
                itModules.push(moduleResponse.data._id);
                console.log(`[${schoolPrefix}] ✅ Created IT foundation module: ${moduleData.code}`);
            } else {
                console.warn(`[${schoolPrefix}] ⚠️ Failed to create IT foundation module ${moduleData.code}: ${moduleResponse.message}`);
            }
        } catch (error) {
            handleError('create IT foundation module', error, `module ${moduleData.code}`, schoolPrefix);
        }
    }

    // Now create intermediate IT modules with prerequisites
    const itIntermediateModules = [
        {
            moduleName: "Programming Fundamentals",
            code: "IT104",
            totalCreditHours: 3,
            courseId: [createdIds.courses[1]], // BIT course
            prerequisites: [itModules[0]], // IT101
            moduleDescription: "Basic programming concepts for IT",
            learningOutcomes: [
                "Write simple programs",
                "Use control structures",
                "Debug basic code"
            ],
            assessmentMethods: ["exam", "assignment"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "Data Management",
            code: "IT105",
            totalCreditHours: 3,
            courseId: [createdIds.courses[1]], // BIT course
            prerequisites: [itModules[0]], // IT101
            moduleDescription: "Data organization and management",
            learningOutcomes: [
                "Organize data structures",
                "Manage databases",
                "Implement data security"
            ],
            assessmentMethods: ["exam", "project"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "Network Fundamentals",
            code: "IT106",
            totalCreditHours: 3,
            courseId: [createdIds.courses[1]], // BIT course
            prerequisites: [itModules[2]], // IT103
            moduleDescription: "Basic networking concepts",
            learningOutcomes: [
                "Understand network protocols",
                "Configure basic networks",
                "Troubleshoot network issues"
            ],
            assessmentMethods: ["exam", "lab"],
            isActive: true,
            schoolId: createdIds.school
        }
    ];

    // Create IT intermediate modules
    for (const moduleData of itIntermediateModules) {
        try {
            const moduleResponse = await apiCall('POST', '/api/module', moduleData);
            if (moduleResponse.success) {
                itModules.push(moduleResponse.data._id);
                console.log(`[${schoolPrefix}] ✅ Created IT intermediate module: ${moduleData.code}`);
            } else {
                console.warn(`[${schoolPrefix}] ⚠️ Failed to create IT intermediate module ${moduleData.code}: ${moduleResponse.message}`);
            }
        } catch (error) {
            handleError('create IT intermediate module', error, `module ${moduleData.code}`, schoolPrefix);
        }
    }

    // Create advanced IT modules with prerequisites
    const itAdvancedModules = [
        {
            moduleName: "System Administration",
            code: "IT201",
            totalCreditHours: 3,
            courseId: [createdIds.courses[1]], // BIT course
            prerequisites: [itModules[2], itModules[5]], // IT103, IT106
            moduleDescription: "Operating system administration",
            learningOutcomes: [
                "Manage system resources",
                "Configure user accounts",
                "Maintain system security"
            ],
            assessmentMethods: ["exam", "lab"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "Network Administration",
            code: "IT202",
            totalCreditHours: 3,
            courseId: [createdIds.courses[1]], // BIT course
            prerequisites: [itModules[5]], // IT106
            moduleDescription: "Advanced network management",
            learningOutcomes: [
                "Configure network devices",
                "Implement security policies",
                "Monitor network performance"
            ],
            assessmentMethods: ["exam", "lab"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "Web Application Development",
            code: "IT203",
            totalCreditHours: 3,
            courseId: [createdIds.courses[1]], // BIT course
            prerequisites: [itModules[3]], // IT104
            moduleDescription: "Full-stack web development",
            learningOutcomes: [
                "Build web applications",
                "Use modern frameworks",
                "Deploy web services"
            ],
            assessmentMethods: ["exam", "project"],
            isActive: true,
            schoolId: createdIds.school
        }
    ];

    // Create IT advanced modules
    for (const moduleData of itAdvancedModules) {
        try {
            const moduleResponse = await apiCall('POST', '/api/module', moduleData);
            if (moduleResponse.success) {
                itModules.push(moduleResponse.data._id);
                console.log(`[${schoolPrefix}] ✅ Created IT advanced module: ${moduleData.code}`);
            } else {
                console.warn(`[${schoolPrefix}] ⚠️ Failed to create IT advanced module ${moduleData.code}: ${moduleResponse.message}`);
            }
        } catch (error) {
            handleError('create IT advanced module', error, `module ${moduleData.code}`, schoolPrefix);
        }
    }

    // Create specialized IT modules
    const itSpecializedModules = [
        {
            moduleName: "IT Project Management",
            code: "IT204",
            totalCreditHours: 3,
            courseId: [createdIds.courses[1]], // BIT course
            prerequisites: [itModules[8]], // IT203
            moduleDescription: "Project management for IT projects",
            learningOutcomes: [
                "Plan IT projects",
                "Manage project timelines",
                "Coordinate team efforts"
            ],
            assessmentMethods: ["exam", "project"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "IT Security",
            code: "IT205",
            totalCreditHours: 3,
            courseId: [createdIds.courses[1]], // BIT course
            prerequisites: [itModules[6]], // IT201
            moduleDescription: "Information security principles",
            learningOutcomes: [
                "Implement security measures",
                "Conduct security audits",
                "Protect information assets"
            ],
            assessmentMethods: ["exam", "project"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "Cloud Infrastructure",
            code: "IT206",
            totalCreditHours: 3,
            courseId: [createdIds.courses[1]], // BIT course
            prerequisites: [itModules[6]], // IT201
            moduleDescription: "Cloud computing and virtualization",
            learningOutcomes: [
                "Deploy cloud services",
                "Manage virtual machines",
                "Optimize cloud resources"
            ],
            assessmentMethods: ["exam", "lab"],
            isActive: true,
            schoolId: createdIds.school
        }
    ];

    // Create IT specialized modules
    for (const moduleData of itSpecializedModules) {
        try {
            const moduleResponse = await apiCall('POST', '/api/module', moduleData);
            if (moduleResponse.success) {
                itModules.push(moduleResponse.data._id);
                console.log(`[${schoolPrefix}] ✅ Created IT specialized module: ${moduleData.code}`);
            } else {
                console.warn(`[${schoolPrefix}] ⚠️ Failed to create IT specialized module ${moduleData.code}: ${moduleResponse.message}`);
            }
        } catch (error) {
            handleError('create IT specialized module', error, `module ${moduleData.code}`, schoolPrefix);
        }
    }

    // Create capstone IT modules
    const itCapstoneModules = [
        {
            moduleName: "IT Capstone Project I",
            code: "IT301",
            totalCreditHours: 6,
            courseId: [createdIds.courses[1]], // BIT course
            prerequisites: [itModules[9], itModules[10]], // IT204, IT205
            moduleDescription: "Major IT project planning",
            learningOutcomes: [
                "Plan complex IT projects",
                "Apply technical skills",
                "Design system solutions"
            ],
            assessmentMethods: ["project", "presentation"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "IT Strategy",
            code: "IT302",
            totalCreditHours: 3,
            courseId: [createdIds.courses[1]], // BIT course
            prerequisites: [itModules[9]], // IT204
            moduleDescription: "Strategic IT planning",
            learningOutcomes: [
                "Develop IT strategies",
                "Align IT with business",
                "Plan technology roadmaps"
            ],
            assessmentMethods: ["exam", "project"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "Advanced Security",
            code: "IT303",
            totalCreditHours: 3,
            courseId: [createdIds.courses[1]], // BIT course
            prerequisites: [itModules[10]], // IT205
            moduleDescription: "Advanced cybersecurity",
            learningOutcomes: [
                "Implement advanced security",
                "Conduct penetration testing",
                "Respond to security incidents"
            ],
            assessmentMethods: ["exam", "project"],
            isActive: true,
            schoolId: createdIds.school
        }
    ];

    // Create IT capstone modules
    for (const moduleData of itCapstoneModules) {
        try {
            const moduleResponse = await apiCall('POST', '/api/module', moduleData);
            if (moduleResponse.success) {
                itModules.push(moduleResponse.data._id);
                console.log(`[${schoolPrefix}] ✅ Created IT capstone module: ${moduleData.code}`);
            } else {
                console.warn(`[${schoolPrefix}] ⚠️ Failed to create IT capstone module ${moduleData.code}: ${moduleResponse.message}`);
            }
        } catch (error) {
            handleError('create IT capstone module', error, `module ${moduleData.code}`, schoolPrefix);
        }
    }

    console.log(`[${schoolPrefix}] ✅ Created ${itModules.length} IT modules with proper prerequisites`);

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

    // 9.5. Create Additional Modules for September 2024 Intake (CS Course)
    console.log(`[${schoolPrefix}] 9.5. Creating Additional Modules for September 2024 Intake...`);

    // Create additional CS modules for the September 2024 intake (third intake course)
    let septemberCSModules = [];

    // Create foundation modules for September intake
    const septemberFoundationModules = [
        {
            moduleName: "Introduction to Programming (September)",
            code: "CS101-SEP",
            totalCreditHours: 3,
            courseId: [createdIds.courses[0]], // BCS course
            prerequisites: [],
            moduleDescription: "Fundamentals of programming concepts and logic - September Intake",
            learningOutcomes: [
                "Understand basic programming concepts",
                "Write simple programs",
                "Use control structures and functions"
            ],
            assessmentMethods: ["exam", "assignment"],
            isActive: true,
            schoolId: createdIds.school
        },
        {
            moduleName: "Mathematics for Computing (September)",
            code: "CS102-SEP",
            totalCreditHours: 3,
            courseId: [createdIds.courses[0]], // BCS course
            prerequisites: [],
            moduleDescription: "Mathematical foundations for computer science - September Intake",
            learningOutcomes: [
                "Apply mathematical concepts",
                "Solve computational problems",
                "Use mathematical tools"
            ],
            assessmentMethods: ["exam", "assignment"],
            isActive: true,
            schoolId: createdIds.school
        }
    ];

    // Create September foundation modules
    for (const moduleData of septemberFoundationModules) {
        try {
            const moduleResponse = await apiCall('POST', '/api/module', moduleData);
            if (moduleResponse.success) {
                septemberCSModules.push(moduleResponse.data._id);
                console.log(`[${schoolPrefix}] ✅ Created September CS foundation module: ${moduleData.code}`);
            } else {
                console.warn(`[${schoolPrefix}] ⚠️ Failed to create September CS foundation module ${moduleData.code}: ${moduleResponse.message}`);
            }
        } catch (error) {
            handleError('create September CS foundation module', error, `module ${moduleData.code}`, schoolPrefix);
        }
    }

    console.log(`[${schoolPrefix}] ✅ Created ${septemberCSModules.length} September CS modules`);

    // 10. Create Semesters
    console.log(`[${schoolPrefix}] 10. Creating Semesters...`);

    // Generate semesters for each intake course (maximum 7 semesters to fit within 36-month duration)
    // Each semester is linked to a specific intake course via intakeCourseId, not directly to a course
    // This allows for different semester schedules for different intakes of the same course
    for (let intakeCourseIndex = 0; intakeCourseIndex < intakeCoursesData.length; intakeCourseIndex++) {
        const intakeCourseData = intakeCoursesData[intakeCourseIndex];
        const courseData = coursesData.find(c => c._id === intakeCourseData.courseId);
        const intakeCourseId = createdIds.intakeCourses[intakeCourseIndex];

        // Calculate maximum semesters based on course duration
        const courseDurationMonths = 36; // Course duration in months
        const semesterDurationMonths = 4.5; // Each semester is approximately 4.5 months
        const maxSemesters = Math.floor(courseDurationMonths / semesterDurationMonths); // Maximum 8 semesters, but limit to 7 for safety

        const totalYears = Math.ceil(maxSemesters / 2); // Calculate years needed
        const semestersPerYear = 2; // 2 semesters per year

        console.log(`[${schoolPrefix}] Creating up to ${maxSemesters} semesters for ${courseData.courseName} (${totalYears} years, ${courseDurationMonths} months total)...`);

        for (let year = 1; year <= totalYears; year++) {
            for (let semesterInYear = 1; semesterInYear <= semestersPerYear; semesterInYear++) {
                // Calculate overall semester number (1-7)
                const semesterNumber = (year - 1) * 2 + semesterInYear;

                // Validate semester number constraints from the model
                if (semesterNumber < 1) {
                    console.log(`[${schoolPrefix}] ⚠️ Skipping semester - invalid semester number: ${semesterNumber}`);
                    continue;
                }

                // Stop if we've reached the maximum semesters
                if (semesterNumber > maxSemesters) {
                    console.log(`[${schoolPrefix}] ✅ Reached maximum semesters (${maxSemesters}) for ${courseData.courseName}`);
                    break;
                }

                // If we've reached max semesters, break out of both loops
                if (semesterNumber > maxSemesters) {
                    break;
                }

                // Calculate dates based on year and semester
                const baseYear = 2024;
                const yearOffset = year - 1;
                const isFirstSemester = semesterInYear === 1;

                // Adjust semester duration to fit within 36-month course duration
                // Each semester should be approximately 4.5 months (36 months / 8 semesters)
                const semesterDuration = 4.5; // months

                // First semester: Feb-Jun (5 months), Second semester: Jul-Nov (5 months)
                // But adjust to fit within course duration constraints
                const startMonth = isFirstSemester ? 1 : 6; // Feb = 1, Jul = 6
                const endMonth = isFirstSemester ? 5 : 10;   // Jun = 5, Nov = 10

                // Calculate semester dates with proper duration
                const startDate = new Date(baseYear + yearOffset, startMonth, 1);
                const endDate = new Date(baseYear + yearOffset, endMonth, 30);

                // Ensure end date is after start date
                if (endDate <= startDate) {
                    console.log(`[${schoolPrefix}] ⚠️ Skipping semester ${semesterNumber} - invalid date range`);
                    continue;
                }

                // Exam dates (last 2 weeks of semester)
                const examStartDate = new Date(baseYear + yearOffset, endMonth, 1);
                const examEndDate = new Date(baseYear + yearOffset, endMonth, 15);

                // Ensure exam dates are within semester dates
                if (examStartDate < startDate || examEndDate > endDate) {
                    console.log(`[${schoolPrefix}] ⚠️ Skipping semester ${semesterNumber} - exam dates outside semester range`);
                    continue;
                }

                // Validate semester duration against course duration
                const semesterStart = new Date(startDate);
                const semesterEnd = new Date(endDate);
                const semesterDurationMs = semesterEnd - semesterStart;
                const semesterDurationMonths = semesterDurationMs / (1000 * 60 * 60 * 24 * 30.44); // Approximate months

                // Check if this semester would exceed course duration
                const totalSemesterDuration = (semesterNumber - 1) * 4.5 + semesterDurationMonths;
                if (totalSemesterDuration > courseDurationMonths) {
                    console.log(`[${schoolPrefix}] ⚠️ Skipping semester ${semesterNumber} - would exceed course duration (${totalSemesterDuration.toFixed(1)} months > ${courseDurationMonths} months)`);
                    continue; // Skip this semester
                }

                // Validate all required fields before creating semester
                if (!intakeCourseId || !semesterNumber || !year || !startDate || !endDate || !examStartDate || !examEndDate || !createdIds.school) {
                    console.error(`[${schoolPrefix}] ❌ Missing required fields for semester ${semesterNumber}:`, {
                        intakeCourseId, semesterNumber, year, startDate, endDate, examStartDate, examEndDate, schoolId: createdIds.school
                    });
                    continue;
                }

                const semesterData = {
                    intakeCourseId: intakeCourseId,
                    semesterNumber: semesterNumber,
                    year: year,
                    semesterName: `Year ${year} Semester ${semesterInYear}`,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    examStartDate: examStartDate.toISOString(),
                    examEndDate: examEndDate.toISOString(),
                    status: year === 1 && semesterInYear === 1 ? "in_progress" : "upcoming",
                    isActive: true,
                    schoolId: createdIds.school
                };

                try {
                    const semesterResponse = await apiCall('POST', '/api/semester', semesterData);
                    if (semesterResponse.success) {
                        createdIds.semesters.push(semesterResponse.data._id);
                        console.log(`[${schoolPrefix}] ✅ Semester created: ${semesterData.semesterName} for ${courseData.courseCode} (${semesterResponse.data._id})`);
                    } else {
                        console.warn(`[${schoolPrefix}] ⚠️ Failed to create semester: ${semesterResponse.message}`);
                    }
                } catch (error) {
                    handleError('create semester', error, `semester ${semesterData.semesterName} for ${courseData.courseCode}`, schoolPrefix);
                }
            }
        }
    }

    // Log semester creation summary
    console.log(`[${schoolPrefix}] 📊 Semester Creation Summary:`);
    console.log(`[${schoolPrefix}] ✅ Total semesters created: ${createdIds.semesters.length}`);
    console.log(`[${schoolPrefix}] ✅ Semesters per intake course: ${Math.floor(createdIds.semesters.length / intakeCoursesData.length)}`);
    console.log(`[${schoolPrefix}] ✅ Each semester properly linked to intakeCourseId`);

    // 10.5. Create Semester Modules (Assign modules to semesters)
    // This section creates the many-to-many relationship between semesters and modules
    // Modules are strategically distributed based on academic progression:
    // - Semesters 1-2: Foundation modules (basic concepts, assignments, quizzes) - Academic Year 1
    // - Semesters 3-4: Intermediate modules (problem-solving, mix of assessment methods) - Academic Year 2
    // - Semesters 5-6: Advanced modules (analytical skills, projects, presentations) - Academic Year 3
    // - Semesters 7: Capstone modules (integration, real-world applications) - Academic Year 4
    console.log(`[${schoolPrefix}] 10.5. Creating Semester Modules...`);

    // Create semester modules for each intake course
    for (let intakeCourseIndex = 0; intakeCourseIndex < intakeCoursesData.length; intakeCourseIndex++) {
        const intakeCourseData = intakeCoursesData[intakeCourseIndex];
        const courseData = coursesData.find(c => c._id === intakeCourseData.courseId);
        const intakeCourseId = createdIds.intakeCourses[intakeCourseIndex];

        // Get modules for this specific intake course
        let courseModules = [];
        if (courseData.courseCode === 'BCS') {
            // For BCS course, assign modules based on intake course index
            if (intakeCourseIndex === 0) {
                // January 2024 intake (first intake course) - use original CS modules
                courseModules = csModules;
            } else if (intakeCourseIndex === 2) {
                // September 2024 intake (third intake course) - use September CS modules
                courseModules = septemberCSModules;
            } else {
                // May 2024 intake (second intake course) - use original CS modules
                courseModules = csModules;
            }
        } else if (courseData.courseCode === 'BIT') {
            // For BIT course, use IT modules (only one intake course for IT)
            courseModules = itModules;
        }

        // Validate that we have modules for this course
        if (!courseModules || courseModules.length === 0) {
            console.log(`[${schoolPrefix}] ⚠️ No modules found for course ${courseData.courseCode} (${courseData.courseName}), skipping...`);
            continue;
        }

        // Get semesters for this intake course
        const courseSemesters = createdIds.semesters.slice(intakeCourseIndex * 7, (intakeCourseIndex + 1) * 7);

        // Validate that we have semesters for this course
        if (!courseSemesters || courseSemesters.length === 0) {
            console.log(`[${schoolPrefix}] ⚠️ No semesters found for course ${courseData.courseCode} (${courseData.courseName}), skipping...`);
            continue;
        }

        console.log(`[${schoolPrefix}] 📚 Assigning ${courseModules.length} ${courseData.courseCode} modules to ${courseSemesters.length} semesters for ${courseData.courseName}...`);

        // Distribute modules strategically across semesters based on academic progression
        for (let semesterIndex = 0; semesterIndex < courseSemesters.length; semesterIndex++) {
            const semesterId = courseSemesters[semesterIndex];
            const semesterNumber = semesterIndex + 1;

            // Strategic module distribution based on semester level and available modules
            let semesterModules = [];
            const modulesPerSemester = Math.ceil(courseModules.length / courseSemesters.length);

            if (semesterNumber === 1) {
                // First semester: Foundation modules (first 3-4 modules)
                semesterModules = courseModules.slice(0, Math.min(4, courseModules.length));
            } else if (semesterNumber === 2) {
                // Second semester: Basic modules (next 3-4 modules)
                semesterModules = courseModules.slice(4, Math.min(8, courseModules.length));
            } else if (semesterNumber === 3) {
                // Third semester: Intermediate modules
                semesterModules = courseModules.slice(8, Math.min(12, courseModules.length));
            } else if (semesterNumber === 4) {
                // Fourth semester: Advanced intermediate modules
                semesterModules = courseModules.slice(12, Math.min(16, courseModules.length));
            } else if (semesterNumber === 5) {
                // Fifth semester: Advanced modules
                semesterModules = courseModules.slice(16, Math.min(20, courseModules.length));
            } else if (semesterNumber === 6) {
                // Sixth semester: Specialized modules
                semesterModules = courseModules.slice(20, Math.min(24, courseModules.length));
            } else if (semesterNumber === 7) {
                // Seventh semester: Capstone and final modules
                semesterModules = courseModules.slice(24, courseModules.length);
            }

            // Ensure we don't exceed available modules and distribute evenly if needed
            if (semesterModules.length === 0) {
                const startIndex = (semesterIndex * modulesPerSemester) % courseModules.length;
                const endIndex = Math.min(startIndex + modulesPerSemester, courseModules.length);
                semesterModules = courseModules.slice(startIndex, endIndex);
                console.log(`[${schoolPrefix}] 🔄 Fallback distribution: ${semesterModules.length} modules for Semester ${semesterNumber}`);
            }

            // Additional validation: ensure all assigned modules are within bounds
            semesterModules = semesterModules.filter(moduleId => {
                if (!courseModules.includes(moduleId)) {
                    console.log(`[${schoolPrefix}] ⚠️ Module ${moduleId} is out of bounds for ${courseData.courseCode} course, removing...`);
                    return false;
                }
                return true;
            });

            console.log(`[${schoolPrefix}] 📋 Semester ${semesterNumber}: ${semesterModules.length} modules assigned`);

            // Skip if no modules assigned to this semester
            if (semesterModules.length === 0) {
                console.log(`[${schoolPrefix}] ⚠️ No modules assigned to Semester ${semesterNumber}, skipping...`);
                continue;
            }

            // Create semester module relationships
            for (const moduleId of semesterModules) {
                // Validate that this module is actually available for this intake course
                if (!courseModules.includes(moduleId)) {
                    console.log(`[${schoolPrefix}] ⚠️ Module ${moduleId} is not available for ${courseData.courseCode} course, skipping...`);
                    continue;
                }

                // Generate realistic semester module data based on semester level
                const customAssessmentMethods = [];

                // Assessment methods vary by semester level
                if (semesterNumber <= 2) {
                    // Foundation semesters: More assignments and quizzes
                    customAssessmentMethods.push('assignment', 'quiz');
                    if (Math.random() > 0.5) customAssessmentMethods.push('presentation');
                } else if (semesterNumber <= 4) {
                    // Intermediate semesters: Mix of methods
                    customAssessmentMethods.push('assignment', 'exam');
                    if (Math.random() > 0.3) customAssessmentMethods.push('project');
                    if (Math.random() > 0.4) customAssessmentMethods.push('presentation');
                } else if (semesterNumber <= 6) {
                    // Advanced semesters: More projects and presentations
                    customAssessmentMethods.push('project', 'assignment');
                    if (Math.random() > 0.2) customAssessmentMethods.push('exam');
                    if (Math.random() > 0.3) customAssessmentMethods.push('presentation');
                } else {
                    // Capstone semesters: Focus on projects and presentations
                    customAssessmentMethods.push('project', 'presentation');
                    if (Math.random() > 0.4) customAssessmentMethods.push('assignment');
                }

                // Generate meaningful notes and requirements
                const semesterLevel = semesterNumber <= 2 ? 'Foundation' :
                    semesterNumber <= 4 ? 'Intermediate' :
                        semesterNumber <= 6 ? 'Advanced' : 'Capstone';

                const notes = `${semesterLevel} level module for ${courseData.courseName} Semester ${semesterNumber}`;

                const requirements = semesterNumber <= 2 ?
                    `Basic understanding required. Focus on fundamental concepts and practical applications.` :
                    semesterNumber <= 4 ?
                        `Intermediate knowledge expected. Emphasis on problem-solving and analytical skills.` :
                        semesterNumber <= 6 ?
                            `Advanced concepts covered. Requires strong analytical and critical thinking abilities.` :
                            `Capstone level. Integration of all previous knowledge with real-world applications.`;

                // Calculate academic year based on semester number
                // Semesters 1-2 = Year 1 (2024), Semesters 3-4 = Year 2 (2025), etc.
                const academicYear = 2024 + Math.floor((semesterNumber - 1) / 2);

                // Get the actual semester data to ensure we have the correct year and semesterNumber
                const semesterData = createdIds.semesters.find(semesterId => semesterId === semesterId);
                if (!semesterData) {
                    console.error(`[${schoolPrefix}] ❌ Semester data not found for ID: ${semesterId}`);
                    continue;
                }

                // Validate semester module data before creation
                if (!semesterId || !moduleId || !intakeCourseId || !createdIds.school) {
                    console.error(`[${schoolPrefix}] ❌ Invalid semester module data:`, {
                        semesterId, moduleId, intakeCourseId, schoolId: createdIds.school
                    });
                    continue;
                }

                // Final validation: ensure module belongs to this course
                if (!courseModules.includes(moduleId)) {
                    console.log(`[${schoolPrefix}] ⚠️ Module ${moduleId} validation failed - not available for ${courseData.courseCode} course, skipping...`);
                    continue;
                }

                const semesterModuleData = {
                    semesterId: semesterId,
                    moduleId: moduleId, // Use moduleId directly since it's already an ID
                    intakeCourseId: intakeCourseId,
                    schoolId: createdIds.school,
                    semesterNumber: semesterNumber,
                    academicYear: academicYear,
                    notes: notes,
                    customAssessmentMethods: customAssessmentMethods,
                    semesterSpecificRequirements: requirements
                };

                console.log(`[${schoolPrefix}] 📚 Semester ${semesterNumber} - Academic Year: ${semesterModuleData.academicYear}`);
                console.log(`[${schoolPrefix}] 📋 Module ${moduleId} assigned to Semester ${semesterNumber}`);

                try {
                    const semesterModuleResponse = await apiCall('POST', '/api/semester-module', semesterModuleData);
                    if (semesterModuleResponse.success) {
                        createdIds.semesterModules.push(semesterModuleResponse.data._id);
                        console.log(`[${schoolPrefix}] ✅ Semester Module created: Module assigned to Semester ${semesterNumber} with ${customAssessmentMethods.length} assessment methods (${semesterModuleResponse.data._id})`);
                    } else {
                        console.warn(`[${schoolPrefix}] ⚠️ Failed to create semester module: ${semesterModuleResponse.message}`);
                    }
                } catch (error) {
                    handleError('create semester module', error, `semester ${semesterNumber}`, schoolPrefix);
                }
            }
        }
    }

    // 11. Create Class Schedules
    console.log(`[${schoolPrefix}] 11. Creating Class Schedules...`);

    // Generate comprehensive class schedules for all modules across semesters
    const classSchedulesData = [];

    // Create schedules for CS course (Year 1-2, 2 semesters only)
    console.log(`[${schoolPrefix}] Creating class schedules for Computer Science course (First 2 semesters only)...`);

    // Year 1 Semester 1 (CS101, CS102, CS103)
    for (let i = 0; i < 3; i++) {
        const days = ["Monday", "Tuesday", "Wednesday"];
        const times = ["09:00", "13:00", "10:00"];
        const endTimes = ["12:00", "16:00", "13:00"];
        
        // Find the corresponding semester module for this module and semester
        const semesterModule = createdIds.semesterModules.find(sm =>
            sm.semesterId === createdIds.semesters[0] &&
            sm.moduleId === csModules[i]
        );

        if (semesterModule) {
            classSchedulesData.push({
                roomId: createdIds.rooms.classroom,
                semesterModuleId: semesterModule._id,
                lecturerId: createdIds.lecturers[i % createdIds.lecturers.length],
                dayOfWeek: days[i],
                startTime: times[i],
                endTime: endTimes[i],
                intakeCourseId: createdIds.intakeCourses[0], // January 2024 intake
                schoolId: createdIds.school,
                moduleStartDate: "2024-02-01T00:00:00.000Z",
                moduleEndDate: "2024-06-30T23:59:59.000Z"
            });
        }
    }

    // Year 1 Semester 2 (CS104, CS105, CS106)
    for (let i = 3; i < 6; i++) {
        const days = ["Monday", "Tuesday", "Wednesday"];
        const times = ["14:00", "09:00", "13:00"];
        const endTimes = ["17:00", "12:00", "16:00"];

        // Find the corresponding semester module for this module and semester
        const semesterModule = createdIds.semesterModules.find(sm =>
            sm.semesterId === createdIds.semesters[1] &&
            sm.moduleId === csModules[i]
        );

        if (semesterModule) {
            classSchedulesData.push({
                roomId: createdIds.rooms.classroom,
                semesterModuleId: semesterModule._id,
                lecturerId: createdIds.lecturers[i % createdIds.lecturers.length],
                dayOfWeek: days[i - 3],
                startTime: times[i - 3],
                endTime: endTimes[i - 3],
                intakeCourseId: createdIds.intakeCourses[0], // January 2024 intake
                schoolId: createdIds.school,
                moduleStartDate: "2024-07-01T00:00:00.000Z",
                moduleEndDate: "2024-11-30T23:59:59.000Z"
            });
        }
    }

    // Create schedules for IT course (Year 1-2, 2 semesters only)
    console.log(`[${schoolPrefix}] Creating class schedules for Information Technology course (First 2 semesters only)...`);

    // Year 1 Semester 1 (IT101, IT102, IT103)
    for (let i = 0; i < 3; i++) {
        const days = ["Monday", "Tuesday", "Wednesday"];
        const times = ["09:00", "13:00", "10:00"];
        const endTimes = ["12:00", "16:00", "13:00"];

        // Find the corresponding semester module for this module and semester
        const semesterModule = createdIds.semesterModules.find(sm =>
            sm.semesterId === createdIds.semesters[0] &&
            sm.moduleId === itModules[i]
        );

        if (semesterModule) {
            classSchedulesData.push({
                roomId: createdIds.rooms.classroom,
                semesterModuleId: semesterModule._id,
                lecturerId: createdIds.lecturers[i % createdIds.lecturers.length],
                dayOfWeek: days[i],
                startTime: times[i],
                endTime: endTimes[i],
                intakeCourseId: createdIds.intakeCourses[1], // May 2024 intake
                schoolId: createdIds.school,
                moduleStartDate: "2024-06-01T00:00:00.000Z",
                moduleEndDate: "2024-10-31T23:59:59.000Z"
            });
        }
    }

    // Year 1 Semester 2 (IT104, IT105, IT106)
    for (let i = 3; i < 6; i++) {
        const days = ["Monday", "Tuesday", "Wednesday"];
        const times = ["14:00", "09:00", "13:00"];
        const endTimes = ["17:00", "12:00", "16:00"];

        // Find the corresponding semester module for this module and semester
        const semesterModule = createdIds.semesterModules.find(sm =>
            sm.semesterId === createdIds.semesters[1] &&
            sm.moduleId === itModules[i]
        );

        if (semesterModule) {
            classSchedulesData.push({
                roomId: createdIds.rooms.classroom,
                semesterModuleId: semesterModule._id,
                lecturerId: createdIds.lecturers[i % createdIds.lecturers.length],
                dayOfWeek: days[i - 3],
                startTime: times[i - 3],
                endTime: endTimes[i - 3],
                intakeCourseId: createdIds.intakeCourses[1], // May 2024 intake
                schoolId: createdIds.school,
                moduleStartDate: "2024-11-01T00:00:00.000Z",
                moduleEndDate: "2025-03-31T23:59:59.000Z"
            });
        }
    }

    //TODO: fix exam schedule
    // 12. Create Exam Schedules
    console.log(`[${schoolPrefix}] 12. Creating Exam Schedules...`);

    // Calculate exam dates: current date + 1 week
    const currentDate = new Date();
    const examDate1 = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000); // +1 week
    const examDate2 = new Date(currentDate.getTime() + 8 * 24 * 60 * 60 * 1000); // +1 week + 1 day
    const examDate3 = new Date(currentDate.getTime() + 9 * 24 * 60 * 60 * 1000); // +1 week + 2 days

    const examSchedulesData = [];

    // Generate comprehensive exam schedules for all modules across semesters
    console.log(`[${schoolPrefix}] Creating exam schedules for Computer Science course...`);

    // Helper function to check for time conflicts
    const hasTimeConflict = (date, time, roomId, durationMinutes = 120) => {
        const startTime = new Date(`2000-01-01T${time}:00`);
        const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

        return examSchedulesData.some(exam => {
            if (exam.examDate === date && exam.roomId === roomId) {
                const examStartTime = new Date(`2000-01-01T${exam.examTime}:00`);
                const examEndTime = new Date(examStartTime.getTime() + exam.durationMinute * 60000);

                // Check if times overlap
                return (startTime < examEndTime && endTime > examStartTime);
            }
            return false;
        });
    };

    // Helper function to find next available time slot
    const findNextAvailableSlot = (date, roomId, preferredTime = "09:00") => {
        const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
        let timeIndex = timeSlots.indexOf(preferredTime);

        for (let i = 0; i < timeSlots.length; i++) {
            const checkTime = timeSlots[(timeIndex + i) % timeSlots.length];
            if (!hasTimeConflict(date, checkTime, roomId)) {
                return checkTime;
            }
        }

        // If no time available on this date, try next date
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        return findNextAvailableSlot(nextDate.toISOString().split('T')[0], roomId, "09:00");
    };

    // CS Course - Year 1 Semester 1 (CS101, CS102, CS103)
    for (let i = 0; i < 3; i++) {
        const examDate = examDate1.toISOString().split('T')[0];
        const preferredTime = i === 0 ? "09:00" : i === 1 ? "13:00" : "15:00";
        const examTime = findNextAvailableSlot(examDate, createdIds.rooms.tech_lab, preferredTime);
        const examRoom = createdIds.rooms.tech_lab;

        // Find the corresponding semester module for this module and semester
        const semesterModule = createdIds.semesterModules.find(sm =>
            sm.semesterId === createdIds.semesters[0] &&
            sm.moduleId === csModules[i]
        );

        if (semesterModule) {
            examSchedulesData.push({
                intakeCourseId: createdIds.intakeCourses[0],
                semesterModuleId: semesterModule._id,
                examDate: examDate,
                examTime: examTime,
                roomId: examRoom,
                invigilators: [createdIds.lecturers[i % createdIds.lecturers.length]],
                durationMinute: 120,
                schoolId: createdIds.school
            });
        }
    }

    // CS Course - Year 1 Semester 2 (CS104, CS105, CS106)
    for (let i = 3; i < 6; i++) {
        const examDate = examDate2.toISOString().split('T')[0];
        const preferredTime = i === 3 ? "09:00" : i === 4 ? "13:00" : "15:00";
        const examTime = findNextAvailableSlot(examDate, createdIds.rooms.classroom, preferredTime);
        const examRoom = createdIds.rooms.classroom;

        // Find the corresponding semester module for this module and semester
        const semesterModule = createdIds.semesterModules.find(sm =>
            sm.semesterId === createdIds.semesters[1] &&
            sm.moduleId === csModules[i]
        );

        if (semesterModule) {
            examSchedulesData.push({
                intakeCourseId: createdIds.intakeCourses[0],
                semesterModuleId: semesterModule._id,
                examDate: examDate,
                examTime: examTime,
                roomId: examRoom,
                invigilators: [createdIds.lecturers[i % createdIds.lecturers.length]],
                durationMinute: 120,
                schoolId: createdIds.school
            });
        }
    }

    // Create exam schedules for IT course (Year 1-4, 7 semesters)
    console.log(`[${schoolPrefix}] Creating exam schedules for Information Technology course...`);

    // IT Course - Year 1 Semester 1 (IT101, IT102, IT103)
    for (let i = 0; i < 3; i++) {
        const examDate = examDate1.toISOString().split('T')[0];
        const preferredTime = i === 0 ? "10:00" : i === 1 ? "14:00" : "16:00";
        const examTime = findNextAvailableSlot(examDate, createdIds.rooms.classroom, preferredTime);
        const examRoom = createdIds.rooms.classroom;

        // Find the corresponding semester module for this module and semester
        const semesterModule = createdIds.semesterModules.find(sm =>
            sm.semesterId === createdIds.semesters[0] &&
            sm.moduleId === itModules[i]
        );

        if (semesterModule) {
            examSchedulesData.push({
                intakeCourseId: createdIds.intakeCourses[1],
                semesterModuleId: semesterModule._id,
                examDate: examDate,
                examTime: examTime,
                roomId: examRoom,
                invigilators: [createdIds.lecturers[i % createdIds.lecturers.length]],
                durationMinute: 120,
                schoolId: createdIds.school
            });
        }
    }

    // IT Course - Year 1 Semester 2 (IT104, IT105, IT106)
    for (let i = 3; i < 6; i++) {
        const examDate = examDate2.toISOString().split('T')[0];
        const preferredTime = i === 3 ? "10:00" : i === 4 ? "14:00" : "16:00";
        const examTime = findNextAvailableSlot(examDate, createdIds.rooms.tech_lab, preferredTime);
        const examRoom = createdIds.rooms.tech_lab;

        // Find the corresponding semester module for this module for this module and semester
        const semesterModule = createdIds.semesterModules.find(sm =>
            sm.semesterId === createdIds.semesters[1] &&
            sm.moduleId === itModules[i]
        );

        if (semesterModule) {
            examSchedulesData.push({
                intakeCourseId: createdIds.intakeCourses[1],
                semesterModuleId: semesterModule._id,
                examDate: examDate,
                examTime: examTime,
                roomId: examRoom,
                invigilators: [createdIds.lecturers[i % createdIds.lecturers.length]],
                durationMinute: 120,
                schoolId: createdIds.school
            });
        }
    }

    // Create and save all exam schedules
    console.log(`[${schoolPrefix}] Creating ${examSchedulesData.length} exam schedules...`);

    for (let i = 0; i < examSchedulesData.length; i++) {
        try {
            const examScheduleResponse = await apiCall('POST', '/api/exam-schedule', examSchedulesData[i]);
            if (examScheduleResponse.success) {
                createdIds.examSchedules.push(examScheduleResponse.data._id);
                console.log(`[${schoolPrefix}] ✅ Exam Schedule created: ${examSchedulesData[i].examDate} at ${examSchedulesData[i].examTime} (${examScheduleResponse.data._id})`);
            } else {
                console.warn(`[${schoolPrefix}] ⚠️ Failed to create exam schedule: ${examScheduleResponse.message}`);
            }
        } catch (error) {
            handleError('create exam schedule', error, 'exam schedule', schoolPrefix);
        }
    }

    // 13. Create Students (distributed across intakes and courses)
    console.log(`[${schoolPrefix}] 13. Creating Students...`);
    const years = [1, 2, 3, 4];
    const semesters = [1, 2, 3];
    const statuses = ['enrolled', 'in_progress', 'graduated', 'dropped', 'suspended'];
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
            // Generate unique name for this student
            const courseIndex = intakeCourseIndex % coursesData.length;
            const { fullName, uniqueId } = generateUniqueStudentName(schoolPrefix, studentUserIndex, intakeCourseIndex, courseIndex);

            // Create user for this student
            const userData = {
                name: fullName,
                email: (schoolPrefix === "APU" && studentUserIndex === 0) ? "studentcampushub@gmail.com" : `student${studentUserIndex}@student.${schoolEmailDomain}`,
                password: (schoolPrefix === "APU" && studentUserIndex === 0) ? "P@ssw0rd$$" : "password123",
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
        const studentSchedules = createdIds.classSchedules.filter(schedule => {
            // Match schedules based on intake course ID
            return schedule.intakeCourseId === studentIntakeCourseId;
        });

        // Create attendance for the first 3 schedules (first semester modules)
        const schedulesToTrack = studentSchedules.slice(0, 3);

        for (let j = 0; j < schedulesToTrack.length; j++) {
            // Create 3 attendance records per schedule (different dates)
            for (let k = 0; k < 3; k++) {
                const attendanceData = {
                    studentId: createdIds.students[i],
                    scheduleId: schedulesToTrack[j],
                    status: attendanceStatuses[(i + j + k) % attendanceStatuses.length],
                    date: `2024-02-${(5 + k + j * 3).toString().padStart(2, '0')}T00:00:00.000Z`,
                    schoolId: createdIds.school
                };
                const attendanceResponse = await apiCall('POST', '/api/attendance', attendanceData);
                createdIds.attendance.push(attendanceResponse.data._id);
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
        let courseModules;
        if (studentCourseId === createdIds.courses[0]) {
            // Computer Science course - use first 21 modules
            courseModules = createdIds.modules.slice(0, 21);
        } else {
            // Information Technology course - use next 21 modules
            courseModules = createdIds.modules.slice(21, 42);
        }

        // Create results for each module in the student's course (limit to first 6 modules for Year 1-2)
        const modulesToGrade = courseModules.slice(0, Math.min(6, courseModules.length));

        for (let j = 0; j < modulesToGrade.length; j++) {
            const selectedGrade = grades[(i + j) % grades.length];
            const totalMarks = 100;
            const marks = Math.floor(Math.random() * 40) + (selectedGrade === 'F' ? 0 : 50); // 50-90 for passing, 0-49 for F

            // Assign semester based on module index (first 3 modules = semester 1, next 3 = semester 2)
            // Find the semester that belongs to this student's intake course
            const studentIntakeCourseIndex = createdIds.intakeCourses.indexOf(studentData.intakeCourseId);
            const semesterIndex = Math.floor(j / 3);
            const semesterId = createdIds.semesters[studentIntakeCourseIndex * 7 + semesterIndex] || createdIds.semesters[0];

            const resultData = {
                studentId: createdIds.students[i],
                moduleId: modulesToGrade[j],
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

    // Create locker units with variety for dashboard display - one per resource ID
    const lockerUnitData = [
        // A100 - Available
        {
            resourceId: createdIds.resources[5], // A100
            schoolId: createdIds.school,
            status: "Available",
            isAvailable: true
        },
        // A101 - Occupied
        {
            resourceId: createdIds.resources[6], // A101
            schoolId: createdIds.school,
            status: "Occupied",
            isAvailable: false
        },
        // A102 - Maintenance
        {
            resourceId: createdIds.resources[7], // A102
            schoolId: createdIds.school,
            status: "Maintenance",
            isAvailable: false
        },
        // A103 - Available
        {
            resourceId: createdIds.resources[8], // A103
            schoolId: createdIds.school,
            status: "Available",
            isAvailable: true
        },
        // A104 - Occupied
        {
            resourceId: createdIds.resources[9], // A104
            schoolId: createdIds.school,
            status: "Occupied",
            isAvailable: false
        },
        // A105 - Available
        {
            resourceId: createdIds.resources[10], // A105
            schoolId: createdIds.school,
            status: "Available",
            isAvailable: true
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

    // Create consolidated bus schedules for all days of the week
    const busSchedulesData = [];

    // All time slots for weekdays
    const weekdayTimeSlots = [
        { startTime: "07:30", endTime: "08:00" },   // Morning
        { startTime: "08:00", endTime: "08:30" },   // Morning
        { startTime: "12:00", endTime: "12:30" },   // Afternoon
        { startTime: "13:00", endTime: "13:30" },   // Afternoon
        { startTime: "17:00", endTime: "17:30" },   // Evening
        { startTime: "18:00", endTime: "18:30" }    // Evening
    ];

    // Weekend time slots (reduced frequency)
    const weekendTimeSlots = [
        { startTime: "09:00", endTime: "09:30" },   // Morning
        { startTime: "14:00", endTime: "14:30" }    // Afternoon
    ];

    // Create one consolidated schedule for Monday to Friday (days 1-5)
    const weekdayRouteTimings = weekdayTimeSlots.map(slot => ({
        routeId: createdIds.routes[0],
        startTime: slot.startTime,
        endTime: slot.endTime  // Will be auto-calculated by controller
    }));

    busSchedulesData.push({
        routeTiming: weekdayRouteTimings,
        vehicleId: createdIds.vehicles[0], // Bus vehicle
        dayOfWeek: 1, // Monday
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        active: true,
        schoolId: createdIds.school
    });

    // Create one consolidated schedule for Tuesday to Friday (days 2-5)
    busSchedulesData.push({
        routeTiming: weekdayRouteTimings,
        vehicleId: createdIds.vehicles[0], // Bus vehicle
        dayOfWeek: 2, // Tuesday
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        active: true,
        schoolId: createdIds.school
    });

    busSchedulesData.push({
        routeTiming: weekdayRouteTimings,
        vehicleId: createdIds.vehicles[0], // Bus vehicle
        dayOfWeek: 3, // Wednesday
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        active: true,
        schoolId: createdIds.school
    });

    busSchedulesData.push({
        routeTiming: weekdayRouteTimings,
        vehicleId: createdIds.vehicles[0], // Bus vehicle
        dayOfWeek: 4, // Thursday
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        active: true,
        schoolId: createdIds.school
    });

    busSchedulesData.push({
        routeTiming: weekdayRouteTimings,
        vehicleId: createdIds.vehicles[0], // Bus vehicle
        dayOfWeek: 5, // Friday
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        active: true,
        schoolId: createdIds.school
    });

    // Create one consolidated schedule for Saturday (day 6)
    const saturdayRouteTimings = weekendTimeSlots.map(slot => ({
        routeId: createdIds.routes[0],
        startTime: slot.startTime,
        endTime: slot.endTime  // Will be auto-calculated by controller
    }));

    busSchedulesData.push({
        routeTiming: saturdayRouteTimings,
        vehicleId: createdIds.vehicles[0], // Bus vehicle
        dayOfWeek: 6, // Saturday
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        active: true,
        schoolId: createdIds.school
    });

    // Create one consolidated schedule for Sunday (day 0) - minimal service
    busSchedulesData.push({
        routeTiming: [
            {
                routeId: createdIds.routes[0],
                startTime: "10:00",
                endTime: "10:30"  // Will be auto-calculated by controller
            }
        ],
        vehicleId: createdIds.vehicles[0], // Bus vehicle
        dayOfWeek: 7, // Sunday
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        active: true,
        schoolId: createdIds.school
    });

    for (let i = 0; i < busSchedulesData.length; i++) {
        const busScheduleRes = await apiCall('POST', '/api/bus-schedule', busSchedulesData[i]);
        createdIds.busSchedules.push(busScheduleRes.data._id);
        console.log(`[${schoolPrefix}] ✅ Bus Schedule created: ${busSchedulesData[i].startDate} - ${busSchedulesData[i].endDate} (${busScheduleRes.data._id})`);
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

    // Create multiple lost items with sample images
    const lostItemsData = [
        {
            personId: createdIds.students[0],
            schoolId: createdIds.school,
            itemDetails: {
                name: "Water Bottle",
                description: "Lost white cylindrical water bottle with black lid. Has 'Botella' text printed on it.",
                location: "cafeteria",
                lostDate: new Date().toISOString(),
                image: "/bottle.jpeg",
                imageData: null,
                imageType: null
            },
            status: "reported"
        },
        {
            personId: createdIds.students[1] || createdIds.students[0],
            schoolId: createdIds.school,
            itemDetails: {
                name: "USB Flash Drive",
                description: "Lost black USB flash drive (SanDisk Cruzer micro 4GB) with retractable connector.",
                location: "library",
                lostDate: new Date().toISOString(),
                image: "/pendrive.jpeg",
                imageData: null,
                imageType: null
            },
            status: "found"
        },
        {
            personId: createdIds.students[2] || createdIds.students[0],
            schoolId: createdIds.school,
            itemDetails: {
                name: "Laptop Charger",
                description: "Lost laptop charger with black cable and rectangular connector.",
                location: "classroom",
                lostDate: new Date().toISOString(),
                image: "/laptopCharger.jpeg",
                imageData: null,
                imageType: null
            },
            status: "reported"
        },
        {
            personId: createdIds.students[5] || createdIds.students[4],
            schoolId: createdIds.school,
            itemDetails: {
                name: "Laptop Charger",
                description: "Found a laptop charger with black cable and rectangular connector.",
                location: "classroom",
                lostDate: new Date().toISOString(),
                image: "/laptopCharger.jpeg",
                imageData: null,
                imageType: null
            },
            status: "found"
        }
    ];

    for (const lostItemData of lostItemsData) {
        const lostItemRes = await apiCall('POST', '/api/lost-item', lostItemData);
        createdIds.lostItems.push(lostItemRes.data._id);
        console.log(`[${schoolPrefix}] ✅ Lost Item created: ${lostItemData.itemDetails.name} (${lostItemRes.data._id})`);
    }

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
        await apiCall('DELETE', '/api/semester-module/all');
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
        // Don't throw here as this is not critical for the main flow
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
