import {
  Box,
  Grid,
  Text,
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
import { StatsCard } from "../../component/common/StatsCard.jsx";

import {
  FiCheckCircle,
  FiTrendingUp,
  FiAlertTriangle,
  FiStar,
  FiAlertCircle,
  FiMessageSquare,
  FiCalendar,
  FiUserPlus,
  FiRefreshCw,
  FiBarChart,
  FiDownload,
  FiBarChart2,
  FiDatabase,
  FiUpload,
  FiPieChart,
} from "react-icons/fi";

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
    classSchedules,
    results,
    fetchStudents,
    fetchLecturers,
    fetchCourses,
    fetchModules,
    fetchDepartments,
    fetchIntakes,
    fetchExamSchedules,
    fetchAttendance,
    fetchClassSchedules,
    fetchResults,
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
    fetchClassSchedules && fetchClassSchedules();
    fetchResults && fetchResults();
  }, []);

  // Compute dashboard stats
  const dashboardStats = {
    // Basic counts
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

    // 📚 Student Academic Performance
    passRate: (() => {
      if (!results.length) return 0;
      const passed = results.filter(r => r.grade !== 'F' && r.grade !== 'Fail').length;
      return Math.round((passed / results.length) * 100);
    })(),
    averageGPA: (() => {
      if (!results.length) return 0;
      const gradePoints = { 'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0 };
      const totalPoints = results.reduce((sum, r) => sum + (gradePoints[r.grade] || 0), 0);
      return totalPoints / results.length;
    })(),
    atRiskStudents: (() => {
      if (!students.length) return 0;
      // Students with GPA < 2.0 or multiple failed courses
      return students.filter(s => {
        const studentResults = results.filter(r => r.studentId === s._id);
        if (!studentResults.length) return false;
        const avgGrade = studentResults.reduce((sum, r) => sum + (r.grade === 'A' ? 4 : r.grade === 'B' ? 3 : r.grade === 'C' ? 2 : r.grade === 'D' ? 1 : 0), 0) / studentResults.length;
        return avgGrade < 2.0;
      }).length;
    })(),
    topPerformers: (() => {
      if (!students.length) return 0;
      // Students with GPA > 3.5
      return students.filter(s => {
        const studentResults = results.filter(r => r.studentId === s._id);
        if (!studentResults.length) return false;
        const avgGrade = studentResults.reduce((sum, r) => sum + (r.grade === 'A' ? 4 : r.grade === 'B' ? 3 : r.grade === 'C' ? 2 : r.grade === 'D' ? 1 : 0), 0) / studentResults.length;
        return avgGrade > 3.5;
      }).length;
    })(),

    // 🧑‍🏫 Lecturer/Subject Overview
    avgSubjectLoad: (() => {
      if (!lecturers.length) return 0;
      const totalSubjects = modules.length;
      return Math.round(totalSubjects / lecturers.length);
    })(),
    totalContactHours: (() => {
      if (!classSchedules.length) return 0;
      return classSchedules.reduce((total, schedule) => total + (schedule.duration || 0), 0);
    })(),
    highFailRateSubjects: (() => {
      if (!modules.length) return 0;
      return modules.filter(module => {
        const moduleResults = results.filter(r => r.moduleId === module._id);
        if (!moduleResults.length) return false;
        const failRate = moduleResults.filter(r => r.grade === 'F').length / moduleResults.length;
        return failRate > 0.3; // 30% fail rate threshold
      }).length;
    })(),
    avgFeedbackScore: (() => {
      // Mock feedback score - in real app, this would come from feedback data
      return 4.2;
    })(),

    // 🏫 Class & Semester Metrics
    activeSemesters: (() => {
      if (!intakes.length) return 0;
      const currentDate = new Date();
      return intakes.filter(intake => {
        const intakeDate = new Date(intake.startDate);
        const endDate = new Date(intake.endDate);
        return currentDate >= intakeDate && currentDate <= endDate;
      }).length;
    })(),
    avgClassSize: (() => {
      if (!classSchedules.length) return 0;
      const totalStudents = students.length;
      return Math.round(totalStudents / classSchedules.length);
    })(),
    courseRetakeRate: (() => {
      if (!students.length) return 0;
      const retakeStudents = students.filter(s => s.completionStatus === 'retaking').length;
      return Math.round((retakeStudents / students.length) * 100);
    })(),
    enrollmentRate: (() => {
      if (!students.length) return 0;
      const enrolledStudents = students.filter(s => s.enrollmentStatus === 'enrolled').length;
      return Math.round((enrolledStudents / students.length) * 100);
    })(),

    // 📅 Attendance Tracking
    avgAttendanceRate: (() => {
      if (!attendance.length) return 0;
      const present = attendance.filter(a => a.status === "present").length;
      return Math.round((present / attendance.length) * 100);
    })(),
    lowAttendanceAlerts: (() => {
      if (!students.length) return 0;
      return students.filter(student => {
        const studentAttendance = attendance.filter(a => a.studentId === student._id);
        if (!studentAttendance.length) return false;
        const attendanceRate = studentAttendance.filter(a => a.status === "present").length / studentAttendance.length;
        return attendanceRate < 0.75; // Below 75% attendance
      }).length;
    })(),
    attendancePerformanceCorr: (() => {
      // Mock correlation - in real app, calculate actual correlation
      return 85;
    })(),
    weeklyAbsenceTrend: (() => {
      if (!attendance.length) return 0;
      const absent = attendance.filter(a => a.status === "absent").length;
      return Math.round((absent / attendance.length) * 100);
    })(),

    // 📤 Assessment & Exam Insights
    resultSubmissionProgress: (() => {
      if (!modules.length) return 0;
      const modulesWithResults = modules.filter(module =>
        results.some(r => r.moduleId === module._id)
      ).length;
      return Math.round((modulesWithResults / modules.length) * 100);
    })(),
    assessmentWeightage: (() => {
      // Mock assessment weightage - in real app, calculate from actual data
      return 70; // 70% coursework, 30% exams
    })(),
    pendingGradingItems: (() => {
      if (!modules.length) return 0;
      const modulesWithResults = modules.filter(module =>
        results.some(r => r.moduleId === module._id)
      ).length;
      return modules.length - modulesWithResults;
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

        {/* Academic Performance Stats */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
            📚 Student Academic Performance
          </Text>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
            <StatsCard
              title="Pass Rate"
              value={`${dashboardStats.passRate}%`}
              change={2.5}
              icon={<FiCheckCircle />}
              color="green.500"
            />
            <StatsCard
              title="Average GPA"
              value={dashboardStats.averageGPA.toFixed(2)}
              change={0.1}
              icon={<FiTrendingUp />}
              color="blue.500"
            />
            <StatsCard
              title="At-Risk Students"
              value={dashboardStats.atRiskStudents}
              change={-3}
              icon={<FiAlertTriangle />}
              color="red.500"
            />
            <StatsCard
              title="Top Performers"
              value={dashboardStats.topPerformers}
              icon={<FiStar />}
              color="yellow.500"
            />
          </Grid>
        </Box>

        {/* Lecturer Overview Stats */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
            🧑‍🏫 Lecturer/Subject Overview
          </Text>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
            <StatsCard
              title="Avg Subject Load"
              value={dashboardStats.avgSubjectLoad}
              icon={<FiBook />}
              color="purple.500"
            />
            <StatsCard
              title="Contact Hours"
              value={dashboardStats.totalContactHours}
              icon={<FiClock />}
              color="teal.500"
            />
            <StatsCard
              title="High Fail Rate Subjects"
              value={dashboardStats.highFailRateSubjects}
              icon={<FiAlertCircle />}
              color="orange.500"
            />
            <StatsCard
              title="Avg Feedback Score"
              value={`${dashboardStats.avgFeedbackScore}/5`}
              icon={<FiMessageSquare />}
              color="pink.500"
            />
          </Grid>
        </Box>

        {/* Class & Semester Metrics */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
            🏫 Class & Semester Metrics
          </Text>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
            <StatsCard
              title="Active Semesters"
              value={dashboardStats.activeSemesters}
              icon={<FiCalendar />}
              color="indigo.500"
            />
            <StatsCard
              title="Avg Class Size"
              value={dashboardStats.avgClassSize}
              icon={<FiUsers />}
              color="cyan.500"
            />
            <StatsCard
              title="Course Retake Rate"
              value={`${dashboardStats.courseRetakeRate}%`}
              icon={<FiRefreshCw />}
              color="red.400"
            />
            <StatsCard
              title="Enrollment Rate"
              value={`${dashboardStats.enrollmentRate}%`}
              icon={<FiUserPlus />}
              color="green.400"
            />
          </Grid>
        </Box>

        {/* Attendance Tracking */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
            📅 Attendance Tracking
          </Text>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
            <StatsCard
              title="Avg Attendance Rate"
              value={`${dashboardStats.avgAttendanceRate}%`}
              icon={<FiCheckSquare />}
              color="green.500"
            />
            <StatsCard
              title="Low Attendance Alerts"
              value={dashboardStats.lowAttendanceAlerts}
              icon={<FiAlertTriangle />}
              color="red.500"
            />
            <StatsCard
              title="Attendance vs Performance"
              value={`${dashboardStats.attendancePerformanceCorr}%`}
              icon={<FiTrendingUp />}
              color="blue.500"
            />
            <StatsCard
              title="Weekly Absence Trend"
              value={`${dashboardStats.weeklyAbsenceTrend}%`}
              icon={<FiBarChart />}
              color="orange.500"
            />
          </Grid>
        </Box>

        {/* Assessment & Exam Insights */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
            📤 Assessment & Exam Insights
          </Text>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
            <StatsCard
              title="Upcoming Exams"
              value={dashboardStats.upcomingExams}
              icon={<FiCalendar />}
              color="red.500"
            />
            <StatsCard
              title="Result Submission"
              value={`${dashboardStats.resultSubmissionProgress}%`}
              icon={<FiUpload />}
              color="green.500"
            />
            <StatsCard
              title="Assessment Weightage"
              value={`${dashboardStats.assessmentWeightage}%`}
              icon={<FiPieChart />}
              color="purple.500"
            />
            <StatsCard
              title="Pending Grading"
              value={dashboardStats.pendingGradingItems}
              icon={<FiClock />}
              color="orange.500"
            />
          </Grid>
        </Box>

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
