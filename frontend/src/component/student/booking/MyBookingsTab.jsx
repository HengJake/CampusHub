import { VStack, Card, CardBody, Text, SimpleGrid, Stat, StatLabel, StatNumber, TableContainer, Table, Thead, Tbody, Tr, Th, Button } from "@chakra-ui/react"
import { FiCalendar, FiPlus } from "react-icons/fi"
import BookingRow from "./BookingRow"
import BookingSummary from "./BookingSummary"

const MyBookingsTab = ({ bookings, onDelete, onSwitchToResources }) => {
    if (bookings.length === 0) {
        return (
            <VStack spacing={4} align="stretch">
                <Card>
                    <CardBody textAlign="center" py={10}>
                        <FiCalendar size={48} color="#A0AEC0" style={{ marginBottom: '16px' }} />
                        <Text fontSize="lg" color="gray.600" mb={2}>
                            No bookings yet
                        </Text>
                        <Text color="gray.500" mb={4}>Book your first resource to get started</Text>
                        <Button
                            leftIcon={<FiPlus />}
                            colorScheme="blue"
                            onClick={onSwitchToResources}
                            size="md"
                        >
                            Add New Booking
                        </Button>
                    </CardBody>
                </Card>
            </VStack>
        )
    }

    return (
        <VStack spacing={4} align="stretch">
            {/* Add New Booking Button */}
            <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                onClick={onSwitchToResources}
                alignSelf="flex-end"
                size="md"
            >
                Add New Booking
            </Button>

            {/* Bookings Summary */}
            <BookingSummary bookings={bookings} />

            {/* Bookings List */}
            <TableContainer>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Resource</Th>
                            <Th>Type</Th>
                            <Th>Date & Time</Th>
                            <Th>Duration</Th>
                            <Th>Status</Th>
                            <Th>Delete</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {bookings.map((booking) => (
                            <BookingRow
                                key={booking._id}
                                booking={booking}
                                onDelete={onDelete}
                            />
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </VStack>
    )
}

export default MyBookingsTab
