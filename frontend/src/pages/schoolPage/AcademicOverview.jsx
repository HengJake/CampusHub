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
import RefreshData from "../../component/common/RefreshData.jsx";

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
  /**
   * ACADEMIC STORE INTEGRATION
   * =========================
   * Connecting to Zustand academic store for real-time data
   */
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

  /**
   * DEBUG MODE CONFIGURATION
   * ========================
   * Enable detailed logging for development and debugging
   */
  const DEBUG_MODE = process.env.NODE_ENV === 'development';

  const debugLog = (section, data) => {
    if (DEBUG_MODE) {
      // console.log(`📊 [AcademicOverview] ${section}:`, data);
    }
  };

  /**
   * DATA FETCHING EFFECT
   * ====================
   * Fetch all academic data on component mount
   * Includes debugging for data loading status
   */
  useEffect(() => {
    debugLog("Data Fetching", "Starting to fetch all academic data...");

    const fetchAllData = async () => {
      try {
        await Promise.all([
          fetchStudents(),
          fetchLecturers?.(),
          fetchCourses(),
          fetchModules?.(),
          fetchDepartments?.(),
          fetchIntakes?.(),
          fetchExamSchedules?.(),
          fetchAttendance?.(),
          fetchClassSchedules?.(),
          fetchResults?.()
        ]);

        debugLog("Data Fetching", "✅ All data fetched successfully");
      } catch (error) {
        debugLog("Data Fetching", "❌ Error fetching data:", error);
      }
    };

    fetchAllData();
  }, []);

  /**
   * UTILITY FUNCTIONS FOR DATA PROCESSING
   * ====================================
   * Reusable functions for calculating dashboard metrics
   */

  // Safe division with fallback
  const safeDivide = (numerator, denominator, fallback = 0) => {
    if (!denominator || denominator === 0) return fallback;
    return numerator / denominator;
  };

  // Safe percentage calculation
  const safePercentage = (numerator, denominator, fallback = 0) => {
    return Math.round(safeDivide(numerator, denominator, fallback / 100) * 100);
  };

  // Check if date is today
  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date().toISOString().slice(0, 10);
    return dateString.slice(0, 10) === today;
  };

  // Check if intake is currently active
  const isIntakeActive = (intake) => {
    if (!intake.startDate || !intake.endDate) return false;
    const now = new Date();
    const start = new Date(intake.startDate);
    const end = new Date(intake.endDate);
    return now >= start && now <= end;
  };

  /**
   * DASHBOARD STATISTICS CALCULATION
   * =================================
   * Real-time computation of all dashboard metrics with data validation
   * Includes debugging and fallbacks for missing data
   */

  // console.log(students)
  const dashboardStats = (() => {
    debugLog("Data Arrays", {
      students: students?.length || 0,
      lecturers: lecturers?.length || 0,
      courses: courses?.length || 0,
      modules: modules?.length || 0,
      intakes: intakes?.length || 0,
      attendance: attendance?.length || 0,
      results: results?.length || 0
    });

    return {
      // ============================================
      // BASIC COUNTS - Foundation metrics
      // ============================================
      totalStudents: students?.length || 0,
      totalLecturers: lecturers?.length || 0,
      totalCourses: courses?.length || 0,
      totalModules: modules?.length || 0,
      totalDepartments: departments?.length || 0,
      totalIntakes: intakes?.length || 0,
      upcomingExams: examSchedules?.length || 0,

      // Today's attendance with debugging
      todayAttendance: (() => {
        const todayAttendance = attendance?.filter(a => isToday(a.date)) || [];
        const present = todayAttendance.filter(a => a.status === "present").length;
        const percentage = safePercentage(present, todayAttendance.length);

        debugLog("Today's Attendance", {
          total: todayAttendance.length,
          present,
          percentage
        });

        return percentage;
      })(),

      // ============================================
      // 📚 STUDENT ACADEMIC PERFORMANCE
      // ============================================
      passRate: (() => {
        if (!results?.length) return 0;
        const passed = results.filter(r => r.grade !== 'F' && r.grade !== 'Fail').length;
        const rate = safePercentage(passed, results.length);

        debugLog("Pass Rate", { total: results.length, passed, rate });
        return rate;
      })(),

      averageGPA: (() => {
        if (!results?.length) return 0;
        const totalPoints = results.reduce((sum, r) => sum + r.creditHours, 0);
        const avgGPA = safeDivide(totalPoints, results.length).toFixed(2);

        debugLog("Average GPA", { totalResults: results.length, totalPoints, avgGPA });
        return parseFloat(avgGPA);
      })(),

      atRiskStudents: (() => {
        if (!students?.length || !results?.length) return 0;

        const atRisk = students.filter(r => r.cgpa < 2.5).length;

        debugLog("At-Risk Students Summary", {
          totalStudents: students.length,
          studentsWithResults: students.filter(s => results.some(r => r.studentId === s._id)).length,
          atRisk,
          criteria: {
            lowGPA: "GPA < 2.0",
            multipleFailures: "≥2 failed modules",
            lowPassRate: "Pass rate < 60%"
          }
        });

        return atRisk;
      })(),

      topPerformers: (() => {
        if (!students?.length || !results?.length) return 0;

        const topPerformers = students.filter(student => {
          const studentResults = results.filter(r => r.studentId._id === student._id);
          if (!studentResults.length) return false;

          console.log(studentResults.length)
          console.log( studentResults.reduce((sum, r) => sum + r.creditHours, 0))

          // get when cgpa > 3.8
          const avgGPA = safeDivide(
            studentResults.reduce((sum, r) => sum + r.creditHours, 0),
            studentResults.length
          );

          return avgGPA > 3.5; // Above 3.5 GPA threshold
        }).length;

        debugLog("Top Performers", {
          totalStudents: students.length,
          topPerformers
        });

        return topPerformers;
      })(),

      // ============================================
      // 🧑‍🏫 LECTURER/SUBJECT OVERVIEW
      // ============================================
      avgSubjectLoad: (() => {
        if (!lecturers?.length || !modules?.length) return 0;
        const avgLoad = Math.round(safeDivide(modules.length, lecturers.length));

        debugLog("Subject Load", {
          totalModules: modules.length,
          totalLecturers: lecturers.length,
          avgLoad
        });

        return avgLoad;
      })(),

      totalContactHours: (() => {
        if (!classSchedules?.length) return 0;
        const totalHours = classSchedules.reduce((total, schedule) => {
          return total + (schedule.duration || 0);
        }, 0);

        debugLog("Contact Hours", {
          totalSchedules: classSchedules.length,
          totalHours
        });

        return totalHours;
      })(),

      highFailRateSubjects: (() => {
        if (!modules?.length || !results?.length) return 0;

        const highFailModules = modules.filter(module => {
          const moduleResults = results.filter(r => r.moduleId === module._id);
          if (!moduleResults.length) return false;

          const failCount = moduleResults.filter(r => r.grade === 'F').length;
          const failRate = safeDivide(failCount, moduleResults.length);

          return failRate > 0.3; // 30% fail rate threshold
        }).length;

        debugLog("High Fail Rate Subjects", {
          totalModules: modules.length,
          highFailModules
        });

        return highFailModules;
      })(),

      avgFeedbackScore: (() => {
        // TODO: Replace with real feedback data when available
        // For now, calculate based on academic performance as proxy
        const baseScore = 4.0;
        const performanceBonus = safeDivide(
          students.filter(s => results.some(r => r.studentId === s._id && r.creditHours >= 3.0)).length,
          students.length || 1
        ) * 0.5; // Max 0.5 bonus

        const calculatedScore = Math.min(baseScore + performanceBonus, 5.0);

        debugLog("Feedback Score", {
          baseScore,
          performanceBonus,
          calculatedScore: calculatedScore.toFixed(1)
        });

        return parseFloat(calculatedScore.toFixed(1));
      })(),

      // ============================================
      // 🏫 CLASS & SEMESTER METRICS
      // ============================================
      activeSemesters: (() => {
        if (!intakes?.length) return 0;
        const activeIntakes = intakes.filter(isIntakeActive).length;

        debugLog("Active Semesters", {
          totalIntakes: intakes.length,
          activeIntakes
        });

        return activeIntakes;
      })(),

      avgClassSize: (() => {
        if (!classSchedules?.length || !students?.length) return 0;
        const avgSize = Math.round(safeDivide(students.length, classSchedules.length));

        debugLog("Average Class Size", {
          totalStudents: students.length,
          totalClasses: classSchedules.length,
          avgSize
        });

        return avgSize;
      })(),

      courseRetakeRate: (() => {
        if (!students?.length) return 0;
        const retakeStudents = students.filter(s => s.completionStatus === 'retaking').length;
        const rate = safePercentage(retakeStudents, students.length);

        debugLog("Course Retake Rate", {
          totalStudents: students.length,
          retakeStudents,
          rate
        });

        return rate;
      })(),

      enrollmentRate: (() => {
        if (!students?.length) return 0;
        const enrolledStudents = students.filter(s => s.enrollmentStatus === 'enrolled').length;
        const rate = safePercentage(enrolledStudents, students.length);

        debugLog("Enrollment Rate", {
          totalStudents: students.length,
          enrolledStudents,
          rate
        });

        return rate;
      })(),

      // ============================================
      // 📅 ATTENDANCE TRACKING
      // ============================================
      avgAttendanceRate: (() => {
        if (!attendance?.length) return 0;
        const present = attendance.filter(a => a.status === "present").length;
        const rate = safePercentage(present, attendance.length);

        debugLog("Average Attendance", {
          totalRecords: attendance.length,
          present,
          rate
        });

        return rate;
      })(),

      lowAttendanceAlerts: (() => {
        if (!students?.length || !attendance?.length) return 0;

        const lowAttendanceStudents = students.filter(student => {
          const studentAttendance = attendance.filter(a => a.studentId === student._id);
          if (!studentAttendance.length) return false;

          const presentCount = studentAttendance.filter(a => a.status === "present").length;
          const attendanceRate = safeDivide(presentCount, studentAttendance.length);

          return attendanceRate < 0.75; // Below 75% threshold
        }).length;

        debugLog("Low Attendance Alerts", {
          totalStudents: students.length,
          lowAttendanceStudents
        });

        return lowAttendanceStudents;
      })(),

      attendancePerformanceCorr: (() => {
        // Calculate correlation between attendance and academic performance
        if (!students?.length || !attendance?.length || !results?.length) return 0;

        let correlationSum = 0;
        let validStudents = 0;

        students.forEach(student => {
          const studentAttendance = attendance.filter(a => a.studentId === student._id);
          const studentResults = results.filter(r => r.studentId === student._id);

          if (studentAttendance.length > 0 && studentResults.length > 0) {
            const attendanceRate = safeDivide(
              studentAttendance.filter(a => a.status === "present").length,
              studentAttendance.length
            );

            const avgGPA = safeDivide(
              studentResults.reduce((sum, r) => sum + r.creditHours, 0),
              studentResults.length
            );

            // Simple correlation: students with >80% attendance tend to have >3.0 GPA
            if (attendanceRate > 0.8 && avgGPA > 3.0) correlationSum++;
            validStudents++;
          }
        });

        const correlation = safePercentage(correlationSum, validStudents);

        debugLog("Attendance-Performance Correlation", {
          validStudents,
          correlationSum,
          correlation
        });

        return correlation;
      })(),

      weeklyAbsenceTrend: (() => {
        if (!attendance?.length) return 0;
        const absent = attendance.filter(a => a.status === "absent").length;
        const rate = safePercentage(absent, attendance.length);

        debugLog("Weekly Absence Trend", {
          totalRecords: attendance.length,
          absent,
          rate
        });

        return rate;
      })(),

      // ============================================
      // 📤 ASSESSMENT & EXAM INSIGHTS
      // ============================================
      resultSubmissionProgress: (() => {
        if (!modules?.length) return 0;
        const modulesWithResults = modules.filter(module =>
          results?.some(r => r.moduleId === module._id)
        ).length;
        const progress = safePercentage(modulesWithResults, modules.length);

        debugLog("Result Submission Progress", {
          totalModules: modules.length,
          modulesWithResults,
          progress
        });

        return progress;
      })(),

      assessmentWeightage: (() => {
        // Calculate based on actual assessment distribution
        if (!results?.length) return 70; // Default fallback

        // Mock calculation - in real implementation, this would analyze actual assessment types
        const courseworkWeight = 70;
        const examWeight = 30;

        debugLog("Assessment Weightage", {
          courseworkWeight,
          examWeight,
          totalResults: results.length
        });

        return courseworkWeight;
      })(),

      pendingGradingItems: (() => {
        if (!modules?.length) return 0;
        const modulesWithResults = modules.filter(module =>
          results?.some(r => r.moduleId === module._id)
        ).length;
        const pending = modules.length - modulesWithResults;

        debugLog("Pending Grading", {
          totalModules: modules.length,
          modulesWithResults,
          pending
        });

        return pending;
      })(),
    };
  })(); // End of dashboardStats calculation

  // Log final dashboard summary in debug mode
  debugLog("Dashboard Summary", {
    totalStudents: dashboardStats.totalStudents,
    passRate: dashboardStats.passRate,
    avgAttendance: dashboardStats.avgAttendanceRate,
    activeIntakes: dashboardStats.activeSemesters
  });

  /**
   * CHART DATA PROCESSING
   * =====================
   * Process data for visualizations with proper validation and debugging
   */

  // Enrollment trends with responsive data processing
  const enrollmentData = (() => {
    if (!students?.length) return [];

    const monthMap = {};
    let validEnrollments = 0;

    students.forEach(student => {
      if (student.enrollmentDate) {
        try {
          const month = new Date(student.enrollmentDate).toLocaleString('default', { month: 'short' });
          monthMap[month] = (monthMap[month] || 0) + 1;
          validEnrollments++;
        } catch (error) {
          debugLog("Enrollment Date Error", { studentId: student._id, date: student.enrollmentDate });
        }
      }
    });

    const chartData = Object.entries(monthMap)
      .map(([month, students]) => ({ month, students }))
      .sort((a, b) => {
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
      });

    debugLog("Enrollment Data", {
      totalStudents: students.length,
      validEnrollments,
      monthsWithData: chartData.length
    });

    return chartData;
  })();

  // Department distribution with validation
  const departmentData = (() => {
    if (!departments?.length || !students?.length) return [];

    const deptData = departments.map(department => {
      const deptStudents = students.filter(s => s.departmentId === department._id).length;
      return {
        name: department.name || 'Unknown Department',
        students: deptStudents
      };
    }).filter(dept => dept.students > 0); // Only show departments with students

    debugLog("Department Data", {
      totalDepartments: departments.length,
      departmentsWithStudents: deptData.length,
      data: deptData
    });

    return deptData;
  })();

  // Recent activities with enhanced data processing
  const recentActivities = (() => {
    if (!students?.length) return [];

    const activities = students
      .filter(student => student.enrollmentDate && student.name) // Only valid entries
      .sort((a, b) => new Date(b.enrollmentDate) - new Date(a.enrollmentDate)) // Most recent first
      .slice(0, 5) // Top 5 most recent
      .map(student => ({
        id: student._id,
        student: student.name,
        action: "enrolled",
        time: student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : "Unknown",
        type: "enrollment",
      }));

    debugLog("Recent Activities", {
      totalStudents: students.length,
      studentsWithEnrollmentDate: students.filter(s => s.enrollmentDate).length,
      activitiesShown: activities.length
    });

    return activities;
  })();

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  return (
    <Box p={6} minH="100vh" flex={1}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justifyContent="space-between">

          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
              Academic Overview
            </Text>
            <Text color="gray.600">Welcome to the Academic Management Dashboard</Text>
          </Box>

          <RefreshData />

        </HStack>
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
              title="At-Risk Students (GPA < 2.5)"
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
