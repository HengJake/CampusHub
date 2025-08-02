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
  Image,
  Checkbox,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
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
  FiSettings,
  FiStar,
  FiThermometer,
  FiVolume2,
  FiSun,
  FiMonitor,
  FiWifi,
} from "react-icons/fi"

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
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [groupSize, setGroupSize] = useState(1)
  const [purpose, setPurpose] = useState("")
  const [contactInfo, setContactInfo] = useState("")
  const [notes, setNotes] = useState("")
  const [equipmentNeeded, setEquipmentNeeded] = useState([])

  const { isOpen: isBookingOpen, onOpen: onBookingOpen, onClose: onBookingClose } = useDisclosure()
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure()
  const toast = useToast()

  // Mock data for study/meeting rooms
  const [rooms, setRooms] = useState([
    {
      id: "SR001",
      name: "Study Room Alpha",
      type: "Study Room",
      location: "Library - 2nd Floor",
      capacity: 4,
      status: "available",
      hourlyRate: 0, // Free
      features: ["Whiteboard", "Power Outlets", "Natural Light", "Quiet Zone", "WiFi"],
      nextAvailable: "Now",
      currentBooking: null,
      equipment: ["Whiteboard Markers", "Erasers", "Power Strips", "Chairs", "Table"],
      environment: {
        temperature: 22,
        lighting: "Natural + LED",
        noiseLevel: 25, // dB
        airQuality: "Excellent",
      },
      amenities: ["Water Fountain", "Restrooms Nearby", "Printing Station"],
      rating: 4.7,
      totalBookings: 89,
      maxBookingHours: 4,
      image: "/placeholder.svg?height=200&width=300&text=Study+Room+Alpha",
      bookingLimits: "Max 4 hours per day",
    },
    {
      id: "SR002",
      name: "Study Room Beta",
      type: "Study Room",
      location: "Library - 3rd Floor",
      capacity: 6,
      status: "occupied",
      hourlyRate: 0,
      features: ["Interactive Whiteboard", "Power Outlets", "Air Conditioning", "Sound Proof", "WiFi"],
      nextAvailable: "14:30",
      currentBooking: "Computer Science Study Group",
      equipment: ["Interactive Whiteboard", "Markers", "Power Strips", "Comfortable Chairs"],
      environment: {
        temperature: 21,
        lighting: "LED Adjustable",
        noiseLevel: 20,
        airQuality: "Excellent",
      },
      amenities: ["Water Fountain", "Restrooms Nearby", "Vending Machines"],
      rating: 4.8,
      totalBookings: 156,
      maxBookingHours: 4,
      image: "/placeholder.svg?height=200&width=300&text=Study+Room+Beta",
      bookingLimits: "Max 4 hours per day",
    },
    {
      id: "MR001",
      name: "Meeting Room Gamma",
      type: "Meeting Room",
      location: "Student Center - 1st Floor",
      capacity: 12,
      status: "available",
      hourlyRate: 15,
      features: ["Projector", "Conference Table", "Video Conferencing", "Sound System", "WiFi", "Air Conditioning"],
      nextAvailable: "Now",
      currentBooking: null,
      equipment: ["Projector", "Screen", "Conference Phone", "Microphones", "Speakers", "Laptop Connections"],
      environment: {
        temperature: 23,
        lighting: "Professional LED",
        noiseLevel: 30,
        airQuality: "Good",
      },
      amenities: ["Catering Service", "Parking", "Reception Desk", "Coffee Machine"],
      rating: 4.9,
      totalBookings: 234,
      maxBookingHours: 8,
      image: "/placeholder.svg?height=200&width=300&text=Meeting+Room+Gamma",
      bookingLimits: "Max 8 hours per booking",
    },
    {
      id: "SH001",
      name: "Seminar Hall Delta",
      type: "Seminar Hall",
      location: "Academic Building - Ground Floor",
      capacity: 50,
      status: "available",
      hourlyRate: 40,
      features: ["Stage", "Microphone System", "Projector", "Tiered Seating", "Recording Equipment", "Live Streaming"],
      nextAvailable: "16:00",
      currentBooking: null,
      equipment: ["Wireless Microphones", "Podium", "Projector", "Screen", "Recording System", "Lighting Controls"],
      environment: {
        temperature: 24,
        lighting: "Stage + Audience Lighting",
        noiseLevel: 35,
        airQuality: "Good",
      },
      amenities: ["Green Room", "Storage", "Parking", "Catering Kitchen", "Technical Support"],
      rating: 4.6,
      totalBookings: 67,
      maxBookingHours: 6,
      image: "/placeholder.svg?height=200&width=300&text=Seminar+Hall+Delta",
      bookingLimits: "Max 6 hours per booking, advance booking required",
    },
    {
      id: "SR003",
      name: "Study Room Epsilon",
      type: "Study Room",
      location: "Engineering Building - 4th Floor",
      capacity: 8,
      status: "maintenance",
      hourlyRate: 0,
      features: ["Large Whiteboard", "Power Outlets", "Natural Light", "Group Tables", "WiFi"],
      nextAvailable: "Tomorrow 09:00",
      currentBooking: null,
      equipment: ["Whiteboards", "Markers", "Power Strips", "Modular Tables"],
      environment: {
        temperature: 20,
        lighting: "Natural + LED",
        noiseLevel: 28,
        airQuality: "Fair",
      },
      amenities: ["Water Fountain", "Restrooms", "Study Lounge"],
      rating: 4.4,
      totalBookings: 78,
      maxBookingHours: 4,
      maintenanceNote: "Air conditioning repair - ETA: 4 hours",
      image: "/placeholder.svg?height=200&width=300&text=Maintenance+Room",
      bookingLimits: "Max 4 hours per day",
    },
    {
      id: "MR002",
      name: "Meeting Room Zeta",
      type: "Meeting Room",
      location: "Business School - 2nd Floor",
      capacity: 8,
      status: "available",
      hourlyRate: 12,
      features: ["Smart TV", "Conference Table", "Video Conferencing", "Whiteboard", "WiFi", "Coffee Machine"],
      nextAvailable: "Now",
      currentBooking: null,
      equipment: ["Smart TV", "Video Conference System", "Whiteboard", "Coffee Machine", "Water Dispenser"],
      environment: {
        temperature: 22,
        lighting: "Adjustable LED",
        noiseLevel: 25,
        airQuality: "Excellent",
      },
      amenities: ["Coffee/Tea", "Parking", "Reception", "Printing"],
      rating: 4.7,
      totalBookings: 145,
      maxBookingHours: 6,
      image: "/placeholder.svg?height=200&width=300&text=Meeting+Room+Zeta",
      bookingLimits: "Max 6 hours per booking",
    },
    {
      id: "SR004",
      name: "Collaborative Study Space",
      type: "Study Room",
      location: "Library - 1st Floor",
      capacity: 12,
      status: "available",
      hourlyRate: 5,
      features: ["Modular Furniture", "Multiple Whiteboards", "Power Outlets", "Collaborative Tools", "WiFi"],
      nextAvailable: "Now",
      currentBooking: null,
      equipment: ["Mobile Whiteboards", "Flip Charts", "Markers", "Sticky Notes", "Modular Tables"],
      environment: {
        temperature: 23,
        lighting: "Bright LED",
        noiseLevel: 40,
        airQuality: "Good",
      },
      amenities: ["Snack Bar", "Water Station", "Lockers", "Charging Stations"],
      rating: 4.5,
      totalBookings: 203,
      maxBookingHours: 6,
      image: "/placeholder.svg?height=200&width=300&text=Collaborative+Space",
      bookingLimits: "Max 6 hours per booking, group projects preferred",
    },
  ])

  // Mock data for user's bookings
  const [myBookings, setMyBookings] = useState([
    {
      id: "RB001",
      roomId: "SR001",
      roomName: "Study Room Alpha",
      type: "Study Room",
      date: "2024-01-22",
      startTime: "10:00",
      endTime: "14:00",
      duration: 4,
      totalCost: 0,
      status: "confirmed",
      groupSize: 3,
      purpose: "Group Study Session",
      paymentStatus: "free",
      bookingTime: "2024-01-20 15:30",
      confirmationCode: "SR001-240122-001",
    },
    {
      id: "RB002",
      roomId: "MR001",
      roomName: "Meeting Room Gamma",
      type: "Meeting Room",
      date: "2024-01-25",
      startTime: "14:00",
      endTime: "17:00",
      duration: 3,
      totalCost: 45,
      status: "pending",
      groupSize: 8,
      purpose: "Project Presentation",
      paymentStatus: "pending",
      bookingTime: "2024-01-21 11:15",
      confirmationCode: "MR001-240125-002",
    },
    {
      id: "RB003",
      roomId: "SH001",
      roomName: "Seminar Hall Delta",
      type: "Seminar Hall",
      date: "2024-02-01",
      startTime: "09:00",
      endTime: "12:00",
      duration: 3,
      totalCost: 120,
      status: "confirmed",
      groupSize: 35,
      purpose: "Student Conference",
      paymentStatus: "paid",
      bookingTime: "2024-01-18 09:45",
      confirmationCode: "SH001-240201-003",
    },
  ])

  // Auto-refresh simulation
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      setRooms((prev) =>
        prev.map((room) => {
          if (Math.random() < 0.1) {
            // 10% chance of status change
            const statuses = ["available", "occupied", "maintenance"]
            const currentIndex = statuses.indexOf(room.status)
            const newStatus = statuses[(currentIndex + 1) % statuses.length]

            return {
              ...room,
              status: newStatus,
              environment: {
                ...room.environment,
                temperature: room.environment.temperature + (Math.random() - 0.5) * 2,
                noiseLevel: Math.max(15, Math.min(50, room.environment.noiseLevel + (Math.random() - 0.5) * 5)),
              },
            }
          }
          return room
        }),
      )
      setLastUpdated(new Date())
    }, 12000)

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
        return FiUsers
      case "maintenance":
        return FiAlertCircle
      default:
        return FiXCircle
    }
  }

  const getTypeIcon = (type) => {
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
    if (capacity <= 4) return "Small"
    if (capacity <= 12) return "Medium"
    return "Large"
  }

  const getCapacityCategoryColor = (capacity) => {
    if (capacity <= 4) return "green"
    if (capacity <= 12) return "blue"
    return "purple"
  }

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = !typeFilter || room.type === typeFilter
    const matchesStatus = !statusFilter || room.status === statusFilter
    const matchesCapacity = !capacityFilter || getCapacityCategory(room.capacity) === capacityFilter
    const matchesLocation = !locationFilter || room.location.includes(locationFilter)

    return matchesSearch && matchesType && matchesStatus && matchesCapacity && matchesLocation
  })

  const availableCount = rooms.filter((r) => r.status === "available").length
  const occupiedCount = rooms.filter((r) => r.status === "occupied").length
  const maintenanceCount = rooms.filter((r) => r.status === "maintenance").length
  const totalSpent = myBookings.reduce((sum, booking) => sum + booking.totalCost, 0)
  const freeRooms = rooms.filter((r) => r.hourlyRate === 0).length
  const paidRooms = rooms.filter((r) => r.hourlyRate > 0).length

  const handleBookRoom = (room) => {
    setSelectedRoom(room)
    onBookingOpen()
  }

  const handleViewDetails = (room) => {
    setSelectedRoom(room)
    onDetailsOpen()
  }

  const handleSubmitBooking = () => {
    if (!bookingDate || !startTime || !endTime || !purpose || !contactInfo) {
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

    if (duration > selectedRoom.maxBookingHours) {
      toast({
        title: "Booking Duration Exceeded",
        description: `Maximum booking duration for this room is ${selectedRoom.maxBookingHours} hours`,
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const totalCost = duration * selectedRoom.hourlyRate

    const newBooking = {
      id: `RB${Date.now()}`,
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      type: selectedRoom.type,
      date: bookingDate,
      startTime,
      endTime,
      duration,
      totalCost,
      status: "pending",
      groupSize,
      purpose,
      paymentStatus: selectedRoom.hourlyRate === 0 ? "free" : "pending",
      bookingTime: new Date().toISOString().slice(0, 16),
      confirmationCode: `${selectedRoom.id}-${bookingDate.replace(/-/g, "")}-${String(Date.now()).slice(-3)}`,
    }

    setMyBookings((prev) => [newBooking, ...prev])

    toast({
      title: "Booking Submitted",
      description: `Your ${selectedRoom.type.toLowerCase()} booking has been submitted successfully`,
      status: "success",
      duration: 3000,
      isClosable: true,
    })

    // Reset form
    setBookingDate("")
    setStartTime("")
    setEndTime("")
    setGroupSize(1)
    setPurpose("")
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
      description: "Room availability has been updated",
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

        {/* Stats Dashboard */}
        <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <HStack>
                  <Icon as={FiCheckCircle} color="green.500" boxSize={6} />
                  <Box>
                    <StatNumber color="green.500" fontSize="xl">
                      {availableCount}
                    </StatNumber>
                    <StatLabel fontSize="sm">Available</StatLabel>
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <HStack>
                  <Icon as={FiUsers} color="red.500" boxSize={6} />
                  <Box>
                    <StatNumber color="red.500" fontSize="xl">
                      {occupiedCount}
                    </StatNumber>
                    <StatLabel fontSize="sm">Occupied</StatLabel>
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <HStack>
                  <Icon as={FiAlertCircle} color="orange.500" boxSize={6} />
                  <Box>
                    <StatNumber color="orange.500" fontSize="xl">
                      {maintenanceCount}
                    </StatNumber>
                    <StatLabel fontSize="sm">Maintenance</StatLabel>
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <HStack>
                  <Icon as={FiBook} color="blue.500" boxSize={6} />
                  <Box>
                    <StatNumber color="blue.500" fontSize="xl">
                      {freeRooms}
                    </StatNumber>
                    <StatLabel fontSize="sm">Free Rooms</StatLabel>
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <HStack>
                  <Icon as={FiDollarSign} color="purple.500" boxSize={6} />
                  <Box>
                    <StatNumber color="purple.500" fontSize="xl">
                      ${totalSpent}
                    </StatNumber>
                    <StatLabel fontSize="sm">Total Spent</StatLabel>
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Available Rooms ({filteredRooms.length})</Tab>
            <Tab>My Bookings ({myBookings.length})</Tab>
          </TabList>

          <TabPanels>
            {/* Available Rooms Tab */}
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
                        placeholder="Search rooms..."
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
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                    </Select>

                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">
                        Last Updated: {lastUpdated.toLocaleTimeString()}
                      </Text>
                      <Text fontSize="sm" color="blue.600" fontWeight="medium">
                        {filteredRooms.length} rooms found
                      </Text>
                    </VStack>
                  </Grid>
                </CardBody>
              </Card>

              {/* Rooms Grid */}
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                {filteredRooms.map((room) => (
                  <Card
                    key={room.id}
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
                            <Icon as={getTypeIcon(room.type)} color={`${getTypeColor(room.type)}.500`} boxSize={6} />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold" fontSize="lg">
                                {room.name}
                              </Text>
                              <Badge colorScheme={getTypeColor(room.type)} variant="subtle">
                                {room.type}
                              </Badge>
                            </VStack>
                          </HStack>
                          <Badge colorScheme={getStatusColor(room.status)} variant="solid">
                            {room.status.toUpperCase()}
                          </Badge>
                        </HStack>

                        {/* Image */}
                        <Image
                          src={room.image || "/placeholder.svg"}
                          alt={room.name}
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
                              {room.location}
                            </Text>
                          </HStack>
                          <HStack justify="space-between" w="full">
                            <HStack>
                              <Icon as={FiUsers} color="gray.500" size="sm" />
                              <Text fontSize="sm" color="gray.600">
                                {room.capacity} people
                              </Text>
                            </HStack>
                            <Badge colorScheme={getCapacityCategoryColor(room.capacity)} variant="outline" size="sm">
                              {getCapacityCategory(room.capacity)}
                            </Badge>
                          </HStack>
                        </VStack>

                        <Divider />

                        {/* Environment Info */}
                        <SimpleGrid columns={2} spacing={2}>
                          <VStack align="start" spacing={1}>
                            <HStack>
                              <Icon as={FiThermometer} color="blue.400" size="sm" />
                              <Text fontSize="xs" color="gray.600">
                                {room.environment.temperature}°C
                              </Text>
                            </HStack>
                            <HStack>
                              <Icon as={FiSun} color="yellow.400" size="sm" />
                              <Text fontSize="xs" color="gray.600">
                                {room.environment.lighting}
                              </Text>
                            </HStack>
                          </VStack>
                          <VStack align="start" spacing={1}>
                            <HStack>
                              <Icon as={FiVolume2} color="purple.400" size="sm" />
                              <Text fontSize="xs" color="gray.600">
                                {room.environment.noiseLevel}dB
                              </Text>
                            </HStack>
                            <HStack>
                              <Icon as={FiWifi} color="green.400" size="sm" />
                              <Text fontSize="xs" color="gray.600">
                                {room.environment.airQuality}
                              </Text>
                            </HStack>
                          </VStack>
                        </SimpleGrid>

                        {/* Pricing & Rating */}
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" color="gray.500">
                              {room.hourlyRate === 0 ? "Free" : "Hourly Rate"}
                            </Text>
                            <Text
                              fontSize="2xl"
                              fontWeight="bold"
                              color={room.hourlyRate === 0 ? "green.500" : "blue.500"}
                            >
                              {room.hourlyRate === 0 ? "FREE" : `$${room.hourlyRate}`}
                            </Text>
                          </VStack>
                          <VStack align="end" spacing={1}>
                            <HStack>
                              <Icon as={FiStar} color="yellow.400" />
                              <Text fontSize="sm" fontWeight="bold">
                                {room.rating}
                              </Text>
                            </HStack>
                            <Text fontSize="xs" color="gray.500">
                              {room.totalBookings} bookings
                            </Text>
                          </VStack>
                        </HStack>

                        {/* Features */}
                        <VStack align="start" spacing={2}>
                          <Text fontSize="sm" fontWeight="bold" color="gray.700">
                            Key Features:
                          </Text>
                          <HStack wrap="wrap" spacing={1}>
                            {room.features.slice(0, 3).map((feature) => (
                              <Badge key={feature} colorScheme="blue" variant="outline" size="sm">
                                {feature}
                              </Badge>
                            ))}
                            {room.features.length > 3 && (
                              <Badge colorScheme="gray" variant="outline" size="sm">
                                +{room.features.length - 3} more
                              </Badge>
                            )}
                          </HStack>
                        </VStack>

                        {/* Booking Limits */}
                        <Alert status="info" size="sm">
                          <AlertIcon />
                          <Text fontSize="xs">{room.bookingLimits}</Text>
                        </Alert>

                        {/* Status-specific Information */}
                        {room.status === "available" && (
                          <Alert status="success" size="sm">
                            <AlertIcon />
                            <Box>
                              <AlertTitle fontSize="sm">Available Now</AlertTitle>
                              <AlertDescription fontSize="xs">Ready for immediate booking</AlertDescription>
                            </Box>
                          </Alert>
                        )}

                        {room.status === "occupied" && room.currentBooking && (
                          <Alert status="error" size="sm">
                            <AlertIcon />
                            <Box>
                              <AlertTitle fontSize="sm">Currently Occupied</AlertTitle>
                              <AlertDescription fontSize="xs">
                                {room.currentBooking} - Available: {room.nextAvailable}
                              </AlertDescription>
                            </Box>
                          </Alert>
                        )}

                        {room.status === "maintenance" && room.maintenanceNote && (
                          <Alert status="warning" size="sm">
                            <AlertIcon />
                            <Box>
                              <AlertTitle fontSize="sm">Under Maintenance</AlertTitle>
                              <AlertDescription fontSize="xs">{room.maintenanceNote}</AlertDescription>
                            </Box>
                          </Alert>
                        )}

                        {/* Action Buttons */}
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(room)}
                            leftIcon={<FiSettings />}
                            flex={1}
                          >
                            Details
                          </Button>
                          {room.status === "available" ? (
                            <Button
                              colorScheme="blue"
                              onClick={() => handleBookRoom(room)}
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

              {filteredRooms.length === 0 && (
                <Card>
                  <CardBody textAlign="center" py={10}>
                    <Icon as={FiSearch} boxSize={12} color="gray.400" mb={4} />
                    <Text fontSize="lg" color="gray.600" mb={2}>
                      No rooms found
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
                      <Text color="gray.500">Book your first room to get started</Text>
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
                            <Th>Room</Th>
                            <Th>Type</Th>
                            <Th>Date & Time</Th>
                            <Th>Duration</Th>
                            <Th>Group Size</Th>
                            <Th>Purpose</Th>
                            <Th>Cost</Th>
                            <Th>Status</Th>
                            <Th>Payment</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {myBookings.map((booking) => (
                            <Tr key={booking.id}>
                              <Td fontWeight="medium">{booking.roomName}</Td>
                              <Td>
                                <Badge colorScheme={getTypeColor(booking.type)} variant="subtle">
                                  {booking.type}
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
                              <Td>{booking.groupSize}</Td>
                              <Td>
                                <Text fontSize="sm" maxW="150px" isTruncated>
                                  {booking.purpose}
                                </Text>
                              </Td>
                              <Td fontWeight="bold" color={booking.totalCost === 0 ? "green.600" : "blue.600"}>
                                {booking.totalCost === 0 ? "FREE" : `$${booking.totalCost}`}
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
                                <Badge
                                  colorScheme={
                                    booking.paymentStatus === "paid"
                                      ? "green"
                                      : booking.paymentStatus === "free"
                                        ? "blue"
                                        : "yellow"
                                  }
                                >
                                  {booking.paymentStatus.toUpperCase()}
                                </Badge>
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
          <ModalHeader>Book Room: {selectedRoom?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Room Information</AlertTitle>
                  <AlertDescription>
                    {selectedRoom?.type} - {selectedRoom?.location} (Capacity: {selectedRoom?.capacity} people)
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
                <FormLabel>Group Size</FormLabel>
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

              <FormControl isRequired>
                <FormLabel>Purpose of Booking</FormLabel>
                <Select placeholder="Select purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                  <option value="Group Study">Group Study</option>
                  <option value="Project Meeting">Project Meeting</option>
                  <option value="Presentation Practice">Presentation Practice</option>
                  <option value="Research Discussion">Research Discussion</option>
                  <option value="Club Meeting">Club Meeting</option>
                  <option value="Tutoring Session">Tutoring Session</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Conference">Conference</option>
                  <option value="Other">Other</option>
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
                  {selectedRoom?.equipment.map((item) => (
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
                    <AlertTitle>Booking Summary</AlertTitle>
                    <AlertDescription>
                      {(() => {
                        const start = new Date(`2024-01-01 ${startTime}`)
                        const end = new Date(`2024-01-01 ${endTime}`)
                        const duration = (end - start) / (1000 * 60 * 60)
                        const cost = duration * selectedRoom?.hourlyRate
                        return duration > 0 ? (
                          <>
                            Duration: {duration} hour(s) | Cost: {cost === 0 ? "FREE" : `$${cost.toFixed(2)}`}
                            {duration > selectedRoom?.maxBookingHours && (
                              <Text color="red.500" fontSize="sm" mt={1}>
                                ⚠️ Exceeds maximum booking duration ({selectedRoom?.maxBookingHours}h)
                              </Text>
                            )}
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
          <ModalHeader>Room Details: {selectedRoom?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Image
                src={selectedRoom?.image || "/placeholder.svg"}
                alt={selectedRoom?.name}
                borderRadius="md"
                objectFit="cover"
                h="200px"
                w="full"
              />

              <SimpleGrid columns={2} spacing={4}>
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Room Information</Text>
                  <Text fontSize="sm">Type: {selectedRoom?.type}</Text>
                  <Text fontSize="sm">Location: {selectedRoom?.location}</Text>
                  <Text fontSize="sm">Capacity: {selectedRoom?.capacity} people</Text>
                  <Text fontSize="sm">Max Booking: {selectedRoom?.maxBookingHours} hours</Text>
                  <Text fontSize="sm">Rating: {selectedRoom?.rating}/5.0</Text>
                </VStack>

                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Environment</Text>
                  <Text fontSize="sm">Temperature: {selectedRoom?.environment.temperature}°C</Text>
                  <Text fontSize="sm">Lighting: {selectedRoom?.environment.lighting}</Text>
                  <Text fontSize="sm">Noise Level: {selectedRoom?.environment.noiseLevel}dB</Text>
                  <Text fontSize="sm">Air Quality: {selectedRoom?.environment.airQuality}</Text>
                </VStack>
              </SimpleGrid>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Available Features</Text>
                <HStack wrap="wrap" spacing={2}>
                  {selectedRoom?.features.map((feature) => (
                    <Badge key={feature} colorScheme="blue" variant="outline">
                      {feature}
                    </Badge>
                  ))}
                </HStack>
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Available Equipment</Text>
                <HStack wrap="wrap" spacing={2}>
                  {selectedRoom?.equipment.map((item) => (
                    <Badge key={item} colorScheme="green" variant="outline">
                      {item}
                    </Badge>
                  ))}
                </HStack>
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Amenities</Text>
                <HStack wrap="wrap" spacing={2}>
                  {selectedRoom?.amenities.map((amenity) => (
                    <Badge key={amenity} colorScheme="purple" variant="outline">
                      {amenity}
                    </Badge>
                  ))}
                </HStack>
              </VStack>

              <Card>
                <CardBody textAlign="center">
                  <Text
                    fontSize="3xl"
                    fontWeight="bold"
                    color={selectedRoom?.hourlyRate === 0 ? "green.500" : "blue.500"}
                  >
                    {selectedRoom?.hourlyRate === 0 ? "FREE" : `$${selectedRoom?.hourlyRate}`}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {selectedRoom?.hourlyRate === 0 ? "No charge" : "per hour"}
                  </Text>
                </CardBody>
              </Card>

              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Booking Policy</AlertTitle>
                  <AlertDescription fontSize="sm">{selectedRoom?.bookingLimits}</AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDetailsClose}>
              Close
            </Button>
            {selectedRoom?.status === "available" && (
              <Button
                colorScheme="blue"
                onClick={() => {
                  onDetailsClose()
                  handleBookRoom(selectedRoom)
                }}
              >
                Book This Room
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default StudyRoom
