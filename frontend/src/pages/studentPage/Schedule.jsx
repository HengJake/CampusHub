import {
    Box,
    Grid,
    Text,
    Card,
    CardBody,
    VStack,
    HStack,
    Badge,
    useColorModeValue,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Icon,
    Button,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Flex,
    IconButton,
    useToast,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Divider,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Spinner,
    Center,
} from "@chakra-ui/react"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
    FiBook,
    FiCalendar,
    FiClock,
    FiMapPin,
    FiSearch,
    FiDownload,
    FiRefreshCw,
    FiUser,
    FiGrid,
    FiList,
} from "react-icons/fi"
import { useState, useEffect, useRef, useMemo } from "react"
import { useAcademicStore } from "../../store/academic"
import { useAuthStore } from "../../store/auth"

// Color mapping for different course types
const getColorForType = (type) => {
    const colorMap = {
        'Lecture': 'blue',
        'Lab': 'purple',
        'Tutorial': 'green',
        'Seminar': 'orange',
        'Workshop': 'teal',
        'default': 'gray'
    };
    return colorMap[type] || colorMap.default;
};

// Transform time from 24-hour format to 12-hour format
const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};

// Transform class schedule data to match the expected format
const transformClassScheduleData = (classSchedules, rooms, modules, lecturers, intakeCourse) => {
    // Filter modules that belong to the user's intake course
    const userModules = intakeCourse ? modules.filter(module =>
        module.courseId && module.courseId.some(course =>
            course._id === intakeCourse.courseId._id
        )
    ) : modules;

    // Add safety check for empty arrays
    if (!classSchedules || classSchedules.length === 0) {
        return [];
    }

    return classSchedules
        .filter(schedule => {
            // Only include schedules for modules that belong to the user's intake course
            // Add null checks to prevent errors
            if (!schedule.moduleId || !schedule.intakeCourseId || !intakeCourse) {
                return false;
            }

            const module = modules.find(m => m._id === schedule.moduleId._id);
            // console.log("🚀 ~ transformClassScheduleData ~ schedule:", schedule.intakeCourseId.courseId.courseName)
            // console.log("🚀 ~ transformClassScheduleData ~ schedule:", schedule.intakeCourseId.intakeId.intakeName)
            const filterModule = module && userModules.some(userModule => userModule._id === module._id) && schedule.intakeCourseId._id === intakeCourse._id;
            console.log(filterModule)
            return filterModule;
        })
        .map(schedule => {
            // Add null checks for all related objects
            const room = schedule.roomId ? rooms.find(r => r._id === schedule.roomId._id) : null;
            const module = schedule.moduleId ? modules.find(m => m._id === schedule.moduleId._id) : null;
            const lecturer = schedule.lecturerId ? lecturers.find(l => l._id === schedule.lecturerId._id) : null;

            return {
                id: schedule._id,
                courseCode: module?.code || 'N/A',
                courseName: module?.moduleName || 'N/A',
                day: schedule.dayOfWeek || 'N/A',
                time: `${formatTime(schedule.startTime || '')} - ${formatTime(schedule.endTime || '')}`,
                room: room ? `${room.block}-${room.roomNumber}` : 'N/A',
                building: room?.block || 'N/A',
                instructor: lecturer?.userId?.name || 'N/A',
                credits: module?.totalCreditHours || 0,
                type: 'Lecture', // Default type
                color: getColorForType('Lecture'),
                description: module?.moduleDescription || 'No description available',
                prerequisites: module?.prerequisites || 'None',
                textbook: module?.textbook || 'Not specified',
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                moduleStartDate: schedule.moduleStartDate,
                moduleEndDate: schedule.moduleEndDate,
                moduleId: module?._id,
                intakeCourseId: intakeCourse?._id,
            };
        });
};

