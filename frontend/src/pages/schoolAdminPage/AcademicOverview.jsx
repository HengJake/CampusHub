"use client"

import {
  Box,
  Grid,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  VStack,
  HStack,
  Avatar,
  useColorModeValue,
  Progress,
} from "@chakra-ui/react"
import { FaBuilding } from "react-icons/fa";

import {
  FiUsers,
  FiUser,
  FiBook,
  FiBookOpen,
  FiClock,
  FiCheckSquare,
} from "react-icons/fi"
import { FaGraduationCap } from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { useAcademicStore } from "../../store/TBI/academicStore.js"

const enrollmentData = [
  { month: "Jan", students: 2400 },
  { month: "Feb", students: 2500 },
  { month: "Mar", students: 2600 },
  { month: "Apr", students: 2700 },
  { month: "May", students: 2800 },
  { month: "Jun", students: 2847 },
]

const departmentData = [
  { name: "Computer Science", students: 850 },
  { name: "Engineering", students: 720 },
  { name: "Business", students: 650 },
  { name: "Arts", students: 427 },
  { name: "Science", students: 200 },
]

const recentActivities = [
  { id: 1, student: "Alice Johnson", action: "enrolled in CS101", time: "2 mins ago", type: "enrollment" },
  { id: 2, student: "Bob Smith", action: "submitted assignment", time: "5 mins ago", type: "assignment" },
  { id: 3, student: "Carol Davis", action: "attended lecture", time: "10 mins ago", type: "attendance" },
  { id: 4, student: "David Wilson", action: "completed exam", time: "15 mins ago", type: "exam" },
]

export function AcademicOverview() {
  const { dashboardStats } = useAcademicStore()
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  const StatCard = ({ title, value, change, icon, color }) => (
    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
      <CardBody>
        <Stat>
          <HStack justify="space-between">
            <Box>
              <StatLabel color="gray.600" fontSize="sm">
                {title}
              </StatLabel>
              <StatNumber fontSize="2xl" color={color}>
                {value}
              </StatNumber>
              {change && (
                <StatHelpText>
                  <StatArrow type={change > 0 ? "increase" : "decrease"} />
                  {Math.abs(change)}%
                </StatHelpText>
              )}
            </Box>
            <Box color={color} fontSize="2xl">
              {icon}
            </Box>
          </HStack>
        </Stat>
      </CardBody>
    </Card>
  )

  return (
    <Box p={6} minH="100vh" flex={1}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
            Academic Overview
          </Text>
          <Text color="gray.600">Welcome to the Academic Management Dashboard</Text>
        </Box>

        {/* Stats Cards */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
          <StatCard
            title="Total Students"
            value={dashboardStats.totalStudents.toLocaleString()}
            change={5.2}
            icon={<FiUsers />}
            color="blue.500"
          />
          <StatCard
            title="Total Lecturers"
            value={dashboardStats.totalLecturers}
            change={2.1}
            icon={<FiUser />}
            color="green.500"
          />
          <StatCard
            title="Active Courses"
            value={dashboardStats.totalCourses}
            change={8.3}
            icon={<FiBook />}
            color="purple.500"
          />
          <StatCard
            title="Total Modules"
            value={dashboardStats.totalModules}
            change={12.5}
            icon={<FiBookOpen />}
            color="orange.500"
          />
        </Grid>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
          <StatCard
            title="Departments"
            value={dashboardStats.totalDepartments}
            icon={<FaBuilding />}
            color="teal.500"
          />
          <StatCard
            title="Active Intakes"
            value={dashboardStats.totalIntakes}
            icon={<FaGraduationCap />}
            color="pink.500"
          />
          <StatCard title="Upcoming Exams" value={dashboardStats.upcomingExams} icon={<FiClock />} color="red.500" />
          <StatCard
            title="Today's Attendance"
            value={`${dashboardStats.todayAttendance}%`}
            icon={<FiCheckSquare />}
            color="cyan.500"
          />
        </Grid>

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
          {/* Charts Section */}
          <VStack spacing={6}>
            {/* Enrollment Trends */}
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
              <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                  Student Enrollment Trends
                </Text>
                <Box h="300px">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={enrollmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="students" stroke="#3182CE" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardBody>
            </Card>

            {/* Department Distribution */}
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
              <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                  Students by Department
                </Text>
                <Box h="300px">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="students" fill="#38A169" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardBody>
            </Card>
          </VStack>

          {/* Sidebar */}
          <VStack spacing={6}>
            {/* Quick Stats */}
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
              <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                  Quick Stats
                </Text>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm">Course Completion Rate</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        87%
                      </Text>
                    </HStack>
                    <Progress value={87} colorScheme="green" size="sm" />
                  </Box>
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm">Average Attendance</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        92%
                      </Text>
                    </HStack>
                    <Progress value={92} colorScheme="blue" size="sm" />
                  </Box>
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm">Exam Pass Rate</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        78%
                      </Text>
                    </HStack>
                    <Progress value={78} colorScheme="purple" size="sm" />
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            {/* Recent Activity */}
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
              <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                  Recent Activity
                </Text>
                <VStack spacing={3} align="stretch">
                  {recentActivities.map((activity) => (
                    <HStack key={activity.id} spacing={3}>
                      <Avatar size="sm" name={activity.student} />
                      <Box flex="1">
                        <Text fontSize="sm" fontWeight="medium">
                          {activity.student}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {activity.action}
                        </Text>
                      </Box>
                      <Text fontSize="xs" color="gray.500">
                        {activity.time}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            {/* Upcoming Events */}
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
              <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                  Upcoming Events
                </Text>
                <VStack spacing={3} align="stretch">
                  <Box p={3} bg="blue.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium" color="blue.800">
                      CS101 Final Exam
                    </Text>
                    <Text fontSize="xs" color="blue.600">
                      Tomorrow, 9:00 AM
                    </Text>
                  </Box>
                  <Box p={3} bg="green.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium" color="green.800">
                      New Intake Registration
                    </Text>
                    <Text fontSize="xs" color="green.600">
                      Next Week
                    </Text>
                  </Box>
                  <Box p={3} bg="orange.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium" color="orange.800">
                      Faculty Meeting
                    </Text>
                    <Text fontSize="xs" color="orange.600">
                      Friday, 2:00 PM
                    </Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Grid>
      </VStack>
    </Box>
  )
}
