// User Data Generator Utility
// Generates realistic user data for testing and development purposes

// Helper function to generate random dates within a range
const generateRandomDate = (startYear = 2020, endYear = 2024) => {
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 11, 31);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to generate random phone numbers
const generatePhoneNumber = (baseNumber = 60123456789) => {
    const randomOffset = Math.floor(Math.random() * 1000);
    return baseNumber + randomOffset;
};

// Helper function to generate random Malaysian addresses
const generateMalaysianAddress = () => {
    const cities = [
        'Kuala Lumpur', 'Petaling Jaya', 'Shah Alam', 'Subang Jaya', 'Klang',
        'Kajang', 'Seremban', 'Malacca', 'Johor Bahru', 'Penang',
        'Ipoh', 'Kuantan', 'Kota Kinabalu', 'Kuching', 'Alor Setar'
    ];

    const areas = [
        'Taman', 'Bandar', 'Pusat', 'Kompleks', 'Plaza', 'Square'
    ];

    const streetTypes = [
        'Jalan', 'Lorong', 'Persiaran', 'Lebuh', 'Tingkat'
    ];

    const city = cities[Math.floor(Math.random() * cities.length)];
    const area = areas[Math.floor(Math.random() * areas.length)];
    const streetType = streetTypes[Math.floor(Math.random() * streetTypes.length)];
    const streetNumber = Math.floor(Math.random() * 100) + 1;
    const postalCode = Math.floor(Math.random() * 90000) + 10000;

    return {
        address: `${streetType} ${streetNumber}, ${area} ${city}`,
        city: city,
        postalCode: postalCode.toString(),
        country: 'Malaysia'
    };
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

// Helper function to generate random email domains - now only gmail.com
const generateEmailDomain = () => {
    return 'gmail.com';
};

// Generate school data
export const generateSchoolData = (schoolPrefix = 'SCH') => {
    const schoolNames = [
        'Asia Pacific University', 'Borneo Pacific University', 'Malaysia Technology Institute',
        'Global Education Center', 'Innovation University', 'Future Skills Academy',
        'Digital Learning Institute', 'Excellence College', 'Knowledge Hub University',
        'Progressive Education Center', 'Modern Learning Institute', 'Advanced Studies Academy'
    ];

    const schoolName = schoolNames[Math.floor(Math.random() * schoolNames.length)];
    const addressData = generateMalaysianAddress();
    const timestamp = Date.now().toString().slice(-6);

    return {
        name: schoolName,
        emailDomain: generateEmailDomain(), // Always gmail.com now
        address: addressData.address,
        city: addressData.city,
        country: addressData.country,
        status: 'Active',
        phoneBase: generatePhoneNumber(60123456789),
        schoolPrefix: schoolPrefix + timestamp,
        createdAt: generateRandomDate(2020, 2024)
    };
};

// Generate user data based on role - only student and lecturer
export const generateUserData = (role, schoolData = null, index = 0) => {
    const name = generateNames();
    const emailDomain = generateEmailDomain(); // Always gmail.com
    const email = `${role}${index}@${emailDomain}`;
    const phoneNumber = generatePhoneNumber(60123456789) + index;

    const baseUser = {
        name: name,
        email: email,
        password: "password123",
        phoneNumber: phoneNumber,
        role: role,
        twoFA_enabled: Math.random() > 0.7, // 30% chance of 2FA enabled
        createdAt: generateRandomDate(2020, 2024)
    };

    // Add role-specific data - only for student and lecturer
    switch (role) {
        case 'lecturer':
            return {
                ...baseUser,
                department: ['Computer Science', 'Information Technology', 'Business', 'Engineering'][Math.floor(Math.random() * 4)],
                qualifications: ['PhD', 'Masters', 'Bachelor'][Math.floor(Math.random() * 3)],
                experience: Math.floor(Math.random() * 15) + 1,
                specialization: ['Web Development', 'Database Systems', 'AI/ML', 'Software Engineering', 'Networking'][Math.floor(Math.random() * 5)],
                officeHours: generateOfficeHours()
            };

        case 'student':
            return {
                ...baseUser,
                studentId: `STU${Date.now().toString().slice(-6)}${index}`,
                intake: ['January 2024', 'May 2024', 'September 2024'][Math.floor(Math.random() * 3)],
                course: ['Computer Science', 'Information Technology', 'Business Administration', 'Engineering'][Math.floor(Math.random() * 4)],
                currentYear: Math.floor(Math.random() * 4) + 1,
                currentSemester: Math.floor(Math.random() * 2) + 1,
                cgpa: (Math.random() * 2 + 2).toFixed(2), // 2.0 to 4.0
                academicStanding: ['good', 'warning', 'probation'][Math.floor(Math.random() * 3)]
            };

        default:
            return baseUser;
    }
};

// Generate office hours for lecturers
const generateOfficeHours = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const numDays = Math.floor(Math.random() * 3) + 1; // 1-3 days
    const selectedDays = days.sort(() => 0.5 - Math.random()).slice(0, numDays);

    return selectedDays.map(day => ({
        day: day,
        startTime: `${Math.floor(Math.random() * 4) + 9}:00`, // 9:00 to 12:00
        endTime: `${Math.floor(Math.random() * 4) + 13}:00`   // 13:00 to 16:00
    }));
};

