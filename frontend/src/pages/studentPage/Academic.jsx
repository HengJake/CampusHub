"use client"

import {
  Box,
  Grid,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Progress,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react"
import {
  FiBook,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiSearch,
  FiAward,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi"
import {
  FaChartBar
} from "react-icons/fa"
import { useState } from "react"
import { useStudentStore } from "../../store/TBI/studentStore.js"

export default function Academic() {
  const { academicSchedule, examSchedule, attendanceRecords, academicResults, studentProfile } = useStudentStore()

  const [searchTerm, setSearchTerm] = useState("")
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  const getGradeColor = (grade) => {
    if (grade.startsWith("A")) return "green"
    if (grade.startsWith("B")) return "blue"
    if (grade.startsWith("C")) return "yellow"
    if (grade.startsWith("D")) return "orange"
    return "red"
  }

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 90) return { status: "excellent", color: "green" }
    if (percentage >= 80) return { status: "good", color: "blue" }
    if (percentage >= 70) return { status: "warning", color: "yellow" }
    return { status: "critical", color: "red" }
  }

  const filteredSchedule = academicSchedule.filter(
    (item) =>
      item.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.room.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const calculateGPA = () => {
    const totalPoints = academicResults.reduce((sum, result) => sum + result.gpa * result.credits, 0)
    const totalCredits = academicResults.reduce((sum, result) => sum + result.credits, 0)
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00"
  }

  return (
    <Box p={6} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
            Academic Services
          </Text>
          <Text color="gray.600">Manage your academic schedule, track attendance, and view results</Text>
        </Box>

        {/* Academic Stats */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <HStack justify="space-between">
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Current GPA
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    {calculateGPA()}
                  </Text>
                </Box>
                <Icon as={FiAward} boxSize={6} color="green.500" />
              </HStack>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <HStack justify="space-between">
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Enrolled Courses
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {academicSchedule.length}
                  </Text>
                </Box>
                <Icon as={FiBook} boxSize={6} color="blue.500" />
              </HStack>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <HStack justify="space-between">
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Upcoming Exams
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {examSchedule.length}
                  </Text>
                </Box>
                <Icon as={FiClock} boxSize={6} color="orange.500" />
              </HStack>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <HStack justify="space-between">
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Avg Attendance
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                    {Math.round(
                      attendanceRecords.reduce((acc, record) => acc + record.percentage, 0) / attendanceRecords.length,
                    )}
                    %
                  </Text>
                </Box>
                <Icon as={FaChartBar} boxSize={6} color="purple.500" />
              </HStack>
            </CardBody>
          </Card>
        </Grid>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>
              <HStack>
                <Icon as={FiCalendar} />
                <Text>Schedule</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Icon as={FiClock} />
                <Text>Exams</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Icon as={FaChartBar} />
                <Text>Attendance</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Icon as={FiAward} />
                <Text>Results</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Icon as={FiMapPin} />
                <Text>Classroom Finder</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Academic Schedule Tab */}
            <TabPanel>
              <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                <CardBody>
                  <HStack justify="space-between" mb={4}>
                    <Text fontSize="lg" fontWeight="semibold">
                      Academic Schedule - {studentProfile.semester}
                    </Text>
                    <InputGroup maxW="300px">
                      <InputLeftElement>
                        <Icon as={FiSearch} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        placeholder="Search courses, instructors, rooms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </HStack>

                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Course</Th>
                          <Th>Day</Th>
                          <Th>Time</Th>
                          <Th>Room</Th>
                          <Th>Instructor</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredSchedule.map((schedule) => (
                          <Tr key={schedule.id}>
                            <Td>
                              <Text fontWeight="medium">{schedule.course}</Text>
                            </Td>
                            <Td>
                              <Badge colorScheme="blue" variant="subtle">
                                {schedule.day}
                              </Badge>
                            </Td>
                            <Td>{schedule.time}</Td>
                            <Td>
                              <HStack>
                                <Icon as={FiMapPin} color="gray.400" boxSize={3} />
                                <Text>{schedule.room}</Text>
                              </HStack>
                            </Td>
                            <Td>{schedule.instructor}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Exam Schedule Tab */}
            <TabPanel>
              <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                <CardBody>
                  <Text fontSize="lg" fontWeight="semibold" mb={4}>
                    Upcoming Examinations
                  </Text>

                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Course</Th>
                          <Th>Date</Th>
                          <Th>Time</Th>
                          <Th>Room</Th>
                          <Th>Type</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {examSchedule.map((exam) => (
                          <Tr key={exam.id}>
                            <Td>
                              <Text fontWeight="medium">{exam.course}</Text>
                            </Td>
                            <Td>{exam.date}</Td>
                            <Td>{exam.time}</Td>
                            <Td>
                              <HStack>
                                <Icon as={FiMapPin} color="gray.400" boxSize={3} />
                                <Text>{exam.room}</Text>
                              </HStack>
                            </Td>
                            <Td>
                              <Badge colorScheme={exam.type === "Final" ? "red" : "blue"} variant="subtle">
                                {exam.type}
                              </Badge>
                            </Td>
                            <Td>
                              <Badge colorScheme="yellow" variant="subtle">
                                Scheduled
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Attendance Tab */}
            <TabPanel>
              <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                <CardBody>
                  <Text fontSize="lg" fontWeight="semibold" mb={4}>
                    Attendance Tracking
                  </Text>

                  <VStack spacing={4} align="stretch">
                    {attendanceRecords.map((record) => {
                      const attendanceStatus = getAttendanceStatus(record.percentage)
                      return (
                        <Box key={record.id} p={4} bg="gray.50" borderRadius="md">
                          <HStack justify="space-between" mb={3}>
                            <Text fontWeight="medium">{record.course}</Text>
                            <HStack>
                              <Icon
                                as={attendanceStatus.status === "critical" ? FiAlertCircle : FiCheckCircle}
                                color={`${attendanceStatus.color}.500`}
                              />
                              <Badge colorScheme={attendanceStatus.color} variant="subtle">
                                {record.percentage}%
                              </Badge>
                            </HStack>
                          </HStack>
                          <HStack justify="space-between" mb={2}>
                            <Text fontSize="sm" color="gray.600">
                              Classes Attended: {record.attended}/{record.total}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              Status: {attendanceStatus.status}
                            </Text>
                          </HStack>
                          <Progress value={record.percentage} colorScheme={attendanceStatus.color} size="sm" />
                        </Box>
                      )
                    })}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Results Tab */}
            <TabPanel>
              <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                <CardBody>
                  <HStack justify="space-between" mb={4}>
                    <Text fontSize="lg" fontWeight="semibold">
                      Academic Results
                    </Text>
                    <VStack align="end">
                      <Text fontSize="sm" color="gray.600">
                        Cumulative GPA
                      </Text>
                      <Text fontSize="xl" fontWeight="bold" color="green.500">
                        {calculateGPA()}
                      </Text>
                    </VStack>
                  </HStack>

                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Course</Th>
                          <Th>Semester</Th>
                          <Th>Credits</Th>
                          <Th>Grade</Th>
                          <Th>GPA Points</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {academicResults.map((result) => (
                          <Tr key={result.id}>
                            <Td>
                              <Text fontWeight="medium">{result.course}</Text>
                            </Td>
                            <Td>{result.semester}</Td>
                            <Td>{result.credits}</Td>
                            <Td>
                              <Badge colorScheme={getGradeColor(result.grade)} variant="subtle">
                                {result.grade}
                              </Badge>
                            </Td>
                            <Td>{result.gpa.toFixed(1)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Classroom Finder Tab */}
            <TabPanel>
              <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                <CardBody>
                  <Text fontSize="lg" fontWeight="semibold" mb={4}>
                    Classroom Finder
                  </Text>

                  <VStack spacing={4} align="stretch">
                    <InputGroup>
                      <InputLeftElement>
                        <Icon as={FiSearch} color="gray.400" />
                      </InputLeftElement>
                      <Input placeholder="Search for room number, building, or course..." />
                    </InputGroup>

                    <Box
                      h="400px"
                      bg="gray.100"
                      borderRadius="md"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <VStack spacing={3}>
                        <Icon as={FiMapPin} boxSize={12} color="gray.400" />
                        <Box color="gray.500" textAlign="center">
                          Interactive campus map with classroom locations
                          <br />
                          <Text fontSize="sm">(Map integration would be implemented here)</Text>
                        </Box>
                        <Button colorScheme="blue" size="sm">
                          Find My Next Class
                        </Button>
                      </VStack>
                    </Box>

                    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                      <Box p={4} bg="blue.50" borderRadius="md" textAlign="center">
                        <Icon as={FiMapPin} color="blue.500" boxSize={6} mb={2} />
                        <Text fontWeight="medium" mb={1}>
                          Quick Navigation
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Get directions to any classroom
                        </Text>
                      </Box>
                      <Box p={4} bg="green.50" borderRadius="md" textAlign="center">
                        <Icon as={FiClock} color="green.500" boxSize={6} mb={2} />
                        <Text fontWeight="medium" mb={1}>
                          Room Availability
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Check if rooms are currently free
                        </Text>
                      </Box>
                      <Box p={4} bg="purple.50" borderRadius="md" textAlign="center">
                        <Icon as={FiBook} color="purple.500" boxSize={6} mb={2} />
                        <Text fontWeight="medium" mb={1}>
                          Nearby Facilities
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Find restrooms, cafes, and more
                        </Text>
                      </Box>
                    </Grid>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  )
}
