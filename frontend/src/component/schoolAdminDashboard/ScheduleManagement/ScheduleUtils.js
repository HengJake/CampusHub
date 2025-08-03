// Utility functions for schedule management

// Helper function to transform exam data to schedule format
export const transformExamToScheduleFormat = (examSchedules) => {
    return examSchedules.map(exam => {
        // Convert exam date to day of week
        const examDate = new Date(exam.examDate)
        const dayOfWeek = examDate.toLocaleDateString('en-US', { weekday: 'long' })

        // Calculate end time based on duration
        const startTime = exam.examTime
        const [hours, minutes] = startTime.split(':').map(Number)
        const startDate = new Date()
        startDate.setHours(hours, minutes, 0, 0)

        const endDate = new Date(startDate.getTime() + (exam.durationMinute * 60000))
        const endTime = endDate.toTimeString().slice(0, 5)

        return {
            id: exam._id,
            type: 'exam', // Add type field
            dayOfWeek: dayOfWeek,
            startTime: startTime,
            endTime: endTime,
            moduleId: exam.moduleId,
            intakeCourseId: exam.intakeCourseId,
            courseId: exam.courseId,
            roomId: exam.roomId,
            schoolId: exam.schoolId,
            semesterId: exam.semesterId, // Add semester ID
            examDate: exam.examDate,
            durationMinute: exam.durationMinute,
            invigilators: exam.invigilators,
            // Additional exam-specific fields
            subject: exam.moduleId?.moduleName || 'Unknown Module',
            code: exam.moduleId?.code || 'Unknown Code',
            room: exam.roomId, // Assuming roomId has room details
            lecturer: exam.invigilators?.[0] || null, // First invigilator as primary
        }
    })
}

// Helper function to transform class schedule data
export const transformClassToScheduleFormat = (classSchedules) => {
    return classSchedules.map(classItem => ({
        id: classItem._id,
        type: 'class', // Add type field
        dayOfWeek: classItem.dayOfWeek,
        startTime: classItem.startTime,
        endTime: classItem.endTime,
        moduleId: classItem.moduleId,
        intakeCourseId: classItem.intakeCourseId,
        lecturerId: classItem.lecturerId,
        roomId: classItem.roomId,
        schoolId: classItem.schoolId,
        semesterId: classItem.semesterId, // Add semester ID
        // Additional class-specific fields
        subject: classItem.moduleId?.moduleName || 'Unknown Module',
        code: classItem.moduleId?.code || 'Unknown Code',
        room: classItem.roomId,
        lecturer: classItem.lecturerId,
    }))
}

// Main function to combine schedules
export const combineScheduleData = (classSchedules, examSchedules) => {
    const transformedClasses = transformClassToScheduleFormat(classSchedules)
    const transformedExams = transformExamToScheduleFormat(examSchedules)

    return [...transformedClasses, ...transformedExams]
}

// Get color scheme for schedule types
export const getTypeColor = (type, examType = null) => {
    if (type === "class") {
        return { bg: 'gray.100', border: 'gray.400', text: 'gray.800' }
    }
    if (type === 'exam') {
        return {
            bg: 'red.100',
            border: 'red.400',
            text: 'red.800'
        }
    }
}

// Transform exam data for display
export const transformExamData = (examData) => {
    return examData.map(exam => {
        const examDate = new Date(exam.examDate)
        const dayOfWeek = examDate.toLocaleDateString('en-US', { weekday: 'long' })

        const startTime = exam.examTime
        const [hours, minutes] = startTime.split(':').map(Number)
        const startDate = new Date()
        startDate.setHours(hours, minutes, 0, 0)

        const endDate = new Date(startDate.getTime() + (exam.durationMinute * 60000))
        const endTime = endDate.toTimeString().slice(0, 5)

        return {
            id: exam._id,
            code: exam.moduleId?.code ?? 'N/A',
            subject: exam.moduleId?.moduleName ?? 'Unknown',
            room: exam.roomId?.roomNumber
                ? `${exam.roomId.block || 'Block'} ${exam.roomId.roomNumber}`
                : 'TBD',
            building: exam.roomId?.block ?? 'TBD',
            lecturer: exam.invigilators?.length > 0
                ? `${exam.invigilators.length} Invigilator(s)`
                : 'No Invigilator',
            startTime: startTime,
            endTime: endTime,
            date: examDate.toLocaleDateString(),
            dayOfWeek: dayOfWeek,
            type: "exam",
            examType: "Final",
            duration: `${exam.durationMinute} min`,
            examDate: exam.examDate,
            invigilators: exam.invigilators,
            durationMinute: exam.durationMinute,
            intakeCourseId: exam.intakeCourseId,
            courseId: exam.courseId,
            moduleId: exam.moduleId,
            semesterId: exam.semesterId // Add semester ID
        }
    })
}

// Transform class data for display
export const transformClassData = (classData) => {
    return classData.map(classItem => ({
        id: classItem._id,
        code: classItem.moduleId?.code ?? 'N/A',
        subject: classItem.moduleId?.moduleName ?? 'Unknown',
        room: classItem.roomId?.roomNumber
            ? `${classItem.roomId.block} ${classItem.roomId.roomNumber}`
            : 'TBD',
        building: classItem.roomId?.block ?? 'TBD',
        lecturer: classItem.lecturerId?.userId?.name ?? 'Unassigned',
        startTime: classItem.startTime,
        endTime: classItem.endTime,
        date: new Date().toLocaleDateString(),
        dayOfWeek: classItem.dayOfWeek,
        type: "class",
        examType: "",
        intakeCourseId: classItem.intakeCourseId,
        courseId: classItem.courseId,
        moduleId: classItem.moduleId,
        lecturerId: classItem.lecturerId,
        semesterId: classItem.semesterId // Add semester ID
    }))
}

// Get combined and filtered data
export const getCombinedAndFilteredData = (
    classSchedules,
    examSchedules,
    showClasses,
    showExams,
    selectedCourse,
    selectedIntake,
    selectedYear,
    selectedSemester,
    selectedModule
) => {
    let allItems = []

    if (showClasses && classSchedules) {
        allItems = [...allItems, ...transformClassData(classSchedules)]
    }

    if (showExams && examSchedules) {
        allItems = [...allItems, ...transformExamData(examSchedules)]
    }

    // Apply filters
    return allItems.filter(item => {
        if (!selectedCourse || !selectedIntake || !selectedSemester ) return false

        if (
            (selectedCourse &&
                item.intakeCourseId?.courseId?._id !== selectedCourse) ||
            (selectedIntake &&
                item.intakeCourseId?.intakeId?._id !== selectedIntake)
        ) return false

        // Filter by year if selected
        if (selectedYear && item.semesterId?.year?.toString() !== selectedYear) return false

        // Filter by semester if selected
        if (selectedSemester && item.semesterId?._id !== selectedSemester) return false

        if (selectedModule &&
            item.moduleId?._id !== selectedModule) return false

        return true
    })
} 