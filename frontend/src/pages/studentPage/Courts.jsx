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
  Checkbox,
} from "@chakra-ui/react"
import {
  FiActivity,
  FiMapPin,
  FiUsers,
  FiSearch,
  FiRefreshCw,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiPlay,
  FiDollarSign,
  FiSettings,
  FiStar,
  FiThermometer,
} from "react-icons/fi"

const Courts = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [sportFilter, setSportFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [selectedCourt, setSelectedCourt] = useState(null)
  const [bookingDate, setBookingDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [playerCount, setPlayerCount] = useState("")
  const [contactInfo, setContactInfo] = useState("")
  const [notes, setNotes] = useState("")
  const [equipmentNeeded, setEquipmentNeeded] = useState([])

  const { isOpen: isBookingOpen, onOpen: onBookingOpen, onClose: onBookingClose } = useDisclosure()
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure()
  const toast = useToast()

  // Mock data for sports courts
  const [courts, setCourts] = useState([
    {
      id: "BC001",
      name: "Basketball Court 1",
      sport: "Basketball",
      location: "Sports Complex - Indoor Arena",
      capacity: 10,
      status: "available",
      hourlyRate: 25,
      features: ["Indoor", "Air Conditioning", "Professional Scoreboard", "Sound System", "Bleacher Seating"],
      nextAvailable: "09:00",
      currentBooking: null,
      equipment: ["Basketballs", "Scoreboard", "First Aid Kit", "Towels"],
      surface: "Professional Hardwood",
      lighting: "LED Sports Lighting",
      temperature: 22,
      humidity: 45,
      rating: 4.8,
      totalBookings: 156,
      image: "/placeholder.svg?height=200&width=300&text=Basketball+Court+1",
      amenities: ["Locker Rooms", "Water Fountains", "Parking"],
    },
    {
      id: "BC002",
      name: "Basketball Court 2",
      sport: "Basketball",
      location: "Sports Complex - Outdoor",
      capacity: 10,
      status: "occupied",
      hourlyRate: 20,
      features: ["Outdoor", "Floodlights", "Digital Scoreboard", "Bench Seating"],
      nextAvailable: "14:30",
      currentBooking: "University Basketball Team Practice",
      equipment: ["Basketballs", "Scoreboard", "Cones"],
      surface: "Synthetic Court Surface",
      lighting: "LED Floodlights",
      temperature: 28,
      humidity: 60,
      rating: 4.5,
      totalBookings: 89,
      image: "/placeholder.svg?height=200&width=300&text=Outdoor+Basketball",
      amenities: ["Parking", "Nearby Restrooms"],
    },
    {
      id: "TC001",
      name: "Tennis Court Alpha",
      sport: "Tennis",
      location: "Tennis Complex - Court A",
      capacity: 4,
      status: "available",
      hourlyRate: 30,
      features: ["Professional Surface", "Championship Net", "Umpire Chair", "Ball Machine Access"],
      nextAvailable: "10:00",
      currentBooking: null,
      equipment: ["Tennis Nets", "Court Brushes", "First Aid Kit", "Ball Hoppers"],
      surface: "Hard Court (Acrylic)",
      lighting: "Professional Court Lighting",
      temperature: 25,
      humidity: 50,
      rating: 4.9,
      totalBookings: 234,
      image: "/placeholder.svg?height=200&width=300&text=Tennis+Court+Alpha",
      amenities: ["Pro Shop", "Locker Rooms", "Viewing Area"],
    },
    {
      id: "TC002",
      name: "Tennis Court Beta",
      sport: "Tennis",
      location: "Tennis Complex - Court B",
      capacity: 4,
      status: "maintenance",
      hourlyRate: 30,
      features: ["Professional Surface", "Championship Net", "Seating Area"],
      nextAvailable: "Tomorrow 08:00",
      currentBooking: null,
      equipment: ["Tennis Nets", "Court Brushes"],
      surface: "Hard Court (Acrylic)",
      lighting: "Professional Court Lighting",
      temperature: 24,
      humidity: 48,
      rating: 4.7,
      totalBookings: 198,
      maintenanceNote: "Net replacement and surface cleaning - ETA: 6 hours",
      image: "/placeholder.svg?height=200&width=300&text=Tennis+Maintenance",
      amenities: ["Pro Shop", "Locker Rooms"],
    },
    {
      id: "BDC001",
      name: "Badminton Court 1",
      sport: "Badminton",
      location: "Sports Hall - Court 1",
      capacity: 4,
      status: "available",
      hourlyRate: 15,
      features: ["Indoor", "Wooden Floor", "Professional Net", "Air Conditioning", "Sound Dampening"],
      nextAvailable: "11:00",
      currentBooking: null,
      equipment: ["Badminton Nets", "Shuttlecocks", "Court Markers", "Racket Rental"],
      surface: "Professional Wooden",
      lighting: "Badminton-Specific LED",
      temperature: 21,
      humidity: 40,
      rating: 4.6,
      totalBookings: 145,
      image: "/placeholder.svg?height=200&width=300&text=Badminton+Court+1",
      amenities: ["Equipment Rental", "Changing Rooms", "Vending Machines"],
    },
    {
      id: "BDC002",
      name: "Badminton Court 2",
      sport: "Badminton",
      location: "Sports Hall - Court 2",
      capacity: 4,
      status: "occupied",
      hourlyRate: 15,
      features: ["Indoor", "Wooden Floor", "Professional Net", "Air Conditioning"],
      nextAvailable: "13:00",
      currentBooking: "Badminton Club Championship",
      equipment: ["Badminton Nets", "Shuttlecocks", "Court Markers"],
      surface: "Professional Wooden",
      lighting: "Badminton-Specific LED",
      temperature: 20,
      humidity: 42,
      rating: 4.4,
      totalBookings: 112,
      image: "/placeholder.svg?height=200&width=300&text=Badminton+Court+2",
      amenities: ["Equipment Rental", "Changing Rooms"],
    },
    {
      id: "TC003",
      name: "Tennis Court Gamma",
      sport: "Tennis",
      location: "Tennis Complex - Court C",
      capacity: 4,
      status: "available",
      hourlyRate: 35,
      features: ["Clay Court", "Professional Net", "Ball Machine", "Coaching Area"],
      nextAvailable: "Now",
      currentBooking: null,
      equipment: ["Tennis Nets", "Clay Court Tools", "Ball Machine", "Coaching Equipment"],
      surface: "Clay Court",
      lighting: "Premium Court Lighting",
      temperature: 26,
      humidity: 55,
      rating: 4.8,
      totalBookings: 87,
      image: "/placeholder.svg?height=200&width=300&text=Clay+Tennis+Court",
      amenities: ["Pro Shop", "Coaching Services", "Premium Locker Rooms"],
    },
  ])

  // Mock data for user's bookings
  const [myBookings, setMyBookings] = useState([
    {
      id: "SB001",
      courtId: "BC001",
      courtName: "Basketball Court 1",
      sport: "Basketball",
      date: "2024-01-22",
      startTime: "15:00",
      endTime: "17:00",
      duration: 2,
      totalCost: 50,
      status: "confirmed",
      playerCount: 8,
      paymentStatus: "paid",
      bookingTime: "2024-01-20 14:30",
      confirmationCode: "BC001-240122-001",
    },
    {
      id: "SB002",
      courtId: "TC001",
      courtName: "Tennis Court Alpha",
      sport: "Tennis",
      date: "2024-01-25",
      startTime: "10:00",
      endTime: "11:30",
      duration: 1.5,
      totalCost: 45,
      status: "pending",
      playerCount: 2,
      paymentStatus: "pending",
      bookingTime: "2024-01-21 09:15",
      confirmationCode: "TC001-240125-002",
    },
    {
      id: "SB003",
      courtId: "BDC001",
      courtName: "Badminton Court 1",
      sport: "Badminton",
      date: "2024-01-28",
      startTime: "18:00",
      endTime: "19:00",
      duration: 1,
      totalCost: 15,
      status: "confirmed",
      playerCount: 4,
      paymentStatus: "paid",
      bookingTime: "2024-01-21 16:45",
      confirmationCode: "BDC001-240128-003",
    },
  ])

  // Auto-refresh simulation
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      setCourts((prev) =>
        prev.map((court) => {
          if (Math.random() < 0.12) {
            // 12% chance of status change
            const statuses = ["available", "occupied", "maintenance"]
            const currentIndex = statuses.indexOf(court.status)
            const newStatus = statuses[(currentIndex + 1) % statuses.length]

            return {
              ...court,
              status: newStatus,
              temperature: court.temperature + (Math.random() - 0.5) * 2,
              humidity: Math.max(30, Math.min(70, court.humidity + (Math.random() - 0.5) * 5)),
            }
          }
          return court
        }),
      )
      setLastUpdated(new Date())
    }, 10000)

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
        return FiCheckCircle
      case "occupied":
        return FiPlay
      case "maintenance":
        return FiAlertCircle
      default:
        return FiXCircle
    }
  }

  const getSportIcon = (sport) => {
    return FiActivity // Using generic activity icon for all sports
  }

  const getSportColor = (sport) => {
    switch (sport) {
      case "Basketball":
        return "orange"
      case "Tennis":
        return "green"
      case "Badminton":
        return "blue"
      default:
        return "gray"
    }
  }

  const filteredCourts = courts.filter((court) => {
    const matchesSearch =
      court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      court.sport.toLowerCase().includes(searchTerm.toLowerCase()) ||
      court.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSport = !sportFilter || court.sport === sportFilter
    const matchesStatus = !statusFilter || court.status === statusFilter
    const matchesLocation = !locationFilter || court.location.includes(locationFilter)

    return matchesSearch && matchesSport && matchesStatus && matchesLocation
  })

  const availableCount = courts.filter((c) => c.status === "available").length
  const occupiedCount = courts.filter((c) => c.status === "occupied").length
  const maintenanceCount = courts.filter((c) => c.status === "maintenance").length
  const totalSpent = myBookings.reduce((sum, booking) => sum + booking.totalCost, 0)

  const handleBookCourt = (court) => {
    setSelectedCourt(court)
    onBookingOpen()
  }

  const handleViewDetails = (court) => {
    setSelectedCourt(court)
    onDetailsOpen()
  }

  const handleSubmitBooking = () => {
    if (!bookingDate || !startTime || !endTime || !playerCount || !contactInfo) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const start = new Date(`2024-01-01 ${startTime}`)
    const end = new Date(`2024-01-01 ${endTime}`)
    const duration = (end - start) / (1000 * 60 * 60) // hours
    const totalCost = duration * selectedCourt.hourlyRate

    const newBooking = {
      id: `SB${Date.now()}`,
      courtId: selectedCourt.id,
      courtName: selectedCourt.name,
      sport: selectedCourt.sport,
      date: bookingDate,
      startTime,
      endTime,
      duration,
      totalCost,
      status: "pending",
      playerCount: Number.parseInt(playerCount),
      paymentStatus: "pending",
      bookingTime: new Date().toISOString().slice(0, 16),
      confirmationCode: `${selectedCourt.id}-${bookingDate.replace(/-/g, "")}-${String(Date.now()).slice(-3)}`,
    }

    setMyBookings((prev) => [newBooking, ...prev])

    toast({
      title: "Booking Submitted",
      description: `Your ${selectedCourt.sport} court booking has been submitted successfully`,
      status: "success",
      duration: 3000,
      isClosable: true,
    })

    // Reset form
    setBookingDate("")
    setStartTime("")
    setEndTime("")
    setPlayerCount("")
    setContactInfo("")
    setNotes("")
    setEquipmentNeeded([])
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
      description: "Court availability has been updated",
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
              Sports Court Booking System
            </Text>
            <Text color="gray.600">Reserve basketball, tennis, and badminton courts with real-time availability</Text>
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
                  <Icon as={FiCheckCircle} color="green.500" boxSize={8} />
                  <Box>
                    <StatNumber color="green.500" fontSize="2xl">
                      {availableCount}
                    </StatNumber>
                    <StatLabel>Available Courts</StatLabel>
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
                  <Icon as={FiPlay} color="red.500" boxSize={8} />
                  <Box>
                    <StatNumber color="red.500" fontSize="2xl">
                      {occupiedCount}
                    </StatNumber>
                    <StatLabel>In Use</StatLabel>
                    <StatHelpText>Currently occupied</StatHelpText>
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
                      ${totalSpent}
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
            <Tab>Available Courts ({filteredCourts.length})</Tab>
            <Tab>My Bookings ({myBookings.length})</Tab>
          </TabList>

          <TabPanels>
            {/* Available Courts Tab */}
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
                        placeholder="Search courts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>

                    <Select
                      placeholder="All Sports"
                      value={sportFilter}
                      onChange={(e) => setSportFilter(e.target.value)}
                    >
                      <option value="Basketball">Basketball</option>
                      <option value="Tennis">Tennis</option>
                      <option value="Badminton">Badminton</option>
                    </Select>

                    <Select
                      placeholder="All Locations"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    >
                      <option value="Sports Complex">Sports Complex</option>
                      <option value="Tennis Complex">Tennis Complex</option>
                      <option value="Sports Hall">Sports Hall</option>
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
                        {filteredCourts.length} courts found
                      </Text>
                    </VStack>
                  </Grid>
                </CardBody>
              </Card>

              {/* Courts Grid */}
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                {filteredCourts.map((court) => (
                  <Card
                    key={court.id}
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
                              as={getSportIcon(court.sport)}
                              color={`${getSportColor(court.sport)}.500`}
                              boxSize={6}
                            />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold" fontSize="lg">
                                {court.name}
                              </Text>
                              <Badge colorScheme={getSportColor(court.sport)} variant="subtle">
                                {court.sport}
                              </Badge>
                            </VStack>
                          </HStack>
                          <Badge colorScheme={getStatusColor(court.status)} variant="solid">
                            {court.status.toUpperCase()}
                          </Badge>
                        </HStack>

                        {/* Image */}
                        <Image
                          src={court.image || "/placeholder.svg"}
                          alt={court.name}
                          borderRadius="md"
                          objectFit="cover"
                          h="120px"
                          w="full"
                        />

                        {/* Location & Capacity */}
                        <VStack align="start" spacing={2}>
                          <HStack>
                            <Icon as={FiMapPin} color="gray.500" size="sm" />
                            <Text fontSize="sm" color="gray.600" fontWeight="medium">
                              {court.location}
                            </Text>
                          </HStack>
                          <HStack>
                            <Icon as={FiUsers} color="gray.500" size="sm" />
                            <Text fontSize="sm" color="gray.600">
                              Capacity: {court.capacity} players
                            </Text>
                          </HStack>
                          <HStack>
                            <Icon as={FiThermometer} color="gray.500" size="sm" />
                            <Text fontSize="sm" color="gray.600">
                              {court.temperature}°C, {court.humidity}% humidity
                            </Text>
                          </HStack>
                        </VStack>

                        <Divider />

                        {/* Pricing & Rating */}
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" color="gray.500">
                              Hourly Rate
                            </Text>
                            <Text fontSize="2xl" fontWeight="bold" color="green.500">
                              ${court.hourlyRate}
                            </Text>
                          </VStack>
                          <VStack align="end" spacing={1}>
                            <HStack>
                              <Icon as={FiStar} color="yellow.400" />
                              <Text fontSize="sm" fontWeight="bold">
                                {court.rating}
                              </Text>
                            </HStack>
                            <Text fontSize="xs" color="gray.500">
                              {court.totalBookings} bookings
                            </Text>
                          </VStack>
                        </HStack>

                        {/* Features */}
                        <VStack align="start" spacing={2}>
                          <Text fontSize="sm" fontWeight="bold" color="gray.700">
                            Features:
                          </Text>
                          <HStack wrap="wrap" spacing={1}>
                            {court.features.slice(0, 3).map((feature) => (
                              <Badge key={feature} colorScheme="blue" variant="outline" size="sm">
                                {feature}
                              </Badge>
                            ))}
                            {court.features.length > 3 && (
                              <Badge colorScheme="gray" variant="outline" size="sm">
                                +{court.features.length - 3} more
                              </Badge>
                            )}
                          </HStack>
                        </VStack>

                        {/* Availability Status */}
                        {court.status === "available" && (
                          <Alert status="success" size="sm">
                            <AlertIcon />
                            <Box>
                              <AlertTitle fontSize="sm">Available Now</AlertTitle>
                              <AlertDescription fontSize="xs">Next slot: {court.nextAvailable}</AlertDescription>
                            </Box>
                          </Alert>
                        )}

                        {court.status === "occupied" && court.currentBooking && (
                          <Alert status="error" size="sm">
                            <AlertIcon />
                            <Box>
                              <AlertTitle fontSize="sm">Currently Occupied</AlertTitle>
                              <AlertDescription fontSize="xs">
                                {court.currentBooking} - Available: {court.nextAvailable}
                              </AlertDescription>
                            </Box>
                          </Alert>
                        )}

                        {court.status === "maintenance" && court.maintenanceNote && (
                          <Alert status="warning" size="sm">
                            <AlertIcon />
                            <Box>
                              <AlertTitle fontSize="sm">Under Maintenance</AlertTitle>
                              <AlertDescription fontSize="xs">{court.maintenanceNote}</AlertDescription>
                            </Box>
                          </Alert>
                        )}

                        {/* Action Buttons */}
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(court)}
                            leftIcon={<FiSettings />}
                            flex={1}
                          >
                            Details
                          </Button>
                          {court.status === "available" ? (
                            <Button
                              colorScheme="blue"
                              onClick={() => handleBookCourt(court)}
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
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>

              {filteredCourts.length === 0 && (
                <Card>
                  <CardBody textAlign="center" py={10}>
                    <Icon as={FiSearch} boxSize={12} color="gray.400" mb={4} />
                    <Text fontSize="lg" color="gray.600" mb={2}>
                      No courts found
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
                      <Text color="gray.500">Book your first court to get started</Text>
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
                              {myBookings.reduce((sum, b) => sum + b.duration, 0)}h
                            </StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Total Spent</StatLabel>
                            <StatNumber color="purple.500">${totalSpent}</StatNumber>
                          </Stat>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* Bookings List */}
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Court</Th>
                            <Th>Sport</Th>
                            <Th>Date & Time</Th>
                            <Th>Duration</Th>
                            <Th>Players</Th>
                            <Th>Cost</Th>
                            <Th>Status</Th>
                            <Th>Payment</Th>
                            <Th>Confirmation</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {myBookings.map((booking) => (
                            <Tr key={booking.id}>
                              <Td fontWeight="medium">{booking.courtName}</Td>
                              <Td>
                                <Badge colorScheme={getSportColor(booking.sport)} variant="subtle">
                                  {booking.sport}
                                </Badge>
                              </Td>
                              <Td>
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="sm" fontWeight="medium">
                                    {booking.date}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {booking.startTime} - {booking.endTime}
                                  </Text>
                                </VStack>
                              </Td>
                              <Td>{booking.duration}h</Td>
                              <Td>{booking.playerCount}</Td>
                              <Td fontWeight="bold" color="green.600">
                                ${booking.totalCost}
                              </Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    booking.status === "confirmed"
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
                                <Text fontFamily="mono" fontSize="xs" color="blue.600">
                                  {booking.confirmationCode}
                                </Text>
                              </Td>
                              <Td>
                                <HStack spacing={2}>
                                  {booking.status === "confirmed" && (
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
          <ModalHeader>Book Court: {selectedCourt?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Court Information</AlertTitle>
                  <AlertDescription>
                    {selectedCourt?.sport} - {selectedCourt?.location} (Capacity: {selectedCourt?.capacity} players)
                  </AlertDescription>
                </Box>
              </Alert>

              <FormControl isRequired>
                <FormLabel>Booking Date</FormLabel>
                <Input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Start Time</FormLabel>
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>End Time</FormLabel>
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel>Number of Players</FormLabel>
                <Select
                  placeholder="Select player count"
                  value={playerCount}
                  onChange={(e) => setPlayerCount(e.target.value)}
                >
                  {Array.from({ length: selectedCourt?.capacity || 10 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} player{i > 0 ? "s" : ""}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Contact Information</FormLabel>
                <Input
                  placeholder="Phone number or email"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Equipment Needed</FormLabel>
                <VStack align="start" spacing={2}>
                  {selectedCourt?.equipment.map((item) => (
                    <Checkbox
                      key={item}
                      isChecked={equipmentNeeded.includes(item)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEquipmentNeeded((prev) => [...prev, item])
                        } else {
                          setEquipmentNeeded((prev) => prev.filter((eq) => eq !== item))
                        }
                      }}
                    >
                      {item}
                    </Checkbox>
                  ))}
                </VStack>
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

              {startTime && endTime && (
                <Alert status="success">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Estimated Cost</AlertTitle>
                    <AlertDescription>
                      ${(() => {
                        const start = new Date(`2024-01-01 ${startTime}`)
                        const end = new Date(`2024-01-01 ${endTime}`)
                        const duration = (end - start) / (1000 * 60 * 60)
                        return duration > 0 ? (duration * selectedCourt?.hourlyRate).toFixed(2) : "0.00"
                      })()} for {(() => {
                        const start = new Date(`2024-01-01 ${startTime}`)
                        const end = new Date(`2024-01-01 ${endTime}`)
                        const duration = (end - start) / (1000 * 60 * 60)
                        return duration > 0 ? duration : 0
                      })()} hour(s)
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
          <ModalHeader>Court Details: {selectedCourt?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Image
                src={selectedCourt?.image || "/placeholder.svg"}
                alt={selectedCourt?.name}
                borderRadius="md"
                objectFit="cover"
                h="200px"
                w="full"
              />

              <SimpleGrid columns={2} spacing={4}>
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Court Information</Text>
                  <Text fontSize="sm">Sport: {selectedCourt?.sport}</Text>
                  <Text fontSize="sm">Location: {selectedCourt?.location}</Text>
                  <Text fontSize="sm">Capacity: {selectedCourt?.capacity} players</Text>
                  <Text fontSize="sm">Surface: {selectedCourt?.surface}</Text>
                  <Text fontSize="sm">Lighting: {selectedCourt?.lighting}</Text>
                </VStack>

                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Environmental Conditions</Text>
                  <Text fontSize="sm">Temperature: {selectedCourt?.temperature}°C</Text>
                  <Text fontSize="sm">Humidity: {selectedCourt?.humidity}%</Text>
                  <Text fontSize="sm">Rating: {selectedCourt?.rating}/5.0</Text>
                  <Text fontSize="sm">Total Bookings: {selectedCourt?.totalBookings}</Text>
                </VStack>
              </SimpleGrid>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Available Features</Text>
                <HStack wrap="wrap" spacing={2}>
                  {selectedCourt?.features.map((feature) => (
                    <Badge key={feature} colorScheme="blue" variant="outline">
                      {feature}
                    </Badge>
                  ))}
                </HStack>
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Available Equipment</Text>
                <HStack wrap="wrap" spacing={2}>
                  {selectedCourt?.equipment.map((item) => (
                    <Badge key={item} colorScheme="green" variant="outline">
                      {item}
                    </Badge>
                  ))}
                </HStack>
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Amenities</Text>
                <HStack wrap="wrap" spacing={2}>
                  {selectedCourt?.amenities.map((amenity) => (
                    <Badge key={amenity} colorScheme="purple" variant="outline">
                      {amenity}
                    </Badge>
                  ))}
                </HStack>
              </VStack>

              <Card>
                <CardBody textAlign="center">
                  <Text fontSize="3xl" fontWeight="bold" color="green.500">
                    ${selectedCourt?.hourlyRate}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    per hour
                  </Text>
                </CardBody>
              </Card>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDetailsClose}>
              Close
            </Button>
            {selectedCourt?.status === "available" && (
              <Button
                colorScheme="blue"
                onClick={() => {
                  onDetailsClose()
                  handleBookCourt(selectedCourt)
                }}
              >
                Book This Court
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default Courts
