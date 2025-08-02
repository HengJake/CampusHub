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
import { useState } from "react"

// Mock data for class schedule
const mockScheduleData = {
    studentProfile: {
        id: "STU001",
        name: "Alex Johnson",
        studentId: "2024CS001",
        program: "Computer Science",
        year: 3,
        semester: "Fall 2024",
        advisor: "Dr. Sarah Wilson",
    },

    academicSchedule: [
        {
            id: "AS001",
            courseCode: "CS301",
            courseName: "Data Structures & Algorithms",
            day: "Monday",
            time: "9:00 AM - 10:30 AM",
            room: "CS-101",
            building: "Computer Science Block",
            instructor: "Dr. Michael Smith",
            credits: 4,
            type: "Lecture",
            color: "blue",
            description: "Advanced data structures and algorithmic problem solving",
            prerequisites: "CS201, MATH201",
            textbook: "Introduction to Algorithms by Cormen",
        },
        {
            id: "AS002",
            courseCode: "CS302",
            courseName: "Database Management Systems",
            day: "Tuesday",
            time: "11:00 AM - 12:30 PM",
            room: "CS-205",
            building: "Computer Science Block",
            instructor: "Prof. Emily Johnson",
            credits: 3,
            type: "Lecture",
            color: "green",
            description: "Relational database design and SQL programming",
            prerequisites: "CS202",
            textbook: "Database System Concepts by Silberschatz",
        },
        {
            id: "AS003",
            courseCode: "CS303",
            courseName: "Software Engineering",
            day: "Wednesday",
            time: "2:00 PM - 3:30 PM",
            room: "CS-301",
            building: "Computer Science Block",
            instructor: "Dr. Robert Brown",
            credits: 3,
            type: "Lecture",
            color: "purple",
            description: "Software development lifecycle and project management",
            prerequisites: "CS202, CS203",
            textbook: "Software Engineering by Sommerville",
        },
        {
            id: "AS004",
            courseCode: "CS304",
            courseName: "Computer Networks",
            day: "Thursday",
            time: "10:00 AM - 11:30 AM",
            room: "CS-102",
            building: "Computer Science Block",
            instructor: "Dr. Lisa Davis",
            credits: 3,
            type: "Lecture",
            color: "orange",
            description: "Network protocols, architecture, and security",
            prerequisites: "CS203, MATH202",
            textbook: "Computer Networking by Kurose",
        },
        {
            id: "AS005",
            courseCode: "CS301L",
            courseName: "Data Structures Lab",
            day: "Friday",
            time: "2:00 PM - 4:00 PM",
            room: "CS-Lab1",
            building: "Computer Science Block",
            instructor: "Mr. James Wilson",
            credits: 1,
            type: "Lab",
            color: "blue",
            description: "Hands-on implementation of data structures",
            prerequisites: "CS301 (Co-requisite)",
            textbook: "Lab Manual - Data Structures",
        },
        {
            id: "AS006",
            courseCode: "CS302L",
            courseName: "Database Lab",
            day: "Friday",
            time: "4:00 PM - 6:00 PM",
            room: "CS-Lab2",
            building: "Computer Science Block",
            instructor: "Ms. Sarah Lee",
            credits: 1,
            type: "Lab",
            color: "green",
            description: "Practical database design and implementation",
            prerequisites: "CS302 (Co-requisite)",
            textbook: "Database Lab Manual",
        },
        {
            id: "AS007",
            courseCode: "MATH301",
            courseName: "Linear Algebra",
            day: "Monday",
            time: "11:00 AM - 12:30 PM",
            room: "MATH-201",
            building: "Mathematics Block",
            instructor: "Dr. Patricia Miller",
            credits: 3,
            type: "Lecture",
            color: "red",
            description: "Vector spaces, matrices, and linear transformations",
            prerequisites: "MATH201, MATH202",
            textbook: "Linear Algebra by Strang",
        },
        {
            id: "AS008",
            courseCode: "ENG301",
            courseName: "Technical Communication",
            day: "Wednesday",
            time: "4:00 PM - 5:30 PM",
            room: "ENG-101",
            building: "English Block",
            instructor: "Prof. David Wilson",
            credits: 2,
            type: "Lecture",
            color: "teal",
            description: "Professional writing and presentation skills",
            prerequisites: "ENG201",
            textbook: "Technical Writing by Markel",
        },
    ],

    weeklySchedule: {
        Monday: [
            { courseCode: "CS301", time: "9:00 AM - 10:30 AM", room: "CS-101", type: "Lecture" },
            { courseCode: "MATH301", time: "11:00 AM - 12:30 PM", room: "MATH-201", type: "Lecture" },
        ],
        Tuesday: [{ courseCode: "CS302", time: "11:00 AM - 12:30 PM", room: "CS-205", type: "Lecture" }],
        Wednesday: [
            { courseCode: "CS303", time: "2:00 PM - 3:30 PM", room: "CS-301", type: "Lecture" },
            { courseCode: "ENG301", time: "4:00 PM - 5:30 PM", room: "ENG-101", type: "Lecture" },
        ],
        Thursday: [{ courseCode: "CS304", time: "10:00 AM - 11:30 AM", room: "CS-102", type: "Lecture" }],
        Friday: [
            { courseCode: "CS301L", time: "2:00 PM - 4:00 PM", room: "CS-Lab1", type: "Lab" },
            { courseCode: "CS302L", time: "4:00 PM - 6:00 PM", room: "CS-Lab2", type: "Lab" },
        ],
        Saturday: [],
        Sunday: [],
    },
}

