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
  Icon,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Flex,
  IconButton,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react"
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiAward,
  FiEye,
  FiDownload,
  FiPrinter,
  FiRefreshCw,
  FiTrendingUp,
  FiSearch,
} from "react-icons/fi"
import { useState } from "react"
import { FaChartBar } from "react-icons/fa";

// Mock data for exams and results
const mockExamData = {
  studentProfile: {
    id: "STU001",
    name: "Alex Johnson",
    studentId: "2024CS001",
    program: "Computer Science",
    year: 3,
    semester: "Fall 2024",
  },

  examSchedule: [
    {
      id: "EX001",
      courseCode: "CS301",
      courseName: "Data Structures & Algorithms",
      date: "2024-02-15",
      time: "9:00 AM - 12:00 PM",
      duration: "3 hours",
      room: "Exam Hall A",
      building: "Main Academic Block",
      type: "Midterm",
      status: "scheduled",
      syllabus: "Chapters 1-8: Arrays, Linked Lists, Stacks, Queues, Trees, Graphs",
      instructions: "Bring calculator and ID card. No mobile phones allowed.",
      totalMarks: 100,
      passingMarks: 40,
      weightage: "30%",
    },
    {
      id: "EX002",
      courseCode: "CS302",
      courseName: "Database Management Systems",
      date: "2024-02-18",
      time: "2:00 PM - 5:00 PM",
      duration: "3 hours",
      room: "Exam Hall B",
      building: "Main Academic Block",
      type: "Final",
      status: "scheduled",
      syllabus: "Complete syllabus: ER Model, Normalization, SQL, Transactions, Indexing",
      instructions: "Open book exam - textbook allowed. Bring your own calculator.",
      totalMarks: 100,
      passingMarks: 40,
      weightage: "60%",
    },
    {
      id: "EX003",
      courseCode: "CS303",
      courseName: "Software Engineering",
      date: "2024-02-20",
      time: "10:00 AM - 1:00 PM",
      duration: "3 hours",
      room: "Exam Hall C",
      building: "Main Academic Block",
      type: "Final",
      status: "scheduled",
      syllabus: "All modules: SDLC, Requirements, Design, Testing, Project Management",
      instructions: "Closed book exam. Case study questions included.",
      totalMarks: 100,
      passingMarks: 40,
      weightage: "70%",
    },
    {
      id: "EX004",
      courseCode: "CS304",
      courseName: "Computer Networks",
      date: "2024-02-22",
      time: "9:00 AM - 12:00 PM",
      duration: "3 hours",
      room: "Exam Hall A",
      building: "Main Academic Block",
      type: "Final",
      status: "scheduled",
      syllabus: "Chapters 1-12: OSI Model, TCP/IP, Routing, Network Security",
      instructions: "Bring network calculator. Formula sheet provided.",
      totalMarks: 100,
      passingMarks: 40,
      weightage: "60%",
    },
    {
      id: "EX005",
      courseCode: "MATH301",
      courseName: "Linear Algebra",
      date: "2024-02-25",
      time: "2:00 PM - 5:00 PM",
      duration: "3 hours",
      room: "Exam Hall D",
      building: "Mathematics Block",
      type: "Final",
      status: "completed",
      syllabus: "Vector Spaces, Matrices, Eigenvalues, Linear Transformations",
      instructions: "Scientific calculator allowed. Show all working.",
      totalMarks: 100,
      passingMarks: 40,
      weightage: "80%",
    },
  ],

  academicResults: [
    {
      id: "AR001",
      semester: "Spring 2023",
      courses: [
        {
          courseCode: "CS201",
          courseName: "Programming Fundamentals",
          grade: "A",
          credits: 4,
          gpa: 4.0,
          marks: 92,
          totalMarks: 100,
          percentage: 92,
          examResults: [
            { type: "Midterm", marks: 45, total: 50, percentage: 90 },
            { type: "Final", marks: 47, total: 50, percentage: 94 },
          ],
        },
        {
          courseCode: "MATH201",
          courseName: "Calculus I",
          grade: "B+",
          credits: 3,
          gpa: 3.3,
          marks: 78,
          totalMarks: 100,
          percentage: 78,
          examResults: [
            { type: "Midterm", marks: 38, total: 50, percentage: 76 },
            { type: "Final", marks: 40, total: 50, percentage: 80 },
          ],
        },
        {
          courseCode: "PHY201",
          courseName: "Physics I",
          grade: "A-",
          credits: 3,
          gpa: 3.7,
          marks: 85,
          totalMarks: 100,
          percentage: 85,
          examResults: [
            { type: "Midterm", marks: 42, total: 50, percentage: 84 },
            { type: "Final", marks: 43, total: 50, percentage: 86 },
          ],
        },
        {
          courseCode: "ENG201",
          courseName: "Technical Writing",
          grade: "B",
          credits: 2,
          gpa: 3.0,
          marks: 75,
          totalMarks: 100,
          percentage: 75,
          examResults: [
            { type: "Midterm", marks: 36, total: 50, percentage: 72 },
            { type: "Final", marks: 39, total: 50, percentage: 78 },
          ],
        },
      ],
      semesterGPA: 3.6,
      totalCredits: 12,
      rank: 15,
      totalStudents: 120,
    },
    {
      id: "AR002",
      semester: "Fall 2023",
      courses: [
        {
          courseCode: "CS202",
          courseName: "Object Oriented Programming",
          grade: "A",
          credits: 4,
          gpa: 4.0,
          marks: 95,
          totalMarks: 100,
          percentage: 95,
          examResults: [
            { type: "Midterm", marks: 48, total: 50, percentage: 96 },
            { type: "Final", marks: 47, total: 50, percentage: 94 },
          ],
        },
        {
          courseCode: "MATH202",
          courseName: "Discrete Mathematics",
          grade: "A-",
          credits: 3,
          gpa: 3.7,
          marks: 82,
          totalMarks: 100,
          percentage: 82,
          examResults: [
            { type: "Midterm", marks: 40, total: 50, percentage: 80 },
            { type: "Final", marks: 42, total: 50, percentage: 84 },
          ],
        },
        {
          courseCode: "CS203",
          courseName: "Computer Organization",
          grade: "B+",
          credits: 3,
          gpa: 3.3,
          marks: 79,
          totalMarks: 100,
          percentage: 79,
          examResults: [
            { type: "Midterm", marks: 39, total: 50, percentage: 78 },
            { type: "Final", marks: 40, total: 50, percentage: 80 },
          ],
        },
        {
          courseCode: "STAT201",
          courseName: "Statistics",
          grade: "B",
          credits: 3,
          gpa: 3.0,
          marks: 73,
          totalMarks: 100,
          percentage: 73,
          examResults: [
            { type: "Midterm", marks: 35, total: 50, percentage: 70 },
            { type: "Final", marks: 38, total: 50, percentage: 76 },
          ],
        },
      ],
      semesterGPA: 3.5,
      totalCredits: 13,
      rank: 18,
      totalStudents: 125,
    },
    {
      id: "AR003",
      semester: "Spring 2024",
      courses: [
        {
          courseCode: "CS301",
          courseName: "Data Structures",
          grade: "A",
          credits: 4,
          gpa: 4.0,
          marks: 88,
          totalMarks: 100,
          percentage: 88,
          examResults: [
            { type: "Midterm", marks: 44, total: 50, percentage: 88 },
            { type: "Final", marks: 44, total: 50, percentage: 88 },
          ],
        },
        {
          courseCode: "CS302",
          courseName: "Algorithms",
          grade: "A-",
          credits: 3,
          gpa: 3.7,
          marks: 84,
          totalMarks: 100,
          percentage: 84,
          examResults: [
            { type: "Midterm", marks: 41, total: 50, percentage: 82 },
            { type: "Final", marks: 43, total: 50, percentage: 86 },
          ],
        },
        {
          courseCode: "CS303",
          courseName: "Operating Systems",
          grade: "B+",
          credits: 3,
          gpa: 3.3,
          marks: 77,
          totalMarks: 100,
          percentage: 77,
          examResults: [
            { type: "Midterm", marks: 37, total: 50, percentage: 74 },
            { type: "Final", marks: 40, total: 50, percentage: 80 },
          ],
        },
        {
          courseCode: "MATH301",
          courseName: "Linear Algebra",
          grade: "A",
          credits: 3,
          gpa: 4.0,
          marks: 91,
          totalMarks: 100,
          percentage: 91,
          examResults: [
            { type: "Midterm", marks: 45, total: 50, percentage: 90 },
            { type: "Final", marks: 46, total: 50, percentage: 92 },
          ],
        },
      ],
      semesterGPA: 3.75,
      totalCredits: 13,
      rank: 12,
      totalStudents: 130,
    },
  ],
}

