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
} from "@chakra-ui/react"
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
} from "react-icons/fi"
import { FaBus } from "react-icons/fa";
import { useStudentStore } from "../../store/TBI/studentStore.js"
import { BookingModal } from "../../component/student/BookingModal"
import { FeedbackModal } from "../../component/student/FeedbackModal"

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

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const { isOpen: isBookingOpen, onOpen: onBookingOpen, onClose: onBookingClose } = useDisclosure()
  const { isOpen: isFeedbackOpen, onOpen: onFeedbackOpen, onClose: onFeedbackClose } = useDisclosure()

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

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
            Welcome back, {studentProfile.name}!
          </Text>
          <Text color="gray.600">
            {studentProfile.program} • Year {studentProfile.year} • {studentProfile.semester}
          </Text>
        </Box>

        {/* Quick Stats */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <HStack justify="space-between">
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Active Bookings
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {myBookings.filter((b) => b.status !== "cancelled").length}
                  </Text>
                </Box>
                <Icon as={FiCalendar} boxSize={6} color="blue.500" />
              </HStack>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <HStack justify="space-between">
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Avg Attendance
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {Math.round(
                      attendanceRecords.reduce((acc, record) => acc + record.percentage, 0) / attendanceRecords.length,
                    )}
                    %
                  </Text>
                </Box>
                <Icon as={FiBarChart} boxSize={6} color="green.500" />
              </HStack>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <HStack justify="space-between">
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Upcoming Exams
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {examSchedule.length}
                  </Text>
                </Box>
                <Icon as={FiClock} boxSize={6} color="orange.500" />
              </HStack>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <HStack justify="space-between">
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Available Parking
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {parkingSpots.reduce((acc, spot) => acc + spot.available, 0)}
                  </Text>
                </Box>
                <Icon as={FiMapPin} boxSize={6} color="purple.500" />
              </HStack>
            </CardBody>
          </Card>
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
                      {parkingSpots.map((spot) => (
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
                      ))}
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
                      {myBookings.slice(0, 3).map((booking) => (
                        <HStack key={booking.id} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                          <Box>
                            <Text fontWeight="medium">{booking.resource}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {booking.date} • {booking.time}
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
                        {shuttleSchedule.map((shuttle) => (
                          <Tr key={shuttle.id}>
                            <Td>{shuttle.route}</Td>
                            <Td fontWeight="medium">{shuttle.nextArrival}</Td>
                            <Td>{shuttle.frequency}</Td>
                            <Td>
                              <Badge colorScheme={getStatusColor(shuttle.status)} variant="subtle">
                                {shuttle.status}
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
                      {academicSchedule.slice(0, 3).map((schedule) => (
                        <Box key={schedule.id} p={3} bg="gray.50" borderRadius="md">
                          <Text fontWeight="medium">{schedule.course}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {schedule.time} • {schedule.room}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {schedule.instructor}
                          </Text>
                        </Box>
                      ))}
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
                      {attendanceRecords.map((record) => (
                        <Box key={record.id}>
                          <HStack justify="space-between" mb={2}>
                            <Text fontSize="sm" fontWeight="medium">
                              {record.course}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {record.attended}/{record.total} ({record.percentage}%)
                            </Text>
                          </HStack>
                          <Progress
                            value={record.percentage}
                            colorScheme={record.status === "good" ? "green" : "yellow"}
                            size="sm"
                          />
                        </Box>
                      ))}
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
