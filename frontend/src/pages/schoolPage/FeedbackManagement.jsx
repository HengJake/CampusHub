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
import { useServiceStore } from "../../store/service.js"
import React from "react"

export function FeedbackManagement() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [response, setResponse] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [activeTab, setActiveTab] = useState("unresponded") // "unresponded" or "responded"

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  // Use service store
  const {
    feedback,
    responds,
    loading,
    errors,
    fetchFeedback,
    fetchResponds,
    updateFeedback,
    createRespond
  } = useServiceStore()

  // Fetch feedback data from backend
  const loadFeedback = async () => {
    const result = await fetchFeedback()
    if (!result.success) {
      toast({
        title: "Error",
        description: result.message || "Failed to load feedback data",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Fetch responds data from backend
  const loadResponds = async () => {
    const result = await fetchResponds()
    if (!result.success) {
      toast({
        title: "Error",
        description: result.message || "Failed to load responses data",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Update feedback status
  const updateFeedbackStatus = async (id, status) => {
    const result = await updateFeedback(id, { status })
    if (result.success) {
      toast({
        title: "Success",
        description: "Feedback status updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to update feedback status",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Load feedback data on component mount
  useEffect(() => {
    loadFeedback()
    loadResponds()
  }, [])

  // Transform backend data to match frontend expectations
  const transformFeedbackData = (backendData) => {
    return backendData.map(item => {
      return ({
        id: item._id,
        studentName: item.studentId.userId.name || "Unknown Student", // Assuming studentId is populated
        category: item.feedbackType,
        subject: item.message?.substring(0, 50) + (item.message?.length > 50 ? "..." : ""),
        message: item.message,
        status: item.status,
        priority: item.priority,
        date: new Date(item.createdAt).toLocaleDateString(),
        studentId: item.studentId,
        schoolId: item.schoolId,
      });
    })
  }

  // Get response for a specific feedback
  const getResponseForFeedback = (feedbackId) => {
    return responds.find(respond => respond.feedbackId === feedbackId)
  }

  const transformedFeedback = transformFeedbackData(feedback)

  // Get feedback IDs that have responses
  const respondedFeedbackIds = responds.map(respond => respond.feedbackId)

  // Separate feedback into responded and unresponded
  const unrespondedFeedback = transformedFeedback.filter(item =>
    !respondedFeedbackIds.includes(item.id) &&
    item.status !== "resolved" &&
    item.status !== "closed"
  )

  const respondedFeedback = transformedFeedback.filter(item =>
    respondedFeedbackIds.includes(item.id) ||
    item.status === "resolved" ||
    item.status === "closed"
  )

  // Get the appropriate feedback list based on active tab
  const currentFeedbackList = activeTab === "unresponded" ? unrespondedFeedback : respondedFeedback

  const filteredFeedback = currentFeedbackList.filter((item) => {
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
        // Create a response record
        const respondData = {
          feedbackId: selectedFeedback.id,
          message: response,
          status: "sent"
        }

        const respondResult = await createRespond(respondData)

        if (respondResult.success) {
          // Update feedback status to resolved
          await updateFeedbackStatus(selectedFeedback.id, "resolved")

          toast({
            title: "Response Sent",
            description: "Your response has been sent to the student",
            status: "success",
            duration: 3000,
            isClosable: true,
          })
        } else {
          toast({
            title: "Error",
            description: respondResult.message || "Failed to send response",
            status: "error",
            duration: 3000,
            isClosable: true,
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to send response",
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
  const openCount = unrespondedFeedback.filter((f) => f && f.status === "open").length
  const inProgressCount = unrespondedFeedback.filter((f) => f && f.status === "in_progress").length
  const resolvedCount = respondedFeedback.filter((f) => f && f.status === "resolved").length
  const totalUnresponded = unrespondedFeedback.length
  const totalResponded = respondedFeedback.length

  if (loading.feedback) {
    return (
      <Box p={6} minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="#344E41" />
          <Text>Loading feedback data...</Text>
        </VStack>
      </Box>
    )
  }

  if (errors.feedback) {
    return (
      <Box p={6} minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Text color="red.500">Error: {errors.feedback}</Text>
          <Button onClick={loadFeedback} colorScheme="blue">
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
                    <StatLabel color="gray.600">Unresponded</StatLabel>
                    <StatNumber color="#E53E3E">{totalUnresponded}</StatNumber>
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
                    <StatLabel color="gray.600">Responded</StatLabel>
                    <StatNumber color="#48BB78">{totalResponded}</StatNumber>
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

        {/* Tabs and Filters */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <VStack spacing={4}>
              {/* Tabs */}
              <HStack spacing={0} w="full" borderBottom="1px solid" borderColor="gray.200">
                <Button
                  variant={activeTab === "unresponded" ? "solid" : "ghost"}
                  colorScheme={activeTab === "unresponded" ? "red" : "gray"}
                  borderRadius="0"
                  borderBottom={activeTab === "unresponded" ? "2px solid" : "none"}
                  borderColor="red.500"
                  onClick={() => setActiveTab("unresponded")}
                  flex={1}
                >
                  Unresponded ({totalUnresponded})
                </Button>
                <Button
                  variant={activeTab === "responded" ? "solid" : "ghost"}
                  colorScheme={activeTab === "responded" ? "green" : "gray"}
                  borderRadius="0"
                  borderBottom={activeTab === "responded" ? "2px solid" : "none"}
                  borderColor="green.500"
                  onClick={() => setActiveTab("responded")}
                  flex={1}
                >
                  Responded ({totalResponded})
                </Button>
              </HStack>

              {/* Filters */}
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
            </VStack>
          </CardBody>
        </Card>

        {/* Feedback Table */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
              {activeTab === "unresponded" ? "Unresponded" : "Responded"} Feedback List ({filteredFeedback.length})
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
                {filteredFeedback.map((item) => {
                  const response = getResponseForFeedback(item.id)
                  return (
                    <React.Fragment key={item?.id || Math.random()}>
                      <Tr>
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
                          {activeTab === "unresponded" && item?.status !== "resolved" && item?.status !== "closed" && (
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
                          {activeTab === "responded" && (
                            <Badge colorScheme="green" fontSize="xs">
                              Responded
                            </Badge>
                          )}
                        </Td>
                      </Tr>
                      {response && (
                        <Tr bg="gray.50">
                          <Td colSpan={7}>
                            <VStack align="stretch" spacing={2}>
                              <HStack justify="space-between">
                                <Text fontSize="sm" fontWeight="semibold" color="green.600">
                                  Response:
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {new Date(response.createdAt).toLocaleDateString()}
                                </Text>
                              </HStack>
                              <Text fontSize="sm" p={3} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
                                {response.message}
                              </Text>
                            </VStack>
                          </Td>
                        </Tr>
                      )}
                    </React.Fragment>
                  )
                })}
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
