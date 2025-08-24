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
  SimpleGrid,
  Spinner,
  IconButton,
} from "@chakra-ui/react"
import { FiEdit, FiSave, FiCamera, FiActivity, FiShield, FiUser, FiSettings, FiCheckCircle, FiMessageSquare, FiBell, FiUsers, FiFileText, FiRefreshCw } from "react-icons/fi"
import { useState, useEffect } from "react"
import { useBillingStore } from "../../store/billing"
import { useUserStore } from "../../store/user"
import { useAuthStore } from "../../store/auth"
import DataGeneratorModal from "../../component/DataGeneratorModal"
import ProfilePicture from "../../component/common/ProfilePicture"
import { clearSchoolData } from "../../utils/academicDataGenerator.js"
import ComfirmationMessage from "../../component/common/ComfirmationMessage"
import AccountTerminationModal from "../../component/common/AccountTerminationModal"

const recentActivity = [
  { id: 1, action: "Updated system settings", timestamp: "2024-01-20 14:30", type: "settings" },
  { id: 2, action: "Approved 5 facility bookings", timestamp: "2024-01-20 13:15", type: "approval" },
  { id: 3, action: "Created new announcement", timestamp: "2024-01-20 11:45", type: "announcement" },
  { id: 4, action: "Responded to student feedback", timestamp: "2024-01-20 10:20", type: "feedback" },
  { id: 5, action: "Added new student account", timestamp: "2024-01-19 16:30", type: "user" },
]