// Generate multiple users for a school - only students and lecturers
export const generateSchoolUsers = (schoolData, userCounts = {}) => {
    const defaultCounts = {
        lecturer: 8,
        student: 50
    };

    const counts = { ...defaultCounts, ...userCounts };
    const users = {};

    Object.entries(counts).forEach(([role, count]) => {
        users[role] = [];
        for (let i = 0; i < count; i++) {
            users[role].push(generateUserData(role, schoolData, i));
        }
    });

    return users;
};

// Generate billing data
export const generateBillingData = (schoolId, users) => {
    const subscriptionPlans = [
        { name: 'Basic Plan', price: 500, interval: 'Monthly' },
        { name: 'Standard Plan', price: 1000, interval: 'Yearly' },
        { name: 'Premium Plan', price: 2000, interval: 'Yearly' },
        { name: 'Enterprise Plan', price: 5000, interval: 'Yearly' }
    ];

    const billingData = {
        subscriptions: [],
        payments: [],
        invoices: []
    };

    // Generate subscriptions
    const subscriptionCount = Math.floor(Math.random() * 2) + 1; // 1-2 subscriptions
    for (let i = 0; i < subscriptionCount; i++) {
        const plan = subscriptionPlans[Math.floor(Math.random() * subscriptionPlans.length)];
        billingData.subscriptions.push({
            schoolId: schoolId,
            planName: plan.name,
            price: plan.price,
            billingInterval: plan.interval,
            status: 'active',
            createdAt: generateRandomDate(2023, 2024)
        });
    }

    // Generate payment methods
    const paymentMethods = ['VISA', 'Mastercard', 'PayPal'];
    const cardHolders = users.lecturer || []; // Use lecturers as card holders

    cardHolders.forEach((lecturer, index) => {
        billingData.payments.push({
            schoolId: schoolId,
            cardHolderName: lecturer.name,
            last4Digit: (Math.floor(Math.random() * 9000) + 1000).toString(),
            expiryDate: `${Math.floor(Math.random() * 12) + 1}/${Math.floor(Math.random() * 10) + 25}`,
            paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
            status: ['success', 'active'][Math.floor(Math.random() * 2)]
        });
    });

    // Generate invoices
    const subscription = billingData.subscriptions[0];
    if (subscription) {
        const invoiceCount = Math.floor(Math.random() * 5) + 3; // 3-7 invoices
        for (let i = 0; i < invoiceCount; i++) {
            const statuses = ['paid', 'pending', 'overdue'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];

            billingData.invoices.push({
                schoolId: schoolId,
                amount: subscription.price,
                status: status,
                date: generateRandomDate(2023, 2024),
                paymentId: billingData.payments[Math.floor(Math.random() * billingData.payments.length)]?.id || null,
                subscriptionId: subscription.id || null
            });
        }
    }

    return billingData;
};

