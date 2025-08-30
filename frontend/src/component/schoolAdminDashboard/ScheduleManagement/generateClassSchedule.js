const generateClassSchedule = async (selectedIntake, selectedCourse, selectedIntakeCourse, modules, rooms, lecturers, scheduleConfig = {}, selectedSemester = null, selectedModule = null, semesterModules = []) => {
    // Configuration with defaults
    const CLASSES_PER_MODULE_PER_WEEK = scheduleConfig.classesPerWeek || 2;
    const DAYS_OF_WEEK = scheduleConfig.daysOfWeek || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const TIME_SLOTS = scheduleConfig.timeSlots || [
        { start: "08:00", end: "10:00" },
        { start: "10:00", end: "12:00" },
        { start: "12:00", end: "14:00" },
        { start: "14:00", end: "16:00" },
        { start: "16:00", end: "18:00" }
    ];

    // Default module duration (in weeks)
    const DEFAULT_MODULE_DURATION_WEEKS = scheduleConfig.moduleDurationWeeks || 12;
    const SEMESTER_START_DATE = scheduleConfig.semesterStartDate || new Date();

    // Debug logging
    console.log("🚀 ~ generateClassSchedule ~ Parameters:", {
        selectedIntake,
        selectedCourse,
        selectedIntakeCourse: selectedIntakeCourse?._id,
        modulesCount: modules?.length,
        roomsCount: rooms?.length,
        lecturersCount: lecturers?.length,
        selectedSemester,
        selectedModule
    });

    if (!selectedIntakeCourse) {
        throw new Error("Selected intake course not found");
    }

    // Get semester modules for the selected semester
    let semesterModulesToProcess = [];
    
    if (selectedModule) {
        // If a specific module is selected, find the corresponding semester module
        const semesterModule = semesterModules?.find(sm => 
            sm._id === selectedModule && 
            sm.semesterId._id === selectedSemester._id
        );
        
        if (semesterModule) {
            semesterModulesToProcess = [semesterModule];
            console.log("🚀 ~ Selected specific semester module:", semesterModule);
        } else {
            throw new Error(`No semester module found for module ${selectedModule} in semester ${selectedSemester._id}`);
        }
    } else {
        // If no specific module selected, get all semester modules for this semester
        semesterModulesToProcess = semesterModules?.filter(sm => 
            sm.semesterId._id === selectedSemester._id
        ) || [];
        console.log("🚀 ~ Found semester modules for semester:", semesterModulesToProcess.map(sm => ({ 
            moduleCode: sm.moduleId.code, 
            moduleName: sm.moduleId.moduleName,
            semesterModuleId: sm._id 
        })));
    }

    if (semesterModulesToProcess.length === 0) {
        throw new Error("No semester modules found for the selected semester");
    }
    // Initialize schedule tracking
    const schedule = [];
    const conflicts = {
        rooms: new Map(), // Map<"day-time-date", Set<roomId>>
        lecturers: new Map() // Map<"day-time-date", Set<lecturerId>>
    };

    // Helper function to calculate module dates
    const calculateModuleDates = (moduleIndex, totalModules) => {
        const startDate = new Date(SEMESTER_START_DATE);

        // Calculate start date for this module (staggered approach)
        const weeksOffset = Math.floor((moduleIndex * DEFAULT_MODULE_DURATION_WEEKS) / totalModules);
        startDate.setDate(startDate.getDate() + (weeksOffset * 7));

        // Calculate end date
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + (DEFAULT_MODULE_DURATION_WEEKS * 7));

        return { startDate, endDate };
    };

    // Helper function to get week number from date
    const getWeekNumber = (date) => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };

    // Helper function to get available rooms for a time slot and date
    const getAvailableRooms = (day, timeSlot, date) => {
        const dateStr = date.toISOString().split('T')[0];
        const key = `${day}-${timeSlot.start}-${dateStr}`;
        const usedRooms = conflicts.rooms.get(key) || new Set();
        return rooms?.filter(room => !usedRooms.has(room._id)) || [];
    };

    // Helper function to get available lecturers for a time slot and date
    const getAvailableLecturers = (day, timeSlot, date) => {
        const dateStr = date.toISOString().split('T')[0];
        const key = `${day}-${timeSlot.start}-${dateStr}`;
        const usedLecturers = conflicts.lecturers.get(key) || new Set();
        return lecturers?.filter(lecturer => !usedLecturers.has(lecturer._id)) || [];
    };

    // Helper function to mark resource as used
    const markResourceUsed = (day, timeSlot, date, roomId, lecturerId) => {
        const dateStr = date.toISOString().split('T')[0];
        const key = `${day}-${timeSlot.start}-${dateStr}`;

        // Mark room as used
        if (!conflicts.rooms.has(key)) {
            conflicts.rooms.set(key, new Set());
        }
        conflicts.rooms.get(key).add(roomId);

        // Mark lecturer as used
        if (!conflicts.lecturers.has(key)) {
            conflicts.lecturers.set(key, new Set());
        }
        conflicts.lecturers.get(key).add(lecturerId);
    };

    // Helper function to get random element from array
    const getRandomElement = (arr) => {
        return arr[Math.floor(Math.random() * arr.length)];
    };

    // Helper function to get all class dates for a module
    const getClassDatesForModule = (startDate, endDate, classesPerWeek, selectedDays) => {
        const classDates = [];
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

            if (selectedDays.includes(dayName)) {
                classDates.push({
                    date: new Date(currentDate),
                    day: dayName,
                    weekNumber: getWeekNumber(currentDate)
                });
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Limit to required number of classes per week
        const totalWeeks = Math.ceil((endDate - startDate) / (7 * 24 * 60 * 60 * 1000));
        const maxClasses = totalWeeks * classesPerWeek;

        return classDates.slice(0, Math.min(classDates.length, maxClasses));
    };

    // Generate schedule for each semester module
    for (let moduleIndex = 0; moduleIndex < semesterModulesToProcess.length; moduleIndex++) {

        const semesterModule = semesterModulesToProcess[moduleIndex];
        const module = semesterModule.moduleId; // Get the actual module from semester module

        // Debug: Log module being processed
        console.log(`🚀 ~ Processing semester module: ${semesterModule._id} for module ${module.code} (${module._id})`);

        // Calculate module dates
        const { startDate: moduleStartDate, endDate: moduleEndDate } = calculateModuleDates(moduleIndex, semesterModulesToProcess.length);

        // Select one random day and time slot
        const randomDay = getRandomElement(DAYS_OF_WEEK);
        const randomTimeSlot = getRandomElement(TIME_SLOTS);

        // Pick any valid date for the randomDay within the start-end range
        let classDate = new Date(moduleStartDate);
        while (classDate <= moduleEndDate) {
            const day = classDate.toLocaleDateString('en-US', { weekday: 'long' });
            if (day === randomDay) break;
            classDate.setDate(classDate.getDate() + 1);
        }

        // Get available resources
        const availableRooms = getAvailableRooms(randomDay, randomTimeSlot, classDate);
        const availableLecturers = getAvailableLecturers(randomDay, randomTimeSlot, classDate);
        
        if (availableRooms.length === 0) {
            console.warn(`🚨 No available rooms for ${randomDay} at ${randomTimeSlot.start}`);
            continue;
        }
        
        if (availableLecturers.length === 0) {
            console.warn(`🚨 No available lecturers for ${randomDay} at ${randomTimeSlot.start}`);
            continue;
        }

        const selectedRoom = getRandomElement(availableRooms);
        const selectedLecturer = getRandomElement(availableLecturers);

        console.log("🚀 ~ generateClassSchedule ~ selectedIntakeCourse:", selectedIntakeCourse)
        console.log("🚀 ~ generateClassSchedule ~ selectedSemester:", selectedSemester)
        console.log("🚀 ~ generateClassSchedule ~ semesterModule:", semesterModule)
        console.log("🚀 ~ generateClassSchedule ~ module:", module)

        const classEntry = {
            intakeCourseId: selectedIntakeCourse._id,
            courseId: selectedIntakeCourse.courseId._id,
            courseName: selectedIntakeCourse.courseId.courseName,
            courseCode: selectedIntakeCourse.courseId.courseCode,
            intakeId: selectedIntakeCourse.intakeId._id,
            intakeName: selectedIntakeCourse.intakeId.intakeName,
            semesterModuleId: semesterModule._id, // Use the actual semester module ID
            moduleId: module._id, // Add moduleId for easier access
            moduleName: module.moduleName,
            moduleCode: module.code,
            dayOfWeek: randomDay,
            startTime: randomTimeSlot.start,
            endTime: randomTimeSlot.end,
            roomId: selectedRoom._id,
            roomName: selectedRoom.roomName || `Room ${selectedRoom.roomNumber}`,
            lecturerId: selectedLecturer._id,
            lecturerName: selectedLecturer.name || selectedLecturer.userId?.name,
            schoolId: selectedIntakeCourse.schoolId._id,
            moduleStartDate,
            moduleEndDate,
            semesterId: selectedSemester._id, // Keep semesterId for reference
        };

        markResourceUsed(randomDay, randomTimeSlot, classDate, selectedRoom._id, selectedLecturer._id);
        schedule.push(classEntry);

    }

    // Sort schedule by date and time
    schedule.sort((a, b) => {
        const dateCompare = new Date(a.moduleStartDate) - new Date(b.moduleStartDate);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
    });

    console.log("🚀 ~ generateClassSchedule ~ Final schedule:", {
        totalClasses: schedule.length,
        semesterModulesProcessed: semesterModulesToProcess.length,
        schedule: schedule.map(s => ({
            module: s.moduleCode,
            day: s.dayOfWeek,
            time: s.startTime,
            room: s.roomName,
            semesterModuleId: s.semesterModuleId
        }))
    });

    return {
        schedule,
    };
};

export default generateClassSchedule;