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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react"
import { FiCheck, FiX, FiCalendar, FiClock, FiEdit, FiTrash2, FiDownload } from "react-icons/fi"
import { useState, useMemo, useEffect } from "react"
import { useFacilityStore } from "../../store/facility"
import { exportBookingsToPDF, exportBookingStatsToPDF } from "../../utils/exportUtils"

// Constants
const STATUS_OPTIONS = [
  { value: "All", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
]

const FACILITY_OPTIONS = [
  { value: "All", label: "All Facilities" },
  { value: "Basketball", label: "Basketball Courts" },
  { value: "Study", label: "Study Rooms" },
  { value: "Conference", label: "Conference Halls" },
]

const STATUS_COLORS = {
  confirmed: "green",
  cancelled: "red",
  pending: "yellow",
  completed: "blue",
  default: "gray",
}

// Helper functions
const getStatusColor = (status) => {
  return STATUS_COLORS[status] || STATUS_COLORS.default
}

const isBookingValid = (booking) => {
  return booking && typeof booking === 'object'
}

const formatDate = (dateString) => {
  if (!dateString) return "-"
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return dateString
  }
}

const formatTime = (timeString) => {
  if (!timeString) return "-"
  return timeString
}

// Stats Card Component
const StatsCard = ({ label, value, helpText, icon: Icon, color }) => (
  <Card bg="white"  >
    <CardBody>
      <Stat>
        <HStack justify="space-between">
          <Box>
            <StatLabel color="gray.600">{label}</StatLabel>
            <StatNumber color={color}>{value}</StatNumber>
            <StatHelpText>{helpText}</StatHelpText>
          </Box>
          <Box color={color} fontSize="2xl">
            <Icon />
          </Box>
        </HStack>
      </Stat>
    </CardBody>
  </Card>
)

