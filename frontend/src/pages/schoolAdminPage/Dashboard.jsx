import { Grid, Box, Text, useColorModeValue } from "@chakra-ui/react"
import { RecentActivity } from "../../component/schoolAdminDashboard/RecentActivity"
import { FacilityUsageChart } from "../../component/schoolAdminDashboard/FacilityUsageChart"
import { BookingApprovals } from "../../component/schoolAdminDashboard/BookingApprovals"
import { QuickActions } from "../../component/schoolAdminDashboard/QuickActions"
import { FiUsers, FiMapPin, FiLock, FiCalendar } from "react-icons/fi"
import { useAdminStore } from "../../store/TBI/adminStore.js"
import { useAcademicStore } from "../../store/academic.js";
import { useFacilityStore } from "../../store/facility.js";
import { useServiceStore } from "../../store/service.js";
import { useTransportationStore } from "../../store/transportation.js";
import { useEffect } from "react";
import { StatCard } from "../../component/common/StatsCard.jsx"


export function Dashboard() {
  const bgColor = useColorModeValue("white", "gray.800")
  const { dashboardStats } = useAdminStore()
  const {
    students, fetchStudents,
    courses, fetchCourses,
    intakes, fetchIntakes,
    intakeCourses, fetchIntakeCourses,
    departments, fetchDepartments,
    lecturers, fetchLecturers,
    modules, fetchModules,
    classSchedules, fetchClassSchedules,
    examSchedules, fetchExamSchedules,
    attendance, fetchAttendance,
    results, fetchResults,
    rooms, fetchRooms,
    schools, fetchSchools
  } = useAcademicStore();
  const { bookings, fetchBookings, resources, fetchResources, timeSlots, fetchTimeSlots } = useFacilityStore();
  const { feedback, fetchFeedback, foundItems, fetchFoundItems, lostItems, fetchLostItems, responds, fetchResponds } = useServiceStore();
  const { busSchedules, fetchBusSchedules, eHailings, fetchEHailings, routes, fetchRoutes, stops, fetchStops, vehicles, fetchVehicles } = useTransportationStore();

  const stats = {
    studentChange: 0,
  }

  // Define date range for last month
  const now = new Date();
  const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // STUDENT CHANGE
  const studentsLastMonth = students.filter(student => {
    // see the user created
    const createdAt = new Date(student.userId.createdAt);
    return createdAt >= firstDayOfLastMonth && createdAt <= lastDayOfLastMonth;
  });
  const totalStudentsLM = studentsLastMonth.length;
  stats.studentChange = Math.round((students.length - totalStudentsLM) / students.length * 100);

  const lockerUsage = Math.round((dashboardStats.totalLockers - dashboardStats.pendingApprovals) / dashboardStats.totalLockers * 100)
  const parkingOccupancy = Math.round((dashboardStats.parkingSpots - dashboardStats.pendingApprovals) / dashboardStats.parkingSpots * 100)


  useEffect(() => {
    // =====================
    // Academic Store Fetches
    // =====================
    fetchStudents().then(() => console.log("Fetched students"));
    fetchCourses().then(() => console.log("Fetched courses"));
    fetchIntakes().then(() => console.log("Fetched intakes"));
    fetchIntakeCourses().then(() => console.log("Fetched intakeCourses"));
    fetchDepartments().then(() => console.log("Fetched departments"));
    fetchLecturers().then(() => console.log("Fetched lecturers"));
    fetchModules().then(() => console.log("Fetched modules"));
    fetchClassSchedules().then(() => console.log("Fetched classSchedules"));
    fetchExamSchedules().then(() => console.log("Fetched examSchedules"));
    fetchAttendance().then(() => console.log("Fetched attendance"));
    fetchResults().then(() => console.log("Fetched results"));
    fetchRooms().then(() => console.log("Fetched rooms"));
    fetchSchools().then(() => console.log("Fetched schools"));

    // =====================
    // Facility Store Fetches
    // =====================
    fetchBookings().then(() => console.log("Fetched bookings"));
    fetchResources().then(() => console.log("Fetched resources"));
    fetchTimeSlots().then(() => console.log("Fetched timeSlots"));

    // =====================
    // Service Store Fetches
    // =====================
    fetchFeedback().then(() => console.log("Fetched feedback"));
    fetchFoundItems().then(() => console.log("Fetched foundItems"));
    fetchLostItems().then(() => console.log("Fetched lostItems"));
    fetchResponds().then(() => console.log("Fetched responds"));

    // =====================
    // Transportation Store Fetches
    // =====================
    fetchBusSchedules().then(() => console.log("Fetched busSchedules"));
    fetchEHailings().then(() => console.log("Fetched eHailings"));
    fetchRoutes().then(() => console.log("Fetched routes"));
    fetchStops().then(() => console.log("Fetched stops"));
    fetchVehicles().then(() => console.log("Fetched vehicles"));

  }, [])

  return (
    <Box flex={1} p={6}>
      {/* KPI Cards */}
      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6} mb={8}>
        <StatCard
          title="Total Students"
          value={students.length}
          change={stats.studentChange}
          icon={<FiUsers />}
        />
        <StatCard
          title="Active Bookings ❌"
          value={dashboardStats.activeBookings}
          change={8}
          icon={<FiCalendar />}
        />
        <StatCard
          title="Locker Usage ❌"
          value={`${lockerUsage}%`}
          change={lockerUsage}
          icon={<FiLock />}
        />
        <StatCard
          title="Parking Spots ❌"
          value={`${parkingOccupancy}%`}
          change={parkingOccupancy}
          icon={<FiMapPin />}
        />
      </Grid>

      {/* Main Content */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6} mb={6}>
        <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
          <Box mb={4}>
            <Text fontSize="lg" fontWeight="semibold" mb={1}>
              Facility Usage Trends ❌
            </Text>
            <Text fontSize="sm" color="gray.600">
              Daily facility bookings over the past 30 days
            </Text>
          </Box>
          <FacilityUsageChart />
        </Box>

        <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
          <Box mb={4}>
            <Text fontSize="lg" fontWeight="semibold" mb={1}>
              Recent Activity ❌
            </Text>
            <Text fontSize="sm" color="gray.600">
              Latest system activities and user actions
            </Text>
          </Box>
          <RecentActivity />
        </Box>
      </Grid>

      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
        <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
          <Box mb={4}>
            <Text fontSize="lg" fontWeight="semibold" mb={1}>
              Pending Approvals ❌
            </Text>
            <Text fontSize="sm" color="gray.600">
              Booking requests awaiting your approval
            </Text>
          </Box>
          <BookingApprovals />
        </Box>

        <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
          <Box mb={4}>
            <Text fontSize="lg" fontWeight="semibold" mb={1}>
              Quick Actions
            </Text>
            <Text fontSize="sm" color="gray.600">
              Common administrative tasks
            </Text>
          </Box>
          <QuickActions />
        </Box>
      </Grid>
    </Box>
  )
}
