import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Image,
  SimpleGrid,
  useBreakpointValue,
  Stack,
} from "@chakra-ui/react";
import { FiArrowRight, FiPlay } from "react-icons/fi";
import heroImage from "../../../../dist/Campus.jpg";

const landing = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false });

  return (
    <Box as="section" flex={1} id="home" overflow="hidden" position="relative" px={20}>
      {/* Background gradient */}
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(135deg, brand.500, brand.600)"
        opacity={0.05}
      />

      <Box maxW="container.xl" mx="auto" px={4}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={12} alignItems="center">
          {/* Text Content */}
          <Stack spacing={6} align="start">
            <Heading
              size={{ base: "2xl", md: "3xl", lg: "4xl" }}
              color="gray.800"
              lineHeight="tight"
            >
              Smart Campus Life,{" "}
              <Text as="span" color="brand.500">
                Simplified
              </Text>
            </Heading>

            <Text
              fontSize={{ base: "lg", md: "xl" }}
              color="gray.600"
              lineHeight="relaxed"
            >
              An integrated platform for students and staff to manage parking,
              bookings, transport, and academic resources all in one place.
            </Text>

            <Stack direction={{ base: "column", sm: "row" }} spacing={4} pt={6}>
              <Button
                size="lg"
                colorScheme="brand"
                _hover={{ transform: "translateY(-2px)" }}
                transition="all 0.2s"
              >
                Get Started <Box as={FiArrowRight} ml={2} />
              </Button>
              <Button
                variant="outline"
                size="lg"
                colorScheme="brand"
              >
                <Box as={FiPlay} mr={2} /> Learn More
              </Button>
            </Stack>

            {/* Stats */}
            <Stack direction={{ base: "column", sm: "row" }} spacing={8} pt={8}>
              <Stack spacing={1} align="center">
                <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                  50K+
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Active Students
                </Text>
              </Stack>
              <Stack spacing={1} align="center">
                <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                  200+
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Universities
                </Text>
              </Stack>
              <Stack spacing={1} align="center">
                <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                  99.9%
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Uptime
                </Text>
              </Stack>
            </Stack>
          </Stack>

          {/* Hero Image */}
          <Box position="relative">
            <Box
              position="relative"
              borderRadius="2xl"
              overflow="hidden"
              boxShadow="xl"
            >
              <Image
                src={heroImage}
                alt="Students using CampusHub platform"
                w="full"
                h="auto"
                objectFit="cover"
              />
            </Box>

            {/* Floating elements */}
            <Box
              position="absolute"
              top={-4}
              right={-4}
              bg="white"
              borderRadius="xl"
              p={4}
              boxShadow="lg"
              border="1px"
              borderColor="gray.200"
            >
              <Text fontSize="sm" fontWeight="medium" color="gray.800">
                Live Updates
              </Text>
              <Text fontSize="xs" color="gray.600">
                Real-time notifications
              </Text>
            </Box>

            <Box
              position="absolute"
              bottom={-4}
              left={-4}
              bg="white"
              borderRadius="xl"
              p={4}
              boxShadow="lg"
              border="1px"
              borderColor="gray.200"
            >
              <Text fontSize="sm" fontWeight="medium" color="gray.800">
                Smart Integration
              </Text>
              <Text fontSize="xs" color="gray.600">
                All services connected
              </Text>
            </Box>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default landing;