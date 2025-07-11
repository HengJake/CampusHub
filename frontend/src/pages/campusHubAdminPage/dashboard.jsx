"use client";
import React from "react";

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

const stats = [
  {
    label: "Total Clients",
    value: "24",
    change: 12,
    icon: Building2,
    color: "blue",
  },
  {
    label: "Active Users",
    value: "12,847",
    change: 8.2,
    icon: Users,
    color: "green",
  },
  {
    label: "Revenue",
    value: "$45,230",
    change: 15.3,
    icon: TrendingUp,
    color: "purple",
  },
  {
    label: "Active Subscriptions",
    value: "21",
    change: -2.1,
    icon: CreditCard,
    color: "orange",
  },
];

const recentActivity = [
  {
    school: "Lincoln High School",
    action: "New subscription activated",
    time: "2 hours ago",
  },
  {
    school: "Roosevelt Elementary",
    action: "User limit increased",
    time: "4 hours ago",
  },
  {
    school: "Washington Middle",
    action: "Payment received",
    time: "6 hours ago",
  },
  {
    school: "Jefferson Academy",
    action: "Sub-admin assigned",
    time: "1 day ago",
  },
];

export default function Dashboard() {
  return (
    <VStack spacing={6} align="stretch" w={"100%"} p={10}>

      {/* Stats Grid */}
      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardBody>
              <Stat>
                <HStack justify="space-between" mb={2}>
                  <StatLabel color="gray.500">{stat.label}</StatLabel>
                  <Box p={2} bg={`${stat.color}.100`} borderRadius="md">
                    <stat.icon
                      size={20}
                      color={`var(--chakra-colors-${stat.color}-500)`}
                    />
                  </Box>
                </HStack>
                <StatNumber fontSize="2xl">{stat.value}</StatNumber>
                <StatHelpText>
                  <StatArrow type={stat.change > 0 ? "increase" : "decrease"} />
                  {Math.abs(stat.change)}% from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        ))}
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
              {recentActivity.map((activity, index) => (
                <Box key={index} p={3} bg="gray.50" borderRadius="md">
                  <Text fontWeight="medium" fontSize="sm">
                    {activity.school}
                  </Text>
                  <Text fontSize="xs" color="gray.600" mb={1}>
                    {activity.action}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {activity.time}
                  </Text>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </Grid>
    </VStack>
  );
}
