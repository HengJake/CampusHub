import { Grid, Box, Text, useColorModeValue } from "@chakra-ui/react"
import { KPICard } from "../../component/schoolAdminDashboard/KPICard.jsx"
import { RecentActivity } from "../../component/schoolAdminDashboard/RecentActivity"
import { FacilityUsageChart } from "../../component/schoolAdminDashboard/FacilityUsageChart"
import { BookingApprovals } from "../../component/schoolAdminDashboard/BookingApprovals"
import { QuickActions } from "../../component/schoolAdminDashboard/QuickActions"
import { FiUsers, FiMapPin, FiLock, FiCalendar } from "react-icons/fi"
import { useAdminStore } from "../../store/TBI/adminStore.js"

export function Dashboard() {
  const bgColor = useColorModeValue("white", "gray.800")
  const { dashboardStats } = useAdminStore()

  const lockerUsage = Math.round((dashboardStats.totalLockers - dashboardStats.pendingApprovals) / dashboardStats.totalLockers * 100)
  const parkingOccupancy = Math.round((dashboardStats.parkingSpots - dashboardStats.pendingApprovals) / dashboardStats.parkingSpots * 100)


  return (
    <Box flex={1} p={6}>
      {/* KPI Cards */}
      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6} mb={8}>
        <KPICard
          title="Total Students"
          value={dashboardStats.totalStudents.toLocaleString()}
          change="+12%"
          changeType="positive"
          icon={FiUsers}
          subtitle="from last month"
        />
        <KPICard
          title="Active Bookings"
          value={dashboardStats.activeBookings.toLocaleString()}
          change="+8%"
          changeType="positive"
          icon={FiCalendar}
          subtitle="from yesterday"
        />
        <KPICard
          title="Locker Usage"
          value={`${lockerUsage}%`}
          icon={FiLock}
          subtitle={`${dashboardStats.totalLockers - dashboardStats.pendingApprovals} of ${dashboardStats.totalLockers} lockers occupied`}
          showProgress={true}
          progressValue={lockerUsage}
        />
        <KPICard
          title="Parking Spots"
          value={`${parkingOccupancy}%`}
          icon={FiMapPin}
          subtitle={`${dashboardStats.parkingSpots - dashboardStats.pendingApprovals} of ${dashboardStats.parkingSpots} spots occupied`}
          showProgress={true}
          progressValue={parkingOccupancy}
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

        <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
          <Box mb={4}>
            <Text fontSize="lg" fontWeight="semibold" mb={1}>
              Recent Activity
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
