"use client"

import { VStack, HStack, Text, Badge, IconButton, Box, Spinner } from "@chakra-ui/react"
import { FiCheck, FiX, FiClock } from "react-icons/fi"
import { useFacilityStore } from "../../store/facility.js"
import { useShowToast } from "../../store/utils/toast.js"

export function BookingApprovals() {
  const { bookings, updateBooking, loading, errors } = useFacilityStore()
  const showToast = useShowToast()

  const pendingBookings = bookings?.filter(booking => booking.status === "pending") || []

  const handleApprove = async (bookingId) => {
    try {
      const result = await updateBooking(bookingId, { status: "confirmed" })
      if (result.success) {
        showToast.success(
          "Booking Approved",
          "The booking has been successfully approved.",
          "booking-approved"
        )
      } else {
        showToast.error(
          "Approval Failed",
          result.message || "Failed to approve the booking.",
          "booking-approval-error"
        )
      }
    } catch (error) {
      console.error("Failed to approve booking:", error)
      showToast.error(
        "Approval Failed",
        "An error occurred while approving the booking.",
        "booking-approval-error"
      )
    }
  }

  const handleReject = async (bookingId) => {
    try {
      const result = await updateBooking(bookingId, { status: "cancelled" })
      if (result.success) {
        showToast.success(
          "Booking Rejected",
          "The booking has been successfully rejected.",
          "booking-rejected"
        )
      } else {
        showToast.error(
          "Rejection Failed",
          result.message || "Failed to reject the booking.",
          "booking-rejection-error"
        )
      }
    } catch (error) {
      console.error("Failed to reject booking:", error)
      showToast.error(
        "Rejection Failed",
        "An error occurred while rejecting the booking.",
        "booking-rejection-error"
      )
    }
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

  if (loading.bookings) {
    return (
      <Box p={4} textAlign="center">
        <Spinner size="sm" mr={2} />
        <Text fontSize="sm" color="gray.500">
          Loading pending bookings...
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
    <VStack spacing={4} align="stretch">
      {pendingBookings.length > 0 ? (
        pendingBookings.map((booking) => (
          <Box key={booking._id} p={4} border="1px" borderColor="gray.200" borderRadius="md">
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <HStack>
                  <Text fontWeight="medium">{getStudentName(booking)}</Text>
                  <Badge colorScheme="orange" variant="subtle">
                    <HStack spacing={1}>
                      <FiClock size={12} />
                      <Text>Pending</Text>
                    </HStack>
                  </Badge>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  {getResourceName(booking)} • {formatDate(booking.bookingDate)} • {formatTime(booking.startTime, booking.endTime)}
                </Text>
              </VStack>
              <HStack>
                <IconButton
                  icon={<FiCheck />}
                  size="sm"
                  colorScheme="green"
                  variant="outline"
                  aria-label="Approve"
                  onClick={() => handleApprove(booking._id)}
                />
                <IconButton
                  icon={<FiX />}
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  aria-label="Reject"
                  onClick={() => handleReject(booking._id)}
                />
              </HStack>
            </HStack>
          </Box>
        ))
      ) : (
        <Box p={4} textAlign="center">
          <Text fontSize="sm" color="gray.500">
            No pending bookings to approve
          </Text>
        </Box>
      )}
    </VStack>
  )
}
