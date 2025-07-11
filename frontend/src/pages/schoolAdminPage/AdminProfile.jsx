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
import { FiEdit, FiSave, FiCamera, FiActivity, FiShield, FiUser } from "react-icons/fi"
import { useState } from "react"

const recentActivity = [
  { id: 1, action: "Updated system settings", timestamp: "2024-01-20 14:30", type: "settings" },
  { id: 2, action: "Approved 5 facility bookings", timestamp: "2024-01-20 13:15", type: "approval" },
  { id: 3, action: "Created new announcement", timestamp: "2024-01-20 11:45", type: "announcement" },
  { id: 4, action: "Responded to student feedback", timestamp: "2024-01-20 10:20", type: "feedback" },
  { id: 5, action: "Added new student account", timestamp: "2024-01-19 16:30", type: "user" },
]

export  function AdminProfile() {
  const toast = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "John Administrator",
    email: "admin@campushub.edu",
    phone: "+1-555-0100",
    department: "Administration",
    role: "System Administrator",
    joinDate: "2020-08-15",
  })
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
    autoLogout: true,
  })

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  const handleSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    })
    setIsEditing(false)
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case "settings":
        return "⚙️"
      case "approval":
        return "✅"
      case "announcement":
        return "📢"
      case "feedback":
        return "💬"
      case "user":
        return "👤"
      default:
        return "📝"
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
                  <Button variant="outline" w="full">
                    Change Password
                  </Button>
                  <Button variant="outline" w="full">
                    Enable Two-Factor Authentication
                  </Button>
                  <Button variant="outline" w="full">
                    View Login History
                  </Button>
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
                    <Text fontSize="sm">Today, 9:30 AM</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Session Duration</Text>
                    <Text fontSize="sm">2h 45m</Text>
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
                  <HStack justify="space-between">
                    <Text fontSize="sm">Email Notifications</Text>
                    <Switch
                      isChecked={preferences.emailNotifications}
                      onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                      colorScheme="green"
                    />
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">SMS Notifications</Text>
                    <Switch
                      isChecked={preferences.smsNotifications}
                      onChange={(e) => setPreferences({ ...preferences, smsNotifications: e.target.checked })}
                      colorScheme="green"
                    />
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Dark Mode</Text>
                    <Switch
                      isChecked={preferences.darkMode}
                      onChange={(e) => setPreferences({ ...preferences, darkMode: e.target.checked })}
                      colorScheme="green"
                    />
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Auto Logout</Text>
                    <Switch
                      isChecked={preferences.autoLogout}
                      onChange={(e) => setPreferences({ ...preferences, autoLogout: e.target.checked })}
                      colorScheme="green"
                    />
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
                  {recentActivity.slice(0, 5).map((activity) => (
                    <HStack key={activity.id} spacing={3}>
                      <Text fontSize="lg">{getActivityIcon(activity.type)}</Text>
                      <Box flex="1">
                        <Text fontSize="sm" fontWeight="medium">
                          {activity.action}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {activity.timestamp}
                        </Text>
                      </Box>
                    </HStack>
                  ))}
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
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Action</Th>
                  <Th>Timestamp</Th>
                  <Th>Type</Th>
                </Tr>
              </Thead>
              <Tbody>
                {recentActivity.map((activity) => (
                  <Tr key={activity.id}>
                    <Td>{activity.action}</Td>
                    <Td>{activity.timestamp}</Td>
                    <Td>
                      <Badge colorScheme="blue">{activity.type}</Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  )
}
