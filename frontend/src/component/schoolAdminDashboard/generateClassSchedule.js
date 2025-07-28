const generateClassSchedule = async (selectedIntake, selectedCourse, selectedIntakeCourse, modules, rooms, lecturers, scheduleConfig = {}) => {
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

    if (!selectedIntakeCourse) {
        throw new Error("Selected intake course not found");
    }

    // Get all modules for the selected course
    const courseModules = modules?.filter(module =>
        module.courseId.some(courseId => courseId._id === selectedCourse)
    ) || [];

    if (courseModules.length === 0) {
        throw new Error("No modules found for the selected course");
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

    // Generate schedule for each module
    for (let moduleIndex = 0; moduleIndex < courseModules.length; moduleIndex++) {

        const module = courseModules[moduleIndex];

        // Skip modules not linked to selected intake course
        if (module.courseId?.includes(selectedIntakeCourse.courseId._id)) continue;

        // Calculate module dates
        const { startDate: moduleStartDate, endDate: moduleEndDate } = calculateModuleDates(moduleIndex, courseModules.length);

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
        if (availableRooms.length === 0 || availableLecturers.length === 0) continue;

        const selectedRoom = getRandomElement(availableRooms);
        const selectedLecturer = getRandomElement(availableLecturers);

        const classEntry = {
            intakeCourseId: selectedIntakeCourse._id,
            courseId: selectedIntakeCourse.courseId._id,
            courseName: selectedIntakeCourse.courseId.courseName,
            courseCode: selectedIntakeCourse.courseId.courseCode,
            intakeId: selectedIntakeCourse.intakeId._id,
            intakeName: selectedIntakeCourse.intakeId.intakeName,
            moduleId: module._id,
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
        };

        markResourceUsed(randomDay, randomTimeSlot, classDate, selectedRoom._id, selectedLecturer._id);
        schedule.push(classEntry);

    }

    // Sort schedule by date and time
    schedule.sort((a, b) => {
        const dateCompare = new Date(a.classDate) - new Date(b.classDate);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
    });

    return {
        schedule,
    };
};

export default generateClassSchedule;