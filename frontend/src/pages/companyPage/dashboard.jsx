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
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Heading,
  Divider,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { Building2, Users, TrendingUp, CreditCard, DollarSign, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function Dashboard() {
  const schools = useAcademicStore((state) => state.schools);
  const students = useAcademicStore((state) => state.students);
  const fetchSchools = useAcademicStore((state) => state.fetchSchools);
  const fetchStudents = useAcademicStore((state) => state.fetchStudents);

  // Billing store functions
  const {
    getAllSubscription,
    getAllPayments,
    getAllInvoices,
    getAllSchools
  } = useBillingStore();

  // State for billing data
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [billingSchools, setBillingSchools] = useState([]);

  const [subscriptionStats, setSubscriptionStats] = useState({
    premium: 0,
    standard: 0,
    basic: 0
  });

  const [billingStats, setBillingStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    successfulPayments: 0,
    failedPayments: 0
  });

  const [isLoading, setIsLoading] = useState({
    subscriptions: false,
    payments: false,
    invoices: false,
    schools: false
  });

  useEffect(() => {
    fetchSchools();
    fetchStudents();
  }, [fetchSchools, fetchStudents]);

  // Fetch all billing data
  useEffect(() => {
    const fetchBillingData = async () => {
      setIsLoading(prev => ({ ...prev, subscriptions: true }));
      try {
        const result = await getAllSubscription();
        if (result.success) {
          setSubscriptions(result.data);

          // Calculate subscription stats
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
        setIsLoading(prev => ({ ...prev, subscriptions: false }));
      }
    };

    fetchBillingData();
  }, [getAllSubscription]);

  useEffect(() => {
    const fetchPaymentsData = async () => {
      setIsLoading(prev => ({ ...prev, payments: true }));
      try {
        const result = await getAllPayments();
        if (result.success) {
          setPayments(result.data);
        }
      } catch (error) {
        console.error("Error fetching payments data:", error);
      } finally {
        setIsLoading(prev => ({ ...prev, payments: false }));
      }
    };

    fetchPaymentsData();
  }, [getAllPayments]);

  useEffect(() => {
    const fetchInvoicesData = async () => {
      setIsLoading(prev => ({ ...prev, invoices: true }));
      try {
        const result = await getAllInvoices();
        if (result.success) {
          setInvoices(result.data);
        }
      } catch (error) {
        console.error("Error fetching invoices data:", error);
      } finally {
        setIsLoading(prev => ({ ...prev, invoices: false }));
      }
    };

    fetchInvoicesData();
  }, [getAllInvoices]);

  useEffect(() => {
    const fetchSchoolsData = async () => {
      setIsLoading(prev => ({ ...prev, schools: true }));
      try {
        const result = await getAllSchools();
        if (result.success) {
          setBillingSchools(result.data);
        }
      } catch (error) {
        console.error("Error fetching schools data:", error);
      } finally {
        setIsLoading(prev => ({ ...prev, schools: false }));
      }
    };

    fetchSchoolsData();
  }, [getAllSchools]);

  // Calculate billing statistics
  useEffect(() => {
    if (subscriptions.length > 0 && payments.length > 0 && invoices.length > 0) {
      const totalRevenue = subscriptions.reduce((sum, sub) => sum + (sub.price || 0), 0);
      const monthlyRevenue = subscriptions
        .filter(sub => sub.billingInterval === 'Monthly')
        .reduce((sum, sub) => sum + (sub.price || 0), 0);
      const yearlyRevenue = subscriptions
        .filter(sub => sub.billingInterval === 'Yearly')
        .reduce((sum, sub) => sum + (sub.price || 0), 0);

      const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;
      const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
      const successfulPayments = payments.filter(pay => pay.status === 'success').length;
      const failedPayments = payments.filter(pay => pay.status === 'failed').length;

      setBillingStats({
        totalRevenue,
        monthlyRevenue,
        yearlyRevenue,
        pendingInvoices,
        overdueInvoices,
        successfulPayments,
        failedPayments
      });
    }
  }, [subscriptions, payments, invoices]);

  const totalClients = schools.length;
  const totalUsers = students.length;
  const totalSubscriptions = subscriptions.length;

  // Calculate percentages for progress bars
  const premiumPercentage = totalSubscriptions > 0 ? (subscriptionStats.premium / totalSubscriptions) * 100 : 0;
  const standardPercentage = totalSubscriptions > 0 ? (subscriptionStats.standard / totalSubscriptions) * 100 : 0;
  const basicPercentage = totalSubscriptions > 0 ? (subscriptionStats.basic / totalSubscriptions) * 100 : 0;

  // Get recent invoices for the table
  const recentInvoices = invoices.slice(0, 5);

  return (
    <VStack spacing={6} align="stretch" w={"100%"}>
      {/* Main Stats Grid */}
      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
        <Card>
          <CardBody
            onClick={() => window.location.href = "/client-management"}
            _hover={{ bg: "gray.50", cursor: "pointer" }}
          >
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
          <CardBody
            onClick={() => window.location.href = "/user-oversight"}
            _hover={{ bg: "gray.50", cursor: "pointer" }}
          >
            <Stat>
              <HStack justify="space-between" mb={2}>
                <StatLabel color="gray.500">Total System Users</StatLabel>
                <Box p={2} bg="green.100" borderRadius="md">
                  <Users size={20} color="var(--chakra-colors-green-500)" />
                </Box>
              </HStack>
              <StatNumber fontSize="2xl">{totalUsers}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody
            onClick={() => window.location.href = "/subscription"}
            _hover={{ bg: "gray.50", cursor: "pointer" }}
          >
            <Stat>
              <HStack justify="space-between" mb={2}>
                <StatLabel color="gray.500">Total Subscriptions</StatLabel>
                <Box p={2} bg="purple.100" borderRadius="md">
                  <CreditCard size={20} color="var(--chakra-colors-purple-500)" />
                </Box>
              </HStack>
              <StatNumber fontSize="2xl">{totalSubscriptions}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody
            onClick={() => window.location.href = "/analytical-report"}
            _hover={{ bg: "gray.50", cursor: "pointer" }}
          >
            <Stat>
              <HStack justify="space-between" mb={2}>
                <StatLabel color="gray.500">Total Revenue</StatLabel>
                <Box p={2} bg="green.100" borderRadius="md">
                  <DollarSign size={20} color="var(--chakra-colors-green-500)" />
                </Box>
              </HStack>
              <StatNumber fontSize="2xl">${billingStats.totalRevenue.toLocaleString()}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </Grid>

      {/* Revenue & Billing Overview */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Revenue & Billing Overview</Heading>
            <VStack spacing={4} align="stretch">
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="medium">Monthly Subscriptions</Text>
                  <Badge colorScheme="blue">${billingStats.monthlyRevenue.toLocaleString()}</Badge>
                </HStack>
                <Progress value={billingStats.monthlyRevenue > 0 ? (billingStats.monthlyRevenue / billingStats.totalRevenue) * 100 : 0} colorScheme="blue" />
              </Box>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="medium">Yearly Subscriptions</Text>
                  <Badge colorScheme="green">${billingStats.yearlyRevenue.toLocaleString()}</Badge>
                </HStack>
                <Progress value={billingStats.yearlyRevenue > 0 ? (billingStats.yearlyRevenue / billingStats.totalRevenue) * 100 : 0} colorScheme="green" />
              </Box>

              <Divider />

              <Grid templateColumns="1fr 1fr" gap={4}>
                <Box textAlign="center">
                  <Text fontSize="sm" color="gray.500">Pending Invoices</Text>
                  <Text fontSize="xl" fontWeight="bold" color="orange.500">
                    {billingStats.pendingInvoices}
                  </Text>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="sm" color="gray.500">Overdue Invoices</Text>
                  <Text fontSize="xl" fontWeight="bold" color="red.500">
                    {billingStats.overdueInvoices}
                  </Text>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="sm" color="gray.500">Successful Payments</Text>
                  <Text fontSize="xl" fontWeight="bold" color="green.500">
                    {billingStats.successfulPayments}
                  </Text>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="sm" color="gray.500">Failed Payments</Text>
                  <Text fontSize="xl" fontWeight="bold" color="red.500">
                    {billingStats.failedPayments}
                  </Text>
                </Box>
              </Grid>
            </VStack>
          </CardBody>
        </Card>

        {/* Subscription Plan Distribution */}
        <Card>
          <CardBody
            onClick={() => window.location.href = "/subscription"}
            _hover={{ bg: "gray.50", cursor: "pointer" }}
          >
            <Heading size="md" mb={4}>Subscription Plans</Heading>
            {isLoading.subscriptions ? (
              <Text color="gray.500" textAlign="center">Loading...</Text>
            ) : totalSubscriptions === 0 ? (
              <Text color="gray.500" textAlign="center">No subscriptions</Text>
            ) : (
              <VStack spacing={4}>
                <Box w="full">
                  <HStack justify="space-between" mb={2}>
                    <HStack>
                      <Text>Premium</Text>
                      <Badge colorScheme="green">{premiumPercentage.toFixed(1)}%</Badge>
                    </HStack>
                    <Text color={subscriptionStats.premium > 0 ? "green.500" : "gray.400"}>
                      {subscriptionStats.premium}
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
                    <HStack>
                      <Text>Standard</Text>
                      <Badge colorScheme="blue">{standardPercentage.toFixed(1)}%</Badge>
                    </HStack>
                    <Text color={subscriptionStats.standard > 0 ? "blue.500" : "gray.400"}>
                      {subscriptionStats.standard}
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
                    <HStack>
                      <Text>Basic</Text>
                      <Badge colorScheme="gray">{basicPercentage.toFixed(1)}%</Badge>
                    </HStack>
                    <Text color={subscriptionStats.basic > 0 ? "gray.500" : "gray.400"}>
                      {subscriptionStats.basic}
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
      </Grid>

      {/* Recent Invoices Table */}
      <Card>
        <CardBody>
          <Heading size="md" mb={4}>Recent Invoices</Heading>
          {isLoading.invoices ? (
            <Text color="gray.500" textAlign="center">Loading invoices...</Text>
          ) : recentInvoices.length === 0 ? (
            <Text color="gray.500" textAlign="center">No invoices available</Text>
          ) : (
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>School</Th>
                    <Th>Amount</Th>
                    <Th>Status</Th>
                    <Th>Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {recentInvoices.map((invoice) => {
                    return (
                      <Tr key={invoice._id}>
                        <Td>
                          {billingSchools.find(school => school._id === invoice.schoolId?._id)?.name || 'Unknown School'}
                        </Td>
                        <Td>${invoice.amount?.toLocaleString() || '0'}</Td>
                        <Td>
                          <Badge
                            colorScheme={
                              invoice.status === 'paid' ? 'green' :
                                invoice.status === 'overdue' ? 'red' : 'yellow'
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </Td>
                        <Td>{new Date(invoice.date).toLocaleDateString()}</Td>
                      </Tr>
                    )
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </CardBody>
      </Card>
    </VStack>
  );
}
