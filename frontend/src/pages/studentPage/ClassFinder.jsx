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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
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
  CalendarDays,
} from "lucide-react"
import { useAcademicStore } from "../../store/academic"

// Utility functions for schedule handling
const getCurrentDayOfWeek = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

const getCurrentTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

const isTimeBetween = (currentTime, startTime, endTime) => {
  return currentTime >= startTime && currentTime <= endTime;
};

const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const getRoomStatus = (room, classSchedules) => {
  const currentDay = getCurrentDayOfWeek();
  const currentTime = getCurrentTime();

  // Find schedules for this room on current day
  const todaySchedules = classSchedules.filter(schedule =>
    schedule.roomId === room._id && schedule.dayOfWeek === currentDay
  );

  // Check if room is currently occupied
  const isCurrentlyOccupied = todaySchedules.some(schedule =>
    isTimeBetween(currentTime, schedule.startTime, schedule.endTime)
  );

  if (isCurrentlyOccupied) {
    const currentSchedule = todaySchedules.find(schedule =>
      isTimeBetween(currentTime, schedule.startTime, schedule.endTime)
    );
    return {
      status: 'occupied',
      currentClass: currentSchedule,
      nextClass: null
    };
  }

  // Find next class today
  const futureSchedules = todaySchedules.filter(schedule =>
    schedule.startTime > currentTime
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const nextClass = futureSchedules.length > 0 ? futureSchedules[0] : null;

  return {
    status: 'available',
    currentClass: null,
    nextClass: nextClass
  };
};

const getRoomSchedules = (roomId, classSchedules) => {
  return classSchedules.filter(schedule => schedule.roomId._id === roomId);
};

const groupSchedulesByDay = (schedules) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const grouped = {};

  days.forEach(day => {
    grouped[day] = schedules.filter(schedule => schedule.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  return grouped;
};

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

  const { rooms, fetchRooms, classSchedules, fetchClassSchedules } = useAcademicStore();

  useEffect(() => {
    if (rooms.length === 0) {
      fetchRooms();
    }

    if (classSchedules.length === 0) {
      fetchClassSchedules();
    }

  }, []);


  // const filteredRooms = rooms.filter(room => room.status === "available")
  const filteredRooms = rooms

  // Initialize classrooms with real data and schedule-based status
  useEffect(() => {
    if (rooms.length > 0 && classSchedules.length > 0) {
      setIsLoading(true)
      // Map the fetched room data to the expected structure with schedule-based status
      const mappedRooms = rooms.map((room) => {
        const roomStatus = getRoomStatus(room, classSchedules);

        return {
          id: room._id,
          name: `Room ${room.roomNumber}`,
          building: room.block,
          floor: room.floor,
          capacity: room.capacity,
          status: roomStatus.status,
          currentClass: roomStatus.currentClass,
          nextClass: roomStatus.nextClass,
          availableUntil: roomStatus.status === "available"
            ? (roomStatus.nextClass ? `Until ${formatTime(roomStatus.nextClass.startTime)}` : "All day")
            : "Currently occupied",
          features: room.facilities || [],
          type: room.type,
          location: { lat: 0, lng: 0 }, // Default since not provided in API
          walkingTime: "Unknown", // Default since not provided in API
          bookingAllowed: room.isActive,
          maxBookingHours: 4, // Default since not provided in API
          currentTemp: "22°C", // Default since not provided in API
          lightingLevel: "Bright", // Default since not provided in API
          cleaningStatus: "Clean", // Default since not provided in API
        }
      })

      setClassrooms(mappedRooms)
      setFilteredClassrooms(mappedRooms)
      setIsLoading(false)
      setLastUpdated(new Date())
    }
  }, [rooms, classSchedules])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // Refresh data from the store
      fetchRooms()
      fetchClassSchedules()
      setLastUpdated(new Date())
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, fetchRooms, fetchClassSchedules])

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

  const refreshData = () => {
    setIsLoading(true)
    Promise.all([fetchRooms(), fetchClassSchedules()]).then(() => {
      setLastUpdated(new Date())
      setIsLoading(false)
      toast({
        title: "Data Refreshed",
        description: "Room availability updated successfully.",
        status: "success",
        duration: 2000,
        isClosable: true,
      })
    }).catch(() => {
      setIsLoading(false)
      toast({
        title: "Refresh Failed",
        description: "Failed to update room data. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    })
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
                  {/* Dynamic building options based on actual data */}
                  {[...new Set(classrooms.map(room => room.building))].map(building => (
                    <option key={building} value={building}>{building}</option>
                  ))}
                </Select>

                <Select
                  placeholder="Min Capacity"
                  value={selectedCapacity}
                  onChange={(e) => setSelectedCapacity(e.target.value)}
                >
                  {/* Dynamic capacity options based on actual data */}
                  {[...new Set(classrooms.map(room => room.capacity))].sort((a, b) => a - b).map(capacity => (
                    <option key={capacity} value={capacity}>{capacity}+ people</option>
                  ))}
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
                          {classroom.building} • {classroom.floor}
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
                            Capacity: {classroom.capacity} people
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                          {classroom.type}
                        </Text>
                      </Flex>
                    </Box>

                    {/* Current/Next Class */}
                    <Box>
                      <HStack mb={1}>
                        <Icon as={Clock} size="16px" color="gray.500" />
                        <Text fontSize="sm" fontWeight="medium">
                          {classroom.availableUntil}
                        </Text>
                      </HStack>
                      {classroom.currentClass && (
                        <Text fontSize="xs" color="red.500" fontWeight="medium">
                          Currently: {classroom.currentClass.moduleId?.moduleName || 'Class in session'}
                        </Text>
                      )}
                      {classroom.nextClass && !classroom.currentClass && (
                        <Text fontSize="xs" color="blue.500">
                          Next: {classroom.nextClass.moduleId?.moduleName || 'Scheduled class'} at {formatTime(classroom.nextClass.startTime)}
                        </Text>
                      )}
                    </Box>

                    {/* Features */}
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Facilities:
                      </Text>
                      <Flex wrap="wrap" gap={1}>
                        {classroom.features && classroom.features.length > 0 ? (
                          <>
                            {classroom.features.slice(0, 3).map((feature, index) => (
                              <Badge key={index} variant="outline" fontSize="xs">
                                {feature.replace(/_/g, ' ').toUpperCase()}
                              </Badge>
                            ))}
                            {classroom.features.length > 3 && (
                              <Badge variant="outline" fontSize="xs" color="blue.500">
                                +{classroom.features.length - 3} more
                              </Badge>
                            )}
                          </>
                        ) : (
                          <Text fontSize="xs" color="gray.500">No facilities listed</Text>
                        )}
                      </Flex>
                    </Box>

                    {/* Room Number */}
                    <HStack justify="center">
                      <Icon as={MapPin} size="14px" color="gray.400" />
                      <Text fontSize="xs" color="gray.500">
                        Room Number: {classroom.name.replace('Room ', '')}
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
                    <Tab>Schedule</Tab>
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
                            <Text fontWeight="medium">{selectedClassroom.floor}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.500" mb={1}>
                              Type
                            </Text>
                            <Text fontWeight="medium">{selectedClassroom.type}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.500" mb={1}>
                              Room Number
                            </Text>
                            <Text fontWeight="medium">{selectedClassroom.name.replace('Room ', '')}</Text>
                          </Box>
                        </SimpleGrid>

                        <Divider />

                        {/* Capacity */}
                        <Box>
                          <Text fontSize="sm" color="gray.500" mb={2}>
                            Capacity
                          </Text>
                          <HStack justify="space-between" mb={2}>
                            <Text>
                              {selectedClassroom.capacity} people
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              Room Type: {selectedClassroom.type}
                            </Text>
                          </HStack>
                        </Box>

                        <Divider />

                        {/* Current Status */}
                        <Box>
                          <Text fontSize="sm" color="gray.500" mb={2}>
                            Current Status
                          </Text>
                          <VStack align="stretch" spacing={2}>
                            <HStack>
                              <Icon as={Clock} color={selectedClassroom.status === "available" ? "green.500" : "red.500"} />
                              <Text fontSize="sm">
                                Status: <strong>{selectedClassroom.status}</strong>
                              </Text>
                            </HStack>
                            {selectedClassroom.currentClass && (
                              <HStack>
                                <Icon as={BookOpen} color="red.500" />
                                <Text fontSize="sm">
                                  Current Class: {selectedClassroom.currentClass.moduleId?.moduleName || 'Class in session'}
                                </Text>
                              </HStack>
                            )}
                            {selectedClassroom.nextClass && !selectedClassroom.currentClass && (
                              <HStack>
                                <Icon as={Calendar} color="blue.500" />
                                <Text fontSize="sm">
                                  Next Class: {selectedClassroom.nextClass.moduleId?.moduleName || 'Scheduled class'} at {formatTime(selectedClassroom.nextClass.startTime)}
                                </Text>
                              </HStack>
                            )}
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
                        <HStack>
                          <Icon as={CalendarDays} color="blue.500" />
                          <Text fontSize="lg" fontWeight="medium">
                            Weekly Schedule
                          </Text>
                        </HStack>

                        {(() => {
                          const roomSchedules = getRoomSchedules(selectedClassroom.id, classSchedules);
                          const groupedSchedules = groupSchedulesByDay(roomSchedules);
                          const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

                          return (
                            <VStack align="stretch" spacing={4}>
                              {days.map(day => {
                                const daySchedules = groupedSchedules[day];
                                return (
                                  <Box key={day} border="1px" borderColor="gray.200" rounded="md" p={3}>
                                    <Text fontWeight="bold" mb={2} color="blue.600">
                                      {day}
                                    </Text>
                                    {daySchedules.length > 0 ? (
                                      <VStack align="stretch" spacing={2}>
                                        {daySchedules.map((schedule, index) => (
                                          <HStack key={index} justify="space-between" p={2} bg="gray.50" rounded="md">
                                            <VStack align="start" spacing={0}>
                                              <Text fontSize="sm" fontWeight="medium">
                                                {schedule.moduleId?.moduleName || 'Module'}
                                              </Text>
                                              <Text fontSize="xs" color="gray.600">
                                                {schedule.lecturerId?.firstName} {schedule.lecturerId?.lastName}
                                              </Text>
                                            </VStack>
                                            <VStack align="end" spacing={0}>
                                              <Text fontSize="sm" fontWeight="medium">
                                                {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                              </Text>
                                              <Badge
                                                size="sm"
                                                colorScheme={isTimeBetween(getCurrentTime(), schedule.startTime, schedule.endTime) ? "red" : "blue"}
                                              >
                                                {isTimeBetween(getCurrentTime(), schedule.startTime, schedule.endTime) ? "Now" : "Scheduled"}
                                              </Badge>
                                            </VStack>
                                          </HStack>
                                        ))}
                                      </VStack>
                                    ) : (
                                      <Text fontSize="sm" color="gray.500" fontStyle="italic">
                                        No classes scheduled
                                      </Text>
                                    )}
                                  </Box>
                                );
                              })}
                            </VStack>
                          );
                        })()}
                      </VStack>
                    </TabPanel>

                    <TabPanel>
                      <VStack align="stretch" spacing={4}>
                        <Text fontSize="lg" fontWeight="medium">
                          Available Facilities
                        </Text>
                        {selectedClassroom.features && selectedClassroom.features.length > 0 ? (
                          <SimpleGrid columns={2} spacing={3}>
                            {selectedClassroom.features.map((feature, index) => (
                              <HStack key={index}>
                                <Icon as={CheckCircle} color="green.500" size="16px" />
                                <Text fontSize="sm">{feature.replace(/_/g, ' ').toUpperCase()}</Text>
                              </HStack>
                            ))}
                          </SimpleGrid>
                        ) : (
                          <Text fontSize="sm" color="gray.500">No facilities listed for this room.</Text>
                        )}
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
