import { Box, Text, HStack, Icon, Progress, useColorModeValue } from "@chakra-ui/react"

export function KPICard({ title, value, change, changeType, icon, subtitle, showProgress = false, progressValue = 0 }) {
  const bgColor = useColorModeValue("white", "gray.800")
  const changeColor = changeType === "positive" ? "campus.success" : "campus.error"

  return (
    <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
      <HStack justify="space-between" mb={4}>
        <Text fontSize="sm" fontWeight="medium" color="gray.600">
          {title}
        </Text>
        <Icon as={icon} boxSize={4} color="gray.400" />
      </HStack>

      <Text fontSize="2xl" fontWeight="bold" mb={2}>
        {value}
      </Text>

      {showProgress && <Progress value={progressValue} colorScheme="brand" size="sm" mb={2} />}

      <Text fontSize="xs" color="gray.500">
        {change && (
          <Text as="span" color={changeColor} fontWeight="medium">
            {change}
          </Text>
        )}
        {change && " "}
        {subtitle}
      </Text>
    </Box>
  )
}
