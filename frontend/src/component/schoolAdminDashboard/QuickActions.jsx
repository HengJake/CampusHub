import { Grid, Box, VStack, Text, Icon, useColorModeValue } from "@chakra-ui/react"
import { FiUsers, FiLock, FiCalendar, FiBarChart2, FiMapPin } from "react-icons/fi"
import { useNavigate } from "react-router-dom"

const quickActions = [
  {
    title: "Add New User",
    description: "Create student or staff account",
    icon: FiUsers,
    action: "add-user",
  },
  {
    title: "Result Management",
    description: "Manage student results and grades",
    icon: FiBarChart2,
    action: "result-management",
    path: "/admin/results",
  },
  {
    title: "Locker Assignment",
    description: "Assign or revoke lockers",
    icon: FiLock,
    action: "manage-lockers",
  },
  {
    title: "Facility Management",
    description: "Manage campus facilities and resources",
    icon: FiMapPin,
    action: "facility-management",
    path: "/facility-management",
  },
  {
    title: "Update Calendar",
    description: "Modify academic schedule",
    icon: FiCalendar,
    action: "update-calendar",
  },
]

export function QuickActions() {
  const hoverBg = useColorModeValue("gray.50", "gray.700")
  const navigate = useNavigate()

  const handleActionClick = (action) => {
    if (action.path) {
      navigate(action.path)
    }
  }
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
          onClick={() => handleActionClick(action)}
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