// Generate facility data
export const generateFacilityData = (schoolId, userCount) => {
    const facilityData = {
        resources: [],
        bookings: [],
        lockerUnits: [],
        parkingLots: []
    };

    // Generate resources
    const resourceTypes = [
        { type: 'classroom', capacity: 30, facilities: ['projector', 'whiteboard', 'air_conditioning'] },
        { type: 'lab', capacity: 25, facilities: ['computers', 'projector', 'air_conditioning'] },
        { type: 'library', capacity: 50, facilities: ['study_areas', 'computers', 'quiet_zones'] },
        { type: 'meeting_room', capacity: 15, facilities: ['projector', 'whiteboard', 'video_conference'] },
        { type: 'sports_facility', capacity: 20, facilities: ['equipment', 'changing_rooms', 'showers'] }
    ];

    const resourceCount = Math.floor(Math.random() * 8) + 5; // 5-12 resources
    for (let i = 0; i < resourceCount; i++) {
        const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
        const block = ['Block A', 'Block B', 'Block C', 'Block D'][Math.floor(Math.random() * 4)];
        const floor = ['Ground Floor', 'Level 1', 'Level 2', 'Level 3'][Math.floor(Math.random() * 4)];

        facilityData.resources.push({
            schoolId: schoolId,
            name: `${resourceType.type.charAt(0).toUpperCase() + resourceType.type.slice(1)} ${i + 1}`,
            location: `${block}, ${floor}`,
            type: resourceType.type,
            capacity: resourceType.capacity,
            facilities: resourceType.facilities,
            status: Math.random() > 0.1, // 90% chance of being active
            timeslots: generateTimeSlots()
        });
    }

    // Generate locker units
    const lockerCount = Math.floor(Math.random() * 20) + 10; // 10-29 lockers
    for (let i = 0; i < lockerCount; i++) {
        facilityData.lockerUnits.push({
            schoolId: schoolId,
            lockerNumber: `A${(i + 100).toString().padStart(3, '0')}`,
            isAvailable: Math.random() > 0.3, // 70% chance of being available
            location: 'Block D, Ground Floor',
            createdAt: generateRandomDate(2023, 2024)
        });
    }

    // Generate parking lots
    const parkingZones = ['A', 'B', 'C'];
    const parkingCount = Math.floor(Math.random() * 30) + 20; // 20-49 parking spots
    for (let i = 0; i < parkingCount; i++) {
        const zone = parkingZones[Math.floor(Math.random() * parkingZones.length)];
        facilityData.parkingLots.push({
            schoolId: schoolId,
            zone: zone,
            slotNumber: i + 1,
            active: Math.random() > 0.2, // 80% chance of being active
            createdAt: generateRandomDate(2023, 2024)
        });
    }

    // Generate bookings
    const bookingCount = Math.floor(Math.random() * 15) + 10; // 10-24 bookings
    for (let i = 0; i < bookingCount; i++) {
        const statuses = ['confirmed', 'pending', 'completed', 'cancelled'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        facilityData.bookings.push({
            schoolId: schoolId,
            resourceId: facilityData.resources[Math.floor(Math.random() * facilityData.resources.length)]?.id || null,
            studentId: null, // Will be set when users are created
            bookingDate: generateRandomDate(2024, 2024),
            startTime: `${Math.floor(Math.random() * 8) + 8}:00`, // 8:00 to 15:00
            endTime: `${Math.floor(Math.random() * 4) + 9}:00`,  // 9:00 to 12:00
            status: status
        });
    }

    return facilityData;
};

// Generate time slots for resources
const generateTimeSlots = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [];

    days.forEach(day => {
        const numSlots = Math.floor(Math.random() * 3) + 1; // 1-3 slots per day
        const slots = [];

        for (let i = 0; i < numSlots; i++) {
            const startHour = Math.floor(Math.random() * 8) + 8; // 8:00 to 15:00
            const duration = Math.floor(Math.random() * 2) + 1; // 1-2 hours

            slots.push({
                start: `${startHour.toString().padStart(2, '0')}:00`,
                end: `${(startHour + duration).toString().padStart(2, '0')}:00`
            });
        }

        timeSlots.push({
            dayOfWeek: day,
            slots: slots
        });
    });

    return timeSlots;
};

