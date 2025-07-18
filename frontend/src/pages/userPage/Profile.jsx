"use client"

import {
  Box,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  Avatar,
  Button,
  useColorModeValue,
  Grid,
  Badge,
  Divider,
  Icon,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react"
import { FiMail, FiPhone, FiMapPin, FiCalendar, FiEdit, FiDownload } from "react-icons/fi"
import { useStudentStore } from "../../store/TBI/studentStore.js"

export default function Profile() {
  const { studentProfile, academicResults, attendanceRecords, myBookings } = useStudentStore()
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  const calculateGPA = () => {
    const totalPoints = academicResults.reduce((sum, result) => sum + result.gpa * result.credits, 0)
    const totalCredits = academicResults.reduce((sum, result) => sum + result.credits, 0)
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00"
  }

  const getAttendanceAverage = () => {
    return Math.round(attendanceRecords.reduce((acc, record) => acc + record.percentage, 0) / attendanceRecords.length)
  }

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
            Student Profile
          </Text>
          <Text color="gray.600">Manage your personal information and academic records</Text>
        </Box>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap={6}>
          {/* Profile Information */}
          <VStack spacing={6}>
            {/* Basic Info Card */}
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
              <CardBody>
                <VStack spacing={4}>
                  <Avatar size="2xl" name={studentProfile.name} />
                  <VStack spacing={1}>
                    <Text fontSize="xl" fontWeight="bold">
                      {studentProfile.name}
                    </Text>
                    <Text color="gray.600">{studentProfile.studentId}</Text>
                    <Badge colorScheme="blue" variant="subtle">
                      {studentProfile.program}
                    </Badge>
                  </VStack>
                  <Button leftIcon={<FiEdit />} colorScheme="blue" size="sm">
                    Edit Profile
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* Contact Information */}
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
              <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  Contact Information
                </Text>
                <VStack spacing={3} align="stretch">
                  <HStack>
                    <Icon as={FiMail} color="gray.400" />
                    <Text fontSize="sm">{studentProfile.email}</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiPhone} color="gray.400" />
                    <Text fontSize="sm">+1 (555) 123-4567</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiMapPin} color="gray.400" />
                    <Text fontSize="sm">Dormitory Block A, Room 205</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiCalendar} color="gray.400" />
                    <Text fontSize="sm">
                      Year {studentProfile.year} • {studentProfile.semester}
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Academic Summary */}
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
              <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  Academic Summary
                </Text>
                <VStack spacing={4}>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.600">
                      Current GPA
                    </Text>
                    <Text fontWeight="bold" color="green.500">
                      {calculateGPA()}
                    </Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.600">
                      Total Credits
                    </Text>
                    <Text fontWeight="medium">{academicResults.reduce((sum, result) => sum + result.credits, 0)}</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.600">
                      Avg Attendance
                    </Text>
                    <Text fontWeight="medium">{getAttendanceAverage()}%</Text>
                  </HStack>
                  <Progress value={getAttendanceAverage()} colorScheme="blue" size="sm" w="full" />
                </VStack>
              </CardBody>
            </Card>
          </VStack>

          {/* Detailed Information */}
          <VStack spacing={6}>
            {/* Academic Performance */}
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
              <CardBody>
                <HStack justify="space-between" mb={4}>
                  <Text fontSize="lg" fontWeight="semibold">
                    Academic Performance
                  </Text>
                  <Button leftIcon={<FiDownload />} size="sm" variant="outline">
                    Download Transcript
                  </Button>
                </HStack>

                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Course</Th>
                        <Th>Semester</Th>
                        <Th>Grade</Th>
                        <Th>Credits</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {academicResults.map((result) => (
                        <Tr key={result.id}>
                          <Td>
                            <Text fontSize="sm" fontWeight="medium">
                              {result.course}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm">{result.semester}</Text>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={
                                result.grade.startsWith("A")
                                  ? "green"
                                  : result.grade.startsWith("B")
                                    ? "blue"
                                    : "yellow"
                              }
                              variant="subtle"
                            >
                              {result.grade}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontSize="sm">{result.credits}</Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>

            {/* Recent Activity */}
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
              <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  Recent Activity
                </Text>
                <VStack spacing={3} align="stretch">
                  {myBookings.slice(0, 5).map((booking) => (
                    <HStack key={booking.id} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          {booking.type}: {booking.resource}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {booking.date} • {booking.time}
                        </Text>
                      </VStack>
                      <Badge
                        colorScheme={
                          booking.status === "confirmed" ? "green" : booking.status === "pending" ? "yellow" : "red"
                        }
                        variant="subtle"
                      >
                        {booking.status}
                      </Badge>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            {/* Settings & Preferences */}
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
              <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  Settings & Preferences
                </Text>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm">Email Notifications</Text>
                    <Badge colorScheme="green" variant="subtle">
                      Enabled
                    </Badge>
                  </HStack>
                  <Divider />
                  <HStack justify="space-between">
                    <Text fontSize="sm">SMS Alerts</Text>
                    <Badge colorScheme="gray" variant="subtle">
                      Disabled
                    </Badge>
                  </HStack>
                  <Divider />
                  <HStack justify="space-between">
                    <Text fontSize="sm">Calendar Sync</Text>
                    <Badge colorScheme="blue" variant="subtle">
                      Google Calendar
                    </Badge>
                  </HStack>
                  <Divider />
                  <HStack justify="space-between">
                    <Text fontSize="sm">Privacy Settings</Text>
                    <Button size="xs" variant="outline">
                      Configure
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Grid>
      </VStack>
    </Box>
  )
}
