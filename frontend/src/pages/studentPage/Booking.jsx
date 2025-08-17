"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Grid,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  Badge,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Input,
  Textarea,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Icon,
  Switch,
  InputGroup,
  InputLeftElement,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Checkbox,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Spinner,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react"
import {
  FiBook,
  FiUsers,
  FiMapPin,
  FiSearch,
  FiRefreshCw,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiDollarSign,
  FiStar,
  FiThermometer,
  FiVolume2,
  FiSun,
  FiMonitor,
  FiWifi,
  FiTrash2,
  FiClock,
} from "react-icons/fi"
import { useFacilityStore } from "../../store/facility"
import { useAuthStore } from "../../store/auth"
import ComfirmationMessage from "../../component/common/ComfirmationMessage"

const StudyRoom = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [capacityFilter, setCapacityFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [bookingDate, setBookingDate] = useState("")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [availableTimeSlots, setAvailableTimeSlots] = useState([])
  const [groupSize, setGroupSize] = useState(1)
  const [bookingToDelete, setBookingToDelete] = useState(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  const { isOpen: isBookingOpen, onOpen: onBookingOpen, onClose: onBookingClose } = useDisclosure()
  const toast = useToast()

  // Get data from stores
  const {
    resources,
    bookings,
    loading,
    errors,
    fetchResources,
    fetchBookingsByStudentId,
    createBooking,
    updateBooking,
    deleteBooking
  } = useFacilityStore()

  const { getCurrentUser } = useAuthStore()
  const currentUser = getCurrentUser()

  // Fetch data on component mount
  useEffect(() => {
    fetchResources()
    if (currentUser?.studentId) {
      fetchBookingsByStudentId(currentUser.studentId)
    }
  }, [fetchResources, fetchBookingsByStudentId, currentUser])

  // Auto-refresh simulation
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchResources()
      if (currentUser?.studentId) {
        fetchBookingsByStudentId(currentUser.studentId)
      }
      setLastUpdated(new Date())
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, fetchResources, fetchBookingsByStudentId, currentUser])

  // Get day of week from date
  const getDayOfWeek = (dateString) => {
    const date = new Date(dateString)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[date.getDay()]
  }

  // Get available days for a resource
  const getAvailableDays = (resource) => {
    if (!resource?.timeslots) return []
    return resource.timeslots.map(ts => ts.dayOfWeek)
  }

  // Load available time slots when date is selected
  useEffect(() => {
    if (bookingDate && selectedRoom) {
      const dayOfWeek = getDayOfWeek(bookingDate)
      const dayTimeSlots = selectedRoom.timeslots?.find(ts => ts.dayOfWeek === dayOfWeek)

      if (dayTimeSlots && dayTimeSlots.slots) {
        setAvailableTimeSlots(dayTimeSlots.slots)
      } else {
        setAvailableTimeSlots([])
        toast({
          title: "No Available Slots",
          description: `No time slots available for ${dayOfWeek}`,
          status: "warning",
          duration: 3000,
          isClosable: true,
        })
      }
      setSelectedTimeSlot("")
    }
  }, [bookingDate, selectedRoom])

  const getStatusColor = (status) => {
    if (typeof status !== 'boolean') return "gray"
    return status ? "green" : "red"
  }

  const getStatusIcon = (status) => {
    if (typeof status !== 'boolean') return FiXCircle
    return status ? FiCheckCircle : FiXCircle
  }

  const getTypeIcon = (type) => {
    if (!type || typeof type !== 'string') return FiBook
    switch (type) {
      case "Study Room":
        return FiBook
      case "Meeting Room":
        return FiUsers
      case "Seminar Hall":
        return FiMonitor
      default:
        return FiBook
    }
  }

  const getTypeColor = (type) => {
    if (!type || typeof type !== 'string') return "gray"
    switch (type) {
      case "Study Room":
        return "blue"
      case "Meeting Room":
        return "purple"
      case "Seminar Hall":
        return "orange"
      default:
        return "gray"
    }
  }

  const getCapacityCategory = (capacity) => {
    if (!capacity || typeof capacity !== 'number') return "Small"
    if (capacity <= 4) return "Small"
    if (capacity <= 12) return "Medium"
    return "Large"
  }

  const getCapacityCategoryColor = (capacity) => {
    if (!capacity || typeof capacity !== 'number') return "green"
    if (capacity <= 4) return "green"
    if (capacity <= 12) return "blue"
    return "purple"
  }

  // Filter resources based on search and filters
  const filteredResources = resources.filter((resource) => {
    if (!resource || typeof resource !== 'object') return false

    const matchesSearch =
      (resource.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (resource.type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (resource.location?.toLowerCase() || '').includes(searchTerm.toLowerCase())

    const matchesType = !typeFilter || resource.type === typeFilter
    const matchesStatus = !statusFilter || resource.status === (statusFilter === "true")
    const matchesCapacity = !capacityFilter || getCapacityCategory(resource.capacity) === capacityFilter
    const matchesLocation = !locationFilter || (resource.location || '').includes(locationFilter)

    return matchesSearch && matchesType && matchesStatus && matchesCapacity && matchesLocation
  })

  // Filter user's bookings
  const myBookings = bookings.filter(booking => {
    return booking?.studentId?._id === currentUser?.studentId;
  }
  )

  const handleBookRoom = (resource) => {
    setSelectedRoom(resource)
    setBookingDate("")
    setSelectedTimeSlot("")
    setAvailableTimeSlots([])
    setGroupSize(1)
    onBookingOpen()
  }

  const handleSubmitBooking = async () => {
    if (!bookingDate || !selectedTimeSlot) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time slot",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const [startTime, endTime] = selectedTimeSlot.split(" - ")

    const start = new Date(`2024-01-01 ${startTime}`)
    const end = new Date(`2024-01-01 ${endTime}`)
    const duration = (end - start) / (1000 * 60 * 60) // hours

    if (duration <= 0) {
      toast({
        title: "Invalid Time Range",
        description: "End time must be after start time",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const totalCost = duration * (selectedRoom?.hourlyRate || 0)


    const bookingData = {
      resourceId: selectedRoom._id,
      studentId: currentUser.user.student._id,
      bookingDate: new Date(bookingDate).toISOString(),
      startTime,
      endTime,
      groupSize,
      totalCost,
      status: "pending"
    }

    try {
      const result = await createBooking(bookingData)
      if (result.success) {
        toast({
          title: "Booking Submitted",
          description: `Your ${selectedRoom.type?.toLowerCase()} booking has been submitted successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
        })

        // Reset form
        setBookingDate("")
        setSelectedTimeSlot("")
        setAvailableTimeSlots([])
        setGroupSize(1)
        onBookingClose()
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to submit booking",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleCancelBooking = async (bookingId) => {
    try {
      const result = await updateBooking(bookingId, { status: "cancelled" })
      if (result.success) {
        toast({
          title: "Booking Cancelled",
          description: "Your booking has been cancelled successfully",
          status: "info",
          duration: 3000,
          isClosable: true,
        })
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel booking",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleDeleteBooking = (booking) => {
    setBookingToDelete(booking)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) return

    try {
      const result = await deleteBooking(bookingToDelete._id)
      if (result.success) {
        toast({
          title: "Booking Deleted",
          description: "Booking has been deleted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete booking",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsDeleteConfirmOpen(false)
      setBookingToDelete(null)
    }
  }

  const handleRefresh = () => {
    fetchResources()
    if (currentUser?.studentId) {
      fetchBookingsByStudentId(currentUser.studentId)
    }
    setLastUpdated(new Date())
    toast({
      title: "Data Refreshed",
      description: "Resource availability has been updated",
      status: "info",
      duration: 2000,
      isClosable: true,
    })
  }

  if (loading.resources) {
    return (
      <Box p={6} display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading resources...</Text>
        </VStack>
      </Box>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  // Booking Row Component
  const BookingRow = ({ booking, onDelete }) => (
    <Tr key={booking?._id || Math.random()}>
      <Td>
        <Text fontWeight="medium">{booking?.resourceId?.name || "-"}</Text>
      </Td>
      <Td>
        <Badge colorScheme={getTypeColor(booking?.resourceId?.type)} variant="subtle">
          {booking?.resourceId?.type || "-"}
        </Badge>
      </Td>
      <Td>
        <VStack align="start" spacing={0}>
          <Text fontSize="sm">{formatDate(booking?.bookingDate)}</Text>
          <Text fontSize="xs" color="gray.600">
            {formatTime(booking?.startTime)} - {formatTime(booking?.endTime)}
          </Text>
        </VStack>
      </Td>
      <Td>
        <Text fontSize="sm">
          {(() => {
            const start = new Date(`2024-01-01 ${booking?.startTime}`)
            const end = new Date(`2024-01-01 ${booking?.endTime}`)
            const duration = (end - start) / (1000 * 60 * 60)
            return duration > 0 ? `${duration.toFixed(1)}h` : "-"
          })()}
        </Text>
      </Td>
      <Td>
        <Badge colorScheme={getStatusColor(booking?.status)}>
          {(booking?.status || "-")?.toUpperCase()}
        </Badge>
      </Td>
      <Td>
        <IconButton
          icon={<FiTrash2 />}
          colorScheme="red"
          size="sm"
          onClick={() => onDelete(booking)}
          aria-label="Delete booking"
        />
      </Td>
    </Tr>
  )

  return (
    <Box minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" wrap="wrap">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
              Study & Meeting Room Booking
            </Text>
            <Text color="gray.600">Reserve study rooms, meeting spaces, and seminar halls for your academic needs</Text>
          </Box>
          <HStack spacing={3}>
            <HStack>
              <Switch isChecked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} colorScheme="blue" />
              <Text fontSize="sm">Auto-refresh</Text>
            </HStack>
            <Button leftIcon={<FiRefreshCw />} onClick={handleRefresh} size="sm">
              Refresh
            </Button>
          </HStack>
        </HStack>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>My Bookings ({myBookings.length})</Tab>
            <Tab>Available Resources ({filteredResources.length})</Tab>
          </TabList>

          <TabPanels>
            {/* My Bookings Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {myBookings.length === 0 ? (
                  <Card>
                    <CardBody textAlign="center" py={10}>
                      <Icon as={FiCalendar} boxSize={12} color="gray.400" mb={4} />
                      <Text fontSize="lg" color="gray.600" mb={2}>
                        No bookings yet
                      </Text>
                      <Text color="gray.500">Book your first resource to get started</Text>
                    </CardBody>
                  </Card>
                ) : (
                  <>
                    {/* Bookings Summary */}
                    <Card>
                      <CardBody>
                        <Text fontWeight="bold" mb={4}>
                          Booking Summary
                        </Text>
                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                          <Stat>
                            <StatLabel>Confirmed Bookings</StatLabel>
                            <StatNumber color="green.500">
                              {myBookings.filter((b) => b.status === "confirmed").length}
                            </StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Pending Bookings</StatLabel>
                            <StatNumber color="yellow.500">
                              {myBookings.filter((b) => b.status === "pending").length}
                            </StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Total Hours</StatLabel>
                            <StatNumber color="blue.500">
                              {myBookings.reduce((sum, b) => {
                                const start = new Date(`2024-01-01 ${b.startTime}`)
                                const end = new Date(`2024-01-01 ${b.endTime}`)
                                const duration = (end - start) / (1000 * 60 * 60)
                                return sum + duration
                              }, 0).toFixed(1)}h
                            </StatNumber>
                          </Stat>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* Bookings List */}
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Resource</Th>
                            <Th>Type</Th>
                            <Th>Date & Time</Th>
                            <Th>Duration</Th>
                            <Th>Status</Th>
                            <Th>Delete</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {myBookings.map((booking) => (
                            <BookingRow
                              key={booking._id}
                              booking={booking}
                              onDelete={handleDeleteBooking}
                            />
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </VStack>
            </TabPanel>

            {/* Available Resources Tab */}
            <TabPanel>
              {/* Advanced Filters */}
              <Card mb={6}>
                <CardBody>
                  <Text fontWeight="bold" mb={4}>
                    Search & Filter Options
                  </Text>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(6, 1fr)" }} gap={4}>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiSearch} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        placeholder="Search resources..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>

                    <Select placeholder="All Types" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                      <option value="Study Room">Study Room</option>
                      <option value="Meeting Room">Meeting Room</option>
                      <option value="Seminar Hall">Seminar Hall</option>
                    </Select>

                    <Select
                      placeholder="All Locations"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    >
                      <option value="Library">Library</option>
                      <option value="Student Center">Student Center</option>
                      <option value="Academic Building">Academic Building</option>
                      <option value="Engineering Building">Engineering Building</option>
                      <option value="Business School">Business School</option>
                    </Select>

                    <Select
                      placeholder="All Capacities"
                      value={capacityFilter}
                      onChange={(e) => setCapacityFilter(e.target.value)}
                    >
                      <option value="Small">Small (1-4)</option>
                      <option value="Medium">Medium (5-12)</option>
                      <option value="Large">Large (13+)</option>
                    </Select>

                    <Select
                      placeholder="All Status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </Select>

                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">
                        Last Updated: {lastUpdated.toLocaleTimeString()}
                      </Text>
                      <Text fontSize="sm" color="blue.600" fontWeight="medium">
                        {filteredResources.length} resources found
                      </Text>
                    </VStack>
                  </Grid>
                </CardBody>
              </Card>

              {/* Resources Grid */}
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                {filteredResources.map((resource) => {
                  return (<Card key={resource._id} _hover={{ transform: "translateY(-4px)", shadow: "xl" }} transition="all 0.3s" border="1px solid" borderColor="gray.200">
                    <CardBody>
                      <VStack align="stretch" spacing={4}>
                        {/* Header */}
                        <HStack justify="space-between">
                          <HStack>
                            <Icon as={getTypeIcon(resource.type)} color={`${getTypeColor(resource.type)}.500`} boxSize={6} />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold" fontSize="lg">
                                {resource.name}
                              </Text>
                              <Badge colorScheme={getTypeColor(resource.type)} variant="subtle">
                                {resource.type}
                              </Badge>
                            </VStack>
                          </HStack>
                          <Badge colorScheme={getStatusColor(resource?.status)} variant="solid">
                            {(typeof resource?.status === 'boolean' ? (resource?.status ? "ACTIVE" : "INACTIVE") : "UNKNOWN")}
                          </Badge>
                        </HStack>

                        {/* Location & Capacity */}
                        <VStack align="start" spacing={2}>
                          <HStack>
                            <Icon as={FiMapPin} color="gray.500" size="sm" />
                            <Text fontSize="sm" color="gray.600" fontWeight="medium">
                              {resource.location}
                            </Text>
                          </HStack>
                          <HStack justify="space-between" w="full">
                            <HStack>
                              <Icon as={FiUsers} color="gray.500" size="sm" />
                              <Text fontSize="sm" color="gray.600">
                                {resource.capacity} people
                              </Text>
                            </HStack>
                            <Badge colorScheme={getCapacityCategoryColor(resource.capacity)} variant="outline" size="sm">
                              {getCapacityCategory(resource.capacity)}
                            </Badge>
                          </HStack>
                        </VStack>

                        <Divider />

                        {/* Status-specific Information */}
                        {resource?.status === true && (
                          <Alert status="success" size="sm">
                            <AlertIcon />
                            <Box>
                              <AlertTitle fontSize="sm">Available Now</AlertTitle>
                              <AlertDescription fontSize="xs">Ready for immediate booking</AlertDescription>
                            </Box>
                          </Alert>
                        )}

                        {resource?.status === false && (
                          <Alert status="error" size="sm">
                            <AlertIcon />
                            <Box>
                              <AlertTitle fontSize="sm">Currently Unavailable</AlertTitle>
                              <AlertDescription fontSize="xs">
                                This resource is currently inactive
                              </AlertDescription>
                            </Box>
                          </Alert>
                        )}

                        {typeof resource?.status !== 'boolean' && (
                          <Alert status="warning" size="sm">
                            <AlertIcon />
                            <Box>
                              <AlertTitle fontSize="sm">Status Unknown</AlertTitle>
                              <AlertDescription fontSize="xs">This resource's status is unclear</AlertDescription>
                            </Box>
                          </Alert>
                        )}

                        {/* Action Buttons */}
                        <Button
                          colorScheme="blue"
                          onClick={() => handleBookRoom(resource)}
                          leftIcon={<FiCalendar />}
                          size="sm"
                          isDisabled={resource?.status !== true}
                        >
                          {resource?.status === true ? "Book Now" : "Unavailable"}
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>);
                })}
              </Grid>

              {filteredResources.length === 0 && (
                <Card>
                  <CardBody textAlign="center" py={10}>
                    <Icon as={FiSearch} boxSize={12} color="gray.400" mb={4} />
                    <Text fontSize="lg" color="gray.600" mb={2}>
                      No resources found
                    </Text>
                    <Text color="gray.500">Try adjusting your search criteria</Text>
                  </CardBody>
                </Card>
              )}
            </TabPanel>


          </TabPanels>
        </Tabs>
      </VStack>

      {/* Booking Modal */}
      <Modal isOpen={isBookingOpen} onClose={onBookingClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Book Resource: {selectedRoom?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Resource Information</AlertTitle>
                  <AlertDescription>
                    {selectedRoom?.type} - {selectedRoom?.location} (Capacity: {selectedRoom?.capacity} people)
                  </AlertDescription>
                </Box>
              </Alert>

              <FormControl isRequired>
                <FormLabel>Booking Date</FormLabel>

                {/* Available Days Badges */}
                {selectedRoom && (
                  <Box mb={3}>
                    <Text fontSize="sm" color="gray.600" mb={2}>
                      Available Days:
                    </Text>
                    <HStack spacing={2} flexWrap="wrap">
                      {getAvailableDays(selectedRoom).map((day, index) => (
                        <Badge
                          key={index}
                          colorScheme="green"
                          variant="subtle"
                          fontSize="xs"
                          px={2}
                          py={1}
                        >
                          {day}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>
                )}

                <Input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </FormControl>

              {bookingDate && (
                <FormControl isRequired>
                  <FormLabel>Available Time Slots</FormLabel>
                  {availableTimeSlots.length > 0 ? (
                    <RadioGroup value={selectedTimeSlot} onChange={setSelectedTimeSlot}>
                      <Stack spacing={3}>
                        {availableTimeSlots.map((slot, index) => (
                          <Radio key={index} value={`${slot.start} - ${slot.end}`}>
                            <HStack>
                              <Icon as={FiClock} color="blue.500" />
                              <Text>
                                {slot.start} - {slot.end}
                              </Text>
                            </HStack>
                          </Radio>
                        ))}
                      </Stack>
                    </RadioGroup>
                  ) : (
                    <Alert status="warning">
                      <AlertIcon />
                      <AlertDescription>
                        No time slots available for {getDayOfWeek(bookingDate)}
                      </AlertDescription>
                    </Alert>
                  )}
                </FormControl>
              )}

              <FormControl isRequired>
                <FormLabel>Attendees</FormLabel>
                <NumberInput
                  value={groupSize}
                  onChange={(value) => setGroupSize(Number.parseInt(value) || 1)}
                  min={1}
                  max={selectedRoom?.capacity}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="sm" color="gray.600">
                  Maximum capacity: {selectedRoom?.capacity} people
                </Text>
              </FormControl>

              {selectedTimeSlot && (
                <Alert status="success">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Booking Summary</AlertTitle>
                    <AlertDescription>
                      {(() => {
                        const [startTime, endTime] = selectedTimeSlot.split(" - ")
                        const start = new Date(`2024-01-01 ${startTime}`)
                        const end = new Date(`2024-01-01 ${endTime}`)
                        const duration = (end - start) / (1000 * 60 * 60)
                        const cost = duration * (selectedRoom?.hourlyRate || 0)
                        return duration > 0 ? (
                          <>
                            Duration: {duration.toFixed(1)} hour(s) | Cost: {cost === 0 ? "FREE" : `$${cost.toFixed(2)}`}
                          </>
                        ) : (
                          "Invalid time range"
                        )
                      })()}
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onBookingClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmitBooking}
              isDisabled={!bookingDate || !selectedTimeSlot}
            >
              Submit Booking
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ComfirmationMessage
        title="Delete Booking"
        description={`Are you sure you want to delete your booking for ${bookingToDelete?.resourceId?.name || 'this resource'}? This action cannot be undone.`}
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false)
          setBookingToDelete(null)
        }}
        onConfirm={confirmDeleteBooking}
      />
    </Box>
  )
}

export default StudyRoom