// Filter Component
const FilterSection = ({ statusFilter, setStatusFilter, facilityFilter, setFacilityFilter, dateFilter, setDateFilter, handleExport, isExporting, handleExportStats, isExportingStats }) => (
  <Card bg="white">
    <CardBody>
      <HStack spacing={4} justify="space-between">
        <HStack>
          <Select w="200px" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select w="200px" value={facilityFilter} onChange={(e) => setFacilityFilter(e.target.value)}>
            {FACILITY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Input
            type="date"
            w="200px"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            placeholder="Filter by date"
          />
        </HStack>

        <Tooltip
          label="Export booking statistics as pie chart PDF"
          placement="top"
          hasArrow
        >
          <Button
            variant="solid"
            leftIcon={<FiDownload />}
            onClick={handleExportStats}
            isLoading={isExportingStats}
            loadingText="Generating Chart..."
            disabled={isExportingStats}
            colorScheme="teal"
          >
            Export Booking
          </Button>
        </Tooltip>

      </HStack>
    </CardBody>
  </Card>
)

// Edit Booking Modal Component
const EditBookingModal = ({ isOpen, onClose, booking, onUpdate }) => {
  const [formData, setFormData] = useState({
    bookingDate: '',
    startTime: '',
    endTime: '',
    status: 'pending'
  })

  useEffect(() => {
    if (booking) {
      setFormData({
        bookingDate: booking.bookingDate ? new Date(booking.bookingDate).toISOString().split('T')[0] : '',
        startTime: booking.startTime || '',
        endTime: booking.endTime || '',
        status: booking.status || 'pending'
      })
    }
  }, [booking])

  const handleSubmit = (e) => {
    e.preventDefault()
    onUpdate(booking._id, formData)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Booking</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Booking Date</FormLabel>
                <Input
                  type="date"
                  value={formData.bookingDate}
                  onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Start Time</FormLabel>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>End Time</FormLabel>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit">
              Update Booking
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

// Booking Row Component
const BookingRow = ({ booking, onApprove, onReject, onEdit, onDelete }) => (
  <Tr key={booking?._id || Math.random()}>
    <Td>
      <Text fontWeight="medium">{booking?.studentId?.userId?.name || booking?.studentName || "-"}</Text>
    </Td>
    <Td>{booking?.resourceId?.name || booking?.facility || "-"}</Td>
    <Td>
      <VStack align="start" spacing={0}>
        <Text fontSize="sm">{formatDate(booking?.bookingDate)}</Text>
        <Text fontSize="xs" color="gray.600">
          {formatTime(booking?.startTime)} - {formatTime(booking?.endTime)}
        </Text>
      </VStack>
    </Td>
    <Td>
      <Badge colorScheme={getStatusColor(booking?.status)}>
        {booking?.status || "-"}
      </Badge>
    </Td>
    <Td>
      <HStack spacing={2}>
        {booking?.status === "pending" && (
          <>
            <IconButton
              icon={<FiCheck />}
              colorScheme="green"
              size="sm"
              onClick={() => onApprove(booking?._id, booking)}
              aria-label="Approve booking"
            />
            <IconButton
              icon={<FiX />}
              colorScheme="red"
              size="sm"
              onClick={() => onReject(booking?._id, booking)}
              aria-label="Reject booking"
            />
          </>
        )}
        <IconButton
          icon={<FiEdit />}
          colorScheme="blue"
          size="sm"
          onClick={() => onEdit(booking)}
          aria-label="Edit booking"
        />
        <IconButton
          icon={<FiTrash2 />}
          colorScheme="red"
          size="sm"
          onClick={() => onDelete(booking?._id)}
          aria-label="Delete booking"
        />
      </HStack>
    </Td>
  </Tr>
)

export function BookingManagement() {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [statusFilter, setStatusFilter] = useState("All")
  const [facilityFilter, setFacilityFilter] = useState("All")
  const [dateFilter, setDateFilter] = useState("")
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isExportingStats, setIsExportingStats] = useState(false)

  const { bookings, fetchBookings, updateBooking, deleteBooking } = useFacilityStore()

  useEffect(() => {
    fetchBookings();
  }, [])

  // Memoized computed values
  const safeBookings = useMemo(() => {
    return Array.isArray(bookings) ? bookings : []
  }, [bookings])

  const filteredBookings = useMemo(() => {
    return safeBookings.filter((booking) => {
      if (!isBookingValid(booking)) return false

      const status = booking.status || ""
      const facility = booking.resourceId?.name || booking.facility || ""
      const bookingDate = booking.bookingDate || ""

      const matchesStatus = statusFilter === "All" || status === statusFilter
      const matchesFacility = facilityFilter === "All" || (typeof facility === 'string' && facility.includes(facilityFilter))

      // Date filtering logic
      let matchesDate = true
      if (dateFilter && bookingDate) {
        const filterDate = new Date(dateFilter)
        const bookingDateObj = new Date(bookingDate)
        matchesDate = filterDate.toDateString() === bookingDateObj.toDateString()
      }

      return matchesStatus && matchesFacility && matchesDate
    })
  }, [safeBookings, statusFilter, facilityFilter, dateFilter])

  const bookingStats = useMemo(() => {
    const pendingCount = safeBookings.filter((b) => b.status === "pending").length
    const confirmedCount = safeBookings.filter((b) => b.status === "confirmed").length
    const cancelledCount = safeBookings.filter((b) => b.status === "cancelled").length
    const completedCount = safeBookings.filter((b) => b.status === "completed").length

    return {
      pendingCount,
      confirmedCount,
      cancelledCount,
      completedCount,
      totalCount: safeBookings.length
    }
  }, [safeBookings])

  // Event handlers
  const handleBookingAction = async (id, action, status, booking) => {
    if (typeof updateBooking !== 'function') {
      toast({
        title: "Error",
        description: "Booking update function is unavailable.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {

      const updatedBooking = {
        ...booking,
        resourceId: booking.resourceId?._id,
        studentId: booking.studentId?._id,
        status: status
      }


      const result = await updateBooking(id, updatedBooking)
      if (result.success) {
        toast({
          title: `Booking ${action}`,
          description: `The booking has been ${action.toLowerCase()} successfully.`,
          status: action === "Confirmed" ? "success" : "info",
          duration: 3000,
          isClosable: true,
        })
        // Refresh bookings after status update
        fetchBookings()
      } else {
        throw new Error(result.message || `Failed to ${action.toLowerCase()} booking`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${action.toLowerCase()} booking.`,
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleApprove = (id, booking) => handleBookingAction(id, "Confirmed", "confirmed", booking)
  const handleReject = (id, booking) => handleBookingAction(id, "Cancelled", "cancelled", booking)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const result = await exportBookingsToPDF(
        filteredBookings,
        {
          fileName: 'booking_management_report',
          onSuccess: (fileName) => {
            toast({
              title: "Report Exported",
              description: "Booking management report has been exported as PDF",
              status: "success",
              duration: 3000,
              isClosable: true,
            })
          },
          onError: (error) => {
            toast({
              title: "Export Failed",
              description: "Failed to export booking report as PDF",
              status: "error",
              duration: 3000,
              isClosable: true,
            })
          }
        }
      )

      if (!result.success) {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast({
        title: "Export Failed",
        description: "Failed to export booking report as PDF",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportStats = async () => {
    setIsExportingStats(true)
    try {
      const result = await exportBookingStatsToPDF(
        filteredBookings,
        {
          fileName: 'booking_statistics_chart',
          onSuccess: (fileName) => {
            toast({
              title: "Statistics Chart Exported",
              description: "Booking statistics chart has been exported as PDF",
              status: "success",
              duration: 3000,
              isClosable: true,
            })
          },
          onError: (error) => {
            toast({
              title: "Export Failed",
              description: "Failed to export statistics chart as PDF",
              status: "error",
              duration: 3000,
              isClosable: true,
            })
          }
        }
      )

      if (!result.success) {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error exporting statistics PDF:', error)
      toast({
        title: "Export Failed",
        description: "Failed to export statistics chart as PDF",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsExportingStats(false)
    }
  }

  const handleEdit = (booking) => {
    setSelectedBooking(booking)
    onOpen()
  }

  const handleUpdate = async (id, formData) => {
    if (typeof updateBooking !== 'function') {
      toast({
        title: "Error",
        description: "Booking update function is unavailable.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      console.log("🚀 ~ handleUpdate ~ formData:", formData)
      const result = await updateBooking(id, formData)
      if (result.success) {
        toast({
          title: "Booking Updated",
          description: "The booking has been updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
        // Refresh bookings after successful update
        fetchBookings()
      } else {
        throw new Error(result.message || "Failed to update booking")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleDelete = async (id) => {
    if (typeof deleteBooking !== 'function') {
      toast({
        title: "Error",
        description: "Booking delete function is unavailable.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      await deleteBooking(id)
      toast({
        title: "Booking Deleted",
        description: "The booking has been deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete booking.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

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
        <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
          <StatsCard
            label="Pending Approvals"
            value={bookingStats.pendingCount}
            helpText="Awaiting review"
            icon={FiClock}
            color="#ED8936"
          />
          <StatsCard
            label="Confirmed Bookings"
            value={bookingStats.confirmedCount}
            helpText="Successfully confirmed"
            icon={FiCheck}
            color="#48BB78"
          />
          <StatsCard
            label="Cancelled Bookings"
            value={bookingStats.cancelledCount}
            helpText="Rejected bookings"
            icon={FiX}
            color="#E53E3E"
          />
          <StatsCard
            label="Total Bookings"
            value={bookingStats.totalCount}
            helpText="All time"
            icon={FiCalendar}
            color="#344E41"
          />
        </Grid>

        {/* Filters */}
        <FilterSection
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          facilityFilter={facilityFilter}
          setFacilityFilter={setFacilityFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          handleExport={handleExport}
          isExporting={isExporting}
          handleExportStats={handleExportStats}
          isExportingStats={isExportingStats}
        />

        {/* Bookings Table */}
        <Card bg="white"  >
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
              Pending Requests ({filteredBookings.filter(b => b.status === "pending").length})
            </Text>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Student</Th>
                  <Th>Facility</Th>
                  <Th>Date & Time</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredBookings
                  .filter(booking => booking.status === "pending")
                  .map((booking) => (
                    <BookingRow
                      key={booking?._id || Math.random()}
                      booking={booking}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        {/* Handled Requests */}
        <Card bg="white"  >
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
              Handled Requests ({filteredBookings.filter(b => b.status !== "pending").length})
            </Text>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Student</Th>
                  <Th>Facility</Th>
                  <Th>Date & Time</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredBookings
                  .filter(booking => booking.status !== "pending")
                  .map((booking) => (
                    <BookingRow
                      key={booking?._id || Math.random()}
                      booking={booking}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>

      {/* Edit Booking Modal */}
      <EditBookingModal
        isOpen={isOpen}
        onClose={onClose}
        booking={selectedBooking}
        onUpdate={handleUpdate}
      />
    </Box>
  )
}
