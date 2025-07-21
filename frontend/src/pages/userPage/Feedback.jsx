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
} from "@chakra-ui/react"
import { FiMessageSquare, FiSend, FiClock, FiCheckCircle, FiAlertCircle, FiStar } from "react-icons/fi"
import { FeedbackModal } from "../../component/student/FeedbackModal"

const mockFeedbackHistory = [
  {
    id: "FB001",
    subject: "Library WiFi Issues",
    category: "Technology & IT",
    status: "resolved",
    priority: "medium",
    date: "2024-01-10",
    response: "WiFi routers have been upgraded. Issue resolved.",
  },
  {
    id: "FB002",
    subject: "Cafeteria Food Quality",
    category: "Dining Services",
    status: "in-progress",
    priority: "low",
    date: "2024-01-12",
    response: "We are reviewing menu options with our catering partner.",
  },
  {
    id: "FB003",
    subject: "Parking Space Shortage",
    category: "Facilities & Infrastructure",
    status: "pending",
    priority: "high",
    date: "2024-01-14",
    response: null,
  },
]

export default function Feedback() {
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const { isOpen: isFeedbackOpen, onOpen: onFeedbackOpen, onClose: onFeedbackClose } = useDisclosure()

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "green"
      case "in-progress":
        return "blue"
      case "pending":
        return "yellow"
      case "rejected":
        return "red"
      default:
        return "gray"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
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
      case "in-progress":
        return FiClock
      case "pending":
        return FiAlertCircle
      default:
        return FiClock
    }
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
                {mockFeedbackHistory.length}
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
                {mockFeedbackHistory.filter((f) => f.status === "resolved").length}
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
                {mockFeedbackHistory.filter((f) => f.status === "in-progress").length}
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
                4.2
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

            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Subject</Th>
                    <Th>Category</Th>
                    <Th>Priority</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                    <Th>Response</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {mockFeedbackHistory.map((feedback) => (
                    <Tr key={feedback.id}>
                      <Td>
                        <Text fontWeight="medium">{feedback.subject}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme="blue" variant="outline">
                          {feedback.category}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={getPriorityColor(feedback.priority)} variant="subtle">
                          {feedback.priority}
                        </Badge>
                      </Td>
                      <Td>{feedback.date}</Td>
                      <Td>
                        <HStack>
                          <Icon as={getStatusIcon(feedback.status)} color={`${getStatusColor(feedback.status)}.500`} />
                          <Badge colorScheme={getStatusColor(feedback.status)} variant="subtle">
                            {feedback.status}
                          </Badge>
                        </HStack>
                      </Td>
                      <Td>
                        {feedback.response ? (
                          <Text fontSize="sm" color="gray.600" maxW="200px" isTruncated>
                            {feedback.response}
                          </Text>
                        ) : (
                          <Text fontSize="sm" color="gray.400">
                            Awaiting response
                          </Text>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
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
      <FeedbackModal isOpen={isFeedbackOpen} onClose={onFeedbackClose} />
    </Box>
  )
}
