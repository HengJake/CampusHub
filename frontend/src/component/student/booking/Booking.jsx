"use client"

import { useState, useEffect } from "react"
import { Box, VStack, HStack, Switch, Button, useToast, Spinner, Text } from "@chakra-ui/react"
import { FiRefreshCw } from "react-icons/fi"
import { useFacilityStore } from "../../../store/facility"
import { useAuthStore } from "../../../store/auth"
import BookingTabs from "./BookingTabs"
import BookingModal from "./BookingModal"
import DeleteConfirmationModal from "./DeleteConfirmationModal"

const Booking = () => {
    const [autoRefresh, setAutoRefresh] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(new Date())
    const [selectedRoom, setSelectedRoom] = useState(null)
    const [bookingDate, setBookingDate] = useState("")
    const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
    const [availableTimeSlots, setAvailableTimeSlots] = useState([])
    const [groupSize, setGroupSize] = useState(1)
    const [bookingToDelete, setBookingToDelete] = useState(null)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [isBookingOpen, setIsBookingOpen] = useState(false)

    const toast = useToast()

    // Get data from stores
    const {
        resources,
        bookings,
        loading,
        fetchResources,
        fetchBookingsByStudentId,
        createBooking,
        updateBooking,
        deleteBooking
    } = useFacilityStore()

    const { getCurrentUser } = useAuthStore()
    const currentUser = getCurrentUser()

    // Fetch data on component mount
    useEffect(() => {
        if (currentUser?.schoolId) {
            fetchResources(currentUser.schoolId)
        }
        if (currentUser?.studentId) {
            fetchBookingsByStudentId(currentUser.studentId)
        }
    }, [currentUser?.schoolId, currentUser?.studentId])

    const handleBookRoom = (resource) => {
        setSelectedRoom(resource)
        setBookingDate("")
        setSelectedTimeSlot("")
        setAvailableTimeSlots([])
        setGroupSize(1)
        setIsBookingOpen(true)
    }

    const handleSubmitBooking = async (bookingData) => {
        try {
            const result = await createBooking(bookingData)
            if (result.success) {
                toast({
                    title: "Booking Submitted",
                    description: `Your ${selectedRoom.type?.toLowerCase()} booking has been submitted successfully`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                })

                // Reset form and close modal
                setBookingDate("")
                setSelectedTimeSlot("")
                setAvailableTimeSlots([])
                setGroupSize(1)
                setIsBookingOpen(false)
            } else {
                throw new Error(result.message)
            }
        } catch (error) {
            toast({
                title: "Booking Failed",
                description: error.message || "Failed to submit booking",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        }
    }

    const handleDeleteBooking = (booking) => {
        setBookingToDelete(booking)
        setIsDeleteConfirmOpen(true)
    }

    const confirmDeleteBooking = async () => {
        if (!bookingToDelete) return

        try {
            const result = await deleteBooking(bookingToDelete._id)
            if (result.success) {
                toast({
                    title: "Booking Deleted",
                    description: "Booking has been deleted successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                })
            } else {
                throw new Error(result.message)
            }
        } catch (error) {
            toast({
                title: "Deletion Failed",
                description: error.message || "Failed to delete booking",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        } finally {
            setIsDeleteConfirmOpen(false)
            setBookingToDelete(null)
        }
    }

    const handleRefresh = () => {
        if (currentUser?.schoolId) {
            fetchResources(currentUser.schoolId)
        }
        if (currentUser?.studentId) {
            fetchBookingsByStudentId(currentUser.studentId)
        }
        setLastUpdated(new Date())
        toast({
            title: "Data Refreshed",
            description: "Resource availability has been updated",
            status: "info",
            duration: 2000,
            isClosable: true,
        })
    }

    if (loading.resources) {
        return (
            <Box p={6} display="flex" justifyContent="center" alignItems="center" minH="100vh">
                <VStack spacing={4}>
                    <Spinner size="xl" />
                    <Text>Loading resources...</Text>
                </VStack>
            </Box>
        )
    }

    return (
        <Box minH="100vh">
            <VStack spacing={6} align="stretch">
                {/* Header */}
                <HStack justify="space-between" wrap="wrap">
                    <Box>
                        <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
                            Study & Meeting Room Booking
                        </Text>
                        <Text color="gray.600">Reserve study rooms, meeting spaces, and seminar halls for your academic needs</Text>
                    </Box>
                    <HStack spacing={3}>
                        <HStack>
                            <Switch isChecked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} colorScheme="blue" />
                            <Text fontSize="sm">Auto-refresh</Text>
                        </HStack>
                        <Button leftIcon={<FiRefreshCw />} onClick={handleRefresh} size="sm">
                            Refresh
                        </Button>
                    </HStack>
                </HStack>

                {/* Main Content */}
                <BookingTabs
                    resources={resources}
                    bookings={bookings}
                    currentUser={currentUser}
                    onBookRoom={handleBookRoom}
                    onDeleteBooking={handleDeleteBooking}
                    lastUpdated={lastUpdated}
                />

                {/* Booking Modal */}
                <BookingModal
                    isOpen={isBookingOpen}
                    onClose={() => setIsBookingOpen(false)}
                    selectedRoom={selectedRoom}
                    onSubmit={handleSubmitBooking}
                    currentUser={currentUser}
                />

                {/* Delete Confirmation Modal */}
                <DeleteConfirmationModal
                    isOpen={isDeleteConfirmOpen}
                    onClose={() => {
                        setIsDeleteConfirmOpen(false)
                        setBookingToDelete(null)
                    }}
                    onConfirm={confirmDeleteBooking}
                    bookingToDelete={bookingToDelete}
                />
            </VStack>
        </Box>
    )
}

export default Booking
