"use client"

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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Icon,
  useColorModeValue,
  Progress,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Divider,
  Image,
} from "@chakra-ui/react"
import { FiMapPin, FiClock, FiNavigation, FiAlertCircle, FiRefreshCw } from "react-icons/fi"
import { FaBus, FaCar } from "react-icons/fa"
import { useEffect } from "react"
import { useTransportationStore } from "../../store/transportation.js"
import { CampusRideModal } from "../../component/student/CampusRideModal"
import { FaDirections } from "react-icons/fa";

export default function Transportation() {
  const {
    busSchedules,
    routes,
    stops,
    eHailings,
    loading,
    errors,
    fetchBusSchedulesBySchoolId,
    fetchRoutesBySchoolId,
    fetchStopsBySchoolId,
    fetchEHailingsBySchoolId,
  } = useTransportationStore();


  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const { isOpen: isRideOpen, onOpen: onRideOpen, onClose: onRideClose } = useDisclosure()

  // Fetch data on component mount
  useEffect(() => {
    fetchBusSchedulesBySchoolId()
    fetchRoutesBySchoolId()
    fetchStopsBySchoolId()
    fetchEHailingsBySchoolId()
  }, [fetchBusSchedulesBySchoolId, fetchRoutesBySchoolId, fetchStopsBySchoolId, fetchEHailingsBySchoolId])

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "on-time":
      case "active":
      case "available":
        return "green"
      case "delayed":
      case "inactive":
      case "unavailable":
        return "red"
      case "pending":
      case "maintenance":
        return "yellow"
      case "completed":
        return "green"
      case "cancelled":
        return "red"
      case "waiting":
        return "orange"
      default:
        return "gray"
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return "N/A"
    try {
      const date = new Date(timeString)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return timeString
    }
  }

  // Helper function to extract route name from routeId
  const getRouteName = (routeId) => {
    if (!routeId) return "N/A"

    // Handle array of routes
    if (Array.isArray(routeId)) {
      return routeId.length > 0 ? routeId[0].name || "Route" : "N/A"
    }

    // Handle single route object
    if (typeof routeId === 'object') {
      return routeId.name || routeId.routeName || "Route"
    }

    return "N/A"
  }

  // Helper function to extract vehicle info from vehicleId
  const getVehicleInfo = (vehicleId) => {
    if (!vehicleId) return "N/A"

    if (typeof vehicleId === 'object') {
      return `${vehicleId.plateNumber || "N/A"} (${vehicleId.type || "vehicle"})`
    }

    return vehicleId
  }

  // Helper function to get route timing info
  const getRouteTimingInfo = (schedule) => {
    if (!schedule.routeTiming || schedule.routeTiming.length === 0) {
      return { startTime: "N/A", endTime: "N/A" }
    }

    const timing = schedule.routeTiming[0]
    return {
      startTime: timing.startTime || "N/A",
      endTime: timing.endTime || "N/A"
    }
  }

  // Helper function to get student info from studentId
  const getStudentInfo = (studentId) => {
    if (!studentId) return "N/A"

    if (typeof studentId === 'object') {
      return `Student ID: ${studentId._id || "N/A"}`
    }

    return studentId
  }

  // Helper function to convert day number to day name
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

  // Helper function to sort schedules by start time
  const sortSchedulesByTime = (schedules) => {
    return [...schedules].sort((a, b) => {
      const timeA = a.routeTiming?.[0]?.startTime || "00:00"
      const timeB = b.routeTiming?.[0]?.startTime || "00:00"
      return timeA.localeCompare(timeB)
    })
  }

  // Helper function to group schedules by day
  const groupSchedulesByDay = (schedules) => {
    const grouped = {}
    schedules.forEach(schedule => {
      const dayNumber = schedule.dayOfWeek
      const dayName = dayNumber ? getDayName(dayNumber) : 'Daily'
      if (!grouped[dayName]) {
        grouped[dayName] = []
      }
      grouped[dayName].push(schedule)
    })
    return grouped
  }

  const isLoading = loading.busSchedules || loading.routes || loading.stops || loading.eHailings
  const hasErrors = errors.busSchedules || errors.routes || errors.stops || errors.eHailings

  return (
    <Box minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
              Transportation Services
            </Text>
            <Text color="gray.600">Campus shuttle schedules and ride booking</Text>
          </Box>
          <HStack spacing={2}>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              size="sm"
              onClick={() => {
                fetchBusSchedulesBySchoolId()
                fetchRoutesBySchoolId()
                fetchStopsBySchoolId()
                fetchEHailingsBySchoolId()
              }}
              isLoading={isLoading}
            >
              Refresh
            </Button>
            <Button leftIcon={<FiNavigation />} colorScheme="blue" onClick={onRideOpen}>
              Request Campus Ride
            </Button>
          </HStack>
        </HStack>

        {/* Error Display */}
        {hasErrors && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Error loading transportation data</AlertTitle>
              <AlertDescription>
                {errors.busSchedules || errors.routes || errors.stops || errors.eHailings}
              </AlertDescription>
            </Box>
          </Alert>
        )}

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
          {/* Bus Schedule */}
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <HStack justify="space-between" mb={4}>
                <HStack>
                  <Icon as={FaBus} color="blue.500" boxSize={5} />
                  <Text fontSize="lg" fontWeight="semibold">
                    Bus Schedule
                  </Text>
                </HStack>
              </HStack>

              {loading.busSchedules ? (
                <Box textAlign="center" py={8}>
                  <Spinner size="lg" color="blue.500" />
                  <Text mt={2} color="gray.600">Loading bus schedules...</Text>
                </Box>
              ) : busSchedules.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Icon as={FaBus} boxSize={8} color="gray.400" mb={2} />
                  <Text color="gray.500">No bus schedules available</Text>
                </Box>
              ) : (
                <VStack spacing={6} align="stretch">
                  {Object.entries(groupSchedulesByDay(sortSchedulesByTime(busSchedules))).map(([day, daySchedules]) => {
                    console.log("🚀 ~ busSchedules:", busSchedules)

                    return (
                      <Box key={day}>
                        <Text fontSize="lg" fontWeight="semibold" mb={4} color="blue.600">
                          {day}
                        </Text>
                        <VStack spacing={4} align="stretch">
                          {daySchedules.map((schedule, index) => (
                            <Flex key={schedule._id} position="relative">
                              {/* Timeline line */}
                              <Box
                                position="absolute"
                                left="20px"
                                top="40px"
                                bottom="-20px"
                                width="2px"
                                bg={index === daySchedules.length - 1 ? "transparent" : "gray.200"}
                              />

                              {/* Timeline dot */}
                              <Box
                                position="absolute"
                                left="16px"
                                top="32px"
                                width="10px"
                                height="10px"
                                borderRadius="full"
                                bg={schedule.active ? "blue.500" : "gray.400"}
                                border="2px solid white"
                                boxShadow="0 0 0 2px blue.100"
                              />

                              {/* Schedule card */}
                              <Card
                                ml="50px"
                                flex="1"
                                bg={schedule.active ? "blue.50" : "gray.50"}
                                borderLeft="4px solid"
                                borderLeftColor={schedule.active ? "blue.500" : "gray.400"}
                                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                                transition="all 0.2s"
                              >
                                <CardBody p={4}>
                                  <Grid templateColumns="1fr 2fr" gap={6}>
                                    {/* Left Side - Timing Information */}
                                    <VStack align="start" spacing={4}>
                                      {/* Time Display */}
                                      <Box textAlign="center" w="full">
                                        <VStack spacing={2}>
                                          <Box
                                            p={3}
                                            bg="blue.100"
                                            borderRadius="lg"
                                            border="2px solid"
                                            borderColor="blue.200"
                                          >
                                            <Text fontSize="xs" color="blue.700" fontWeight="medium" mb={1}>
                                              Start Time
                                            </Text>
                                            <Text fontSize="2xl" fontWeight="bold" color="blue.800">
                                              {getRouteTimingInfo(schedule).startTime}
                                            </Text>
                                          </Box>

                                          <Box
                                            p={3}
                                            bg="green.100"
                                            borderRadius="lg"
                                            border="2px solid"
                                            borderColor="green.200"
                                          >
                                            <Text fontSize="xs" color="green.700" fontWeight="medium" mb={1}>
                                              End Time
                                            </Text>
                                            <Text fontSize="2xl" fontWeight="bold" color="green.800">
                                              {getRouteTimingInfo(schedule).endTime}
                                            </Text>
                                          </Box>
                                        </VStack>
                                      </Box>

                                      {/* Date Information */}
                                      <Box w="full">
                                        <VStack spacing={2} align="start">
                                          <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                            Schedule Period
                                          </Text>
                                          <Box p={2} bg="gray.100" borderRadius="md" w="full">
                                            <Text fontSize="xs" color="gray.700">
                                              From: {schedule.startDate ? new Date(schedule.startDate).toLocaleDateString() : "N/A"}
                                            </Text>
                                            <Text fontSize="xs" color="gray.700">
                                              To: {schedule.endDate ? new Date(schedule.endDate).toLocaleDateString() : "N/A"}
                                            </Text>
                                          </Box>
                                        </VStack>
                                      </Box>

                                      {/* Vehicle Info */}
                                      <Box w="full">
                                        <VStack spacing={2} align="start">
                                          <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                            Vehicle
                                          </Text>
                                          <Box p={2} bg="purple.100" borderRadius="md" w="full">
                                            <Text fontSize="xs" color="purple.700" fontWeight="medium">
                                              {getVehicleInfo(schedule.vehicleId)}
                                            </Text>
                                          </Box>
                                        </VStack>
                                      </Box>
                                    </VStack>

                                    {/* Right Side - Route Information */}
                                    <VStack align="start" spacing={4} w="full">
                                      {/* Route Header */}
                                      <Flex justify="space-between" align="center" w="full">
                                        <VStack align="start" spacing={1}>
                                          <Text fontSize="lg" fontWeight="bold" color="gray.800">
                                            {schedule.routeId?.name || "Route Name"}
                                          </Text>
                                          <Text fontSize="sm" color="gray.600">
                                            {schedule.routeId?.description || "Route description"}
                                          </Text>
                                        </VStack>

                                        <Badge
                                          colorScheme={getStatusColor(schedule.active ? "active" : "inactive")}
                                          variant="subtle"
                                          size="lg"
                                          px={3}
                                          py={2}
                                        >
                                          {schedule.active ? "Active" : "Inactive"}
                                        </Badge>
                                      </Flex>

                                      {/* Route Details with Hover Effects */}
                                      <Grid templateColumns="1fr 1fr" gap={4} w="full">
                                        {/* Route Info */}
                                        <VStack align="start" spacing={3}>
                                          <Box p={3} bg="orange.50" borderRadius="md" w="full">
                                            <Text fontSize="xs" color="orange.700" fontWeight="medium" mb={1}>
                                              Estimated Time
                                            </Text>
                                            <Text fontSize="md" fontWeight="bold" color="orange.800">
                                              {schedule.routeId?.estimateTimeMinute || "N/A"} min
                                            </Text>
                                          </Box>

                                          <Box p={3} bg="teal.50" borderRadius="md" w="full">
                                            <Text fontSize="xs" color="teal.700" fontWeight="medium" mb={1}>
                                              Fare
                                            </Text>
                                            <Text fontSize="md" fontWeight="bold" color="teal.800">
                                              ${schedule.routeId?.fare || "N/A"}
                                            </Text>
                                          </Box>
                                        </VStack>

                                        {/* Stops Information */}
                                        <Box w="full">
                                          <VStack spacing={3} align="start">
                                            <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                              Route Stops
                                            </Text>

                                            {schedule.routeId?.stopIds && schedule.routeId.stopIds.length > 0 ? (
                                              <VStack spacing={2} align="start" w="full">
                                                {schedule.routeId.stopIds.map((stop, stopIndex) => (
                                                  <Box
                                                    key={stop._id || stopIndex}
                                                    p={2}
                                                    bg="blue.50"
                                                    borderRadius="md"
                                                    w="full"
                                                    position="relative"
                                                    _hover={{
                                                      bg: "blue.100",
                                                      transform: "scale(1.02)",
                                                      boxShadow: "md"
                                                    }}
                                                    transition="all 0.2s"
                                                    cursor="pointer"
                                                    group
                                                  >
                                                    <Text fontSize="xs" color="blue.700" fontWeight="medium">
                                                      Stop {stopIndex + 1}
                                                    </Text>
                                                    <Text fontSize="sm" color="blue.800" fontWeight="semibold">
                                                      {stop.name || stop.stopName || "Stop Name"}
                                                    </Text>

                                                    {/* Hover Tooltip for Stop Details */}
                                                    <Box
                                                      position="absolute"
                                                      bottom="100%"
                                                      left="50%"
                                                      transform="translateX(-50%)"
                                                      mb={2}
                                                      p={3}
                                                      bg="gray.800"
                                                      color="white"
                                                      borderRadius="md"
                                                      fontSize="xs"
                                                      opacity={0}
                                                      visibility="hidden"
                                                      _groupHover={{
                                                        opacity: 1,
                                                        visibility: "visible"
                                                      }}
                                                      transition="all 0.2s"
                                                      zIndex={10}
                                                      w="max-content"
                                                      maxW="200px"
                                                      textAlign="center"
                                                      boxShadow="lg"
                                                    >
                                                      <Text fontWeight="bold" mb={1}>
                                                        {stop.name || stop.stopName}
                                                      </Text>
                                                      <Text>
                                                        {stop.location || stop.address || "Location not specified"}
                                                      </Text>
                                                      {stop.facilities && stop.facilities.length > 0 && (
                                                        <Text mt={1} color="blue.200">
                                                          Facilities: {stop.facilities.join(", ")}
                                                        </Text>
                                                      )}
                                                      <Box
                                                        position="absolute"
                                                        top="100%"
                                                        left="50%"
                                                        transform="translateX(-50%)"
                                                        border="4px solid transparent"
                                                        borderTopColor="gray.800"
                                                      />
                                                    </Box>
                                                  </Box>
                                                ))}
                                              </VStack>
                                            ) : (
                                              <Box p={3} bg="gray.100" borderRadius="md" w="full">
                                                <Text fontSize="xs" color="gray.600">
                                                  No stops information available
                                                </Text>
                                              </Box>
                                            )}
                                          </VStack>
                                        </Box>
                                      </Grid>
                                    </VStack>
                                  </Grid>
                                </CardBody>
                              </Card>
                            </Flex>
                          ))}
                        </VStack>
                      </Box>
                    )
                  })}
                </VStack>
              )}

              <Box mt={4} p={4} bg="blue.50" borderRadius="md">
                <HStack>
                  <Icon as={FiAlertCircle} color="blue.500" />
                  <Text fontSize="sm" color="blue.700">
                    Bus times are updated in real-time. Allow 2-3 minutes buffer time for boarding.
                  </Text>
                </HStack>
              </Box>
            </CardBody>
          </Card>

          {/* E-Hailing Services */}
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <HStack mb={4}>
                <Icon as={FaCar} color="green.500" boxSize={5} />
                <Text fontSize="lg" fontWeight="semibold">
                  E-Hailing Requests
                </Text>
              </HStack>

              {loading.eHailings ? (
                <Box textAlign="center" py={8}>
                  <Spinner size="lg" color="green.500" />
                  <Text mt={2} color="gray.600">Loading e-hailing requests...</Text>
                </Box>
              ) : eHailings.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Icon as={FaCar} boxSize={8} color="gray.400" mb={2} />
                  <Text color="gray.500" fontSize="sm">
                    No e-hailing requests available
                  </Text>
                </Box>
              ) : (
                <VStack spacing={3} align="stretch">
                  {eHailings.map((request) => {
                    return (
                      <Box key={request._id} p={3} bg="gray.50" borderRadius="md">
                        <VStack align="start" spacing={2}>
                          <HStack justify="space-between" w="full">
                            <Text fontSize="sm" fontWeight="medium">
                              {getRouteName(request.routeId)}
                            </Text>
                            <Badge colorScheme={getStatusColor(request.status)} variant="subtle">
                              {request.status || "Pending"}
                            </Badge>
                          </HStack>

                          <HStack spacing={2} align="center">
                            <Text fontSize="xs" color="gray.600">
                              {request.routeId.stopIds[0]?.name || "Start"}
                            </Text>
                            <Icon as={FaDirections} boxSize={3} color="blue.500" />
                            <Text fontSize="xs" color="gray.600">
                              {request.routeId.stopIds[1]?.name || "End"}
                            </Text>
                          </HStack>

                          <Text fontSize="xs" color="gray.600">
                            Vehicle: {getVehicleInfo(request.vehicleId)}
                          </Text>

                          <Text fontSize="xs" color="gray.600">
                            Requested: {formatTime(request.requestAt)}
                          </Text>

                          {request.routeId && typeof request.routeId === 'object' && (
                            <VStack align="start" spacing={1}>
                              <Text fontSize="xs" color="gray.600">
                                Est. Time: {request.routeId.estimateTimeMinute || "N/A"} min
                              </Text>
                              <Text fontSize="xs" color="gray.600">
                                Fare: ${request.routeId.fare || "N/A"}
                              </Text>
                            </VStack>
                          )}
                        </VStack>
                      </Box>
                    )
                  })}
                </VStack>
              )}
            </CardBody>
          </Card>
        </Grid>

        {/* Routes and Stops Section */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
          {/* Routes */}
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Text fontSize="lg" fontWeight="semibold" mb={4}>
                Available Routes
              </Text>

              {loading.routes ? (
                <Box textAlign="center" py={8}>
                  <Spinner size="lg" color="purple.500" />
                  <Text mt={2} color="gray.600">Loading routes...</Text>
                </Box>
              ) : routes.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Icon as={FiMapPin} boxSize={8} color="gray.400" mb={2} />
                  <Text color="gray.500">No routes available</Text>
                </Box>
              ) : (
                <VStack spacing={3} align="stretch">
                  {routes.slice(0, 5).map((route) => {
                    return (
                      <Box key={route._id} p={3} bg="gray.50" borderRadius="md">
                        <VStack align="start" spacing={2}>
                          <Text fontSize="sm" fontWeight="medium">
                            {route.name || route.routeName}
                          </Text>
                          <HStack spacing={2} align="center">
                            <Text fontSize="xs" color="gray.600">
                              {route.stopIds[0]?.name || "Start"}
                            </Text>
                            <Icon as={FaDirections} boxSize={3} color="blue.500" />
                            <Text fontSize="xs" color="gray.600">
                              {route.stopIds[1]?.name || "End"}
                            </Text>
                          </HStack>
                          <Text fontSize="xs" color="gray.600">
                            Est. Time: {route.estimateTimeMinute || "N/A"} min
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            Fare: ${route.fare || "N/A"}
                          </Text>
                          {route.stopIds && (
                            <Text fontSize="xs" color="gray.600">
                              Stops: {route.stopIds.length || 0}
                            </Text>
                          )}
                          <Badge colorScheme="green" variant="subtle" size="sm">
                            Active
                          </Badge>
                        </VStack>
                      </Box>
                    )
                  })}
                </VStack>
              )}
            </CardBody>
          </Card>

          {/* Stops */}
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Text fontSize="lg" fontWeight="semibold" mb={4}>
                Location on Campus
              </Text>

              {loading.stops ? (
                <Box textAlign="center" py={8}>
                  <Spinner size="lg" color="orange.500" />
                  <Text mt={2} color="gray.600">Loading stops...</Text>
                </Box>
              ) : stops.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Icon as={FiMapPin} boxSize={8} color="gray.400" mb={2} />
                  <Text color="gray.500">No stops available</Text>
                </Box>
              ) : (
                <VStack spacing={3} align="stretch">
                  {stops.map((stop) => (
                    <Box key={stop._id} p={3} bg="gray.50" borderRadius="md">
                      <HStack spacing={3} align="start">


                        {stop.image ? (
                          <Image
                            src={stop.image}
                            alt={`${stop.name || stop.stopName} stop`}
                            boxSize="80px"
                            objectFit="cover"
                            borderRadius="md"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/80?text=Image+Not+Available";
                            }}
                          />
                        ) : (
                          <Box
                            boxSize="80px"
                            bg="gray.100"
                            borderRadius="md"
                            border="2px dashed"
                            borderColor="gray.300"
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            _hover={{
                              bg: "gray.150",
                              borderColor: "gray.400"
                            }}
                            transition="all 0.2s ease-in-out"
                          >
                            <Icon as={FiMapPin} boxSize={5} color="gray.400" mb={1} />
                            <Text fontSize="xs" color="gray.500" fontWeight="medium" textAlign="center">
                              No Image
                            </Text>
                          </Box>
                        )}
                        <VStack align="start" spacing={2} flex={1}>
                          <Text fontSize="sm" fontWeight="medium">
                            {stop.name || stop.stopName}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            {stop.location || stop.address}
                          </Text>
                          {stop.facilities && (
                            <Text fontSize="xs" color="gray.600">
                              Facilities: {stop.facilities.join(", ")}
                            </Text>
                          )}
                          <Badge colorScheme="green" variant="subtle" size="sm">
                            Active
                          </Badge>
                        </VStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              )}
            </CardBody>
          </Card>
        </Grid>

        {/* Route Map Section */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              Campus Route Map
            </Text>
            <Box h="400px" bg="gray.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
              <VStack spacing={3}>
                <Icon as={FiMapPin} boxSize={12} color="gray.400" />
                <VStack spacing={1}>
                  <Text color="gray.500" textAlign="center">
                    Interactive campus map with live shuttle locations
                  </Text>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    (Map integration would be implemented here)
                  </Text>
                </VStack>
              </VStack>
            </Box>
          </CardBody>
        </Card>

      </VStack>

      {/* Campus Ride Modal */}
      <CampusRideModal isOpen={isRideOpen} onClose={onRideClose} />
    </Box>
  )
}
