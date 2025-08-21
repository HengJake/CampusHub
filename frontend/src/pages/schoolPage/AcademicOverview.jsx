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
  Badge,
  Divider
} from "@chakra-ui/react"
import {
  FiCheckCircle,
  FiTrendingUp,
  FiAlertTriangle,
  FiStar,
  FiRefreshCw,
  FiBookOpen,
  FiUsers,
  FiBook,
  FiUser,
  FiClock,
  FiBarChart2,
  FiUserPlus
} from "react-icons/fi"
import { useAcademicStore } from "../../store/academic.js";
import { useEffect, useState } from "react";
import { StatsCard } from "../../component/common/StatsCard.jsx";
import {
  updateAllStudentsAcademicPerformance
} from "../../component/schoolAdminDashboard/dashboard/updateStudent.js";
import { updateIntakeCourseEnrollments } from "../../component/schoolAdminDashboard/dashboard/updateIntakeCourseEnrollments.js";

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
    fetchStudentsBySchoolId,
    fetchLecturersBySchoolId,
    fetchModulesBySchoolId,
    fetchDepartmentsBySchoolId,
    fetchIntakeCoursesBySchoolId,
    fetchAttendanceBySchoolId,
    fetchClassSchedulesBySchoolId,
    fetchResultsBySchoolId,
    updateIntakeCourse,
  } = useAcademicStore();

  const [isUpdatingPerformance, setIsUpdatingPerformance] = useState(false);
  const [isUpdatingEnrollments, setIsUpdatingEnrollments] = useState(false);
  const [lastEnrollmentUpdate, setLastEnrollmentUpdate] = useState(null);
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

      console.log("Starting enrollment update process...");
      console.log("Current intake courses:", intakeCourses.length);
      console.log("Current students:", students.length);

      // Update enrollment counts first
      const enrollmentResults = await updateIntakeCourseEnrollments(
        intakeCourses,
        students,
        updateIntakeCourse,
        fetchIntakeCoursesBySchoolId
      );


      // Then refresh all data
      await fetchAllData();

      // Update the last enrollment update timestamp
      if (enrollmentResults.success) {
        setLastEnrollmentUpdate(new Date());
      }

      // Create a more detailed success message
      let successMessage = enrollmentResults.message;
      if (enrollmentResults.success && enrollmentResults.results) {
        const successfulUpdates = enrollmentResults.results.filter(r => r.success && !r.noChange);
        const noChangeCount = enrollmentResults.results.filter(r => r.noChange).length;

        if (successfulUpdates.length > 0) {
          successMessage = `Successfully updated ${successfulUpdates.length} intake course enrollments`;
          if (noChangeCount > 0) {
            successMessage += ` (${noChangeCount} unchanged)`;
          }
        }
      }

      toast({
        title: "Refresh Complete",
        description: successMessage,
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
   * FETCH ALL DATA FUNCTION
   * ======================
   * Centralized function to fetch all academic data
   */
  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchStudentsBySchoolId(),
        fetchLecturersBySchoolId(),
        fetchModulesBySchoolId(),
        fetchDepartmentsBySchoolId(),
        fetchIntakeCoursesBySchoolId(),
        fetchAttendanceBySchoolId(),
        fetchClassSchedulesBySchoolId(),
        fetchResultsBySchoolId()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchAllData();
    // Initialize last enrollment update time when component loads
    setLastEnrollmentUpdate(new Date());
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
   */
  const dashboardStats = (() => {
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
        return safePercentage(passed, results.length);
      })(),

      atRiskStudents: (() => {
        if (!students?.length || !results?.length) return 0;
        return students.filter(r => r.cgpa < 2.5).length;
      })(),

      topPerformers: (() => {
        if (!students?.length || !results?.length) return 0;
        return students.filter(student => {
          return student.cgpa > 3.8; // Top performer threshold
        }).length;
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
          return totalHours;
        });

        const totalWorkingHours = lecturerWorkingHours.reduce((sum, hours) => sum + hours, 0);
        const averageWorkingHours = safeDivide(totalWorkingHours, lecturers.length);

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

        return parseFloat(averageModules.toFixed(2));
      })(),

      // ============================================
      // ATTENDANCE TRACKING
      // ============================================
      avgAttendanceRate: (() => {
        if (!attendance?.length) return 0;
        const present = attendance.filter(a => a.status === "present").length;
        return safePercentage(present, attendance.length);
      })(),

      weeklyAbsenceTrend: (() => {
        if (!attendance?.length) return 0;
        const absent = attendance.filter(a => a.status === "absent").length;
        return safePercentage(absent, attendance.length);
      })(),

      // ============================================
      // ENHANCED ACADEMIC PERFORMANCE METRICS
      // ============================================
      averageGPA: (() => {
        if (!results?.length) return 0;
        const totalGPA = results.reduce((sum, result) => sum + (result.gpa || 0), 0);
        const average = safeDivide(totalGPA, results.length);
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

        return rate;
      })(),
    };
  })(); // End of dashboardStats calculation

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

        <HStack spacing={2} align="start">
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
        </HStack>

        <Divider />

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

        <Divider />

        {/* Enrollment Overview */}
        <Box>
          <HStack align={"center"} justify={"space-between"} mb={4}>
            <Text fontSize="xl" fontWeight="bold" color="gray.800" >
              Enrollment Overview
            </Text>
            {/* Last Update Information */}
            {lastEnrollmentUpdate && (
              <Text fontSize="sm" color="gray.600" mt={2}>
                Last enrollment update: {lastEnrollmentUpdate.toLocaleString()}
              </Text>
            )}
          </HStack>

          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
            <StatsCard
              title="Total Intake Courses"
              value={intakeCourses.length}
              icon={<FiBookOpen />}
              color="blue.500"
            />
            <StatsCard
              title="Total Enrolled Students"
              value={students.length}
              icon={<FiUsers />}
              color="green.500"
            />
            <StatsCard
              title="Available Courses"
              value={intakeCourses.filter(ic => ic.status === 'available').length}
              icon={<FiCheckCircle />}
              color="green.500"
            />
            <StatsCard
              title="Full Courses"
              value={intakeCourses.filter(ic => ic.status === 'full').length}
              icon={<FiAlertTriangle />}
              color="orange.500"
            />
          </Grid>
        </Box>

        <Divider />

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
      </VStack>
    </Box >
  )
}
