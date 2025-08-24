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
import { useServiceStore } from "../../store/service.js"
import { useFacilityStore } from "../../store/facility.js"
import { useTransportationStore } from "../../store/transportation.js"
import { useAcademicStore } from "../../store/academic.js"
import { BookingModal } from "../../component/student/BookingModal"
import { FeedbackModal } from "../../component/student/FeedbackModal"
import { useAuthStore } from "../../store/auth.js";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {

  const { getCurrentUser, initializeAuth } = useAuthStore()
  const currentUser = getCurrentUser()
  const navigate = useNavigate()

  // Use real data from stores
  const { feedback, responds, fetchFeedbackByStudentId, fetchResponds } = useServiceStore()
  const { bookings, fetchBookingsByStudentId, parkingLots, fetchParkingLotsBySchoolId } = useFacilityStore()
  const { busSchedules, fetchBusSchedules } = useTransportationStore()
  const {
    classSchedules,
    fetchClassSchedules,
    examSchedules,
    fetchExamSchedules,
    fetchIntakeCourses,
    intakeCourses,
    attendance,
    fetchAttendanceByStudentId
  } = useAcademicStore();

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const { isOpen: isBookingOpen, onOpen: onBookingOpen, onClose: onBookingClose } = useDisclosure()
  const { isOpen: isFeedbackOpen, onOpen: onFeedbackOpen, onClose: onFeedbackClose } = useDisclosure()

  // Navigation functions
  const navigateToFeedback = () => navigate('/feedback')
  const navigateToTransportation = () => navigate('/transportation')
  const navigateToClassFinder = () => navigate('/class-finder')

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

  useEffect(() => {
    initializeAuth()
  }, [])

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const user = getCurrentUser()
        await Promise.all([
          user?.studentId ? fetchFeedbackByStudentId(user.studentId) : Promise.resolve(),
          fetchResponds(),
          user?.studentId ? fetchBookingsByStudentId(user.studentId) : Promise.resolve(),
          user?.studentId ? fetchAttendanceByStudentId(user.studentId) : Promise.resolve(),
          fetchParkingLotsBySchoolId(),
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
  }, [fetchFeedbackByStudentId, fetchResponds, fetchBookingsByStudentId, fetchAttendanceByStudentId, fetchParkingLotsBySchoolId, fetchBusSchedules, fetchClassSchedules, fetchExamSchedules, fetchIntakeCourses, getCurrentUser])

  // Calculate stats when data changes
  useEffect(() => {
    if (!isLoading) {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]

      // Active bookings (excluding cancelled)
      const activeBookings = bookings.filter(b => b.status !== "cancelled").length

      // Average attendance - calculate from grouped module data
      const avgAttendance = (() => {
        if (attendance.length === 0) return 0;

        // Group attendance records by module
        const groupedByModule = attendance.reduce((acc, record) => {
          const moduleId = record.scheduleId?.moduleId?._id;

          if (!acc[moduleId]) {
            acc[moduleId] = {
              totalSessions: 0,
              attendedSessions: 0
            };
          }

          acc[moduleId].totalSessions++;

          if (record.status === 'present' || record.status === 'late') {
            acc[moduleId].attendedSessions++;
          }

          return acc;
        }, {});

        // Calculate percentage for each module
        const modulePercentages = Object.values(groupedByModule).map(module =>
          Math.round((module.attendedSessions / module.totalSessions) * 100)
        );

        // Return average of all module percentages
        return Math.round(modulePercentages.reduce((acc, percentage) => acc + percentage, 0) / modulePercentages.length);
      })()

      // Upcoming exams (within next 30 days)
      const upcomingExams = examSchedules.filter(exam => {
        const examDate = new Date(exam.examDate)
        const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
        return examDate >= today && examDate <= thirtyDaysFromNow
      }).length

      // Available parking spots from facility store (grouped by zone)
      const availableParking = parkingLots.filter(lot => lot.active).length

      // Today's classes - filter by day of week and check if module is active
      const todayClasses = classSchedules.filter(schedule => {
        const today = new Date()
        const todayDayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' })

        // Check if today matches the schedule's day of week
        const isToday = schedule.dayOfWeek === todayDayOfWeek

        // Check if the module is currently active (between start and end dates)
        if (schedule.moduleStartDate && schedule.moduleEndDate) {
          const moduleStartDate = new Date(schedule.moduleStartDate)
          const moduleEndDate = new Date(schedule.moduleEndDate)

          // Reset time to start of day for accurate comparison
          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
          const startDate = new Date(moduleStartDate.getFullYear(), moduleStartDate.getMonth(), moduleStartDate.getDate())
          const endDate = new Date(moduleEndDate.getFullYear(), moduleEndDate.getMonth(), moduleEndDate.getDate())

          const isModuleActive = todayStart >= startDate && todayStart <= endDate

          return isToday && isModuleActive
        }

        // If no module dates, only check day of week
        return isToday
      }).length

      // Pending feedback responses
      const pendingFeedback = feedback.filter(f => f.status === 'pending').length

      // Shuttle status (check if any shuttles are active and running today)
      const todayDayOfWeek = today.getDay() === 0 ? 7 : today.getDay() // Convert Sunday=0 to Sunday=7

      const shuttleStatus = busSchedules.length > 0
        ? busSchedules.some(schedule =>
          schedule.active &&
          schedule.dayOfWeek === todayDayOfWeek &&
          new Date(schedule.startDate) <= today &&
          new Date(schedule.endDate) >= today
        ) ? 'running' : 'scheduled'
        : 'no-data'

      // Attendance trend (compare current vs previous period)
      const attendanceTrend = attendance.length >= 2
        ? attendance[attendance.length - 1]?.percentage > attendance[attendance.length - 2]?.percentage
          ? 'up'
          : attendance[attendance.length - 1]?.percentage < attendance[attendance.length - 2]?.percentage
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
  }, [isLoading, bookings, attendance, examSchedules, parkingLots, classSchedules, feedback, busSchedules])

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
      case "running":
        return "green"
      case "scheduled":
        return "blue"
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

  // Transform time from 24-hour format to 12-hour format
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

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

  // Check if user data is properly loaded
  if (!currentUser || !currentUser.user) {
    return (
      <Box p={6} minH="100vh" display="flex" justifyContent="center" alignItems="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.600">Loading user information...</Text>
        </VStack>
      </Box>
    );
  }

  // Check if student data is available
  if (!currentUser.student) {
    return (
      <Box p={6} minH="100vh" display="flex" justifyContent="center" alignItems="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.600">Loading student information...</Text>
        </VStack>
      </Box>
    );
  }

  // Check if student profile setup is required
  if (currentUser.student.status === 'pending_setup') {
    return (
      <Box p={6} minH="100vh" display="flex" justifyContent="center" alignItems="center">
        <VStack spacing={4}>
          <Text fontSize="xl" fontWeight="bold" color="gray.800">
            Profile Setup Required
          </Text>
          <Text color="gray.600" textAlign="center">
            Your student profile needs to be set up. Please contact your school administrator to complete your profile setup.
          </Text>
          <Text color="gray.500" fontSize="sm">
            {currentUser.student.message}
          </Text>
        </VStack>
      </Box>
    );
  }

  const currentIC = intakeCourses.find(ic => ic._id == currentUser.student?.intakeCourseId || null);

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

  // Check if student has complete profile setup
  if (!currentUser.student.intakeCourseId) {
    return (
      <Box p={6} minH="100vh" display="flex" justifyContent="center" alignItems="center">
        <VStack spacing={4}>
          <Text fontSize="xl" fontWeight="bold" color="gray.800">
            Profile Setup Incomplete
          </Text>
          <Text color="gray.600" textAlign="center">
            Your student profile is missing required information. Please contact your school administrator to complete your profile setup.
          </Text>
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
            Welcome back, {currentUser?.user?.name || currentUser?.name || 'Student'}!
          </Text>
          <Text color="gray.600">
            Student • {currentUser?.student?.status || 'enrolled'} • {currentIC?.intakeId?.intakeName || 'Profile Setup Required'} • {currentIC?.courseId?.courseName || 'Profile Setup Required'}
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
                      {(() => {
                        // Group parking lots by zone
                        const groupedByZone = parkingLots.reduce((acc, lot) => {
                          if (!acc[lot.zone]) {
                            acc[lot.zone] = [];
                          }
                          acc[lot.zone].push(lot);
                          return acc;
                        }, {});

                        // Calculate statistics for each zone
                        const zoneStats = Object.entries(groupedByZone).map(([zone, lots]) => {
                          const totalSlots = lots.length;
                          const availableSlots = lots.filter(lot => lot.active).length;
                          const occupiedSlots = totalSlots - availableSlots;
                          const occupancyPercentage = Math.round((occupiedSlots / totalSlots) * 100);
                          const availablePercentage = 100 - occupancyPercentage;

                          // Get available slot numbers
                          const availableSlotNumbers = lots
                            .filter(lot => lot.active)
                            .map(lot => lot.slotNumber)
                            .sort((a, b) => a - b);

                          return {
                            zone,
                            totalSlots,
                            availableSlots,
                            occupiedSlots,
                            occupancyPercentage,
                            availablePercentage,
                            availableSlotNumbers
                          };
                        });

                        return zoneStats.map((stats) => (
                          <Box key={stats.zone} p={3} bg="gray.50" borderRadius="md">
                            <HStack justify="space-between" mb={2}>
                              <Text fontWeight="medium">Zone {stats.zone}</Text>
                              <Badge
                                colorScheme={
                                  stats.availablePercentage >= 50 ? "green" :
                                    stats.availablePercentage >= 25 ? "yellow" : "red"
                                }
                                variant="subtle"
                              >
                                {stats.availablePercentage}% Available
                              </Badge>
                            </HStack>

                            <VStack spacing={1} align="stretch">
                              <HStack justify="space-between">
                                <Text fontSize="sm" color="gray.600">
                                  {stats.availableSlots}/{stats.totalSlots} slots available
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                  {stats.occupancyPercentage}% occupied
                                </Text>
                              </HStack>

                              <Progress
                                value={stats.occupancyPercentage}
                                colorScheme={
                                  stats.occupancyPercentage >= 75 ? "red" :
                                    stats.occupancyPercentage >= 50 ? "yellow" : "green"
                                }
                                size="sm"
                              />

                              <HStack>
                                {stats.availableSlots > 0 && (
                                  stats.availableSlotNumbers.map(num => {
                                    return (<Badge key={num} colorScheme="gray" variant="outline">Slot {num}</Badge>)
                                  })
                                )}
                              </HStack>
                            </VStack>
                          </Box>
                        ));
                      })()}
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
                          <Th>Day</Th>
                          <Th>Start Time</Th>
                          <Th>End Time</Th>
                          <Th>Vehicle</Th>
                          <Th display={{ base: "none", lg: "table-cell" }}>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {busSchedules.slice(0, 5).map((schedule) => {
                          // Get route timing info
                          const routeTiming = schedule.routeTiming?.[0] || {}

                          // Convert day number to day name
                          const getDayName = (dayNumber) => {
                            const days = {
                              1: 'Monday',
                              2: 'Tuesday',
                              3: 'Wednesday',
                              4: 'Thursday',
                              5: 'Friday',
                              6: 'Saturday',
                              7: 'Sunday'
                            }
                            return days[dayNumber] || 'Daily'
                          }

                          // Get next arrival time (simplified - just show start time for now)
                          const nextArrival = routeTiming.startTime || 'N/A'

                          return (
                            <Tr
                              key={schedule._id}
                              sx={{
                                '@media (max-width: 62em)': {
                                  backgroundColor: schedule.active ? 'green.50' : 'gray.50',
                                }
                              }}
                            >
                              <Td fontSize="xs">{schedule.routeTiming?.[0]?.routeId?.name || 'Route N/A'}</Td>
                              <Td fontSize="xs">{getDayName(schedule.dayOfWeek)}</Td>
                              <Td fontWeight="medium" fontSize="xs">{routeTiming.startTime || 'N/A'}</Td>
                              <Td fontSize="xs">{routeTiming.endTime || 'N/A'}</Td>
                              <Td>{schedule.vehicleId?.plateNumber || 'Vehicle N/A'}</Td>
                              {/* Hide status on base screens */}
                              <Td display={{ base: "none", lg: "table-cell" }}>
                                <Badge
                                  colorScheme={schedule.active ? "green" : "gray"}
                                  variant="subtle"
                                >
                                  {schedule.active ? "Active" : "Inactive"}
                                </Badge>
                              </Td>
                            </Tr>
                          )
                        })}
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

                        // Filter schedules for today and check if they're active
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

                        return todaysSchedules.map((schedule) => {
                          // Determine course type (default to Lecture for now)
                          const courseType = 'Lecture'
                          const courseColor = getColorForType(courseType)

                          return (
                            <Box
                              key={schedule._id}
                              p={3}
                              bg={`${courseColor}.50`}
                              borderRadius="md"
                              borderLeft="4px solid"
                              borderColor={`${courseColor}.500`}
                            >
                              <HStack justify="space-between" align="start" mb={2}>
                                <Text fontWeight="medium" fontSize="sm" flex={1}>
                                  {schedule.moduleId?.moduleName || 'Module N/A'}
                                </Text>
                                <Badge
                                  colorScheme={courseColor}
                                  variant="subtle"
                                  size="sm"
                                  fontSize="xs"
                                >
                                  {courseType}
                                </Badge>
                              </HStack>
                              <Text fontSize="xs" color="gray.600" mb={1}>
                                {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)} • {schedule.roomId?.block} {schedule.roomId?.roomNumber}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {schedule.lecturerId?.title?.join(', ')} {schedule.lecturerId?.userId?.name || 'Lecturer N/A'}
                              </Text>
                            </Box>
                          )
                        })
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
                      {(() => {
                        // Group attendance records by module
                        const groupedByModule = attendance.reduce((acc, record) => {
                          const moduleId = record.scheduleId?.moduleId?._id;
                          const moduleName = record.scheduleId?.moduleId?.moduleName || 'Unknown Module';

                          if (!acc[moduleId]) {
                            acc[moduleId] = {
                              moduleName,
                              records: [],
                              totalSessions: 0,
                              attendedSessions: 0,
                              lateSessions: 0,
                              absentSessions: 0
                            };
                          }

                          acc[moduleId].records.push(record);
                          acc[moduleId].totalSessions++;

                          switch (record.status) {
                            case 'present':
                              acc[moduleId].attendedSessions++;
                              break;
                            case 'late':
                              acc[moduleId].lateSessions++;
                              acc[moduleId].attendedSessions++; // Late still counts as attended
                              break;
                            case 'absent':
                              acc[moduleId].absentSessions++;
                              break;
                          }

                          return acc;
                        }, {});

                        // Calculate attendance percentage for each module
                        const moduleStats = Object.values(groupedByModule).map(module => ({
                          ...module,
                          attendancePercentage: Math.round((module.attendedSessions / module.totalSessions) * 100)
                        }));

                        if (moduleStats.length === 0) {
                          return (
                            <Box p={3} bg="gray.50" borderRadius="md" textAlign="center">
                              <Text fontSize="sm" color="gray.600">No attendance records found</Text>
                            </Box>
                          );
                        }

                        return moduleStats.map((module) => (
                          <Box key={module.moduleName} p={3} bg="gray.50" borderRadius="md">
                            <HStack justify="space-between" mb={2}>
                              <Text fontSize="sm" fontWeight="medium">
                                {module.moduleName}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {module.attendedSessions}/{module.totalSessions} ({module.attendancePercentage}%)
                              </Text>
                            </HStack>

                            <Progress
                              value={module.attendancePercentage}
                              colorScheme={module.attendancePercentage >= 80 ? "green" : module.attendancePercentage >= 60 ? "yellow" : "red"}
                              size="sm"
                              mb={2}
                            />

                            <HStack spacing={2} fontSize="xs">
                              <Badge colorScheme="green" variant="subtle">
                                Present: {module.attendedSessions - module.lateSessions}
                              </Badge>
                              <Badge colorScheme="orange" variant="subtle">
                                Late: {module.lateSessions}
                              </Badge>
                              <Badge colorScheme="red" variant="subtle">
                                Absent: {module.absentSessions}
                              </Badge>
                            </HStack>
                          </Box>
                        ));
                      })()}
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
                    <Button leftIcon={<FiMessageSquare />} colorScheme="blue" onClick={navigateToFeedback}>
                      Submit Feedback
                    </Button>
                    <Button leftIcon={<FiAlertCircle />} variant="outline">
                      Report Lost Item
                    </Button>
                    <Button leftIcon={<FaBus />} variant="outline" onClick={navigateToTransportation}>
                      Request Campus Ride
                    </Button>
                    <Button leftIcon={<FiMapPin />} variant="outline" onClick={navigateToClassFinder}>
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