export default function Exams() {
  const [selectedExam, setSelectedExam] = useState(null)
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const { isOpen: isExamOpen, onOpen: onExamOpen, onClose: onExamClose } = useDisclosure()

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const toast = useToast()

  // Calculate overall statistics
  const calculateOverallGPA = () => {
    let totalPoints = 0
    let totalCredits = 0

    mockExamData.academicResults.forEach((semester) => {
      semester.courses.forEach((course) => {
        totalPoints += course.gpa * course.credits
        totalCredits += course.credits
      })
    })

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00"
  }

  const getGradeColor = (grade) => {
    if (grade.startsWith("A")) return "green"
    if (grade.startsWith("B")) return "blue"
    if (grade.startsWith("C")) return "yellow"
    if (grade.startsWith("D")) return "orange"
    return "red"
  }

  const getPerformanceTrend = () => {
    const gpas = mockExamData.academicResults.map((sem) => sem.semesterGPA)
    if (gpas.length < 2) return { trend: "stable", change: 0 }

    const latest = gpas[gpas.length - 1]
    const previous = gpas[gpas.length - 2]
    const change = ((latest - previous) / previous) * 100

    return {
      trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
      change: Math.abs(change).toFixed(1),
    }
  }

  const handleRefresh = () => {
    setLastRefresh(new Date())
    toast({
      title: "Data Refreshed",
      description: "Exam and result data has been updated",
      status: "info",
      duration: 2000,
      isClosable: true,
    })
  }

  const handleExport = () => {
    toast({
      title: "Exporting Results",
      description: "Your academic transcript is being prepared for download",
      status: "success",
      duration: 3000,
      isClosable: true,
    })
  }

  const filteredResults = mockExamData.academicResults.filter((semester) => {
    if (selectedSemester === "all") return true
    return semester.semester === selectedSemester
  })

  const performanceTrend = getPerformanceTrend()

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
              Exams & Results
            </Text>
            <Text color="gray.600">View exam schedules and academic performance</Text>
          </Box>
          <HStack>
            <Text fontSize="sm" color="gray.500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </Text>
            <IconButton
              icon={<FiRefreshCw />}
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              aria-label="Refresh data"
            />
          </HStack>
        </Flex>

        {/* Performance Overview */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Cumulative GPA</StatLabel>
                <StatNumber color="green.500">{calculateOverallGPA()}</StatNumber>
                <StatHelpText>
                  <StatArrow type={performanceTrend.trend === "up" ? "increase" : "decrease"} />
                  {performanceTrend.change}% from last semester
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Total Credits</StatLabel>
                <StatNumber color="blue.500">
                  {mockExamData.academicResults.reduce((sum, sem) => sum + sem.totalCredits, 0)}
                </StatNumber>
                <StatHelpText>
                  <Icon as={FiAward} mr={1} />
                  Credits Earned
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Current Rank</StatLabel>
                <StatNumber color="purple.500">
                  {mockExamData.academicResults[mockExamData.academicResults.length - 1]?.rank || "N/A"}
                </StatNumber>
                <StatHelpText>
                  <Icon as={FiTrendingUp} mr={1} />
                  Out of {mockExamData.academicResults[mockExamData.academicResults.length - 1]?.totalStudents || "N/A"}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Upcoming Exams</StatLabel>
                <StatNumber color="orange.500">
                  {mockExamData.examSchedule.filter((exam) => exam.status === "scheduled").length}
                </StatNumber>
                <StatHelpText>
                  <Icon as={FiCalendar} mr={1} />
                  This Month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Main Tabs */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>
              <HStack>
                <Icon as={FiCalendar} />
                <Text>Exam Schedule</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Icon as={FiAward} />
                <Text>Academic Results</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Icon as={FaChartBar} />
                <Text>Performance Analytics</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Exam Schedule Tab */}
            <TabPanel>
              <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                <CardBody>
                  <HStack justify="space-between" mb={4}>
                    <Text fontSize="lg" fontWeight="semibold">
                      Upcoming Examinations
                    </Text>
                    <Button leftIcon={<FiPrinter />} size="sm" variant="outline">
                      Print Schedule
                    </Button>
                  </HStack>

                  <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={4}>
                    {mockExamData.examSchedule
                      .filter((exam) => exam.status === "scheduled")
                      .map((exam) => (
                        <Card key={exam.id} borderWidth="1px" borderColor="orange.200" bg="orange.50">
                          <CardBody>
                            <VStack align="stretch" spacing={3}>
                              <HStack justify="space-between">
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="bold" fontSize="lg">
                                    {exam.courseCode}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {exam.courseName}
                                  </Text>
                                </VStack>
                                <Badge
                                  colorScheme={exam.type === "Final" ? "red" : "blue"}
                                  variant="solid"
                                  fontSize="xs"
                                >
                                  {exam.type}
                                </Badge>
                              </HStack>

                              <Divider />

                              <VStack align="stretch" spacing={2}>
                                <HStack>
                                  <Icon as={FiCalendar} color="orange.500" />
                                  <Text fontWeight="medium">{exam.date}</Text>
                                </HStack>
                                <HStack>
                                  <Icon as={FiClock} color="orange.500" />
                                  <Text>{exam.time}</Text>
                                  <Text fontSize="sm" color="gray.600">
                                    ({exam.duration})
                                  </Text>
                                </HStack>
                                <HStack>
                                  <Icon as={FiMapPin} color="orange.500" />
                                  <VStack align="start" spacing={0}>
                                    <Text>{exam.room}</Text>
                                    <Text fontSize="sm" color="gray.600">
                                      {exam.building}
                                    </Text>
                                  </VStack>
                                </HStack>
                              </VStack>

                              <Divider />

                              <HStack justify="space-between">
                                <Badge colorScheme="blue" variant="outline">
                                  {exam.totalMarks} Marks
                                </Badge>
                                <Badge colorScheme="green" variant="outline">
                                  {exam.weightage} Weight
                                </Badge>
                              </HStack>

                              <Button
                                size="sm"
                                leftIcon={<FiEye />}
                                onClick={() => {
                                  setSelectedExam(exam)
                                  onExamOpen()
                                }}
                              >
                                View Details
                              </Button>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                  </Grid>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Academic Results Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* Controls */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                  <CardBody>
                    <HStack justify="space-between">
                      <HStack spacing={4}>
                        <InputGroup maxW="300px">
                          <InputLeftElement>
                            <Icon as={FiSearch} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </InputGroup>

                        <Select
                          maxW="200px"
                          value={selectedSemester}
                          onChange={(e) => setSelectedSemester(e.target.value)}
                        >
                          <option value="all">All Semesters</option>
                          {mockExamData.academicResults.map((sem) => (
                            <option key={sem.id} value={sem.semester}>
                              {sem.semester}
                            </option>
                          ))}
                        </Select>
                      </HStack>

                      <Button leftIcon={<FiDownload />} size="sm" variant="outline" onClick={handleExport}>
                        Download Transcript
                      </Button>
                    </HStack>
                  </CardBody>
                </Card>

                {/* Semester-wise Results */}
                <VStack spacing={6} align="stretch">
                  {filteredResults.map((semester) => (
                    <Card key={semester.id} bg={bgColor} borderColor={borderColor} borderWidth="1px">
                      <CardBody>
                        <HStack justify="space-between" mb={4}>
                          <Text fontSize="lg" fontWeight="bold">
                            {semester.semester}
                          </Text>
                          <HStack>
                            <Badge colorScheme="blue" variant="solid" fontSize="sm">
                              GPA: {semester.semesterGPA}
                            </Badge>
                            <Badge colorScheme="green" variant="outline" fontSize="sm">
                              {semester.totalCredits} Credits
                            </Badge>
                            <Badge colorScheme="purple" variant="outline" fontSize="sm">
                              Rank: {semester.rank}/{semester.totalStudents}
                            </Badge>
                          </HStack>
                        </HStack>

                        <TableContainer>
                          <Table variant="simple" size="sm">
                            <Thead>
                              <Tr>
                                <Th>Course</Th>
                                <Th>Credits</Th>
                                <Th>Marks</Th>
                                <Th>Grade</Th>
                                <Th>GPA Points</Th>
                                <Th>Performance</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {semester.courses
                                .filter(
                                  (course) =>
                                    course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()),
                                )
                                .map((course, index) => (
                                  <Tr key={index}>
                                    <Td>
                                      <VStack align="start" spacing={1}>
                                        <Text fontWeight="medium">{course.courseCode}</Text>
                                        <Text fontSize="sm" color="gray.600">
                                          {course.courseName}
                                        </Text>
                                      </VStack>
                                    </Td>
                                    <Td>{course.credits}</Td>
                                    <Td>
                                      <VStack align="start" spacing={1}>
                                        <Text fontWeight="medium">
                                          {course.marks}/{course.totalMarks}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                          {course.percentage}%
                                        </Text>
                                      </VStack>
                                    </Td>
                                    <Td>
                                      <Badge colorScheme={getGradeColor(course.grade)} variant="subtle" fontSize="sm">
                                        {course.grade}
                                      </Badge>
                                    </Td>
                                    <Td>{course.gpa.toFixed(1)}</Td>
                                    <Td>
                                      <Box w="100px">
                                        <Progress
                                          value={course.percentage}
                                          colorScheme={
                                            course.percentage >= 80
                                              ? "green"
                                              : course.percentage >= 60
                                                ? "blue"
                                                : "orange"
                                          }
                                          size="sm"
                                          borderRadius="full"
                                        />
                                        <Text fontSize="xs" color="gray.500" mt={1}>
                                          {course.percentage >= 80
                                            ? "Excellent"
                                            : course.percentage >= 60
                                              ? "Good"
                                              : "Average"}
                                        </Text>
                                      </Box>
                                    </Td>
                                  </Tr>
                                ))}
                            </Tbody>
                          </Table>
                        </TableContainer>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </VStack>
            </TabPanel>

            {/* Performance Analytics Tab */}
            <TabPanel>
              <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                {/* GPA Trend */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                  <CardBody>
                    <Text fontSize="lg" fontWeight="semibold" mb={4}>
                      GPA Trend Analysis
                    </Text>
                    <VStack spacing={4} align="stretch">
                      {mockExamData.academicResults.map((semester, index) => (
                        <Box key={semester.id} p={3} bg="gray.50" borderRadius="md">
                          <HStack justify="space-between" mb={2}>
                            <Text fontWeight="medium">{semester.semester}</Text>
                            <Badge colorScheme="blue" variant="solid">
                              {semester.semesterGPA}
                            </Badge>
                          </HStack>
                          <Progress
                            value={(semester.semesterGPA / 4.0) * 100}
                            colorScheme={
                              semester.semesterGPA >= 3.5 ? "green" : semester.semesterGPA >= 3.0 ? "blue" : "orange"
                            }
                            size="sm"
                            borderRadius="full"
                          />
                          <HStack justify="space-between" mt={2}>
                            <Text fontSize="sm" color="gray.600">
                              Rank: {semester.rank}/{semester.totalStudents}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {semester.totalCredits} Credits
                            </Text>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Subject Performance */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                  <CardBody>
                    <Text fontSize="lg" fontWeight="semibold" mb={4}>
                      Subject-wise Performance
                    </Text>
                    <VStack spacing={3} align="stretch">
                      {mockExamData.academicResults[mockExamData.academicResults.length - 1]?.courses.map((course) => (
                        <Box key={course.courseCode} p={3} bg="gray.50" borderRadius="md">
                          <HStack justify="space-between" mb={2}>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium" fontSize="sm">
                                {course.courseCode}
                              </Text>
                              <Text fontSize="xs" color="gray.600">
                                {course.courseName}
                              </Text>
                            </VStack>
                            <Badge colorScheme={getGradeColor(course.grade)} variant="solid">
                              {course.grade}
                            </Badge>
                          </HStack>
                          <Progress
                            value={course.percentage}
                            colorScheme={getGradeColor(course.grade)}
                            size="sm"
                            borderRadius="full"
                          />
                          <HStack justify="space-between" mt={2}>
                            <Text fontSize="xs" color="gray.600">
                              {course.percentage}%
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {course.gpa} GPA
                            </Text>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Exam Details Modal */}
      <Modal isOpen={isExamOpen} onClose={onExamClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Exam Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedExam && (
              <VStack spacing={4} align="stretch">
                <Box p={4} bg="orange.50" borderRadius="md">
                  <Text fontSize="lg" fontWeight="bold">
                    {selectedExam.courseCode} - {selectedExam.courseName}
                  </Text>
                  <Badge colorScheme={selectedExam.type === "Final" ? "red" : "blue"} mt={2}>
                    {selectedExam.type} Examination
                  </Badge>
                </Box>

                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      Date & Time
                    </Text>
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <Icon as={FiCalendar} color="orange.500" />
                        <Text>{selectedExam.date}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FiClock} color="orange.500" />
                        <Text>{selectedExam.time}</Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        Duration: {selectedExam.duration}
                      </Text>
                    </VStack>
                  </Box>

                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      Venue & Marks
                    </Text>
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <Icon as={FiMapPin} color="orange.500" />
                        <Text>{selectedExam.room}</Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        {selectedExam.building}
                      </Text>
                      <HStack>
                        <Badge colorScheme="blue" variant="outline">
                          {selectedExam.totalMarks} Marks
                        </Badge>
                        <Badge colorScheme="green" variant="outline">
                          {selectedExam.weightage}
                        </Badge>
                      </HStack>
                    </VStack>
                  </Box>
                </Grid>

                <Box>
                  <Text fontWeight="medium" mb={2}>
                    Syllabus Coverage
                  </Text>
                  <Text fontSize="sm">{selectedExam.syllabus}</Text>
                </Box>

                <Box>
                  <Text fontWeight="medium" mb={2}>
                    Instructions
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {selectedExam.instructions}
                  </Text>
                </Box>

                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize="sm">Important Reminders:</AlertTitle>
                    <AlertDescription fontSize="sm">
                      • Arrive 15 minutes before exam time
                      <br />• Bring valid student ID card
                      <br />• Mobile phones are not allowed in exam hall
                      <br />• Follow all exam regulations strictly
                    </AlertDescription>
                  </Box>
                </Alert>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button onClick={onExamClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
