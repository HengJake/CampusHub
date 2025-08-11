"use client"

import { VStack, HStack, Text, Badge, Box, Icon, Spinner } from "@chakra-ui/react"
import { FiCheck, FiX, FiClock } from "react-icons/fi"
import { useFacilityStore } from "../../store/facility.js"

export function RecentBookings() {
    const { bookings, loading, errors } = useFacilityStore()

    // Filter for confirmed and cancelled bookings, then sort by most recent
    const recentBookings = bookings
        ?.filter(booking => booking.status === "confirmed" || booking.status === "cancelled")
        .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
        .slice(0, 5) || []

    const getStatusIcon = (status) => {
        switch (status) {
            case "confirmed":
                return <Icon as={FiCheck} color="green.500" />
            case "cancelled":
                return <Icon as={FiX} color="red.500" />
            default:
                return <Icon as={FiClock} color="gray.500" />
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "confirmed":
                return "green"
            case "cancelled":
                return "red"
            default:
                return "gray"
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatTime = (startTime, endTime) => {
        return `${startTime} - ${endTime}`
    }

    const getStudentName = (booking) => {
        if (booking.studentId?.userId?.name) {
            return booking.studentId.userId.name
        }
        if (booking.studentId?.name) {
            return booking.studentId.name
        }
        return "Student"
    }

    const getResourceName = (booking) => {
        if (booking.resourceId?.name) {
            return booking.resourceId.name
        }
        return "Resource"
    }

    if (loading.bookings) {
        return (
            <Box p={4} textAlign="center">
                <Spinner size="sm" mr={2} />
                <Text fontSize="sm" color="gray.500">
                    Loading recent bookings...
                </Text>
            </Box>
        )
    }

    if (errors.bookings) {
        return (
            <Box p={4} textAlign="center">
                <Text fontSize="sm" color="red.500">
                    Error loading bookings: {errors.bookings}
                </Text>
            </Box>
        )
    }

    return (
        <VStack spacing={3} align="stretch">
            {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                    <Box key={booking._id} p={3} border="1px" borderColor="gray.200" borderRadius="md">
                        <HStack justify="space-between">
                            <VStack align="start" spacing={1} flex={1}>
                                <HStack>
                                    <Text fontWeight="medium" fontSize="sm">
                                        {getStudentName(booking)}
                                    </Text>
                                    <Badge colorScheme={getStatusColor(booking.status)} variant="subtle" size="sm">
                                        <HStack spacing={1}>
                                            {getStatusIcon(booking.status)}
                                            <Text fontSize="xs" textTransform="capitalize">
                                                {booking.status}
                                            </Text>
                                        </HStack>
                                    </Badge>
                                </HStack>
                                <Text fontSize="xs" color="gray.600">
                                    {getResourceName(booking)} • {formatDate(booking.bookingDate)} • {formatTime(booking.startTime, booking.endTime)}
                                </Text>
                            </VStack>
                        </HStack>
                    </Box>
                ))
            ) : (
                <Box p={4} textAlign="center">
                    <Text fontSize="sm" color="gray.500">
                        No recent confirmed or cancelled bookings
                    </Text>
                </Box>
            )}
        </VStack>
    )
} 