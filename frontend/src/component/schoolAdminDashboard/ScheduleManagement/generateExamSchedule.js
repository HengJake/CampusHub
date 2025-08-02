const generateExamSchedule = (classSchedule, rooms, lecturers, selectedSemester = null) => {
    if (!classSchedule || classSchedule.length === 0) {
        return [];
    }

    const examSchedule = [];
    const EXAM_DURATION_MINUTES = 120; // 2 hours default
    const EXAM_TIME_SLOTS = [
        "09:00",
        "14:00"
    ];

    // Helper function to get random element from array
    const getRandomElement = (arr) => {
        return arr[Math.floor(Math.random() * arr.length)];
    };

    // Helper function to get available invigilators (exclude the lecturer teaching the module)
    const getAvailableInvigilators = (excludeLecturerId) => {
        return lecturers?.filter(lecturer => lecturer._id !== excludeLecturerId) || [];
    };

    // Helper function to calculate exam date (usually at the end of module)
    const calculateExamDate = (moduleEndDate) => {
        const examDate = new Date(moduleEndDate);
        // Schedule exam 1 week before module end date
        examDate.setDate(examDate.getDate() - 7);
        return examDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    };

    // Generate exam schedule for each unique module in the class schedule
    const processedModules = new Set();

    classSchedule.forEach(classItem => {
        const moduleKey = `${classItem.moduleId}-${classItem.intakeCourseId}`;

        // Skip if we've already processed this module for this intake course
        if (processedModules.has(moduleKey)) {
            return;
        }

        processedModules.add(moduleKey);

        // Get available rooms and invigilators
        const availableRooms = rooms || [];
        const availableInvigilators = getAvailableInvigilators(classItem.lecturerId);

        if (availableRooms.length === 0) {
            console.warn(`No rooms available for exam: ${classItem.moduleName}`);
            return;
        }

        // Select random room and time
        const selectedRoom = getRandomElement(availableRooms);
        const selectedTime = getRandomElement(EXAM_TIME_SLOTS);

        // Select 1-2 random invigilators
        const numberOfInvigilators = Math.min(2, availableInvigilators.length);
        const selectedInvigilators = [];

        for (let i = 0; i < numberOfInvigilators; i++) {
            const availableInvigilatorsForSelection = availableInvigilators.filter(
                inv => !selectedInvigilators.includes(inv._id)
            );
            if (availableInvigilatorsForSelection.length > 0) {
                const selectedInvigilator = getRandomElement(availableInvigilatorsForSelection);
                selectedInvigilators.push(selectedInvigilator._id);
            }
        }

        const examEntry = {
            intakeCourseId: classItem.intakeCourseId,
            moduleId: classItem.moduleId,
            examDate: calculateExamDate(classItem.moduleEndDate),
            examTime: selectedTime,
            durationMinute: EXAM_DURATION_MINUTES,
            roomId: selectedRoom._id,
            invigilators: selectedInvigilators,
            schoolId: classItem.schoolId
        };

        examSchedule.push(examEntry);
    });

    return examSchedule;
};

export default generateExamSchedule;