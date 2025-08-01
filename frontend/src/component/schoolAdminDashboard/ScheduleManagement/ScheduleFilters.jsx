import {
    HStack,
    FormControl,
    FormLabel,
    Select,
    Badge,
    Text,
    VStack,
    Button,
    useColorModeValue,
    Card,
    CardBody,
} from "@chakra-ui/react"
import React, { useEffect } from "react"
import { FiRefreshCw } from "react-icons/fi"
import { useAcademicStore } from "../../../store/academic.js"

export default function ScheduleFilters({
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
    allItems,
    onGenerateClick,
    triggerDownload,
    setTriggerDownload,
}) {
    const { intakeCourses, modules, fetchIntakeCourses, fetchModules, fetchSemestersByCourse } = useAcademicStore()

    const bgColor = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.600")

    useEffect(() => {
        fetchIntakeCourses()
        fetchModules()
    }, [])

    // Fetch semesters when intake and course are selected
    useEffect(() => {
        const fetchSemestersForIntakeCourse = async () => {
            if (selectedIntake && selectedCourse) {
                // Find the selected intake course
                const selectedIntakeCourse = intakeCourses?.find(
                    ic => ic.intakeId._id === selectedIntake && ic.courseId._id === selectedCourse
                )

                if (selectedIntakeCourse) {
                    try {
                        const response = await fetchSemestersByCourse(selectedIntakeCourse.courseId._id)
                        if (response.success) {
                            setAvailableSemesters(response.data)
                            // Reset year and semester when course changes
                            setSelectedYear("")
                            setSelectedSemester("")
                        }
                    } catch (error) {
                        console.error("Error fetching semesters:", error)
                        setAvailableSemesters([])
                        setSelectedSemester("")
                        setSelectedYear("")
                    }
                }
            } else {
                setAvailableSemesters([])
                setSelectedSemester("")
                setSelectedYear("")
            }
        }

        fetchSemestersForIntakeCourse()
    }, [selectedIntake, selectedCourse, intakeCourses])

    return (
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
                <HStack justify="space-between" align="end" flexWrap="wrap" spacing={4}>
                    <HStack spacing={4} flex={1}>
                        <FormControl maxW="200px">
                            <FormLabel fontSize="sm">
                                <Badge colorScheme="green">Intake</Badge>
                            </FormLabel>
                            <Select
                                placeholder="Select Intake"
                                value={selectedIntake}
                                onChange={e => {
                                    setSelectedIntake(e.target.value)
                                    setSelectedCourse("")
                                    setSelectedModule("")
                                    setSelectedSemester("")
                                    setAvailableSemesters([])
                                }}
                            >
                                {intakeCourses?.map(intakeCourse => (
                                    <option key={intakeCourse._id} value={intakeCourse.intakeId._id}>
                                        {intakeCourse.intakeId.intakeName}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl maxW="300px">
                            <FormLabel fontSize="sm">
                                <Badge colorScheme="blue">Course</Badge>
                            </FormLabel>
                            <Select
                                disabled={selectedIntake === ""}
                                placeholder="Select Course"
                                value={selectedCourse}
                                onChange={e => {
                                    setSelectedCourse(e.target.value)
                                    setSelectedSemester("")
                                    setAvailableSemesters([])
                                }}
                            >
                                {intakeCourses?.map(intakeCourse => {
                                    if (intakeCourse.intakeId._id === selectedIntake) {
                                        return (
                                            <option key={intakeCourse._id} value={intakeCourse.courseId._id}>
                                                {intakeCourse.courseId.courseName}
                                            </option>
                                        )
                                    }
                                    return null
                                })}
                            </Select>
                        </FormControl>

                        <FormControl maxW="200px">
                            <FormLabel fontSize="sm">
                                <Badge colorScheme="purple">Year</Badge>
                            </FormLabel>
                            <Select
                                disabled={selectedCourse === "" || selectedIntake === ""}
                                placeholder="Select Year"
                                value={selectedYear}
                                onChange={e => {
                                    setSelectedYear(e.target.value)
                                    setSelectedSemester("")
                                }}
                            >
                                {availableSemesters?.reduce((years, semester) => {
                                    const year = semester.year?.toString()
                                    if (year && !years.includes(year)) {
                                        years.push(year)
                                    }
                                    return years
                                }, []).sort((a, b) => b - a).map(year => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl maxW="250px">
                            <FormLabel fontSize="sm">
                                <Badge colorScheme="purple">Semester</Badge>
                            </FormLabel>
                            <Select
                                disabled={selectedCourse === "" || selectedIntake === "" || selectedYear === "" || availableSemesters.length === 0}
                                placeholder="Select Semester"
                                value={selectedSemester}
                                onChange={e => setSelectedSemester(e.target.value)}
                            >
                                {availableSemesters?.filter(semester => semester.year?.toString() === selectedYear).map(semester => (
                                    <option key={semester._id} value={semester._id}>
                                        {semester.semesterName}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl maxW="300px">
                            <FormLabel fontSize="sm">
                                <Badge>Module (Optional)</Badge>
                            </FormLabel>
                            <Select
                                disabled={selectedCourse === "" || selectedIntake === ""}
                                placeholder="Select Module"
                                value={selectedCourse === "" || selectedIntake === "" ? "" : selectedModule}
                                onChange={e => setSelectedModule(e.target.value)}
                            >
                                {modules?.filter(m => {
                                    return m.courseId.some(c => c._id === selectedCourse)
                                }).map(m => (
                                    <option key={m._id} value={m._id}>
                                        {m.moduleName}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                    </HStack>

                    <VStack>
                        <Button
                            leftIcon={allItems.length > 0 ? "" : <FiRefreshCw />}
                            colorScheme={allItems.length > 0 ? "gray" : "blue"}
                            onClick={() => {
                                onGenerateClick()
                                setTriggerDownload(true)
                            }}
                            isDisabled={!selectedCourse || !selectedIntake || !selectedYear || !selectedSemester || allItems.length > 0}
                        >
                            {(allItems.length > 0) ? "Schedule for selected intake course existed" : "Generate"}
                        </Button>
                    </VStack>
                </HStack>

                {(!selectedCourse || !selectedIntake || !selectedYear || !selectedSemester) && (
                    <Text color="gray.500" fontSize="sm" mt={2}>
                        Select an intake, course, year, and semester to download/ generate class schedule template
                    </Text>
                )}
            </CardBody>
        </Card>
    )
} 