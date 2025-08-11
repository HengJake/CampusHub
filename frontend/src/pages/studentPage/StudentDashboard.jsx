import {
  Box,
  Grid,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  Badge,
  Icon,
  useColorModeValue,
  Progress,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useDisclosure,
  Spinner,
  Skeleton,
  Tooltip,
} from "@chakra-ui/react"
import { useState, useEffect } from "react"
import {
  FiMapPin,
  FiBook,
  FiClock,
  FiCalendar,
  FiBarChart,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiMessageSquare,
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
} from "react-icons/fi"
import { FaBus } from "react-icons/fa";
import { useStudentStore } from "../../store/TBI/studentStore.js"
import { useServiceStore } from "../../store/service.js"
import { useFacilityStore } from "../../store/facility.js"
import { useTransportationStore } from "../../store/transportation.js"
import { useAcademicStore } from "../../store/academic.js"
import { BookingModal } from "../../component/student/BookingModal"
import { FeedbackModal } from "../../component/student/FeedbackModal"
import { useAuthStore } from "../../store/auth.js";

export default function StudentDashboard() {
  const {
    studentProfile,
    parkingSpots,
    shuttleSchedule,
    academicSchedule,
    myBookings,
    attendanceRecords,
    examSchedule,
  } = useStudentStore()

  const { getCurrentUser } = useAuthStore()
  const currentUser = getCurrentUser()

  // Use real data from stores
  const { feedback, responds, fetchFeedback, fetchResponds } = useServiceStore()
  const { bookings, fetchBookings } = useFacilityStore()
  const { busSchedules, fetchBusSchedules } = useTransportationStore()
  const { classSchedules, fetchClassSchedules, examSchedules, fetchExamSchedules, fetchIntakeCourses, intakeCourses } = useAcademicStore()

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const { isOpen: isBookingOpen, onOpen: onBookingOpen, onClose: onBookingClose } = useDisclosure()
  const { isOpen: isFeedbackOpen, onOpen: onFeedbackOpen, onClose: onFeedbackClose } = useDisclosure()

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [statsData, setStatsData] = useState({
    activeBookings: 0,
    avgAttendance: 0,
    upcomingExams: 0,
    availableParking: 0,
    todayClasses: 0,
    pendingFeedback: 0,
    shuttleStatus: 'loading',
    attendanceTrend: 'stable'
  })

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([
          fetchFeedback(),
          fetchResponds(),
          fetchBookings(),
          fetchBusSchedules(),
          fetchClassSchedules(),
          fetchExamSchedules(),
          fetchIntakeCourses()
        ])
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Calculate stats when data changes
  useEffect(() => {
    if (!isLoading) {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]

      // Active bookings (excluding cancelled)
      const activeBookings = bookings.filter(b => b.status !== "cancelled").length

      // Average attendance
      const avgAttendance = attendanceRecords.length > 0
        ? Math.round(attendanceRecords.reduce((acc, record) => acc + (record.percentage || 0), 0) / attendanceRecords.length)
        : 0

      // Upcoming exams (within next 30 days)
      const upcomingExams = examSchedules.filter(exam => {
        const examDate = new Date(exam.examDate)
        const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
        return examDate >= today && examDate <= thirtyDaysFromNow
      }).length

      // Available parking spots
      const availableParking = parkingSpots.reduce((acc, spot) => acc + (spot.available || 0), 0)

      // Today's classes
      const todayClasses = classSchedules.filter(schedule => {
        const today = new Date()
        const todayDayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' })

        // Check if today matches the schedule's day of week
        const isToday = schedule.dayOfWeek === todayDayOfWeek

        // Check if the module is currently active (between start and end dates)
        const moduleStartDate = new Date(schedule.moduleStartDate)
        const moduleEndDate = new Date(schedule.moduleEndDate)
        const isModuleActive = today >= moduleStartDate && today <= moduleEndDate

        return isToday && isModuleActive
      }).length

      // Pending feedback responses
      const pendingFeedback = feedback.filter(f => f.status === 'pending').length

      // Shuttle status (check if any shuttles are delayed)
      const shuttleStatus = busSchedules.length > 0
        ? busSchedules.some(shuttle => shuttle.status === 'delayed') ? 'delayed' : 'on-time'
        : 'no-data'

      // Attendance trend (compare current vs previous period)
      const attendanceTrend = attendanceRecords.length >= 2
        ? attendanceRecords[attendanceRecords.length - 1]?.percentage > attendanceRecords[attendanceRecords.length - 2]?.percentage
          ? 'up'
          : attendanceRecords[attendanceRecords.length - 1]?.percentage < attendanceRecords[attendanceRecords.length - 2]?.percentage
            ? 'down'
            : 'stable'
        : 'stable'

      setStatsData({
        activeBookings,
        avgAttendance,
        upcomingExams,
        availableParking,
        todayClasses,
        pendingFeedback,
        shuttleStatus,
        attendanceTrend
      })
    }
  }, [isLoading, bookings, attendanceRecords, examSchedules, parkingSpots, classSchedules, feedback, busSchedules])

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "green"
      case "limited":
        return "yellow"
      case "full":
        return "red"
      case "on-time":
        return "green"
      case "delayed":
        return "red"
      case "good":
        return "green"
      case "warning":
        return "yellow"
      default:
        return "gray"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return FiCheckCircle
      case "pending":
        return FiClock
      case "cancelled":
        return FiXCircle
      default:
        return FiClock
    }
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return FiTrendingUp
      case 'down':
        return FiTrendingDown
      default:
        return FiMinus
    }
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'green.500'
      case 'down':
        return 'red.500'
      default:
        return 'gray.500'
    }
  }

  const currentIC = intakeCourses.find(ic => ic._id == currentUser.user.student.intakeCourseId);

  // Show loading spinner while waiting for currentIC to be set
  if (!currentIC) {
    return (
      <Box p={6} minH="100vh" display="flex" justifyContent="center" alignItems="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.600">Loading student information...</Text>
        </VStack>
      </Box>
    );
  }

  const QuickStatCard = ({ title, value, icon, color, trend, tooltip, isLoading }) => (
    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}>
      <CardBody>
        <HStack justify="space-between">
          <Box flex="1">
            <Text fontSize="sm" color="gray.600" mb={1}>
              {title}
            </Text>
            {isLoading ? (
              <Skeleton height="32px" width="60px" />
            ) : (
              <HStack align="center" spacing={2}>
                <Text fontSize="2xl" fontWeight="bold">
                  {value}
                </Text>
                {trend && (
                  <Icon
                    as={getTrendIcon(trend)}
                    color={getTrendColor(trend)}
                    boxSize={4}
                  />
                )}
              </HStack>
            )}
          </Box>
          <Icon as={icon} boxSize={6} color={color} />
        </HStack>
      </CardBody>
    </Card>
  )

  return (
    <Box minH="100vh" >
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
            Welcome back, {currentUser?.student?.name || 'Student'}!
          </Text>
          <Text color="gray.600">
            Student • {currentUser?.student?.status || 'enrolled'} • {currentIC.intakeId.intakeName} • {currentIC.courseId.courseName}
          </Text>
        </Box>

        {/* Quick Stats */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
          <Tooltip label="Your active facility bookings" placement="top">
            <Box>
              <QuickStatCard
                title="Active Bookings"
                value={statsData.activeBookings}
                icon={FiCalendar}
                color="blue.500"
                isLoading={isLoading}
              />
            </Box>
          </Tooltip>

          <Tooltip label="Your average attendance across all modules" placement="top">
            <Box>
              <QuickStatCard
                title="Avg Attendance"
                value={`${statsData.avgAttendance}%`}
                icon={FiBarChart}
                color="green.500"
                trend={statsData.attendanceTrend}
                isLoading={isLoading}
              />
            </Box>
          </Tooltip>

          <Tooltip label="Exams scheduled in the next 30 days" placement="top">
            <Box>
              <QuickStatCard
                title="Upcoming Exams"
                value={statsData.upcomingExams}
                icon={FiClock}
                color="orange.500"
                isLoading={isLoading}
              />
            </Box>
          </Tooltip>

          <Tooltip label="Total available parking spots across all zones" placement="top">
            <Box>
              <QuickStatCard
                title="Available Parking"
                value={statsData.availableParking}
                icon={FiMapPin}
                color="purple.500"
                isLoading={isLoading}
              />
            </Box>
          </Tooltip>
        </Grid>

        {/* Additional Stats Row */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
          <Tooltip label="Classes scheduled for today" placement="top">
            <Box>
              <QuickStatCard
                title="Today's Classes"
                value={statsData.todayClasses}
                icon={FiBook}
                color="teal.500"
                isLoading={isLoading}
              />
            </Box>
          </Tooltip>

          <Tooltip label="Pending feedback responses from admin" placement="top">
            <Box>
              <QuickStatCard
                title="Pending Feedback"
                value={statsData.pendingFeedback}
                icon={FiMessageSquare}
                color="pink.500"
                isLoading={isLoading}
              />
            </Box>
          </Tooltip>

          <Tooltip label="Current shuttle service status" placement="top">
            <Box>
              <QuickStatCard
                title="Shuttle Status"
                value={statsData.shuttleStatus === 'no-data' ? 'N/A' : statsData.shuttleStatus}
                icon={FaBus}
                color={statsData.shuttleStatus === 'delayed' ? 'red.500' : 'green.500'}
                isLoading={isLoading}
              />
            </Box>
          </Tooltip>

          <Tooltip label="Your current academic progress" placement="top">
            <Box>
              <QuickStatCard
                title="Academic Status"
                value={currentUser?.student?.status || 'Enrolled'}
                icon={FiCheckCircle}
                color="green.500"
                isLoading={isLoading}
              />
            </Box>
          </Tooltip>
        </Grid>

        {/* Main Content - Accordion Layout */}
        <Accordion allowMultiple defaultIndex={[0]}>
          {/* Facility Management */}
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <HStack>
                  <Icon as={FiMapPin} color="blue.500" />
                  <Text fontSize="lg" fontWeight="semibold">
                    Facility Management
                  </Text>
                </HStack>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                {/* Real-Time Parking */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                  <CardBody>
                    <Text fontSize="md" fontWeight="semibold" mb={4}>
                      Real-Time Parking Availability
                    </Text>
                    <VStack spacing={3} align="stretch">
                      {parkingSpots.map((spot) => {
                        // console.log("🚀 ~ spot:", spot)

                        return (
                          <HStack key={spot.id} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                            <Box>
                              <Text fontWeight="medium">{spot.zone}</Text>
                              <Text fontSize="sm" color="gray.600">
                                {spot.available}/{spot.total} available
                              </Text>
                            </Box>
                            <Badge colorScheme={getStatusColor(spot.status)} variant="subtle">
                              {spot.status}
                            </Badge>
                          </HStack>
                        )
                      })}
                    </VStack>
                  </CardBody>
                </Card>

                {/* My Bookings */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                  <CardBody>
                    <HStack justify="space-between" mb={4}>
                      <Text fontSize="md" fontWeight="semibold">
                        My Bookings
                      </Text>
                      <Button size="sm" colorScheme="blue" onClick={onBookingOpen}>
                        New Booking
                      </Button>
                    </HStack>
                    <VStack spacing={3} align="stretch">
                      {bookings.slice(0, 3).map((booking) => (
                        <HStack key={booking._id} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                          <Box>
                            <Text fontWeight="medium">{booking.resourceId?.name || booking.resourceName}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {new Date(booking.bookingDate).toLocaleDateString()} • {booking.startTime} - {booking.endTime}
                            </Text>
                          </Box>
                          <HStack>
                            <Icon as={getStatusIcon(booking.status)} color={getStatusColor(booking.status)} />
                            <Badge colorScheme={getStatusColor(booking.status)} variant="subtle">
                              {booking.status}
                            </Badge>
                          </HStack>
                        </HStack>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              </Grid>
            </AccordionPanel>
          </AccordionItem>

          {/* Transportation Services */}
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <HStack>
                  <Icon as={FaBus} color="green.500" />
                  <Text fontSize="lg" fontWeight="semibold">
                    Transportation Services
                  </Text>
                </HStack>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                <CardBody>
                  <Text fontSize="md" fontWeight="semibold" mb={4}>
                    Shuttle Schedule
                  </Text>
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Route</Th>
                          <Th>Next Arrival</Th>
                          <Th>Frequency</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {busSchedules.map((shuttle) => (
                          <Tr key={shuttle._id}>
                            <Td>{shuttle.routeId?.name || shuttle.routeName}</Td>
                            <Td fontWeight="medium">{shuttle.departureTime}</Td>
                            <Td>{shuttle.frequency || "Regular"}</Td>
                            <Td>
                              <Badge colorScheme={getStatusColor(shuttle.status || "on-time")} variant="subtle">
                                {shuttle.status || "on-time"}
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </CardBody>
              </Card>
            </AccordionPanel>
          </AccordionItem>

          {/* Academic Services */}
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <HStack>
                  <Icon as={FiBook} color="purple.500" />
                  <Text fontSize="lg" fontWeight="semibold">
                    Academic Services
                  </Text>
                </HStack>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                {/* Today's Schedule */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                  <CardBody>
                    <Text fontSize="md" fontWeight="semibold" mb={4}>
                      Today's Schedule
                    </Text>
                    <VStack spacing={3} align="stretch">
                      {(() => {
                        const today = new Date()
                        const todayDayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' })

                        const todaysSchedules = classSchedules.filter(schedule => {
                          // Check if today matches the schedule's day of week
                          const isToday = schedule.dayOfWeek === todayDayOfWeek

                          // Check if the module is currently active (between start and end dates)
                          const moduleStartDate = new Date(schedule.moduleStartDate)
                          const moduleEndDate = new Date(schedule.moduleEndDate)
                          const isModuleActive = today >= moduleStartDate && today <= moduleEndDate

                          return isToday && isModuleActive
                        }).slice(0, 3)

                        if (todaysSchedules.length === 0) {
                          return (
                            <Box p={3} bg="gray.50" borderRadius="md" textAlign="center">
                              <Text fontSize="sm" color="gray.600">No classes scheduled for today</Text>
                            </Box>
                          )
                        }

                        return todaysSchedules.map((schedule) => (
                          <Box key={schedule._id} p={3} bg="gray.50" borderRadius="md">
                            <Text fontWeight="medium">{schedule.moduleId?.moduleName || schedule.moduleName}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {schedule.startTime} - {schedule.endTime} • {schedule.roomId?.block} {schedule.roomId?.roomNumber}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              {schedule.lecturerId?.title?.join(', ')} {schedule.lecturerId?.userId?.name || schedule.lecturerName}
                            </Text>
                          </Box>
                        ))
                      })()}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Attendance Overview */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                  <CardBody>
                    <Text fontSize="md" fontWeight="semibold" mb={4}>
                      Attendance Overview
                    </Text>
                    <VStack spacing={4} align="stretch">
                      {attendanceRecords.map((record) => {

                        return (
                          <Box key={record.id}>
                            <HStack justify="space-between" mb={2}>
                              <Text fontSize="sm" fontWeight="medium">
                                {record.moduleId?.name || record.moduleName}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {record.attendedSessions}/{record.totalSessions} ({record.attendancePercentage}%)
                              </Text>
                            </HStack>
                            <Progress
                              value={record.attendancePercentage}
                              colorScheme={record.attendancePercentage >= 80 ? "green" : "yellow"}
                              size="sm"
                            />
                          </Box>
                        )
                      })}
                    </VStack>
                  </CardBody>
                </Card>
              </Grid>
            </AccordionPanel>
          </AccordionItem>

          {/* Student Utilities */}
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <HStack>
                  <Icon as={FiMessageSquare} color="orange.500" />
                  <Text fontSize="lg" fontWeight="semibold">
                    Student Utilities
                  </Text>
                </HStack>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                <CardBody>
                  <Text fontSize="md" fontWeight="semibold" mb={4}>
                    Quick Actions
                  </Text>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                    <Button leftIcon={<FiMessageSquare />} colorScheme="blue" onClick={onFeedbackOpen}>
                      Submit Feedback
                    </Button>
                    <Button leftIcon={<FiAlertCircle />} variant="outline">
                      Report Lost Item
                    </Button>
                    <Button leftIcon={<FaBus />} variant="outline">
                      Request Campus Ride
                    </Button>
                    <Button leftIcon={<FiMapPin />} variant="outline">
                      Find Classroom
                    </Button>
                  </Grid>
                  {feedback.length > 0 && (
                    <Box mt={4}>
                      <Text fontSize="sm" fontWeight="semibold" mb={2}>
                        Recent Feedback ({feedback.length})
                      </Text>
                      <VStack spacing={2} align="stretch">
                        {feedback.slice(0, 2).map((item) => (
                          <Box key={item._id} p={3} bg="gray.50" borderRadius="md">
                            <Text fontSize="sm" fontWeight="medium">
                              {item.feedbackType}
                            </Text>
                            <Text fontSize="xs" color="gray.600" noOfLines={2}>
                              {item.message}
                            </Text>
                            <Badge colorScheme={getStatusColor(item.status)} size="sm" mt={1}>
                              {item.status}
                            </Badge>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  )}
                </CardBody>
              </Card>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>

      {/* Modals */}
      <BookingModal isOpen={isBookingOpen} onClose={onBookingClose} />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={onFeedbackClose} />
    </Box>
  )
}
