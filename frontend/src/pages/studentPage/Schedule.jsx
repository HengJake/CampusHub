"use client"

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
        module.courseId.filter(course => {
            course._id === intakeCourse.courseId._id
        })
    ) : modules;

    return classSchedules
        .filter(schedule => {
            // Only include schedules for modules that belong to the user's intake course
            const module = modules.find(m => m._id === schedule.moduleId._id);
            console.log("🚀 ~ transformClassScheduleData ~ schedule:", schedule.intakeCourseId.courseId.courseName)
            console.log("🚀 ~ transformClassScheduleData ~ schedule:", schedule.intakeCourseId.intakeId.intakeName)
            const filterModule = module && userModules.some(userModule => userModule._id === module._id) && schedule.intakeCourseId._id === intakeCourse._id;
            console.log(filterModule)
            return filterModule;
        })
        .map(schedule => {
            const room = rooms.find(r => r._id === schedule.roomId._id);
            const module = modules.find(m => m._id === schedule.moduleId._id);
            const lecturer = lecturers.find(l => l._id === schedule.lecturerId._id);

            return {
                id: schedule._id,
                courseCode: module?.code || 'N/A',
                courseName: module?.moduleName || 'N/A',
                day: schedule.dayOfWeek,
                time: `${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}`,
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
        if (classSchedules.length === 0) {
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
        toast({
            title: "Exporting Schedule",
            description: "Your class schedule is being prepared for download",
            status: "success",
            duration: 3000,
            isClosable: true,
        })
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
                    </Box>
                </Alert>
            </Box>
        );
    }

    return (
        <Box p={6} minH="100vh">
            <VStack spacing={6} align="stretch">
                {/* Header */}
                <Flex justify="space-between" align="center">
                    <Box>
                        <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
                            Class Schedule
                        </Text>
                        <Text color="gray.600">
                            {scheduleData.studentProfile.semester} • {scheduleData.studentProfile.intakeCourse}
                        </Text>
                    </Box>
                    <HStack>
                        <Text fontSize="sm" color="gray.500">
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
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
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
                        <Flex direction={{ base: "column", lg: "row" }} gap={4} align={{ lg: "center" }} justify="space-between">
                            <HStack spacing={4} flex={1}>
                                <InputGroup maxW="300px">
                                    <InputLeftElement>
                                        <Icon as={FiSearch} color="gray.400" />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Search courses, instructors, rooms..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>

                                <Select maxW="150px" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                    <option value="all">All Types</option>
                                    <option value="lecture">Lectures</option>
                                    <option value="lab">Labs</option>
                                </Select>

                                <Select maxW="150px" value={filterDay} onChange={(e) => setFilterDay(e.target.value)}>
                                    <option value="all">All Days</option>
                                    {days.map((day) => (
                                        <option key={day} value={day.toLowerCase()}>
                                            {day}
                                        </option>
                                    ))}
                                </Select>
                            </HStack>

                            <HStack>
                                <HStack bg="gray.100" p={1} borderRadius="md">
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
                    </CardBody>
                </Card>

                {/* Schedule Display */}
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
                                <TableContainer>
                                    <Table variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th>Course</Th>
                                                <Th>Day & Time</Th>
                                                <Th>Location</Th>
                                                <Th>Instructor</Th>
                                                <Th>Credits</Th>
                                                <Th>Type</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {filteredSchedule.map((schedule) => (
                                                <Tr key={schedule.id}>
                                                    <Td>
                                                        <VStack align="start" spacing={1}>
                                                            <Text fontWeight="medium">{schedule.courseCode}</Text>
                                                            <Text fontSize="sm" color="gray.600">
                                                                {schedule.courseName}
                                                            </Text>
                                                        </VStack>
                                                    </Td>
                                                    <Td>
                                                        <VStack align="start" spacing={1}>
                                                            <Badge colorScheme={schedule.color} variant="subtle">
                                                                {schedule.day}
                                                            </Badge>
                                                            <Text fontSize="sm">{schedule.time}</Text>
                                                        </VStack>
                                                    </Td>
                                                    <Td>
                                                        <VStack align="start" spacing={1}>
                                                            <HStack>
                                                                <Icon as={FiMapPin} color="gray.400" boxSize={3} />
                                                                <Text fontWeight="medium">{schedule.room}</Text>
                                                            </HStack>
                                                            <Text fontSize="sm" color="gray.600">
                                                                {schedule.building}
                                                            </Text>
                                                        </VStack>
                                                    </Td>
                                                    <Td>
                                                        <Text>{schedule.instructor}</Text>
                                                    </Td>
                                                    <Td>
                                                        <Badge colorScheme="blue" variant="outline">
                                                            {schedule.credits} Credits
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        <Badge colorScheme={schedule.type === "Lab" ? "purple" : "green"} variant="subtle">
                                                            {schedule.type}
                                                        </Badge>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
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

                {viewMode === "calendar" && (
                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Text fontSize="lg" fontWeight="semibold" mb={4}>
                                Weekly Schedule - Calendar View
                            </Text>

                            <Grid templateColumns="repeat(7, 1fr)" gap={2}>
                                {days.map((day) => {
                                    const daySchedules = filteredSchedule.filter(schedule =>
                                        schedule.day === day
                                    );

                                    return (
                                        <Box key={day} p={3} bg="gray.100" borderRadius="md" minH="200px">
                                            <Text fontWeight="bold" fontSize="sm" mb={3} textAlign="center">
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
                                                        <Text fontSize="xs" fontWeight="bold">
                                                            {session.courseCode}
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.600">
                                                            {session.time}
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.600">
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
                        </CardBody>
                    </Card>
                )}

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
                                                <Text fontWeight="bold">{course.courseCode}</Text>
                                                <Badge colorScheme={course.color} variant="subtle">
                                                    {course.credits} Credits
                                                </Badge>
                                            </HStack>
                                            <Text fontSize="sm" fontWeight="medium">
                                                {course.courseName}
                                            </Text>
                                            <Text fontSize="sm" color="gray.600">
                                                {course.description}
                                            </Text>
                                            <Divider />
                                            <VStack align="stretch" spacing={1}>
                                                <Text fontSize="xs" color="gray.500">
                                                    <strong>Prerequisites:</strong> {course.prerequisites}
                                                </Text>
                                                <Text fontSize="xs" color="gray.500">
                                                    <strong>Textbook:</strong> {course.textbook}
                                                </Text>
                                                <Text fontSize="xs" color="gray.500">
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
        </Box>
    )
}
