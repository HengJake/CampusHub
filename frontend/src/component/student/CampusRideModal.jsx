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
  Textarea,
  useToast,
  HStack,
  Text,
  Icon,
} from "@chakra-ui/react"
import { useState } from "react"
import { FiMapPin, FiNavigation } from "react-icons/fi"
import { useStudentStore } from "../../store/TBI/studentStore.js"

const campusLocations = [
  "Main Gate",
  "Library",
  "Student Center",
  "Cafeteria",
  "Engineering Building",
  "Science Building",
  "Sports Complex",
  "Dormitory Block A",
  "Dormitory Block B",
  "Parking Lot A",
  "Parking Lot B",
  "Medical Center",
  "Administration Building",
]

export function CampusRideModal({ isOpen, onClose }) {
  const [fromLocation, setFromLocation] = useState("")
  const [toLocation, setToLocation] = useState("")
  const [notes, setNotes] = useState("")

  const { requestCampusRide } = useStudentStore()
  const toast = useToast()

  const handleSubmit = () => {
    if (!fromLocation || !toLocation) {
      toast({
        title: "Missing Information",
        description: "Please select both pickup and destination locations",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (fromLocation === toLocation) {
      toast({
        title: "Invalid Route",
        description: "Pickup and destination locations cannot be the same",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    requestCampusRide(fromLocation, toLocation)

    toast({
      title: "Ride Requested",
      description: "Your campus ride request has been submitted. You'll be notified when a driver is assigned.",
      status: "success",
      duration: 5000,
      isClosable: true,
    })

    // Reset form
    setFromLocation("")
    setToLocation("")
    setNotes("")
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Icon as={FiNavigation} color="blue.500" />
            <Text>Request Campus Ride</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>
                <HStack>
                  <Icon as={FiMapPin} color="green.500" boxSize={4} />
                  <Text>Pickup Location</Text>
                </HStack>
              </FormLabel>
              <Select
                placeholder="Select pickup location"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
              >
                {campusLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>
                <HStack>
                  <Icon as={FiMapPin} color="red.500" boxSize={4} />
                  <Text>Destination</Text>
                </HStack>
              </FormLabel>
              <Select
                placeholder="Select destination"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
              >
                {campusLocations.map((location) => (
                  <option key={location} value={location} disabled={location === fromLocation}>
                    {location}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Additional Notes</FormLabel>
              <Textarea
                placeholder="Any special instructions or accessibility requirements..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </FormControl>

            {fromLocation && toLocation && (
              <VStack align="start" p={3} bg="blue.50" borderRadius="md">
                <Text fontSize="sm" fontWeight="medium" color="blue.800">
                  Route Summary:
                </Text>
                <HStack>
                  <Text fontSize="sm" color="blue.700">
                    {fromLocation}
                  </Text>
                  <Icon as={FiNavigation} color="blue.500" boxSize={3} />
                  <Text fontSize="sm" color="blue.700">
                    {toLocation}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="blue.600">
                  Estimated wait time: 5-10 minutes
                </Text>
              </VStack>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Request Ride
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
