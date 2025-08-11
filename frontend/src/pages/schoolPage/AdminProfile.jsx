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

const recentActivity = [
  { id: 1, action: "Updated system settings", timestamp: "2024-01-20 14:30", type: "settings" },
  { id: 2, action: "Approved 5 facility bookings", timestamp: "2024-01-20 13:15", type: "approval" },
  { id: 3, action: "Created new announcement", timestamp: "2024-01-20 11:45", type: "announcement" },
  { id: 4, action: "Responded to student feedback", timestamp: "2024-01-20 10:20", type: "feedback" },
  { id: 5, action: "Added new student account", timestamp: "2024-01-19 16:30", type: "user" },
]

export function AdminProfile() {

  const { getUser } = useUserStore();

  const toast = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [sessionDuration, setSessionDuration] = useState("Loading...")
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
        const response = await fetch('/auth/is-auth', {
          method: 'POST',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();

          // Update session duration
          if (data.tokenExpiration) {
            const { hours, minutes } = data.tokenExpiration.timeLeft;
            setSessionDuration(`${hours}h ${minutes}m`);
          } else {
            setSessionDuration("Session active");
          }

          // Update profile data with real user data
          if (data.id) {
            // Fetch detailed user information
            const userResponse = await fetch(`/api/user/${data.id}`, {
              method: 'GET',
              credentials: 'include',
            });

            if (userResponse.ok) {
              const userData = await userResponse.json();
              if (userData.success && userData.data) {
                const user = userData.data;

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
  }, []);

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
    <Box p={6} bg="#F5F5F5" minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="#333333">
            Admin Profile
          </Text>
          <Text color="gray.600">Manage your profile and preferences</Text>
        </Box>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
          {/* Profile Information */}
          <VStack spacing={6}>
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
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

            {/* Security Settings */}
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
              <CardBody>
                <HStack mb={4}>
                  <FiShield color="#344E41" />
                  <Text fontSize="lg" fontWeight="semibold" color="#333333">
                    Security Settings
                  </Text>
                </HStack>
                <VStack spacing={4} align="stretch">
                  <HStack justify="center" py={4}>
                    <FiShield color="gray.500" />
                    <Text fontSize="sm" color="gray.500">
                      Security features coming soon
                    </Text>
                  </HStack>
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

        {/* Full Activity Log */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
              Activity Log
            </Text>
            <HStack justify="center" py={8}>
              <FiFileText color="gray.500" />
              <Text fontSize="sm" color="gray.500">
                Detailed activity logs coming soon
              </Text>
            </HStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  )
}
