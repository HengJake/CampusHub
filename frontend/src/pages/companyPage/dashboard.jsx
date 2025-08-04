"use client";
import React from "react";
import { useAcademicStore } from "../../store/academic";
import { useBillingStore } from "../../store/billing";
import { useEffect, useState } from "react";

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
  
  // Subscription related state and functions
  const { getAllSubscription } = useBillingStore();
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionStats, setSubscriptionStats] = useState({
    premium: 0,
    standard: 0,
    basic: 0
  });
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);

  useEffect(() => {
    fetchSchools();
    fetchStudents();
  }, [fetchSchools, fetchStudents]);

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      setIsLoadingSubscriptions(true);
      try {
        const result = await getAllSubscription();
        if (result.success) {
          setSubscriptions(result.data);
          
          // Calculate stats by plan type
          const stats = result.data.reduce((acc, sub) => {
            const planType = sub.plan.toLowerCase();
            acc[planType] = (acc[planType] || 0) + 1;
            return acc;
          }, {});
          setSubscriptionStats(stats);
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error);
      } finally {
        setIsLoadingSubscriptions(false);
      }
    };
    
    fetchSubscriptionData();
  }, [getAllSubscription]);

  const totalClients = schools.length;
  const totalUsers = students.length;
  const totalSubscriptions = subscriptions.length;

  // Calculate percentages for progress bars
  const premiumPercentage = totalSubscriptions > 0 ? (subscriptionStats.premium / totalSubscriptions) * 100 : 0;
  const standardPercentage = totalSubscriptions > 0 ? (subscriptionStats.standard / totalSubscriptions) * 100 : 0;
  const basicPercentage = totalSubscriptions > 0 ? (subscriptionStats.basic / totalSubscriptions) * 100 : 0;

  return (
    <VStack spacing={4} align="stretch" w={"100%"}>

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
        <Card>
          <CardBody>
            <Stat>
              <HStack justify="space-between" mb={2}>
                <StatLabel color="gray.500">Active Subscriptions</StatLabel>
                <Box p={2} bg="purple.100" borderRadius="md">
                  <CreditCard size={20} color="var(--chakra-colors-purple-500)" />
                </Box>
              </HStack>
              <StatNumber fontSize="2xl">{totalSubscriptions}</StatNumber>
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
            {isLoadingSubscriptions ? (
              <Text color="gray.500" textAlign="center">
                Loading subscription data...
              </Text>
            ) : totalSubscriptions === 0 ? (
              <Text color="gray.500" textAlign="center">
                No subscription data available.
              </Text>
            ) : (
              <VStack spacing={4}>
                <Box w="full">
                  <HStack justify="space-between" mb={2}>
                    <Text>Premium Plans</Text>
                    <Text color={subscriptionStats.premium > 0 ? "green.500" : "gray.400"}>
                      {subscriptionStats.premium} schools
                    </Text>
                  </HStack>
                  {subscriptionStats.premium > 0 ? (
                    <Progress value={premiumPercentage} colorScheme="green" />
                  ) : (
                    <Box h="8px" bg="gray.100" borderRadius="md" />
                  )}
                </Box>
                <Box w="full">
                  <HStack justify="space-between" mb={2}>
                    <Text>Standard Plans</Text>
                    <Text color={subscriptionStats.standard > 0 ? "blue.500" : "gray.400"}>
                      {subscriptionStats.standard} schools
                    </Text>
                  </HStack>
                  {subscriptionStats.standard > 0 ? (
                    <Progress value={standardPercentage} colorScheme="blue" />
                  ) : (
                    <Box h="8px" bg="gray.100" borderRadius="md" />
                  )}
                </Box>
                <Box w="full">
                  <HStack justify="space-between" mb={2}>
                    <Text>Basic Plans</Text>
                    <Text color={subscriptionStats.basic > 0 ? "gray.500" : "gray.400"}>
                      {subscriptionStats.basic} schools
                    </Text>
                  </HStack>
                  {subscriptionStats.basic > 0 ? (
                    <Progress value={basicPercentage} colorScheme="gray" />
                  ) : (
                    <Box h="8px" bg="gray.100" borderRadius="md" />
                  )}
                </Box>
              </VStack>
            )}
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
