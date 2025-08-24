// Programmer Name : Choy Chi Lam, Frontend Developer
// Program Name: analytics.jsx
// Description: Analytics dashboard providing comprehensive insights into system usage, client metrics, and business performance indicators
// First Written on: July 22, 2024
// Edited on: Friday, July 31, 2024

"use client"

import React from "react";
import { useAcademicStore } from "../../store/academic";
import { useFacilityStore } from "../../store/facility";
import { useTransportationStore } from "../../store/transportation";
import { useServiceStore } from "../../store/service";
import { useEffect } from "react";

import {
  Box,
  Grid,
  Card,
  CardBody,
  Text,
  VStack,
  HStack,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Progress,
  Flex,
  Spacer,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react"
import { useState } from "react"
import { Download, FileText } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function Analytics() {
  const [selectedSchool, setSelectedSchool] = useState("all")
  const [dateRange, setDateRange] = useState("6months")
  const [schoolSortOrder, setSchoolSortOrder] = useState("asc");

  const schools = useAcademicStore((state) => state.schools);
  const fetchSchools = useAcademicStore((state) => state.fetchSchools);
  const students = useAcademicStore((state) => state.students);
  const fetchStudents = useAcademicStore((state) => state.fetchStudents);
  const attendance = useAcademicStore((state) => state.attendance);
  const fetchAttendance = useAcademicStore((state) => state.fetchAttendance);
  const results = useAcademicStore((state) => state.results);
  const fetchResults = useAcademicStore((state) => state.fetchResults);
  const classSchedules = useAcademicStore((state) => state.classSchedules);
  const fetchClassSchedules = useAcademicStore((state) => state.fetchClassSchedules);

  // Facility store
  const bookings = useFacilityStore((state) => state.bookings);
  const fetchBookings = useFacilityStore((state) => state.fetchBookings);
  const resources = useFacilityStore((state) => state.resources);
  const fetchResources = useFacilityStore((state) => state.fetchResources);

  // Transportation store
  const busSchedules = useTransportationStore((state) => state.busSchedules);
  const fetchBusSchedules = useTransportationStore((state) => state.fetchBusSchedules);

  // Service store
  const feedback = useServiceStore((state) => state.feedback);
  const bugReports = useServiceStore((state) => state.bugReports);
  const fetchFeedback = useServiceStore((state) => state.fetchFeedback);
  const fetchBugReports = useServiceStore((state) => state.fetchBugReports);

  useEffect(() => {
    fetchSchools();
    fetchStudents();
    fetchAttendance();
    fetchResults();
    fetchClassSchedules();
    fetchBookings();
    fetchResources();
    fetchBusSchedules();
    fetchFeedback();
    fetchBugReports();
  }, []);

  // Helper function to get date from range
  const getDateFromRange = (range) => {
    const now = new Date();
    switch (range) {
      case "1month":
        return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      case "3months":
        return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      case "6months":
        return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      case "1year":
        return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      default:
        return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    }
  };

  // Generate usage data based on real bookings and schedules
  const generateUsageData = () => {
    if (!schools.length) return [];

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const startDate = getDateFromRange(dateRange);

    return months.map((month, index) => {
      const monthData = { month };

      schools.forEach(school => {
        const schoolKey = school.name.toLowerCase().replace(/\s+/g, '');

        // Count bookings for this school in this month
        const monthBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.createdAt);
          return booking.schoolId === school._id &&
            bookingDate >= startDate &&
            bookingDate.getMonth() === index;
        }).length;

        // Count class schedules for this school in this month
        const monthSchedules = classSchedules.filter(schedule => {
          const scheduleDate = new Date(schedule.createdAt);
          return schedule.schoolId === school._id &&
            scheduleDate >= startDate &&
            scheduleDate.getMonth() === index;
        }).length;

        monthData[schoolKey] = monthBookings + monthSchedules;
      });

      return monthData;
    });
  };

  // Generate facility usage data based on real resource usage
  const generateFacilityUsageData = () => {
    if (!resources.length) return [];

    const facilityTypes = {};

    resources.forEach(resource => {
      const type = resource.type || 'Other';
      if (!facilityTypes[type]) {
        facilityTypes[type] = { bookings: 0, total: 0 };
      }

      // Count bookings for this resource type
      const resourceBookings = bookings.filter(booking =>
        booking.resourceId === resource._id &&
        new Date(booking.createdAt) >= getDateFromRange(dateRange)
      ).length;

      facilityTypes[type].bookings += resourceBookings;
      facilityTypes[type].total += 1;
    });

    // Calculate usage percentage and return formatted data
    return Object.entries(facilityTypes).map(([type, data]) => {
      const usage = data.total > 0 ? Math.round((data.bookings / data.total) * 100) : 0;
      return {
        name: type,
        usage: usage,
        color: getRandomColor(type)
      };
    });
  };

  // Generate academic performance data based on real results and attendance
  const generateAcademicData = () => {
    if (!schools.length) return [];

    return schools.map(school => {
      const schoolResults = results.filter(result =>
        result.schoolId === school._id &&
        new Date(result.createdAt) >= getDateFromRange(dateRange)
      );

      const schoolAttendance = attendance.filter(att =>
        att.schoolId === school._id &&
        new Date(att.date) >= getDateFromRange(dateRange)
      );

      // Calculate average grade
      let avgGrade = 0;
      if (schoolResults.length > 0) {
        const totalMarks = schoolResults.reduce((sum, result) => sum + (result.marks || 0), 0);
        avgGrade = totalMarks / schoolResults.length;
      }

      // Calculate attendance rate
      let attendanceRate = 0;
      if (schoolAttendance.length > 0) {
        const presentCount = schoolAttendance.filter(att => att.status === 'present').length;
        attendanceRate = (presentCount / schoolAttendance.length) * 100;
      }

      // Calculate assignment completion (based on results with marks)
      let assignmentCompletion = 0;
      if (schoolResults.length > 0) {
        const completedResults = schoolResults.filter(result => result.marks !== undefined && result.marks !== null);
        assignmentCompletion = (completedResults.length / schoolResults.length) * 100;
      }

      return {
        school: school.name,
        avgGrade: Math.round(avgGrade * 10) / 10,
        attendance: Math.round(attendanceRate * 10) / 10,
        assignments: Math.round(assignmentCompletion * 10) / 10
      };
    });
  };

  // Helper function to generate consistent colors
  const getRandomColor = (seed) => {
    const colors = ["#3182CE", "#38A169", "#D69E2E", "#E53E3E", "#805AD5", "#DD6B20", "#319795", "#D53F8C"];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Calculate engagement metrics for each school
  const calculateEngagementMetrics = () => {
    if (!schools.length) return [];

    return schools.map(school => {
      const schoolBookings = bookings.filter(booking =>
        booking.schoolId === school._id &&
        new Date(booking.createdAt) >= getDateFromRange(dateRange)
      ).length;

      const schoolBusSchedules = busSchedules.filter(schedule =>
        schedule.schoolId === school._id &&
        new Date(schedule.createdAt) >= getDateFromRange(dateRange)
      ).length;

      const schoolFeedback = feedback.filter(fb =>
        fb.schoolId === school._id &&
        new Date(fb.createdAt) >= getDateFromRange(dateRange)
      ).length;

      const schoolBugReports = bugReports.filter(bug =>
        bug.schoolId === school._id &&
        new Date(bug.createdAt) >= getDateFromRange(dateRange)
      ).length;

      // Calculate total engagement score
      const totalActions = schoolBookings + schoolBusSchedules + schoolFeedback + schoolBugReports;

      // Determine engagement level based on total actions
      let engagementLevel = "Low";
      if (totalActions >= 50) engagementLevel = "High";
      else if (totalActions >= 20) engagementLevel = "Medium";

      return {
        schoolId: school._id,
        schoolName: school.name,
        bookings: schoolBookings,
        busSchedules: schoolBusSchedules,
        feedback: schoolFeedback,
        bugReports: schoolBugReports,
        totalActions,
        engagementLevel
      };
    });
  };

  // Get engagement summary for the engagement levels section
  const getEngagementSummary = () => {
    const metrics = calculateEngagementMetrics();
    if (!metrics.length) return { high: 0, medium: 0, low: 0, total: 0 };

    const high = metrics.filter(m => m.engagementLevel === "High").length;
    const medium = metrics.filter(m => m.engagementLevel === "Medium").length;
    const low = metrics.filter(m => m.engagementLevel === "Low").length;

    return { high, medium, low, total: metrics.length };
  };

  // Generate engagement data for charts
  const generateEngagementData = () => {
    if (!schools.length) return [];

    return schools.map(school => {
      const metrics = calculateEngagementMetrics().find(m => m.schoolId === school._id);
      return {
        name: school.name,
        value: metrics ? metrics.totalActions : 0
      };
    });
  };

  const handleExportReport = (format) => {
    console.log(`Exporting report in ${format} format...`)
  }

  const engagementSummary = getEngagementSummary();
  const usageData = generateUsageData();
  const facilityUsageData = generateFacilityUsageData();
  const academicData = generateAcademicData();
  const engagementData = generateEngagementData();

  return (
    <VStack spacing={6} align="stretch" >
      {/* Header */}
      <Flex>
        <Box>
          <Text fontSize="2xl" fontWeight="bold">
            Analytics Dashboard
          </Text>
          <Text color="gray.600">Cross-client performance intelligence and insights</Text>
        </Box>
        <Spacer />
        <HStack>
          <Button leftIcon={<FileText />} variant="outline" onClick={() => handleExportReport("pdf")}>
            Export PDF
          </Button>
          <Button leftIcon={<Download />} colorScheme="blue" onClick={() => handleExportReport("excel")}>
            Export Excel
          </Button>
        </HStack>
      </Flex>

      {/* Filters */}
      <Card>
        <CardBody>
          <HStack spacing={4}>
            <Box>
              <Text fontSize="sm" mb={2}>
                School:
              </Text>
              <Select value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}>
                <option value="all">All Schools</option>
                {schools.map((school) => (
                  <option key={school._id} value={school._id}>{school.name}</option>
                ))}
              </Select>
            </Box>
            <Box>
              <Text fontSize="sm" mb={2}>
                Date Range:
              </Text>
              <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </Select>
            </Box>
          </HStack>
        </CardBody>
      </Card>

      <Tabs>
        <TabList>
          <Tab>Usage Analytics</Tab>
          <Tab>Academic Performance</Tab>
          <Tab>Facility Usage</Tab>
          <Tab>Engagement Metrics</Tab>
        </TabList>

        <TabPanels>
          {/* Usage Analytics */}
          <TabPanel px={0}>
            <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
              <Card>
                <CardBody>
                  <Text fontSize="lg" fontWeight="semibold" mb={4}>
                    Platform Usage Trends
                  </Text>
                  <Box h="300px">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={usageData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        {schools.map((school, index) => {
                          const schoolKey = school.name.toLowerCase().replace(/\s+/g, '');
                          return (
                            <Line
                              key={school._id}
                              type="monotone"
                              dataKey={schoolKey}
                              stroke={getRandomColor(school.name)}
                              strokeWidth={2}
                              name={school.name}
                            />
                          );
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Text fontSize="lg" fontWeight="semibold" mb={4}>
                    Key Metrics
                  </Text>
                  <VStack spacing={4}>
                    <Box w="full" p={3} bg="gray.50" borderRadius="md">
                      <HStack justify="space-between">
                        <Text fontSize="sm" fontWeight="medium">
                          Total Bookings
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="blue.500">
                          {bookings.filter(b => new Date(b.createdAt) >= getDateFromRange(dateRange)).length}
                        </Text>
                      </HStack>
                    </Box>
                    <Box w="full" p={3} bg="gray.50" borderRadius="md">
                      <HStack justify="space-between">
                        <Text fontSize="sm" fontWeight="medium">
                          Total Class Schedules
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="blue.500">
                          {classSchedules.filter(c => new Date(c.createdAt) >= getDateFromRange(dateRange)).length}
                        </Text>
                      </HStack>
                    </Box>
                    <Box w="full" p={3} bg="gray.50" borderRadius="md">
                      <HStack justify="space-between">
                        <Text fontSize="sm" fontWeight="medium">
                          Total Feedback
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="blue.500">
                          {feedback.filter(f => new Date(f.createdAt) >= getDateFromRange(dateRange)).length}
                        </Text>
                      </HStack>
                    </Box>
                    <Box w="full" p={3} bg="gray.50" borderRadius="md">
                      <HStack justify="space-between">
                        <Text fontSize="sm" fontWeight="medium">
                          Total Bug Reports
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="blue.500">
                          {bugReports.filter(b => new Date(b.createdAt) >= getDateFromRange(dateRange)).length}
                        </Text>
                      </HStack>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </Grid>

            <Card mt={6}>
              <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  Activity Comparison
                </Text>
                <Box h="300px">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      {schools.map((school, index) => {
                        const schoolKey = school.name.toLowerCase().replace(/\s+/g, '');
                        return (
                          <Bar
                            key={school._id}
                            dataKey={schoolKey}
                            fill={getRandomColor(school.name)}
                            name={school.name}
                          />
                        );
                      })}
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Academic Performance */}
          <TabPanel px={0}>
            <Card>
              <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  Academic Performance Metrics
                </Text>
                <HStack mb={4} justify="flex-end">
                  <Button
                    size="sm"
                    onClick={() => setSchoolSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                    leftIcon={schoolSortOrder === "asc" ? <span>&uarr;</span> : <span>&darr;</span>}
                    variant="outline"
                  >
                    Sort: {schoolSortOrder === "asc" ? "A-Z" : "Z-A"}
                  </Button>
                </HStack>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>School</Th>
                        <Th>Average Grade</Th>
                        <Th>Attendance Rate</Th>
                        <Th>Assignment Completion</Th>
                        <Th>Performance</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {academicData.sort((a, b) => {
                        if (schoolSortOrder === "asc") {
                          return a.school.localeCompare(b.school);
                        } else {
                          return b.school.localeCompare(a.school);
                        }
                      }).map((school, index) => (
                        <Tr key={index}>
                          <Td fontWeight="medium">{school.school}</Td>
                          <Td>
                            {school.avgGrade > 0 ? `${school.avgGrade}%` : 'N/A'}
                          </Td>
                          <Td>
                            {school.attendance > 0 ? `${school.attendance}%` : 'N/A'}
                          </Td>
                          <Td>
                            {school.assignments > 0 ? `${school.assignments}%` : 'N/A'}
                          </Td>
                          <Td>
                            {school.avgGrade > 0 ? (
                              <Badge
                                colorScheme={
                                  school.avgGrade >= 80 ? "green" :
                                    school.avgGrade >= 60 ? "yellow" : "red"
                                }
                              >
                                {school.avgGrade >= 80 ? "Excellent" :
                                  school.avgGrade >= 60 ? "Good" : "Needs Improvement"}
                              </Badge>
                            ) : (
                              <Badge colorScheme="gray">N/A</Badge>
                            )}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Facility Usage */}
          <TabPanel px={0}>
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
              <Card>
                <CardBody>
                  <Text fontSize="lg" fontWeight="semibold" mb={4}>
                    Facility Usage Distribution
                  </Text>
                  <Box h="300px">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={facilityUsageData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="usage"
                          label={({ name, usage }) => `${name}: ${usage}%`}
                        >
                          {facilityUsageData.map((entry, index) => {

                            return (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            )
                          })}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Text fontSize="lg" fontWeight="semibold" mb={4}>
                    Facility Usage Details
                  </Text>
                  <VStack spacing={4}>
                    {facilityUsageData.map((facility, index) => (
                      <Box key={index} w="full">
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm" fontWeight="medium">
                            {facility.name}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {facility.usage}%
                          </Text>
                        </HStack>
                        <Progress
                          value={facility.usage}
                          colorScheme={facility.usage >= 80 ? "green" : facility.usage >= 60 ? "yellow" : "red"}
                        />
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </Grid>
          </TabPanel>

          {/* Engagement Metrics */}
          <TabPanel px={0}>
            <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
              <Card>
                <CardBody>
                  <Text fontSize="lg" fontWeight="semibold" mb={4}>
                    User Engagement Over Time
                  </Text>
                  <Box h="300px">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={usageData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        {schools.slice(0, 2).map((school, index) => {
                          const schoolKey = school.name.toLowerCase().replace(/\s+/g, '');
                          return (
                            <Line
                              key={school._id}
                              type="monotone"
                              dataKey={schoolKey}
                              stroke={getRandomColor(school.name)}
                              strokeWidth={3}
                              name={school.name}
                            />
                          );
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Text fontSize="lg" fontWeight="semibold" mb={4}>
                    Engagement Levels
                  </Text>
                  <VStack spacing={4}>
                    <Box w="full" p={3} bg="green.50" borderRadius="md" borderLeft="4px" borderColor="green.500">
                      <Text fontSize="sm" fontWeight="medium" color="green.700">
                        High Engagement (50 actions or more)
                      </Text>
                      <Text fontSize="xs" color="green.600">
                        {engagementSummary.high} school{engagementSummary.high !== 1 ? 's' : ''} ({engagementSummary.total > 0 ? Math.round((engagementSummary.high / engagementSummary.total) * 100) : 0}%)
                      </Text>
                    </Box>
                    <Box w="full" p={3} bg="yellow.50" borderRadius="md" borderLeft="4px" borderColor="yellow.500">
                      <Text fontSize="sm" fontWeight="medium" color="yellow.700">
                        Medium Engagement (20-49 actions)
                      </Text>
                      <Text fontSize="xs" color="yellow.600">
                        {engagementSummary.medium} school{engagementSummary.medium !== 1 ? 's' : ''} ({engagementSummary.total > 0 ? Math.round((engagementSummary.medium / engagementSummary.total) * 100) : 0}%)
                      </Text>
                    </Box>
                    <Box w="full" p={3} bg="red.50" borderRadius="md" borderLeft="4px" borderColor="red.500">
                      <Text fontSize="sm" fontWeight="medium" color="red.700">
                        Low Engagement (less than 20 actions)
                      </Text>
                      <Text fontSize="xs" color="red.600">
                        {engagementSummary.low} school{engagementSummary.low !== 1 ? 's' : ''} ({engagementSummary.total > 0 ? Math.round((engagementSummary.low / engagementSummary.total) * 100) : 0}%)
                      </Text>
                    </Box>
                  </VStack>

                  {/* Engagement Details Table */}
                  <Box mt={6}>
                    <Text fontSize="md" fontWeight="semibold" mb={3}>
                      Engagement Details by School
                    </Text>
                    <TableContainer>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>School</Th>
                            <Th>Bookings</Th>
                            <Th>Bus Schedules</Th>
                            <Th>Feedback</Th>
                            <Th>Bug Reports</Th>
                            <Th>Total Actions</Th>
                            <Th>Level</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {calculateEngagementMetrics().map((metric) => (
                            <Tr key={metric.schoolId}>
                              <Td fontWeight="medium">{metric.schoolName}</Td>
                              <Td>{metric.bookings}</Td>
                              <Td>{metric.busSchedules}</Td>
                              <Td>{metric.feedback}</Td>
                              <Td>{metric.bugReports}</Td>
                              <Td fontWeight="bold">{metric.totalActions}</Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    metric.engagementLevel === "High" ? "green" :
                                      metric.engagementLevel === "Medium" ? "yellow" : "red"
                                  }
                                >
                                  {metric.engagementLevel}
                                </Badge>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Box>
                </CardBody>
              </Card>
            </Grid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  )
}
