// Programmer Name : Choy Chi Lam, Frontend Developer
// Program Name: service.jsx
// Description: Service overview page component showcasing CampusHub service offerings, features, and service categories
// First Written on: June 26, 2024
// Edited on: Friday, July 31, 2024

import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Button,
  Icon,
  List,
  ListItem,
  Flex,
  Stack,
} from "@chakra-ui/react";
import {
  FiCalendar,
  FiMapPin,
  FiTruck,
  FiBookOpen,
  FiArrowRight,
  FiNavigation,
} from "react-icons/fi";

const service = () => {
  const services = [
    {
      icon: FiCalendar,
      title: "Facility Booking",
      description: "Reserve classrooms, labs, and study spaces with real-time availability and instant confirmation.",
      features: ["Real-time availability", "Instant confirmation", "Recurring bookings"]
    },
    {
      icon: FiNavigation,
      title: "Real-Time Parking",
      description: "Find and reserve parking spots across campus with live updates and navigation assistance.",
      features: ["Live parking status", "Spot reservation", "Navigation integration"]
    },
    {
      icon: FiMapPin,
      title: "Campus Navigation",
      description: "Interactive campus maps with turn-by-turn directions and accessibility information.",
      features: ["Interactive maps", "Accessibility routes", "Building information"]
    },
    {
      icon: FiTruck,
      title: "Transportation Schedule",
      description: "Track campus shuttles and public transport with real-time arrival predictions.",
      features: ["Real-time tracking", "Route planning", "Delay notifications"]
    },
    {
      icon: FiBookOpen,
      title: "Academic Resources",
      description: "Access library services, course materials, and academic support tools in one place.",
      features: ["Digital library", "Course materials", "Academic support"]
    }
  ];

  return (
    <Box as="section" id="services" px={20}>
      <Box maxW="container.xl" mx="auto">
        <Stack spacing={16}>
          <Stack spacing={4} textAlign="center">
            <Heading size="xl" color="gray.800">
              Comprehensive Campus Services
            </Heading>
            <Text
              fontSize="lg"
              color="gray.600"
              maxW="2xl"
              mx="auto"
            >
              Everything you need for a seamless campus experience,
              accessible from anywhere, anytime.
            </Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8} w="full">
            {services.map((service, index) => (
              <Box
                key={index}
                bg="white"
                borderRadius="xl"
                p={6}
                boxShadow="sm"
                border="1px"
                borderColor="gray.200"
                _hover={{
                  boxShadow: "md",
                  transform: "translateY(-2px)"
                }}
                transition="all 0.3s"
                role="group"
              >
                <Icon
                  as={service.icon}
                  boxSize={8}
                  color="brand.500"
                  mb={4}
                  _groupHover={{ transform: "scale(1.1)" }}
                  transition="transform 0.3s"
                />

                <Heading size="lg" color="gray.800" mb={3}>
                  {service.title}
                </Heading>

                <Text color="gray.600" mb={4} lineHeight="relaxed">
                  {service.description}
                </Text>

                <Stack spacing={2} mb={6}>
                  {service.features.map((feature, featureIndex) => (
                    <HStack key={featureIndex} spacing={2}>
                      <Box w="1.5" h="1.5" bg="brand.500" borderRadius="full" />
                      <Text fontSize="sm" color="gray.600">
                        {feature}
                      </Text>
                    </HStack>
                  ))}
                </Stack>

                <Button
                  variant="outline"
                  size="sm"
                  colorScheme="brand"
                  _hover={{ transform: "translateX(2px)" }}
                  transition="transform 0.2s"
                >
                  Learn More <Box as={FiArrowRight} ml={2} />
                </Button>
              </Box>
            ))}
          </SimpleGrid>

          {/* Call to action */}
          <Box w="full">
            <Box
              bgGradient="linear(135deg, brand.500, brand.600)"
              borderRadius="2xl"
              p={{ base: 8, md: 12 }}
              color="black"
              textAlign="center"
            >
              <Heading size="lg" mb={4}>
                Ready to Transform Your Campus Experience?
              </Heading>
              <Text fontSize="lg" opacity={0.9} mb={6} maxW="2xl" mx="auto">
                Join thousands of students and staff who are already enjoying
                a smarter, more connected campus life.
              </Text>
              <Button
                size="lg"
                bg="white"
                color="brand.500"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "lg"
                }}
                transition="all 0.2s"
              >
                Get Started Today <Box as={FiArrowRight} ml={2} />
              </Button>
            </Box>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default service;