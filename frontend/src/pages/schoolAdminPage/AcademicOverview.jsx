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
import { useAcademicStore } from "../../store/academic.js";
import { useEffect } from "react";

export function AcademicOverview() {
  const {
    students,
    lecturers,
    courses,
    modules,
    departments,
    intakes,
    examSchedules,
    attendance,
    fetchStudents,
    fetchLecturers,
    fetchCourses,
    fetchModules,
    fetchDepartments,
    fetchIntakes,
    fetchExamSchedules,
    fetchAttendance,
    getCourseCompletionRate,
    getAllCourseCompletionRate,
    getAverageAttendance,
    getExamPassRate,
  } = useAcademicStore();

  useEffect(() => {
    fetchStudents();
    fetchLecturers && fetchLecturers();
    fetchCourses();
    fetchModules && fetchModules();
    fetchDepartments && fetchDepartments();
    fetchIntakes && fetchIntakes();
    fetchExamSchedules && fetchExamSchedules();
    fetchAttendance && fetchAttendance();
  }, []);

  // Compute dashboard stats
  const dashboardStats = {
    totalStudents: students.length,
    totalLecturers: lecturers?.length || 0,
    totalCourses: courses.length,
    totalModules: modules?.length || 0,
    totalDepartments: departments?.length || 0,
    totalIntakes: intakes?.length || 0,
    upcomingExams: examSchedules?.length || 0,
    todayAttendance: (() => {
      // Calculate today's attendance percentage
      const today = new Date().toISOString().slice(0, 10);
      const todayAttendance = attendance.filter(a => a.date?.slice(0, 10) === today);
      if (!todayAttendance.length) return 0;
      const present = todayAttendance.filter(a => a.status === "present").length;
      return Math.round((present / todayAttendance.length) * 100);
    })(),
  };

  // Enrollment trends (example: students per month, you may need to adjust based on your data)
  const enrollmentData = (() => {
    // Group students by month of enrollment
    const monthMap = {};
    students.forEach(s => {
      const month = s.enrollmentDate ? new Date(s.enrollmentDate).toLocaleString('default', { month: 'short' }) : "Unknown";
      monthMap[month] = (monthMap[month] || 0) + 1;
    });
    return Object.entries(monthMap).map(([month, students]) => ({ month, students }));
  })();

  // Department distribution
  const departmentData = departments?.map(dep => ({
    name: dep.name,
    students: students.filter(s => s.departmentId === dep._id).length,
  })) || [];

  // Recent activities (example: show last 5 students who enrolled/attended)
  const recentActivities = students
    .slice(-5)
    .reverse()
    .map(s => ({
      id: s._id,
      student: s.name,
      action: "enrolled",
      time: s.enrollmentDate ? new Date(s.enrollmentDate).toLocaleDateString() : "",
      type: "enrollment",
    }));

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

  console.log(getAllCourseCompletionRate())

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
