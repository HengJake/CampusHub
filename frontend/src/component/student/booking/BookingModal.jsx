import { useState, useEffect } from "react"
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    VStack,
    HStack,
    Box,
    Text,
    Badge,
    FormControl,
    FormLabel,
    Input,
    RadioGroup,
    Stack,
    Radio,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Button,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    useToast
} from "@chakra-ui/react"
import { FiClock } from "react-icons/fi"
import { getDayOfWeek, getAvailableDays } from "./utils"

const BookingModal = ({ isOpen, onClose, selectedRoom, onSubmit, currentUser }) => {
    const [bookingDate, setBookingDate] = useState("")
    const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
    const [availableTimeSlots, setAvailableTimeSlots] = useState([])
    const [groupSize, setGroupSize] = useState(1)
    const toast = useToast()

    // Load available time slots when date is selected
    useEffect(() => {
        if (bookingDate && selectedRoom) {
            const dayOfWeek = getDayOfWeek(bookingDate)
            const dayTimeSlots = selectedRoom.timeslots?.find(ts => ts.dayOfWeek === dayOfWeek)

            if (dayTimeSlots && dayTimeSlots.slots) {
                setAvailableTimeSlots(dayTimeSlots.slots)
            } else {
                setAvailableTimeSlots([])
                toast({
                    title: "No Available Slots",
                    description: `No time slots available for ${dayOfWeek}`,
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                })
            }
            setSelectedTimeSlot("")
        }
    }, [bookingDate, selectedRoom?._id, toast])

    const handleSubmit = () => {
        if (!bookingDate || !selectedTimeSlot) {
            toast({
                title: "Missing Information",
                description: "Please select a date and time slot",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        const [startTime, endTime] = selectedTimeSlot.split(" - ")

        const start = new Date(`2024-01-01 ${startTime}`)
        const end = new Date(`2024-01-01 ${endTime}`)
        const duration = (end - start) / (1000 * 60 * 60) // hours

        if (duration <= 0) {
            toast({
                title: "Invalid Time Range",
                description: "End time must be after start time",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        const totalCost = duration * (selectedRoom?.hourlyRate || 0)

        // Check if student data is available
        if (!currentUser.student?._id && !currentUser.user?.student?._id) {
            toast({
                title: "Profile Setup Required",
                description: "Your student profile needs to be set up before making bookings. Please contact your school administrator.",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        const bookingData = {
            resourceId: selectedRoom._id,
            studentId: currentUser.student?._id || currentUser.user?.student?._id,
            bookingDate: new Date(bookingDate).toISOString(),
            startTime,
            endTime,
            groupSize,
            totalCost,
            status: "pending"
        }

        onSubmit(bookingData)
    }

    if (!selectedRoom) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Book Resource: {selectedRoom?.name}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Alert status="info">
                            <AlertIcon />
                            <Box>
                                <AlertTitle>Resource Information</AlertTitle>
                                <AlertDescription>
                                    {selectedRoom?.type} - {selectedRoom?.location} (Capacity: {selectedRoom?.capacity} people)
                                </AlertDescription>
                            </Box>
                        </Alert>

                        <FormControl isRequired>
                            <FormLabel>Booking Date</FormLabel>

                            {/* Available Days Badges */}
                            <Box mb={3}>
                                <Text fontSize="sm" color="gray.600" mb={2}>
                                    Available Days:
                                </Text>
                                <HStack spacing={2} flexWrap="wrap">
                                    {getAvailableDays(selectedRoom).map((day, index) => (
                                        <Badge
                                            key={index}
                                            colorScheme="green"
                                            variant="subtle"
                                            fontSize="xs"
                                            px={2}
                                            py={1}
                                        >
                                            {day}
                                        </Badge>
                                    ))}
                                </HStack>
                            </Box>

                            <Input
                                type="date"
                                value={bookingDate}
                                onChange={(e) => setBookingDate(e.target.value)}
                                min={new Date().toISOString().split("T")[0]}
                            />
                        </FormControl>

                        {bookingDate && (
                            <FormControl isRequired>
                                <FormLabel>Available Time Slots</FormLabel>
                                {availableTimeSlots.length > 0 ? (
                                    <RadioGroup value={selectedTimeSlot} onChange={setSelectedTimeSlot}>
                                        <Stack spacing={3}>
                                            {availableTimeSlots.map((slot, index) => (
                                                <Radio key={index} value={`${slot.start} - ${slot.end}`}>
                                                    <HStack>
                                                        <FiClock color="blue.500" />
                                                        <Text>
                                                            {slot.start} - {slot.end}
                                                        </Text>
                                                    </HStack>
                                                </Radio>
                                            ))}
                                        </Stack>
                                    </RadioGroup>
                                ) : (
                                    <Alert status="warning">
                                        <AlertIcon />
                                        <AlertDescription>
                                            No time slots available for {getDayOfWeek(bookingDate)}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </FormControl>
                        )}

                        <FormControl isRequired>
                            <FormLabel>Attendees</FormLabel>
                            <NumberInput
                                value={groupSize}
                                onChange={(value) => setGroupSize(Number.parseInt(value) || 1)}
                                min={1}
                                max={selectedRoom?.capacity}
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                            <Text fontSize="sm" color="gray.600">
                                Maximum capacity: {selectedRoom?.capacity} people
                            </Text>
                        </FormControl>

                        {selectedTimeSlot && (
                            <Alert status="success">
                                <AlertIcon />
                                <Box>
                                    <AlertTitle>Booking Summary</AlertTitle>
                                    <AlertDescription>
                                        {(() => {
                                            const [startTime, endTime] = selectedTimeSlot.split(" - ")
                                            const start = new Date(`2024-01-01 ${startTime}`)
                                            const end = new Date(`2024-01-01 ${endTime}`)
                                            const duration = (end - start) / (1000 * 60 * 60)
                                            const cost = duration * (selectedRoom?.hourlyRate || 0)
                                            return duration > 0 ? (
                                                <>
                                                    Duration: {duration.toFixed(1)} hour(s) | Cost: {cost === 0 ? "FREE" : `$${cost.toFixed(2)}`}
                                                </>
                                            ) : (
                                                "Invalid time range"
                                            )
                                        })()}
                                    </AlertDescription>
                                </Box>
                            </Alert>
                        )}
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={handleSubmit}
                        isDisabled={!bookingDate || !selectedTimeSlot}
                    >
                        Submit Booking
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default BookingModal
