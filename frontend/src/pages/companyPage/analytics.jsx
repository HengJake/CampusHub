"use client"

import React from "react";

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

const usageData = [
  { month: "Jan", lincoln: 4000, roosevelt: 2400, washington: 3200, jefferson: 1800 },
  { month: "Feb", lincoln: 4200, roosevelt: 2600, washington: 3400, jefferson: 2000 },
  { month: "Mar", lincoln: 4500, roosevelt: 2800, washington: 3600, jefferson: 2200 },
  { month: "Apr", lincoln: 4800, roosevelt: 3000, washington: 3800, jefferson: 2400 },
  { month: "May", lincoln: 5100, roosevelt: 3200, washington: 4000, jefferson: 2600 },
  { month: "Jun", lincoln: 5400, roosevelt: 3400, washington: 4200, jefferson: 2800 },
]

const facilityUsageData = [
  { name: "Library", usage: 85, color: "#3182CE" },
  { name: "Computer Lab", usage: 72, color: "#38A169" },
  { name: "Gymnasium", usage: 68, color: "#D69E2E" },
  { name: "Auditorium", usage: 45, color: "#E53E3E" },
  { name: "Science Lab", usage: 78, color: "#805AD5" },
]

const academicData = [
  { school: "Lincoln High School", avgGrade: 87.5, attendance: 94.2, assignments: 89.1 },
  { school: "Roosevelt Elementary", avgGrade: 91.2, attendance: 96.8, assignments: 92.4 },
  { school: "Washington Middle", avgGrade: 84.7, attendance: 91.5, assignments: 86.3 },
  { school: "Jefferson Academy", avgGrade: 89.3, attendance: 95.1, assignments: 90.7 },
]

const engagementData = [
  { name: "Daily Active Users", value: 2847 },
  { name: "Weekly Active Users", value: 4521 },
  { name: "Monthly Active Users", value: 6234 },
  { name: "Session Duration (avg)", value: "24 min" },
]

const COLORS = ["#3182CE", "#38A169", "#D69E2E", "#E53E3E", "#805AD5"]

export default function Analytics() {
  const [selectedSchool, setSelectedSchool] = useState("all")
  const [dateRange, setDateRange] = useState("6months")

  const handleExportReport = (format) => {
    console.log(`Exporting report in ${format} format...`)
  }

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
                <option value="lincoln">Lincoln High School</option>
                <option value="roosevelt">Roosevelt Elementary</option>
                <option value="washington">Washington Middle</option>
                <option value="jefferson">Jefferson Academy</option>
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
                        <Line type="monotone" dataKey="lincoln" stroke="#3182CE" strokeWidth={2} />
                        <Line type="monotone" dataKey="roosevelt" stroke="#38A169" strokeWidth={2} />
                        <Line type="monotone" dataKey="washington" stroke="#D69E2E" strokeWidth={2} />
                        <Line type="monotone" dataKey="jefferson" stroke="#E53E3E" strokeWidth={2} />
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
                    {engagementData.map((metric, index) => (
                      <Box key={index} w="full" p={3} bg="gray.50" borderRadius="md">
                        <HStack justify="space-between">
                          <Text fontSize="sm" fontWeight="medium">
                            {metric.name}
                          </Text>
                          <Text fontSize="lg" fontWeight="bold" color="blue.500">
                            {typeof metric.value === "number" ? metric.value.toLocaleString() : metric.value}
                          </Text>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </Grid>

            <Card mt={6}>
              <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                  Login Activity Comparison
                </Text>
                <Box h="300px">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="lincoln" fill="#3182CE" />
                      <Bar dataKey="roosevelt" fill="#38A169" />
                      <Bar dataKey="washington" fill="#D69E2E" />
                      <Bar dataKey="jefferson" fill="#E53E3E" />
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
                      {academicData.map((school, index) => (
                        <Tr key={index}>
                          <Td fontWeight="medium">{school.school}</Td>
                          <Td>
                            <HStack>
                              <Text>{school.avgGrade}%</Text>
                              <Progress value={school.avgGrade} size="sm" colorScheme="blue" w="60px" />
                            </HStack>
                          </Td>
                          <Td>
                            <HStack>
                              <Text>{school.attendance}%</Text>
                              <Progress value={school.attendance} size="sm" colorScheme="green" w="60px" />
                            </HStack>
                          </Td>
                          <Td>
                            <HStack>
                              <Text>{school.assignments}%</Text>
                              <Progress value={school.assignments} size="sm" colorScheme="purple" w="60px" />
                            </HStack>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={school.avgGrade >= 90 ? "green" : school.avgGrade >= 80 ? "yellow" : "red"}
                            >
                              {school.avgGrade >= 90
                                ? "Excellent"
                                : school.avgGrade >= 80
                                  ? "Good"
                                  : "Needs Improvement"}
                            </Badge>
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
                          {facilityUsageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
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
                        <Line type="monotone" dataKey="lincoln" stroke="#3182CE" strokeWidth={3} name="Lincoln HS" />
                        <Line
                          type="monotone"
                          dataKey="roosevelt"
                          stroke="#38A169"
                          strokeWidth={3}
                          name="Roosevelt Elem"
                        />
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
                        High Engagement
                      </Text>
                      <Text fontSize="xs" color="green.600">
                        2 schools (50%)
                      </Text>
                    </Box>
                    <Box w="full" p={3} bg="yellow.50" borderRadius="md" borderLeft="4px" borderColor="yellow.500">
                      <Text fontSize="sm" fontWeight="medium" color="yellow.700">
                        Medium Engagement
                      </Text>
                      <Text fontSize="xs" color="yellow.600">
                        1 school (25%)
                      </Text>
                    </Box>
                    <Box w="full" p={3} bg="red.50" borderRadius="md" borderLeft="4px" borderColor="red.500">
                      <Text fontSize="sm" fontWeight="medium" color="red.700">
                        Low Engagement
                      </Text>
                      <Text fontSize="xs" color="red.600">
                        1 school (25%)
                      </Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </Grid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  )
}
