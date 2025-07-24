import {
  Box,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  VStack,
  HStack,
  Select,
  Input,
  useToast,
  IconButton,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
} from "@chakra-ui/react"
import { FiCheck, FiX, FiCalendar, FiClock } from "react-icons/fi"
import { useState } from "react"
import { useFacilityStore } from "../../store/facility"

export function BookingManagement() {
  const toast = useToast()
  const [statusFilter, setStatusFilter] = useState("All")
  const [facilityFilter, setFacilityFilter] = useState("All")
  const [dateFilter, setDateFilter] = useState("")

  const { bookings, fetchBookings } = useFacilityStore();

  // Defensive: Ensure bookings is an array
  const safeBookings = Array.isArray(bookings) ? bookings : [];

  const filteredBookings = safeBookings.filter((booking) => {
    // Defensive: Check booking object structure
    if (!booking || typeof booking !== 'object') return false;
    const status = booking.status || "";
    const facility = booking.facility || "";
    const date = booking.date || "";
    const matchesStatus = statusFilter === "All" || status === statusFilter;
    const matchesFacility = facilityFilter === "All" || (typeof facility === 'string' && facility.includes(facilityFilter));
    const matchesDate = !dateFilter || date === dateFilter;
    return matchesStatus && matchesFacility && matchesDate;
  });

  // Defensive: Check if updateBookingStatus exists
  const { updateBookingStatus } = useFacilityStore();

  const handleApprove = (id) => {
    if (typeof updateBookingStatus === 'function') {
      try {
        updateBookingStatus(id, "Approved");
        toast({
          title: "Booking Approved",
          description: "The booking has been approved successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to approve booking.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Booking status update function is unavailable.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleReject = (id) => {
    if (typeof updateBookingStatus === 'function') {
      try {
        updateBookingStatus(id, "Rejected");
        toast({
          title: "Booking Rejected",
          description: "The booking has been rejected.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to reject booking.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Booking status update function is unavailable.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "green"
      case "Rejected":
        return "red"
      case "Pending":
        return "yellow"
      default:
        return "gray"
    }
  }

  const pendingCount = bookings.filter((b) => b.status === "Pending").length
  const approvedCount = bookings.filter((b) => b.status === "Approved").length
  const rejectedCount = bookings.filter((b) => b.status === "Rejected").length

  return (
    <Box p={6} minH="100vh" flex={1}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="#333333">
              Booking Management
            </Text>
            <Text color="gray.600">Review and manage facility booking requests</Text>
          </Box>
        </HStack>

        {/* Stats Cards */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
          <Card bg={"white"} borderColor={"gray.800"} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack justify="space-between">
                  <Box>
                    <StatLabel color="gray.600">Pending Approvals</StatLabel>
                    <StatNumber color="#ED8936">{pendingCount}</StatNumber>
                    <StatHelpText>Awaiting review</StatHelpText>
                  </Box>
                  <Box color="#ED8936" fontSize="2xl">
                    <FiClock />
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={"white"} borderColor={"gray.800"} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack justify="space-between">
                  <Box>
                    <StatLabel color="gray.600">Approved Today</StatLabel>
                    <StatNumber color="#48BB78">{approvedCount}</StatNumber>
                    <StatHelpText>Successfully approved</StatHelpText>
                  </Box>
                  <Box color="#48BB78" fontSize="2xl">
                    <FiCheck />
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={"white"} borderColor={"gray.800"} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack justify="space-between">
                  <Box>
                    <StatLabel color="gray.600">Total Bookings</StatLabel>
                    <StatNumber color="#344E41">{bookings.length}</StatNumber>
                    <StatHelpText>All time</StatHelpText>
                  </Box>
                  <Box color="#344E41" fontSize="2xl">
                    <FiCalendar />
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Filters */}
        <Card bg={"white"} borderColor={"gray.800"} borderWidth="1px">
          <CardBody>
            <HStack spacing={4}>
              <Select w="200px" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </Select>
              <Select w="200px" value={facilityFilter} onChange={(e) => setFacilityFilter(e.target.value)}>
                <option value="All">All Facilities</option>
                <option value="Basketball">Basketball Courts</option>
                <option value="Study">Study Rooms</option>
                <option value="Conference">Conference Halls</option>
              </Select>
              <Input type="date" w="200px" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            </HStack>
          </CardBody>
        </Card>

        {/* Bookings Table */}
        <Card bg={"white"} borderColor={"gray.800"} borderWidth="1px">
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
              Booking Requests ({filteredBookings.length})
            </Text>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Student</Th>
                  <Th>Facility</Th>
                  <Th>Date & Time</Th>
                  <Th>Purpose</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredBookings.map((booking) => (
                  <Tr key={booking?.id || Math.random()}>
                    <Td>
                      <Text fontWeight="medium">{booking?.studentName || "-"}</Text>
                    </Td>
                    <Td>{booking?.facility || "-"}</Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm">{booking?.date || "-"}</Text>
                        <Text fontSize="xs" color="gray.600">
                          {booking?.time || "-"}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{booking?.purpose || "-"}</Text>
                    </Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(booking?.status)}>{booking?.status || "-"}</Badge>
                    </Td>
                    <Td>
                      {booking?.status === "Pending" && (
                        <HStack>
                          <IconButton
                            icon={<FiCheck />}
                            colorScheme="green"
                            size="sm"
                            onClick={() => handleApprove(booking?.id)}
                            aria-label="Approve booking"
                          />
                          <IconButton
                            icon={<FiX />}
                            colorScheme="red"
                            size="sm"
                            onClick={() => handleReject(booking?.id)}
                            aria-label="Reject booking"
                          />
                        </HStack>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  )
}
