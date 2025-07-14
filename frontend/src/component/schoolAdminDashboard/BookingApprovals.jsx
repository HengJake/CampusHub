"use client"

import { VStack, HStack, Text, Badge, IconButton, Box } from "@chakra-ui/react"
import { FiCheck, FiX, FiClock } from "react-icons/fi"
import { useAdminStore } from "../../store/TBI/adminStore.js"

export function BookingApprovals() {
  const { bookings } = useAdminStore()

  const pendingBookings = bookings?.filter(booking => booking.status === "Pending") || []

  const handleApprove = (bookingId) => {
    // TODO: Implement approve booking logic
    console.log("Approve booking:", bookingId)
  }

  const handleReject = (bookingId) => {
    // TODO: Implement reject booking logic
    console.log("Reject booking:", bookingId)
  }

  return (
    <VStack spacing={4} align="stretch">
      {pendingBookings.map((booking) => (
        <Box key={booking.id} p={4} border="1px" borderColor="gray.200" borderRadius="md">
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <HStack>
                <Text fontWeight="medium">{booking.user}</Text>
                <Badge colorScheme="orange" variant="subtle">
                  <HStack spacing={1}>
                    <FiClock size={12} />
                    <Text>Pending</Text>
                  </HStack>
                </Badge>
              </HStack>
              <Text fontSize="sm" color="gray.600">
                {booking.facility} • {booking.date} • {booking.time}
              </Text>
            </VStack>
            <HStack>
              <IconButton
                icon={<FiCheck />}
                size="sm"
                colorScheme="green"
                variant="outline"
                aria-label="Approve"
                onClick={() => approveBooking(booking.id)}
              />
              <IconButton
                icon={<FiX />}
                size="sm"
                colorScheme="red"
                variant="outline"
                aria-label="Reject"
                onClick={() => rejectBooking(booking.id)}
              />
            </HStack>
          </HStack>
        </Box>
      ))}
    </VStack>
  )
}
