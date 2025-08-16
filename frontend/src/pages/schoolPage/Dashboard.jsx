import { Grid, Box, Text, useColorModeValue } from "@chakra-ui/react"
import { RecentActivity } from "../../component/schoolAdminDashboard/RecentActivity"
import { FacilityUsageChart } from "../../component/schoolAdminDashboard/FacilityUsageChart"
import { BookingApprovals } from "../../component/schoolAdminDashboard/BookingApprovals"
import { RecentBookings } from "../../component/schoolAdminDashboard/RecentBookings"
import { QuickActions } from "../../component/schoolAdminDashboard/QuickActions"
import { FiUsers, FiMapPin, FiLock, FiCalendar } from "react-icons/fi"
import { useAdminStore } from "../../store/TBI/adminStore.js"
import { useAcademicStore } from "../../store/academic.js";
import { useFacilityStore } from "../../store/facility.js";
import { useServiceStore } from "../../store/service.js";
import { useTransportationStore } from "../../store/transportation.js";
import { useEffect } from "react";
import { StatsCard } from "../../component/common/StatsCard.jsx"
import { FaBookReader } from "react-icons/fa";


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
  const { bookings, fetchBookings, resources, fetchResources, lockerUnits, fetchLockerUnits } = useFacilityStore();
  const { feedback, fetchFeedback, lostItems, fetchLostItems, responds, fetchResponds } = useServiceStore();
  const { busSchedules, fetchBusSchedules, eHailings, fetchEHailings, routes, fetchRoutes, stops, fetchStops, vehicles, fetchVehicles } = useTransportationStore();

  const stats = {
    studentChange: 0,
    bookingChange: 0,
    lockerChange: 0,
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

  // BOOKING CHANGE
  const bookingsThisMonth = bookings.filter(booking => {
    const createdAt = new Date(booking.createdAt);
    return createdAt >= firstDayOfThisMonth;
  });

  const bookingsLastMonth = bookings.filter(booking => {
    const createdAt = new Date(booking.createdAt);
    return createdAt >= firstDayOfLastMonth && createdAt <= lastDayOfLastMonth;
  });

  const totalBookingsLM = bookingsLastMonth.length;
  const totalBookingsTM = bookingsThisMonth.length;

  // Calculate percentage change
  if (totalBookingsLM > 0) {
    stats.bookingChange = Math.round(((totalBookingsTM - totalBookingsLM) / totalBookingsLM) * 100);
  } else {
    stats.bookingChange = totalBookingsTM > 0 ? 100 : 0; // If no bookings last month but some this month, show 100% increase
  }

  // LOCKER CHANGE - Track locker activity (new lockers or status changes) by month
  const lockersThisMonth = lockerUnits.filter(locker => {
    const updatedAt = new Date(locker.updatedAt || locker.createdAt);
    return updatedAt >= firstDayOfThisMonth;
  });

  const lockersLastMonth = lockerUnits.filter(locker => {
    const updatedAt = new Date(locker.updatedAt || locker.createdAt);
    return updatedAt >= firstDayOfLastMonth && updatedAt <= lastDayOfLastMonth;
  });

  const totalLockersLM = lockersLastMonth.length;
  const totalLockersTM = lockersThisMonth.length;

  // LOCKER USAGE CALCULATION
  const totalLockers = lockerUnits.length;
  const usedLockers = lockerUnits.filter(locker => !locker.isAvailable).length;

  // Calculate locker changes (new lockers or status changes)
  if (totalLockersLM > 0) {
    // Calculate percentage increase from last month
    const percentageIncrease = Math.round(((totalLockersTM - totalLockersLM) / totalLockersLM) * 100);
    stats.lockerChange = percentageIncrease;
  } else if (totalLockersTM > 0) {
    // If last month was 0 but this month has activity, it's a new start
    stats.lockerChange = 100;
  } else {
    // No activity in either month
    stats.lockerChange = 0;
  }


  // Display all intakes count
  const currentMonthIntakes = intakes.length;



  useEffect(() => {
    // =====================
    // Academic Store Fetches
    // =====================
    fetchStudents();
    fetchCourses();
    fetchIntakes();
    fetchIntakeCourses();
    fetchDepartments();
    fetchLecturers();
    fetchModules();
    fetchClassSchedules();
    fetchExamSchedules();
    fetchAttendance();
    fetchResults();
    fetchRooms();
    fetchSchools();

    // =====================
    // Facility Store Fetches
    // =====================
    fetchBookings();
    fetchResources();
    fetchLockerUnits();

    // =====================
    // Service Store Fetches
    // =====================
    fetchFeedback();
    fetchLostItems();
    fetchResponds();

    // =====================
    // Transportation Store Fetches
    // =====================
    fetchBusSchedules();
    fetchEHailings();
    fetchRoutes();
    fetchStops();
    fetchVehicles();

  }, [])

  return (
    <Box flex={1}>
      {/* KPI Cards */}
      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6} mb={8}>
        <StatsCard
          title="Total Students"
          value={students.length}
          change={stats.studentChange}
          icon={<FiUsers />}
        />
        <StatsCard
          title="Active Bookings"
          value={bookings.length}
          change={stats.bookingChange}
          icon={<FiCalendar />}
        />
        <StatsCard
          title="Locker Changes"
          value={totalLockersTM}
          change={stats.lockerChange}
          icon={<FiLock />}
        />
        <StatsCard
          title="Total Number of Intake"
          value={currentMonthIntakes}
          icon={<FaBookReader />}
        />
      </Grid>

      {/* Main Content */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6} mb={6}>
        <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
          <Box mb={4}>
            <Text fontSize="lg" fontWeight="semibold" mb={1}>
              Facility Usage Trends
            </Text>
            <Text fontSize="sm" color="gray.600">
              Daily facility bookings over the past 30 days
            </Text>
          </Box>
          <FacilityUsageChart />
        </Box>

        {/* Recent Confirmed/Cancelled Bookings */}
        <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
          <Box>
            <Text fontSize="lg" fontWeight="semibold" mb={1}>
              Recent Booking Statuses
            </Text>
            <Text fontSize="sm" color="gray.600">
              Most recent confirmed and cancelled bookings
            </Text>
          </Box>
          <RecentBookings />
        </Box>

      </Grid>

      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} mb={6}>
        <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
          <Box mb={4}>
            <Text fontSize="lg" fontWeight="semibold" mb={1}>
              Pending Approvals
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
