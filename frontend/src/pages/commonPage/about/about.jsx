// Programmer Name : Choy Chi Lam, Frontend Developer
// Program Name: about.jsx
// Description: About page component providing company information, mission statement, and team details for CampusHub
// First Written on: June 30, 2024
// Edited on: Friday, July 25, 2024

import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
  Flex,
  Stack,
} from "@chakra-ui/react";
import { FiCheckCircle, FiUsers, FiZap, FiBookOpen, FiShield } from "react-icons/fi";

const About = () => {
  const features = [
    {
      icon: FiZap,
      title: "Centralizes Administrative Tasks",
      description: "Streamline all campus operations in one unified platform for maximum efficiency."
    },
    {
      icon: FiUsers,
      title: "Reduces Resource Management Redundancy",
      description: "Eliminate duplicate processes and optimize resource allocation across departments."
    },
    {
      icon: FiBookOpen,
      title: "Enhances Learning Accessibility",
      description: "Make academic resources and services easily accessible to all students and staff."
    },
    {
      icon: FiShield,
      title: "Built for Students & Staff",
      description: "Designed with both student needs and administrative requirements in mind."
    }
  ];

  return (
    <Box as="section" id="about" flex={1} px={20}>
      <Box maxW="container.xl" mx="auto" px={4}>
        <Stack spacing={16}>
          <Stack spacing={4} textAlign="center">
            <Heading size="xl" color="gray.800">
              Why Choose CampusHub?
            </Heading>
            <Text
              fontSize="lg"
              color="gray.600"
              maxW="2xl"
              mx="auto"
            >
              Transform your campus experience with our comprehensive platform designed
              to simplify and enhance every aspect of university life.
            </Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={8} w="full">
            {features.map((feature, index) => (
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
                  as={feature.icon}
                  boxSize={6}
                  color="brand.500"
                  mb={4}
                  _groupHover={{ transform: "scale(1.1)" }}
                  transition="transform 0.3s"
                />
                <Heading size="md" color="gray.800" mb={3}>
                  {feature.title}
                </Heading>
                <Text color="gray.600" fontSize="sm" lineHeight="relaxed">
                  {feature.description}
                </Text>
              </Box>
            ))}
          </SimpleGrid>

          {/* Additional content */}
          <Box w="full">
            <Box
              bg="white"
              borderRadius="2xl"
              p={{ base: 8, md: 12 }}
              boxShadow="sm"
              border="1px"
              borderColor="gray.200"
              textAlign="center"
            >
              <HStack justify="center" mb={6}>
                <Icon as={FiCheckCircle} boxSize={8} color="green.500" />
                <Text fontSize="xl" fontWeight="semibold" color="gray.800">
                  Trusted by Leading Universities
                </Text>
              </HStack>
              <Text color="gray.600" maxW="3xl" mx="auto">
                Join hundreds of educational institutions that have already transformed
                their campus operations with CampusHub. Our platform has proven to
                increase operational efficiency by 40% and student satisfaction by 35%.
              </Text>
            </Box>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default About;