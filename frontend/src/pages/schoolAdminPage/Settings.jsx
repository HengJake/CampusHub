import { Box, Text, useColorModeValue } from "@chakra-ui/react"

export function Settings() {
  const bgColor = useColorModeValue("white", "gray.800")

  return (
    <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
      <Text fontSize="lg" fontWeight="semibold" mb={4}>
        System Settings
      </Text>
      <Text color="gray.600">System configuration options coming soon...</Text>
    </Box>
  )
}
