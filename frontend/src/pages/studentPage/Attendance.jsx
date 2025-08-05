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
  Spinner,
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
import { useEffect, useState, useMemo } from "react"
import { FaChartBar } from "react-icons/fa";
import { useAcademicStore } from "../../store/academic";
import { useAuthStore } from "../../store/auth";

export default function Attendance() {
  const { fetchAttendanceByStudentId, fetchAttendance, createAttendance, fetchClassSchedulesByStudentId, attendance, loading, classSchedules } = useAcademicStore();

  useEffect(() => {
    // Get current user's student ID from auth store
    const authStore = useAuthStore.getState();
    const user = authStore.getCurrentUser();

    if (user) {
      // For students, fetch their own attendance and class schedules
      fetchAttendanceByStudentId(user.studentId);
      fetchClassSchedulesByStudentId(user.studentId);
    }
  }, [fetchAttendanceByStudentId, fetchClassSchedulesByStudentId]);

  console.log(classSchedules)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedModule, setSelectedModule] = useState("")
  const [selectedClass, setSelectedClass] = useState("")
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

  // Process attendance data to group by module/course
  const processedAttendanceData = useMemo(() => {
    if (!attendance || attendance.length === 0) {
      return {
        attendanceRecords: [],
        attendanceLog: [],
        monthlyStats: {},
        overallStats: { attended: 0, total: 0, percentage: 0 }
      };
    }

    // Group attendance by scheduleId (which represents a course/module)
    const courseGroups = {};

    attendance.forEach(record => {
      const scheduleId = record.scheduleId._id;
      if (!courseGroups[scheduleId]) {
        courseGroups[scheduleId] = {
          scheduleId: scheduleId,
          moduleId: record.scheduleId.moduleId,
          moduleName: record.scheduleId.moduleId?.moduleName || 'Unknown Module',
          moduleCode: record.scheduleId.moduleId?.code || 'UNK',
          lecturerId: record.scheduleId.lecturerId,
          lecturerName: record.scheduleId.lecturerId?.userId?.name || 'Unknown Lecturer',
          roomId: record.scheduleId.roomId,
          roomName: record.scheduleId.roomId?.roomName || 'Unknown Room',
          dayOfWeek: record.scheduleId.dayOfWeek,
          startTime: record.scheduleId.startTime,
          endTime: record.scheduleId.endTime,
          records: []
        };
      }
      courseGroups[scheduleId].records.push(record);
    });

    // Convert to attendance records format
    const attendanceRecords = Object.values(courseGroups).map(course => {
      const totalSessions = course.records.length;
      const attendedSessions = course.records.filter(r => r.status === 'present').length;
      const lateSessions = course.records.filter(r => r.status === 'late').length;
      const absentSessions = course.records.filter(r => r.status === 'absent').length;

      // Calculate percentage (present + late count as attended)
      const effectiveAttended = attendedSessions + lateSessions;
      const percentage = totalSessions > 0 ? Math.round((effectiveAttended / totalSessions) * 100) : 0;

      // Calculate sessions left (assuming 15 weeks per semester)
      const totalWeeks = 15;
      const sessionsLeft = Math.max(0, totalWeeks - totalSessions);
      const canMiss = Math.max(0, Math.floor(totalWeeks * 0.25) - absentSessions); // 25% can be missed

      // Get recent sessions (last 5)
      const recentSessions = course.records
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map(record => ({
          date: new Date(record.date).toLocaleDateString(),
          status: record.status,
          method: 'Manual' // Default method since it's not in the data
        }));

      return {
        id: course.scheduleId,
        courseCode: course.moduleCode,
        courseName: course.moduleName,
        attended: effectiveAttended,
        total: totalSessions,
        percentage: percentage,
        status: percentage >= 90 ? 'excellent' : percentage >= 80 ? 'good' : percentage >= 75 ? 'satisfactory' : 'critical',
        lastUpdated: course.records.length > 0 ? new Date(course.records[course.records.length - 1].date).toLocaleDateString() : 'N/A',
        requiredPercentage: 75,
        sessionsLeft: sessionsLeft,
        canMiss: canMiss,
        instructor: course.lecturerName,
        weeklySchedule: [`${course.dayOfWeek} ${course.startTime}-${course.endTime}`],
        recentSessions: recentSessions,
        roomName: course.roomName
      };
    });

    // Create attendance log
    const attendanceLog = attendance
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)
      .map(record => ({
        id: record._id,
        courseCode: record.scheduleId.moduleId?.code || 'UNK',
        courseName: record.scheduleId.moduleId?.moduleName || 'Unknown Module',
        date: new Date(record.date).toLocaleDateString(),
        time: record.scheduleId.startTime,
        status: record.status,
        method: 'Manual',
        location: record.scheduleId.roomId?.roomName || 'Unknown Room',
        instructor: record.scheduleId.lecturerId?.userId?.firstName + ' ' + record.scheduleId.lecturerId?.userId?.lastName || 'Unknown Lecturer'
      }));

    // Calculate monthly stats
    const monthlyStats = {};
    attendance.forEach(record => {
      const date = new Date(record.date);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      const key = `${month} ${year}`;

      if (!monthlyStats[key]) {
        monthlyStats[key] = { attended: 0, total: 0, percentage: 0 };
      }

      monthlyStats[key].total++;
      if (record.status === 'present' || record.status === 'late') {
        monthlyStats[key].attended++;
      }
    });

    // Calculate percentages
    Object.keys(monthlyStats).forEach(month => {
      const stats = monthlyStats[month];
      stats.percentage = stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 0;
    });

    // Calculate overall stats
    const totalAttended = attendance.filter(r => r.status === 'present' || r.status === 'late').length;
    const totalClasses = attendance.length;
    const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

    return {
      attendanceRecords,
      attendanceLog,
      monthlyStats,
      overallStats: {
        attended: totalAttended,
        total: totalClasses,
        percentage: overallPercentage
      }
    };
  }, [attendance]);

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 90) return { status: "excellent", color: "green", icon: FiCheckCircle }
    if (percentage >= 80) return { status: "good", color: "blue", icon: FiCheckCircle }
    if (percentage >= 75) return { status: "satisfactory", color: "yellow", icon: FiAlertCircle }
    return { status: "critical", color: "red", icon: FiAlertCircle }
  }

  const calculateOverallAttendance = () => {
    return processedAttendanceData.overallStats.percentage;
  }

  const getAttendanceTrend = () => {
    const months = Object.keys(processedAttendanceData.monthlyStats);
    if (months.length < 2) return { trend: "stable", change: 0 }

    const sortedMonths = months.sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB - dateA;
    });

    const current = processedAttendanceData.monthlyStats[sortedMonths[0]];
    const previous = processedAttendanceData.monthlyStats[sortedMonths[1]];
    const change = current.percentage - previous.percentage;

    return {
      trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
      change: Math.abs(change).toFixed(1),
    }
  }

  const handleAttendanceSubmit = async () => {
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

    if (!selectedClass) {
      toast({
        title: "Error",
        description: "Please select a class schedule",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)

    try {
      // Get current user's student ID from auth store
      const authStore = useAuthStore.getState();
      const user = authStore.getCurrentUser();

      if (!user || user.role !== 'student') {
        toast({
          title: "Error",
          description: "Only students can mark attendance",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
        return
      }

      // Create attendance data
      const attendanceData = {
        studentId: user.studentId,
        scheduleId: selectedClass, // This should be the schedule ID
        status: "present", // Default to present when student marks attendance
        date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
        schoolId: authStore.getSchoolId(),
        attendanceCode: attendanceCode.trim()
      }

      const result = await createAttendance(attendanceData)

      if (result.success) {
        toast({
          title: "Attendance Recorded",
          description: "Your attendance has been successfully recorded",
          status: "success",
          duration: 3000,
          isClosable: true,
        })

        // Refresh attendance data
        await fetchAttendanceByStudentId(user.studentId)

        setAttendanceCode("")
        setSelectedModule("")
        setSelectedClass("")
        onAttendanceClose()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to record attendance",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to record attendance",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    // Get current user's student ID from auth store
    const authStore = useAuthStore.getState();
    const user = authStore.getCurrentUser();

    if (user && user.role === 'student') {
      // For students, fetch their own attendance
      fetchAttendanceByStudentId(user._id);
    } else {
      // For other roles, fetch all attendance (fallback)
      fetchAttendance();
    }

    setLastRefresh(new Date())
    toast({
      title: "Data Refreshed",
      description: "Attendance data has been updated",
      status: "info",
      duration: 2000,
      isClosable: true,
    })
  }

  const filteredRecords = processedAttendanceData.attendanceRecords.filter((record) => {
    const matchesSearch =
      record.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.instructor.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || record.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const attendanceTrend = getAttendanceTrend()

  // Show loading state
  if (loading?.attendance) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" boxSize="40px" />
          <Text>Loading attendance data...</Text>
        </VStack>
      </Box>
    );
  }

  // Show empty state
  if (!attendance || attendance.length === 0) {
    return (
      <Box>
        <VStack spacing={6} align="stretch">
          <Flex justify="space-between" align="center">
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
                Attendance Tracking
              </Text>
              <Text color="gray.600">Monitor your class attendance and maintain academic requirements</Text>
            </Box>
          </Flex>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <VStack spacing={4}>
                <Icon as={FiCalendar} color="gray.400" />
                <Text fontSize="lg" fontWeight="medium" color="gray.600">
                  No attendance records found
                </Text>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Your attendance records will appear here once they are recorded by your instructors.
                </Text>
                <Button onClick={handleRefresh} leftIcon={<FiRefreshCw />}>
                  Refresh Data
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    );
  }

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
                  {processedAttendanceData.attendanceRecords.filter((r) => r.percentage < 75).length}
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
                  {processedAttendanceData.attendanceRecords.filter((r) => r.percentage >= 95).length}
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
                  {processedAttendanceData.overallStats.total}
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
                          <option value="satisfactory">Satisfactory</option>
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
                          <FormLabel>Select Module (Optional)</FormLabel>
                          <Select
                            placeholder="Choose a module to filter schedules"
                            value={selectedModule}
                            onChange={(e) => setSelectedModule(e.target.value)}
                          >
                            <option value="">All Modules</option>
                            {classSchedules && classSchedules.length > 0 && classSchedules.map((schedule) => (
                              <option key={schedule.moduleId?._id} value={schedule.moduleId?.moduleName}>
                                {schedule.moduleId?.code} - {schedule.moduleId?.moduleName}
                              </option>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl>
                          <FormLabel>Select Class</FormLabel>
                          <Select
                            placeholder="Choose a Class Schedule"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                          >
                            {classSchedules && classSchedules.length > 0 && classSchedules
                              .filter(schedule => !selectedModule || schedule.moduleId?.moduleName === selectedModule)
                              .map((schedule) => (
                                <option key={schedule._id} value={schedule._id}>
                                  {schedule.moduleId?.code} - {schedule.moduleId?.moduleName} ({schedule.dayOfWeek} {schedule.startTime}-{schedule.endTime}, {schedule.roomId?.roomName})
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
                          isDisabled={!selectedClass || !attendanceCode.trim()}
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
                            1. Select your class schedule from the dropdown (optional: filter by module first)
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
                      Your Courses
                    </Text>

                    <VStack spacing={3} align="stretch">
                      {classSchedules && classSchedules.length > 0 ? classSchedules.slice(0, 3).map((schedule) => (
                        <Box key={schedule._id} p={3} bg="gray.50" borderRadius="md" borderWidth="1px">
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium">{schedule.moduleId?.code}</Text>
                              <Text fontSize="sm" color="gray.600">
                                {schedule.moduleId?.moduleName}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {schedule.dayOfWeek} {schedule.startTime}-{schedule.endTime}, {schedule.roomId?.roomName}
                              </Text>
                            </VStack>
                            <VStack align="end" spacing={1}>
                              <Badge colorScheme="blue" variant="outline">
                                {schedule.lecturerId?.userId?.firstName} {schedule.lecturerId?.userId?.lastName}
                              </Badge>
                              <Text fontSize="xs" color="gray.500">
                                {schedule.intakeCourseId?.courseId?.courseName}
                              </Text>
                            </VStack>
                          </HStack>
                        </Box>
                      )) : (
                        <Text fontSize="sm" color="gray.500" textAlign="center">
                          No class schedules found
                        </Text>
                      )}
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
                        {processedAttendanceData.attendanceLog.map((log) => (
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
                              <Badge colorScheme={log.status === "present" ? "green" : log.status === "late" ? "yellow" : "red"} variant="subtle">
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
                        <Badge colorScheme={session.status === "present" ? "green" : session.status === "late" ? "yellow" : "red"} variant="subtle">
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
