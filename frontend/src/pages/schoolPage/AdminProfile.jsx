"use client"

import {
  Box,
  Card,
  CardBody,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  FormControl,
  FormLabel,
  Avatar,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  useColorModeValue,
  Grid,
  Switch,
} from "@chakra-ui/react"
import { FiEdit, FiSave, FiCamera, FiActivity, FiShield, FiUser, FiSettings, FiCheckCircle, FiMessageSquare, FiBell, FiUsers, FiFileText } from "react-icons/fi"
import { useState, useEffect } from "react"
import { useBillingStore } from "../../store/billing"
import { useUserStore } from "../../store/user"
import { useAuthStore } from "../../store/auth"
import DataGeneratorModal from "../../components/common/DataGeneratorModal"

const recentActivity = [
  { id: 1, action: "Updated system settings", timestamp: "2024-01-20 14:30", type: "settings" },
  { id: 2, action: "Approved 5 facility bookings", timestamp: "2024-01-20 13:15", type: "approval" },
  { id: 3, action: "Created new announcement", timestamp: "2024-01-20 11:45", type: "announcement" },
  { id: 4, action: "Responded to student feedback", timestamp: "2024-01-20 10:20", type: "feedback" },
  { id: 5, action: "Added new student account", timestamp: "2024-01-19 16:30", type: "user" },
]

