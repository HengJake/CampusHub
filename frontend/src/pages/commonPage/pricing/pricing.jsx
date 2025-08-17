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
} from "@chakra-ui/react";
import { color } from "framer-motion";

function pricing() {
  const bgColor = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.800", "white");
  const mutedTextColor = useColorModeValue("gray.600", "gray.400");

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
              <Text fontSize="4xl" fontWeight="bold" color="blue.500">$99</Text>
              <Text fontSize="sm" color={mutedTextColor} mt={2}>
                Small colleges or training centers
              </Text>
            </Box>

            <Button
              w="100%"
              size="lg"
              variant="outline"
              borderColor={borderColor}
              color={textColor}
              _hover={{
                bg: "blue.50",
                borderColor: "blue.300",
                color: "blue.600"
              }}
              mb={8}
            >
              Get Started
            </Button>

            <Stack spacing={4} align="start">
              <Flex align="center" gap={3}>
                <FaSquareCheck color="#14C800" size={20} />
                <Text fontSize="sm" color={textColor}>Secure User Authentication with MFA option</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <FaSquareCheck color="#14C800" size={20} />
                <Text fontSize="sm" color={textColor}>Personalized Dashboard</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <FaSquareCheck color="#14C800" size={20} />
                <Text fontSize="sm" color={textColor}>Course & Material Management</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <FaSquareCheck color="#14C800" size={20} />
                <Text fontSize="sm" color={textColor}>Student Communication Tools</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <FaSquareCheck color="#14C800" size={20} />
                <Text fontSize="sm" color={textColor}>Grading & Feedback System</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <FaSquareCheck color="#14C800" size={20} />
                <Text fontSize="sm" color={textColor}>View Timetable and Consultation Bookings</Text>
              </Flex>
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
              <Text fontSize="4xl" fontWeight="bold" color="blue.500">$249</Text>
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
            >
              Get Started
            </Button>

            <Text fontSize="xs" color="blue.500" fontWeight="medium" mb={8}>
              Includes Everything in Basic
            </Text>

            <Stack spacing={4} align="start">
              <Flex align="center" gap={3}>
                <FaSquareCheck color="#14C800" size={20} />
                <Text fontSize="sm" color={textColor}>Advanced Assessment & Grading Tools</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <FaSquareCheck color="#14C800" size={20} />
                <Text fontSize="sm" color={textColor}>Student Performance Analytics Dashboard</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <FaSquareCheck color="#14C800" size={20} />
                <Text fontSize="sm" color={textColor}>Teaching Assistant Management & Oversight</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <FaSquareCheck color="#14C800" size={20} />
                <Text fontSize="sm" color={textColor}>Professional Development & Workload Overview</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <FaSquareCheck color="#14C800" size={20} />
                <Text fontSize="sm" color={textColor}>Consultation Booking Management</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <FaSquareCheck color="#14C800" size={20} />
                <Text fontSize="sm" color={textColor}>Internal Academic Messaging System</Text>
              </Flex>
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
              <Text fontSize="4xl" fontWeight="bold" color="blue.500">$499</Text>
              <Text fontSize="sm" color={mutedTextColor} mt={2}>
                Large Universities or Campuses
              </Text>
            </Box>

            <Button
              w="100%"
              size="lg"
              bg="blue.500"
              color="white"
              _hover={{ bg: "blue.600" }}
              mb={4}
            >
              Get Started
            </Button>

            <Text fontSize="xs" color="blue.500" fontWeight="medium" mb={8}>
              Includes Everything in Standard
            </Text>

            <Stack spacing={4} align="start">
              <Flex align="center" gap={3}>
                <FaSquareCheck color="#14C800" size={20} />
                <Text fontSize="sm" color={textColor}>Research Management Portal</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <FaSquareCheck color="#14C800" size={20} />
                <Text fontSize="sm" color={textColor}>Curriculum Development & Review Access</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <FaSquareCheck color="#14C800" size={20} />
                <Text fontSize="sm" color={textColor}>Career Services Hub</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <FaSquareCheck color="#14C800" size={20} />
                <Text fontSize="sm" color={textColor}>Integrated Grant Application Tracker</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <FaSquareCheck color="#14C800" size={20} />
                <Text fontSize="sm" color={textColor}>Workload Prediction & Balancing Tools</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <FaSquareCheck color="#14C800" size={20} />
                <Text fontSize="sm" color={textColor}>Full Integrated Library Services</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <FaSquareCheck color="#14C800" size={20} />
                <Text fontSize="sm" color={textColor}>Cross-Faculty Collaboration Tools</Text>
              </Flex>
            </Stack>
          </Box>
        </Grid>
      </Box>
    </Box>
  );
}

export default pricing;
