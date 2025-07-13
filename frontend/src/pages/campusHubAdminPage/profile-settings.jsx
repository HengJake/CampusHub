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
  Button,
  Input,
  FormControl,
  FormLabel,
  Switch,
  Select,
  Avatar,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Flex,
  Spacer,
  IconButton,
} from "@chakra-ui/react";
import { useState } from "react";
import { Smartphone, Monitor, Edit, Save, X, Eye, EyeOff } from "lucide-react";

const mockAdminData = {
  id: 1,
  name: "John Anderson",
  email: "john.anderson@schoolmanager.com",
  phone: "+1 (555) 123-4567",
  address: "123 Admin Street, Springfield, IL 62701",
  role: "Super Administrator",
  joinDate: "2022-03-15",
  lastLogin: "2024-01-30 14:30:00",
  avatar: null,
  timezone: "America/Chicago",
  language: "English",
  theme: "light",
};

const mockLoginHistory = [
  {
    id: 1,
    date: "2024-01-30 14:30:00",
    device: "Chrome on Windows",
    location: "Springfield, IL",
    status: "Success",
  },
  {
    id: 2,
    date: "2024-01-30 09:15:00",
    device: "Safari on iPhone",
    location: "Springfield, IL",
    status: "Success",
  },
  {
    id: 3,
    date: "2024-01-29 16:45:00",
    device: "Chrome on Windows",
    location: "Springfield, IL",
    status: "Success",
  },
  {
    id: 4,
    date: "2024-01-29 08:20:00",
    device: "Firefox on Windows",
    location: "Chicago, IL",
    status: "Failed",
  },
  {
    id: 5,
    date: "2024-01-28 13:10:00",
    device: "Chrome on Windows",
    location: "Springfield, IL",
    status: "Success",
  },
];

const mockNotificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  weeklyReports: true,
  systemAlerts: true,
  subscriptionAlerts: true,
  userActivityAlerts: false,
  securityAlerts: true,
};

