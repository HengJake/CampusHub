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
} from "@chakra-ui/react"
import { FiMessageSquare, FiClock, FiCheckCircle, FiAlertCircle } from "react-icons/fi"
import { useState } from "react"
import { useServiceStore } from "../../store/service"
import { useAdminStore } from "../../store/TBI/adminStore";

export function FeedbackManagement() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [response, setResponse] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  // Defensive: Get feedback and updateFeedbackStatus from admin store
  const { feedback = [], updateFeedbackStatus } = useAdminStore();
  const safeFeedback = Array.isArray(feedback) ? feedback : [];

  const filteredFeedback = safeFeedback.filter((item) => {
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

  const submitResponse = () => {
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
    if (selectedFeedback && typeof updateFeedbackStatus === 'function') {
      try {
        updateFeedbackStatus(selectedFeedback.id, "Resolved")
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
    } else {
      toast({
        title: "Error",
        description: "Feedback status update function is unavailable.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
    setResponse("")
    setSelectedFeedback(null)
    onClose()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "red"
      case "In Progress":
        return "yellow"
      case "Resolved":
        return "green"
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
      default:
        return "gray"
    }
  }

  // Defensive: fallback for feedback counts
  const openCount = safeFeedback.filter((f) => f && f.status === "Open").length
  const inProgressCount = safeFeedback.filter((f) => f && f.status === "In Progress").length
  const resolvedCount = safeFeedback.filter((f) => f && f.status === "Resolved").length

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
                    <StatNumber color="#344E41">{safeFeedback.length}</StatNumber>
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
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </Select>
              <Select w="200px" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="All">All Categories</option>
                <option value="Facility">Facility</option>
                <option value="Service">Service</option>
                <option value="Technical">Technical</option>
                <option value="Other">Other</option>
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
                      {item?.status !== "Resolved" && (
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