export function AdminProfile() {

  const { getUser } = useUserStore();
  const { getSchoolId, initializeAuth, schoolId } = useAuthStore();
  const { getSubscriptionsBySchoolId, getPaymentsBySchoolId, getInvoicesBySchoolId } = useBillingStore();

  useEffect(() => {
    initializeAuth();
  }, [])

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
    profilePicture: "", // Add profile picture field
  })
  const [imageLoadError, setImageLoadError] = useState(false)
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
    autoLogout: true,
  })
  const [dbStats, setDbStats] = useState(null);
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const [isTerminateAccountModalOpen, setIsTerminateAccountModalOpen] = useState(false);
  const [isTerminatingAccount, setIsTerminatingAccount] = useState(false);
  const [showFinalTerminationConfirm, setShowFinalTerminationConfirm] = useState(false);

  const bgColor = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.800", "white")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  // Fetch database statistics
  const fetchDatabaseStats = async () => {
    try {
      const response = await fetch(`/api/school-data-status/${schoolId}/stats`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDbStats(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching database stats:', error);
    }
  };

  // Fetch stats on component mount
  useEffect(() => {
    if (schoolId) {
      fetchDatabaseStats();
    }
  }, [schoolId]);

  // Helper function to fix Google profile picture URLs
  const fixGoogleProfilePictureUrl = (url) => {
    if (!url) return url;

    // If it's a Google profile picture URL, ensure it's properly formatted
    if (url.includes('googleusercontent.com')) {
      // Try different size parameters to ensure the image loads
      // Remove existing size parameters and add a larger size
      const baseUrl = url.replace(/=s\d+-c$/, '');
      const fixedUrl = `${baseUrl}=s400-c`;
      return fixedUrl;
    }

    return url;
  };

  // Fetch user profile data and session duration
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Use auth store method instead of fetch
        const data = await useAuthStore.getState().authorizeUser();

        if (data) {

          // Update session duration
          if (data.tokenExpiration) {
            const { hours, minutes } = data.tokenExpiration.timeLeft;
            setSessionDuration(`${hours}h ${minutes}m`);
          } else {
            setSessionDuration("Session active");
          }

          // Update profile data with real user data
          if (data.data._id) {
            // Use user store method instead of fetch
            const userResult = await getUser(data.data._id);

            if (userResult.success && userResult.data) {
              const user = userResult.data;

              // Format join date from createdAt
              const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A";

              const fixedProfilePictureUrl = fixGoogleProfilePictureUrl(user.profilePicture);
              const finalProfileData = {
                id: userResult.data._id,
                name: user.name || "",
                email: user.email || "",
                phone: user.phoneNumber || "",
                department: data.role === "schoolAdmin" ? "Administration" :
                  data.role === "student" ? "Student Affairs" :
                    data.role === "lecturer" ? "Academic" : "",
                role: data.role || "",
                joinDate: joinDate,
                profilePicture: fixedProfilePictureUrl || "", // Add profile picture
              };
              setProfileData(finalProfileData);
              setImageLoadError(false); // Reset image load error when profile data changes

              // Test if the profile picture can be loaded
              if (fixedProfilePictureUrl) {
                testImageLoad(fixedProfilePictureUrl).then((canLoad) => {
                  if (!canLoad) {
                    setImageLoadError(true);
                  }
                });
              }
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
              phoneNumber: profileData.phone || "",
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

  const handleImageLoadError = () => {
    setImageLoadError(true);
  };

  // Test if image can be loaded
  const testImageLoad = (url) => {
    if (!url) return Promise.resolve(false);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(true);
      };
      img.onerror = () => {
        resolve(false);
      };
      img.src = url;
    });
  };

  const handleProfilePictureChange = async (file, formData) => {
    try {
      // Get current user ID from auth
      const authResponse = await fetch('/auth/is-auth', {
        method: 'POST',
        credentials: 'include',
      });

      if (!authResponse.ok) {
        throw new Error('Authentication failed');
      }

      const authData = await authResponse.json();

      if (!authData.id) {
        throw new Error('User ID not found');
      }

      if (file === null) {
        // Remove profile picture using user store (calls API)
        console.log('Removing profile picture for user:', authData.id);
        const result = await useUserStore.getState().updateUserProfilePicture(authData.id, null);

        if (result.success) {
          // Update local state
          setProfileData(prev => ({ ...prev, profilePicture: null }));

          // Refresh user data from API
          const userResult = await getUser(authData.id);
          if (userResult.success && userResult.data) {
            setProfileData(prev => ({
              ...prev,
              profilePicture: userResult.data.profilePicture || ""
            }));
          }

          toast({
            title: "Profile Picture Removed",
            description: "Your profile picture has been successfully removed from the database.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else {
          throw new Error(result.message || 'Failed to remove profile picture from database');
        }
      } else {
        // Upload new profile picture
        console.log('Uploading new profile picture for user:', authData.id);

        // Convert file to base64 for demo purposes (not recommended for production)
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64String = e.target.result;

          // Update using user store (calls API)
          const result = await useUserStore.getState().updateUserProfilePicture(authData.id, base64String);

          if (result.success) {
            // Update local state
            setProfileData(prev => ({ ...prev, profilePicture: base64String }));

            // Refresh user data from API
            const userResult = await getUser(authData.id);
            if (userResult.success && userResult.data) {
              setProfileData(prev => ({
                ...prev,
                profilePicture: userResult.data.profilePicture || ""
              }));
            }

            toast({
              title: "Profile Picture Updated",
              description: "Your profile picture has been successfully saved to the database.",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          } else {
            throw new Error(result.message || 'Failed to update profile picture in database');
          }
        };

        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast({
        title: "Profile Picture Update Failed",
        description: error.message || "Failed to update profile picture. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      throw error; // Re-throw to let the ProfilePicture component handle the error
    }
  };

  const handleDataGenerated = (data) => {
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
            Generate Mock
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
                  <ProfilePicture
                    src={imageLoadError ? "" : profileData.profilePicture}
                    name={profileData.name}
                    size="xl"
                    bgColor="#344E41"
                    onPhotoChange={handleProfilePictureChange}
                  />

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
                        isReadOnly
                        bg="gray.50"
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

                  <Grid templateColumns="1fr 1fr" gap={4} w="full">
                    <FormControl>
                      <FormLabel>School ID</FormLabel>
                      <Input
                        value={schoolId || "Loading..."}
                        isReadOnly
                        bg="gray.50"
                        fontFamily="mono"
                        fontSize="sm"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>User ID</FormLabel>
                      <Input
                        value={profileData.id || "Loading..."}
                        isReadOnly
                        bg="gray.50"
                        fontFamily="mono"
                        fontSize="sm"
                      />
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

                <Box>
                  <HStack justify="space-between" mb={3}>
                    <Text fontSize="md" fontWeight="semibold" color="#333333">
                      Database Stats
                    </Text>
                    <IconButton
                      size="sm"
                      icon={<FiRefreshCw />}
                      onClick={fetchDatabaseStats}
                      aria-label="Refresh database stats"
                      colorScheme="blue"
                      variant="ghost"
                    />
                  </HStack>
                  <Card bg="gray.50" borderColor="gray.200" borderWidth="1px">
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        {dbStats ? (
                          <>
                            {/* Academic Stats */}
                            <Box>
                              <Text fontSize="sm" fontWeight="bold" color="blue.600" mb={2}>
                                Academic ({dbStats.totals?.academic || 0})
                              </Text>
                              <SimpleGrid columns={2} spacing={2}>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Students</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.students || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Courses</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.courses || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Modules</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.modules || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Lecturers</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.lecturers || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Departments</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.departments || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Intakes</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.intakes || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Intake Courses</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.intakeCourses || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Class Schedules</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.classSchedules || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Exam Schedules</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.examSchedules || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Attendance</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.attendance || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Results</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.results || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Rooms</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.rooms || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Semesters</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.semesters || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Semester Modules</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.semesterModules || 0}</Text>
                                </HStack>
                              </SimpleGrid>
                            </Box>

                            {/* Billing Stats */}
                            <Box>
                              <Text fontSize="sm" fontWeight="bold" color="red.600" mb={2}>
                                Billing ({dbStats.totals?.billing || 0})
                              </Text>
                              <SimpleGrid columns={2} spacing={2}>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Invoices</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.invoices || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Payments</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.payments || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Subscriptions</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.subscriptions || 0}</Text>
                                </HStack>
                              </SimpleGrid>
                            </Box>

                            {/* Facility Stats */}
                            <Box>
                              <Text fontSize="sm" fontWeight="bold" color="green.600" mb={2}>
                                Facility ({dbStats.totals?.facility || 0})
                              </Text>
                              <SimpleGrid columns={2} spacing={2}>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Bookings</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.bookings || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Locker Units</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.lockerUnits || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Parking Lots</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.parkingLots || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Resources</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.resources || 0}</Text>
                                </HStack>
                              </SimpleGrid>
                            </Box>

                            {/* Service Stats */}
                            <Box>
                              <Text fontSize="sm" fontWeight="bold" color="purple.600" mb={2}>
                                Service ({dbStats.totals?.service || 0})
                              </Text>
                              <SimpleGrid columns={2} spacing={2}>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Feedback</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.feedback || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Lost Items</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.lostItems || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Responses</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.responses || 0}</Text>
                                </HStack>
                              </SimpleGrid>
                            </Box>

                            {/* Transportation Stats */}
                            <Box>
                              <Text fontSize="sm" fontWeight="bold" color="orange.600" mb={2}>
                                Transportation ({dbStats.totals?.transportation || 0})
                              </Text>
                              <SimpleGrid columns={2} spacing={2}>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Bus Schedules</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.busSchedules || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">E-Hailing</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.eHailing || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Routes</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.routes || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Vehicles</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.vehicles || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="xs">Stops</Text>
                                  <Text fontSize="xs" fontWeight="semibold">{dbStats.collections?.stops || 0}</Text>
                                </HStack>
                              </SimpleGrid>
                            </Box>

                            {/* Total */}
                            <Box pt={2} borderTop="1px" borderColor="gray.200">
                              <HStack justify="space-between">
                                <Text fontSize="md" fontWeight="bold" color="gray.700">
                                  Total Documents
                                </Text>
                                <Text fontSize="lg" fontWeight="bold" color="blue.600">
                                  {dbStats.totals?.total || 0}
                                </Text>
                              </HStack>
                            </Box>
                          </>
                        ) : (
                          <HStack justify="center" py={4}>
                            <Spinner size="sm" />
                            <Text fontSize="sm" color="gray.500">Loading database statistics...</Text>
                          </HStack>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </Box>

                <Button onClick={() => setIsClearDataModalOpen(true)} colorScheme="red" variant="outline">
                  Clear Data
                </Button>

              </VStack>
            )}

            <Button
              mt={3}
              colorScheme="red"
              variant="solid"
              onClick={() => setIsTerminateAccountModalOpen(true)}
            >
              Terminate Account
            </Button>

          </CardBody>
        </Card>
      </VStack>


      {/* Data Generator Modal */}
      <DataGeneratorModal
        isOpen={isDataGeneratorOpen}
        onClose={() => setIsDataGeneratorOpen(false)}
        onDataGenerated={handleDataGenerated}
      />

      {/* Clear Data Confirmation Modal */}
      <ComfirmationMessage
        title="⚠️ Clear All School Data"
        description="This will permanently delete ALL academic data for this school including students, courses, modules, lecturers, schedules, attendance records, results, and more. This action cannot be undone. Are you absolutely sure you want to proceed?"
        isOpen={isClearDataModalOpen}
        onClose={() => setIsClearDataModalOpen(false)}
        onConfirm={async () => {
          try {
            setIsClearingData(true);
            await clearSchoolData(schoolId);
            await fetchDatabaseStats();
            toast({
              title: "Data Cleared Successfully",
              description: "All academic data for this school has been permanently deleted.",
              status: "success",
              duration: 5000,
              isClosable: true,
            });
            setIsClearDataModalOpen(false);
          } catch (error) {
            toast({
              title: "Error Clearing Data",
              description: "Failed to clear data: " + error.message,
              status: "error",
              duration: 5000,
              isClosable: true,
            });
            setIsClearDataModalOpen(false);
          } finally {
            setIsClearingData(false);
          }
        }}
        isLoading={isClearingData}
      />

      {/* Account Termination Modal */}
      <AccountTerminationModal
        isOpen={isTerminateAccountModalOpen}
        onClose={() => setIsTerminateAccountModalOpen(false)}
        userEmail={profileData.email}
        onConfirm={() => {
          // Show final confirmation dialog
          setIsTerminateAccountModalOpen(false);
          setShowFinalTerminationConfirm(true);
        }}
      />

      {/* Final Account Termination Confirmation */}
      <ComfirmationMessage
        title="🚨 FINAL WARNING: Account Termination"
        description="You are about to PERMANENTLY DELETE your entire account, school, and ALL associated data. This includes all students, courses, modules, lecturers, schedules, attendance records, results, facility bookings, transportation data, and billing information. This action CANNOT be undone. Are you absolutely certain you want to terminate your account?"
        isOpen={showFinalTerminationConfirm}
        onClose={() => setShowFinalTerminationConfirm(false)}
        onConfirm={async () => {
          try {
            setIsTerminatingAccount(true);

            // First, clear all school data using the existing function
            await clearSchoolData(schoolId);

            // Then delete the school account
            const schoolResponse = await fetch(`/api/school/${schoolId}`, {
              method: 'DELETE',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (!schoolResponse.ok) {
              const errorData = await schoolResponse.json();
              throw new Error(errorData.message || 'Failed to delete school account');
            }

            // Finally, delete the user account
            const authResponse = await fetch('/auth/is-auth', {
              method: 'POST',
              credentials: 'include',
            });

            if (authResponse.ok) {
              const authData = await authResponse.json();
              if (authData.id) {
                const userResponse = await fetch(`/api/user/${authData.id}`, {
                  method: 'DELETE',
                  credentials: 'include',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });

                if (!userResponse.ok) {
                  console.warn('Failed to delete user account, but school was deleted');
                }
              }
            }

            // Clear any local storage or session data
            localStorage.clear();
            sessionStorage.clear();

            // Clear cookies by setting them to expire
            document.cookie.split(";").forEach(function (c) {
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });

            // Logout from the system
            try {
              await fetch('/auth/logout', {
                method: 'POST',
                credentials: 'include',
              });
            } catch (error) {
              console.warn('Failed to logout, but continuing with account termination');
            }

            toast({
              title: "Account Terminated Successfully",
              description: "Your account, school, and all data have been permanently deleted.",
              status: "success",
              duration: 5000,
              isClosable: true,
            });

            // Redirect to logout or home page
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          } catch (error) {
            console.error('Account termination error:', error);
            toast({
              title: "Error Terminating Account",
              description: "Failed to terminate account: " + error.message,
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          } finally {
            setIsTerminatingAccount(false);
            setShowFinalTerminationConfirm(false);
          }
        }}
        isLoading={isTerminatingAccount}
      />
    </Box>
  )
}
