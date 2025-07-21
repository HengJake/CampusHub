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
} from "@chakra-ui/react"
import { FiMapPin, FiClock, FiNavigation, FiAlertCircle } from "react-icons/fi"
import { FaBus } from "react-icons/fa";
import { useStudentStore } from "../../store/TBI/studentStore.js"
import { CampusRideModal } from "../../component/student/CampusRideModal"

export default function Transportation() {
  const { shuttleSchedule, campusRideRequests } = useStudentStore()

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const { isOpen: isRideOpen, onOpen: onRideOpen, onClose: onRideClose } = useDisclosure()

  const getStatusColor = (status) => {
    switch (status) {
      case "on-time":
        return "green"
      case "delayed":
        return "red"
      case "pending":
        return "yellow"
      case "completed":
        return "green"
      case "cancelled":
        return "red"
      default:
        return "gray"
    }
  }

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
              Transportation Services
            </Text>
            <Text color="gray.600">Campus shuttle schedules and ride booking</Text>
          </Box>
          <Button leftIcon={<FiNavigation />} colorScheme="blue" onClick={onRideOpen}>
            Request Campus Ride
          </Button>
        </HStack>

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
          {/* Shuttle Schedule */}
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <HStack justify="space-between" mb={4}>
                <HStack>
                  <Icon as={FaBus} color="blue.500" boxSize={5} />
                  <Text fontSize="lg" fontWeight="semibold">
                    Live Shuttle Schedule
                  </Text>
                </HStack>
                <Badge colorScheme="green" variant="subtle">
                  <HStack spacing={1}>
                    <Icon as={FiClock} boxSize={3} />
                    <Text fontSize="xs">Live Updates</Text>
                  </HStack>
                </Badge>
              </HStack>

              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Route</Th>
                      <Th>Next Arrival</Th>
                      <Th>Frequency</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {shuttleSchedule.map((shuttle) => (
                      <Tr key={shuttle.id}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">{shuttle.route}</Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Text fontWeight="bold" color="blue.600">
                            {shuttle.nextArrival}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.600">
                            Every {shuttle.frequency}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(shuttle.status)} variant="subtle">
                            {shuttle.status}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              <Box mt={4} p={4} bg="blue.50" borderRadius="md">
                <HStack>
                  <Icon as={FiAlertCircle} color="blue.500" />
                  <Text fontSize="sm" color="blue.700">
                    Shuttle times are updated in real-time. Allow 2-3 minutes buffer time for boarding.
                  </Text>
                </HStack>
              </Box>
            </CardBody>
          </Card>

          {/* Campus Ride Requests */}
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Text fontSize="lg" fontWeight="semibold" mb={4}>
                My Ride Requests
              </Text>
              <VStack spacing={3} align="stretch">
                {campusRideRequests.length === 0 ? (
                  <Box textAlign="center" py={8}>
                    <Icon as={FiNavigation} boxSize={8} color="gray.400" mb={2} />
                    <Text color="gray.500" fontSize="sm">
                      No ride requests yet
                    </Text>
                    <Button size="sm" mt={2} colorScheme="blue" onClick={onRideOpen}>
                      Request Your First Ride
                    </Button>
                  </Box>
                ) : (
                  campusRideRequests.map((request) => (
                    <Box key={request.id} p={3} bg="gray.50" borderRadius="md">
                      <VStack align="start" spacing={2}>
                        <HStack justify="space-between" w="full">
                          <Text fontSize="sm" fontWeight="medium">
                            {request.from} → {request.to}
                          </Text>
                          <Badge colorScheme={getStatusColor(request.status)} variant="subtle">
                            {request.status}
                          </Badge>
                        </HStack>
                        <Text fontSize="xs" color="gray.600">
                          Requested: {new Date(request.requestTime).toLocaleString()}
                        </Text>
                        {request.status === "pending" && (
                          <Progress size="xs" isIndeterminate colorScheme="blue" w="full" />
                        )}
                      </VStack>
                    </Box>
                  ))
                )}
              </VStack>
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
                <Text color="gray.500" textAlign="center">
                  Interactive campus map with live shuttle locations
                  <br />
                  <Text fontSize="sm">(Map integration would be implemented here)</Text>
                </Text>
              </VStack>
            </Box>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" cursor="pointer" _hover={{ bg: "gray.50" }}>
            <CardBody textAlign="center">
              <Icon as={FaBus} boxSize={8} color="blue.500" mb={2} />
              <Text fontWeight="medium" mb={1}>
                Track Shuttle
              </Text>
              <Text fontSize="sm" color="gray.600">
                Real-time shuttle locations
              </Text>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" cursor="pointer" _hover={{ bg: "gray.50" }}>
            <CardBody textAlign="center">
              <Icon as={FiClock} boxSize={8} color="green.500" mb={2} />
              <Text fontWeight="medium" mb={1}>
                Schedule Alerts
              </Text>
              <Text fontSize="sm" color="gray.600">
                Get notified of delays
              </Text>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" cursor="pointer" _hover={{ bg: "gray.50" }}>
            <CardBody textAlign="center">
              <Icon as={FiMapPin} boxSize={8} color="purple.500" mb={2} />
              <Text fontWeight="medium" mb={1}>
                Find Stops
              </Text>
              <Text fontSize="sm" color="gray.600">
                Locate nearest bus stops
              </Text>
            </CardBody>
          </Card>
        </Grid>
      </VStack>

      {/* Campus Ride Modal */}
      <CampusRideModal isOpen={isRideOpen} onClose={onRideClose} />
    </Box>
  )
}
