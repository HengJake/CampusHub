"use client"

import {
  Box,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  Button,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Icon,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react"
import { FiMessageSquare, FiSend, FiClock, FiCheckCircle, FiAlertCircle } from "react-icons/fi"
import { FeedbackModal } from "../../component/student/FeedbackModal"
import { useState, useEffect } from "react"
import { useAuthStore } from "../../store/auth.js"
import { useServiceStore } from "../../store/service.js"
export default function Feedback() {
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const { isOpen: isFeedbackOpen, onOpen: onFeedbackOpen, onClose: onFeedbackClose } = useDisclosure()

  const [feedbackHistory, setFeedbackHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { getCurrentUser } = useAuthStore()
  const { fetchFeedback, feedback } = useServiceStore()

  // Helper function to get student ID consistently
  const getStudentId = (currentUser) => {
    return currentUser.studentId ||
      currentUser.user?.studentId ||
      currentUser.user?.student?._id ||
      currentUser.user?._id ||
      currentUser.id
  }

  // Fetch feedback data from API
  const fetchFeedbackData = async () => {
    try {
      setLoading(true)
      setError(null)

      const currentUser = getCurrentUser()

      if (!currentUser.isAuthenticated) {
        throw new Error("Please log in to view feedback")
      }

      const studentId = getStudentId(currentUser)

      if (!studentId) {
        throw new Error("Student ID not available. Please try refreshing the page or logging in again.")
      }

      const result = await fetchFeedback({ studentId })

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch feedback data")
      }

      setFeedbackHistory(result.data || [])
    } catch (err) {
      setError(err.message)
      console.error("Error fetching feedback:", err)
    } finally {
      setLoading(false)
    }
  }

  // Refresh feedback data when modal closes
  const handleModalClose = () => {
    onFeedbackClose()
    setTimeout(() => {
      fetchFeedbackData()
    }, 500)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFeedbackData()
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "green"
      case "in_progress":
        return "blue"
      case "open":
        return "yellow"
      case "closed":
        return "gray"
      default:
        return "gray"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "red"
      case "high":
        return "orange"
      case "medium":
        return "yellow"
      case "low":
        return "green"
      default:
        return "gray"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return FiCheckCircle
      case "in_progress":
        return FiClock
      case "open":
        return FiAlertCircle
      case "closed":
        return FiClock
      default:
        return FiClock
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <Box p={6} bg="gray.50" minH="100vh" display="flex" justifyContent="center" alignItems="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading feedback data...</Text>
        </VStack>
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={6} bg="gray.50" minH="100vh">
        <Alert status="error" mb={4}>
          <AlertIcon />
          Error loading feedback data: {error}
        </Alert>
        <Button onClick={fetchFeedbackData} colorScheme="blue">
          Retry
        </Button>
      </Box>
    )
  }


  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
              Feedback
            </Text>
            <Text color="gray.600">Share your thoughts and help us improve campus services</Text>
          </Box>
          <Button leftIcon={<FiSend />} colorScheme="blue" onClick={onFeedbackOpen}>
            Submit Feedback
          </Button>
        </HStack>

        {/* Feedback History */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              My Feedback History
            </Text>

            {feedbackHistory.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Icon as={FiMessageSquare} boxSize={12} color="gray.400" mb={4} />
                <Text color="gray.500" fontSize="lg">
                  No feedback submitted yet
                </Text>
                <Text color="gray.400" fontSize="sm" mt={2}>
                  Submit your first feedback to get started
                </Text>
              </Box>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Message</Th>
                      <Th>Type</Th>
                      <Th>Priority</Th>
                      <Th>Status</Th>
                      <Th>Date</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {feedbackHistory.map((feedback) => (
                      <Tr key={feedback._id}>
                        <Td>
                          <Text fontSize="sm" maxW="300px" isTruncated>
                            {feedback.message}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme="blue" variant="outline" fontSize="xs">
                            {feedback.feedbackType}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={getPriorityColor(feedback.priority)} variant="subtle" fontSize="xs">
                            {feedback.priority}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack>
                            <Icon as={getStatusIcon(feedback.status)} color={`${getStatusColor(feedback.status)}.500`} boxSize={4} />
                            <Badge colorScheme={getStatusColor(feedback.status)} variant="subtle" fontSize="xs">
                              {feedback.status}
                            </Badge>
                          </HStack>
                        </Td>
                        <Td>
                          <Text fontSize="xs" color="gray.500">
                            {formatDate(feedback.createdAt)}
                          </Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={handleModalClose}
        onSuccess={() => fetchFeedbackData()}
      />
    </Box>
  )
}
