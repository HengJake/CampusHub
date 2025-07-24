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
  Progress,
  Icon,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Select,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react"
import {
  FiSearch,
  FiCheckCircle,
  FiAlertCircle,
  FiEdit,
  FiRefreshCw,
  FiCalendar,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiDownload,
  FiEye,
} from "react-icons/fi"
import { useState } from "react"
import { FaChartBar } from "react-icons/fa";

// Mock data for attendance tracking
const mockAttendanceData = {
  studentProfile: {
    id: "STU001",
    name: "Alex Johnson",
    studentId: "2024CS001",
    program: "Computer Science",
    year: 3,
    semester: "Fall 2024",
  },

  attendanceRecords: [
    {
      id: "AT001",
      courseCode: "CS301",
      courseName: "Data Structures & Algorithms",
      attended: 28,
      total: 30,
      percentage: 93.3,
      status: "excellent",
      lastUpdated: "2024-01-15",
      requiredPercentage: 75,
      sessionsLeft: 5,
      canMiss: 2,
      instructor: "Dr. Michael Smith",
      weeklySchedule: ["Monday 9:00 AM", "Wednesday 2:00 PM"],
      recentSessions: [
        { date: "2024-01-15", status: "present", method: "QR Code" },
        { date: "2024-01-13", status: "present", method: "Manual" },
        { date: "2024-01-10", status: "present", method: "QR Code" },
        { date: "2024-01-08", status: "absent", method: "Auto" },
        { date: "2024-01-06", status: "present", method: "QR Code" },
      ],
    },
    {
      id: "AT002",
      courseCode: "CS302",
      courseName: "Database Management Systems",
      attended: 25,
      total: 32,
      percentage: 78.1,
      status: "good",
      lastUpdated: "2024-01-14",
      requiredPercentage: 75,
      sessionsLeft: 4,
      canMiss: 1,
      instructor: "Prof. Emily Johnson",
      weeklySchedule: ["Tuesday 11:00 AM"],
      recentSessions: [
        { date: "2024-01-14", status: "present", method: "Manual" },
        { date: "2024-01-11", status: "present", method: "QR Code" },
        { date: "2024-01-09", status: "absent", method: "Auto" },
        { date: "2024-01-07", status: "present", method: "QR Code" },
        { date: "2024-01-04", status: "present", method: "Manual" },
      ],
    },
    {
      id: "AT003",
      courseCode: "CS303",
      courseName: "Software Engineering",
      attended: 30,
      total: 30,
      percentage: 100,
      status: "excellent",
      lastUpdated: "2024-01-15",
      requiredPercentage: 75,
      sessionsLeft: 6,
      canMiss: 6,
      instructor: "Dr. Robert Brown",
      weeklySchedule: ["Wednesday 2:00 PM"],
      recentSessions: [
        { date: "2024-01-15", status: "present", method: "QR Code" },
        { date: "2024-01-12", status: "present", method: "QR Code" },
        { date: "2024-01-10", status: "present", method: "Manual" },
        { date: "2024-01-08", status: "present", method: "QR Code" },
        { date: "2024-01-05", status: "present", method: "QR Code" },
      ],
    },
    {
      id: "AT004",
      courseCode: "CS304",
      courseName: "Computer Networks",
      attended: 22,
      total: 31,
      percentage: 71.0,
      status: "warning",
      lastUpdated: "2024-01-13",
      requiredPercentage: 75,
      sessionsLeft: 3,
      canMiss: 0,
      instructor: "Dr. Lisa Davis",
      weeklySchedule: ["Thursday 10:00 AM"],
      recentSessions: [
        { date: "2024-01-13", status: "absent", method: "Auto" },
        { date: "2024-01-11", status: "present", method: "QR Code" },
        { date: "2024-01-09", status: "absent", method: "Auto" },
        { date: "2024-01-06", status: "present", method: "Manual" },
        { date: "2024-01-04", status: "absent", method: "Auto" },
      ],
    },
    {
      id: "AT005",
      courseCode: "CS301L",
      courseName: "Data Structures Lab",
      attended: 14,
      total: 15,
      percentage: 93.3,
      status: "excellent",
      lastUpdated: "2024-01-12",
      requiredPercentage: 75,
      sessionsLeft: 2,
      canMiss: 2,
      instructor: "Mr. James Wilson",
      weeklySchedule: ["Friday 2:00 PM"],
      recentSessions: [
        { date: "2024-01-12", status: "present", method: "Manual" },
        { date: "2024-01-05", status: "present", method: "QR Code" },
        { date: "2024-01-03", status: "absent", method: "Auto" },
        { date: "2023-12-29", status: "present", method: "QR Code" },
        { date: "2023-12-22", status: "present", method: "Manual" },
      ],
    },
    {
      id: "AT006",
      courseCode: "CS302L",
      courseName: "Database Lab",
      attended: 13,
      total: 15,
      percentage: 86.7,
      status: "good",
      lastUpdated: "2024-01-12",
      requiredPercentage: 75,
      sessionsLeft: 2,
      canMiss: 2,
      instructor: "Ms. Sarah Lee",
      weeklySchedule: ["Friday 4:00 PM"],
      recentSessions: [
        { date: "2024-01-12", status: "present", method: "QR Code" },
        { date: "2024-01-05", status: "present", method: "Manual" },
        { date: "2024-01-03", status: "absent", method: "Auto" },
        { date: "2023-12-29", status: "present", method: "QR Code" },
        { date: "2023-12-22", status: "absent", method: "Auto" },
      ],
    },
  ],

  attendanceLog: [
    {
      id: "AL001",
      courseCode: "CS301",
      courseName: "Data Structures & Algorithms",
      date: "2024-01-15",
      time: "9:00 AM",
      status: "present",
      method: "QR Code",
      location: "CS-101",
      instructor: "Dr. Michael Smith",
    },
    {
      id: "AL002",
      courseCode: "CS302",
      courseName: "Database Management Systems",
      date: "2024-01-14",
      time: "11:00 AM",
      status: "present",
      method: "Manual",
      location: "CS-205",
      instructor: "Prof. Emily Johnson",
    },
    {
      id: "AL003",
      courseCode: "CS303",
      courseName: "Software Engineering",
      date: "2024-01-13",
      time: "2:00 PM",
      status: "present",
      method: "QR Code",
      location: "CS-301",
      instructor: "Dr. Robert Brown",
    },
    {
      id: "AL004",
      courseCode: "CS304",
      courseName: "Computer Networks",
      date: "2024-01-13",
      time: "10:00 AM",
      status: "absent",
      method: "Auto",
      location: "CS-102",
      instructor: "Dr. Lisa Davis",
    },
    {
      id: "AL005",
      courseCode: "CS301L",
      courseName: "Data Structures Lab",
      date: "2024-01-12",
      time: "2:00 PM",
      status: "present",
      method: "Manual",
      location: "CS-Lab1",
      instructor: "Mr. James Wilson",
    },
  ],

  monthlyStats: {
    January: { attended: 45, total: 52, percentage: 86.5 },
    December: { attended: 38, total: 42, percentage: 90.5 },
    November: { attended: 41, total: 48, percentage: 85.4 },
    October: { attended: 44, total: 50, percentage: 88.0 },
  },
}

