import {
  Box,
  Text,
  HStack,
  Icon,
  Progress,
  useColorModeValue,
  Stat,
  StatNumber,
  StatHelpText,
  StatArrow,
} from "@chakra-ui/react"

export function EnhancedKPICard({
  title,
  value,
  change,
  changeType,
  icon,
  subtitle,
  showProgress = false,
  progressValue = 0,
  trend = null,
}) {
  const bgColor = useColorModeValue("white", "gray.800")
  const changeColor = changeType === "positive" ? "campus.success" : "campus.error"

  return (
    <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200" position="relative">
      <HStack justify="space-between" mb={4}>
        <Text fontSize="sm" fontWeight="medium" color="gray.600">
          {title}
        </Text>
        <Icon as={icon} boxSize={5} color="campus.primary" />
      </HStack>

      <Stat>
        <StatNumber fontSize="2xl" fontWeight="bold" mb={2}>
          {value}
        </StatNumber>

        {showProgress && <Progress value={progressValue} colorScheme="brand" size="sm" mb={2} borderRadius="full" />}

        <StatHelpText fontSize="xs" color="gray.500" mb={0}>
          {change && (
            <HStack spacing={1}>
              <StatArrow type={changeType === "positive" ? "increase" : "decrease"} />
              <Text color={changeColor} fontWeight="medium">
                {change}
              </Text>
            </HStack>
          )}
          <Text>{subtitle}</Text>
        </StatHelpText>
      </Stat>

      {trend && (
        <Box position="absolute" top={2} right={2}>
          <Text fontSize="xs" color="gray.400">
            {trend}
          </Text>
        </Box>
      )}
    </Box>
  )
}
