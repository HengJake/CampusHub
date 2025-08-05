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
  Button,
  useToast,
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
import { useEffect, useState } from "react";
import { StatsCard } from "../../component/common/StatsCard.jsx";
import RefreshData from "../../component/common/RefreshData.jsx";
import {
  updateStudentAcademicPerformance,
  updateAllStudentsAcademicPerformance
} from "../../component/schoolAdminDashboard/dashboard/updateStudent.js";
import { updateIntakeCourseEnrollments } from "../../component/schoolAdminDashboard/dashboard/updateIntakeCourseEnrollments.js";

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
    intakeCourses,
    rooms,
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
    fetchIntakeCourses,
    fetchRooms,
    fetchExamSchedules,
    fetchAttendance,
    fetchClassSchedules,
    fetchResults,
    updateIntakeCourse,
    getCourseCompletionRate,
    getAllCourseCompletionRate,
    getAverageAttendance,
    getExamPassRate,
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
      await fetchStudents();

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
        fetchStudents(),
        fetchLecturers?.(),
        fetchCourses(),
        fetchModules?.(),
        fetchDepartments?.(),
        fetchIntakes?.(),
        fetchIntakeCourses?.(),
        fetchRooms?.(),
        fetchExamSchedules?.(),
        fetchAttendance?.(),
        fetchClassSchedules?.(),
        fetchResults?.()
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

  const dashboardStats = (() => {
    debugLog("Data Arrays", {
      students: students?.length || 0,
      lecturers: lecturers?.length || 0,
      courses: courses?.length || 0,
      modules: modules?.length || 0,
      departments: departments?.length || 0,
      intakes: intakes?.length || 0,
      intakeCourses: intakeCourses?.length || 0,
      rooms: rooms?.length || 0,
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
      // STUDENT ACADEMIC PERFORMANCE
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
          return student.cgpa > 3.8; // Top performer threshold
        }).length;

        debugLog("Top Performers", {
          totalStudents: students.length,
          topPerformers
        });

        return topPerformers;
      })(),

      // ============================================
      // LECTURER/SUBJECT OVERVIEW
      // ============================================
      totalModules: (() => {
        if (!modules?.length) return 0;
        const totalModules = modules.length;

        debugLog("Total Modules", {
          totalModules: modules.length
        });

        return totalModules;
      })(),

      totalLecturers: (() => {
        if (!lecturers?.length) return 0;
        const totalLecturers = lecturers.length;

        debugLog("Total Lecturers", {
          totalLecturers: lecturers.length
        });

        return totalLecturers;
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
      // ASSESSMENT & EXAM INSIGHTS
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

      gradeDistribution: (() => {
        if (!results?.length) return { A: 0, B: 0, C: 0, D: 0, F: 0 };

        const distribution = results.reduce((acc, result) => {
          const grade = result.grade?.charAt(0) || 'F';
          acc[grade] = (acc[grade] || 0) + 1;
          return acc;
        }, {});

        debugLog("Grade Distribution", {
          totalResults: results.length,
          distribution
        });

        return distribution;
      })(),

      atRiskStudents: (() => {
        if (!students?.length) return 0;
        const atRisk = students.filter(student => student.cgpa < 2.5).length;

        debugLog("At-Risk Students", {
          totalStudents: students.length,
          atRiskStudents: atRisk
        });

        return atRisk;
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

      courseCompletionRate: (() => {
        if (!students?.length || !courses?.length) return 0;

        const graduatedStudents = students.filter(s => s.status === 'graduated').length;
        const rate = safePercentage(graduatedStudents, students.length);

        debugLog("Course Completion Rate", {
          totalStudents: students.length,
          graduatedStudents,
          rate
        });

        return rate;
      })(),

      moduleDifficultyIndex: (() => {
        if (!modules?.length || !results?.length) return 0;

        const moduleDifficulties = modules.map(module => {
          const moduleResults = results.filter(r => r.moduleId === module._id);
          if (!moduleResults.length) return 0;

          const avgGPA = safeDivide(
            moduleResults.reduce((sum, r) => sum + (r.gpa || 0), 0),
            moduleResults.length
          );

          // Difficulty index: lower GPA = higher difficulty
          return 4.0 - avgGPA;
        }).filter(difficulty => difficulty > 0);

        const avgDifficulty = safeDivide(
          moduleDifficulties.reduce((sum, d) => sum + d, 0),
          moduleDifficulties.length
        );

        debugLog("Module Difficulty Index", {
          totalModules: modules.length,
          modulesWithResults: moduleDifficulties.length,
          avgDifficulty: parseFloat(avgDifficulty.toFixed(2))
        });

        return parseFloat(avgDifficulty.toFixed(2));
      })(),

      // ============================================
      // LECTURER & DEPARTMENT ANALYTICS
      // ============================================
      lecturerWorkloadDistribution: (() => {
        if (!lecturers?.length || !classSchedules?.length) return 0;

        const lecturerWorkloads = lecturers.map(lecturer => {
          const lecturerSchedules = classSchedules.filter(s => s.lecturerId === lecturer._id);
          return lecturerSchedules.length;
        });

        const avgWorkload = safeDivide(
          lecturerWorkloads.reduce((sum, w) => sum + w, 0),
          lecturerWorkloads.length
        );

        debugLog("Lecturer Workload Distribution", {
          totalLecturers: lecturers.length,
          avgWorkload: parseFloat(avgWorkload.toFixed(2))
        });

        return parseFloat(avgWorkload.toFixed(2));
      })(),

      officeHoursUtilization: (() => {
        if (!lecturers?.length) return 0;

        const lecturersWithOfficeHours = lecturers.filter(l => l.officeHours?.length > 0).length;
        const utilization = safePercentage(lecturersWithOfficeHours, lecturers.length);

        debugLog("Office Hours Utilization", {
          totalLecturers: lecturers.length,
          lecturersWithOfficeHours,
          utilization
        });

        return utilization;
      })(),

      departmentPerformanceComparison: (() => {
        if (!departments?.length || !results?.length || !lecturers?.length) return 0;

        const departmentStats = departments.map(dept => {
          const deptLecturers = lecturers.filter(l => l.departmentId === dept._id);
          const lecturerIds = deptLecturers.map(l => l._id);

          // Get results for modules taught by department lecturers
          const deptResults = results.filter(r =>
            modules.some(m => m._id === r.moduleId &&
              classSchedules.some(cs => cs.moduleId === m._id && lecturerIds.includes(cs.lecturerId)))
          );

          if (!deptResults.length) return 0;

          const avgGPA = safeDivide(
            deptResults.reduce((sum, r) => sum + (r.gpa || 0), 0),
            deptResults.length
          );

          return avgGPA;
        }).filter(gpa => gpa > 0);

        const avgDepartmentGPA = safeDivide(
          departmentStats.reduce((sum, gpa) => sum + gpa, 0),
          departmentStats.length
        );

        debugLog("Department Performance Comparison", {
          totalDepartments: departments.length,
          departmentsWithData: departmentStats.length,
          avgDepartmentGPA: parseFloat(avgDepartmentGPA.toFixed(2))
        });

        return parseFloat(avgDepartmentGPA.toFixed(2));
      })(),

      // ============================================
      // INFRASTRUCTURE & SCHEDULING ANALYTICS
      // ============================================
      roomUtilizationRate: (() => {
        if (!rooms?.length || !classSchedules?.length) return 0;

        const totalRooms = rooms.filter(r => r.isActive).length;
        const utilizedRooms = new Set(classSchedules.map(cs => cs.roomId)).size;
        const rate = safePercentage(utilizedRooms, totalRooms);

        debugLog("Room Utilization Rate", {
          totalRooms,
          utilizedRooms,
          rate
        });

        return rate;
      })(),

      scheduleConflictAlerts: (() => {
        if (!classSchedules?.length || !examSchedules?.length) return 0;

        let conflicts = 0;
        const today = new Date();

        // Check for conflicts between class schedules and exam schedules
        classSchedules.forEach(cs => {
          examSchedules.forEach(es => {
            if (cs.roomId === es.roomId && cs.dayOfWeek === 'Monday') { // Simplified conflict check
              conflicts++;
            }
          });
        });

        debugLog("Schedule Conflict Alerts", {
          totalClassSchedules: classSchedules.length,
          totalExamSchedules: examSchedules.length,
          conflicts
        });

        return conflicts;
      })(),

      capacityEfficiency: (() => {
        if (!rooms?.length || !classSchedules?.length) return 0;

        const roomEfficiencies = rooms.map(room => {
          const roomSchedules = classSchedules.filter(cs => cs.roomId === room._id);
          if (!roomSchedules.length) return 0;

          // Simplified efficiency calculation
          const avgUtilization = safeDivide(roomSchedules.length, room.capacity);
          return Math.min(avgUtilization, 1); // Cap at 100%
        }).filter(efficiency => efficiency > 0);

        const avgEfficiency = safeDivide(
          roomEfficiencies.reduce((sum, e) => sum + e, 0),
          roomEfficiencies.length
        );

        debugLog("Capacity Efficiency", {
          totalRooms: rooms.length,
          roomsWithSchedules: roomEfficiencies.length,
          avgEfficiency: parseFloat(avgEfficiency.toFixed(2))
        });

        return parseFloat(avgEfficiency.toFixed(2));
      })(),
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
        {/* Academic Performance Stats */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
            Student Academic Performance
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

        {/* Enhanced Academic Analytics */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
            Enhanced Academic Analytics
          </Text>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
            <StatsCard
              title="Enrollment Rate"
              value={`${dashboardStats.enrollmentRate}%`}
              icon={<FiUserPlus />}
              color="green.500"
            />
            <StatsCard
              title="Course Completion Rate"
              value={`${dashboardStats.courseCompletionRate}%`}
              icon={<FaGraduationCap />}
              color="blue.500"
            />
            <StatsCard
              title="Module Difficulty Index"
              value={dashboardStats.moduleDifficultyIndex}
              icon={<FiAlertCircle />}
              color="orange.500"
            />
            <StatsCard
              title="Department Performance"
              value={dashboardStats.departmentPerformanceComparison.toFixed(2)}
              icon={<FiBarChart2 />}
              color="purple.500"
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

        {/* Assessment & Exam Insights */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={4}>
            Assessment & Exam Insights
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
      </VStack>
    </Box>
  )
}
