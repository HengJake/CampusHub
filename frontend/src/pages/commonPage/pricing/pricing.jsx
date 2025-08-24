// Programmer Name : Choy Chi Lam, Frontend Developer
// Program Name: pricing.jsx
// Description: Pricing page component displaying subscription plans, features comparison, and pricing tiers for CampusHub services
// First Written on: June 22, 2024
// Edited on: Friday, August 2, 2024

import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import { FaUserGear } from "react-icons/fa6";
import { BiSolidReport } from "react-icons/bi";
import { GiSatelliteCommunication } from "react-icons/gi";
import { MdOutlineSecurity } from "react-icons/md";
import { BsBuildingFillGear } from "react-icons/bs";
import { HiAcademicCap } from "react-icons/hi2";
import { Switch } from "@chakra-ui/react";
import { FaSquareCheck } from "react-icons/fa6";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

import {
  GridItem,
  ListItem,
  List,
  ListIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Grid,
  Stack,
  Input,
  Heading,
  Center,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Link as ChakraLink,
  useColorModeValue,
  Badge,
  Divider,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { color } from "framer-motion";

function pricing() {
  const navigate = useNavigate();
  const bgColor = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.800", "white");
  const mutedTextColor = useColorModeValue("gray.600", "gray.400");

  const handleGetStarted = () => {
    navigate("/signup");
  };

  return (
    <Box
      w="100%"
      bg={bgColor}
      px={20}
    >
      {/* Hero Section */}
      <Box textAlign="center" mb={20}>
        <Heading
          fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }}
          fontWeight="bold"
          color={textColor}
          lineHeight="1.2"
          mb={6}
        >
          All your campus operations. <br />
          <Box as="span" color="blue.500">Powered by one platform.</Box>
        </Heading>
        <Text fontSize="xl" color={mutedTextColor} maxW="2xl" mx="auto">
          Choose the perfect plan for your educational institution
        </Text>
      </Box>

      {/* Pricing Cards */}
      <Box maxW="7xl" mx="auto" px={4}>
        <Grid
          templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }}
          gap={8}
          mb={20}
        >
          {/* Basic Plan */}
          <Box
            bg={cardBg}
            border="1px"
            borderColor={borderColor}
            borderRadius="2xl"
            p={8}
            textAlign="center"
            transition="all 0.3s"
            _hover={{
              transform: "translateY(-8px)",
              boxShadow: "xl",
              borderColor: "blue.300"
            }}
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="4px"
              bg="linear-gradient(90deg, #3182CE, #63B3ED)"
            />
            <Heading fontSize="2xl" mb={4} color={textColor}>Basic</Heading>
            <Box mb={6}>
              <Text fontSize="4xl" fontWeight="bold" color="green.500">$49</Text>
              <Text fontSize="sm" color={mutedTextColor} mt={2}>
                Small Schools & Academies
              </Text>
            </Box>

            <Button
              w="100%"
              size="lg"
              variant="outline"
              borderColor={borderColor}
              color={textColor}
              _hover={{
                bg: "green.50",
                borderColor: "green.300",
                color: "green.600"
              }}
              mb={8}
              onClick={handleGetStarted}
            >
              Get Started
            </Button>

            <Stack spacing={4} align="start">
              <Badge colorScheme="blue" mb={3}>🎓 Student Features</Badge>
              <VStack spacing={2} align="start" mb={4}>
                <Text fontSize="sm" color={textColor}>✓ View classroom schedules</Text>
                <Text fontSize="sm" color={textColor}>✓ Lost & Found search only</Text>
                <Text fontSize="sm" color={textColor}>✓ View transport schedule</Text>
                <Text fontSize="sm" color={textColor}>✓ Personal academic profile (view-only)</Text>
                <Text fontSize="sm" color={textColor}>✓ Basic classroom finder</Text>
                <Text fontSize="sm" color={textColor}>✓ View academic & exam schedules</Text>
                <Text fontSize="sm" color={textColor}>✓ Submit feedback (limited)</Text>
              </VStack>

              <Badge colorScheme="purple" mb={3}>🏫 School Features</Badge>
              <VStack spacing={2} align="start">
                <Text fontSize="sm" color={textColor}>✓ Admin dashboard (view-only KPIs)</Text>
                <Text fontSize="sm" color={textColor}>✓ User management (view/search only)</Text>
                <Text fontSize="sm" color={textColor}>✓ Transport management (view-only)</Text>
                <Text fontSize="sm" color={textColor}>✓ Academic data tools (read-only)</Text>
                <Text fontSize="sm" color={textColor}>✓ Basic reports & dashboards</Text>
                <Text fontSize="sm" color={textColor}>✓ Account management</Text>
              </VStack>
            </Stack>
          </Box>

          {/* Standard Plan */}
          <Box
            bg={cardBg}
            border="2px"
            borderColor="blue.300"
            borderRadius="2xl"
            p={8}
            textAlign="center"
            transition="all 0.3s"
            _hover={{
              transform: "translateY(-8px)",
              boxShadow: "xl"
            }}
            position="relative"
            overflow="hidden"
            transform="scale(1.05)"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="4px"
              bg="linear-gradient(90deg, #3182CE, #63B3ED)"
            />
            <Box
              position="absolute"
              top={4}
              right={4}
              bg="blue.500"
              color="white"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="bold"
            >
              POPULAR
            </Box>

            <Heading fontSize="2xl" mb={4} color={textColor}>Standard</Heading>
            <Box mb={6}>
              <Text fontSize="4xl" fontWeight="bold" color="blue.500">$99</Text>
              <Text fontSize="sm" color={mutedTextColor} mt={2}>
                Colleges & Polytechnics
              </Text>
            </Box>

            <Button
              w="100%"
              size="lg"
              variant="outline"
              borderColor="blue.300"
              color="blue.600"
              _hover={{
                bg: "blue.50",
                borderColor: "blue.400"
              }}
              mb={4}
              onClick={handleGetStarted}
            >
              Get Started
            </Button>

            <Text fontSize="xs" color="blue.500" fontWeight="medium" mb={8}>
              Includes Everything in Basic
            </Text>

            <Stack spacing={4} align="start">
              <Badge colorScheme="blue" mb={3}>🎓 Student Features</Badge>
              <VStack spacing={2} align="start" mb={4}>
                <Text fontSize="sm" color={textColor}>✓ Gym locker booking (short-term)</Text>
                <Text fontSize="sm" color={textColor}>✓ Sport courts booking</Text>
                <Text fontSize="sm" color={textColor}>✓ Reserve study/seminar rooms</Text>
                <Text fontSize="sm" color={textColor}>✓ Lost & Found: Search + Report</Text>
                <Text fontSize="sm" color={textColor}>✓ Internal campus e-hailing</Text>
                <Text fontSize="sm" color={textColor}>✓ Edit profile details</Text>
                <Text fontSize="sm" color={textColor}>✓ Enhanced classroom finder</Text>
                <Text fontSize="sm" color={textColor}>✓ Full academic schedule access</Text>
                <Text fontSize="sm" color={textColor}>✓ Exam notifications & reminders</Text>
                <Text fontSize="sm" color={textColor}>✓ Basic attendance tracking</Text>
                <Text fontSize="sm" color={textColor}>✓ View academic performance</Text>
                <Text fontSize="sm" color={textColor}>✓ Multi-category feedback system</Text>
              </VStack>

              <Badge colorScheme="purple" mb={3}>🏫 School Features</Badge>
              <VStack spacing={2} align="start">
                <Text fontSize="sm" color={textColor}>✓ Edit user profiles & disable accounts</Text>
                <Text fontSize="sm" color={textColor}>✓ Add/modify/remove parking & lockers</Text>
                <Text fontSize="sm" color={textColor}>✓ Submit & approve facility bookings</Text>
                <Text fontSize="sm" color={textColor}>✓ Enter student performance & manage attendance</Text>
                <Text fontSize="sm" color={textColor}>✓ Facility usage trends & downloadable reports</Text>
                <Text fontSize="sm" color={textColor}>✓ Security monitoring of admin activity</Text>
              </VStack>
            </Stack>
          </Box>

          {/* Premium Plan */}
          <Box
            bg={cardBg}
            border="1px"
            borderColor={borderColor}
            borderRadius="2xl"
            p={8}
            textAlign="center"
            transition="all 0.3s"
            _hover={{
              transform: "translateY(-8px)",
              boxShadow: "xl",
              borderColor: "blue.300"
            }}
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="4px"
              bg="linear-gradient(90deg, #3182CE, #63B3ED)"
            />
            <Heading fontSize="2xl" mb={4} color={textColor}>Premium</Heading>
            <Box mb={6}>
              <Text fontSize="4xl" fontWeight="bold" color="purple.500">$199</Text>
              <Text fontSize="sm" color={mutedTextColor} mt={2}>
                Large Universities or Campuses
              </Text>
            </Box>

            <Button
              w="100%"
              size="lg"
              bg="purple.500"
              color="white"
              _hover={{ bg: "purple.600" }}
              mb={4}
              onClick={handleGetStarted}
            >
              Get Started
            </Button>

            <Text fontSize="xs" color="purple.500" fontWeight="medium" mb={8}>
              Includes Everything in Standard
            </Text>

            <Stack spacing={4} align="start">
              <Badge colorScheme="blue" mb={3}>🎓 Student Features</Badge>
              <VStack spacing={2} align="start" mb={4}>
                <Text fontSize="sm" color={textColor}>✓ Gym locker booking (long-term)</Text>
                <Text fontSize="sm" color={textColor}>✓ Priority sport court reservations</Text>
                <Text fontSize="sm" color={textColor}>✓ Extended hours & priority room slots</Text>
                <Text fontSize="sm" color={textColor}>✓ Full Lost & Found with alerts</Text>
                <Text fontSize="sm" color={textColor}>✓ Real-time transport updates</Text>
                <Text fontSize="sm" color={textColor}>✓ Priority e-hailing with discounts</Text>
                <Text fontSize="sm" color={textColor}>✓ Live map & navigation support</Text>
                <Text fontSize="sm" color={textColor}>✓ Schedule sync (Google/Outlook)</Text>
                <Text fontSize="sm" color={textColor}>✓ Smart study planner</Text>
                <Text fontSize="sm" color={textColor}>✓ Attendance analytics & alerts</Text>
                <Text fontSize="sm" color={textColor}>✓ Detailed performance insights</Text>
                <Text fontSize="sm" color={textColor}>✓ Priority feedback channel</Text>
              </VStack>

              <Badge colorScheme="purple" mb={3}>🏫 School Features</Badge>
              <VStack spacing={2} align="start">
                <Text fontSize="sm" color={textColor}>✓ Full facility management & policies</Text>
                <Text fontSize="sm" color={textColor}>✓ Automated class & exam scheduling</Text>
                <Text fontSize="sm" color={textColor}>✓ Course/exam registration tools</Text>
                <Text fontSize="sm" color={textColor}>✓ Advanced analytics & engagement metrics</Text>
                <Text fontSize="sm" color={textColor}>✓ Full PDF + Excel exports</Text>
                <Text fontSize="sm" color={textColor}>✓ Advanced security & audit trails</Text>
                <Text fontSize="sm" color={textColor}>✓ Priority support & dedicated tools</Text>
              </VStack>
            </Stack>
          </Box>
        </Grid>
      </Box>
    </Box>
  );
}

export default pricing;
