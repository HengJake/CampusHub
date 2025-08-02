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
  Grid,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react"
import { FiMessageSquare, FiSend, FiClock, FiCheckCircle, FiAlertCircle, FiStar } from "react-icons/fi"
import { FeedbackModal } from "../../component/student/FeedbackModal"
import { useState, useEffect } from "react"
import { useAuthStore } from "../../store/auth.js"

export default function Feedback() {
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const { isOpen: isFeedbackOpen, onOpen: onFeedbackOpen, onClose: onFeedbackClose } = useDisclosure()
  
  const [feedbackHistory, setFeedbackHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    inProgress: 0,
    avgRating: 0
  })
  const [newlySubmittedFeedback, setNewlySubmittedFeedback] = useState(null)

  const { getCurrentUser } = useAuthStore()

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
      
      // Debug logging to understand the current user state
      console.log("Current user state:", currentUser)
      
      // Wait for authentication to be ready
      if (!currentUser.isAuthenticated) {
        throw new Error("Please log in to view feedback")
      }
      
      // Get student ID using the helper function
      const studentId = getStudentId(currentUser)
      console.log("Student ID using helper function:", studentId)
      
      if (!studentId) {
        throw new Error("Student ID not available. Please try refreshing the page or logging in again.")
      }
      
      // Use the consistent student ID
      const response = await fetch(`/api/feedback/student/${studentId}`, {
        credentials: 'include'
      })
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch feedback data")
      }

      console.log("Feedback data received:", data.data)
      setFeedbackHistory(data.data || [])
      
      // Calculate stats
      const total = data.data?.length || 0
      const resolved = data.data?.filter(f => f.status === "resolved").length || 0
      const inProgress = data.data?.filter(f => f.status === "in_progress").length || 0
      
      setStats({
        total,
        resolved,
        inProgress,
        avgRating: 4.1 // This would come from a rating system if implemented
      })
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
    // Add a small delay to ensure the backend has processed the submission
    setTimeout(() => {
      fetchFeedbackData() // Refresh data after submitting new feedback
    }, 500)
  }

  // Handle successful feedback submission
  const handleFeedbackSuccess = () => {
    console.log("handleFeedbackSuccess called")
    // Set a flag to highlight newly submitted feedback
    setNewlySubmittedFeedback(Date.now())
    // Refresh the feedback data with a longer delay to ensure backend processing
    console.log("Refreshing feedback data...")
    setTimeout(() => {
      fetchFeedbackData()
    }, 1000)
  }

  useEffect(() => {
    // Add a small delay to ensure authentication is ready
    const timer = setTimeout(() => {
      fetchFeedbackData()
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  // Clear the newly submitted feedback highlight after 5 seconds
  useEffect(() => {
    if (newlySubmittedFeedback) {
      const timer = setTimeout(() => {
        setNewlySubmittedFeedback(null)
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [newlySubmittedFeedback])

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
              Student Feedback
            </Text>
            <Text color="gray.600">Share your thoughts and help us improve campus services</Text>
          </Box>
          <Button leftIcon={<FiSend />} colorScheme="blue" onClick={onFeedbackOpen}>
            Submit New Feedback
          </Button>
        </HStack>

        {/* Quick Stats */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody textAlign="center">
              <Icon as={FiMessageSquare} boxSize={8} color="blue.500" mb={2} />
              <Text fontSize="2xl" fontWeight="bold">
                {stats.total}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Total Submissions
              </Text>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody textAlign="center">
              <Icon as={FiCheckCircle} boxSize={8} color="green.500" mb={2} />
              <Text fontSize="2xl" fontWeight="bold">
                {stats.resolved}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Resolved Issues
              </Text>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody textAlign="center">
              <Icon as={FiClock} boxSize={8} color="blue.500" mb={2} />
              <Text fontSize="2xl" fontWeight="bold">
                {stats.inProgress}
              </Text>
              <Text fontSize="sm" color="gray.600">
                In Progress
              </Text>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody textAlign="center">
              <Icon as={FiStar} boxSize={8} color="yellow.500" mb={2} />
              <Text fontSize="2xl" fontWeight="bold">
                {stats.avgRating}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Avg Response Rating
              </Text>
            </CardBody>
          </Card>
        </Grid>

        {/* Feedback Categories */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              Feedback Categories
            </Text>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4}>
              {[
                { name: "Facilities & Infrastructure", icon: FiMessageSquare, color: "blue" },
                { name: "Academic Services", icon: FiMessageSquare, color: "green" },
                { name: "Transportation", icon: FiMessageSquare, color: "purple" },
                { name: "Technology & IT", icon: FiMessageSquare, color: "orange" },
                { name: "Dining Services", icon: FiMessageSquare, color: "pink" },
                { name: "Student Life", icon: FiMessageSquare, color: "teal" },
                { name: "Administration", icon: FiMessageSquare, color: "cyan" },
                { name: "Other", icon: FiMessageSquare, color: "gray" },
              ].map((category) => (
                <Box
                  key={category.name}
                  p={4}
                  bg={`${category.color}.50`}
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: `${category.color}.100` }}
                  onClick={onFeedbackOpen}
                >
                  <VStack spacing={2}>
                    <Icon as={category.icon} color={`${category.color}.500`} boxSize={6} />
                    <Text fontSize="sm" fontWeight="medium" textAlign="center">
                      {category.name}
                    </Text>
                  </VStack>
                </Box>
              ))}
            </Grid>
          </CardBody>
        </Card>

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
                      <Th>Subject & Date</Th>
                      <Th>Type</Th>
                      <Th>Priority</Th>
                      <Th>Status</Th>
                      <Th>Details</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {feedbackHistory.map((feedback) => (
                      <Tr 
                        key={feedback._id}
                        bg={newlySubmittedFeedback && feedback.createdAt && 
                            new Date(feedback.createdAt).getTime() > newlySubmittedFeedback - 10000 
                            ? "blue.50" : "transparent"}
                        transition="background-color 0.3s ease"
                      >
                        <Td>
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2}>
                              <Text fontWeight="medium" fontSize="sm">
                                {feedback.message?.split('\n')[0]?.substring(0, 40)}...
                              </Text>
                              {newlySubmittedFeedback && feedback.createdAt && 
                               new Date(feedback.createdAt).getTime() > newlySubmittedFeedback - 10000 && (
                                <Badge colorScheme="green" size="sm" fontSize="xs">
                                  NEW
                                </Badge>
                              )}
                            </HStack>
                            <Text fontSize="xs" color="gray.500">
                              {formatDate(feedback.createdAt)}
                            </Text>
                          </VStack>
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
                          <Text fontSize="sm" color="gray.600" maxW="200px" isTruncated>
                            {feedback.message?.split('\n').slice(1).join('\n') || feedback.message}
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

        {/* Feedback Guidelines */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              Feedback Guidelines
            </Text>
            <VStack align="start" spacing={3}>
              <HStack>
                <Icon as={FiCheckCircle} color="green.500" />
                <Text fontSize="sm">Be specific and provide detailed information about the issue or suggestion</Text>
              </HStack>
              <HStack>
                <Icon as={FiCheckCircle} color="green.500" />
                <Text fontSize="sm">Include location, time, and any relevant context</Text>
              </HStack>
              <HStack>
                <Icon as={FiCheckCircle} color="green.500" />
                <Text fontSize="sm">Use appropriate priority levels (urgent for safety issues only)</Text>
              </HStack>
              <HStack>
                <Icon as={FiCheckCircle} color="green.500" />
                <Text fontSize="sm">Be respectful and constructive in your feedback</Text>
              </HStack>
              <HStack>
                <Icon as={FiCheckCircle} color="green.500" />
                <Text fontSize="sm">Response time: 24-48 hours for urgent issues, 3-5 days for others</Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={handleModalClose} 
        onSuccess={handleFeedbackSuccess}
      />
    </Box>
  )
}
