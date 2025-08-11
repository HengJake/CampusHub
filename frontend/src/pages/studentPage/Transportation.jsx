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
    fetchBusSchedules,
    fetchRoutes,
    fetchStops,
    fetchEHailings,
  } = useTransportationStore();

  console.log("🚀 ~ Transportation ~ busSchedules:", busSchedules)
  console.log("🚀 ~ Transportation ~ eHailings:", eHailings)

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const { isOpen: isRideOpen, onOpen: onRideOpen, onClose: onRideClose } = useDisclosure()

  // Fetch data on component mount
  useEffect(() => {
    fetchBusSchedules()
    fetchRoutes()
    fetchStops()
    fetchEHailings()
  }, [fetchBusSchedules, fetchRoutes, fetchStops, fetchEHailings])

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
      return routeId.name || "Route"
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

  // Helper function to sort schedules by departure time
  const sortSchedulesByTime = (schedules) => {
    return [...schedules].sort((a, b) => {
      const timeA = new Date(a.departureTime || 0)
      const timeB = new Date(b.departureTime || 0)
      return timeA - timeB
    })
  }

  // Helper function to group schedules by day
  const groupSchedulesByDay = (schedules) => {
    const grouped = {}
    schedules.forEach(schedule => {
      const dayNumber = schedule.dayActive
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
                fetchBusSchedules()
                fetchRoutes()
                fetchStops()
                fetchEHailings()
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
                <Badge colorScheme="green" variant="subtle">
                  <HStack spacing={1}>
                    <Icon as={FiClock} boxSize={3} />
                    <Text fontSize="xs">Pre-set Updates</Text>
                  </HStack>
                </Badge>
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
                  {Object.entries(groupSchedulesByDay(sortSchedulesByTime(busSchedules))).map(([day, daySchedules]) => (
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
                                <Flex justify="space-between" align="start" mb={3}>
                                  <VStack align="start" spacing={1}>
                                    <Text fontWeight="bold" fontSize="md" color="gray.800">
                                      {getRouteName(schedule.routeId)}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                      {getVehicleInfo(schedule.vehicleId)}
                                    </Text>
                                  </VStack>
                                  <Badge
                                    colorScheme={getStatusColor(schedule.active ? "active" : "inactive")}
                                    variant="subtle"
                                    size="sm"
                                  >
                                    {schedule.active ? "Active" : "Inactive"}
                                  </Badge>
                                </Flex>

                                <HStack spacing={6} mt={3}>
                                  <VStack align="start" spacing={1}>
                                    <HStack spacing={1}>
                                      <Icon as={FiClock} boxSize={3} color="blue.500" />
                                      <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                        Departure
                                      </Text>
                                    </HStack>
                                    <Text fontWeight="bold" color="blue.600" fontSize="lg">
                                      {formatTime(schedule.departureTime)}
                                    </Text>
                                  </VStack>

                                  <Divider orientation="vertical" height="40px" />

                                  <VStack align="start" spacing={1}>
                                    <HStack spacing={1}>
                                      <Icon as={FiMapPin} boxSize={3} color="green.500" />
                                      <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                        Arrival
                                      </Text>
                                    </HStack>
                                    <Text fontWeight="bold" color="green.600" fontSize="lg">
                                      {formatTime(schedule.arrivalTime)}
                                    </Text>
                                  </VStack>
                                </HStack>
                              </CardBody>
                            </Card>
                          </Flex>
                        ))}
                      </VStack>
                    </Box>
                  ))}
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
                    console.log("🚀 ~ request:", request)
                    return(
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
                  )})}
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
                    console.log("🚀 ~ route:", route)

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
                Bus Stops
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
                  {stops.slice(0, 5).map((stop) => (
                    <Box key={stop._id} p={3} bg="gray.50" borderRadius="md">
                      <VStack align="start" spacing={2}>
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
