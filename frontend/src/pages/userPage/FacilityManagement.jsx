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
  Progress,
  Icon,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react"
import { FiMapPin, FiLock, FiActivity, FiBook, FiSearch, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi"
import { useStudentStore } from "../../store/TBI/studentStore.js"
import { BookingModal } from "../../component/student/BookingModal.jsx"
import { LostFoundModal } from "../../component/student/LostFoundModal.jsx"

export default function FacilityManagement() {
  const { parkingSpots, gymLockers, sportsCourtBookings, studyRooms, myBookings, lostFoundItems, cancelBooking } =
    useStudentStore()

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const { isOpen: isBookingOpen, onOpen: onBookingOpen, onClose: onBookingClose } = useDisclosure()
  const { isOpen: isLostFoundOpen, onOpen: onLostFoundOpen, onClose: onLostFoundClose } = useDisclosure()

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "green"
      case "limited":
        return "yellow"
      case "full":
        return "red"
      case "confirmed":
        return "green"
      case "pending":
        return "yellow"
      case "cancelled":
        return "red"
      default:
        return "gray"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return FiCheckCircle
      case "pending":
        return FiClock
      case "cancelled":
        return FiXCircle
      default:
        return FiClock
    }
  }

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
              Facility Management
            </Text>
            <Text color="gray.600">Manage your bookings and access campus facilities</Text>
          </Box>
          <Button leftIcon={<FiBook />} colorScheme="blue" onClick={onBookingOpen}>
            New Booking
          </Button>
        </HStack>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>
              <HStack>
                <Icon as={FiMapPin} />
                <Text>Parking</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Icon as={FiLock} />
                <Text>Lockers</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Icon as={FiActivity} />
                <Text>Sports Courts</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Icon as={FiBook} />
                <Text>Study Rooms</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Icon as={FiSearch} />
                <Text>Lost & Found</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Parking Tab */}
            <TabPanel>
              <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                {parkingSpots.map((spot) => (
                  <Card key={spot.id} bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                      <HStack justify="space-between" mb={4}>
                        <Text fontSize="lg" fontWeight="semibold">
                          {spot.zone}
                        </Text>
                        <Badge colorScheme={getStatusColor(spot.status)} variant="subtle">
                          {spot.status}
                        </Badge>
                      </HStack>
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">
                            Available Spots
                          </Text>
                          <Text fontWeight="medium">
                            {spot.available}/{spot.total}
                          </Text>
                        </HStack>
                        <Progress
                          value={(spot.available / spot.total) * 100}
                          colorScheme={getStatusColor(spot.status)}
                          size="sm"
                        />
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            {/* Lockers Tab */}
            <TabPanel>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                {gymLockers.map((locker) => (
                  <Card key={locker.id} bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Text fontWeight="semibold">{locker.id}</Text>
                          <Badge colorScheme={locker.status === "available" ? "green" : "red"} variant="subtle">
                            {locker.status}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          {locker.location}
                        </Text>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">
                            Price per day
                          </Text>
                          <Text fontWeight="medium">${locker.price}</Text>
                        </HStack>
                        {locker.status === "available" && (
                          <Button size="sm" colorScheme="blue" onClick={onBookingOpen}>
                            Book Locker
                          </Button>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            {/* Sports Courts Tab */}
            <TabPanel>
              <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                {sportsCourtBookings.map((court) => (
                  <Card key={court.id} bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Text fontSize="lg" fontWeight="semibold">
                            {court.name}
                          </Text>
                          <Badge colorScheme={court.available ? "green" : "red"} variant="subtle">
                            {court.available ? "Available" : "Occupied"}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          Next available slot: {court.nextSlot}
                        </Text>
                        {court.available && (
                          <Button size="sm" colorScheme="blue" onClick={onBookingOpen}>
                            Reserve Court
                          </Button>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            {/* Study Rooms Tab */}
            <TabPanel>
              <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                {studyRooms.map((room) => (
                  <Card key={room.id} bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Text fontSize="lg" fontWeight="semibold">
                            {room.name}
                          </Text>
                          <Badge colorScheme={room.available ? "green" : "red"} variant="subtle">
                            {room.available ? "Available" : "Occupied"}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          Capacity: {room.capacity} people
                        </Text>
                        <VStack align="start">
                          <Text fontSize="sm" fontWeight="medium">
                            Equipment:
                          </Text>
                          <HStack wrap="wrap">
                            {room.equipment.map((item) => (
                              <Badge key={item} colorScheme="blue" variant="outline" size="sm">
                                {item}
                              </Badge>
                            ))}
                          </HStack>
                        </VStack>
                        {room.available && (
                          <Button size="sm" colorScheme="blue" onClick={onBookingOpen}>
                            Book Room
                          </Button>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            {/* Lost & Found Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="semibold">
                    Lost & Found Items
                  </Text>
                  <Button leftIcon={<FiSearch />} colorScheme="blue" onClick={onLostFoundOpen}>
                    Report Lost Item
                  </Button>
                </HStack>

                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Item</Th>
                        <Th>Location Found</Th>
                        <Th>Date</Th>
                        <Th>Status</Th>
                        <Th>Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {lostFoundItems.map((item) => (
                        <Tr key={item.id}>
                          <Td fontWeight="medium">{item.item}</Td>
                          <Td>{item.location}</Td>
                          <Td>{item.date}</Td>
                          <Td>
                            <Badge
                              colorScheme={item.claimed ? "green" : item.status === "found" ? "blue" : "yellow"}
                              variant="subtle"
                            >
                              {item.claimed ? "Claimed" : item.status}
                            </Badge>
                          </Td>
                          <Td>
                            {!item.claimed && item.status === "found" && (
                              <Button size="sm" colorScheme="green">
                                Claim Item
                              </Button>
                            )}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* My Bookings Section */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              My Active Bookings
            </Text>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Type</Th>
                    <Th>Resource</Th>
                    <Th>Date</Th>
                    <Th>Time</Th>
                    <Th>Status</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {myBookings.map((booking) => (
                    <Tr key={booking.id}>
                      <Td>
                        <Badge colorScheme="blue" variant="outline">
                          {booking.type}
                        </Badge>
                      </Td>
                      <Td fontWeight="medium">{booking.resource}</Td>
                      <Td>{booking.date}</Td>
                      <Td>{booking.time}</Td>
                      <Td>
                        <HStack>
                          <Icon as={getStatusIcon(booking.status)} color={getStatusColor(booking.status)} />
                          <Badge colorScheme={getStatusColor(booking.status)} variant="subtle">
                            {booking.status}
                          </Badge>
                        </HStack>
                      </Td>
                      <Td>
                        {booking.status !== "cancelled" && (
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            onClick={() => cancelBooking(booking.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      </VStack>

      {/* Modals */}
      <BookingModal isOpen={isBookingOpen} onClose={onBookingClose} />
      <LostFoundModal isOpen={isLostFoundOpen} onClose={onLostFoundClose} />
    </Box>
  )
}
