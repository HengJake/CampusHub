"use client"

// Transportation component with combined schedule functionality
// Schedules with the same ID are automatically combined to show all route timings in one card
// This reduces page clutter and provides a more organized view of transportation options

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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  Checkbox,
  useToast,
} from "@chakra-ui/react"
import { FiMapPin, FiClock, FiNavigation, FiAlertCircle, FiRefreshCw } from "react-icons/fi"
import { FaBus, FaCar } from "react-icons/fa"
import { useEffect, useState } from "react"
import { useTransportationStore } from "../../store/transportation.js"
import { CampusRideModal } from "../../component/student/CampusRideModal"
import { FaDirections } from "react-icons/fa";
import { useAuthStore } from "../../store/auth.js";

export default function Transportation() {
  const {
    busSchedules,
    routes,
    stops,
    eHailings,
    vehicles,
    loading,
    errors,
    fetchBusSchedulesBySchoolId,
    fetchRoutesBySchoolId,
    fetchEHailingsByStudentId,
    fetchVehiclesBySchoolId,
  } = useTransportationStore();

  const { getCurrentUser, initializeAuth } = useAuthStore()
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)


  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const { isOpen: isRideOpen, onOpen: onRideOpen, onClose: onRideClose } = useDisclosure()
  const toast = useToast()

  // Initialize authentication and wait for it to be ready
  useEffect(() => {
    const initAuth = async () => {
      try {
        await initializeAuth()
        const user = getCurrentUser()
        if (user?.user?.studentId || user?.user?.student._id) {
          setCurrentUser(user)
          setIsAuthReady(true)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      }
    }
    initAuth()
  }, [initializeAuth, getCurrentUser])

  // Fetch data only after authentication is ready
  useEffect(() => {
    if (isAuthReady && currentUser?.user?.student._id) {
      const studentId = currentUser.user.student._id
      fetchBusSchedulesBySchoolId()
      fetchRoutesBySchoolId()
      fetchEHailingsByStudentId(studentId)
      fetchVehiclesBySchoolId()
      // Stops are fetched when the CampusRideModal opens to avoid unnecessary API calls
    }
  }, [isAuthReady, currentUser, fetchBusSchedulesBySchoolId, fetchRoutesBySchoolId, fetchEHailingsByStudentId, fetchVehiclesBySchoolId])

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

  // Helper function to combine schedules with the same ID and merge their route timings
  const combineSchedulesById = (schedules) => {
    const combinedMap = new Map()

    schedules.forEach(schedule => {
      const key = schedule._id
      if (!combinedMap.has(key)) {
        // Create a new combined schedule object
        combinedMap.set(key, {
          ...schedule,
          routeTiming: [...(schedule.routeTiming || [])]
        })
      } else {
        // Merge route timings from schedules with the same ID
        const existing = combinedMap.get(key)
        if (schedule.routeTiming && schedule.routeTiming.length > 0) {
          existing.routeTiming.push(...schedule.routeTiming)
        }
      }
    })

    return Array.from(combinedMap.values())
  }

  // Helper function to get all route timings for a combined schedule
  const getAllRouteTimings = (schedule) => {
    if (!schedule.routeTiming || schedule.routeTiming.length === 0) {
      return []
    }

    // Group timings by route ID and collect all times for each route
    const routeTimingsMap = new Map()

    schedule.routeTiming.forEach(timing => {
      const routeId = timing.routeId?._id || timing.routeId
      const routeName = timing.routeId?.name || "Route"

      if (!routeTimingsMap.has(routeId)) {
        routeTimingsMap.set(routeId, {
          routeName: routeName,
          routeId: routeId,
          timings: []
        })
      }

      // Add this timing to the route's timings array
      const existing = routeTimingsMap.get(routeId)
      existing.timings.push({
        startTime: timing.startTime || "N/A",
        endTime: timing.endTime || "N/A"
      })
    })

    return Array.from(routeTimingsMap.values())
  }


  const isLoading = loading.busSchedules || loading.routes || loading.stops || loading.eHailings
  const hasErrors = errors.busSchedules || errors.routes || errors.stops || errors.eHailings
  const isDataLoading = !isAuthReady || isLoading

  // Show loading state while authentication is not ready
  if (!isAuthReady) {
    return (
      <Box minH="100vh" display="flex" justifyContent="center" alignItems="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.600">Initializing transportation services...</Text>
        </VStack>
      </Box>
    )
  }

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
                if (currentUser?.user?.studentId) {
                  const studentId = currentUser.user.studentId
                  fetchBusSchedulesByStudentId(studentId)
                  fetchRoutesByStudentId(studentId)
                  fetchStopsByStudentId(studentId)
                  fetchEHailingsByStudentId(studentId)
                  fetchVehiclesByStudentId(studentId)
                }
              }}
              isLoading={isLoading}
              isDisabled={!currentUser?.user?.studentId}
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

        <Grid templateColumns={{ base: "1fr", lg: "1fr 3fr" }} gap={6}>
          {/* E-Hailing Services */}
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <HStack mb={4}>
                <Icon as={FaCar} color="green.500" boxSize={5} />
                <Text fontSize="lg" fontWeight="semibold">
                  E-Hailing Requests
                </Text>
              </HStack>

              {isDataLoading ? (
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
                  {eHailings.filter(request => {
                    return request && request.routeId;
                  }).map((request) => {
                    return (
                      <Box key={request._id} p={3} bg="gray.50" borderRadius="md">
                        <VStack align="start" spacing={2}>
                          <HStack justify="space-between" w="full">
                            <Text fontSize="sm" fontWeight="medium">
                              {request.routeId?.name || getRouteName(request.routeId) || "Route"}
                            </Text>
                            <Badge colorScheme={getStatusColor(request.status)} variant="subtle">
                              {request.status || "Pending"}
                            </Badge>
                          </HStack>

                          <HStack spacing={2} align="center">
                            <Text fontSize="xs" color="gray.600">
                              {request.routeId?.stopIds?.[0]?.name || "Start"}
                            </Text>
                            <Icon as={FaDirections} boxSize={3} color="blue.500" />
                            <Text fontSize="xs" color="gray.600">
                              {request.routeId?.stopIds?.[1]?.name || "End"}
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
                              <Text fontSize="sm" color="gray.600">
                                Est. Time: {request.routeId.estimateTimeMinute || "N/A"} min
                              </Text>
                              <Text fontSize="sm" color="gray.600">
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

              {isDataLoading ? (
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
                <VStack spacing={4} align="stretch">
                  {Object.entries(groupSchedulesByDay(sortSchedulesByTime(combineSchedulesById(busSchedules)))).map(([day, daySchedules]) => {
                    return (
                      <Box key={day}>
                        <Text fontSize="lg" fontWeight="semibold" mb={3} color="blue.600" borderBottom="2px solid" borderColor="blue.200" pb={2}>
                          {day}
                        </Text>
                        <VStack spacing={2} align="stretch" >
                          {daySchedules.map((schedule, index) => {
                            const routeTimings = getAllRouteTimings(schedule)
                            return (
                              <Card
                                key={schedule._id}
                                bg={schedule.active ? "blue.50" : "gray.50"}
                                borderLeft="4px solid"
                                borderLeftColor={schedule.active ? "blue.500" : "gray.400"}
                                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                                transition="all 0.2s"
                              >
                                <CardBody p={3} >
                                  <VStack spacing={3} align="stretch">
                                    {/* Schedule Header */}
                                    <HStack justify="space-between" align="center">
                                      <HStack spacing={3}>
                                        <Box
                                          w="12px"
                                          h="12px"
                                          borderRadius="full"
                                          bg={schedule.active ? "blue.500" : "gray.400"}
                                        />
                                        <VStack spacing={0} align="start">
                                          <Text fontSize="md" fontWeight="bold" color="gray.800">
                                            Bus Schedule
                                          </Text>
                                          {schedule.routeTiming && schedule.routeTiming.length > 1 && (
                                            <Text fontSize="xs" color="gray.500">
                                              {getAllRouteTimings(schedule).length} routes combined
                                            </Text>
                                          )}
                                        </VStack>
                                      </HStack>
                                      <Badge
                                        colorScheme={getStatusColor(schedule.active ? "active" : "inactive")}
                                        variant="subtle"
                                        size="sm"
                                      >
                                        {schedule.active ? "Active" : "Inactive"}
                                      </Badge>
                                    </HStack>

                                    {/* Route Timings */}
                                    {routeTimings.length > 0 ? (
                                      <VStack spacing={2} align="stretch">
                                        {routeTimings.map((route, routeIndex) => (
                                          <Box
                                            key={routeIndex}
                                            p={2}
                                            bg="white"
                                            borderRadius="md"
                                            border="1px solid"
                                            borderColor="blue.200"
                                          >
                                            <HStack justify="space-between" align="center" mb={2}>
                                              <Text fontSize="sm" fontWeight="semibold" color="blue.700">
                                                {route.routeName}
                                              </Text>
                                              <Badge colorScheme="blue" variant="outline" size="sm">
                                                Route {routeIndex + 1}
                                              </Badge>
                                            </HStack>

                                            {/* All timings for this route */}
                                            <VStack spacing={1} align="stretch">
                                              {route.timings.map((timing, timingIndex) => (
                                                <HStack key={timingIndex} spacing={2} justify="center" p={1} bg="blue.50" borderRadius="sm">
                                                  <VStack spacing={0} align="center" minW="60px">
                                                    <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                                      Departure
                                                    </Text>
                                                    <Text fontSize="sm" fontWeight="bold" color="blue.600">
                                                      {timing.startTime}
                                                    </Text>
                                                  </VStack>

                                                  <Box
                                                    w="16px"
                                                    h="2px"
                                                    bg="blue.300"
                                                    position="relative"
                                                  >
                                                    <Icon
                                                      as={FaDirections}
                                                      position="absolute"
                                                      top="-6px"
                                                      left="50%"
                                                      transform="translateX(-50%)"
                                                      color="blue.500"
                                                      boxSize={3}
                                                    />
                                                  </Box>

                                                  <VStack spacing={0} align="center" minW="60px">
                                                    <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                                      Arrival
                                                    </Text>
                                                    <Text fontSize="sm" fontWeight="bold" color="green.600">
                                                      {timing.endTime}
                                                    </Text>
                                                  </VStack>
                                                </HStack>
                                              ))}
                                            </VStack>
                                          </Box>
                                        ))}
                                      </VStack>
                                    ) : (
                                      <Box p={3} bg="gray.100" borderRadius="md" textAlign="center">
                                        <Text fontSize="sm" color="gray.600">
                                          No timing information available
                                        </Text>
                                      </Box>
                                    )}

                                    {/* Additional Info */}
                                    <HStack spacing={4} justify="space-between" fontSize="xs" color="gray.600">
                                      <Text>
                                        Vehicle: {getVehicleInfo(schedule.vehicleId)}
                                      </Text>
                                      <Text>
                                        Valid: {schedule.startDate ? new Date(schedule.startDate).toLocaleDateString() : "N/A"} - {schedule.endDate ? new Date(schedule.endDate).toLocaleDateString() : "N/A"}
                                      </Text>
                                    </HStack>
                                  </VStack>
                                </CardBody>
                              </Card>
                            )
                          })}
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
        </Grid>

        {/* Routes and Stops Section */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
          {/* Routes */}
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Text fontSize="lg" fontWeight="semibold" mb={4}>
                Available Routes
              </Text>

              {isDataLoading ? (
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
                  {routes.filter(route => route && route.stopIds).slice(0, 5).map((route) => {
                    return (
                      <Box key={route._id} p={3} bg="gray.50" borderRadius="md">
                        <VStack align="start" spacing={2}>
                          <Text fontSize="sm" fontWeight="medium">
                            {route.name || route.routeName || "Unnamed Route"}
                          </Text>
                          <HStack spacing={2} align="center">
                            <Text fontSize="xs" color="gray.600">
                              {route.stopIds?.[0]?.name || "Start"}
                            </Text>
                            <Icon as={FaDirections} boxSize={3} color="blue.500" />
                            <Text fontSize="xs" color="gray.600">
                              {route.stopIds?.[1]?.name || "End"}
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
