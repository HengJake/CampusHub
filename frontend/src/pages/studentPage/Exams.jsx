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
  Stack,
  useBreakpointValue,
  Spinner,
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
import { useState, useEffect } from "react"
import { FaChartBar } from "react-icons/fa"
import { useAcademicStore } from "../../store/academic"
import { useAuthStore } from "../../store/auth"

export default function Exams() {
  const [selectedExam, setSelectedExam] = useState(null)
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const { isOpen: isExamOpen, onOpen: onExamOpen, onClose: onExamClose } = useDisclosure()

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const toast = useToast()

  // Academic store
  const {
    examSchedules,
    results,
    semesters,
    modules,
    courses,
    loading,
    fetchExamSchedules,
    fetchResults,
    fetchSemesters,
    fetchModules,
    fetchCourses,
  } = useAcademicStore()

  // Auth store
  const { getCurrentUser } = useAuthStore()
  const currentUser = getCurrentUser()

  // Get current user/student ID
  const currentStudentId = currentUser.studentId

  // Responsive breakpoint values
  const headerDirection = useBreakpointValue({ base: "column", md: "row" })
  const statsGridCols = useBreakpointValue({ base: "1fr", sm: "repeat(1, 1fr)", lg: "repeat(3, 1fr)" })
  const examGridCols = useBreakpointValue({ base: "1fr", lg: "repeat(2, 1fr)" })
  const analyticsGridCols = useBreakpointValue({ base: "1fr", lg: "repeat(2, 1fr)" })
  const controlsDirection = useBreakpointValue({ base: "column", md: "row" })
  const modalSize = useBreakpointValue({ base: "full", md: "lg" })

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchExamSchedules(),
          fetchResults(),
          fetchSemesters(),
          fetchModules(),
          fetchCourses(),
        ])
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load exam data",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
    }

    fetchData()
  }, [fetchExamSchedules, fetchResults, fetchSemesters, fetchModules, fetchCourses, toast])

  // Calculate overall statistics
  const calculateOverallGPA = () => {
    if (!results || results.length === 0) return "0.00"

    // Filter for current student only
    const currentStudentResults = results.filter((result) =>
      result.studentId?._id === currentStudentId
    )

    if (currentStudentResults.length === 0) return "0.00"

    let totalPoints = 0
    let totalCredits = 0

    currentStudentResults.forEach((result) => {
      if (result.gpa && result.creditHours) {
        totalPoints += result.gpa * result.creditHours
        totalCredits += result.creditHours
      }
    })

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00"
  }

  const getGradeColor = (grade) => {
    if (!grade) return "gray"
    if (grade.startsWith("A")) return "green"
    if (grade.startsWith("B")) return "blue"
    if (grade.startsWith("C")) return "yellow"
    if (grade.startsWith("D")) return "orange"
    return "red"
  }

  const getPerformanceTrend = () => {
    if (!results || results.length < 2) return { trend: "stable", change: 0 }

    // Filter for current student only
    const currentStudentResults = results.filter((result) =>
      result.studentId?._id === currentStudentId
    )

    if (currentStudentResults.length < 2) return { trend: "stable", change: 0 }

    const sortedResults = [...currentStudentResults].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    const recentResults = sortedResults.slice(-2)

    if (recentResults.length < 2) return { trend: "stable", change: 0 }

    const latest = recentResults[recentResults.length - 1].gpa || 0
    const previous = recentResults[0].gpa || 0

    if (previous === 0) return { trend: "stable", change: 0 }

    const change = ((latest - previous) / previous) * 100

    return {
      trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
      change: Math.abs(change).toFixed(1),
    }
  }

  const handleRefresh = async () => {
    try {
      await Promise.all([
        fetchExamSchedules(),
        fetchResults(),
        fetchSemesters(),
        fetchModules(),
        fetchCourses(),
      ])
      setLastRefresh(new Date())
      toast({
        title: "Data Refreshed",
        description: "Exam and result data has been updated",
        status: "success",
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
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

  // Filter results for current student only
  const currentStudentResults = results.filter((result) =>
    result.studentId?._id === currentStudentId
  )



  // Filter exam schedules by status
  const upcomingExams = examSchedules.filter((exam) => exam?.intakeCourseId?._id === currentUser.student.intakeCourseId)
  const completedExams = examSchedules.filter((exam) => exam.status === "completed")

  const performanceTrend = getPerformanceTrend()

  // Group results by semester (only for current student)
  const resultsBySemester = currentStudentResults.reduce((acc, result) => {
    const semesterKey = result.semesterId?._id || "unknown"


    if (!acc[semesterKey]) {
      acc[semesterKey] = {
        semester: result.semesterId,
        courses: [],
        semesterGPA: 0,
        totalCredits: 0,
      }
    }
    acc[semesterKey].courses.push(result)
    acc[semesterKey].totalCredits += result.creditHours || 0
    return acc
  }, {})

  // Calculate semester GPA for each group
  Object.values(resultsBySemester).forEach((semester) => {
    const totalPoints = semester.courses.reduce((sum, course) => {
      return sum + ((course.gpa || 0) * (course.creditHours || 0))
    }, 0)
    semester.semesterGPA = semester.totalCredits > 0 ? (totalPoints / semester.totalCredits).toFixed(2) : "0.00"
  })

  if (loading.examSchedules || loading.results) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading exam data...</Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Stack direction={headerDirection} justify="space-between" align={{ base: "stretch", md: "center" }} spacing={4}>
          <Box>
            <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="gray.800" mb={2}>
              Exams & Results
            </Text>
            <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
              View exam schedules and academic performance
            </Text>
          </Box>
          <HStack spacing={2}>
            <Text fontSize="xs" color="gray.500" display={{ base: "none", sm: "block" }}>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </Text>
            <IconButton
              icon={<FiRefreshCw />}
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              aria-label="Refresh data"
              isLoading={loading.examSchedules || loading.results}
            />
          </HStack>
        </Stack>

        {/* Performance Overview */}
        <Grid templateColumns={statsGridCols} gap={{ base: 4, md: 6 }}>
          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel fontSize={{ base: "xs", md: "sm" }}>Cumulative GPA</StatLabel>
                <StatNumber color="green.500" fontSize={{ base: "lg", md: "xl" }}>{calculateOverallGPA()}</StatNumber>
                <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                  <StatArrow type={performanceTrend.trend === "up" ? "increase" : "decrease"} />
                  {performanceTrend.change}% from last semester
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>


          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel fontSize={{ base: "xs", md: "sm" }}>Completed Exams</StatLabel>
                <StatNumber color="purple.500" fontSize={{ base: "lg", md: "xl" }}>
                  {completedExams.length}
                </StatNumber>
                <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                  <Icon as={FiTrendingUp} mr={1} />
                  Total Exams Taken
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel fontSize={{ base: "xs", md: "sm" }}>Upcoming Exams</StatLabel>
                <StatNumber color="orange.500" fontSize={{ base: "lg", md: "xl" }}>
                  {upcomingExams.length}
                </StatNumber>
                <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                  <Icon as={FiCalendar} mr={1} />
                  This Semester
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Main Tabs */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList css={{
            '&::-webkit-scrollbar': { height: '4px' },
            '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
            '&::-webkit-scrollbar-thumb': { background: '#888', borderRadius: '2px' },
          }}>
            <Tab whiteSpace="nowrap" fontSize={{ base: "sm", md: "md" }}>
              <HStack spacing={{ base: 1, md: 2 }}>
                <Icon as={FiCalendar} />
                <Text>Exam Schedule</Text>
              </HStack>
            </Tab>
            <Tab whiteSpace="nowrap" fontSize={{ base: "sm", md: "md" }}>
              <HStack spacing={{ base: 1, md: 2 }}>
                <Icon as={FiAward} />
                <Text>Academic Results</Text>
              </HStack>
            </Tab>
            <Tab whiteSpace="nowrap" fontSize={{ base: "sm", md: "md" }}>
              <HStack spacing={{ base: 1, md: 2 }}>
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
                  <Stack direction={{ base: "column", md: "row" }} justify="space-between" mb={4} spacing={4}>
                    <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold">
                      Upcoming Examinations
                    </Text>
                    <Button leftIcon={<FiPrinter />} size="sm" variant="outline" w={{ base: "full", md: "auto" }}>
                      Print Schedule
                    </Button>
                  </Stack>

                  {upcomingExams.length === 0 ? (
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle fontSize="sm">No Upcoming Exams</AlertTitle>
                        <AlertDescription fontSize="sm">
                          There are no scheduled exams at the moment.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  ) : (
                    <Grid templateColumns={examGridCols} gap={4}>
                      {upcomingExams.map((exam) => (
                        <Card key={exam._id} borderWidth="1px" borderColor="orange.200" bg="orange.50">
                          <CardBody>
                            <VStack align="stretch" spacing={3}>
                              <HStack justify="space-between" flexWrap="wrap">
                                <VStack align="start" spacing={1} minW="0" flex="1">
                                  <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }} noOfLines={1}>
                                    {exam.semesterModuleId?.moduleId?.code || "N/A"}
                                  </Text>
                                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" noOfLines={2}>
                                    {exam.semesterModuleId?.moduleId?.moduleName || "N/A"}
                                  </Text>
                                </VStack>
                                <Badge
                                  colorScheme={exam.examType === "Final" ? "red" : "blue"}
                                  variant="solid"
                                  fontSize="xs"
                                  flexShrink={0}
                                >
                                  {exam.examType || "Exam"}
                                </Badge>
                              </HStack>

                              <Divider />

                              <VStack align="stretch" spacing={2}>
                                <HStack>
                                  <Icon as={FiCalendar} color="orange.500" flexShrink={0} />
                                  <Text fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>
                                    {new Date(exam.examDate).toLocaleDateString()}
                                  </Text>
                                </HStack>
                                <HStack>
                                  <Icon as={FiClock} color="orange.500" flexShrink={0} />
                                  <Text fontSize={{ base: "sm", md: "md" }}>
                                    {exam.examTime}
                                  </Text>
                                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                                    ({exam.durationMinute} minutes)
                                  </Text>
                                </HStack>
                                <HStack>
                                  <Icon as={FiMapPin} color="orange.500" flexShrink={0} />
                                  <VStack align="start" spacing={0} minW="0" flex="1">
                                    <Text fontSize={{ base: "sm", md: "md" }} noOfLines={1}>
                                      {exam.roomId?.block || "TBD"}
                                    </Text>
                                    <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" noOfLines={1}>
                                      {exam.roomId?.floor || "TBD"}
                                    </Text>
                                    <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" noOfLines={1}>
                                      Room {exam.roomId?.roomNumber || "TBD"}
                                    </Text>
                                  </VStack>
                                </HStack>
                              </VStack>

                              <Divider />

                              <HStack justify="space-between" flexWrap="wrap">
                                <Badge colorScheme="blue" variant="outline" fontSize="xs">
                                  {exam.totalMarks || 100} Marks
                                </Badge>
                                <Badge colorScheme="green" variant="outline" fontSize="xs">
                                  {exam.weightage || "N/A"} Weight
                                </Badge>
                              </HStack>

                              <Button
                                size="sm"
                                leftIcon={<FiEye />}
                                onClick={() => {
                                  setSelectedExam(exam)
                                  onExamOpen()
                                }}
                                w="full"
                              >
                                View Details
                              </Button>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </Grid>
                  )}
                </CardBody>
              </Card>
            </TabPanel>

            {/* Academic Results Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* Controls */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                  <CardBody>
                    <Stack direction={controlsDirection} justify="space-between" spacing={4}>
                      <Stack direction={{ base: "column", sm: "row" }} spacing={4} flex="1">
                        <InputGroup maxW={{ base: "full", sm: "300px" }}>
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
                          maxW={{ base: "full", sm: "200px" }}
                          value={selectedSemester}
                          onChange={(e) => setSelectedSemester(e.target.value)}
                        >
                          <option value="all">All Semesters</option>
                          {semesters.map((sem) => (
                            <option key={sem._id} value={sem.semesterNumber}>
                              {sem.semesterName}
                            </option>
                          ))}
                        </Select>
                      </Stack>

                      <Button
                        leftIcon={<FiDownload />}
                        size="sm"
                        variant="outline"
                        onClick={handleExport}
                        w={{ base: "full", sm: "auto" }}
                      >
                        Download Transcript
                      </Button>
                    </Stack>
                  </CardBody>
                </Card>

                {/* Semester-wise Results */}
                {Object.keys(resultsBySemester).length === 0 ? (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontSize="sm">No Results Available</AlertTitle>
                      <AlertDescription fontSize="sm">
                        No academic results have been recorded yet.
                      </AlertDescription>
                    </Box>
                  </Alert>
                ) : (
                  <VStack spacing={6} align="stretch">
                    {Object.values(resultsBySemester)
                      .filter((semester) => {

                        if (selectedSemester === "all") return true
                        return semester.semester?.semesterNumber === selectedSemester
                      })
                      .map((semester) => (
                        <Card key={semester.semester?._id || "unknown"} bg={bgColor} borderColor={borderColor} borderWidth="1px">
                          <CardBody>
                            <Stack direction={{ base: "column", md: "row" }} justify="space-between" mb={4} spacing={4}>
                              <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
                                {semester.semester?.semesterName || "Unknown Semester"}
                              </Text>
                              <HStack flexWrap="wrap" spacing={2}>
                                <Badge colorScheme="blue" variant="solid" fontSize="xs">
                                  GPA: {semester.semesterGPA}
                                </Badge>
                                <Badge colorScheme="purple" variant="outline" fontSize="xs">
                                  {semester.courses.length} Module(s)
                                </Badge>
                              </HStack>
                            </Stack>

                            <Box overflowX="auto">
                              <TableContainer minW="600px">
                                <Table variant="simple" size={{ base: "sm", md: "md" }}>
                                  <Thead>
                                    <Tr>
                                      <Th fontSize={{ base: "xs", md: "sm" }}>Course</Th>
                                      <Th fontSize={{ base: "xs", md: "sm" }}>Marks</Th>
                                      <Th fontSize={{ base: "xs", md: "sm" }}>Grade</Th>
                                      <Th fontSize={{ base: "xs", md: "sm" }}>GPA Points</Th>
                                      <Th fontSize={{ base: "xs", md: "sm" }}>Performance</Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                    {semester.courses
                                      .filter(
                                        (course) =>
                                          course.moduleId?.moduleName?.toLowerCase().includes(searchTerm.toLowerCase()) || course.moduleId?.moduleCode?.toLowerCase().includes(searchTerm.toLowerCase()),
                                      )
                                      .map((course, index) => (
                                        <Tr key={index}>

                                          <Td>
                                            <VStack align="start" spacing={1}>
                                              <Text fontWeight="medium" fontSize={{ base: "xs", md: "sm" }}>
                                                {course.moduleId?.code || "N/A"}
                                              </Text>
                                              <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" noOfLines={2}>
                                                {course.moduleId?.moduleName || "N/A"}
                                              </Text>
                                            </VStack>
                                          </Td>

                                          <Td>
                                            <VStack align="start" spacing={1}>
                                              <Text fontWeight="medium" fontSize={{ base: "xs", md: "sm" }}>
                                                {course.marks || 0}/{course.totalMarks || 100}
                                              </Text>

                                              <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                                                {(course.marks / course.totalMarks) * 100 || 0}%
                                              </Text>
                                            </VStack>
                                          </Td>

                                          <Td>
                                            <Badge colorScheme={getGradeColor(course.grade)} variant="subtle" fontSize="xs">
                                              {course.grade || "N/A"}
                                            </Badge>
                                          </Td>

                                          <Td fontSize={{ base: "xs", md: "sm" }}>{course.gpa?.toFixed(1) || "0.0"}</Td>

                                          <Td>
                                            <Box w={{ base: "60px", md: "100px" }}>
                                              <Progress
                                                value={(course.marks / course.totalMarks) * 100 || 0}
                                                colorScheme={
                                                  ((course.marks / course.totalMarks) * 100 || 0) >= 80
                                                    ? "green"
                                                    : ((course.marks / course.totalMarks) * 100 || 0) >= 60
                                                      ? "blue"
                                                      : "orange"
                                                }
                                                size="sm"
                                                borderRadius="full"
                                              />
                                              <Text fontSize="xs" color="gray.500" mt={1} noOfLines={1}>
                                                {((course.marks / course.totalMarks) * 100 || 0) >= 80
                                                  ? "Excellent"
                                                  : ((course.marks / course.totalMarks) * 100 || 0) >= 60
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
                            </Box>
                          </CardBody>
                        </Card>
                      ))}
                  </VStack>
                )}
              </VStack>
            </TabPanel>

            {/* Performance Analytics Tab */}
            <TabPanel>
              <Grid templateColumns={analyticsGridCols} gap={6}>
                {/* GPA Trend */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                  <CardBody>
                    <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold" mb={4}>
                      GPA Trend Analysis
                    </Text>
                    {Object.keys(resultsBySemester).length === 0 ? (
                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <Box>
                          <AlertTitle fontSize="sm">No Data Available</AlertTitle>
                          <AlertDescription fontSize="sm">
                            No semester data available for trend analysis.
                          </AlertDescription>
                        </Box>
                      </Alert>
                    ) : (
                      <VStack spacing={4} align="stretch">
                        {Object.values(resultsBySemester).map((semester) => (
                          <Box key={semester.semester?._id || "unknown"} p={3} bg="gray.50" borderRadius="md">
                            <HStack justify="space-between" mb={2}>
                              <Text fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>
                                {semester.semester?.semesterName || "Unknown Semester"}
                              </Text>
                              <Badge colorScheme="blue" variant="solid" fontSize="xs">
                                {semester.semesterGPA}
                              </Badge>
                            </HStack>
                            <Progress
                              value={(parseFloat(semester.semesterGPA) / 4.0) * 100}
                              colorScheme={
                                parseFloat(semester.semesterGPA) >= 3.5
                                  ? "green"
                                  : parseFloat(semester.semesterGPA) >= 3.0
                                    ? "blue"
                                    : "orange"
                              }
                              size="sm"
                              borderRadius="full"
                            />
                            <HStack justify="space-between" mt={2}>
                              <Text fontSize="xs" color="gray.600">
                                {semester.courses.length} Courses
                              </Text>
                              <Text fontSize="xs" color="gray.600">
                                {semester.totalCredits} Credits
                              </Text>
                            </HStack>
                          </Box>
                        ))}
                      </VStack>
                    )}
                  </CardBody>
                </Card>

                {/* Subject Performance */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                  <CardBody>
                    <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold" mb={4}>
                      Subject-wise Performance
                    </Text>
                    {results.length === 0 ? (
                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <Box>
                          <AlertTitle fontSize="sm">No Results Available</AlertTitle>
                          <AlertDescription fontSize="sm">
                            No subject performance data available.
                          </AlertDescription>
                        </Box>
                      </Alert>
                    ) : (
                      <VStack spacing={3} align="stretch">
                        {results.filter((result) => result.studentId?._id === currentStudentId).slice(0, 10).map((course) => (
                          <Box key={course._id} p={3} bg="gray.50" borderRadius="md">
                            <HStack justify="space-between" mb={2}>
                              <VStack align="start" spacing={0} minW="0" flex="1">
                                <Text fontWeight="medium" fontSize={{ base: "xs", md: "sm" }} noOfLines={1}>
                                  {course.moduleId?.code || "N/A"}
                                </Text>
                                <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" noOfLines={2}>
                                  {course.moduleId?.moduleName || "N/A"}
                                </Text>
                              </VStack>
                              <Badge colorScheme={getGradeColor(course.grade)} variant="solid" fontSize="xs" flexShrink={0}>
                                {course.grade || "N/A"}
                              </Badge>
                            </HStack>
                            <Progress
                              value={(course.marks / course.totalMarks) * 100 || 0}
                              colorScheme={getGradeColor(course.grade)}
                              size="sm"
                              borderRadius="full"
                            />
                            <HStack justify="space-between" mt={2}>
                              <Text fontSize="xs" color="gray.600">
                                {((course.marks / course.totalMarks) * 100 || 0)}%
                              </Text>
                              <Text fontSize="xs" color="gray.600">
                                {course.gpa?.toFixed(1) || "0.0"} GPA
                              </Text>
                            </HStack>
                          </Box>
                        ))}
                      </VStack>
                    )}
                  </CardBody>
                </Card>
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Exam Details Modal */}
      <Modal isOpen={isExamOpen} onClose={onExamClose} size={modalSize}>
        <ModalOverlay />
        <ModalContent mx={4}>
          <ModalHeader fontSize={{ base: "md", md: "lg" }}>Exam Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedExam && (
              <VStack spacing={4} align="stretch">
                <Box p={4} bg="orange.50" borderRadius="md">
                  <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" noOfLines={2}>
                    {selectedExam.semesterModuleId?.moduleId?.code || "N/A"} - {selectedExam.semesterModuleId?.moduleId?.moduleName || "N/A"}
                  </Text>
                  <Badge colorScheme={selectedExam.examType === "Final" ? "red" : "blue"} mt={2} fontSize="xs">
                    {selectedExam.examType || "Exam"} Examination
                  </Badge>
                </Box>

                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                  <Box>
                    <Text fontWeight="medium" mb={2} fontSize={{ base: "sm", md: "md" }}>
                      Date & Time
                    </Text>
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <Icon as={FiCalendar} color="orange.500" flexShrink={0} />
                        <Text fontSize={{ base: "sm", md: "md" }}>
                          {new Date(selectedExam.examDate).toLocaleDateString()}
                        </Text>
                      </HStack>
                      <HStack>
                        <Icon as={FiClock} color="orange.500" flexShrink={0} />
                        <Text fontSize={{ base: "sm", md: "md" }}>
                          {selectedExam.examTime}
                        </Text>
                      </HStack>
                      <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                        Duration: {selectedExam.durationMinute} minutes
                      </Text>
                    </VStack>
                  </Box>

                  <Box>
                    <Text fontWeight="medium" mb={2} fontSize={{ base: "sm", md: "md" }}>
                      Venue & Marks
                    </Text>
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <Icon as={FiMapPin} color="orange.500" flexShrink={0} />
                        <Text fontSize={{ base: "sm", md: "md" }} noOfLines={1}>
                          {selectedExam.roomId?.block || "TBD"}
                        </Text>
                      </HStack>
                      <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" noOfLines={1}>
                        {selectedExam.roomId?.floor || "TBD"}
                      </Text>
                      <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" noOfLines={1}>
                        Room {selectedExam.roomId?.roomNumber || "TBD"}
                      </Text>
                      <HStack flexWrap="wrap">
                        <Badge colorScheme="blue" variant="outline" fontSize="xs">
                          {selectedExam.totalMarks || 100} Marks
                        </Badge>
                      </HStack>
                    </VStack>
                  </Box>
                </Grid>

                {selectedExam.instructions && (
                  <Box>
                    <Text fontWeight="medium" mb={2} fontSize={{ base: "sm", md: "md" }}>
                      Instructions
                    </Text>
                    <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                      {selectedExam.instructions}
                    </Text>
                  </Box>
                )}

                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize={{ base: "xs", md: "sm" }}>Important Reminders:</AlertTitle>
                    <AlertDescription fontSize={{ base: "xs", md: "sm" }}>
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
            <Button onClick={onExamClose} size={{ base: "sm", md: "md" }}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