export default function ProfileSettings() {
  const [adminData, setAdminData] = useState(mockAdminData);
  const [notificationSettings, setNotificationSettings] = useState(
    mockNotificationSettings
  );
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSaveProfile = () => {
    // Mock save functionality
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been successfully updated.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation don't match.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Mock password change
    setPasswords({ current: "", new: "", confirm: "" });
    toast({
      title: "Password Changed",
      description: "Your password has been successfully updated.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleNotificationChange = (setting, value) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));

    toast({
      title: "Settings Updated",
      description: "Notification preferences have been saved.",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast({
      title: twoFactorEnabled ? "2FA Disabled" : "2FA Enabled",
      description: twoFactorEnabled
        ? "Two-factor authentication has been disabled."
        : "Two-factor authentication has been enabled.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Flex>
        <Box>
          <Text fontSize="2xl" fontWeight="bold">
            Profile & Settings
          </Text>
          <Text color="gray.600">
            Manage your account and system preferences
          </Text>
        </Box>
        <Spacer />
        <HStack>
          <Badge colorScheme="blue" p={2}>
            {adminData.role}
          </Badge>
        </HStack>
      </Flex>

      <Tabs>
        <TabList>
          <Tab>Profile Information</Tab>
          <Tab>Account Security</Tab>
          <Tab>Notifications</Tab>
          <Tab>System Preferences</Tab>
          <Tab>Activity Log</Tab>
        </TabList>

        <TabPanels>
          {/* Profile Information */}
          <TabPanel px={0}>
            <Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap={6}>
              {/* Profile Picture & Basic Info */}
              <Card>
                <CardBody>
                  <VStack spacing={4}>
                    <Avatar size="2xl" name={adminData.name} />
                    <Button size="sm" variant="outline">
                      Change Photo
                    </Button>
                    <VStack spacing={2} textAlign="center">
                      <Text fontSize="xl" fontWeight="bold">
                        {adminData.name}
                      </Text>
                      <Text color="gray.600">{adminData.email}</Text>
                      <Badge colorScheme="green">{adminData.role}</Badge>
                    </VStack>
                    <Divider />
                    <VStack spacing={2} w="full">
                      <HStack w="full">
                        <Text fontSize="sm" color="gray.500">
                          Member since:
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {adminData.joinDate}
                        </Text>
                      </HStack>
                      <HStack w="full">
                        <Text fontSize="sm" color="gray.500">
                          Last login:
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {adminData.lastLogin}
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Editable Profile Details */}
              <Card>
                <CardBody>
                  <Flex mb={4}>
                    <Text fontSize="lg" fontWeight="semibold">
                      Personal Information
                    </Text>
                    <Spacer />
                    <Button
                      size="sm"
                      leftIcon={isEditing ? <Save /> : <Edit />}
                      colorScheme={isEditing ? "green" : "blue"}
                      onClick={
                        isEditing ? handleSaveProfile : () => setIsEditing(true)
                      }
                    >
                      {isEditing ? "Save Changes" : "Edit Profile"}
                    </Button>
                    {isEditing && (
                      <IconButton
                        size="sm"
                        icon={<X />}
                        variant="ghost"
                        ml={2}
                        onClick={() => setIsEditing(false)}
                      />
                    )}
                  </Flex>

                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Full Name</FormLabel>
                      <Input
                        value={adminData.name}
                        onChange={(e) =>
                          setAdminData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        isReadOnly={!isEditing}
                        bg={isEditing ? "white" : "gray.50"}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Email Address</FormLabel>
                      <Input
                        value={adminData.email}
                        onChange={(e) =>
                          setAdminData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        isReadOnly={!isEditing}
                        bg={isEditing ? "white" : "gray.50"}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Phone Number</FormLabel>
                      <Input
                        value={adminData.phone}
                        onChange={(e) =>
                          setAdminData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        isReadOnly={!isEditing}
                        bg={isEditing ? "white" : "gray.50"}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Address</FormLabel>
                      <Input
                        value={adminData.address}
                        onChange={(e) =>
                          setAdminData((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        isReadOnly={!isEditing}
                        bg={isEditing ? "white" : "gray.50"}
                      />
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
            </Grid>
          </TabPanel>

          {/* Account Security */}
          <TabPanel px={0}>
            <VStack spacing={6}>
              {/* Password Change */}
              <Card w="full">
                <CardBody>
                  <Text fontSize="lg" fontWeight="semibold" mb={4}>
                    Change Password
                  </Text>
                  <Grid
                    templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }}
                    gap={4}
                  >
                    <FormControl>
                      <FormLabel>Current Password</FormLabel>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={passwords.current}
                        onChange={(e) =>
                          setPasswords((prev) => ({
                            ...prev,
                            current: e.target.value,
                          }))
                        }
                        placeholder="Enter current password"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>New Password</FormLabel>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={passwords.new}
                        onChange={(e) =>
                          setPasswords((prev) => ({
                            ...prev,
                            new: e.target.value,
                          }))
                        }
                        placeholder="Enter new password"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Confirm Password</FormLabel>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={passwords.confirm}
                        onChange={(e) =>
                          setPasswords((prev) => ({
                            ...prev,
                            confirm: e.target.value,
                          }))
                        }
                        placeholder="Confirm new password"
                      />
                    </FormControl>
                  </Grid>
                  <HStack mt={4}>
                    <Button
                      leftIcon={showPassword ? <EyeOff /> : <Eye />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"} Passwords
                    </Button>
                    <Spacer />
                    <Button colorScheme="blue" onClick={handlePasswordChange}>
                      Update Password
                    </Button>
                  </HStack>
                </CardBody>
              </Card>

              {/* Two-Factor Authentication */}
              <Card w="full">
                <CardBody>
                  <Flex align="center" mb={4}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="lg" fontWeight="semibold">
                        Two-Factor Authentication
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Add an extra layer of security to your account
                      </Text>
                    </VStack>
                    <Spacer />
                    <Switch
                      size="lg"
                      isChecked={twoFactorEnabled}
                      onChange={handleToggle2FA}
                      colorScheme="green"
                    />
                  </Flex>

                  {twoFactorEnabled && (
                    <Alert status="success" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>2FA is enabled!</AlertTitle>
                        <AlertDescription>
                          Your account is protected with two-factor
                          authentication.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}

                  {!twoFactorEnabled && (
                    <Alert status="warning" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>2FA is disabled</AlertTitle>
                        <AlertDescription>
                          Enable two-factor authentication to secure your
                          account.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}
                </CardBody>
              </Card>

              {/* Active Sessions */}
              <Card w="full">
                <CardBody>
                  <Text fontSize="lg" fontWeight="semibold" mb={4}>
                    Active Sessions
                  </Text>
                  <VStack spacing={3}>
                    <Box
                      w="full"
                      p={3}
                      bg="green.50"
                      borderRadius="md"
                      borderLeft="4px"
                      borderColor="green.500"
                    >
                      <HStack>
                        <Monitor
                          size={20}
                          color="var(--chakra-colors-green-500)"
                        />
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontSize="sm" fontWeight="medium">
                            Current Session
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            Chrome on Windows • Springfield, IL
                          </Text>
                        </VStack>
                        <Badge colorScheme="green">Active</Badge>
                      </HStack>
                    </Box>
                    <Box w="full" p={3} bg="gray.50" borderRadius="md">
                      <HStack>
                        <Smartphone
                          size={20}
                          color="var(--chakra-colors-gray-500)"
                        />
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontSize="sm" fontWeight="medium">
                            Mobile Session
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            Safari on iPhone • Last seen 2 hours ago
                          </Text>
                        </VStack>
                        <Button size="xs" colorScheme="red" variant="outline">
                          Revoke
                        </Button>
                      </HStack>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Notifications */}
          <TabPanel px={0}>
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
              <Card>
                <CardBody>
                  <Text fontSize="lg" fontWeight="semibold" mb={4}>
                    Communication Preferences
                  </Text>
                  <VStack spacing={4}>
                    <HStack w="full" justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          Email Notifications
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          Receive updates via email
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={notificationSettings.emailNotifications}
                        onChange={(e) =>
                          handleNotificationChange(
                            "emailNotifications",
                            e.target.checked
                          )
                        }
                      />
                    </HStack>

                    <HStack w="full" justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          SMS Notifications
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          Receive alerts via text message
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={notificationSettings.smsNotifications}
                        onChange={(e) =>
                          handleNotificationChange(
                            "smsNotifications",
                            e.target.checked
                          )
                        }
                      />
                    </HStack>

                    <HStack w="full" justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          Push Notifications
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          Browser push notifications
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={notificationSettings.pushNotifications}
                        onChange={(e) =>
                          handleNotificationChange(
                            "pushNotifications",
                            e.target.checked
                          )
                        }
                      />
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Text fontSize="lg" fontWeight="semibold" mb={4}>
                    Alert Preferences
                  </Text>
                  <VStack spacing={4}>
                    <HStack w="full" justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          Weekly Reports
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          System usage summaries
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={notificationSettings.weeklyReports}
                        onChange={(e) =>
                          handleNotificationChange(
                            "weeklyReports",
                            e.target.checked
                          )
                        }
                      />
                    </HStack>

                    <HStack w="full" justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          System Alerts
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          Critical system notifications
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={notificationSettings.systemAlerts}
                        onChange={(e) =>
                          handleNotificationChange(
                            "systemAlerts",
                            e.target.checked
                          )
                        }
                      />
                    </HStack>

                    <HStack w="full" justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          Subscription Alerts
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          Payment and renewal reminders
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={notificationSettings.subscriptionAlerts}
                        onChange={(e) =>
                          handleNotificationChange(
                            "subscriptionAlerts",
                            e.target.checked
                          )
                        }
                      />
                    </HStack>

                    <HStack w="full" justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          User Activity Alerts
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          New user registrations and activity
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={notificationSettings.userActivityAlerts}
                        onChange={(e) =>
                          handleNotificationChange(
                            "userActivityAlerts",
                            e.target.checked
                          )
                        }
                      />
                    </HStack>

                    <HStack w="full" justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          Security Alerts
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          Login attempts and security events
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={notificationSettings.securityAlerts}
                        onChange={(e) =>
                          handleNotificationChange(
                            "securityAlerts",
                            e.target.checked
                          )
                        }
                      />
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </Grid>
          </TabPanel>

          {/* System Preferences */}
          <TabPanel px={0}>
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
              <Card>
                <CardBody>
                  <Text fontSize="lg" fontWeight="semibold" mb={4}>
                    Display & Language
                  </Text>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Theme</FormLabel>
                      <Select
                        value={adminData.theme}
                        onChange={(e) =>
                          setAdminData((prev) => ({
                            ...prev,
                            theme: e.target.value,
                          }))
                        }
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto (System)</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Language</FormLabel>
                      <Select
                        value={adminData.language}
                        onChange={(e) =>
                          setAdminData((prev) => ({
                            ...prev,
                            language: e.target.value,
                          }))
                        }
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Timezone</FormLabel>
                      <Select
                        value={adminData.timezone}
                        onChange={(e) =>
                          setAdminData((prev) => ({
                            ...prev,
                            timezone: e.target.value,
                          }))
                        }
                      >
                        <option value="America/Chicago">
                          Central Time (CT)
                        </option>
                        <option value="America/New_York">
                          Eastern Time (ET)
                        </option>
                        <option value="America/Denver">
                          Mountain Time (MT)
                        </option>
                        <option value="America/Los_Angeles">
                          Pacific Time (PT)
                        </option>
                      </Select>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Text fontSize="lg" fontWeight="semibold" mb={4}>
                    System Settings
                  </Text>
                  <VStack spacing={4}>
                    <HStack w="full" justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          Auto-save Changes
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          Automatically save form changes
                        </Text>
                      </VStack>
                      <Switch defaultChecked />
                    </HStack>

                    <HStack w="full" justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          Compact View
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          Show more data in tables
                        </Text>
                      </VStack>
                      <Switch />
                    </HStack>

                    <HStack w="full" justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          Advanced Features
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          Enable experimental features
                        </Text>
                      </VStack>
                      <Switch />
                    </HStack>

                    <Divider />

                    <FormControl>
                      <FormLabel>Session Timeout</FormLabel>
                      <Select defaultValue="30">
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                        <option value="0">Never</option>
                      </Select>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
            </Grid>
          </TabPanel>

          {/* Activity Log */}
          <TabPanel px={0}>
            <Card>
              <CardBody>
                <Flex mb={4}>
                  <Text fontSize="lg" fontWeight="semibold">
                    Login History
                  </Text>
                  <Spacer />
                  <Button size="sm" variant="outline" onClick={onOpen}>
                    View All Activity
                  </Button>
                </Flex>

                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Date & Time</Th>
                        <Th>Device & Browser</Th>
                        <Th>Location</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {mockLoginHistory.map((login) => (
                        <Tr key={login.id}>
                          <Td>
                            <Text fontSize="sm">{login.date}</Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm">{login.device}</Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm">{login.location}</Text>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={
                                login.status === "Success" ? "green" : "red"
                              }
                            >
                              {login.status}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Activity Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Complete Activity Log</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color="gray.600" mb={4}>
              Showing all account activity for the last 30 days
            </Text>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Date & Time</Th>
                    <Th>Activity</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {mockLoginHistory.map((login) => (
                    <Tr key={login.id}>
                      <Td>{login.date}</Td>
                      <Td>
                        Login from {login.device} in {login.location}
                      </Td>
                      <Td>
                        <Badge
                          size="sm"
                          colorScheme={
                            login.status === "Success" ? "green" : "red"
                          }
                        >
                          {login.status}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
