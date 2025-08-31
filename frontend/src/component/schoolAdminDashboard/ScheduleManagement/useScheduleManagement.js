import { useState, useEffect } from "react"
import { useAcademicStore } from "../../../store/academic.js"
import { useGeneralStore } from "../../../store/general.js"
import { useShowToast } from "../../../store/utils/toast.js"
import * as XLSX from "xlsx"
import generateClassSchedule from "./generateClassSchedule.js"
import generateExamSchedule from "./generateExamSchedule.js"
import { combineScheduleData } from "./ScheduleUtils.js"

export const useScheduleManagement = () => {
    const {
        semesters,
        fetchSemesters,
        fetchSemestersByCourse,
        fetchSemestersByIntakeCourse,
        createClassSchedule,
        createExamSchedule,
        classSchedules,
        fetchClassSchedules,
        lecturers,
        rooms,
        fetchIntakeCourses,
        fetchLecturers,
        fetchRooms,
        intakeCourses,
        modules,
        fetchModules,
        examSchedules,
        fetchExamSchedules,
        semesterModules,
        fetchSemesterModulesBySchoolId
    } = useAcademicStore()


    const { exportTemplate } = useGeneralStore()
    const showToast = useShowToast()

    // State management
    const [viewMode, setViewMode] = useState("weekly")
    const [csvData, setCsvData] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedIntake, setSelectedIntake] = useState("")
    const [selectedCourse, setSelectedCourse] = useState("")
    const [selectedModule, setSelectedModule] = useState("")
    const [selectedSemester, setSelectedSemester] = useState(null)
    const [selectedYear, setSelectedYear] = useState("")
    const [availableSemesters, setAvailableSemesters] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [showExams, setShowExams] = useState(true)
    const [showClasses, setShowClasses] = useState(true)
    const [generateExam, setGenerateExam] = useState(false)
    const [selectedSchedule, setSelectedSchedule] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [triggerDownload, setTriggerDownload] = useState(false)

    // Initialize data
    useEffect(() => {
        fetchIntakeCourses()
        fetchModules()
        fetchLecturers()
        fetchRooms()
        fetchClassSchedules()
        fetchExamSchedules()
        fetchSemesters()
        fetchSemesterModulesBySchoolId()
    }, [])


    // Fetch semesters when intake and course are selected
    useEffect(() => {
        const fetchSemestersForIntakeCourse = async () => {
            if (selectedIntake && selectedCourse) {
                const selectedIntakeCourse = intakeCourses?.find(
                    ic => ic.intakeId._id === selectedIntake && ic.courseId._id === selectedCourse
                )

                if (selectedIntakeCourse) {
                    try {
                        const response = await fetchSemestersByIntakeCourse(selectedIntakeCourse._id)
                        if (response.success) {
                            setAvailableSemesters(response.data)
                            setSelectedYear("")
                            setSelectedSemester(null)
                        }
                    } catch (error) {
                        console.error("Error fetching semesters:", error)
                        setAvailableSemesters([])
                        setSelectedSemester(null)
                        setSelectedYear("")
                    }
                }
            } else {
                setAvailableSemesters([])
                setSelectedSemester(null)
                setSelectedYear("")
            }
        }

        fetchSemestersForIntakeCourse()
    }, [selectedIntake, selectedCourse, intakeCourses])

    // Modal handlers
    const handleEditClick = (schedule) => {
        setSelectedSchedule(schedule)
        setIsModalOpen(true)
    }

    const handleModalClose = () => {
        setIsModalOpen(false)
        setSelectedSchedule(null)
    }

    // Schedule generation
    const proceedGenerateSchedule = async () => {
        try {
            const scheduleConfig = {
                classesPerWeek: 2,
                moduleDurationWeeks: 12,
                semesterStartDate: new Date(),
                daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                timeSlots: [
                    { start: "08:00", end: "10:00" },
                    { start: "10:00", end: "12:00" },
                    { start: "12:00", end: "14:00" },
                    { start: "14:00", end: "16:00" },
                    { start: "16:00", end: "18:00" }
                ]
            }

            const selectedIntakeCourse = await intakeCourses?.find(
                ic => ic.intakeId._id === selectedIntake && ic.courseId._id === selectedCourse
            )

            const { schedule, summary } = await generateClassSchedule(
                selectedIntake,
                selectedCourse,
                selectedIntakeCourse,
                modules,
                rooms,
                lecturers,
                scheduleConfig,
                selectedSemester,
                selectedModule,
                semesterModules // Pass semesterModules from the store
            )

            if (schedule.length === 0) {
                showToast.error("No classes generated", "Unable to generate schedule with current resources", "no-schedule")
                return
            }

            let combinedScheduleData = []

            const formattedClassSchedule = schedule.map(item => ({
                type: "class",
                intakeCourseId: item.intakeCourseId,
                courseId: item.courseId,
                courseName: item.courseName,
                courseCode: item.courseCode,
                moduleId: item.moduleId,
                moduleName: item.moduleName,
                moduleCode: item.moduleCode,
                intakeId: item.intakeId,
                intakeName: item.intakeName,
                semesterModuleId: item.semesterModuleId, // Use semesterModuleId for validation
                semesterId: selectedSemester._id,
                dayOfWeek: item.dayOfWeek,
                startTime: item.startTime,
                endTime: item.endTime,
                moduleStartDate: item.moduleStartDate ? new Date(item.moduleStartDate).toLocaleDateString() : '',
                moduleEndDate: item.moduleEndDate ? new Date(item.moduleEndDate).toLocaleDateString() : '',
                roomId: item.roomId,
                roomName: item.roomName,
                lecturerId: item.lecturerId,
                lecturerName: item.lecturerName,
                schoolId: item.schoolId,
                examDate: "",
                examTime: "",
                durationMinute: "",
                invigilators: ""
            }))

            combinedScheduleData = [...formattedClassSchedule]

            if (generateExam) {
                const examSchedule = generateExamSchedule(schedule, rooms, lecturers, selectedSemester, selectedModule)

                const formattedExamSchedule = examSchedule.map(item => ({
                    type: "exam",
                    intakeCourseId: item.intakeCourseId,
                    courseId: selectedIntakeCourse?.courseId?._id || "",
                    courseName: selectedIntakeCourse?.courseId?.courseName || "",
                    courseCode: selectedIntakeCourse?.courseId?.courseCode || "",
                    moduleId: item.semesterModuleId?.moduleId?._id || item.moduleId || "",
                    moduleName: item.semesterModuleId?.moduleId?.moduleName || modules?.find(m => m._id === item.moduleId)?.moduleName || "",
                    moduleCode: item.semesterModuleId?.moduleId?.code || modules?.find(m => m._id === item.moduleId)?.code || "",
                    intakeId: selectedIntakeCourse?.intakeId?._id || "",
                    intakeName: selectedIntakeCourse?.intakeId?.intakeName || "",
                    semesterModuleId: item.semesterModuleId || "", // Use semesterModuleId for validation
                    semesterId: item.semesterModuleId?.semesterId?._id || selectedSemester._id,
                    dayOfWeek: "",
                    startTime: "",
                    endTime: "",
                    moduleStartDate: "",
                    moduleEndDate: "",
                    roomId: item.roomId,
                    roomName: rooms?.find(r => r._id === item.roomId)?.roomName || "",
                    lecturerId: "",
                    lecturerName: "",
                    schoolId: item.schoolId,
                    examDate: item.examDate,
                    examTime: item.examTime,
                    durationMinute: item.durationMinute,
                    invigilators: item.invigilators.join(', ')
                }))

                combinedScheduleData = [...combinedScheduleData, ...formattedExamSchedule]
            }

            const combinedColumns = [
                { header: "type", key: "type", width: 15 },
                { header: "intakeCourseId", key: "intakeCourseId", width: 25 },
                { header: "courseId", key: "courseId", width: 25 },
                { header: "courseName", key: "courseName", width: 30 },
                { header: "courseCode", key: "courseCode", width: 30 },
                { header: "moduleId", key: "moduleId", width: 25 },
                { header: "moduleName", key: "moduleName", width: 30 },
                { header: "moduleCode", key: "moduleCode", width: 15 },
                { header: "intakeId", key: "intakeId", width: 15 },
                { header: "intakeName", key: "intakeName", width: 15 },
                { header: "semesterModuleId", key: "semesterModuleId", width: 25 },
                { header: "semesterId", key: "semesterId", width: 25 },
                { header: "dayOfWeek", key: "dayOfWeek", width: 15 },
                { header: "startTime", key: "startTime", width: 15 },
                { header: "endTime", key: "endTime", width: 15 },
                { header: "moduleStartDate", key: "moduleStartDate", width: 20 },
                { header: "moduleEndDate", key: "moduleEndDate", width: 20 },
                { header: "roomId", key: "roomId", width: 25 },
                { header: "roomName", key: "roomName", width: 20 },
                { header: "lecturerId", key: "lecturerId", width: 25 },
                { header: "lecturerName", key: "lecturerName", width: 25 },
                { header: "schoolId", key: "schoolId", width: 25 },
                { header: "examDate", key: "examDate", width: 20 },
                { header: "examTime", key: "examTime", width: 15 },
                { header: "durationMinute", key: "durationMinute", width: 15 },
                { header: "invigilators", key: "invigilators", width: 30 }
            ]

            const fileName = generateExam
                ? `CombinedSchedule-${selectedIntakeCourse?.intakeId?.intakeName}-${selectedIntakeCourse?.courseId?.courseCode}`
                : `ClassSchedule-${selectedIntakeCourse?.intakeId?.intakeName}-${selectedIntakeCourse?.courseId?.courseCode}`

            await exportTemplate(combinedColumns, combinedScheduleData, fileName)

            showToast.success("Schedule Templates Generated Successfully", "Excel files have been downloaded. Import them to add schedules to the database.", "schedule-success")

        } catch (error) {
            console.error("Error generating class schedule:", error)
            showToast.error("Generation Failed", error.message || "Unable to generate class or exam schedule", "generation-error")
        }
    }

    // File upload handler
    const handleFileUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        setIsLoading(true)

        const reader = new FileReader()

        reader.onload = async (e) => {
            try {
                const data = e.target.result
                const workbook = XLSX.read(data, { type: "array" })
                const sheetName = workbook.SheetNames[0]
                const sheet = workbook.Sheets[sheetName]
                const parsedData = XLSX.utils.sheet_to_json(sheet, { defval: "" })

                setCsvData(parsedData)
                setIsSubmitting(true)
                showToast.success("File Uploaded", `${parsedData.length} rows extracted`, "id-1")

                let classCount = 0
                let examCount = 0
                let errorCount = 0

                for (const scheduleData of parsedData) {
                    try {
                        const scheduleType = scheduleData.type?.toLowerCase()

                        if (scheduleType === "class") {

                            const res = await createClassSchedule(scheduleData)
                            if (res.success) {
                                classCount++
                            } else {
                                showToast.error("Error creating class schedule", res.message, `class-error-${classCount}`)
                                errorCount++
                            }
                        } else if (scheduleType === "exam") {
                            const examData = {
                                ...scheduleData,
                                invigilators: scheduleData.invigilators ? scheduleData.invigilators.split(', ').filter(inv => inv.trim()) : []
                            }


                            const res = await createExamSchedule(examData)
                            if (res.success) {
                                examCount++
                            } else {
                                showToast.error("Error creating exam schedule", res.message, `exam-error-${examCount}`)
                                errorCount++
                            }
                        } else {
                            showToast.error("Invalid schedule type", `Unknown type: ${scheduleType}. Expected 'class' or 'exam'`, `type-error-${errorCount}`)
                            errorCount++
                        }
                    } catch (error) {
                        console.error("Error processing schedule:", error)
                        showToast.error("Processing error", error.message, `process-error-${errorCount}`)
                        errorCount++
                    }
                }

                if (classCount > 0 || examCount > 0) {
                    showToast.success(
                        "Import completed",
                        `Successfully imported: ${classCount} class schedules, ${examCount} exam schedules${errorCount > 0 ? `. ${errorCount} errors occurred.` : ''}`,
                        "import-success"
                    )
                }

                await fetchClassSchedules()
                await fetchExamSchedules()
            } catch (error) {
                console.error("Error reading file:", error)
                showToast.error("Upload Error", "Invalid Excel format", "id")
            } finally {
                setIsLoading(false)
            }
        }

        reader.onerror = () => {
            setIsLoading(false)
            showToast.error("Read Error", "Failed to read file", "error")
        }

        reader.readAsArrayBuffer(file)
    }

    // Get combined schedule data
    const scheduleData = combineScheduleData(classSchedules, examSchedules)

    // Apply comprehensive filtering
    let allItems = scheduleData.filter(item => {

        // Check if required filters are selected
        if (!selectedCourse || !selectedIntake || !selectedYear || !selectedSemester) {
            return false;
        }

        // Default: don't include
        let include = false;

        // Type filtering
        if (item.type === 'exam' && showExams) include = true;
        if (item.type === 'class' && showClasses) include = true;

        if (!include) return false;

        // Filter by intake (deep path check)
        if (
            selectedIntake &&
            item.intakeCourseId?.intakeId?._id !== selectedIntake
        ) {
            return false;
        }

        // Filter by course (assuming courseId is under intakeCourseId.courseId._id)
        if (
            selectedCourse &&
            item.intakeCourseId?.courseId?._id !== selectedCourse
        ) {
            return false;
        }

        // Filter by year - handle both nested and direct semesterId structures
        if (selectedYear) {
            // For exam schedules, get year from semesterModuleId.semesterId.year
            // For class schedules, get year from semesterId.year or semesterModuleId.semesterId.year
            const itemYear = item.type === 'exam'
                ? item.semesterModuleId?.semesterId?.year
                : (item.semesterId?.year || item.semesterModuleId?.semesterId?.year);


            if (itemYear?.toString() !== selectedYear) {
                return false;
            }
        }

        // Filter by semester - handle both nested and direct semesterId structures
        if (selectedSemester) {

            const itemSemesterNumber = item.type === 'exam'
                ? item.semesterModuleId?.semesterId?.semesterNumber
                : (item.semesterId?.semesterNumber || item.semesterModuleId?.semesterId?.semesterNumber);

            if (itemSemesterNumber !== selectedSemester.semesterNumber) {
                return false;
            }
        }


        // Filter by module
        if (
            selectedModule &&
            item.moduleId !== selectedModule
        ) {
            return false;
        }

        return true;
    });

    return {
        // State
        viewMode,
        setViewMode,
        csvData,
        isSubmitting,
        selectedIntake,
        setSelectedIntake,
        selectedCourse,
        setSelectedCourse,
        selectedModule,
        setSelectedModule,
        selectedSemester,
        setSelectedSemester,
        selectedYear,
        setSelectedYear,
        availableSemesters,
        setAvailableSemesters,
        isLoading,
        showExams,
        setShowExams,
        showClasses,
        setShowClasses,
        generateExam,
        setGenerateExam,
        selectedSchedule,
        isModalOpen,
        triggerDownload,
        setTriggerDownload,

        // Data
        classSchedules,
        examSchedules,
        lecturers,
        rooms,
        intakeCourses,
        modules,
        scheduleData,
        allItems,

        // Handlers
        handleEditClick,
        handleModalClose,
        proceedGenerateSchedule,
        handleFileUpload,

        // Store methods
        fetchClassSchedules,
        fetchExamSchedules,
    }
} 