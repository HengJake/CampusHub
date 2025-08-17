import {
  Box,
  Grid,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  Button,
  useToast,
  Badge
} from "@chakra-ui/react"
import {
  FiUser,
  FiBook,
  FiClock,
  FiCheckSquare,
} from "react-icons/fi"
import { useAcademicStore } from "../../store/academic.js";
import { useEffect, useState } from "react";
import { StatsCard } from "../../component/common/StatsCard.jsx";
import {
  updateAllStudentsAcademicPerformance
} from "../../component/schoolAdminDashboard/dashboard/updateStudent.js";
import { updateIntakeCourseEnrollments } from "../../component/schoolAdminDashboard/dashboard/updateIntakeCourseEnrollments.js";

import {
  FiCheckCircle,
  FiTrendingUp,
  FiAlertTriangle,
  FiStar,
  FiUserPlus,
  FiRefreshCw,
  FiBarChart,
  FiBarChart2,
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
    modules,
    departments,
    intakeCourses,
    attendance,
    classSchedules,
    results,
    fetchStudents,
    fetchLecturers,
    fetchModules,
    fetchDepartments,
    fetchIntakeCourses,
    fetchAttendance,
    fetchClassSchedules,
    fetchResults,
    updateIntakeCourse,
  } = useAcademicStore();

  const [isUpdatingPerformance, setIsUpdatingPerformance] = useState(false);
  const [isUpdatingEnrollments, setIsUpdatingEnrollments] = useState(false);
  const toast = useToast();

  /**
   * HANDLE UPDATE ALL STUDENTS PERFORMANCE
   * =====================================
   * Updates academic performance for all students
   */
  const handleUpdateAllStudentsPerformance = async () => {
    if (isUpdatingPerformance) return;

    setIsUpdatingPerformance(true);

    try {
      toast({
        title: "Updating Academic Performance",
        description: "Calculating CGPA and credit hours for all students...",
        status: "info",
        duration: 3000,
        isClosable: true,
      });

      const results = await updateAllStudentsAcademicPerformance();

      // Refresh data to get updated values
      await fetchStudentsBySchoolId();

      toast({
        title: "Update Complete",
        description: `Successfully updated ${results.successCount} students. ${results.errorCount} errors occurred.`,
        status: results.errorCount === 0 ? "success" : "warning",
        duration: 5000,
        isClosable: true,
      });

    } catch (error) {
      console.error("Error updating academic performance:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update academic performance",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdatingPerformance(false);
    }
  };

  /**
   * UPDATE INTAKE COURSE ENROLLMENT COUNTS
   * ======================================
   * Calculates and updates currentEnrollment for all intake courses
   */


  /**
   * HANDLE REFRESH WITH ENROLLMENT UPDATE
   * =====================================
   * Refreshes all data and updates enrollment counts
   */
  const handleRefreshWithEnrollmentUpdate = async () => {
    if (isUpdatingEnrollments) return;

    setIsUpdatingEnrollments(true);

    try {
      toast({
        title: "Refreshing Data",
        description: "Updating enrollment counts and refreshing all data...",
        status: "info",
        duration: 3000,
        isClosable: true,
      });

      // Update enrollment counts first
      const enrollmentResults = await updateIntakeCourseEnrollments(
        intakeCourses,
        students,
        updateIntakeCourse,
        fetchIntakeCourses
      );

      // Then refresh all data
      await fetchAllData();

      toast({
        title: "Refresh Complete",
        description: enrollmentResults.message,
        status: enrollmentResults.success ? "success" : "warning",
        duration: 5000,
        isClosable: true,
      });

    } catch (error) {
      console.error("Error during refresh:", error);
      toast({
        title: "Refresh Failed",
        description: error.message || "Failed to refresh data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdatingEnrollments(false);
    }
  };

  /**
   * DEBUG MODE CONFIGURATION
   * ========================
   * Enable detailed logging for development and debugging
   */
  const DEBUG_MODE = process.env.NODE_ENV === 'development';

  const debugLog = (section, data) => {
    if (DEBUG_MODE) {
      // console.log(`[AcademicOverview] ${section}:`, data);
    }
  };

  /**
   * DATA FETCHING EFFECT
   * ====================
   * Fetch all academic data on component mount
   * Includes debugging for data loading status
   */
  /**
   * FETCH ALL DATA FUNCTION
   * ======================
   * Centralized function to fetch all academic data
   */
  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchStudentsBySchoolId(),
        fetchLecturersBySchoolId?.(),
        fetchModulesBySchoolId?.(),
        fetchDepartmentsBySchoolId?.(),
        fetchIntakeCoursesBySchoolId?.(),
        fetchAttendanceBySchoolId?.(),
        fetchClassSchedulesBySchoolId?.(),
        fetchResultsBySchoolId?.()
      ]);

      debugLog("Data Fetching", "All data fetched successfully");
    } catch (error) {
      debugLog("Data Fetching", "Error fetching data:", error);
    }
  };

  useEffect(() => {
    debugLog("Data Fetching", "Starting to fetch all academic data...");
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



  /**
   * MONTH-OVER-MONTH COMPARISON UTILITIES
   * =====================================
   * Functions to compare data from last month vs this month using createdAt
   */

  // Get current month and last month date ranges
  const getMonthRanges = () => {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    return {
      currentMonth: {
        start: currentMonth,
        end: now
      },
      lastMonth: {
        start: lastMonth,
        end: new Date(now.getFullYear(), now.getMonth(), 0)
      }
    };
  };

  // Filter data by month using createdAt
  const filterDataByMonth = (data, monthRange) => {
    if (!data || !Array.isArray(data)) return [];

    return data.filter(item => {
      if (!item.createdAt) return false;

      const itemDate = new Date(item.createdAt);
      return itemDate >= monthRange.start && itemDate <= monthRange.end;
    });
  };

  // Calculate month-over-month change percentage
  const calculateMonthOverMonthChange = (currentValue, lastValue) => {
    if (lastValue === 0) return currentValue > 0 ? 100 : 0;
    return ((currentValue - lastValue) / lastValue) * 100;
  };

  // Get month-over-month statistics for various metrics
  const getMonthOverMonthStats = () => {
    const monthRanges = getMonthRanges();

    // Filter data by month
    const currentMonthStudents = filterDataByMonth(students, monthRanges.currentMonth);
    const lastMonthStudents = filterDataByMonth(students, monthRanges.lastMonth);

    const currentMonthResults = filterDataByMonth(results, monthRanges.currentMonth);
    const lastMonthResults = filterDataByMonth(results, monthRanges.lastMonth);

    const currentMonthAttendance = filterDataByMonth(attendance, monthRanges.currentMonth);
    const lastMonthAttendance = filterDataByMonth(attendance, monthRanges.lastMonth);

    const currentMonthIntakeCourses = filterDataByMonth(intakeCourses, monthRanges.currentMonth);
    const lastMonthIntakeCourses = filterDataByMonth(intakeCourses, monthRanges.lastMonth);

    // Calculate metrics for each month
    const currentMonthStats = {

      passRate: (() => {
        if (!currentMonthResults.length) return 0;
        const passed = currentMonthResults.filter(r => r.grade !== 'F' && r.grade !== 'Fail').length;
        return safePercentage(passed, currentMonthResults.length);
      })(),
      averageGPA: (() => {
        if (!currentMonthResults.length) return 0;
        const totalGPA = currentMonthResults.reduce((sum, result) => sum + (result.gpa || 0), 0);
        return safeDivide(totalGPA, currentMonthResults.length);
      })(),
      atRiskStudents: (() => {
        if (!currentMonthStudents.length || !currentMonthResults.length) return 0;
        return currentMonthStudents.filter(r => r.cgpa < 2.5).length;
      })(),

      enrollmentRate: (() => {
        if (!currentMonthIntakeCourses.length) return 0;
        const totalCapacity = currentMonthIntakeCourses.reduce((sum, ic) => sum + ic.maxStudents, 0);
        const totalEnrolled = currentMonthIntakeCourses.reduce((sum, ic) => sum + ic.currentEnrollment, 0);
        return safePercentage(totalEnrolled, totalCapacity);
      })()
    };

    const lastMonthStats = {

      passRate: (() => {
        if (!lastMonthResults.length) return 0;
        const passed = lastMonthResults.filter(r => r.grade !== 'F' && r.grade !== 'Fail').length;
        return safePercentage(passed, lastMonthResults.length);
      })(),
      averageGPA: (() => {
        if (!lastMonthResults.length) return 0;
        const totalGPA = lastMonthResults.reduce((sum, result) => sum + (result.gpa || 0), 0);
        return safeDivide(totalGPA, lastMonthResults.length);
      })(),
      atRiskStudents: (() => {
        if (!lastMonthStudents.length || !lastMonthResults.length) return 0;
        return lastMonthStudents.filter(r => r.cgpa < 2.5).length;
      })(),

      enrollmentRate: (() => {
        if (!lastMonthIntakeCourses.length) return 0;
        const totalCapacity = lastMonthIntakeCourses.reduce((sum, ic) => sum + ic.maxStudents, 0);
        const totalEnrolled = lastMonthIntakeCourses.reduce((sum, ic) => sum + ic.currentEnrollment, 0);
        return safePercentage(totalEnrolled, totalCapacity);
      })()
    };

    // Calculate month-over-month changes
    return {
      passRate: {
        current: currentMonthStats.passRate,
        last: lastMonthStats.passRate,
        change: calculateMonthOverMonthChange(currentMonthStats.passRate, lastMonthStats.passRate)
      },
      averageGPA: {
        current: currentMonthStats.averageGPA,
        last: lastMonthStats.averageGPA,
        change: calculateMonthOverMonthChange(currentMonthStats.averageGPA, lastMonthStats.averageGPA)
      },
      atRiskStudents: {
        current: currentMonthStats.atRiskStudents,
        last: lastMonthStats.atRiskStudents,
        change: calculateMonthOverMonthChange(currentMonthStats.atRiskStudents, lastMonthStats.atRiskStudents)
      },

      enrollmentRate: {
        current: currentMonthStats.enrollmentRate,
        last: lastMonthStats.enrollmentRate,
        change: calculateMonthOverMonthChange(currentMonthStats.enrollmentRate, lastMonthStats.enrollmentRate)
      },

    };
  };

  // Get month-over-month statistics
  const monthOverMonthStats = getMonthOverMonthStats();

  // Debug information for month-over-month comparison
  const debugMonthComparison = () => {
    if (!DEBUG_MODE) return null;

    const monthRanges = getMonthRanges();
    const currentMonthData = {
      students: filterDataByMonth(students, monthRanges.currentMonth).length,
      results: filterDataByMonth(results, monthRanges.currentMonth).length,
      attendance: filterDataByMonth(attendance, monthRanges.currentMonth).length,
      intakeCourses: filterDataByMonth(intakeCourses, monthRanges.currentMonth).length
    };

    const lastMonthData = {
      students: filterDataByMonth(students, monthRanges.lastMonth).length,
      results: filterDataByMonth(results, monthRanges.lastMonth).length,
      attendance: filterDataByMonth(attendance, monthRanges.lastMonth).length,
      intakeCourses: filterDataByMonth(intakeCourses, monthRanges.lastMonth).length
    };

    return {
      monthRanges: {
        current: {
          start: monthRanges.currentMonth.start.toLocaleDateString(),
          end: monthRanges.currentMonth.end.toLocaleDateString()
        },
        last: {
          start: monthRanges.lastMonth.start.toLocaleDateString(),
          end: monthRanges.lastMonth.end.toLocaleDateString()
        }
      },
      dataCounts: {
        current: currentMonthData,
        last: lastMonthData
      }
    };
  };

  const monthComparisonDebug = debugMonthComparison();

  /**
   * DASHBOARD STATISTICS CALCULATION
   * =================================
   * Real-time computation of all dashboard metrics with data validation
   * Includes debugging and fallbacks for missing data
   */

  const dashboardStats = (() => {
    debugLog("Data Arrays", {
      students: students?.length || 0,
      lecturers: lecturers?.length || 0,
      modules: modules?.length || 0,
      departments: departments?.length || 0,
      intakeCourses: intakeCourses?.length || 0,
      attendance: attendance?.length || 0,
      results: results?.length || 0
    });

    return {
      // ============================================
      // BASIC COUNTS - Foundation metrics
      // ============================================
      totalStudents: students?.length || 0,
      totalLecturers: lecturers?.length || 0,
      totalModules: modules?.length || 0,
      totalDepartments: departments?.length || 0,



      // ============================================
      // STUDENT ACADEMIC PERFORMANCE
      // ============================================
      passRate: (() => {
        if (!results?.length) return 0;
        const passed = results.filter(r => r.grade !== 'F' && r.grade !== 'Fail').length;
        const rate = safePercentage(passed, results.length);

        debugLog("Pass Rate", { total: results.length, passed, rate });
        return rate;
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
          return student.cgpa > 3.8; // Top performer threshold
        }).length;

        debugLog("Top Performers", {
          totalStudents: students.length,
          topPerformers
        });

        return topPerformers;
      })(),

      avgWorkingHours: (() => {
        if (!lecturers?.length) return 0;

        const calculateTimeDifference = (startTime, endTime) => {
          const [startHour, startMinute] = startTime.split(':').map(Number);
          const [endHour, endMinute] = endTime.split(':').map(Number);

          let hours = endHour - startHour;
          let minutes = endMinute - startMinute;

          if (minutes < 0) {
            hours -= 1;
            minutes += 60;
          }

          return hours + (minutes / 60);
        };

        const lecturerWorkingHours = lecturers.map(lecturer => {
          let totalHours = 0;

          // Calculate teaching hours from class schedules
          const teachingSchedules = classSchedules?.filter(schedule =>
            schedule.lecturerId === lecturer._id
          ) || [];

          const teachingHours = teachingSchedules.reduce((total, schedule) => {
            return total + calculateTimeDifference(schedule.startTime, schedule.endTime);
          }, 0);

          // Calculate office hours
          const officeHours = lecturer.officeHours?.reduce((total, officeHour) => {
            return total + calculateTimeDifference(officeHour.startTime, officeHour.endTime);
          }, 0) || 0;

          totalHours = teachingHours + officeHours;

          debugLog(`Lecturer ${lecturer._id} Working Hours`, {
            lecturerId: lecturer._id,
            teachingHours: parseFloat(teachingHours.toFixed(2)),
            officeHours: parseFloat(officeHours.toFixed(2)),
            totalHours: parseFloat(totalHours.toFixed(2))
          });

          return totalHours;
        });

        const totalWorkingHours = lecturerWorkingHours.reduce((sum, hours) => sum + hours, 0);
        const averageWorkingHours = safeDivide(totalWorkingHours, lecturers.length);

        debugLog("Average Working Hours", {
          totalLecturers: lecturers.length,
          totalWorkingHours: parseFloat(totalWorkingHours.toFixed(2)),
          averageWorkingHours: parseFloat(averageWorkingHours.toFixed(2))
        });

        return parseFloat(averageWorkingHours.toFixed(2));
      })(),

      averageModulesPerLecturer: (() => {
        if (!modules?.length || !lecturers?.length) return 0;

        // Count unique modules per lecturer from class schedules
        const lecturerModuleCount = {};

        classSchedules?.forEach(schedule => {
          if (schedule.lecturerId && schedule.moduleId) {
            if (!lecturerModuleCount[schedule.lecturerId]) {
              lecturerModuleCount[schedule.lecturerId] = new Set();
            }
            lecturerModuleCount[schedule.lecturerId].add(schedule.moduleId);
          }
        });

        // Calculate average modules per lecturer
        const totalModules = Object.values(lecturerModuleCount).reduce((sum, moduleSet) => {
          return sum + moduleSet.size;
        }, 0);

        const averageModules = safeDivide(totalModules, lecturers.length);

        debugLog("Average Modules per Lecturer", {
          totalLecturers: lecturers.length,
          totalModules,
          averageModules: parseFloat(averageModules.toFixed(2))
        });

        return parseFloat(averageModules.toFixed(2));
      })(),







      // ============================================
      // ATTENDANCE TRACKING
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
      // ENHANCED ACADEMIC PERFORMANCE METRICS
      // ============================================
      averageGPA: (() => {
        if (!results?.length) return 0;
        const totalGPA = results.reduce((sum, result) => sum + (result.gpa || 0), 0);
        const average = safeDivide(totalGPA, results.length);

        debugLog("Average GPA", {
          totalResults: results.length,
          totalGPA,
          average: parseFloat(average.toFixed(2))
        });

        return parseFloat(average.toFixed(2));
      })(),





      // ============================================
      // ENHANCED ATTENDANCE ANALYTICS
      // ============================================
      lowAttendanceStudents: (() => {
        if (!students?.length || !attendance?.length) return 0;

        const lowAttendanceStudents = students.filter(student => {
          const studentAttendance = attendance.filter(a => a.studentId === student._id);
          if (!studentAttendance.length) return false;

          const presentCount = studentAttendance.filter(a => a.status === "present").length;
          const attendanceRate = safeDivide(presentCount, studentAttendance.length);

          return attendanceRate < 0.75; // Below 75% threshold
        }).length;

        debugLog("Low Attendance Students", {
          totalStudents: students.length,
          lowAttendanceStudents
        });

        return lowAttendanceStudents;
      })(),

      attendancePerformanceCorrelation: (() => {
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
              studentResults.reduce((sum, r) => sum + (r.gpa || 0), 0),
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

      // ============================================
      // COURSE & ENROLLMENT ANALYTICS
      // ============================================
      enrollmentRate: (() => {
        if (!intakeCourses?.length) return 0;

        const totalCapacity = intakeCourses.reduce((sum, ic) => sum + ic.maxStudents, 0);
        const totalEnrolled = intakeCourses.reduce((sum, ic) => sum + ic.currentEnrollment, 0);
        const rate = safePercentage(totalEnrolled, totalCapacity);

        debugLog("Enrollment Rate", {
          totalCapacity,
          totalEnrolled,
          rate
        });

        return rate;
      })(),





      // ============================================
      // LECTURER & DEPARTMENT ANALYTICS
      // ============================================


      // ============================================
      // INFRASTRUCTURE & SCHEDULING ANALYTICS
      // ============================================

    };
  })(); // End of dashboardStats calculation

  // Log final dashboard summary in debug mode
  debugLog("Dashboard Summary", {
    totalStudents: dashboardStats.totalStudents,
    passRate: dashboardStats.passRate,
    avgAttendance: dashboardStats.avgAttendanceRate
  });

  /**
   * CHART DATA PROCESSING
   * =====================
   * Process data for visualizations with proper validation and debugging
   */





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

          <HStack>
            <Button
              onClick={handleUpdateAllStudentsPerformance}
              isLoading={isUpdatingPerformance}
              loadingText="Updating..."
              colorScheme="blue"
              size="sm"
              leftIcon={<FiRefreshCw />}
            >
              Update All Students
            </Button>
            <Button
              onClick={handleRefreshWithEnrollmentUpdate}
              isLoading={isUpdatingEnrollments}
              loadingText="Updating..."
              colorScheme="green"
              size="sm"
              leftIcon={<FiRefreshCw />}
            >
              Refresh & Update Enrollments
            </Button>
          </HStack>
        </HStack>

        <VStack spacing={2} align="start">
          <Badge fontSize="sm" color="green.800" variant="subtle">
            <Text fontSize="sm">
              Current Month: {monthComparisonDebug.monthRanges.current.start} - {monthComparisonDebug.monthRanges.current.end}
            </Text>
          </Badge>
          <Badge fontSize="sm" color="green.800" variant="subtle">
            <Text >
              Last Month: {monthComparisonDebug.monthRanges.last.start} - {monthComparisonDebug.monthRanges.last.end}
            </Text>
          </Badge>
        </VStack>

        {/* Academic Performance Stats */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
            Student Academic Performance
          </Text>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
            <StatsCard
              title="Pass Rate"
              value={`${dashboardStats.passRate}%`}
              change={monthOverMonthStats.passRate.change}
              icon={<FiCheckCircle />}
              color="green.500"
            />
            <StatsCard
              title="Average GPA"
              value={dashboardStats.averageGPA.toFixed(2)}
              change={monthOverMonthStats.averageGPA.change}
              icon={<FiTrendingUp />}
              color="blue.500"
            />
            <StatsCard
              title="At-Risk Students"
              value={dashboardStats.atRiskStudents}
              change={monthOverMonthStats.atRiskStudents.change}
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

        {/* Enhanced Academic Analytics */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
            Enhanced Academic Analytics
          </Text>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(1, 1fr)" }} gap={6}>
            <StatsCard
              title="Enrollment Rate"
              value={`${dashboardStats.enrollmentRate}%`}
              change={monthOverMonthStats.enrollmentRate.change}
              icon={<FiUserPlus />}
              color="green.500"
            />

          </Grid>
        </Box>

        {/* Lecturer Overview Stats */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
            Lecturer/Subject Overview
          </Text>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
            <StatsCard
              title="Total Modules"
              value={dashboardStats.totalModules}
              icon={<FiBook />}
              color="purple.500"
            />
            <StatsCard
              title="Total Lecturers"
              value={dashboardStats.totalLecturers}
              icon={<FiUser />}
              color="blue.500"
            />
            <StatsCard
              title="Avg Modules per Lecturer"
              value={dashboardStats.averageModulesPerLecturer}
              icon={<FiBook />}
              color="teal.500"
            />
            <StatsCard
              title="Avg Working Hours"
              value={`${dashboardStats.avgWorkingHours}h`}
              icon={<FiClock />}
              color="orange.500"
            />
          </Grid>
        </Box>

        {/* Month-over-Month Comparison */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
            Month-over-Month Comparison
          </Text>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
            <Card>
              <CardBody>
                <VStack align="start" spacing={3}>
                  <HStack>
                    <FiTrendingUp color="green" />
                    <Text fontWeight="bold" fontSize="lg">Pass Rate</Text>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    {monthOverMonthStats.passRate.current}%
                  </Text>
                  <HStack spacing={2}>
                    <Text fontSize="sm" color="gray.600">Last Month:</Text>
                    <Text fontSize="sm">{monthOverMonthStats.passRate.last}%</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Text fontSize="sm" color="gray.600">Change:</Text>
                    <Text
                      fontSize="sm"
                      color={monthOverMonthStats.passRate.change >= 0 ? "green.500" : "red.500"}
                    >
                      {monthOverMonthStats.passRate.change >= 0 ? "+" : ""}{monthOverMonthStats.passRate.change.toFixed(1)}%
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <VStack align="start" spacing={3}>
                  <HStack>
                    <FiBarChart2 color="blue" />
                    <Text fontWeight="bold" fontSize="lg">Average GPA</Text>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                    {monthOverMonthStats.averageGPA.current.toFixed(2)}
                  </Text>
                  <HStack spacing={2}>
                    <Text fontSize="sm" color="gray.600">Last Month:</Text>
                    <Text fontSize="sm">{monthOverMonthStats.averageGPA.last.toFixed(2)}</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Text fontSize="sm" color="gray.600">Change:</Text>
                    <Text
                      fontSize="sm"
                      color={monthOverMonthStats.averageGPA.change >= 0 ? "green.500" : "red.500"}
                    >
                      {monthOverMonthStats.averageGPA.change >= 0 ? "+" : ""}{monthOverMonthStats.averageGPA.change.toFixed(1)}%
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <VStack align="start" spacing={3}>
                  <HStack>
                    <FiUserPlus color="green" />
                    <Text fontWeight="bold" fontSize="lg">Enrollment Rate</Text>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    {monthOverMonthStats.enrollmentRate.current}%
                  </Text>
                  <HStack spacing={2}>
                    <Text fontSize="sm" color="gray.600">Last Month:</Text>
                    <Text fontSize="sm">{monthOverMonthStats.enrollmentRate.last}%</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Text fontSize="sm" color="gray.600">Change:</Text>
                    <Text
                      fontSize="sm"
                      color={monthOverMonthStats.enrollmentRate.change >= 0 ? "green.500" : "red.500"}
                    >
                      {monthOverMonthStats.enrollmentRate.change >= 0 ? "+" : ""}{monthOverMonthStats.enrollmentRate.change.toFixed(1)}%
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </Grid>
        </Box>


        {/* Attendance Tracking */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
            Attendance Tracking
          </Text>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
            <StatsCard
              title="Avg Attendance Rate"
              value={`${dashboardStats.avgAttendanceRate}%`}
              icon={<FiCheckSquare />}
              color="green.500"
            />
            <StatsCard
              title="Low Attendance Students"
              value={dashboardStats.lowAttendanceStudents}
              icon={<FiAlertTriangle />}
              color="red.500"
            />
            <StatsCard
              title="Attendance-Performance Correlation"
              value={`${dashboardStats.attendancePerformanceCorrelation}%`}
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
      </VStack>
    </Box >
  )
}
