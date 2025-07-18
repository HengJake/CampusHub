"use client";
import React from "react";
import { useAcademicStore } from "../../store/academic";
import { useEffect } from "react";

import {
  Box,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  Text,
  VStack,
  HStack,
  Progress,
} from "@chakra-ui/react";
import { Building2, Users, TrendingUp, CreditCard } from "lucide-react";

export default function Dashboard() {
  const schools = useAcademicStore((state) => state.schools);
  const students = useAcademicStore((state) => state.students);
  const fetchSchools = useAcademicStore((state) => state.fetchSchools);
  const fetchStudents = useAcademicStore((state) => state.fetchStudents);

  useEffect(() => {
    fetchSchools();
    fetchStudents();
  }, [fetchSchools, fetchStudents]);

  const totalClients = schools.length;
  const totalUsers = students.length;

  return (
    <VStack spacing={4} align="stretch" w={"100%"} pr={10} pl={8}>

      {/* Stats Grid */}
      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
        <Card>
          <CardBody>
            <Stat>
              <HStack justify="space-between" mb={2}>
                <StatLabel color="gray.500">Total Schools</StatLabel>
                <Box p={2} bg="blue.100" borderRadius="md">
                  <Building2 size={20} color="var(--chakra-colors-blue-500)" />
                </Box>
              </HStack>
              <StatNumber fontSize="2xl">{totalClients}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <HStack justify="space-between" mb={2}>
                <StatLabel color="gray.500">Total Users</StatLabel>
                <Box p={2} bg="green.100" borderRadius="md">
                  <Users size={20} color="var(--chakra-colors-green-500)" />
                </Box>
              </HStack>
              <StatNumber fontSize="2xl">{totalUsers}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </Grid>

      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
        {/* Subscription Status Overview */}
        <Card>
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              Subscription Status Overview
            </Text>
            <VStack spacing={4}>
              <Box w="full">
                <HStack justify="space-between" mb={2}>
                  <Text>Premium Plans</Text>
                  <Text color="green.500">8 schools</Text>
                </HStack>
                <Progress value={33} colorScheme="green" />
              </Box>
              <Box w="full">
                <HStack justify="space-between" mb={2}>
                  <Text>Standard Plans</Text>
                  <Text color="blue.500">13 schools</Text>
                </HStack>
                <Progress value={54} colorScheme="blue" />
              </Box>
              <Box w="full">
                <HStack justify="space-between" mb={2}>
                  <Text>Free Plans</Text>
                  <Text color="gray.500">3 schools</Text>
                </HStack>
                <Progress value={13} colorScheme="gray" />
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              Recent Activity
            </Text>
            <VStack spacing={3} align="stretch">
              <Text color="gray.500" align="center">
                No recent activity data available.
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Grid>
    </VStack>
  );
}
