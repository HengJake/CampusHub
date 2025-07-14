import {
  Box,
  Card,
  CardBody,
  Text,
  VStack,
  HStack,
  Switch,
  Button,
  Input,
  Select,
  FormControl,
  FormLabel,
  Divider,
  useToast,
  useColorModeValue,
  Grid,
  Badge,
  Progress,
} from "@chakra-ui/react"
import { FiSave, FiDownload, FiUpload, FiShield, FiBell, FiDatabase } from "react-icons/fi"
import { useState } from "react"


export function AdminSetting() {

  const toast = useToast()
  const [settings, setSettings] = useState(systemSettings)

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  const handleSave = () => {
    updateSystemSettings(settings)
    toast({
      title: "Settings Saved",
      description: "System settings have been updated successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    })
  }

  const handleBackup = () => {
    toast({
      title: "Backup Started",
      description: "System backup is in progress",
      status: "info",
      duration: 3000,
      isClosable: true,
    })
  }

  const handleRestore = () => {
    toast({
      title: "Restore Initiated",
      description: "System restore process has started",
      status: "warning",
      duration: 3000,
      isClosable: true,
    })
  }

  return (
    <Box p={6} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="#333333">
            System Settings
          </Text>
          <Text color="gray.600">Configure system preferences and security settings</Text>
        </Box>

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
          {/* Main Settings */}
          <VStack spacing={6}>
            {/* General Settings */}
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
              <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
                  General Settings
                </Text>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="medium">Maintenance Mode</Text>
                      <Text fontSize="sm" color="gray.600">
                        Enable maintenance mode to restrict access
                      </Text>
                    </Box>
                    <Switch
                      isChecked={settings.maintenanceMode}
                      onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                      colorScheme="green"
                    />
                  </HStack>

                  <Divider />

                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="medium">Allow New Registrations</Text>
                      <Text fontSize="sm" color="gray.600">
                        Allow new students to register accounts
                      </Text>
                    </Box>
                    <Switch
                      isChecked={settings.allowRegistrations}
                      onChange={(e) => setSettings({ ...settings, allowRegistrations: e.target.checked })}
                      colorScheme="green"
                    />
                  </HStack>

                  <Divider />

                  <FormControl>
                    <FormLabel>Maximum Booking Duration (hours)</FormLabel>
                    <Select
                      value={settings.maxBookingDuration}
                      onChange={(e) =>
                        setSettings({ ...settings, maxBookingDuration: Number.parseInt(e.target.value) })
                      }
                    >
                      <option value={1}>1 hour</option>
                      <option value={2}>2 hours</option>
                      <option value={3}>3 hours</option>
                      <option value={4}>4 hours</option>
                      <option value={6}>6 hours</option>
                      <option value={8}>8 hours</option>
                    </Select>
                  </FormControl>

                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="medium">Auto-approve Bookings</Text>
                      <Text fontSize="sm" color="gray.600">
                        Automatically approve facility bookings
                      </Text>
                    </Box>
                    <Switch
                      isChecked={settings.autoApproveBookings}
                      onChange={(e) => setSettings({ ...settings, autoApproveBookings: e.target.checked })}
                      colorScheme="green"
                    />
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Notification Settings */}
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
              <CardBody>
                <HStack mb={4}>
                  <FiBell color="#344E41" />
                  <Text fontSize="lg" fontWeight="semibold" color="#333333">
                    Notification Settings
                  </Text>
                </HStack>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="medium">Email Notifications</Text>
                      <Text fontSize="sm" color="gray.600">
                        Send email notifications for important events
                      </Text>
                    </Box>
                    <Switch
                      isChecked={settings.emailNotifications}
                      onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                      colorScheme="green"
                    />
                  </HStack>

                  <FormControl>
                    <FormLabel>Notification Frequency</FormLabel>
                    <Select defaultValue="immediate">
                      <option value="immediate">Immediate</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Admin Email</FormLabel>
                    <Input type="email" defaultValue="admin@campushub.edu" />
                  </FormControl>
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
                  <FormControl>
                    <FormLabel>Session Timeout (minutes)</FormLabel>
                    <Select defaultValue="30">
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Password Policy</FormLabel>
                    <Select defaultValue="medium">
                      <option value="low">Low (6+ characters)</option>
                      <option value="medium">Medium (8+ chars, mixed case)</option>
                      <option value="high">High (12+ chars, symbols required)</option>
                    </Select>
                  </FormControl>

                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="medium">Two-Factor Authentication</Text>
                      <Text fontSize="sm" color="gray.600">
                        Require 2FA for admin accounts
                      </Text>
                    </Box>
                    <Switch colorScheme="green" />
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>

          {/* Sidebar */}
          <VStack spacing={6}>
            {/* System Status */}
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
              <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
                  System Status
                </Text>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm">System Health</Text>
                    <Badge colorScheme="green">Excellent</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Database</Text>
                    <Badge colorScheme="green">Online</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Storage Usage</Text>
                    <Text fontSize="sm">67%</Text>
                  </HStack>
                  <Progress value={67} colorScheme="green" size="sm" />
                  <HStack justify="space-between">
                    <Text fontSize="sm">Last Backup</Text>
                    <Text fontSize="sm">2 hours ago</Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Quick Actions */}
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
              <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
                  Quick Actions
                </Text>
                <VStack spacing={3}>
                  <Button
                    leftIcon={<FiSave />}
                    bg="#344E41"
                    color="white"
                    _hover={{ bg: "#2a3d33" }}
                    w="full"
                    onClick={handleSave}
                  >
                    Save Settings
                  </Button>
                  <Button leftIcon={<FiDownload />} variant="outline" w="full" onClick={handleBackup}>
                    Create Backup
                  </Button>
                  <Button leftIcon={<FiUpload />} variant="outline" w="full" onClick={handleRestore}>
                    Restore System
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* Database Info */}
            <Card bg={bgColor} borderColor={borderColor} borderWidth="1px" w="full">
              <CardBody>
                <HStack mb={4}>
                  <FiDatabase color="#344E41" />
                  <Text fontSize="lg" fontWeight="semibold" color="#333333">
                    Database Info
                  </Text>
                </HStack>
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm">Total Records</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      15,847
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Students</Text>
                    <Text fontSize="sm">2,847</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Bookings</Text>
                    <Text fontSize="sm">8,234</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Facilities</Text>
                    <Text fontSize="sm">45</Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Grid>
      </VStack>
    </Box>
  )
}
