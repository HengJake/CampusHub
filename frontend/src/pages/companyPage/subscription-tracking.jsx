// Programmer Name : Choy Chi Lam, Frontend Developer
// Program Name: subscription-tracking.jsx
// Description: Subscription management interface for tracking client subscriptions, billing status, and subscription lifecycle management
// First Written on: July 18, 2024
// Edited on: Friday, August 4, 2024

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
  Badge,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Spacer,
  Select,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
} from "lucide-react";
import { useAcademicStore } from "../../store/academic";
import { useBillingStore } from "../../store/billing";
import { useEffect } from "react";

export default function SubscriptionTracking() {
  // All hooks at the top!
  const { schools, loading, errors, fetchSchools } = useAcademicStore();
  const { getAllSubscription, createPayment, createInvoice } = useBillingStore();

  // State for subscriptions and payments
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [userCounts, setUserCounts] = useState({});
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  // Fetch subscriptions and payments after schools are loaded
  useEffect(() => {
    if (schools.length > 0) {
      fetchSubscriptions();
      fetchPayments();
      fetchUserCounts();
    }
  }, [schools]);

  const fetchSubscriptions = async () => {
    setLoadingSubscriptions(true);
    try {
      const result = await getAllSubscription();
      if (result.success) {
        setSubscriptions(result.data);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      // Fetch payments for all schools
      const paymentPromises = schools.map(school =>
        fetch(`/api/payment/school/${school._id}`)
          .then(res => res.json())
          .catch(error => {
            console.error(`Error fetching payments for school ${school._id}:`, error);
            return { data: [] };
          })
      );
      const paymentResults = await Promise.all(paymentPromises);
      const allPayments = paymentResults.flatMap(result => result.data || []);
      setPayments(allPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchUserCounts = async () => {
    try {
      // Fetch user counts for each school
      const userCountPromises = schools.map(school =>
        fetch(`/api/student/school/${school._id}`)
          .then(res => res.json())
          .catch(error => {
            console.error(`Error fetching students for school ${school._id}:`, error);
            return { data: [] };
          })
          .then(studentResult => {
            const studentCount = studentResult.data?.length || 0;
            return fetch(`/api/lecturer/school/${school._id}`)
              .then(res => res.json())
              .catch(error => {
                console.error(`Error fetching lecturers for school ${school._id}:`, error);
                return { data: [] };
              })
              .then(lecturerResult => {
                const lecturerCount = lecturerResult.data?.length || 0;
                return {
                  schoolId: school._id,
                  studentCount,
                  lecturerCount,
                  totalUsers: studentCount + lecturerCount
                };
              });
          })
      );
      const userCountResults = await Promise.all(userCountPromises);
      const userCountsMap = {};
      userCountResults.forEach(count => {
        userCountsMap[count.schoolId] = count;
      });
      setUserCounts(userCountsMap);
    } catch (error) {
      console.error("Error fetching user counts:", error);
      setUserCounts({});
    }
  };

  const [selectedSchool, setSelectedSchool] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [sortOrder, setSortOrder] = useState("az"); // 'az' for A-Z, 'za' for Z-A

  // Only after all hooks, do your conditional returns:
  if (loading.schools || loadingSubscriptions || loadingPayments) {
    return <Text>Loading subscription data...</Text>;
  }
  if (errors.schools) {
    return <Alert status="error">{errors.schools}</Alert>;
  }

  // Create subscription data by combining schools, subscriptions, and user counts
  const subscriptionData = schools.map((school) => {
    const subscription = subscriptions.find(sub => sub.schoolId === school._id);
    const userCount = userCounts[school._id]?.totalUsers || 0;

    // Calculate days until renewal and renewal date (mock data for now)
    const daysUntilRenewal = subscription ? Math.floor(Math.random() * 365) : null;
    const renewalDate = subscription && daysUntilRenewal !== null
      ? new Date(Date.now() + daysUntilRenewal * 24 * 60 * 60 * 1000)
      : null;

    return {
      id: school._id,
      schoolName: school.name,
      plan: subscription?.plan || "Basic",
      status: subscription ? "Active" : "Inactive",
      renewalDate: renewalDate ? renewalDate.toLocaleDateString() : "N/A",
      monthlyFee: subscription?.price || 0,
      users: userCount,
      daysUntilRenewal: daysUntilRenewal,
      paymentMethod: "Credit Card", // Mock data
      lastPayment: "2024-01-15", // Mock data
    };
  });

  const filteredSubscriptions = subscriptionData.filter((sub) => {
    const schoolMatch =
      selectedSchool === "all" || sub.id.toString() === selectedSchool;
    const statusMatch =
      selectedStatus === "all" || sub.status.toLowerCase() === selectedStatus;
    return schoolMatch && statusMatch;
  });

  const expiringSubscriptions = subscriptionData.filter(
    (sub) =>
      sub.daysUntilRenewal !== null &&
      sub.daysUntilRenewal <= 30 &&
      sub.daysUntilRenewal > 0
  );

  const expiredSubscriptions = subscriptionData.filter(
    (sub) => sub.status === "Expired"
  );

  const totalRevenue = subscriptionData
    .filter((sub) => sub.status === "Active")
    .reduce((sum, sub) => sum + sub.monthlyFee, 0);

  const handleViewDetails = (subscription) => {
    setSelectedSubscription(subscription);
    onOpen();
  };

  const handleToggleAccess = (subscriptionId, currentStatus) => {
    console.log(
      `Toggling access for subscription ${subscriptionId}. Current status: ${currentStatus}`
    );
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "green";
      case "expired":
        return "red";
      case "pending":
        return "yellow";
      default:
        return "gray";
    }
  };

  const getPlanColor = (plan) => {
    switch (plan.toLowerCase()) {
      case "premium":
        return "purple";
      case "standard":
        return "blue";
      case "basic":
        return "gray";
      default:
        return "gray";
    }
  };

  // Sort filteredSubscriptions by school name according to sortOrder
  const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
    if (sortOrder === "az") {
      return (a.schoolName || "").localeCompare(b.schoolName || "");
    } else {
      return (b.schoolName || "").localeCompare(a.schoolName || "");
    }
  });

  return (
    <VStack spacing={4} align="stretch">
      {/* Header */}
      <Flex>
        <Box>
          <Text fontSize="2xl" fontWeight="bold">
            Subscription Tracking
          </Text>
          <Text color="gray.600">
            Manage and monitor client billing and subscription status
          </Text>
        </Box>
        <Spacer />
        <HStack>
          <Text fontSize="lg" fontWeight="semibold" color="green.500">
            Monthly Revenue: ${totalRevenue.toLocaleString()}
          </Text>
        </HStack>
      </Flex>

      {/* Alerts */}
      {expiringSubscriptions.length > 0 && (
        <Alert status="warning">
          <AlertIcon />
          <Box>
            <AlertTitle>Subscriptions Expiring Soon!</AlertTitle>
            <AlertDescription>
              {expiringSubscriptions.length} subscription(s) will expire within
              30 days.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {expiredSubscriptions.length > 0 && (
        <Alert status="error">
          <AlertIcon />
          <Box>
            <AlertTitle>Expired Subscriptions!</AlertTitle>
            <AlertDescription>
              {expiredSubscriptions.length} subscription(s) have expired and
              need attention.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
        <Card>
          <CardBody>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="gray.500">
                Active Subscriptions
              </Text>
              <CheckCircle size={20} color="var(--chakra-colors-green-500)" />
            </HStack>
            <Text fontSize="2xl" fontWeight="bold">
              {subscriptionData.filter((s) => s.status === "Active").length}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Out of {subscriptionData.length} total
            </Text>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="gray.500">
                Expiring Soon
              </Text>
              <Clock size={20} color="var(--chakra-colors-yellow-500)" />
            </HStack>
            <Text fontSize="2xl" fontWeight="bold" color="yellow.500">
              {expiringSubscriptions.length}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Within 30 days
            </Text>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="gray.500">
                Expired
              </Text>
              <AlertTriangle size={20} color="var(--chakra-colors-red-500)" />
            </HStack>
            <Text fontSize="2xl" fontWeight="bold" color="red.500">
              {expiredSubscriptions.length}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Need attention
            </Text>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="gray.500">
                Monthly Revenue
              </Text>
              <CreditCard size={20} color="var(--chakra-colors-green-500)" />
            </HStack>
            <Text fontSize="2xl" fontWeight="bold" color="green.500">
              ${totalRevenue.toLocaleString()}
            </Text>
            <Text fontSize="sm" color="gray.600">
              From active plans
            </Text>
          </CardBody>
        </Card>
      </Grid>

      <Tabs>
        <TabList>
          <Tab>Subscription Overview</Tab>
          <Tab>Payment History</Tab>
        </TabList>

        <TabPanels>
          {/* Subscription Overview */}
          <TabPanel px={0}>
            {/* Filters */}
            <Card mb={6}>
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
                      {subscriptionData.map((sub) => (
                        <option key={sub.id} value={sub.id.toString()}>
                          {sub.schoolName}
                        </option>
                      ))}
                    </Select>
                  </Box>
                  <Box>
                    <Text fontSize="sm" mb={2}>
                      Filter by Status:
                    </Text>
                    <Select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="pending">Pending</option>
                    </Select>
                  </Box>
                  <Box >
                    <Text fontSize="sm" mb={2}>
                      Sort by:
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

            {/* Subscriptions Table */}
            <Card>
              <CardBody>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>School</Th>
                        <Th>Plan</Th>
                        <Th>Status</Th>
                        <Th>Renewal Date</Th>
                        <Th>Monthly Fee</Th>
                        <Th>Users</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {sortedSubscriptions.map((subscription) => (
                        <Tr key={subscription.id}>
                          <Td>
                            <Text fontWeight="medium">
                              {subscription.schoolName}
                            </Text>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={getPlanColor(subscription.plan)}
                            >
                              {subscription.plan}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack>
                              <Badge
                                colorScheme={getStatusColor(
                                  subscription.status
                                )}
                              >
                                {subscription.status}
                              </Badge>
                              {subscription.daysUntilRenewal !== null &&
                                subscription.daysUntilRenewal <= 30 &&
                                subscription.daysUntilRenewal > 0 && (
                                  <Badge colorScheme="yellow" size="sm">
                                    {subscription.daysUntilRenewal}d left
                                  </Badge>
                                )}
                            </HStack>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="sm">
                                {subscription.renewalDate === "N/A"
                                  ? "N/A"
                                  : subscription.renewalDate}
                              </Text>
                              {subscription.daysUntilRenewal !== null && (
                                <Progress
                                  value={
                                    subscription.daysUntilRenewal > 0
                                      ? Math.max(
                                        0,
                                        100 -
                                        (subscription.daysUntilRenewal /
                                          365) *
                                        100
                                      )
                                      : 100
                                  }
                                  size="sm"
                                  colorScheme={
                                    subscription.daysUntilRenewal <= 30
                                      ? "red"
                                      : "green"
                                  }
                                  w="80px"
                                />
                              )}
                            </VStack>
                          </Td>
                          <Td>
                            <Text fontWeight="semibold">
                              {subscription.monthlyFee === 0
                                ? "Free"
                                : `$${subscription.monthlyFee}`}
                            </Text>
                          </Td>
                          <Td>
                            <Text>{subscription.users.toLocaleString()}</Text>
                          </Td>
                          <Td>
                            <HStack>
                              <Button
                                size="sm"
                                leftIcon={<Eye />}
                                variant="outline"
                                onClick={() => handleViewDetails(subscription)}
                              >
                                Details
                              </Button>
                              <Button
                                size="sm"
                                colorScheme={
                                  subscription.status === "Active"
                                    ? "red"
                                    : "green"
                                }
                                variant="outline"
                                onClick={() =>
                                  handleToggleAccess(
                                    subscription.id,
                                    subscription.status
                                  )
                                }
                              >
                                {subscription.status === "Active"
                                  ? "Disable"
                                  : "Enable"}
                              </Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Payment History */}
          <TabPanel px={0}>
            <Card>
              <CardBody>
                <Flex mb={4}>
                  <Text fontSize="lg" fontWeight="semibold">
                    Payment History
                  </Text>
                  <Spacer />
                  <HStack>
                    <Input
                      placeholder="Search payments..."
                      size="sm"
                      w="200px"
                    />
                    <Select size="sm" w="150px">
                      <option value="all">All Methods</option>
                      <option value="credit">Credit Card</option>
                      <option value="bank">Bank Transfer</option>
                    </Select>
                  </HStack>
                </Flex>

                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>School</Th>
                        <Th>Date</Th>
                        <Th>Amount</Th>
                        <Th>Payment Method</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {payments.length > 0 ? (
                        payments.map((payment) => (
                          <Tr key={payment._id}>
                            <Td>
                              <Text fontWeight="medium">
                                {schools.find(s => s._id === payment.schoolId)?.name || "Unknown School"}
                              </Text>
                            </Td>
                            <Td>
                              <Text fontSize="sm">
                                {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "N/A"}
                              </Text>
                            </Td>
                            <Td>
                              <Text fontWeight="semibold">
                                ${payment.amount || 0}
                              </Text>
                            </Td>
                            <Td>
                              <Badge colorScheme="blue">
                                {payment.paymentMethod || "N/A"}
                              </Badge>
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  payment.status === "success" ? "green" : "red"
                                }
                              >
                                {payment.status || "pending"}
                              </Badge>
                            </Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan={5}>
                            <Text color="gray.500" align="center">
                              No payment history data available.
                            </Text>
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Subscription Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Subscription Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedSubscription && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontSize="lg" fontWeight="semibold" mb={2}>
                    {selectedSubscription.schoolName}
                  </Text>
                  <HStack>
                    <Badge
                      colorScheme={getPlanColor(selectedSubscription.plan)}
                      size="lg"
                    >
                      {selectedSubscription.plan} Plan
                    </Badge>
                    <Badge
                      colorScheme={getStatusColor(selectedSubscription.status)}
                      size="lg"
                    >
                      {selectedSubscription.status}
                    </Badge>
                  </HStack>
                </Box>

                <Grid templateColumns="1fr 1fr" gap={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      Monthly Fee
                    </Text>
                    <Text fontSize="lg" fontWeight="semibold">
                      {selectedSubscription.monthlyFee === 0
                        ? "Free"
                        : `$${selectedSubscription.monthlyFee}`}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      Total Users
                    </Text>
                    <Text fontSize="lg" fontWeight="semibold">
                      {selectedSubscription.users.toLocaleString()}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      Renewal Date
                    </Text>
                    <Text fontSize="lg" fontWeight="semibold">
                      {selectedSubscription.renewalDate}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      Payment Method
                    </Text>
                    <Text fontSize="lg" fontWeight="semibold">
                      {selectedSubscription.paymentMethod}
                    </Text>
                  </Box>
                </Grid>

                {selectedSubscription.daysUntilRenewal !== null && (
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={2}>
                      Days Until Renewal
                    </Text>
                    <HStack>
                      <Progress
                        value={
                          selectedSubscription.daysUntilRenewal > 0
                            ? Math.max(
                              0,
                              100 -
                              (selectedSubscription.daysUntilRenewal /
                                365) *
                              100
                            )
                            : 100
                        }
                        size="lg"
                        colorScheme={
                          selectedSubscription.daysUntilRenewal <= 30
                            ? "red"
                            : "green"
                        }
                        flex={1}
                      />
                      <Text fontWeight="semibold">
                        {selectedSubscription.daysUntilRenewal > 0
                          ? `${selectedSubscription.daysUntilRenewal} days`
                          : "Expired"}
                      </Text>
                    </HStack>
                  </Box>
                )}

                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    Last Payment
                  </Text>
                  <Text fontSize="lg" fontWeight="semibold">
                    {selectedSubscription.lastPayment}
                  </Text>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button colorScheme="blue">Update Subscription</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
