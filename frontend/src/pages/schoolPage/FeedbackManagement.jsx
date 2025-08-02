import {
  Box,
  Button,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  VStack,
  HStack,
  Select,
  Textarea,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  Spinner,
} from "@chakra-ui/react"
import { FiMessageSquare, FiClock, FiCheckCircle, FiAlertCircle } from "react-icons/fi"
import { useState, useEffect } from "react"

export function FeedbackManagement() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [response, setResponse] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  const API_BASE_URL = "http://localhost:5000/api"

  // Fetch feedback data from backend
  const fetchFeedback = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error('Failed to fetch feedback data')
      }
      const data = await response.json()
      setFeedback(data.data || [])
    } catch (error) {
      console.error('Error fetching feedback:', error)
      setError(error.message)
      toast({
        title: "Error",
        description: "Failed to load feedback data",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  // Update feedback status
  const updateFeedbackStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update feedback status')
      }
      
      // Refresh the feedback list
      await fetchFeedback()
      
      toast({
        title: "Success",
        description: "Feedback status updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error updating feedback status:', error)
      toast({
        title: "Error",
        description: "Failed to update feedback status",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Load feedback data on component mount
  useEffect(() => {
    fetchFeedback()
  }, [])

  // Transform backend data to match frontend expectations
  const transformFeedbackData = (backendData) => {
    return backendData.map(item => ({
      id: item._id,
      studentName: item.studentId?.name || "Unknown Student", // Assuming studentId is populated
      category: item.feedbackType,
      subject: item.message?.substring(0, 50) + (item.message?.length > 50 ? "..." : ""),
      message: item.message,
      status: item.status,
      priority: item.priority,
      date: new Date(item.createdAt).toLocaleDateString(),
      studentId: item.studentId,
      schoolId: item.schoolId,
    }))
  }

  const transformedFeedback = transformFeedbackData(feedback)

  const filteredFeedback = transformedFeedback.filter((item) => {
    if (!item || typeof item !== 'object') return false;
    const status = item.status || "";
    const category = item.category || "";
    const matchesStatus = statusFilter === "All" || status === statusFilter;
    const matchesCategory = categoryFilter === "All" || category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  const handleRespond = (feedbackItem) => {
    setSelectedFeedback(feedbackItem)
    onOpen()
  }

  const submitResponse = async () => {
    if (!response.trim()) {
      toast({
        title: "Error",
        description: "Please enter a response",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (selectedFeedback) {
      try {
        // Update feedback status to resolved
        await updateFeedbackStatus(selectedFeedback.id, "resolved")
        
        // Here you could also create a response record using the respond API
        // For now, we'll just update the status
        
        toast({
          title: "Response Sent",
          description: "Your response has been sent to the student",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to update feedback status.",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
    }
    
    setResponse("")
    setSelectedFeedback(null)
    onClose()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "red"
      case "in_progress":
        return "yellow"
      case "resolved":
        return "green"
      case "closed":
        return "gray"
      default:
        return "gray"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "red"
      case "Medium":
        return "yellow"
      case "Low":
        return "green"
      case "Urgent":
        return "red"
      default:
        return "gray"
    }
  }

  // Calculate feedback counts
  const openCount = transformedFeedback.filter((f) => f && f.status === "open").length
  const inProgressCount = transformedFeedback.filter((f) => f && f.status === "in_progress").length
  const resolvedCount = transformedFeedback.filter((f) => f && f.status === "resolved").length

  if (loading) {
    return (
      <Box p={6} minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="#344E41" />
          <Text>Loading feedback data...</Text>
        </VStack>
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={6} minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Text color="red.500">Error: {error}</Text>
          <Button onClick={fetchFeedback} colorScheme="blue">
            Retry
          </Button>
        </VStack>
      </Box>
    )
  }

  return (
    <Box p={6} minH="100vh" flex={1}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="#333333">
              Feedback Management
            </Text>
            <Text color="gray.600">Manage student feedback and responses</Text>
          </Box>
        </HStack>

        {/* Stats Cards */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack justify="space-between">
                  <Box>
                    <StatLabel color="gray.600">Total Feedback</StatLabel>
                    <StatNumber color="#344E41">{transformedFeedback.length}</StatNumber>
                    <StatHelpText>All time</StatHelpText>
                  </Box>
                  <Box color="#344E41" fontSize="2xl">
                    <FiMessageSquare />
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack justify="space-between">
                  <Box>
                    <StatLabel color="gray.600">Open</StatLabel>
                    <StatNumber color="#E53E3E">{openCount}</StatNumber>
                    <StatHelpText>Needs attention</StatHelpText>
                  </Box>
                  <Box color="#E53E3E" fontSize="2xl">
                    <FiAlertCircle />
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack justify="space-between">
                  <Box>
                    <StatLabel color="gray.600">In Progress</StatLabel>
                    <StatNumber color="#ED8936">{inProgressCount}</StatNumber>
                    <StatHelpText>Being handled</StatHelpText>
                  </Box>
                  <Box color="#ED8936" fontSize="2xl">
                    <FiClock />
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack justify="space-between">
                  <Box>
                    <StatLabel color="gray.600">Resolved</StatLabel>
                    <StatNumber color="#48BB78">{resolvedCount}</StatNumber>
                    <StatHelpText>Completed</StatHelpText>
                  </Box>
                  <Box color="#48BB78" fontSize="2xl">
                    <FiCheckCircle />
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Filters */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <HStack spacing={4}>
              <Select w="200px" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </Select>
              <Select w="200px" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="All">All Categories</option>
                <option value="complaint">Complaint</option>
                <option value="compliment">Compliment</option>
                <option value="suggestion">Suggestion</option>
                <option value="query">Query</option>
                <option value="issue">Issue</option>
              </Select>
            </HStack>
          </CardBody>
        </Card>

        {/* Feedback Table */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
              Feedback List ({filteredFeedback.length})
            </Text>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Student</Th>
                  <Th>Category</Th>
                  <Th>Subject</Th>
                  <Th>Priority</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredFeedback.map((item) => (
                  <Tr key={item?.id || Math.random()}>
                    <Td>
                      <Text fontWeight="medium">{item?.studentName || "-"}</Text>
                    </Td>
                    <Td>
                      <Badge colorScheme="blue">{item?.category || "-"}</Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{item?.subject || "-"}</Text>
                    </Td>
                    <Td>
                      <Badge colorScheme={getPriorityColor(item?.priority)}>{item?.priority || "-"}</Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(item?.status)}>{item?.status || "-"}</Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{item?.date || "-"}</Text>
                    </Td>
                    <Td>
                      {item?.status !== "resolved" && item?.status !== "closed" && (
                        <Button
                          size="sm"
                          bg="#344E41"
                          color="white"
                          _hover={{ bg: "#2a3d33" }}
                          onClick={() => handleRespond(item)}
                        >
                          Respond
                        </Button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        {/* Response Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Respond to Feedback</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedFeedback && (
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontWeight="semibold">From: {selectedFeedback?.studentName || "-"}</Text>
                    <Text fontSize="sm" color="gray.600">
                      Subject: {selectedFeedback?.subject || "-"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" mb={2}>
                      Original Message:
                    </Text>
                    <Text fontSize="sm" p={3} bg="gray.50" borderRadius="md">
                      {selectedFeedback?.message || "-"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" mb={2}>
                      Your Response:
                    </Text>
                    <Textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Type your response here..."
                      rows={4}
                    />
                  </Box>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button bg="#344E41" color="white" _hover={{ bg: "#2a3d33" }} onClick={submitResponse}>
                Send Response
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  )
}