export default function Schedule() {
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState("all")
    const [filterDay, setFilterDay] = useState("all")
    const [viewMode, setViewMode] = useState("table")
    const [lastRefresh, setLastRefresh] = useState(new Date())

    const bgColor = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.600")
    const toast = useToast()
    const hasFetchedRef = useRef(false)

    // Get store functions and state
    const {
        fetchClassSchedules,
        fetchRooms,
        fetchModules,
        fetchLecturers,
        fetchIntakeCourses,
        classSchedules,
        rooms,
        modules,
        lecturers,
        intakeCourses,
        loading,
        errors
    } = useAcademicStore()

    const { getCurrentUser } = useAuthStore()
    const currentUser = getCurrentUser()

    // Fetch data on component mount (only once)
    useEffect(() => {
        if (hasFetchedRef.current) return;

        const fetchData = async () => {
            try {
                hasFetchedRef.current = true;
                // Fetch all required data
                await Promise.all([
                    fetchClassSchedules(),
                    fetchRooms(),
                    fetchModules(),
                    fetchLecturers(),
                    fetchIntakeCourses()
                ]);
            } catch (error) {
                console.error("Error fetching schedule data:", error);
                toast({
                    title: "Error",
                    description: "Failed to load schedule data",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        };

        fetchData();
    }, []); // Empty dependency array - only run once

    // Use useMemo to transform data when raw data changes
    const scheduleData = useMemo(() => {
        // Add safety checks for all required data
        if (!classSchedules || classSchedules.length === 0 ||
            !rooms || !modules || !lecturers || !intakeCourses) {
            return {
                classSchedules: [],
                studentProfile: {
                    name: "Loading...",
                    studentId: "Loading...",
                    intakeCourse: "Loading...",
                    semester: "Loading...",
                    advisor: "Loading...",
                }
            };
        }

        // Get user's intake course
        if (!currentUser) {
            return {
                classSchedules: [],
                studentProfile: {
                    name: "Loading...",
                    studentId: "Loading...",
                    intakeCourse: "Loading...",
                    semester: "Loading...",
                    advisor: "Loading...",
                }
            };
        }

        const userIntakeCourseId = currentUser?.user?.student?.intakeCourseId;
        const userIntakeCourse = intakeCourses.find(ic => ic._id === userIntakeCourseId);

        // Transform the data
        const transformedClassSchedules = transformClassScheduleData(
            classSchedules,
            rooms,
            modules,
            lecturers,
            userIntakeCourse
        );

        return {
            classSchedules: transformedClassSchedules,
            studentProfile: {
                name: currentUser?.name || "Student",
                studentId: currentUser?.user?.student?.studentId || "N/A",
                intakeCourse: userIntakeCourse ? `${userIntakeCourse.intakeId?.intakeName || 'N/A'} - ${userIntakeCourse.courseId?.courseName || 'N/A'}` : "N/A",
                // TODO:find the current semester
                semester: "Current Semester",
                advisor: "Academic Advisor",
            }
        };
    }, [classSchedules, rooms, modules, lecturers, intakeCourses, currentUser?.name, currentUser?.user?.student?.studentId, currentUser?.user?.student?.intakeCourseId]);

    const handleRefresh = async () => {
        try {
            await Promise.all([
                fetchClassSchedules(),
                fetchRooms(),
                fetchModules(),
                fetchLecturers(),
                fetchIntakeCourses()
            ]);

            setLastRefresh(new Date());
            toast({
                title: "Schedule Refreshed",
                description: "Class schedule has been updated",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Refresh Failed",
                description: "Failed to refresh schedule data",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    }

    const handleExport = () => {
        try {
            // Create new PDF document in portrait orientation for first page
            const doc = new jsPDF()

            // Add title
            doc.setFontSize(20)
            doc.setFont('helvetica', 'bold')
            doc.text('Class Schedule', 20, 20)

            // Add student information
            doc.setFontSize(12)
            doc.setFont('helvetica', 'normal')
            doc.text(`Student: ${scheduleData.studentProfile.name}`, 20, 35)
            doc.text(`Student ID: ${scheduleData.studentProfile.studentId}`, 20, 45)
            doc.text(`Program: ${scheduleData.studentProfile.intakeCourse}`, 20, 55)
            doc.text(`Semester: ${scheduleData.studentProfile.semester}`, 20, 65)
            doc.text(`Academic Advisor: ${scheduleData.studentProfile.advisor}`, 20, 75)

            // Add statistics
            doc.setFontSize(14)
            doc.setFont('helvetica', 'bold')
            doc.text('Summary', 20, 95)
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.text(`Total Credits: ${totalCredits}`, 20, 105)
            doc.text(`Enrolled Courses: ${scheduleData.classSchedules.length}`, 20, 115)
            doc.text(`Lectures: ${lectureCount}`, 20, 125)
            doc.text(`Lab Sessions: ${labCount}`, 20, 135)

            // Add course details section
            if (filteredSchedule.length > 0) {
                let currentY = 155

                doc.setFontSize(14)
                doc.setFont('helvetica', 'bold')
                doc.text('Course Details', 20, currentY)
                currentY += 10

                filteredSchedule.forEach((course, index) => {
                    if (currentY > 250) {
                        doc.addPage()
                        currentY = 20
                    }

                    doc.setFontSize(12)
                    doc.setFont('helvetica', 'bold')
                    doc.text(`${course.courseCode} - ${course.courseName}`, 20, currentY)
                    currentY += 8

                    doc.setFontSize(10)
                    doc.setFont('helvetica', 'normal')
                    doc.text(`Description: ${course.description}`, 20, currentY)
                    currentY += 6
                    doc.text(`Prerequisites: ${course.prerequisites}`, 20, currentY)
                    currentY += 6
                    doc.text(`Textbook: ${course.textbook}`, 20, currentY)
                    currentY += 6
                    doc.text(`Schedule: ${course.day} ${course.time}`, 20, currentY)
                    currentY += 6
                    doc.text(`Location: ${course.room} (${course.building})`, 20, currentY)
                    currentY += 6
                    doc.text(`Instructor: ${course.instructor}`, 20, currentY)
                    currentY += 10
                })
            }

            // Add footer to first page
            doc.setFontSize(8)
            doc.setFont('helvetica', 'normal')
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, doc.internal.pageSize.height - 20)

            // Create a new landscape page for the schedule table
            if (filteredSchedule.length > 0) {
                doc.addPage([], 'landscape')

                // Add title for the table page
                doc.setFontSize(16)
                doc.setFont('helvetica', 'bold')
                doc.text('Class Schedule Table', 20, 20)

                // Prepare table data
                const tableData = filteredSchedule.map(schedule => [
                    schedule.courseCode,
                    schedule.courseName,
                    schedule.day,
                    schedule.time,
                    schedule.room,
                    schedule.instructor,
                    `${schedule.credits} Credits`,
                    schedule.type
                ])

                // Add table with better spacing for landscape
                autoTable(doc, {
                    startY: 35,
                    head: [['Course Code', 'Course Name', 'Day', 'Time', 'Room', 'Instructor', 'Credits', 'Type']],
                    body: tableData,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [66, 139, 202],
                        textColor: 255,
                        fontSize: 9
                    },
                    bodyStyles: {
                        fontSize: 8,
                        cellPadding: 3
                    },
                    columnStyles: {
                        0: { cellWidth: 25 }, // Course Code
                        1: { cellWidth: 45 }, // Course Name
                        2: { cellWidth: 20 }, // Day
                        3: { cellWidth: 30 }, // Time
                        4: { cellWidth: 25 }, // Room
                        5: { cellWidth: 35 }, // Instructor
                        6: { cellWidth: 20 }, // Credits
                        7: { cellWidth: 15 }  // Type
                    },
                    margin: { top: 20, left: 10, right: 10 },
                    tableWidth: 'auto',
                    styles: {
                        overflow: 'linebreak',
                        cellWidth: 'auto'
                    },
                    didParseCell: function (data) {
                        // Truncate long text to prevent overflow
                        if (data.cell.text && data.cell.text.length > 25) {
                            data.cell.text = data.cell.text.substring(0, 22) + '...';
                        }
                    }
                })

                // Add footer to table page
                doc.setFontSize(8)
                doc.setFont('helvetica', 'normal')
                doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, doc.internal.pageSize.height - 20)
            }

            // Add page numbers to all pages
            const pageCount = doc.internal.getNumberOfPages()
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i)
                doc.setFontSize(8)
                doc.setFont('helvetica', 'normal')
                doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 20)
            }

            // Save the PDF
            const fileName = `class_schedule_${scheduleData.studentProfile.studentId}_${new Date().toISOString().split('T')[0]}.pdf`
            doc.save(fileName)

            toast({
                title: "Schedule Exported",
                description: "Your class schedule has been exported as PDF",
                status: "success",
                duration: 3000,
                isClosable: true,
            })
        } catch (error) {
            console.error('Error exporting PDF:', error)
            toast({
                title: "Export Failed",
                description: "Failed to export schedule as PDF",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        }
    }

    // Filter schedule based on search and filters
    const filteredSchedule = scheduleData.classSchedules.filter((item) => {
        const matchesSearch =
            item.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.room.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesType = filterType === "all" || item.type.toLowerCase() === filterType.toLowerCase()
        const matchesDay = filterDay === "all" || item.day.toLowerCase() === filterDay.toLowerCase()

        return matchesSearch && matchesType && matchesDay
    })

    // Calculate statistics
    const totalCredits = scheduleData.classSchedules.reduce((sum, course) => sum + course.credits, 0)
    const lectureCount = scheduleData.classSchedules.filter((course) => course.type === "Lecture").length
    const labCount = scheduleData.classSchedules.filter((course) => course.type === "Lab").length

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    // Show loading state
    if (loading.classSchedules || loading.rooms) {
        return (
            <Box p={6} minH="100vh">
                <Center h="50vh">
                    <VStack spacing={4}>
                        <Spinner size="xl" color="blue.500" />
                        <Text>Loading schedule data...</Text>
                    </VStack>
                </Center>
            </Box>
        );
    }

    // Show error state
    if (errors.classSchedules || errors.rooms) {
        return (
            <Box p={6} minH="100vh">
                <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <Box>
                        <AlertTitle>Error loading schedule data!</AlertTitle>
                        <AlertDescription>
                            {errors.classSchedules || errors.rooms}
                        </AlertDescription>
                    </Box>F
                </Alert>
            </Box>
        );
    }

    return (
        <Box minH="100vh" w="100%" maxW="100%">
            <VStack spacing={6} align="stretch" w="100%">
                {/* Header */}
                <Flex justify="space-between" align="start" direction={{ base: "column", md: "row" }} gap={4}>
                    <Box flex="1" minW="0">
                        <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2} noOfLines={1}>
                            Class Schedule
                        </Text>
                        <Text color="gray.600" noOfLines={2}>
                            {scheduleData.studentProfile.semester} • {scheduleData.studentProfile.intakeCourse}
                        </Text>
                    </Box>
                    <HStack flexShrink={0}>
                        <Text fontSize="sm" color="gray.500" display={{ base: "none", sm: "block" }}>
                            Last updated: {lastRefresh.toLocaleTimeString()}
                        </Text>
                        <IconButton
                            icon={<FiRefreshCw />}
                            size="sm"
                            variant="ghost"
                            onClick={handleRefresh}
                            aria-label="Refresh schedule"
                        />
                    </HStack>
                </Flex>

                {/* Quick Stats */}
                <Grid templateColumns={{ base: "1fr", md: "repeat(1, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Stat>
                                <StatLabel>Total Credits</StatLabel>
                                <StatNumber color="blue.500">{totalCredits}</StatNumber>
                                <StatHelpText>
                                    <Icon as={FiBook} mr={1} />
                                    This Semester
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Stat>
                                <StatLabel>Enrolled Courses</StatLabel>
                                <StatNumber color="green.500">{scheduleData.classSchedules.length}</StatNumber>
                                <StatHelpText>
                                    <Icon as={FiCalendar} mr={1} />
                                    Active Courses
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Stat>
                                <StatLabel>Lectures</StatLabel>
                                <StatNumber color="purple.500">{lectureCount}</StatNumber>
                                <StatHelpText>
                                    <Icon as={FiUser} mr={1} />
                                    Theory Classes
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Stat>
                                <StatLabel>Lab Sessions</StatLabel>
                                <StatNumber color="orange.500">{labCount}</StatNumber>
                                <StatHelpText>
                                    <Icon as={FiClock} mr={1} />
                                    Practical Classes
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </Grid>

                {/* Controls */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        <VStack spacing={4} align="stretch">
                            <Flex direction={{ base: "column", md: "row" }} gap={4} align={{ md: "center" }} justify="space-between">
                                <HStack spacing={4} flex={1} wrap="wrap" gap={2}>
                                    <InputGroup maxW={{ base: "100%", sm: "300px" }} minW="200px">
                                        <InputLeftElement>
                                            <Icon as={FiSearch} color="gray.400" />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Search courses, instructors, rooms..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>

                                    <Select maxW={{ base: "100%", sm: "150px" }} minW="120px" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                        <option value="all">All Types</option>
                                        <option value="lecture">Lectures</option>
                                        <option value="lab">Labs</option>
                                    </Select>

                                    <Select maxW={{ base: "100%", sm: "150px" }} minW="120px" value={filterDay} onChange={(e) => setFilterDay(e.target.value)}>
                                        <option value="all">All Days</option>
                                        {days.map((day) => (
                                            <option key={day} value={day.toLowerCase()}>
                                                {day}
                                            </option>
                                        ))}
                                    </Select>
                                </HStack>

                                <HStack flexShrink={0} gap={2}>
                                    <HStack bg="gray.100" p={1} borderRadius="md" display={{ base: "none", lg: "flex" }}>
                                        <IconButton
                                            icon={<FiList />}
                                            size="sm"
                                            variant={viewMode === "table" ? "solid" : "ghost"}
                                            colorScheme={viewMode === "table" ? "blue" : "gray"}
                                            onClick={() => setViewMode("table")}
                                            aria-label="Table view"
                                        />
                                        <IconButton
                                            icon={<FiGrid />}
                                            size="sm"
                                            variant={viewMode === "grid" ? "solid" : "ghost"}
                                            colorScheme={viewMode === "grid" ? "blue" : "gray"}
                                            onClick={() => setViewMode("grid")}
                                            aria-label="Grid view"
                                        />
                                        <IconButton
                                            icon={<FiCalendar />}
                                            size="sm"
                                            variant={viewMode === "calendar" ? "solid" : "ghost"}
                                            colorScheme={viewMode === "calendar" ? "blue" : "gray"}
                                            onClick={() => setViewMode("calendar")}
                                            aria-label="Calendar view"
                                        />
                                    </HStack>

                                    <Button leftIcon={<FiDownload />} size="sm" variant="outline" onClick={handleExport}>
                                        Export
                                    </Button>
                                </HStack>
                            </Flex>
                        </VStack>
                    </CardBody>
                </Card>

                {/* Schedule Display */}
                {/* Show table and grid views only on lg screens and up */}
                <Box display={{ base: "none", lg: "block" }}>
                    {viewMode === "table" && (
                        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                            <CardBody>
                                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                                    Course Schedule - Table View
                                </Text>

                                {filteredSchedule.length === 0 ? (
                                    <Center py={8}>
                                        <Text color="gray.500">No courses found matching your criteria</Text>
                                    </Center>
                                ) : (
                                    <Box overflowX="auto" w="100%">
                                        <TableContainer minW="800px">
                                            <Table variant="simple" size={{ base: "sm", md: "md" }}>
                                                <Thead>
                                                    <Tr>
                                                        <Th minW="120px">Course</Th>
                                                        <Th minW="100px">Day & Time</Th>
                                                        <Th minW="120px">Location</Th>
                                                        <Th minW="100px">Instructor</Th>
                                                        <Th minW="80px">Credits</Th>
                                                        <Th minW="80px">Type</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {filteredSchedule.map((schedule) => (
                                                        <Tr key={schedule.id}>
                                                            <Td>
                                                                <VStack align="start" spacing={1}>
                                                                    <Text fontWeight="medium" noOfLines={1}>{schedule.courseCode}</Text>
                                                                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                                                        {schedule.courseName}
                                                                    </Text>
                                                                </VStack>
                                                            </Td>
                                                            <Td>
                                                                <VStack align="start" spacing={1}>
                                                                    <Badge colorScheme={schedule.color} variant="subtle" fontSize="xs">
                                                                        {schedule.day}
                                                                    </Badge>
                                                                    <Text fontSize="sm" noOfLines={1}>{schedule.time}</Text>
                                                                </VStack>
                                                            </Td>
                                                            <Td>
                                                                <VStack align="start" spacing={1}>
                                                                    <HStack>
                                                                        <Icon as={FiMapPin} color="gray.400" boxSize={3} />
                                                                        <Text fontWeight="medium" noOfLines={1}>{schedule.room}</Text>
                                                                    </HStack>
                                                                    <Text fontSize="sm" color="gray.600" noOfLines={1}>
                                                                        {schedule.building}
                                                                    </Text>
                                                                </VStack>
                                                            </Td>
                                                            <Td>
                                                                <Text noOfLines={2}>{schedule.instructor}</Text>
                                                            </Td>
                                                            <Td>
                                                                <Badge colorScheme="blue" variant="outline" fontSize="xs">
                                                                    {schedule.credits} Credits
                                                                </Badge>
                                                            </Td>
                                                            <Td>
                                                                <Badge colorScheme={schedule.type === "Lab" ? "purple" : "green"} variant="subtle" fontSize="xs">
                                                                    {schedule.type}
                                                                </Badge>
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}
                            </CardBody>
                        </Card>
                    )}

                    {viewMode === "grid" && (
                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                            {filteredSchedule.map((course) => (
                                <Card key={course.id} bg={bgColor} borderColor={borderColor} borderWidth="1px" _hover={{ shadow: "md" }}>
                                    <CardBody>
                                        <VStack align="stretch" spacing={4}>
                                            <HStack justify="space-between">
                                                <VStack align="start" spacing={1}>
                                                    <Text fontWeight="bold" fontSize="lg">
                                                        {course.courseCode}
                                                    </Text>
                                                    <Text fontSize="sm" color="gray.600">
                                                        {course.courseName}
                                                    </Text>
                                                </VStack>
                                                <Badge colorScheme={course.type === "Lab" ? "purple" : "green"} variant="solid">
                                                    {course.type}
                                                </Badge>
                                            </HStack>

                                            <Divider />

                                            <VStack align="stretch" spacing={2}>
                                                <HStack>
                                                    <Icon as={FiCalendar} color={`${course.color}.500`} />
                                                    <Text fontWeight="medium">{course.day}</Text>
                                                </HStack>
                                                <HStack>
                                                    <Icon as={FiClock} color={`${course.color}.500`} />
                                                    <Text fontSize="sm">{course.time}</Text>
                                                </HStack>
                                                <HStack>
                                                    <Icon as={FiMapPin} color={`${course.color}.500`} />
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontSize="sm" fontWeight="medium">
                                                            {course.room}
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.600">
                                                            {course.building}
                                                        </Text>
                                                    </VStack>
                                                </HStack>
                                                <HStack>
                                                    <Icon as={FiUser} color={`${course.color}.500`} />
                                                    <Text fontSize="sm">{course.instructor}</Text>
                                                </HStack>
                                            </VStack>

                                            <Divider />

                                            <HStack justify="space-between">
                                                <Badge colorScheme="blue" variant="outline">
                                                    {course.credits} Credits
                                                </Badge>
                                                <Text fontSize="xs" color="gray.500">
                                                    {course.prerequisites}
                                                </Text>
                                            </HStack>

                                            <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                                {course.description}
                                            </Text>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            ))}
                        </Grid>
                    )}
                </Box>

                {/* Always show calendar view on md screens and smaller */}
                <Box display={{ base: "block", lg: "none" }}>
                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Flex justify="space-between" align="center" mb={4}>
                                <Text fontSize="lg" fontWeight="semibold">
                                    Weekly Schedule - Calendar View
                                </Text>
                                <Badge colorScheme="blue" variant="subtle" display={{ base: "block", lg: "none" }}>
                                    Mobile View
                                </Badge>
                            </Flex>

                            <Box overflowX="auto" w="100%">
                                <Grid
                                    templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)", lg: "repeat(7, 1fr)" }}
                                    gap={2}
                                    minW={{ base: "100%", lg: "800px" }}
                                >
                                    {days.map((day) => {
                                        const daySchedules = filteredSchedule.filter(schedule =>
                                            schedule.day === day
                                        );

                                        return (
                                            <Box key={day} p={3} bg="gray.100" borderRadius="md" minH="200px">
                                                <Text fontWeight="bold" fontSize="sm" mb={3} textAlign="center" noOfLines={1}>
                                                    {day}
                                                </Text>
                                                <VStack spacing={2} align="stretch">
                                                    {daySchedules.map((session, index) => (
                                                        <Box
                                                            key={index}
                                                            p={2}
                                                            bg={`${session.color}.100`}
                                                            borderRadius="md"
                                                            borderLeft="4px solid"
                                                            borderColor={`${session.color}.500`}
                                                        >
                                                            <Text fontSize="xs" fontWeight="bold" noOfLines={1}>
                                                                {session.courseCode}
                                                            </Text>
                                                            <Text fontSize="xs" color="gray.600" noOfLines={1}>
                                                                {session.time}
                                                            </Text>
                                                            <Text fontSize="xs" color="gray.600" noOfLines={1}>
                                                                {session.room}
                                                            </Text>
                                                            <Badge size="xs" colorScheme={session.type === "Lab" ? "purple" : "green"} variant="subtle">
                                                                {session.type}
                                                            </Badge>
                                                        </Box>
                                                    ))}
                                                </VStack>
                                            </Box>
                                        );
                                    })}
                                </Grid>
                            </Box>
                        </CardBody>
                    </Card>
                </Box>

                {/* Course Details */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        <Text fontSize="lg" fontWeight="semibold" mb={4}>
                            Course Information
                        </Text>

                        <Alert status="info" borderRadius="md" mb={4}>
                            <AlertIcon />
                            <Box>
                                <AlertTitle>Academic Advisor:</AlertTitle>
                                <AlertDescription>{scheduleData.studentProfile.advisor}</AlertDescription>
                            </Box>
                        </Alert>

                        {filteredSchedule.length === 0 ? (
                            <Center py={8}>
                                <Text color="gray.500">No courses found to display</Text>
                            </Center>
                        ) : (
                            <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={4}>
                                {filteredSchedule.slice(0, 4).map((course) => (
                                    <Box key={course.id} p={4} bg="gray.50" borderRadius="md" borderWidth="1px">
                                        <VStack align="stretch" spacing={3}>
                                            <HStack justify="space-between">
                                                <Text fontWeight="bold" noOfLines={1}>{course.courseCode}</Text>
                                                <Badge colorScheme={course.color} variant="subtle" flexShrink={0}>
                                                    {course.credits} Credits
                                                </Badge>
                                            </HStack>
                                            <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
                                                {course.courseName}
                                            </Text>
                                            <Text fontSize="sm" color="gray.600" noOfLines={3}>
                                                {course.description}
                                            </Text>
                                            <Divider />
                                            <VStack align="stretch" spacing={1}>
                                                <Text fontSize="xs" color="gray.500" noOfLines={2}>
                                                    <strong>Prerequisites:</strong> {course.prerequisites}
                                                </Text>
                                                <Text fontSize="xs" color="gray.500" noOfLines={2}>
                                                    <strong>Textbook:</strong> {course.textbook}
                                                </Text>
                                                <Text fontSize="xs" color="gray.500" noOfLines={2}>
                                                    <strong>Instructor:</strong> {course.instructor}
                                                </Text>
                                            </VStack>
                                        </VStack>
                                    </Box>
                                ))}
                            </Grid>
                        )}
                    </CardBody>
                </Card>
            </VStack>
        </Box >
    )
}