export function AdminProfile() {

  const { getUser } = useUserStore();
  const { getSchoolId } = useAuthStore();
  const { getSubscriptionsBySchoolId, getPaymentsBySchoolId, getInvoicesBySchoolId } = useBillingStore();

  const toast = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [sessionDuration, setSessionDuration] = useState("Loading...")
  const [subscriptionData, setSubscriptionData] = useState(null)
  const [paymentData, setPaymentData] = useState(null)
  const [invoiceData, setInvoiceData] = useState(null)
  const [loadingBilling, setLoadingBilling] = useState(false)
  const [isDataGeneratorOpen, setIsDataGeneratorOpen] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    role: "",
    joinDate: "",
  })
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
    autoLogout: true,
  })

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  // Fetch user profile data and session duration
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Use auth store method instead of fetch
        const authResult = await useAuthStore.getState().authorizeUser();

        if (authResult.success) {
          const data = authResult.data;

          // Update session duration
          if (data.tokenExpiration) {
            const { hours, minutes } = data.tokenExpiration.timeLeft;
            setSessionDuration(`${hours}h ${minutes}m`);
          } else {
            setSessionDuration("Session active");
          }

          // Update profile data with real user data
          if (data.id) {
            // Use user store method instead of fetch
            const userResult = await getUser(data.id);

            if (userResult.success && userResult.data) {
              const user = userResult.data;

              // Format join date from createdAt
              const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A";

              setProfileData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phoneNumber || "",
                department: data.role === "schoolAdmin" ? "Administration" :
                  data.role === "student" ? "Student Affairs" :
                    data.role === "lecturer" ? "Academic" : "",
                role: data.role || "",
                joinDate: joinDate,
              });
            }
          }
        } else {
          setSessionDuration("Session expired");
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setSessionDuration("Unable to load");
      }
    };

    fetchUserData();

    // Update session duration every minute
    const interval = setInterval(() => {
      fetchUserData();
    }, 60000);

    return () => clearInterval(interval);
  }, [getUser]);

  // Fetch billing data
  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoadingBilling(true);
        const schoolId = getSchoolId();

        if (schoolId) {
          const [subscriptionResult, paymentResult, invoiceResult] = await Promise.all([
            getSubscriptionsBySchoolId(schoolId),
            getPaymentsBySchoolId(schoolId),
            getInvoicesBySchoolId(schoolId)
          ]);

          console.log("🚀 ~ fetchBillingData ~ paymentResult:", paymentResult.data)
          console.log("🚀 ~ fetchBillingData ~ subscriptionResult:", subscriptionResult.data)
          console.log("🚀 ~ fetchBillingData ~ invoiceResult:", invoiceResult.data)

          if (subscriptionResult.success) {
            setSubscriptionData(subscriptionResult.data);
          }

          if (paymentResult.success) {
            setPaymentData(paymentResult.data);
          }

          if (invoiceResult.success) {
            setInvoiceData(invoiceResult.data);
          }
        }
      } catch (error) {
        console.error('Error fetching billing data:', error);
      } finally {
        setLoadingBilling(false);
      }
    };

    fetchBillingData();
  }, [getSchoolId, getSubscriptionsBySchoolId, getPaymentsBySchoolId, getInvoicesBySchoolId]);

  const handleSave = async () => {
    try {
      // Get current user ID from auth
      const authResponse = await fetch('/auth/is-auth', {
        method: 'POST',
        credentials: 'include',
      });

      if (authResponse.ok) {
        const authData = await authResponse.json();

        if (authData.id) {
          // Update user profile
          const updateResponse = await fetch(`/api/user/${authData.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              name: profileData.name,
              email: profileData.email,
              phoneNumber: profileData.phone,
            }),
          });

          if (updateResponse.ok) {
            toast({
              title: "Profile Updated",
              description: "Your profile has been updated successfully",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            setIsEditing(false);
          } else {
            const errorData = await updateResponse.json();
            toast({
              title: "Update Failed",
              description: errorData.message || "Failed to update profile",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "An error occurred while updating your profile",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  const handleDataGenerated = (data) => {
    console.log('Generated data:', data);
    toast({
      title: 'Data Generated!',
      description: 'Sample data has been generated successfully. Check the console for details.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "settings":
        return <FiSettings />
      case "approval":
        return <FiCheckCircle />
      case "announcement":
        return <FiBell />
      case "feedback":
        return <FiMessageSquare />
      case "user":
        return <FiUsers />
      default:
        return <FiFileText />
    }
  }

  return (
    <Box minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify={"space-between"}>
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="#333333">
              Admin Profile
            </Text>
            <Text color="gray.600">Manage your profile and preferences</Text>
          </Box>
          <Button
            colorScheme="green"
            variant="outline"
            onClick={() => setIsDataGeneratorOpen(true)}
          >
            Generate
          </Button>
        </HStack>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
          {/* Profile Information */}
          <VStack spacing={6}>
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full" flex={1}>
              <CardBody>
                <HStack justify="space-between" mb={6}>
                  <HStack>
                    <FiUser color="#344E41" />
                    <Text fontSize="lg" fontWeight="semibold" color="#333333">
                      Profile Information
                    </Text>
                  </HStack>
                  <Button
                    leftIcon={isEditing ? <FiSave /> : <FiEdit />}
                    size="sm"
                    bg="#344E41"
                    color="white"
                    _hover={{ bg: "#2a3d33" }}
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  >
                    {isEditing ? "Save" : "Edit"}
                  </Button>
                </HStack>

                <VStack spacing={6}>
                  {/* Avatar Section */}
                  <VStack>
                    <Avatar size="xl" name={profileData.name} />
                    <Button leftIcon={<FiCamera />} size="sm" variant="outline">
                      Change Photo
                    </Button>
                  </VStack>

                  {/* Profile Fields */}
                  <Grid templateColumns="1fr 1fr" gap={4} w="full">
                    <FormControl>
                      <FormLabel>Full Name</FormLabel>
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        isReadOnly={!isEditing}
                        bg={isEditing ? "white" : "gray.50"}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <Input
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        isReadOnly={!isEditing}
                        bg={isEditing ? "white" : "gray.50"}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Phone</FormLabel>
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        isReadOnly={!isEditing}
                        bg={isEditing ? "white" : "gray.50"}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Department</FormLabel>
                      <Input
                        value={profileData.department}
                        onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                        isReadOnly={!isEditing}
                        bg={isEditing ? "white" : "gray.50"}
                      />
                    </FormControl>
                  </Grid>

                  <Grid templateColumns="1fr 1fr" gap={4} w="full">
                    <FormControl>
                      <FormLabel>Role</FormLabel>
                      <Input value={profileData.role} isReadOnly bg="gray.50" />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Join Date</FormLabel>
                      <Input value={profileData.joinDate} isReadOnly bg="gray.50" />
                    </FormControl>
                  </Grid>
                </VStack>
              </CardBody>
            </Card>
          </VStack>

          {/* Sidebar */}
          <VStack spacing={6}>
            {/* Account Status */}
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
              <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
                  Account Status
                </Text>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm">Account Status</Text>
                    <Badge colorScheme="green">Active</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Last Login</Text>
                    <Text fontSize="sm">Coming Soon</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Session Duration</Text>
                    <Text fontSize="sm">{sessionDuration}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Permissions</Text>
                    <Badge colorScheme="blue">Full Access</Badge>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Preferences */}
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
              <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
                  Preferences
                </Text>
                <VStack spacing={4} align="stretch">
                  <HStack justify="center" py={4}>
                    <FiSettings color="gray.500" />
                    <Text fontSize="sm" color="gray.500">
                      Preference settings coming soon
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Recent Activity */}
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
              <CardBody>
                <HStack mb={4}>
                  <FiActivity color="#344E41" />
                  <Text fontSize="lg" fontWeight="semibold" color="#333333">
                    Recent Activity
                  </Text>
                </HStack>
                <VStack spacing={3} align="stretch">
                  <HStack justify="center" py={4}>
                    <FiActivity color="gray.500" />
                    <Text fontSize="sm" color="gray.500">
                      Activity tracking coming soon
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Grid>

        {/* Subscription & Payment Information */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <HStack mb={4} justify="space-between" align="center">
              <Text fontSize="lg" fontWeight="semibold" color="#333333">
                Subscription & Payment
              </Text>
              <HStack spacing={2} align="center">
                <Badge colorScheme={
                  (() => {
                    if (!subscriptionData || subscriptionData.length === 0) return 'gray.500';

                    const latestSubscription = subscriptionData.reduce((latest, current) =>
                      !latest || new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
                    );

                    if (!latestSubscription.createdAt || !latestSubscription.billingInterval) return 'gray.500';

                    const startDate = new Date(latestSubscription.createdAt);
                    const endDate = new Date(startDate);

                    if (latestSubscription.billingInterval === 'Monthly') {
                      endDate.setMonth(endDate.getMonth() + 1);
                    } else if (latestSubscription.billingInterval === 'Yearly') {
                      endDate.setFullYear(endDate.getFullYear() + 1);
                    }

                    const now = new Date();
                    const daysUntilPayment = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

                    if (daysUntilPayment <= 0) return 'red.500';
                    if (daysUntilPayment <= 7) return 'red.500';
                    if (daysUntilPayment <= 30) return 'yellow.500';
                    return 'green.500';
                  })()
                }>
                  <HStack>
                    <Text fontSize="sm" color="gray.600">Next Payment:</Text>
                    <Text fontSize="sm" fontWeight="semibold">
                      {(() => {
                        if (!subscriptionData || subscriptionData.length === 0) return 'N/A';

                        const latestSubscription = subscriptionData.reduce((latest, current) =>
                          !latest || new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
                        );

                        if (!latestSubscription.createdAt || !latestSubscription.billingInterval) return 'N/A';

                        const startDate = new Date(latestSubscription.createdAt);
                        const endDate = new Date(startDate);

                        if (latestSubscription.billingInterval === 'Monthly') {
                          endDate.setMonth(endDate.getMonth() + 1);
                        } else if (latestSubscription.billingInterval === 'Yearly') {
                          endDate.setFullYear(endDate.getFullYear() + 1);
                        }

                        return endDate.toLocaleDateString();
                      })()}
                    </Text>
                  </HStack>
                </Badge>
              </HStack>
            </HStack>
            {loadingBilling ? (
              <HStack justify="center" py={8}>
                <Text fontSize="sm" color="gray.500">Loading billing information...</Text>
              </HStack>
            ) : (
              <VStack spacing={6} align="stretch">
                {/* Billing Timeline Section */}
                <Box>
                  <Text fontSize="md" fontWeight="semibold" mb={3} color="#333333">
                    Billing Timeline
                  </Text>
                  {(() => {
                    // Combine and sort all billing events by date
                    const timelineEvents = [];

                    // Add subscription events
                    if (subscriptionData && subscriptionData.length > 0) {
                      subscriptionData.forEach((subscription, index) => {
                        const startDate = subscription.createdAt ? new Date(subscription.createdAt) : null;
                        const endDate = startDate ? new Date(startDate) : null;

                        if (subscription.billingInterval === 'Monthly' && endDate) {
                          endDate.setMonth(endDate.getMonth() + 1);
                        } else if (subscription.billingInterval === 'Yearly' && endDate) {
                          endDate.setFullYear(endDate.getFullYear() + 1);
                        }

                        timelineEvents.push({
                          type: 'subscription',
                          data: subscription,
                          date: startDate,
                          endDate: endDate,
                          title: `${subscription.planName || 'Standard Plan'} Subscription`,
                          description: `${subscription.billingInterval || 'Monthly'} billing at RM${subscription.price || '0'}`,
                          status: 'active'
                        });
                      });
                    }

                    // Add invoice events
                    if (invoiceData && invoiceData.length > 0) {
                      invoiceData.forEach((invoice, index) => {
                        const invoiceDate = invoice.date ? new Date(invoice.date) : null;
                        timelineEvents.push({
                          type: 'invoice',
                          data: invoice,
                          date: invoiceDate,
                          title: `Invoice #${invoice._id ? String(invoice._id).slice(-8) : 'N/A'}`,
                          description: `Amount: RM${invoice.amount || '0'}`,
                          status: invoice.status || 'unknown'
                        });
                      });
                    }

                    // Sort events by date (most recent first)
                    timelineEvents.sort((a, b) => {
                      if (!a.date && !b.date) return 0;
                      if (!a.date) return 1;
                      if (!b.date) return -1;
                      return b.date - a.date;
                    });

                    if (timelineEvents.length > 0) {
                      return (
                        <VStack spacing={0} align="stretch">
                          {timelineEvents.map((event, index) => (
                            <Box key={index} position="relative">
                              {/* Timeline connector */}
                              {index < timelineEvents.length - 1 && (
                                <Box
                                  position="absolute"
                                  left="20px"
                                  top="40px"
                                  bottom="-20px"
                                  width="2px"
                                  bg="gray.300"
                                  zIndex={1}
                                />
                              )}

                              {/* Timeline item */}
                              <HStack spacing={4} align="flex-start" position="relative" zIndex={2}>
                                {/* Timeline dot */}
                                <Box
                                  w="40px"
                                  h="40px"
                                  borderRadius="full"
                                  bg={event.type === 'subscription' ? 'blue.500' : 'green.500'}
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  flexShrink={0}
                                  position="relative"
                                  zIndex={3}
                                >
                                  {event.type === 'subscription' ? (
                                    <FiShield color="white" size={16} />
                                  ) : (
                                    <FiFileText color="white" size={16} />
                                  )}
                                </Box>

                                {/* Event content */}
                                <Card
                                  flex={1}
                                  bg="gray.50"
                                  borderColor="gray.200"
                                  borderWidth="1px"
                                  shadow="sm"
                                  mb={3}
                                >
                                  <CardBody>
                                    <VStack spacing={3} align="stretch">
                                      {/* Header */}
                                      <HStack justify="space-between" align="flex-start">
                                        <VStack align="flex-start" spacing={1}>
                                          <Text fontSize="md" fontWeight="semibold" color="#333333">
                                            {event.title}
                                          </Text>
                                          <Text fontSize="sm" color="gray.600">
                                            {event.description}
                                          </Text>
                                        </VStack>
                                        <Badge
                                          colorScheme={
                                            event.type === 'subscription' ? 'blue' :
                                              event.status === 'paid' ? 'green' :
                                                event.status === 'pending' ? 'yellow' :
                                                  event.status === 'overdue' ? 'red' : 'gray'
                                          }
                                        >
                                          {event.type === 'subscription' ? 'Active' : event.status}
                                        </Badge>
                                      </HStack>

                                      {/* Date information */}
                                      <HStack justify="space-between" fontSize="sm">
                                        <Text color="gray.600">
                                          {event.type === 'subscription' ? 'Started:' : 'Issued:'}
                                        </Text>
                                        <Text fontWeight="medium">
                                          {event.date ? event.date.toLocaleDateString() : 'N/A'}
                                        </Text>
                                      </HStack>

                                      {/* Additional details based on event type */}
                                      {event.type === 'subscription' && event.endDate && (
                                        <HStack justify="space-between" fontSize="sm">
                                          <Text color="gray.600">Expires:</Text>
                                          <Text
                                            fontWeight="semibold"
                                            color={
                                              (() => {
                                                const now = new Date();
                                                const daysUntilExpiry = Math.ceil((event.endDate - now) / (1000 * 60 * 60 * 24));
                                                if (daysUntilExpiry <= 0) return 'red.500';
                                                if (daysUntilExpiry <= 7) return 'orange.500';
                                                if (daysUntilExpiry <= 30) return 'yellow.500';
                                                return 'green.500';
                                              })()
                                            }
                                          >
                                            {event.endDate.toLocaleDateString()}
                                          </Text>
                                        </HStack>
                                      )}

                                      {event.type === 'invoice' && (
                                        <>
                                          <HStack justify="space-between" fontSize="sm">
                                            <Text color="gray.600">Payment ID:</Text>
                                            <Text fontFamily="mono" color="gray.600">
                                              {event.data.paymentId ? String(event.data.paymentId._id).slice(-8) : 'N/A'}
                                            </Text>
                                          </HStack>
                                          <HStack justify="space-between" fontSize="sm">
                                            <Text color="gray.600">Subscription ID:</Text>
                                            <Text fontFamily="mono" color="gray.600">
                                              {event.data.subscriptionId ? String(event.data.subscriptionId._id).slice(-8) : 'N/A'}
                                            </Text>
                                          </HStack>
                                        </>
                                      )}
                                    </VStack>
                                  </CardBody>
                                </Card>
                              </HStack>
                            </Box>
                          ))}
                        </VStack>
                      );
                    } else {
                      return (
                        <HStack justify="center" py={4}>
                          <Text fontSize="sm" color="gray.500">No billing information available</Text>
                        </HStack>
                      );
                    }
                  })()}
                </Box>

                {/* Payment Methods Section */}
                <Box>
                  <Text fontSize="md" fontWeight="semibold" mb={3} color="#333333">
                    Payment Methods
                  </Text>
                  {paymentData && paymentData.length > 0 ? (
                    <VStack spacing={3} align="stretch">
                      {paymentData.map((payment, index) => (
                        <Card key={index} bg="gray.50" borderColor="gray.200" borderWidth="1px">
                          <CardBody>
                            <VStack spacing={3} align="stretch">
                              <HStack justify="space-between">
                                <Text fontSize="md" fontWeight="semibold">Card Holder</Text>
                                <Text fontSize="sm">{payment.cardHolderName}</Text>
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm">Payment Method</Text>
                                <Badge colorScheme="purple">{payment.paymentMethod}</Badge>
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm">Card Number</Text>
                                <Text fontSize="sm">**** **** **** {payment.last4Digit}</Text>
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm">Expiry Date</Text>
                                <Text fontSize="sm">{payment.expiryDate}</Text>
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm">Status</Text>
                                <Badge colorScheme={payment.status === 'success' ? 'green' : payment.status === 'failed' ? 'red' : 'yellow'}>
                                  {payment.status}
                                </Badge>
                              </HStack>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  ) : (
                    <HStack justify="center" py={4}>
                      <Text fontSize="sm" color="gray.500">No payment methods available</Text>
                    </HStack>
                  )}
                </Box>


              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Data Generator Modal */}
      <DataGeneratorModal
        isOpen={isDataGeneratorOpen}
        onClose={() => setIsDataGeneratorOpen(false)}
        onDataGenerated={handleDataGenerated}
      />
    </Box>
  )
}