export default function Schedule() {
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState("all")
    const [filterDay, setFilterDay] = useState("all")
    const [viewMode, setViewMode] = useState("table") // table or grid or calendar
    const [lastRefresh, setLastRefresh] = useState(new Date())

    const bgColor = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.600")
    const toast = useToast()

    const handleRefresh = () => {
        setLastRefresh(new Date())
        toast({
            title: "Schedule Refreshed",
            description: "Class schedule has been updated",
            status: "info",
            duration: 2000,
            isClosable: true,
        })
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
    const filteredSchedule = mockScheduleData.academicSchedule.filter((item) => {
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
    const totalCredits = mockScheduleData.academicSchedule.reduce((sum, course) => sum + course.credits, 0)
    const lectureCount = mockScheduleData.academicSchedule.filter((course) => course.type === "Lecture").length
    const labCount = mockScheduleData.academicSchedule.filter((course) => course.type === "Lab").length

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

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
                            {mockScheduleData.studentProfile.semester} • {mockScheduleData.studentProfile.program}
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
                                <StatNumber color="green.500">{mockScheduleData.academicSchedule.length}</StatNumber>
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
                                {days.map((day) => (
                                    <Box key={day} p={3} bg="gray.100" borderRadius="md" minH="200px">
                                        <Text fontWeight="bold" fontSize="sm" mb={3} textAlign="center">
                                            {day}
                                        </Text>
                                        <VStack spacing={2} align="stretch">
                                            {mockScheduleData.weeklySchedule[day]?.map((session, index) => {
                                                const courseInfo = mockScheduleData.academicSchedule.find(
                                                    (c) => c.courseCode === session.courseCode,
                                                )
                                                return (
                                                    <Box
                                                        key={index}
                                                        p={2}
                                                        bg={`${courseInfo?.color || "gray"}.100`}
                                                        borderRadius="md"
                                                        borderLeft="4px solid"
                                                        borderColor={`${courseInfo?.color || "gray"}.500`}
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
                                                )
                                            })}
                                        </VStack>
                                    </Box>
                                ))}
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
                                <AlertDescription>{mockScheduleData.studentProfile.advisor}</AlertDescription>
                            </Box>
                        </Alert>

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
                    </CardBody>
                </Card>
            </VStack>
        </Box>
    )
}
