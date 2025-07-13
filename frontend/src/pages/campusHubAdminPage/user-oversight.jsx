"use client";

import React from "react";

import {
  Box,
  Grid,
  Card,
  CardBody,
  Text,
  VStack,
  HStack,
  Progress,
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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import { useState } from "react";
import { Download, TrendingUp, Users, GraduationCap } from "lucide-react";

const mockUserData = [
  {
    id: 1,
    schoolName: "Lincoln High School",
    totalUsers: 1335,
    students: 1250,
    teachers: 65,
    staff: 20,
    activeUsers: 1180,
    growthRate: 8.5,
    lastActive: "2 hours ago",
  },
  {
    id: 2,
    schoolName: "Roosevelt Elementary",
    totalUsers: 695,
    students: 650,
    teachers: 35,
    staff: 10,
    activeUsers: 620,
    growthRate: 12.3,
    lastActive: "1 hour ago",
  },
  {
    id: 3,
    schoolName: "Washington Middle School",
    totalUsers: 952,
    students: 890,
    teachers: 52,
    staff: 10,
    activeUsers: 845,
    growthRate: -2.1,
    lastActive: "30 minutes ago",
  },
  {
    id: 4,
    schoolName: "Jefferson Academy",
    totalUsers: 445,
    students: 420,
    teachers: 20,
    staff: 5,
    activeUsers: 398,
    growthRate: 15.7,
    lastActive: "5 minutes ago",
  },
];

export default function UserOversight() {
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [sortBy, setSortBy] = useState("totalUsers");

  const totalStats = {
    totalUsers: mockUserData.reduce(
      (sum, school) => sum + school.totalUsers,
      0
    ),
    totalStudents: mockUserData.reduce(
      (sum, school) => sum + school.students,
      0
    ),
    totalTeachers: mockUserData.reduce(
      (sum, school) => sum + school.teachers,
      0
    ),
    totalStaff: mockUserData.reduce((sum, school) => sum + school.staff, 0),
    avgGrowthRate:
      mockUserData.reduce((sum, school) => sum + school.growthRate, 0) /
      mockUserData.length,
  };

  const filteredData =
    selectedSchool === "all"
      ? mockUserData
      : mockUserData.filter(
          (school) => school.id.toString() === selectedSchool
        );

  const handleDownloadStats = () => {
    // Mock download functionality
    console.log("Downloading user statistics...");
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Flex>
        <Box>
          <Text fontSize="2xl" fontWeight="bold">
            User Oversight
          </Text>
          <Text color="gray.600">
            Monitor user distribution and engagement across clients
          </Text>
        </Box>
        <Spacer />
        <Button
          leftIcon={<Download />}
          colorScheme="blue"
          onClick={handleDownloadStats}
        >
          Download Stats
        </Button>
      </Flex>

      {/* Overall Stats */}
      <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
        <Card>
          <CardBody>
            <Stat>
              <HStack justify="space-between" mb={2}>
                <StatLabel>Total Users</StatLabel>
                <Users size={20} color="var(--chakra-colors-blue-500)" />
              </HStack>
              <StatNumber>{totalStats.totalUsers.toLocaleString()}</StatNumber>
              <StatHelpText>Across all schools</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <HStack justify="space-between" mb={2}>
                <StatLabel>Students</StatLabel>
                <GraduationCap
                  size={20}
                  color="var(--chakra-colors-green-500)"
                />
              </HStack>
              <StatNumber>
                {totalStats.totalStudents.toLocaleString()}
              </StatNumber>
              <StatHelpText>Active students</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <HStack justify="space-between" mb={2}>
                <StatLabel>Teachers</StatLabel>
                <Users size={20} color="var(--chakra-colors-purple-500)" />
              </HStack>
              <StatNumber>{totalStats.totalTeachers}</StatNumber>
              <StatHelpText>Teaching staff</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <HStack justify="space-between" mb={2}>
                <StatLabel>Avg Growth</StatLabel>
                <TrendingUp size={20} color="var(--chakra-colors-orange-500)" />
              </HStack>
              <StatNumber>{totalStats.avgGrowthRate.toFixed(1)}%</StatNumber>
              <StatHelpText>Monthly growth rate</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </Grid>

      {/* Filters */}
      <Card>
        <CardBody>
          <HStack spacing={4}>
            <Box>
              <Text fontSize="sm" mb={2}>
                Filter by School:
              </Text>
              <Select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
              >
                <option value="all">All Schools</option>
                {mockUserData.map((school) => (
                  <option key={school.id} value={school.id.toString()}>
                    {school.schoolName}
                  </option>
                ))}
              </Select>
            </Box>
            <Box>
              <Text fontSize="sm" mb={2}>
                Sort by:
              </Text>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="totalUsers">Total Users</option>
                <option value="growthRate">Growth Rate</option>
                <option value="activeUsers">Active Users</option>
                <option value="schoolName">School Name</option>
              </Select>
            </Box>
          </HStack>
        </CardBody>
      </Card>

      {/* User Distribution Table */}
      <Card>
        <CardBody>
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            User Distribution by School
          </Text>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>School Name</Th>
                  <Th>Total Users</Th>
                  <Th>Role Breakdown</Th>
                  <Th>Active Users</Th>
                  <Th>Growth Rate</Th>
                  <Th>Last Activity</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredData.map((school) => (
                  <Tr key={school.id}>
                    <Td>
                      <Text fontWeight="medium">{school.schoolName}</Text>
                    </Td>
                    <Td>
                      <Text fontSize="lg" fontWeight="semibold">
                        {school.totalUsers.toLocaleString()}
                      </Text>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Badge colorScheme="blue" size="sm">
                            Students: {school.students}
                          </Badge>
                        </HStack>
                        <HStack>
                          <Badge colorScheme="green" size="sm">
                            Teachers: {school.teachers}
                          </Badge>
                          <Badge colorScheme="purple" size="sm">
                            Staff: {school.staff}
                          </Badge>
                        </HStack>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={2}>
                        <Text>{school.activeUsers.toLocaleString()}</Text>
                        <Progress
                          value={(school.activeUsers / school.totalUsers) * 100}
                          size="sm"
                          colorScheme="green"
                          w="100px"
                        />
                      </VStack>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={school.growthRate > 0 ? "green" : "red"}
                        variant="subtle"
                      >
                        {school.growthRate > 0 ? "+" : ""}
                        {school.growthRate}%
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm" color="gray.600">
                        {school.lastActive}
                      </Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      {/* User Growth Over Time */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
        <Card>
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              Top Performing Schools
            </Text>
            <VStack spacing={3}>
              {mockUserData
                .sort((a, b) => b.growthRate - a.growthRate)
                .slice(0, 3)
                .map((school, index) => (
                  <Box
                    key={school.id}
                    w="full"
                    p={3}
                    bg="gray.50"
                    borderRadius="md"
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium" fontSize="sm">
                          #{index + 1} {school.schoolName}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {school.totalUsers} total users
                        </Text>
                      </VStack>
                      <Badge colorScheme="green">+{school.growthRate}%</Badge>
                    </HStack>
                  </Box>
                ))}
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              User Engagement Summary
            </Text>
            <VStack spacing={4}>
              <Box w="full">
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm">High Engagement (80%+)</Text>
                  <Text fontSize="sm" color="green.500">
                    {
                      mockUserData.filter(
                        (s) => s.activeUsers / s.totalUsers >= 0.8
                      ).length
                    }{" "}
                    schools
                  </Text>
                </HStack>
                <Progress
                  value={
                    (mockUserData.filter(
                      (s) => s.activeUsers / s.totalUsers >= 0.8
                    ).length /
                      mockUserData.length) *
                    100
                  }
                  colorScheme="green"
                />
              </Box>
              <Box w="full">
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm">Medium Engagement (60-79%)</Text>
                  <Text fontSize="sm" color="yellow.500">
                    {
                      mockUserData.filter(
                        (s) =>
                          s.activeUsers / s.totalUsers >= 0.6 &&
                          s.activeUsers / s.totalUsers < 0.8
                      ).length
                    }{" "}
                    schools
                  </Text>
                </HStack>
                <Progress
                  value={
                    (mockUserData.filter(
                      (s) =>
                        s.activeUsers / s.totalUsers >= 0.6 &&
                        s.activeUsers / s.totalUsers < 0.8
                    ).length /
                      mockUserData.length) *
                    100
                  }
                  colorScheme="yellow"
                />
              </Box>
              <Box w="full">
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm">Low Engagement ({"<"}60%)</Text>
                  <Text fontSize="sm" color="red.500">
                    {
                      mockUserData.filter(
                        (s) => s.activeUsers / s.totalUsers < 0.6
                      ).length
                    }{" "}
                    schools
                  </Text>
                </HStack>
                <Progress
                  value={
                    (mockUserData.filter(
                      (s) => s.activeUsers / s.totalUsers < 0.6
                    ).length /
                      mockUserData.length) *
                    100
                  }
                  colorScheme="red"
                />
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Grid>
    </VStack>
  );
}
