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

        // Extract nested properties safely - handle both nested and direct structures
        // For exam schedules, moduleId and semesterId come from semesterModuleId
        const moduleId = exam.semesterModuleId?.moduleId?._id || exam.moduleId?._id || exam.moduleId
        const courseId = exam.intakeCourseId?.courseId?._id || exam.courseId
        const semesterId = exam.semesterModuleId?.semesterId?._id || exam.semesterId?._id || exam.semesterId

        // Get module details from various possible sources
        const moduleName = exam.semesterModuleId?.moduleId?.moduleName || exam.moduleId?.moduleName || exam.moduleName || 'Unknown Module'
        const moduleCode = exam.semesterModuleId?.moduleId?.code || exam.moduleId?.code || exam.moduleCode || 'Unknown Code'

        const transformed = {
            id: exam._id,
            type: 'exam', // Add type field
            dayOfWeek: dayOfWeek,
            startTime: startTime,
            endTime: endTime,
            moduleId: moduleId,
            intakeCourseId: exam.intakeCourseId,
            courseId: courseId,
            roomId: exam.roomId,
            schoolId: exam.schoolId,
            semesterModuleId: exam.semesterModuleId,
            semesterId: semesterId, // Add semester ID
            examDate: exam.examDate,
            durationMinute: exam.durationMinute,
            invigilators: exam.invigilators,
            // Additional exam-specific fields
            subject: moduleName,
            code: moduleCode,
            room: exam.roomId, // Assuming roomId has room details
            lecturer: exam.invigilators?.[0] || null, // First invigilator as primary
        }
                
        return transformed
    })
}

// Helper function to transform class schedule data
export const transformClassToScheduleFormat = (classSchedules) => {
    return classSchedules.map(classItem => {
        // Handle both nested and direct property structures
        const moduleId = classItem.moduleId?._id || classItem.moduleId || classItem.semesterModuleId?.moduleId?._id;
        const semesterId = classItem.semesterId?._id || classItem.semesterId || classItem.semesterModuleId?.semesterId?._id;
        const moduleName = classItem.moduleName || classItem.semesterModuleId?.moduleId?.moduleName || 'Unknown Module';
        const moduleCode = classItem.moduleCode || classItem.code || classItem.semesterModuleId?.moduleId?.code || 'Unknown Code';
        const lecturerName = classItem.lecturerName || classItem.lecturerId?.userId?.name || 'Unassigned';
        
        return ({
            id: classItem._id,
            type: 'class', // Add type field
            dayOfWeek: classItem.dayOfWeek,
            startTime: classItem.startTime,
            endTime: classItem.endTime,
            moduleId: moduleId,
            intakeCourseId: classItem.intakeCourseId,
            lecturerId: classItem.lecturerId,
            roomId: classItem.roomId,
            schoolId: classItem.schoolId,
            semesterId: semesterId,
            semesterModuleId: classItem.semesterModuleId,
            // Additional class-specific fields
            subject: moduleName,
            code: moduleCode,
            room: classItem.roomId,
            lecturer: lecturerName,
        });
    })
}

// Main function to combine schedules
export const combineScheduleData = (classSchedules, examSchedules) => {
    const transformedClasses = transformClassToScheduleFormat(classSchedules)
    const transformedExams = transformExamToScheduleFormat(examSchedules)

    const combined = [...transformedClasses, ...transformedExams]
    
    return combined
}

// Get color scheme for schedule types
export const getTypeColor = (type, examType = null) => {

    if (type == "class") {
        return { bg: 'gray.100', border: 'gray.400', text: 'gray.800' }
    }
    if (type == 'exam') {
        return {
            bg: 'red.100',
            border: 'red.400',
            text: 'red.800'
        }
    }
    return "gray"
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

        // Extract nested properties safely
        const moduleId = exam.moduleId?._id || exam.moduleId
        const courseId = exam.intakeCourseId?.courseId?._id || exam.courseId
        const semesterId = exam.semesterId?._id || exam.semesterId

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
            courseId: courseId,
            moduleId: moduleId,
            semesterModuleId: exam.semesterModuleId,
            semesterId: semesterId // Add semester ID
        }
    })
}

// Transform class data for display
export const transformClassData = (classData) => {
    return classData.map(classItem => ({
        id: classItem._id,
        code: classItem.semesterModuleId?.moduleId?.code ?? 'N/A',
        subject: classItem.semesterModuleId?.moduleId?.moduleName ?? 'Unknown',
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
        moduleId: classItem.semesterModuleId?.moduleId, // Get moduleId from semesterModule
        lecturerId: classItem.lecturerId,
        semesterModuleId: classItem.semesterModuleId,
        semesterId: classItem.semesterModuleId?.semesterId // Get semesterId from semesterModule
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
        if (!selectedCourse || !selectedIntake || !selectedSemester) return false

        if (
            (selectedCourse &&
                item.intakeCourseId?.courseId?._id !== selectedCourse) ||
            (selectedIntake &&
                item.intakeCourseId?.intakeId?._id !== selectedIntake)
        ) return false

        // Filter by year if selected
        if (selectedYear && item.semesterId?.year?.toString() !== selectedYear) return false

        // Filter by semester if selected
        if (selectedSemester && item.semesterId?.semesterNumber !== selectedSemester.semesterNumber) return false

        if (selectedModule &&
            item.moduleId !== selectedModule) return false

        return true
    })
} 