// Generate transportation data
export const generateTransportationData = (schoolId) => {
    const transportData = {
        stops: [],
        vehicles: [],
        routes: [],
        busSchedules: [],
        eHailings: []
    };

    // Generate stops
    const stopNames = [
        'Main Gate', 'Student Center', 'Library', 'Cafeteria', 'Sports Complex',
        'Parking Lot A', 'Parking Lot B', 'Academic Block', 'Residence Hall', 'Bus Terminal'
    ];

    stopNames.forEach((name, index) => {
        transportData.stops.push({
            schoolId: schoolId,
            name: name,
            type: ['campus', 'off_campus'][Math.floor(Math.random() * 2)],
            location: `Zone ${String.fromCharCode(65 + index)}`, // A, B, C, etc.
            coordinates: {
                lat: 3.1390 + (Math.random() - 0.5) * 0.01, // Around KL coordinates
                lng: 101.6869 + (Math.random() - 0.5) * 0.01
            }
        });
    });

    // Generate vehicles
    const vehicleTypes = [
        { type: 'bus', capacity: 40, count: 3 },
        { type: 'car', capacity: 4, count: 5 },
        { type: 'van', capacity: 12, count: 2 }
    ];

    vehicleTypes.forEach(vehicleType => {
        for (let i = 0; i < vehicleType.count; i++) {
            const timestamp = Date.now().toString().slice(-6);
            transportData.vehicles.push({
                schoolId: schoolId,
                plateNumber: `SCH-${vehicleType.type.toUpperCase()}-${timestamp}-${(i + 1).toString().padStart(2, '0')}`,
                type: vehicleType.type,
                capacity: vehicleType.capacity,
                status: ['available', 'in_use', 'maintenance'][Math.floor(Math.random() * 3)],
                lastMaintenance: generateRandomDate(2023, 2024)
            });
        }
    });

    // Generate routes
    const routeCount = Math.floor(Math.random() * 3) + 2; // 2-4 routes
    for (let i = 0; i < routeCount; i++) {
        const stopCount = Math.floor(Math.random() * 4) + 2; // 2-5 stops per route
        const selectedStops = transportData.stops.sort(() => 0.5 - Math.random()).slice(0, stopCount);

        transportData.routes.push({
            schoolId: schoolId,
            name: `Route ${i + 1}`,
            stopIds: selectedStops.map(stop => stop.id),
            estimateTimeMinute: Math.floor(Math.random() * 30) + 15, // 15-45 minutes
            fare: Math.floor(Math.random() * 5) + 1, // RM 1-5
            frequency: ['hourly', 'every_30min', 'every_15min'][Math.floor(Math.random() * 3)]
        });
    }

    // Generate bus schedules
    const scheduleCount = Math.floor(Math.random() * 10) + 5; // 5-14 schedules
    for (let i = 0; i < scheduleCount; i++) {
        const dayOfWeek = Math.floor(Math.random() * 7) + 1; // 1-7 (Monday-Sunday)
        const startHour = Math.floor(Math.random() * 12) + 6; // 6:00 to 17:00

        transportData.busSchedules.push({
            schoolId: schoolId,
            routeId: transportData.routes[Math.floor(Math.random() * transportData.routes.length)]?.id || null,
            vehicleId: transportData.vehicles.find(v => v.type === 'bus')?.id || null,
            dayOfWeek: dayOfWeek,
            startTime: `${startHour.toString().padStart(2, '0')}:00`,
            endTime: `${(startHour + 1).toString().padStart(2, '0')}:00`,
            active: Math.random() > 0.1, // 90% chance of being active
            startDate: generateRandomDate(2024, 2024),
            endDate: generateRandomDate(2025, 2025)
        });
    }

    // Generate e-hailing requests
    const eHailingCount = Math.floor(Math.random() * 8) + 5; // 5-12 requests
    for (let i = 0; i < eHailingCount; i++) {
        const statuses = ['waiting', 'assigned', 'in_progress', 'completed', 'cancelled'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        transportData.eHailings.push({
            schoolId: schoolId,
            routeId: transportData.routes[Math.floor(Math.random() * transportData.routes.length)]?.id || null,
            vehicleId: transportData.vehicles.find(v => v.type === 'car')?.id || null,
            status: status,
            requestAt: generateRandomDate(2024, 2024),
            pickupLocation: transportData.stops[Math.floor(Math.random() * transportData.stops.length)]?.name || 'Main Gate',
            destination: transportData.stops[Math.floor(Math.random() * transportData.stops.length)]?.name || 'Student Center'
        });
    }

    return transportData;
};

// Generate service data
export const generateServiceData = (schoolId, users) => {
    const serviceData = {
        feedbacks: [],
        responds: [],
        lostItems: []
    };

    // Generate feedback
    const feedbackTypes = ['complaint', 'suggestion', 'compliment', 'query', 'issue'];
    const priorities = ['Low', 'Medium', 'High', 'Urgent'];
    const statuses = ['open', 'in_progress', 'resolved', 'sent'];

    const feedbackCount = Math.floor(Math.random() * 15) + 10; // 10-24 feedback entries
    for (let i = 0; i < feedbackCount; i++) {
        const feedbackType = feedbackTypes[Math.floor(Math.random() * feedbackTypes.length)];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        const messages = {
            complaint: [
                'Air conditioning not working properly in the library',
                'WiFi connection is very slow in certain areas',
                'Cafeteria food quality has declined recently',
                'Parking spaces are insufficient during peak hours'
            ],
            suggestion: [
                'Consider extending library hours during exam periods',
                'Add more water fountains around the campus',
                'Implement a mobile app for facility bookings',
                'Create more study spaces in common areas'
            ],
            compliment: [
                'The new study rooms are excellent and well-maintained',
                'Online course registration system is very user-friendly',
                'Campus security staff are very helpful and professional',
                'The sports facilities are modern and well-equipped'
            ],
            query: [
                'What are the operating hours for the computer lab during weekends?',
                'When will the new sports facilities be available for student use?',
                'How can I request additional parking permits?',
                'What is the process for booking meeting rooms?'
            ],
            issue: [
                'There is a broken window in Room 201 that needs immediate attention',
                'Leaking ceiling in the cafeteria area',
                'Broken chairs in the main lecture hall',
                'Faulty lighting in the parking lot'
            ]
        };

        const messageArray = messages[feedbackType];
        const message = messageArray[Math.floor(Math.random() * messageArray.length)];

        serviceData.feedbacks.push({
            schoolId: schoolId,
            studentId: null, // Will be set when users are created
            feedbackType: feedbackType,
            priority: priority,
            message: message,
            status: status,
            createdAt: generateRandomDate(2024, 2024)
        });
    }

    // Generate responses to feedback
    const responseCount = Math.floor(Math.random() * 8) + 5; // 5-12 responses
    for (let i = 0; i < responseCount; i++) {
        const feedback = serviceData.feedbacks[i % serviceData.feedbacks.length];
        if (feedback) {
            const responseMessages = [
                'Thank you for your feedback. We are looking into this issue.',
                'We appreciate your suggestion and will consider implementing it.',
                'This has been resolved. Thank you for bringing it to our attention.',
                'We are working on this and will update you soon.',
                'Your feedback is valuable to us. We are investigating this matter.'
            ];

            serviceData.responds.push({
                schoolId: schoolId,
                feedbackId: feedback.id || null,
                responderId: null, // Will be set when users are created
                message: responseMessages[Math.floor(Math.random() * responseMessages.length)],
                createdAt: generateRandomDate(2024, 2024)
            });
        }
    }

    // Generate lost items
    const itemTypes = ['wallet', 'phone', 'laptop', 'keys', 'books', 'bag', 'umbrella', 'water bottle'];
    const locations = ['library', 'cafeteria', 'classroom', 'parking lot', 'sports complex', 'student center'];
    const itemStatuses = ['reported', 'found', 'claimed', 'disposed'];

    const lostItemCount = Math.floor(Math.random() * 10) + 5; // 5-14 lost items
    for (let i = 0; i < lostItemCount; i++) {
        const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const status = itemStatuses[Math.floor(Math.random() * itemStatuses.length)];

        serviceData.lostItems.push({
            schoolId: schoolId,
            personId: null, // Will be set when users are created
            itemDetails: {
                name: itemType.charAt(0).toUpperCase() + itemType.slice(1),
                description: `Lost ${itemType} in the ${location}`,
                location: location,
                lostDate: generateRandomDate(2024, 2024)
            },
            status: status,
            createdAt: generateRandomDate(2024, 2024)
        });
    }

    return serviceData;
};

// Main function to generate complete school data
export const generateCompleteSchoolData = (schoolPrefix = 'SCH', userCounts = {}) => {
    console.log(`🚀 Starting data generation for school: ${schoolPrefix}`);

    // Generate school
    const schoolData = generateSchoolData(schoolPrefix);
    console.log(`✅ School generated: ${schoolData.name}`);

    // Generate users - only students and lecturers
    const users = generateSchoolUsers(schoolData, userCounts);
    console.log(`✅ Users generated: ${Object.values(users).flat().length} total users`);

    // Generate billing data
    const billingData = generateBillingData(schoolData.id || 'temp-id', users);
    console.log(`✅ Billing data generated: ${billingData.subscriptions.length} subscriptions, ${billingData.invoices.length} invoices`);

    // Generate facility data
    const facilityData = generateFacilityData(schoolData.id || 'temp-id', Object.values(users).flat().length);
    console.log(`✅ Facility data generated: ${facilityData.resources.length} resources, ${facilityData.bookings.length} bookings`);

    // Generate transportation data
    const transportData = generateTransportationData(schoolData.id || 'temp-id');
    console.log(`✅ Transportation data generated: ${transportData.routes.length} routes, ${transportData.vehicles.length} vehicles`);

    // Generate service data
    const serviceData = generateServiceData(schoolData.id || 'temp-id', users);
    console.log(`✅ Service data generated: ${serviceData.feedbacks.length} feedbacks, ${serviceData.lostItems.length} lost items`);

    const completeData = {
        school: schoolData,
        users: users,
        billing: billingData,
        facility: facilityData,
        transportation: transportData,
        service: serviceData,
        generatedAt: new Date().toISOString()
    };

    console.log(`🎉 Complete school data generated successfully for ${schoolData.name}!`);
    return completeData;
};

// Export individual functions for specific use cases
export default {
    generateSchoolData,
    generateUserData,
    generateSchoolUsers,
    generateBillingData,
    generateFacilityData,
    generateTransportationData,
    generateServiceData,
    generateCompleteSchoolData
};
