import { Grid, Box, VStack, Text, Icon, useColorModeValue } from "@chakra-ui/react"
import { FiUsers, FiMapPin, FiLock, FiCalendar, FiSettings, FiDownload } from "react-icons/fi"

const quickActions = [
  {
    title: "Add New User",
    description: "Create student or staff account",
    icon: FiUsers,
    action: "add-user",
  },
  {
    title: "Manage Parking",
    description: "Update parking zones",
    icon: FiMapPin,
    action: "manage-parking",
  },
  {
    title: "Locker Assignment",
    description: "Assign or revoke lockers",
    icon: FiLock,
    action: "manage-lockers",
  },
  {
    title: "Generate Report",
    description: "Export usage analytics",
    icon: FiDownload,
    action: "generate-report",
  },
  {
    title: "Update Calendar",
    description: "Modify academic schedule",
    icon: FiCalendar,
    action: "update-calendar",
  },
  {
    title: "System Settings",
    description: "Configure system parameters",
    icon: FiSettings,
    action: "system-settings",
  },
]

export function QuickActions() {
  const hoverBg = useColorModeValue("gray.50", "gray.700")

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={3}>
      {quickActions.map((action) => (
        <Box
          key={action.action}
          p={4}
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
          cursor="pointer"
          _hover={{ bg: hoverBg }}
          transition="background-color 0.2s"
        >
          <VStack align="start" spacing={2}>
            <Icon as={action.icon} boxSize={4} color="campus.primary" />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" fontWeight="medium">
                {action.title}
              </Text>
              <Text fontSize="xs" color="gray.600">
                {action.description}
              </Text>
            </VStack>
          </VStack>
        </Box>
      ))}
    </Grid>
  )
}
