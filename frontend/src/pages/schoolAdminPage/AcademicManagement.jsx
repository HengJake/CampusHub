import { Grid, Box, Text, Button, Badge, VStack, HStack, useColorModeValue } from "@chakra-ui/react"

export function AcademicManagement() {
  const bgColor = useColorModeValue("white", "gray.800")

  return (
    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
      <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
        <VStack align="start" spacing={4}>
          <Box>
            <Text fontSize="lg" fontWeight="semibold" mb={1}>
              Academic Calendar
            </Text>
            <Text fontSize="sm" color="gray.600">
              Manage semester dates and examination periods
            </Text>
          </Box>

          <VStack spacing={3} w="full">
            <HStack justify="space-between" w="full">
              <Text fontSize="sm">Fall Semester 2024</Text>
              <Badge colorScheme="green">Active</Badge>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontSize="sm">Final Exams</Text>
              <Badge variant="outline">Dec 15-22</Badge>
            </HStack>
          </VStack>

          <Button colorScheme="brand" w="full">
            Manage Calendar
          </Button>
        </VStack>
      </Box>

      <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
        <VStack align="start" spacing={4}>
          <Box>
            <Text fontSize="lg" fontWeight="semibold" mb={1}>
              Attendance Overview
            </Text>
            <Text fontSize="sm" color="gray.600">
              Student attendance rates across departments
            </Text>
          </Box>

          <VStack spacing={3} w="full">
            <HStack justify="space-between" w="full">
              <Text fontSize="sm">Computer Science</Text>
              <Text fontSize="sm" fontWeight="medium">
                94%
              </Text>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontSize="sm">Business Administration</Text>
              <Text fontSize="sm" fontWeight="medium">
                91%
              </Text>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontSize="sm">Engineering</Text>
              <Text fontSize="sm" fontWeight="medium">
                89%
              </Text>
            </HStack>
          </VStack>

          <Button colorScheme="brand" w="full">
            View Details
          </Button>
        </VStack>
      </Box>
    </Grid>
  )
}
