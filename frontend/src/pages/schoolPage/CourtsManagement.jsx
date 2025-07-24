"use client"

import { useState } from "react"
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
} from "@chakra-ui/react"
import { FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi"

export default function SportsCourtManagement() {
    // Mock data for courts
    const [sportsCourts, setSportsCourts] = useState([
        { id: 1, name: "Basketball Court", location: "Block A", available: true },
        { id: 2, name: "Tennis Court", location: "Block B", available: false },
        { id: 3, name: "Badminton Court", location: "Block C", available: true },
    ])

    // Mock data for bookings
    const [courtBookings, setCourtBookings] = useState([
        { id: 1, courtName: "Basketball Court", userName: "John Doe", date: "2024-06-01", time: "10:00-11:00", status: "pending" },
        { id: 2, courtName: "Tennis Court", userName: "Jane Smith", date: "2024-06-02", time: "12:00-13:00", status: "confirmed" },
        { id: 3, courtName: "Badminton Court", userName: "Alice Lee", date: "2024-06-03", time: "14:00-15:00", status: "cancelled" },
    ])

    const bgColor = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.600")
    const { isOpen, onOpen, onClose } = useDisclosure()

    // Status helpers
    const getStatusColor = (status) => {
        switch (status) {
            case "available":
            case "confirmed":
                return "green"
            case "pending":
            case "limited":
                return "yellow"
            case "full":
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

    // Handlers for admin actions (mock logic)
    const setCourtStatus = (courtId, available) => {
        setSportsCourts((prev) =>
            prev.map((court) =>
                court.id === courtId ? { ...court, available } : court
            )
        )
    }
    const deleteCourt = (courtId) => {
        setSportsCourts((prev) => prev.filter((court) => court.id !== courtId))
        setCourtBookings((prev) => prev.filter((booking) => booking.courtName !== sportsCourts.find(c => c.id === courtId)?.name))
    }
    const approveBooking = (bookingId) => {
        setCourtBookings((prev) =>
            prev.map((booking) =>
                booking.id === bookingId ? { ...booking, status: "confirmed" } : booking
            )
        )
    }
    const declineBooking = (bookingId) => {
        setCourtBookings((prev) =>
            prev.map((booking) =>
                booking.id === bookingId ? { ...booking, status: "cancelled" } : booking
            )
        )
    }

    return (
        <Box p={6} bg="gray.50" minH="100vh">
            <VStack spacing={6} align="stretch">
                {/* Header */}
                <HStack justify="space-between">
                    <Box>
                        <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
                            Sports Court Management
                        </Text>
                        <Text color="gray.600">Manage sports courts and bookings</Text>
                    </Box>
                    <Button colorScheme="blue" onClick={onOpen}>
                        Add New Court
                    </Button>
                </HStack>

                {/* Courts List */}
                <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                    {sportsCourts.map((court) => (
                        <Card key={court.id} bg={bgColor} borderColor={borderColor} borderWidth="1px">
                            <CardBody>
                                <VStack align="stretch" spacing={3}>
                                    <HStack justify="space-between">
                                        <Text fontSize="lg" fontWeight="semibold">
                                            {court.name}
                                        </Text>
                                        <Badge colorScheme={court.available ? "green" : "red"} variant="subtle">
                                            {court.available ? "Available" : "Unavailable"}
                                        </Badge>
                                    </HStack>
                                    <Text fontSize="sm" color="gray.600">
                                        Location: {court.location}
                                    </Text>
                                    <HStack>
                                        <Button
                                            size="sm"
                                            colorScheme={court.available ? "red" : "green"}
                                            onClick={() => setCourtStatus(court.id, !court.available)}
                                        >
                                            {court.available ? "Mark Unavailable" : "Mark Available"}
                                        </Button>
                                        <Button size="sm" colorScheme="yellow" onClick={() => { /* open edit modal */ }}>
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            colorScheme="red"
                                            variant="outline"
                                            onClick={() => deleteCourt(court.id)}
                                        >
                                            Delete
                                        </Button>
                                    </HStack>
                                    <Button size="sm" colorScheme="blue" variant="outline" onClick={() => { /* open bookings modal */ }}>
                                        View Bookings
                                    </Button>
                                </VStack>
                            </CardBody>
                        </Card>
                    ))}
                </Grid>

                {/* All Bookings Table */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        <Text fontSize="lg" fontWeight="semibold" mb={4}>
                            All Court Bookings
                        </Text>
                        <TableContainer>
                            <Table variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th>Court</Th>
                                        <Th>User</Th>
                                        <Th>Date</Th>
                                        <Th>Time</Th>
                                        <Th>Status</Th>
                                        <Th>Action</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {courtBookings.map((booking) => (
                                        <Tr key={booking.id}>
                                            <Td>{booking.courtName}</Td>
                                            <Td>{booking.userName}</Td>
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
                                                {booking.status === "pending" && (
                                                    <>
                                                        <Button size="sm" colorScheme="green" onClick={() => approveBooking(booking.id)}>
                                                            Approve
                                                        </Button>
                                                        <Button size="sm" colorScheme="red" onClick={() => declineBooking(booking.id)}>
                                                            Decline
                                                        </Button>
                                                    </>
                                                )}
                                                {booking.status === "confirmed" && (
                                                    <Button size="sm" colorScheme="red" variant="outline" onClick={() => declineBooking(booking.id)}>
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
            {/* Modals for Add/Edit Court, View Bookings, etc. */}
            {/* <CourtModal isOpen={isOpen} onClose={onClose} /> */}
        </Box>
    )
}
