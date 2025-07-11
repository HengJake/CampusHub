import { VStack, HStack, Avatar, Text, Box } from "@chakra-ui/react"
import { mockData } from "../../store/TBI/mockData"

export function RecentActivity() {
  return (
    <VStack spacing={4} align="stretch">
      {mockData.recentActivity.map((activity) => (
        <HStack key={activity.id} spacing={3}>
          <Avatar size="sm" name={activity.user} />
          <Box flex="1">
            <Text fontSize="sm" fontWeight="medium">
              {activity.user}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {activity.action}
            </Text>
          </Box>
          <Text fontSize="xs" color="gray.500">
            {activity.time}
          </Text>
        </HStack>
      ))}
    </VStack>
  )
}
