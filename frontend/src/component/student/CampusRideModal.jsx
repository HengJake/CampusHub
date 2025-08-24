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
  Spinner,
  Alert,
  AlertIcon,
  Badge,
} from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { FiMapPin, FiNavigation, FiClock, FiDollarSign } from "react-icons/fi"
import { useTransportationStore } from "../../store/transportation.js"
import { useAuthStore } from "../../store/auth.js"

export function CampusRideModal({ isOpen, onClose }) {
  const [selectedRoute, setSelectedRoute] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { fetchRoutesBySchoolId, routes, loading, errors, createEHailing, fetchEHailingsByStudentId } = useTransportationStore()
  const { getCurrentUser, getSchoolId } = useAuthStore()
  const toast = useToast()

  // Fetch routes when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchRoutesBySchoolId()
    }
  }, [isOpen, fetchRoutesBySchoolId])

  const handleSubmit = async () => {
    if (!selectedRoute) {
      toast({
        title: "Missing Information",
        description: "Please select a route for your ride",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSubmitting(true)

    try {
      const userContext = getCurrentUser()
      const schoolId = getSchoolId()

      if (!userContext.studentId) {
        throw new Error("Student ID not found. Please ensure you are logged in as a student.")
      }

      if (!schoolId) {
        throw new Error("School ID not found. Please ensure you are associated with a school.")
      }

      // Create eHailing data
      const eHailingData = {
        studentId: userContext.studentId,
        schoolId: schoolId,
        routeId: selectedRoute,
        notes: notes,
        status: "waiting"
      }

      const result = await createEHailing(eHailingData)

      if (result.success) {
        toast({
          title: "Ride Request Submitted",
          description: "Your campus ride request has been submitted successfully. You'll be notified when a driver is assigned.",
          status: "success",
          duration: 5000,
          isClosable: true,
        })

        // Reset form
        setSelectedRoute("")
        setNotes("")
        onClose()
      } else {
        throw new Error(result.message || "Failed to submit ride request")
      }
    } catch (error) {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to submit ride request. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRouteName = (routeId) => {
    const route = routes.find(r => r._id === routeId)
    return route ? route.name : routeId
  }

  const getRouteDetails = (routeId) => {
    const route = routes.find(r => r._id === routeId)
    return route || null
  }

  const selectedRouteDetails = getRouteDetails(selectedRoute)

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
            {loading.routes && (
              <HStack justify="center" py={4}>
                <Spinner size="md" color="blue.500" />
                <Text>Loading available routes...</Text>
              </HStack>
            )}

            {errors.routes && (
              <Alert status="error">
                <AlertIcon />
                Failed to load routes. Please try again.
              </Alert>
            )}

            {!loading.routes && routes.length === 0 && (
              <Alert status="warning">
                <AlertIcon />
                No routes available. Please contact your administrator.
              </Alert>
            )}

            {!loading.routes && routes.length > 0 && (
              <>
                <FormControl isRequired>
                  <FormLabel>
                    <HStack>
                      <Icon as={FiMapPin} color="blue.500" boxSize={4} />
                      <Text>Select Route</Text>
                    </HStack>
                  </FormLabel>
                  <Select
                    placeholder="Choose your route"
                    value={selectedRoute}
                    onChange={(e) => setSelectedRoute(e.target.value)}
                  >
                    {routes.map((route) => (
                      <option key={route._id} value={route._id}>
                        {route.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {selectedRouteDetails && (
                  <VStack align="start" p={4} bg="blue.50" borderRadius="md" spacing={3}>
                    <Text fontSize="lg" fontWeight="semibold" color="blue.800">
                      Route Details: {selectedRouteDetails.name}
                    </Text>

                    <HStack spacing={4}>
                      <HStack>
                        <Icon as={FiClock} color="blue.500" />
                        <Text fontSize="sm" color="blue.700">
                          Est. Time: {selectedRouteDetails.estimateTimeMinute} min
                        </Text>
                      </HStack>

                      <HStack>
                        <Icon as={FiDollarSign} color="green.500" />
                        <Text fontSize="sm" color="green.700">
                          Fare: ${selectedRouteDetails.fare}
                        </Text>
                      </HStack>
                    </HStack>

                    {selectedRouteDetails.stopIds && selectedRouteDetails.stopIds.length > 0 && (
                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm" fontWeight="medium" color="blue.700">
                          Stops on this route:
                        </Text>
                        <HStack flexWrap="wrap" spacing={2}>
                          {selectedRouteDetails.stopIds.map((stop, index) => (
                            <Badge key={stop._id || index} colorScheme="blue" variant="subtle">
                              {stop.name || `Stop ${index + 1}`}
                            </Badge>
                          ))}
                        </HStack>
                      </VStack>
                    )}
                  </VStack>
                )}

                <FormControl>
                  <FormLabel>Additional Notes</FormLabel>
                  <Textarea
                    placeholder="Any special instructions or accessibility requirements..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </FormControl>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isDisabled={!selectedRoute || loading.routes || isSubmitting}
            isLoading={isSubmitting}
            loadingText="Submitting..."
          >
            Request Ride
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
