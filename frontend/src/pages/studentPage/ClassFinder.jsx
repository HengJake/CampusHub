"use client"

import { useState, useEffect } from "react"
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  Button,
  Card,
  CardBody,
  Badge,
  Grid,
  Flex,
  Icon,
  InputGroup,
  InputLeftElement,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Divider,
  Progress,
  Switch,
  FormControl,
  FormLabel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Container,
  Heading,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center,
} from "@chakra-ui/react"
import {
  Search,
  MapPin,
  Clock,
  Users,
  Zap,
  CheckCircle,
  XCircle,
  Calendar,
  RefreshCw,
  Navigation,
  BookOpen,
  Thermometer,
  Shield,
} from "lucide-react"

const ClassFinder = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBuilding, setSelectedBuilding] = useState("")
  const [selectedCapacity, setSelectedCapacity] = useState("")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [availabilityFilter, setAvailabilityFilter] = useState("available")
  const [classrooms, setClassrooms] = useState([])
  const [filteredClassrooms, setFilteredClassrooms] = useState([])
  const [selectedClassroom, setSelectedClassroom] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  // Mock classroom data
  const mockClassrooms = [
    {
      id: "A101",
      name: "Classroom A101",
      building: "Academic Block A",
      floor: 1,
      capacity: 30,
      currentOccupancy: 0,
      status: "available",
      nextClass: "14:00 - CS301 Database Systems",
      availableUntil: "13:45",
      features: ["Projector", "Whiteboard", "AC", "WiFi", "Audio System"],
      type: "Lecture Hall",
      location: { lat: 1.2966, lng: 103.7764 },
      walkingTime: "3 min",
      bookingAllowed: true,
      maxBookingHours: 2,
      currentTemp: "22°C",
      lightingLevel: "Bright",
      cleaningStatus: "Recently Cleaned",
    },
    {
      id: "B205",
      name: "Seminar Room B205",
      building: "Academic Block B",
      floor: 2,
      capacity: 20,
      currentOccupancy: 8,
      status: "occupied",
      nextClass: "15:30 - MATH201 Statistics",
      availableUntil: "15:15",
      features: ["Smart Board", "Video Conferencing", "AC", "WiFi"],
      type: "Seminar Room",
      location: { lat: 1.297, lng: 103.776 },
      walkingTime: "5 min",
      bookingAllowed: true,
      maxBookingHours: 3,
      currentTemp: "23°C",
      lightingLevel: "Medium",
      cleaningStatus: "Scheduled for 16:00",
    },
    {
      id: "C301",
      name: "Computer Lab C301",
      building: "IT Block C",
      floor: 3,
      capacity: 40,
      currentOccupancy: 0,
      status: "available",
      nextClass: "16:00 - IT401 Software Engineering",
      availableUntil: "15:45",
      features: ["40 Computers", "Projector", "AC", "WiFi", "Printer"],
      type: "Computer Lab",
      location: { lat: 1.2975, lng: 103.7755 },
      walkingTime: "7 min",
      bookingAllowed: false,
      maxBookingHours: 1,
      currentTemp: "21°C",
      lightingLevel: "Bright",
      cleaningStatus: "Clean",
    },
    {
      id: "D102",
      name: "Tutorial Room D102",
      building: "Academic Block D",
      floor: 1,
      capacity: 15,
      currentOccupancy: 0,
      status: "available",
      nextClass: "No scheduled classes",
      availableUntil: "All day",
      features: ["Whiteboard", "AC", "WiFi", "Round Tables"],
      type: "Tutorial Room",
      location: { lat: 1.2968, lng: 103.7758 },
      walkingTime: "4 min",
      bookingAllowed: true,
      maxBookingHours: 4,
      currentTemp: "22°C",
      lightingLevel: "Bright",
      cleaningStatus: "Clean",
    },
    {
      id: "E201",
      name: "Lecture Theatre E201",
      building: "Main Academic Building",
      floor: 2,
      capacity: 100,
      currentOccupancy: 45,
      status: "occupied",
      nextClass: "13:30 - PHY101 Physics Fundamentals",
      availableUntil: "13:15",
      features: ["Large Projector", "Microphone", "AC", "WiFi", "Recording Equipment"],
      type: "Lecture Theatre",
      location: { lat: 1.2972, lng: 103.7762 },
      walkingTime: "2 min",
      bookingAllowed: false,
      maxBookingHours: 2,
      currentTemp: "23°C",
      lightingLevel: "Dimmed",
      cleaningStatus: "In Use",
    },
    {
      id: "F105",
      name: "Study Room F105",
      building: "Library Block",
      floor: 1,
      capacity: 8,
      currentOccupancy: 0,
      status: "available",
      nextClass: "No scheduled classes",
      availableUntil: "All day",
      features: ["Whiteboard", "WiFi", "Power Outlets", "Quiet Zone"],
      type: "Study Room",
      location: { lat: 1.2965, lng: 103.7767 },
      walkingTime: "6 min",
      bookingAllowed: true,
      maxBookingHours: 6,
      currentTemp: "22°C",
      lightingLevel: "Bright",
      cleaningStatus: "Clean",
    },
    {
      id: "G203",
      name: "Meeting Room G203",
      building: "Student Center",
      floor: 2,
      capacity: 12,
      currentOccupancy: 0,
      status: "maintenance",
      nextClass: "Under Maintenance",
      availableUntil: "Tomorrow 09:00",
      features: ["Conference Table", "TV Screen", "AC", "WiFi"],
      type: "Meeting Room",
      location: { lat: 1.2963, lng: 103.7759 },
      walkingTime: "8 min",
      bookingAllowed: false,
      maxBookingHours: 3,
      currentTemp: "N/A",
      lightingLevel: "Off",
      cleaningStatus: "Under Maintenance",
    },
    {
      id: "H301",
      name: "Presentation Room H301",
      building: "Business Block",
      floor: 3,
      capacity: 25,
      currentOccupancy: 0,
      status: "available",
      nextClass: "17:00 - BUS301 Marketing Strategy",
      availableUntil: "16:45",
      features: ["Smart Board", "Video Conferencing", "AC", "WiFi", "Presentation Clicker"],
      type: "Presentation Room",
      location: { lat: 1.2969, lng: 103.7756 },
      walkingTime: "9 min",
      bookingAllowed: true,
      maxBookingHours: 2,
      currentTemp: "22°C",
      lightingLevel: "Bright",
      cleaningStatus: "Clean",
    },
  ]

  // Initialize classrooms
  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      setClassrooms(mockClassrooms)
      setFilteredClassrooms(mockClassrooms)
      setIsLoading(false)
      setLastUpdated(new Date())
    }, 1000)
  }, [])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // Simulate real-time updates
      setClassrooms((prevClassrooms) => {
        const updated = prevClassrooms.map((classroom) => {
          const random = Math.random()
          let newStatus = classroom.status
          let newOccupancy = classroom.currentOccupancy

          // Simulate status changes
          if (classroom.status === "available" && random < 0.1) {
            newStatus = "occupied"
            newOccupancy = Math.floor(Math.random() * classroom.capacity * 0.8) + 1
          } else if (classroom.status === "occupied" && random < 0.15) {
            newStatus = "available"
            newOccupancy = 0
          }

          return {
            ...classroom,
            status: newStatus,
            currentOccupancy: newOccupancy,
          }
        })

        setLastUpdated(new Date())
        return updated
      })
    }, 8000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  // Filter classrooms
  useEffect(() => {
    let filtered = classrooms

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (classroom) =>
          classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          classroom.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
          classroom.type.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Building filter
    if (selectedBuilding) {
      filtered = filtered.filter((classroom) => classroom.building === selectedBuilding)
    }

    // Capacity filter
    if (selectedCapacity) {
      const capacity = Number.parseInt(selectedCapacity)
      filtered = filtered.filter((classroom) => classroom.capacity >= capacity)
    }

    // Availability filter
    if (availabilityFilter !== "all") {
      filtered = filtered.filter((classroom) => classroom.status === availabilityFilter)
    }

    setFilteredClassrooms(filtered)
  }, [searchTerm, selectedBuilding, selectedCapacity, availabilityFilter, classrooms])

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
        return CheckCircle
      case "occupied":
        return XCircle
      case "maintenance":
        return RefreshCw
      default:
        return Clock
    }
  }

  const handleQuickBook = (classroom) => {
    if (!classroom.bookingAllowed) {
      toast({
        title: "Booking Not Allowed",
        description: "This classroom cannot be booked by students.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    toast({
      title: "Booking Request Sent",
      description: `Request to book ${classroom.name} has been submitted.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    })
  }

  const handleGetDirections = (classroom) => {
    toast({
      title: "Opening Directions",
      description: `Getting directions to ${classroom.name}...`,
      status: "info",
      duration: 2000,
      isClosable: true,
    })
  }

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setLastUpdated(new Date())
      setIsLoading(false)
      toast({
        title: "Data Refreshed",
        description: "Classroom availability updated successfully.",
        status: "success",
        duration: 2000,
        isClosable: true,
      })
    }, 1000)
  }

  const availableCount = classrooms.filter((c) => c.status === "available").length
  const occupiedCount = classrooms.filter((c) => c.status === "occupied").length
  const maintenanceCount = classrooms.filter((c) => c.status === "maintenance").length

  if (isLoading && classrooms.length === 0) {
    return (
      <Container maxW="7xl" py={8}>
        <Center h="400px">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text>Loading classroom data...</Text>
          </VStack>
        </Center>
      </Container>
    )
  }

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2} color="gray.800">
            <Icon as={MapPin} mr={3} color="blue.500" />
            Classroom Finder
          </Heading>
          <Text color="gray.600">Find available classrooms for meetings, study sessions, and group work</Text>
        </Box>

        {/* Quick Stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Stat bg="white" p={4} rounded="lg" shadow="sm" border="1px" borderColor="gray.200">
            <StatLabel color="green.600">Available</StatLabel>
            <StatNumber color="green.600" fontSize="2xl">
              {availableCount}
            </StatNumber>
            <StatHelpText>Ready to use</StatHelpText>
          </Stat>
          <Stat bg="white" p={4} rounded="lg" shadow="sm" border="1px" borderColor="gray.200">
            <StatLabel color="red.600">Occupied</StatLabel>
            <StatNumber color="red.600" fontSize="2xl">
              {occupiedCount}
            </StatNumber>
            <StatHelpText>Currently in use</StatHelpText>
          </Stat>
          <Stat bg="white" p={4} rounded="lg" shadow="sm" border="1px" borderColor="gray.200">
            <StatLabel color="orange.600">Maintenance</StatLabel>
            <StatNumber color="orange.600" fontSize="2xl">
              {maintenanceCount}
            </StatNumber>
            <StatHelpText>Under maintenance</StatHelpText>
          </Stat>
          <Stat bg="white" p={4} rounded="lg" shadow="sm" border="1px" borderColor="gray.200">
            <StatLabel color="blue.600">Total Rooms</StatLabel>
            <StatNumber color="blue.600" fontSize="2xl">
              {classrooms.length}
            </StatNumber>
            <StatHelpText>Campus-wide</StatHelpText>
          </Stat>
        </SimpleGrid>

        {/* Controls */}
        <Card>
          <CardBody>
            <VStack spacing={4}>
              {/* Auto-refresh and last updated */}
              <Flex justify="space-between" align="center" w="full">
                <HStack>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="auto-refresh" mb="0" fontSize="sm">
                      Auto-refresh
                    </FormLabel>
                    <Switch
                      id="auto-refresh"
                      isChecked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      colorScheme="blue"
                    />
                  </FormControl>
                  <Button
                    size="sm"
                    leftIcon={<RefreshCw />}
                    onClick={refreshData}
                    isLoading={isLoading}
                    variant="outline"
                  >
                    Refresh
                  </Button>
                </HStack>
                <Text fontSize="sm" color="gray.500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </Text>
              </Flex>

              {/* Search and Filters */}
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} w="full">
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={Search} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search classrooms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>

                <Select
                  placeholder="All Buildings"
                  value={selectedBuilding}
                  onChange={(e) => setSelectedBuilding(e.target.value)}
                >
                  <option value="Academic Block A">Academic Block A</option>
                  <option value="Academic Block B">Academic Block B</option>
                  <option value="IT Block C">IT Block C</option>
                  <option value="Academic Block D">Academic Block D</option>
                  <option value="Main Academic Building">Main Academic Building</option>
                  <option value="Library Block">Library Block</option>
                  <option value="Student Center">Student Center</option>
                  <option value="Business Block">Business Block</option>
                </Select>

                <Select
                  placeholder="Min Capacity"
                  value={selectedCapacity}
                  onChange={(e) => setSelectedCapacity(e.target.value)}
                >
                  <option value="8">8+ people</option>
                  <option value="15">15+ people</option>
                  <option value="25">25+ people</option>
                  <option value="40">40+ people</option>
                  <option value="100">100+ people</option>
                </Select>

                <Select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="available">Available Only</option>
                  <option value="occupied">Occupied Only</option>
                  <option value="maintenance">Maintenance</option>
                </Select>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        {/* Results */}
        {filteredClassrooms.length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            <AlertTitle>No classrooms found!</AlertTitle>
            <AlertDescription>Try adjusting your search criteria or filters.</AlertDescription>
          </Alert>
        ) : (
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
            {filteredClassrooms.map((classroom) => (
              <Card
                key={classroom.id}
                cursor="pointer"
                transition="all 0.2s"
                _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                onClick={() => {
                  setSelectedClassroom(classroom)
                  onOpen()
                }}
              >
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    {/* Header */}
                    <Flex justify="space-between" align="start">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" fontSize="lg">
                          {classroom.name}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {classroom.building} • Floor {classroom.floor}
                        </Text>
                      </VStack>
                      <Badge
                        colorScheme={getStatusColor(classroom.status)}
                        variant="solid"
                        px={2}
                        py={1}
                        rounded="full"
                      >
                        <HStack spacing={1}>
                          <Icon as={getStatusIcon(classroom.status)} size="12px" />
                          <Text fontSize="xs" textTransform="capitalize">
                            {classroom.status}
                          </Text>
                        </HStack>
                      </Badge>
                    </Flex>

                    {/* Capacity and Occupancy */}
                    <Box>
                      <Flex justify="space-between" align="center" mb={2}>
                        <HStack>
                          <Icon as={Users} size="16px" color="gray.500" />
                          <Text fontSize="sm">
                            {classroom.currentOccupancy}/{classroom.capacity} people
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                          {classroom.type}
                        </Text>
                      </Flex>
                      <Progress
                        value={(classroom.currentOccupancy / classroom.capacity) * 100}
                        colorScheme={classroom.status === "available" ? "green" : "red"}
                        size="sm"
                        rounded="full"
                      />
                    </Box>

                    {/* Next Class */}
                    <Box>
                      <HStack mb={1}>
                        <Icon as={Clock} size="16px" color="gray.500" />
                        <Text fontSize="sm" fontWeight="medium">
                          Available until: {classroom.availableUntil}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        Next: {classroom.nextClass}
                      </Text>
                    </Box>

                    {/* Features */}
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Features:
                      </Text>
                      <Flex wrap="wrap" gap={1}>
                        {classroom.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="outline" fontSize="xs">
                            {feature}
                          </Badge>
                        ))}
                        {classroom.features.length > 3 && (
                          <Badge variant="outline" fontSize="xs" color="blue.500">
                            +{classroom.features.length - 3} more
                          </Badge>
                        )}
                      </Flex>
                    </Box>

                    {/* Actions */}
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="solid"
                        flex={1}
                        leftIcon={<Navigation />}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleGetDirections(classroom)
                        }}
                      >
                        Directions
                      </Button>
                      {classroom.bookingAllowed && classroom.status === "available" && (
                        <Button
                          size="sm"
                          colorScheme="green"
                          variant="outline"
                          flex={1}
                          leftIcon={<Calendar />}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleQuickBook(classroom)
                          }}
                        >
                          Quick Book
                        </Button>
                      )}
                    </HStack>

                    {/* Walking Time */}
                    <HStack justify="center">
                      <Icon as={MapPin} size="14px" color="gray.400" />
                      <Text fontSize="xs" color="gray.500">
                        {classroom.walkingTime} walk from current location
                      </Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </Grid>
        )}

        {/* Detailed View Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack>
                <Icon as={MapPin} color="blue.500" />
                <Text>{selectedClassroom?.name}</Text>
                <Badge colorScheme={getStatusColor(selectedClassroom?.status)} variant="solid" ml={2}>
                  {selectedClassroom?.status}
                </Badge>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedClassroom && (
                <Tabs>
                  <TabList>
                    <Tab>Overview</Tab>
                    <Tab>Features</Tab>
                    <Tab>Environment</Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel>
                      <VStack align="stretch" spacing={4}>
                        {/* Basic Info */}
                        <SimpleGrid columns={2} spacing={4}>
                          <Box>
                            <Text fontSize="sm" color="gray.500" mb={1}>
                              Building
                            </Text>
                            <Text fontWeight="medium">{selectedClassroom.building}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.500" mb={1}>
                              Floor
                            </Text>
                            <Text fontWeight="medium">Floor {selectedClassroom.floor}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.500" mb={1}>
                              Type
                            </Text>
                            <Text fontWeight="medium">{selectedClassroom.type}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.500" mb={1}>
                              Walking Time
                            </Text>
                            <Text fontWeight="medium">{selectedClassroom.walkingTime}</Text>
                          </Box>
                        </SimpleGrid>

                        <Divider />

                        {/* Capacity */}
                        <Box>
                          <Text fontSize="sm" color="gray.500" mb={2}>
                            Capacity & Occupancy
                          </Text>
                          <HStack justify="space-between" mb={2}>
                            <Text>
                              {selectedClassroom.currentOccupancy} / {selectedClassroom.capacity} people
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              {Math.round((selectedClassroom.currentOccupancy / selectedClassroom.capacity) * 100)}%
                              occupied
                            </Text>
                          </HStack>
                          <Progress
                            value={(selectedClassroom.currentOccupancy / selectedClassroom.capacity) * 100}
                            colorScheme={selectedClassroom.status === "available" ? "green" : "red"}
                            size="md"
                            rounded="full"
                          />
                        </Box>

                        <Divider />

                        {/* Schedule */}
                        <Box>
                          <Text fontSize="sm" color="gray.500" mb={2}>
                            Schedule Information
                          </Text>
                          <VStack align="stretch" spacing={2}>
                            <HStack>
                              <Icon as={Clock} color="green.500" />
                              <Text fontSize="sm">
                                Available until: <strong>{selectedClassroom.availableUntil}</strong>
                              </Text>
                            </HStack>
                            <HStack>
                              <Icon as={BookOpen} color="blue.500" />
                              <Text fontSize="sm">Next class: {selectedClassroom.nextClass}</Text>
                            </HStack>
                          </VStack>
                        </Box>

                        <Divider />

                        {/* Booking Info */}
                        <Box>
                          <Text fontSize="sm" color="gray.500" mb={2}>
                            Booking Information
                          </Text>
                          <VStack align="stretch" spacing={2}>
                            <HStack>
                              <Badge colorScheme={selectedClassroom.bookingAllowed ? "green" : "red"} variant="solid">
                                {selectedClassroom.bookingAllowed ? "Bookable" : "Not Bookable"}
                              </Badge>
                              {selectedClassroom.bookingAllowed && (
                                <Text fontSize="sm" color="gray.600">
                                  Max {selectedClassroom.maxBookingHours} hours
                                </Text>
                              )}
                            </HStack>
                          </VStack>
                        </Box>
                      </VStack>
                    </TabPanel>

                    <TabPanel>
                      <VStack align="stretch" spacing={4}>
                        <Text fontSize="lg" fontWeight="medium">
                          Available Features
                        </Text>
                        <SimpleGrid columns={2} spacing={3}>
                          {selectedClassroom.features.map((feature, index) => (
                            <HStack key={index}>
                              <Icon as={CheckCircle} color="green.500" size="16px" />
                              <Text fontSize="sm">{feature}</Text>
                            </HStack>
                          ))}
                        </SimpleGrid>
                      </VStack>
                    </TabPanel>

                    <TabPanel>
                      <VStack align="stretch" spacing={4}>
                        <Text fontSize="lg" fontWeight="medium">
                          Room Environment
                        </Text>
                        <SimpleGrid columns={2} spacing={4}>
                          <Box>
                            <HStack mb={2}>
                              <Icon as={Thermometer} color="orange.500" />
                              <Text fontSize="sm" fontWeight="medium">
                                Temperature
                              </Text>
                            </HStack>
                            <Text>{selectedClassroom.currentTemp}</Text>
                          </Box>
                          <Box>
                            <HStack mb={2}>
                              <Icon as={Zap} color="yellow.500" />
                              <Text fontSize="sm" fontWeight="medium">
                                Lighting
                              </Text>
                            </HStack>
                            <Text>{selectedClassroom.lightingLevel}</Text>
                          </Box>
                          <Box>
                            <HStack mb={2}>
                              <Icon as={Shield} color="blue.500" />
                              <Text fontSize="sm" fontWeight="medium">
                                Cleaning Status
                              </Text>
                            </HStack>
                            <Text>{selectedClassroom.cleaningStatus}</Text>
                          </Box>
                        </SimpleGrid>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  )
}

export default ClassFinder
