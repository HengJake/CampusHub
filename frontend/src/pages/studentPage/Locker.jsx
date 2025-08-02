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
  StatHelpText,
  Image,
} from "@chakra-ui/react"
import {
  FiLock,
  FiUnlock,
  FiMapPin,
  FiSearch,
  FiRefreshCw,
  FiCalendar,
  FiAlertCircle,
  FiDollarSign,
  FiSettings,
} from "react-icons/fi"

const Locker = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [sizeFilter, setSizeFilter] = useState("")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [selectedLocker, setSelectedLocker] = useState(null)
  const [bookingType, setBookingType] = useState("temporary")
  const [duration, setDuration] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [contactInfo, setContactInfo] = useState("")
  const [notes, setNotes] = useState("")

  const { isOpen: isBookingOpen, onOpen: onBookingOpen, onClose: onBookingClose } = useDisclosure()
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure()
  const toast = useToast()

  // Mock data for gym lockers
  const [lockers, setLockers] = useState([
    {
      id: "L001",
      location: "Main Gym - Ground Floor",
      zone: "Cardio Section",
      size: "Standard",
      status: "available",
      dailyRate: 5,
      weeklyRate: 30,
      monthlyRate: 100,
      features: ["Digital Lock", "Power Outlet", "Ventilation", "LED Light"],
      lastCleaned: "2024-01-20 08:00",
      dimensions: "30cm x 40cm x 60cm",
      lockType: "Digital PIN",
      condition: "Excellent",
      image: "/placeholder.svg?height=200&width=300&text=Locker+L001",
    },
    {
      id: "L002",
      location: "Main Gym - Ground Floor",
      zone: "Weight Training",
      size: "Large",
      status: "occupied",
      dailyRate: 8,
      weeklyRate: 45,
      monthlyRate: 150,
      features: ["Digital Lock", "Power Outlet", "Ventilation", "Extra Space", "Mirror"],
      lastCleaned: "2024-01-20 08:00",
      dimensions: "40cm x 50cm x 70cm",
      occupiedUntil: "2024-01-25",
      lockType: "Digital PIN + RFID",
      condition: "Excellent",
      image: "/placeholder.svg?height=200&width=300&text=Locker+L002",
    },
    {
      id: "L003",
      location: "Sports Complex - 1st Floor",
      zone: "Swimming Pool Area",
      size: "Standard",
      status: "available",
      dailyRate: 5,
      weeklyRate: 30,
      monthlyRate: 100,
      features: ["Waterproof", "Digital Lock", "Drainage", "Rust Resistant"],
      lastCleaned: "2024-01-20 09:00",
      dimensions: "30cm x 40cm x 60cm",
      lockType: "Waterproof Digital",
      condition: "Good",
      image: "/placeholder.svg?height=200&width=300&text=Pool+Locker+L003",
    },
    {
      id: "L004",
      location: "Sports Complex - 1st Floor",
      zone: "Basketball Court",
      size: "Standard",
      status: "maintenance",
      dailyRate: 5,
      weeklyRate: 30,
      monthlyRate: 100,
      features: ["Digital Lock", "Power Outlet", "Ventilation"],
      lastCleaned: "2024-01-19 16:00",
      dimensions: "30cm x 40cm x 60cm",
      maintenanceNote: "Lock repair in progress - ETA: 2 hours",
      lockType: "Digital PIN",
      condition: "Under Repair",
      image: "/placeholder.svg?height=200&width=300&text=Maintenance+L004",
    },
    {
      id: "L005",
      location: "Main Gym - 1st Floor",
      zone: "Group Fitness",
      size: "Small",
      status: "available",
      dailyRate: 3,
      weeklyRate: 20,
      monthlyRate: 70,
      features: ["Basic Lock", "Ventilation", "Compact Design"],
      lastCleaned: "2024-01-20 07:30",
      dimensions: "25cm x 35cm x 50cm",
      lockType: "Combination Lock",
      condition: "Good",
      image: "/placeholder.svg?height=200&width=300&text=Small+Locker+L005",
    },
    {
      id: "L006",
      location: "Sports Complex - Ground Floor",
      zone: "Tennis Courts",
      size: "Large",
      status: "available",
      dailyRate: 8,
      weeklyRate: 45,
      monthlyRate: 150,
      features: ["Digital Lock", "Power Outlet", "Ventilation", "Extra Space", "Weather Resistant"],
      lastCleaned: "2024-01-20 10:00",
      dimensions: "40cm x 50cm x 70cm",
      lockType: "Smart Lock (App)",
      condition: "Excellent",
      image: "/placeholder.svg?height=200&width=300&text=Tennis+Locker+L006",
    },
    {
      id: "L007",
      location: "Main Gym - Ground Floor",
      zone: "Free Weights",
      size: "Standard",
      status: "available",
      dailyRate: 5,
      weeklyRate: 30,
      monthlyRate: 100,
      features: ["Digital Lock", "Power Outlet", "Ventilation", "USB Charging"],
      lastCleaned: "2024-01-20 11:00",
      dimensions: "30cm x 40cm x 60cm",
      lockType: "Digital PIN",
      condition: "Excellent",
      image: "/placeholder.svg?height=200&width=300&text=Gym+Locker+L007",
    },
    {
      id: "L008",
      location: "Sports Complex - 2nd Floor",
      zone: "Badminton Courts",
      size: "Standard",
      status: "occupied",
      dailyRate: 5,
      weeklyRate: 30,
      monthlyRate: 100,
      features: ["Digital Lock", "Power Outlet", "Ventilation"],
      lastCleaned: "2024-01-20 08:30",
      dimensions: "30cm x 40cm x 60cm",
      occupiedUntil: "2024-01-23",
      lockType: "Digital PIN",
      condition: "Good",
      image: "/placeholder.svg?height=200&width=300&text=Badminton+L008",
    },
  ])

  // Mock data for user's bookings
  const [myBookings, setMyBookings] = useState([
    {
      id: "B001",
      lockerId: "L007",
      location: "Main Gym - Ground Floor",
      startDate: "2024-01-15",
      endDate: "2024-01-22",
      type: "Weekly",
      status: "active",
      totalCost: 30,
      paymentStatus: "paid",
      accessCode: "1234",
      bookingTime: "2024-01-15 09:30",
    },
    {
      id: "B002",
      lockerId: "L012",
      location: "Sports Complex - 1st Floor",
      startDate: "2024-01-10",
      endDate: "2024-01-10",
      type: "Daily",
      status: "completed",
      totalCost: 5,
      paymentStatus: "paid",
      accessCode: "5678",
      bookingTime: "2024-01-10 14:15",
    },
    {
      id: "B003",
      lockerId: "L003",
      location: "Sports Complex - 1st Floor",
      startDate: "2024-01-25",
      endDate: "2024-02-25",
      type: "Monthly",
      status: "pending",
      totalCost: 100,
      paymentStatus: "pending",
      accessCode: "9876",
      bookingTime: "2024-01-20 16:45",
    },
  ])

  // Auto-refresh simulation
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      setLockers((prev) =>
        prev.map((locker) => {
          if (Math.random() < 0.08) {
            // 8% chance of status change
            const statuses = ["available", "occupied", "maintenance"]
            const currentIndex = statuses.indexOf(locker.status)
            const newStatus = statuses[(currentIndex + 1) % statuses.length]
            return {
              ...locker,
              status: newStatus,
              lastCleaned: newStatus === "available" ? new Date().toISOString().slice(0, 16) : locker.lastCleaned,
            }
          }
          return locker
        }),
      )
      setLastUpdated(new Date())
    }, 8000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "green"
      case "occupied":
        return "red"
      case "maintenance":
        return "orange"
      default:
        return "gray"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "available":
        return FiUnlock
      case "occupied":
        return FiLock
      case "maintenance":
        return FiAlertCircle
      default:
        return FiLock
    }
  }

  const getSizeColor = (size) => {
    switch (size) {
      case "Small":
        return "blue"
      case "Standard":
        return "purple"
      case "Large":
        return "orange"
      default:
        return "gray"
    }
  }

  const filteredLockers = lockers.filter((locker) => {
    const matchesSearch =
      locker.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      locker.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      locker.zone.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLocation = !locationFilter || locker.location.includes(locationFilter)
    const matchesStatus = !statusFilter || locker.status === statusFilter
    const matchesSize = !sizeFilter || locker.size === sizeFilter

    return matchesSearch && matchesLocation && matchesStatus && matchesSize
  })

  const availableCount = lockers.filter((l) => l.status === "available").length
  const occupiedCount = lockers.filter((l) => l.status === "occupied").length
  const maintenanceCount = lockers.filter((l) => l.status === "maintenance").length
  const totalRevenue = myBookings.reduce((sum, booking) => sum + booking.totalCost, 0)

  const handleBookLocker = (locker) => {
    setSelectedLocker(locker)
    onBookingOpen()
  }

  const handleViewDetails = (locker) => {
    setSelectedLocker(locker)
    onDetailsOpen()
  }

  const handleSubmitBooking = () => {
    if (!duration || !startDate || !contactInfo) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const newBooking = {
      id: `B${Date.now()}`,
      lockerId: selectedLocker.id,
      location: selectedLocker.location,
      startDate,
      endDate: bookingType === "temporary" ? startDate : endDate,
      type: bookingType === "temporary" ? "Daily" : duration === "weekly" ? "Weekly" : "Monthly",
      status: "pending",
      totalCost:
        bookingType === "temporary"
          ? selectedLocker.dailyRate
          : duration === "weekly"
            ? selectedLocker.weeklyRate
            : selectedLocker.monthlyRate,
      paymentStatus: "pending",
      accessCode: Math.floor(1000 + Math.random() * 9000).toString(),
      bookingTime: new Date().toISOString().slice(0, 16),
    }

    setMyBookings((prev) => [newBooking, ...prev])

    toast({
      title: "Booking Submitted",
      description: `Your ${bookingType} locker booking has been submitted successfully`,
      status: "success",
      duration: 3000,
      isClosable: true,
    })

    // Reset form
    setBookingType("temporary")
    setDuration("")
    setStartDate("")
    setEndDate("")
    setContactInfo("")
    setNotes("")
    onBookingClose()
  }

  const handleCancelBooking = (bookingId) => {
    setMyBookings((prev) =>
      prev.map((booking) => (booking.id === bookingId ? { ...booking, status: "cancelled" } : booking)),
    )

    toast({
      title: "Booking Cancelled",
      description: "Your booking has been cancelled successfully",
      status: "info",
      duration: 3000,
      isClosable: true,
    })
  }

  const handleRefresh = () => {
    setLastUpdated(new Date())
    toast({
      title: "Data Refreshed",
      description: "Locker availability has been updated",
      status: "info",
      duration: 2000,
      isClosable: true,
    })
  }

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" wrap="wrap">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
              Gym Locker Booking System
            </Text>
            <Text color="gray.600">Reserve temporary or extended gym locker rentals across campus facilities</Text>
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

        {/* Stats Dashboard */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <HStack>
                  <Icon as={FiUnlock} color="green.500" boxSize={8} />
                  <Box>
                    <StatNumber color="green.500" fontSize="2xl">
                      {availableCount}
                    </StatNumber>
                    <StatLabel>Available Lockers</StatLabel>
                    <StatHelpText>Ready to book</StatHelpText>
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <HStack>
                  <Icon as={FiLock} color="red.500" boxSize={8} />
                  <Box>
                    <StatNumber color="red.500" fontSize="2xl">
                      {occupiedCount}
                    </StatNumber>
                    <StatLabel>Occupied</StatLabel>
                    <StatHelpText>Currently in use</StatHelpText>
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <HStack>
                  <Icon as={FiAlertCircle} color="orange.500" boxSize={8} />
                  <Box>
                    <StatNumber color="orange.500" fontSize="2xl">
                      {maintenanceCount}
                    </StatNumber>
                    <StatLabel>Maintenance</StatLabel>
                    <StatHelpText>Under repair</StatHelpText>
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <HStack>
                  <Icon as={FiDollarSign} color="blue.500" boxSize={8} />
                  <Box>
                    <StatNumber color="blue.500" fontSize="2xl">
                      ${totalRevenue}
                    </StatNumber>
                    <StatLabel>Total Spent</StatLabel>
                    <StatHelpText>All bookings</StatHelpText>
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Available Lockers ({filteredLockers.length})</Tab>
            <Tab>My Bookings ({myBookings.length})</Tab>
          </TabList>

          <TabPanels>
            {/* Available Lockers Tab */}
            <TabPanel>
              {/* Advanced Filters */}
              <Card mb={6}>
                <CardBody>
                  <Text fontWeight="bold" mb={4}>
                    Search & Filter Options
                  </Text>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(5, 1fr)" }} gap={4}>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiSearch} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        placeholder="Search lockers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>

                    <Select
                      placeholder="All Locations"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    >
                      <option value="Main Gym">Main Gym</option>
                      <option value="Sports Complex">Sports Complex</option>
                    </Select>

                    <Select placeholder="All Sizes" value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)}>
                      <option value="Small">Small</option>
                      <option value="Standard">Standard</option>
                      <option value="Large">Large</option>
                    </Select>

                    <Select
                      placeholder="All Status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                    </Select>

                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">
                        Last Updated: {lastUpdated.toLocaleTimeString()}
                      </Text>
                      <Text fontSize="sm" color="blue.600" fontWeight="medium">
                        {filteredLockers.length} lockers found
                      </Text>
                    </VStack>
                  </Grid>
                </CardBody>
              </Card>

              {/* Lockers Grid */}
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                {filteredLockers.map((locker) => (
                  <Card
                    key={locker.id}
                    _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
                    transition="all 0.3s"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <CardBody>
                      <VStack align="stretch" spacing={4}>
                        {/* Header */}
                        <HStack justify="space-between">
                          <HStack>
                            <Icon
                              as={getStatusIcon(locker.status)}
                              color={`${getStatusColor(locker.status)}.500`}
                              boxSize={6}
                            />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold" fontSize="lg">
                                {locker.id}
                              </Text>
                              <Badge colorScheme={getSizeColor(locker.size)} variant="subtle">
                                {locker.size}
                              </Badge>
                            </VStack>
                          </HStack>
                          <Badge colorScheme={getStatusColor(locker.status)} variant="solid">
                            {locker.status.toUpperCase()}
                          </Badge>
                        </HStack>

                        {/* Image */}
                        <Image
                          src={locker.image || "/placeholder.svg"}
                          alt={`Locker ${locker.id}`}
                          borderRadius="md"
                          objectFit="cover"
                          h="120px"
                          w="full"
                        />

                        {/* Location Info */}
                        <VStack align="start" spacing={2}>
                          <HStack>
                            <Icon as={FiMapPin} color="gray.500" size="sm" />
                            <Text fontSize="sm" color="gray.600" fontWeight="medium">
                              {locker.location}
                            </Text>
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            Zone: {locker.zone}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            Dimensions: {locker.dimensions}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            Lock Type: {locker.lockType}
                          </Text>
                        </VStack>

                        <Divider />

                        {/* Pricing */}
                        <VStack align="start" spacing={2}>
                          <Text fontSize="sm" fontWeight="bold" color="gray.700">
                            Pricing Options:
                          </Text>
                          <SimpleGrid columns={3} spacing={2} w="full">
                            <VStack spacing={1}>
                              <Text fontSize="xs" color="gray.500">
                                Daily
                              </Text>
                              <Text fontSize="lg" fontWeight="bold" color="green.500">
                                ${locker.dailyRate}
                              </Text>
                            </VStack>
                            <VStack spacing={1}>
                              <Text fontSize="xs" color="gray.500">
                                Weekly
                              </Text>
                              <Text fontSize="lg" fontWeight="bold" color="blue.500">
                                ${locker.weeklyRate}
                              </Text>
                            </VStack>
                            <VStack spacing={1}>
                              <Text fontSize="xs" color="gray.500">
                                Monthly
                              </Text>
                              <Text fontSize="lg" fontWeight="bold" color="purple.500">
                                ${locker.monthlyRate}
                              </Text>
                            </VStack>
                          </SimpleGrid>
                        </VStack>

                        {/* Features */}
                        <VStack align="start" spacing={2}>
                          <Text fontSize="sm" fontWeight="bold" color="gray.700">
                            Features:
                          </Text>
                          <HStack wrap="wrap" spacing={1}>
                            {locker.features.map((feature) => (
                              <Badge key={feature} colorScheme="blue" variant="outline" size="sm">
                                {feature}
                              </Badge>
                            ))}
                          </HStack>
                        </VStack>

                        {/* Status-specific Information */}
                        {locker.status === "occupied" && locker.occupiedUntil && (
                          <Alert status="error" size="sm">
                            <AlertIcon />
                            <Box>
                              <AlertTitle fontSize="sm">Occupied Until</AlertTitle>
                              <AlertDescription fontSize="xs">Available from: {locker.occupiedUntil}</AlertDescription>
                            </Box>
                          </Alert>
                        )}

                        {locker.status === "maintenance" && locker.maintenanceNote && (
                          <Alert status="warning" size="sm">
                            <AlertIcon />
                            <Box>
                              <AlertTitle fontSize="sm">Under Maintenance</AlertTitle>
                              <AlertDescription fontSize="xs">{locker.maintenanceNote}</AlertDescription>
                            </Box>
                          </Alert>
                        )}

                        {/* Action Buttons */}
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(locker)}
                            leftIcon={<FiSettings />}
                            flex={1}
                          >
                            Details
                          </Button>
                          {locker.status === "available" ? (
                            <Button
                              colorScheme="blue"
                              onClick={() => handleBookLocker(locker)}
                              leftIcon={<FiCalendar />}
                              size="sm"
                              flex={2}
                            >
                              Book Now
                            </Button>
                          ) : (
                            <Button isDisabled size="sm" flex={2}>
                              Unavailable
                            </Button>
                          )}
                        </HStack>

                        {/* Last Cleaned */}
                        <HStack justify="space-between">
                          <Text fontSize="xs" color="gray.500">
                            Last cleaned:
                          </Text>
                          <Text fontSize="xs" color="gray.600" fontWeight="medium">
                            {new Date(locker.lastCleaned).toLocaleString()}
                          </Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>

              {filteredLockers.length === 0 && (
                <Card>
                  <CardBody textAlign="center" py={10}>
                    <Icon as={FiSearch} boxSize={12} color="gray.400" mb={4} />
                    <Text fontSize="lg" color="gray.600" mb={2}>
                      No lockers found
                    </Text>
                    <Text color="gray.500">Try adjusting your search criteria</Text>
                  </CardBody>
                </Card>
              )}
            </TabPanel>

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
                      <Text color="gray.500">Book your first locker to get started</Text>
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
                            <StatLabel>Active Bookings</StatLabel>
                            <StatNumber color="green.500">
                              {myBookings.filter((b) => b.status === "active").length}
                            </StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Pending Bookings</StatLabel>
                            <StatNumber color="yellow.500">
                              {myBookings.filter((b) => b.status === "pending").length}
                            </StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Completed</StatLabel>
                            <StatNumber color="blue.500">
                              {myBookings.filter((b) => b.status === "completed").length}
                            </StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Total Spent</StatLabel>
                            <StatNumber color="purple.500">${totalRevenue}</StatNumber>
                          </Stat>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* Bookings List */}
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Locker ID</Th>
                            <Th>Location</Th>
                            <Th>Duration</Th>
                            <Th>Dates</Th>
                            <Th>Cost</Th>
                            <Th>Status</Th>
                            <Th>Payment</Th>
                            <Th>Access Code</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {myBookings.map((booking) => (
                            <Tr key={booking.id}>
                              <Td fontWeight="medium">{booking.lockerId}</Td>
                              <Td>{booking.location}</Td>
                              <Td>{booking.type}</Td>
                              <Td>
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="sm">{booking.startDate}</Text>
                                  {booking.endDate !== booking.startDate && (
                                    <Text fontSize="sm" color="gray.600">
                                      to {booking.endDate}
                                    </Text>
                                  )}
                                </VStack>
                              </Td>
                              <Td fontWeight="bold" color="green.600">
                                ${booking.totalCost}
                              </Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    booking.status === "active"
                                      ? "green"
                                      : booking.status === "pending"
                                        ? "yellow"
                                        : booking.status === "cancelled"
                                          ? "red"
                                          : "gray"
                                  }
                                >
                                  {booking.status.toUpperCase()}
                                </Badge>
                              </Td>
                              <Td>
                                <Badge colorScheme={booking.paymentStatus === "paid" ? "green" : "yellow"}>
                                  {booking.paymentStatus.toUpperCase()}
                                </Badge>
                              </Td>
                              <Td>
                                <Text fontFamily="mono" fontWeight="bold" color="blue.600">
                                  {booking.accessCode}
                                </Text>
                              </Td>
                              <Td>
                                <HStack spacing={2}>
                                  {booking.status === "active" && (
                                    <Button
                                      size="sm"
                                      colorScheme="red"
                                      variant="outline"
                                      onClick={() => handleCancelBooking(booking.id)}
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                  {booking.status === "pending" && booking.paymentStatus === "pending" && (
                                    <Button size="sm" colorScheme="green">
                                      Pay Now
                                    </Button>
                                  )}
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Booking Modal */}
      <Modal isOpen={isBookingOpen} onClose={onBookingClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Book Locker: {selectedLocker?.id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Locker Information</AlertTitle>
                  <AlertDescription>
                    {selectedLocker?.location} - {selectedLocker?.zone} ({selectedLocker?.size} Size)
                  </AlertDescription>
                </Box>
              </Alert>

              <FormControl isRequired>
                <FormLabel>Booking Type</FormLabel>
                <Select value={bookingType} onChange={(e) => setBookingType(e.target.value)}>
                  <option value="temporary">Temporary (Daily) - ${selectedLocker?.dailyRate}</option>
                  <option value="extended">Extended (Weekly/Monthly)</option>
                </Select>
              </FormControl>

              {bookingType === "extended" && (
                <FormControl isRequired>
                  <FormLabel>Duration</FormLabel>
                  <Select value={duration} onChange={(e) => setDuration(e.target.value)}>
                    <option value="weekly">Weekly - ${selectedLocker?.weeklyRate}</option>
                    <option value="monthly">Monthly - ${selectedLocker?.monthlyRate}</option>
                  </Select>
                </FormControl>
              )}

              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Start Date</FormLabel>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </FormControl>

                {bookingType === "extended" && (
                  <FormControl isRequired>
                    <FormLabel>End Date</FormLabel>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} />
                  </FormControl>
                )}
              </HStack>

              <FormControl isRequired>
                <FormLabel>Contact Information</FormLabel>
                <Input
                  placeholder="Phone number or email"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Additional Notes</FormLabel>
                <Textarea
                  placeholder="Any special requirements or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </FormControl>

              <Alert status="success">
                <AlertIcon />
                <Box>
                  <AlertTitle>Estimated Cost</AlertTitle>
                  <AlertDescription>
                    $
                    {bookingType === "temporary"
                      ? selectedLocker?.dailyRate
                      : duration === "weekly"
                        ? selectedLocker?.weeklyRate
                        : selectedLocker?.monthlyRate}{" "}
                    ({bookingType === "temporary" ? "Daily" : duration})
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onBookingClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmitBooking}>
              Submit Booking
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Locker Details: {selectedLocker?.id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Image
                src={selectedLocker?.image || "/placeholder.svg"}
                alt={`Locker ${selectedLocker?.id}`}
                borderRadius="md"
                objectFit="cover"
                h="200px"
                w="full"
              />

              <SimpleGrid columns={2} spacing={4}>
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Location Information</Text>
                  <Text fontSize="sm">Building: {selectedLocker?.location}</Text>
                  <Text fontSize="sm">Zone: {selectedLocker?.zone}</Text>
                  <Text fontSize="sm">Size: {selectedLocker?.size}</Text>
                  <Text fontSize="sm">Dimensions: {selectedLocker?.dimensions}</Text>
                </VStack>

                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Technical Details</Text>
                  <Text fontSize="sm">Lock Type: {selectedLocker?.lockType}</Text>
                  <Text fontSize="sm">Condition: {selectedLocker?.condition}</Text>
                  <Text fontSize="sm">Last Cleaned: {selectedLocker?.lastCleaned}</Text>
                </VStack>
              </SimpleGrid>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Available Features</Text>
                <HStack wrap="wrap" spacing={2}>
                  {selectedLocker?.features.map((feature) => (
                    <Badge key={feature} colorScheme="blue" variant="outline">
                      {feature}
                    </Badge>
                  ))}
                </HStack>
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Pricing Structure</Text>
                <SimpleGrid columns={3} spacing={4} w="full">
                  <Card>
                    <CardBody textAlign="center">
                      <Text fontSize="2xl" fontWeight="bold" color="green.500">
                        ${selectedLocker?.dailyRate}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Daily Rate
                      </Text>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody textAlign="center">
                      <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                        ${selectedLocker?.weeklyRate}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Weekly Rate
                      </Text>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody textAlign="center">
                      <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                        ${selectedLocker?.monthlyRate}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Monthly Rate
                      </Text>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </VStack>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDetailsClose}>
              Close
            </Button>
            {selectedLocker?.status === "available" && (
              <Button
                colorScheme="blue"
                onClick={() => {
                  onDetailsClose()
                  handleBookLocker(selectedLocker)
                }}
              >
                Book This Locker
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default Locker
