import { Box, Text, useColorModeValue } from "@chakra-ui/react"

export function Reports() {
  const bgColor = useColorModeValue("white", "gray.800")

  return (
    <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
      <Text fontSize="lg" fontWeight="semibold" mb={4}>
        Reports & Analytics
      </Text>
      <Text color="gray.600">Comprehensive reporting dashboard coming soon...</Text>
    </Box>
  )
}
