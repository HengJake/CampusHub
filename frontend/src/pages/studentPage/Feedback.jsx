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
  Badge,
  Icon,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  SimpleGrid,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Flex,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Divider,
  useToast,
} from "@chakra-ui/react"
import { FiMessageSquare, FiSend, FiClock, FiCheckCircle, FiAlertCircle, FiSearch, FiFilter } from "react-icons/fi"
import { FeedbackModal } from "../../component/student/FeedbackModal"
import { useState, useEffect } from "react"
import { useAuthStore } from "../../store/auth.js"
import { useServiceStore } from "../../store/service.js"

export default function Feedback() {
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const cardBg = useColorModeValue("white", "gray.700")
  const { isOpen: isFeedbackOpen, onOpen: onFeedbackOpen, onClose: onFeedbackClose } = useDisclosure()
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure()

  const [feedbackHistory, setFeedbackHistory] = useState([])
  const [filteredFeedback, setFilteredFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFeedback, setSelectedFeedback] = useState(null)

  // Filter and search states
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  const { getCurrentUser } = useAuthStore()
  const { fetchFeedbackByStudentId, feedback } = useServiceStore()
  const toast = useToast()

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

      const result = await fetchFeedbackByStudentId(studentId)

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch feedback data")
      }

      setFeedbackHistory(result.data || [])
      setFilteredFeedback(result.data || [])
    } catch (err) {
      setError(err.message)
      console.error("Error fetching feedback:", err)
    } finally {
      setLoading(false)
    }
  }

  // Apply filters and search
  useEffect(() => {
    let filtered = [...feedbackHistory]

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter(item => item.feedbackType === typeFilter)
    }

    // Search by message
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.message.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort the filtered results
    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt)
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt)
      } else if (sortBy === "priority") {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority?.toLowerCase()] - priorityOrder[a.priority?.toLowerCase()]
      }
      return 0
    })

    setFilteredFeedback(filtered)
  }, [feedbackHistory, statusFilter, typeFilter, searchQuery, sortBy])

  // Refresh feedback data when modal closes
  const handleModalClose = () => {
    onFeedbackClose()
    setTimeout(() => {
      fetchFeedbackData()
    }, 500)
  }

  // Handle feedback card click
  const handleFeedbackClick = (feedback) => {
    setSelectedFeedback(feedback)
    onDetailOpen()
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
        return "red"
      case "medium":
        return "orange"
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

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  const truncateMessage = (message, maxLength = 100) => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + "..."
  }

  const clearFilters = () => {
    setStatusFilter("all")
    setTypeFilter("all")
    setSearchQuery("")
    setSortBy("newest")
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
    <Box minH="100vh">
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

        {/* Filters and Search */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="semibold">
                Filters & Search
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                {/* Search Input */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Search Message</Text>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiSearch} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search feedback..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>
                </Box>

                {/* Status Filter */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Status</Text>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </Select>
                </Box>

                {/* Type Filter */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Type</Text>
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="complaint">Complaint</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="request">Request</option>
                    <option value="general">General</option>
                  </Select>
                </Box>

                {/* Sort Options */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Sort By</Text>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="priority">Priority (High → Low)</option>
                  </Select>
                </Box>
              </SimpleGrid>

              {/* Clear Filters Button */}
              <Flex justify="flex-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  leftIcon={<FiFilter />}
                >
                  Clear Filters
                </Button>
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        {/* Feedback Cards */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              My Feedback History ({filteredFeedback.length})
            </Text>

            {filteredFeedback.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Icon as={FiMessageSquare} boxSize={12} color="gray.400" mb={4} />
                <Text color="gray.500" fontSize="lg">
                  {feedbackHistory.length === 0 ? "No feedback submitted yet" : "No feedback matches your filters"}
                </Text>
                <Text color="gray.400" fontSize="sm" mt={2}>
                  {feedbackHistory.length === 0
                    ? "Submit your first feedback to get started"
                    : "Try adjusting your filters or search terms"
                  }
                </Text>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {filteredFeedback.map((feedback) => (
                  <Card
                    key={feedback._id}
                    bg={cardBg}
                    borderColor={borderColor}
                    borderWidth="1px"
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                      transform: "translateY(-2px)",
                      shadow: "lg",
                      borderColor: "blue.300"
                    }}
                    onClick={() => handleFeedbackClick(feedback)}
                  >
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        {/* Header with Type and Date */}
                        <Flex justify="space-between" align="start">
                          <Badge colorScheme="blue" variant="outline" fontSize="xs">
                            {feedback.feedbackType}
                          </Badge>
                          <Text fontSize="xs" color="gray.500">
                            {formatDate(feedback.createdAt)}
                          </Text>
                        </Flex>

                        {/* Message */}
                        <Box>
                          <Text fontSize="sm" color="gray.700" lineHeight="1.4">
                            {truncateMessage(feedback.message, 120)}
                          </Text>
                          {feedback.message.length > 120 && (
                            <Text fontSize="xs" color="blue.500" mt={1}>
                              Read More
                            </Text>
                          )}
                        </Box>

                        {/* Priority and Status */}
                        <HStack justify="space-between">
                          <Badge
                            colorScheme={getPriorityColor(feedback.priority)}
                            variant="subtle"
                            fontSize="xs"
                          >
                            {feedback.priority}
                          </Badge>
                          <HStack spacing={1}>
                            <Icon
                              as={getStatusIcon(feedback.status)}
                              color={`${getStatusColor(feedback.status)}.500`}
                              boxSize={3}
                            />
                            <Badge
                              colorScheme={getStatusColor(feedback.status)}
                              variant="subtle"
                              fontSize="xs"
                            >
                              {feedback.status}
                            </Badge>
                          </HStack>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
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

      {/* Feedback Detail Drawer */}
      <Drawer
        isOpen={isDetailOpen}
        placement="right"
        onClose={onDetailClose}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            Feedback Details
          </DrawerHeader>

          <DrawerBody>
            {selectedFeedback && (
              <VStack spacing={4} align="stretch">
                {/* Feedback Type */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
                    Feedback Type
                  </Text>
                  <Badge colorScheme="blue" variant="outline">
                    {selectedFeedback.feedbackType}
                  </Badge>
                </Box>

                {/* Priority */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
                    Priority
                  </Text>
                  <Badge
                    colorScheme={getPriorityColor(selectedFeedback.priority)}
                    variant="subtle"
                  >
                    {selectedFeedback.priority}
                  </Badge>
                </Box>

                {/* Status */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
                    Status
                  </Text>
                  <HStack>
                    <Icon
                      as={getStatusIcon(selectedFeedback.status)}
                      color={`${getStatusColor(selectedFeedback.status)}.500`}
                      boxSize={4}
                    />
                    <Badge
                      colorScheme={getStatusColor(selectedFeedback.status)}
                      variant="subtle"
                    >
                      {selectedFeedback.status}
                    </Badge>
                  </HStack>
                </Box>

                <Divider />

                {/* Full Message */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                    Message
                  </Text>
                  <Text fontSize="sm" color="gray.700" lineHeight="1.6">
                    {selectedFeedback.message}
                  </Text>
                </Box>

                {/* School Name */}
                {selectedFeedback.schoolName && (
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
                      School
                    </Text>
                    <Text fontSize="sm" color="gray.700">
                      {selectedFeedback.schoolName}
                    </Text>
                  </Box>
                )}

                {/* Timestamps */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
                    Submitted At
                  </Text>
                  <Text fontSize="sm" color="gray.700">
                    {formatDateTime(selectedFeedback.createdAt)}
                  </Text>
                </Box>

                {selectedFeedback.updatedAt && selectedFeedback.updatedAt !== selectedFeedback.createdAt && (
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
                      Last Updated
                    </Text>
                    <Text fontSize="sm" color="gray.700">
                      {formatDateTime(selectedFeedback.updatedAt)}
                    </Text>
                  </Box>
                )}

                {/* Admin Response/Notes */}
                {selectedFeedback.adminResponse && (
                  <>
                    <Divider />
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                        Admin Response
                      </Text>
                      <Text fontSize="sm" color="gray.700" lineHeight="1.6">
                        {selectedFeedback.adminResponse}
                      </Text>
                    </Box>
                  </>
                )}

                {selectedFeedback.notes && (
                  <>
                    <Divider />
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                        Notes
                      </Text>
                      <Text fontSize="sm" color="gray.700" lineHeight="1.6">
                        {selectedFeedback.notes}
                      </Text>
                    </Box>
                  </>
                )}
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}
