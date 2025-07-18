import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Select,
  Input,
  Textarea,
  useToast,
  HStack,
  Text,
  Badge,
} from "@chakra-ui/react"
import { useState } from "react"
import { useStudentStore } from "../../store/TBI/studentStore.js"

export function BookingModal({ isOpen, onClose }) {
  const [bookingType, setBookingType] = useState("")
  const [selectedResource, setSelectedResource] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [notes, setNotes] = useState("")

  const { gymLockers, sportsCourtBookings, studyRooms, bookResource } = useStudentStore()
  const toast = useToast()

  const getAvailableResources = () => {
    switch (bookingType) {
      case "locker":
        return gymLockers.filter((locker) => locker.status === "available")
      case "sports":
        return sportsCourtBookings.filter((court) => court.available)
      case "study":
        return studyRooms.filter((room) => room.available)
      default:
        return []
    }
  }

  const handleSubmit = () => {
    if (!bookingType || !selectedResource || !date || !time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    bookResource(bookingType, selectedResource, date, time)

    toast({
      title: "Booking Submitted",
      description: "Your booking request has been submitted successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    })

    // Reset form
    setBookingType("")
    setSelectedResource("")
    setDate("")
    setTime("")
    setNotes("")
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>New Booking Request</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Booking Type</FormLabel>
              <Select
                placeholder="Select booking type"
                value={bookingType}
                onChange={(e) => setBookingType(e.target.value)}
              >
                <option value="locker">Gym Locker</option>
                <option value="sports">Sports Court</option>
                <option value="study">Study/Seminar Room</option>
              </Select>
            </FormControl>

            {bookingType && (
              <FormControl isRequired>
                <FormLabel>Available Resources</FormLabel>
                <Select
                  placeholder="Select resource"
                  value={selectedResource}
                  onChange={(e) => setSelectedResource(e.target.value)}
                >
                  {getAvailableResources().map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {bookingType === "locker" && `${resource.id} - ${resource.location} ($${resource.price})`}
                      {bookingType === "sports" && `${resource.name} - Next: ${resource.nextSlot}`}
                      {bookingType === "study" && `${resource.name} - Capacity: ${resource.capacity}`}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            <HStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Time</FormLabel>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Additional Notes</FormLabel>
              <Textarea
                placeholder="Any special requirements or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </FormControl>

            {selectedResource && bookingType === "study" && (
              <VStack align="start" p={3} bg="blue.50" borderRadius="md">
                <Text fontSize="sm" fontWeight="medium">
                  Equipment Available:
                </Text>
                <HStack wrap="wrap">
                  {studyRooms
                    .find((room) => room.id === selectedResource)
                    ?.equipment.map((item) => (
                      <Badge key={item} colorScheme="blue" variant="subtle">
                        {item}
                      </Badge>
                    ))}
                </HStack>
              </VStack>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Submit Booking
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
