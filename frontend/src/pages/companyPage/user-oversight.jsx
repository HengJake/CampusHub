// Programmer Name : Choy Chi Lam, Frontend Developer
// Program Name: user-oversight.jsx
// Description: User oversight panel for company administrators to monitor user activities, manage permissions, and oversee system access
// First Written on: July 14, 2024
// Edited on: Friday, August 8, 2024

"use client";

import React, { useEffect } from "react";

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
import { useAcademicStore } from "../../store/academic";

export default function UserOversight() {
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [sortBy, setSortBy] = useState("totalUsers");
  const [sortOrder, setSortOrder] = useState("az"); // 'az' for A-Z, 'za' for Z-A

  // Get schools and students from the store
  const schools = useAcademicStore((state) => state.schools);
  const students = useAcademicStore((state) => state.students);
  const loadingSchools = useAcademicStore((state) => state.loading.schools);
  const fetchSchools = useAcademicStore((state) => state.fetchSchools);
  const fetchStudents = useAcademicStore((state) => state.fetchStudents);

  useEffect(() => {
    fetchSchools();
    fetchStudents();
  }, []);

  // Helper: count students per school
  const getStudentCount = (schoolId) =>
    students.filter((student) => student.schoolId === schoolId).length;

  // Calculate overall stats
  const totalStats = {
    totalUsers: students.length,
    totalStudents: students.length,
    totalTeachers: schools.reduce((sum, s) => sum + (s.teachers || 0), 0),
    avgGrowthRate:
      schools.length > 0
        ? schools.reduce((sum, s) => sum + (s.growthRate || 0), 0) /
        schools.length
        : 0,
  };

  // Filter and sort data
  const filteredData = schools
    .filter((school) =>
      selectedSchool === "all" ? true : school.id?.toString() === selectedSchool
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "totalUsers":
          return (b.totalUsers || 0) - (a.totalUsers || 0);
        case "growthRate":
          return (b.growthRate || 0) - (a.growthRate || 0);
        case "activeUsers":
          return (b.activeUsers || 0) - (a.activeUsers || 0);
        case "schoolName":
          return (a.schoolName || "").localeCompare(b.schoolName || "");
        default:
          return 0;
      }
    });

  // Filter and sort data
  const sortedSchools = [...schools].sort((a, b) => {
    if (sortOrder === "az") {
      return (a.name || "").localeCompare(b.name || "");
    } else {
      return (b.name || "").localeCompare(a.name || "");
    }
  });

  const handleDownloadStats = () => {
    // Mock download functionality
    console.log("Downloading user statistics...");
  };

  if (loadingSchools) {
    return <div>Loading schools...</div>;
  }

  return (
    <VStack spacing={4} align="stretch" pl={2} h={"100%"}>
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
                {schools
                  .filter(
                    (school) =>
                      school && school.id !== undefined && school.id !== null
                  )
                  .map((school) => (
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
            <Box>
              <Text fontSize="sm" mb={2}>
                Sort Order:
              </Text>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                w="120px"
                size="md"
              >
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
              </Select>
            </Box>
          </HStack>
        </CardBody>
      </Card>

      {/* User Distribution by School - Add sort dropdown */}
      <Card>
        <CardBody>
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="lg" fontWeight="semibold">
              User Distribution by School
            </Text>
          </Flex>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>School Name</Th>
                  <Th>Total Users</Th>
                  <Th>Active Users</Th>
                  <Th>Last Activity</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sortedSchools.map((school) => (
                  <Tr key={school._id}>
                    <Td>
                      <Text fontWeight="medium">{school.name}</Text>
                    </Td>
                    {/* Total Users = number of students */}
                    <Td>{getStudentCount(school._id)}</Td>
                    <Td>{school.activeUsers}</Td>
                    <Td>{school.lastActive}</Td>
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
              {schools
                .sort((a, b) => (b.growthRate || 0) - (a.growthRate || 0))
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
                      schools.filter(
                        (s) => (s.activeUsers || 0) / (s.totalUsers || 0) >= 0.8
                      ).length
                    }{" "}
                    schools
                  </Text>
                </HStack>
                <Progress
                  value={
                    (schools.filter(
                      (s) => (s.activeUsers || 0) / (s.totalUsers || 0) >= 0.8
                    ).length /
                      schools.length) *
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
                      schools.filter(
                        (s) =>
                          (s.activeUsers || 0) / (s.totalUsers || 0) >= 0.6 &&
                          (s.activeUsers || 0) / (s.totalUsers || 0) < 0.8
                      ).length
                    }{" "}
                    schools
                  </Text>
                </HStack>
                <Progress
                  value={
                    (schools.filter(
                      (s) =>
                        (s.activeUsers || 0) / (s.totalUsers || 0) >= 0.6 &&
                        (s.activeUsers || 0) / (s.totalUsers || 0) < 0.8
                    ).length /
                      schools.length) *
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
                      schools.filter(
                        (s) => (s.activeUsers || 0) / (s.totalUsers || 0) < 0.6
                      ).length
                    }{" "}
                    schools
                  </Text>
                </HStack>
                <Progress
                  value={
                    (schools.filter(
                      (s) => (s.activeUsers || 0) / (s.totalUsers || 0) < 0.6
                    ).length /
                      schools.length) *
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