export default function Attendance() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [attendanceCode, setAttendanceCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState(null)

  const { isOpen: isAttendanceOpen, onOpen: onAttendanceOpen, onClose: onAttendanceClose } = useDisclosure()
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure()

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const toast = useToast()

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 90) return { status: "excellent", color: "green", icon: FiCheckCircle }
    if (percentage >= 80) return { status: "good", color: "blue", icon: FiCheckCircle }
    if (percentage >= 75) return { status: "satisfactory", color: "yellow", icon: FiAlertCircle }
    return { status: "critical", color: "red", icon: FiAlertCircle }
  }

  const calculateOverallAttendance = () => {
    const totalAttended = mockAttendanceData.attendanceRecords.reduce((sum, record) => sum + record.attended, 0)
    const totalClasses = mockAttendanceData.attendanceRecords.reduce((sum, record) => sum + record.total, 0)
    return totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0
  }

  const getAttendanceTrend = () => {
    const months = Object.keys(mockAttendanceData.monthlyStats)
    if (months.length < 2) return { trend: "stable", change: 0 }

    const current = mockAttendanceData.monthlyStats[months[0]]
    const previous = mockAttendanceData.monthlyStats[months[1]]
    const change = current.percentage - previous.percentage

    return {
      trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
      change: Math.abs(change).toFixed(1),
    }
  }

  const handleAttendanceSubmit = () => {
    if (!attendanceCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter attendance code",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (!selectedCourse) {
      toast({
        title: "Error",
        description: "Please select a course",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Attendance Recorded",
        description: `Attendance marked for ${selectedCourse}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      })
      setAttendanceCode("")
      setSelectedCourse("")
      onAttendanceClose()
    }, 2000)
  }

  const handleRefresh = () => {
    setLastRefresh(new Date())
    toast({
      title: "Data Refreshed",
      description: "Attendance data has been updated",
      status: "info",
      duration: 2000,
      isClosable: true,
    })
  }

  const filteredRecords = mockAttendanceData.attendanceRecords.filter((record) => {
    const matchesSearch =
      record.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.instructor.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || record.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const attendanceTrend = getAttendanceTrend()

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
              Attendance Tracking
            </Text>
            <Text color="gray.600">Monitor your class attendance and maintain academic requirements</Text>
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
              aria-label="Refresh data"
            />
          </HStack>
        </Flex>

        {/* Attendance Overview Stats */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Overall Attendance</StatLabel>
                <StatNumber color="blue.500">{calculateOverallAttendance()}%</StatNumber>
                <StatHelpText>
                  <Icon as={attendanceTrend.trend === "up" ? FiTrendingUp : FiTrendingDown} mr={1} />
                  {attendanceTrend.change}% from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Courses at Risk</StatLabel>
                <StatNumber color="red.500">
                  {mockAttendanceData.attendanceRecords.filter((r) => r.percentage < 75).length}
                </StatNumber>
                <StatHelpText>
                  <Icon as={FiAlertCircle} mr={1} />
                  Below 75% requirement
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Perfect Attendance</StatLabel>
                <StatNumber color="green.500">
                  {mockAttendanceData.attendanceRecords.filter((r) => r.percentage >= 95).length}
                </StatNumber>
                <StatHelpText>
                  <Icon as={FiCheckCircle} mr={1} />
                  95% or above
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Total Classes</StatLabel>
                <StatNumber color="purple.500">
                  {mockAttendanceData.attendanceRecords.reduce((sum, r) => sum + r.total, 0)}
                </StatNumber>
                <StatHelpText>
                  <Icon as={FiCalendar} mr={1} />
                  This semester
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Main Tabs */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>
              <HStack>
                <Icon as={FaChartBar} />
                <Text>Attendance Overview</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Icon as={FiEdit} />
                <Text>Mark Attendance</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Icon as={FiClock} />
                <Text>Attendance Log</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Attendance Overview Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* Controls */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                  <CardBody>
                    <HStack justify="space-between">
                      <HStack spacing={4}>
                        <InputGroup maxW="300px">
                          <InputLeftElement>
                            <Icon as={FiSearch} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </InputGroup>

                        <Select maxW="150px" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                          <option value="all">All Status</option>
                          <option value="excellent">Excellent</option>
                          <option value="good">Good</option>
                          <option value="warning">Warning</option>
                          <option value="critical">Critical</option>
                        </Select>
                      </HStack>

                      <Button leftIcon={<FiDownload />} size="sm" variant="outline">
                        Export Report
                      </Button>
                    </HStack>
                  </CardBody>
                </Card>

                {/* Attendance Cards */}
                <VStack spacing={4} align="stretch">
                  {filteredRecords.map((record) => {
                    const attendanceStatus = getAttendanceStatus(record.percentage)
                    return (
                      <Card key={record.id} bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr 1fr" }} gap={4} alignItems="center">
                            {/* Course Info */}
                            <VStack align="start" spacing={2}>
                              <HStack>
                                <Text fontWeight="bold" fontSize="lg">
                                  {record.courseCode}
                                </Text>
                                <Badge colorScheme={attendanceStatus.color} variant="subtle">
                                  {attendanceStatus.status.toUpperCase()}
                                </Badge>
                              </HStack>
                              <Text fontSize="sm" color="gray.600">
                                {record.courseName}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                Instructor: {record.instructor}
                              </Text>
                              <HStack spacing={4}>
                                <Text fontSize="sm">
                                  <strong>Attended:</strong> {record.attended}/{record.total}
                                </Text>
                                <Text fontSize="sm">
                                  <strong>Can Miss:</strong> {record.canMiss} more
                                </Text>
                                <Text fontSize="sm">
                                  <strong>Sessions Left:</strong> {record.sessionsLeft}
                                </Text>
                              </HStack>
                            </VStack>

                            {/* Progress Circle */}
                            <Flex justify="center">
                              <CircularProgress
                                value={record.percentage}
                                color={`${attendanceStatus.color}.500`}
                                size="100px"
                                thickness="8px"
                              >
                                <CircularProgressLabel fontSize="sm" fontWeight="bold">
                                  {record.percentage.toFixed(1)}%
                                </CircularProgressLabel>
                              </CircularProgress>
                            </Flex>

                            {/* Status & Actions */}
                            <VStack align="end" spacing={2}>
                              <HStack>
                                <Icon as={attendanceStatus.icon} color={`${attendanceStatus.color}.500`} />
                                <Text fontSize="sm" color={`${attendanceStatus.color}.600`} fontWeight="medium">
                                  {record.percentage >= 75 ? "Eligible" : "At Risk"}
                                </Text>
                              </HStack>
                              <Text fontSize="xs" color="gray.500">
                                Updated: {record.lastUpdated}
                              </Text>
                              <Button
                                size="sm"
                                leftIcon={<FiEye />}
                                onClick={() => {
                                  setSelectedRecord(record)
                                  onDetailOpen()
                                }}
                              >
                                View Details
                              </Button>
                              {record.percentage < 75 && (
                                <Alert status="warning" size="sm" borderRadius="md" mt={2}>
                                  <AlertIcon boxSize={3} />
                                  <Text fontSize="xs">Below required 75%</Text>
                                </Alert>
                              )}
                            </VStack>
                          </Grid>

                          {/* Progress Bar */}
                          <Box mt={4}>
                            <Progress
                              value={record.percentage}
                              colorScheme={attendanceStatus.color}
                              size="sm"
                              borderRadius="full"
                            />
                          </Box>
                        </CardBody>
                      </Card>
                    )
                  })}
                </VStack>
              </VStack>
            </TabPanel>

            {/* Mark Attendance Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* Quick Mark Attendance */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                  <CardBody>
                    <Text fontSize="lg" fontWeight="semibold" mb={4}>
                      Mark Attendance
                    </Text>

                    <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel>Select Course</FormLabel>
                          <Select
                            placeholder="Choose a course"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                          >
                            {mockAttendanceData.attendanceRecords.map((course) => (
                              <option key={course.id} value={course.courseName}>
                                {course.courseCode} - {course.courseName}
                              </option>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl>
                          <FormLabel>Attendance Code</FormLabel>
                          <Input
                            placeholder="Enter attendance code provided by instructor"
                            value={attendanceCode}
                            onChange={(e) => setAttendanceCode(e.target.value)}
                          />
                        </FormControl>

                        <Button
                          colorScheme="blue"
                          onClick={handleAttendanceSubmit}
                          isLoading={isLoading}
                          loadingText="Marking..."
                          isDisabled={!selectedCourse || !attendanceCode.trim()}
                          size="lg"
                        >
                          Mark Present
                        </Button>
                      </VStack>

                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <Box>
                          <AlertTitle fontSize="sm">How to mark attendance:</AlertTitle>
                          <AlertDescription fontSize="sm">
                            1. Select your course from the dropdown
                            <br />
                            2. Enter the attendance code provided by your instructor
                            <br />
                            3. Click "Mark Present" to log your attendance
                            <br />
                            <br />
                            <strong>Note:</strong> Attendance codes are time-sensitive and expire after the class
                            session.
                          </AlertDescription>
                        </Box>
                      </Alert>
                    </Grid>
                  </CardBody>
                </Card>

                {/* Today's Schedule */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                  <CardBody>
                    <Text fontSize="lg" fontWeight="semibold" mb={4}>
                      Today's Classes
                    </Text>

                    <VStack spacing={3} align="stretch">
                      {mockAttendanceData.attendanceRecords.slice(0, 3).map((course) => (
                        <Box key={course.id} p={3} bg="gray.50" borderRadius="md" borderWidth="1px">
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium">{course.courseCode}</Text>
                              <Text fontSize="sm" color="gray.600">
                                {course.courseName}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {course.weeklySchedule.join(", ")}
                              </Text>
                            </VStack>
                            <VStack align="end" spacing={1}>
                              <Badge colorScheme="blue" variant="outline">
                                {course.percentage.toFixed(1)}%
                              </Badge>
                              <Text fontSize="xs" color="gray.500">
                                {course.instructor}
                              </Text>
                            </VStack>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Attendance Log Tab */}
            <TabPanel>
              <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                <CardBody>
                  <Text fontSize="lg" fontWeight="semibold" mb={4}>
                    Recent Attendance Log
                  </Text>

                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Date</Th>
                          <Th>Course</Th>
                          <Th>Time</Th>
                          <Th>Status</Th>
                          <Th>Method</Th>
                          <Th>Location</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {mockAttendanceData.attendanceLog.map((log) => (
                          <Tr key={log.id}>
                            <Td>{log.date}</Td>
                            <Td>
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="medium">{log.courseCode}</Text>
                                <Text fontSize="sm" color="gray.600">
                                  {log.courseName}
                                </Text>
                              </VStack>
                            </Td>
                            <Td>{log.time}</Td>
                            <Td>
                              <Badge colorScheme={log.status === "present" ? "green" : "red"} variant="subtle">
                                {log.status.toUpperCase()}
                              </Badge>
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  log.method === "QR Code" ? "blue" : log.method === "Manual" ? "purple" : "gray"
                                }
                                variant="outline"
                              >
                                {log.method}
                              </Badge>
                            </Td>
                            <Td>{log.location}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Attendance Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Attendance Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRecord && (
              <VStack spacing={4} align="stretch">
                <Box p={4} bg="blue.50" borderRadius="md">
                  <Text fontSize="lg" fontWeight="bold">
                    {selectedRecord.courseCode} - {selectedRecord.courseName}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Instructor: {selectedRecord.instructor}
                  </Text>
                </Box>

                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      Attendance Statistics
                    </Text>
                    <VStack align="start" spacing={2}>
                      <HStack>
                        <Text fontSize="sm">Attended:</Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {selectedRecord.attended}/{selectedRecord.total}
                        </Text>
                      </HStack>
                      <HStack>
                        <Text fontSize="sm">Percentage:</Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {selectedRecord.percentage.toFixed(1)}%
                        </Text>
                      </HStack>
                      <HStack>
                        <Text fontSize="sm">Can Miss:</Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {selectedRecord.canMiss} more classes
                        </Text>
                      </HStack>
                      <HStack>
                        <Text fontSize="sm">Sessions Left:</Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {selectedRecord.sessionsLeft}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>

                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      Schedule
                    </Text>
                    <VStack align="start" spacing={2}>
                      {selectedRecord.weeklySchedule.map((schedule, index) => (
                        <Text key={index} fontSize="sm">
                          {schedule}
                        </Text>
                      ))}
                    </VStack>
                  </Box>
                </Grid>

                <Box>
                  <Text fontWeight="medium" mb={2}>
                    Recent Sessions
                  </Text>
                  <VStack spacing={2} align="stretch">
                    {selectedRecord.recentSessions.map((session, index) => (
                      <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                        <Text fontSize="sm">{session.date}</Text>
                        <Badge colorScheme={session.status === "present" ? "green" : "red"} variant="subtle">
                          {session.status}
                        </Badge>
                        <Badge
                          colorScheme={
                            session.method === "QR Code" ? "blue" : session.method === "Manual" ? "purple" : "gray"
                          }
                          variant="outline"
                          size="sm"
                        >
                          {session.method}
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

                {selectedRecord.percentage < 75 && (
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontSize="sm">Attendance Warning!</AlertTitle>
                      <AlertDescription fontSize="sm">
                        Your attendance is below the required 75%. You need to attend all remaining classes to maintain
                        eligibility for exams.
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button onClick={onDetailClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
