import { Card, CardBody, Text, SimpleGrid, Stat, StatLabel, StatNumber } from "@chakra-ui/react"

const BookingSummary = ({ bookings }) => {
    const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length
    const pendingBookings = bookings.filter((b) => b.status === "pending").length

    const totalHours = bookings.reduce((sum, b) => {
        const start = new Date(`2024-01-01 ${b.startTime}`)
        const end = new Date(`2024-01-01 ${b.endTime}`)
        const duration = (end - start) / (1000 * 60 * 60)
        return sum + duration
    }, 0).toFixed(1)

    return (
        <Card>
            <CardBody>
                <Text fontWeight="bold" mb={4}>
                    Booking Summary
                </Text>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                    <Stat>
                        <StatLabel>Confirmed Bookings</StatLabel>
                        <StatNumber color="green.500">
                            {confirmedBookings}
                        </StatNumber>
                    </Stat>
                    <Stat>
                        <StatLabel>Pending Bookings</StatLabel>
                        <StatNumber color="yellow.500">
                            {pendingBookings}
                        </StatNumber>
                    </Stat>
                    <Stat>
                        <StatLabel>Total Hours</StatLabel>
                        <StatNumber color="blue.500">
                            {totalHours}h
                        </StatNumber>
                    </Stat>
                </SimpleGrid>
            </CardBody>
        </Card>
    )
}

export default BookingSummary
