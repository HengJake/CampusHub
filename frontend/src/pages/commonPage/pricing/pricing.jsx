import React from "react";
import "./pricing.scss";
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
} from "@chakra-ui/react";
import { color } from "framer-motion";

function pricing() {
  return (
    <Flex
      w="100%"
      justify="center"
      align="center"
      bgColor={"white"}
      display={"flex"}
      flexDirection={"column"}
      gap={"50px"}
    >
      <Box
        display={"flex"}
        width={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
        // border={"1px"}
        textAlign={"center"}
      >
        <Heading fontSize={"60px"} p={20}>
          All your campus operations. <br />
          Powered by one platform.
        </Heading>
      </Box>

      <Box
        display={"flex"}
        width={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
        height={"100%"}
        flexDirection={"column"}
        // border={"1px"}
        gap={"50px"}
        p={10}
      >
        <Switch colorScheme="teal" size="lg" />
        <Heading fontSize={"30px"}>Admin Benefits</Heading>

        {/* StaffDetails */}
        <Box
          display={"flex"}
          gap={10}
          height={"800px"}
          width={"100%"}
          // border={"1px"}
          justifyContent={"center"}
        >
          {/* First */}
          <Box
            border={"2px"}
            borderColor={"rgba(0, 0, 0, 0.10)"}
            width={"450px"}
            p={10}
            borderRadius={15}
          >
            <Heading fontSize={"30px"}>Basic</Heading>
            <Text fontSize={"30px"} fontWeight={"bold"}>
              $99
            </Text>
            <br />
            <Text fontSize={"15px"} fontWeight={"medium"}>
              Small colleges or training centers
            </Text>
            <br />
            <Box width={"100%"}>
              <Button
                bgColor={"rgba(255, 255, 255, 0)"}
                border={"2px"}
                borderColor={"rgba(0, 0, 0, 0.10)"}
                width={"100%"}
              >
                Get Started
              </Button>
            </Box>
            <br />
            <Box
              display={"flex"}
              flexDirection={"row"}
              alignItems={"center"}
              gap={5}
            >
              <Box
                display={"flex"}
                flexDirection={"column"}
                width={"100%"}
                gap={3}
              >
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Secure User Authentication with MFA option</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text> Personalized Dashboard </Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Course & Material Management </Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Student Communication Tools</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Grading & Feedback System</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>View Timetable and Consultation Bookings</Text>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Second */}
          <Box
            border={"2px"}
            borderColor={"rgba(0, 0, 0, 0.10)"}
            width={"450px"}
            p={10}
            borderRadius={15}
          >
            <Heading fontSize={"30px"}>Standard</Heading>
            <Text fontSize={"30px"} fontWeight={"bold"}>
              $249
            </Text>
            <br />
            <Text fontSize={"15px"} fontWeight={"medium"}>
              Colleges & Polytechnics{" "}
            </Text>
            <br />
            <Box width={"100%"}>
              <Button
                bgColor={"rgba(255, 255, 255, 0)"}
                border={"2px"}
                borderColor={"rgba(0, 0, 0, 0.10)"}
                width={"100%"}
              >
                Get Started
              </Button>
              <Box>
                <Text color={"rgba(0, 0, 0, 0.4)"} fontWeight={"medium"}>
                  Includes Everything in Basic
                </Text>
              </Box>
            </Box>
            <br />
            <Box
              display={"flex"}
              flexDirection={"row"}
              alignItems={"center"}
              gap={5}
            >
              <Box
                display={"flex"}
                flexDirection={"column"}
                width={"100%"}
                gap={3}
                height={"700px"}
              >
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Advanced Assessment & Grading Tools</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Student Performance Analytics Dashboard</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Teaching Assistant Management & Oversight</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Professional Development & Workload Overview</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Consultation Booking Management </Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Internal Academic Messaging System</Text>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Third */}
          <Box
            border={"2px"}
            borderColor={"rgba(0, 0, 0, 0.10)"}
            width={"450px"}
            height={"100%"}
            p={10}
            borderRadius={15}
          >
            <Heading fontSize={"30px"}>Premium</Heading>
            <Text fontSize={"30px"} fontWeight={"bold"}>
              $499
            </Text>
            <br />
            <Text fontSize={"15px"} fontWeight={"medium"}>
              Large Universities or Campuses{" "}
            </Text>
            <br />
            <Box width={"100%"}>
              <Button
                bgColor={"#6699CC"}
                width={"100%"}
                color={"white"}
                _hover={{ bgColor: "#4E759D" }}
              >
                Get Started
              </Button>
              <Box>
                <Text color={"rgba(0, 0, 0, 0.4)"} fontWeight={"medium"}>
                  Includes Everything in Standard
                </Text>
              </Box>
            </Box>
            <br />
            <Box
              display={"flex"}
              flexDirection={"row"}
              alignItems={"center"}
              gap={5}
            >
              <Box
                display={"flex"}
                flexDirection={"column"}
                width={"100%"}
                gap={3}
                height={"100%"}
              >
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text> Research Management Portal </Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text> Curriculum Development & Review Access</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Career Services Hub</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Integrated Grant Application Tracker</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text> Workload Prediction & Balancing Tools</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text> Full Integrated Library Services</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Cross-Faculty Collaboration Tools</Text>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
        <br />
        {/* StudentDetails */}
        <Heading fontSize={"30px"}>Student Benefits</Heading>
        <Box
          display={"flex"}
          gap={10}
          height={"800px"}
          width={"100%"}
          // border={"1px"}
          justifyContent={"center"}
        >
          {/* First */}
          <Box
            border={"2px"}
            borderColor={"rgba(0, 0, 0, 0.10)"}
            width={"450px"}
            p={10}
            borderRadius={15}
          >
            <Heading fontSize={"30px"}>Basic</Heading>
            <Text fontSize={"30px"} fontWeight={"bold"}>
              $99
            </Text>
            <br />
            <Text fontSize={"15px"} fontWeight={"medium"}>
              Small colleges or training centers
            </Text>
            <br />
            <Box width={"100%"}>
              <Button
                bgColor={"rgba(255, 255, 255, 0)"}
                border={"2px"}
                borderColor={"rgba(0, 0, 0, 0.10)"}
                width={"100%"}
              >
                Get Started
              </Button>
            </Box>
            <br />
            <Box
              display={"flex"}
              flexDirection={"row"}
              alignItems={"center"}
              gap={5}
            >
              <Box
                display={"flex"}
                flexDirection={"column"}
                width={"100%"}
                gap={3}
              >
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Secure User Authentication</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text> Course Catalog Browse</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Course Registration </Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Personal Academic Timetable Viewing</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Examination Schedule and Venue Viewing</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Access to Transcripts and Grade Reports</Text>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Second */}
          <Box
            border={"2px"}
            borderColor={"rgba(0, 0, 0, 0.10)"}
            width={"450px"}
            p={10}
            borderRadius={15}
          >
            <Heading fontSize={"30px"}>Standard</Heading>
            <Text fontSize={"30px"} fontWeight={"bold"}>
              $249
            </Text>
            <br />
            <Text fontSize={"15px"} fontWeight={"medium"}>
              Colleges & Polytechnics{" "}
            </Text>
            <br />
            <Box width={"100%"}>
              <Button
                bgColor={"rgba(255, 255, 255, 0)"}
                border={"2px"}
                borderColor={"rgba(0, 0, 0, 0.10)"}
                width={"100%"}
              >
                Get Started
              </Button>
              <Box>
                <Text color={"rgba(0, 0, 0, 0.4)"} fontWeight={"medium"}>
                  Includes Everything in Basic
                </Text>
              </Box>
            </Box>
            <br />
            <Box
              display={"flex"}
              flexDirection={"row"}
              alignItems={"center"}
              gap={5}
            >
              <Box
                display={"flex"}
                flexDirection={"column"}
                width={"100%"}
                gap={3}
                height={"700px"}
              >
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text> Appointment Booking with Lecturers/Tutors</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Personalized Academic Dashboard </Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Digital Portfolio & Skills Showcase</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Access to General Financial Info</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Limited Library Integration</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text> Structured Feedback & Grievance Redressal</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Waitlisting & Automated Check in Registration</Text>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Third */}
          <Box
            border={"2px"}
            borderColor={"rgba(0, 0, 0, 0.10)"}
            width={"450px"}
            p={10}
            borderRadius={15}
          >
            <Heading fontSize={"30px"}>Premium</Heading>
            <Text fontSize={"30px"} fontWeight={"bold"}>
              $499
            </Text>
            <br />
            <Text fontSize={"15px"} fontWeight={"medium"}>
              Large Universities or Campuses{" "}
            </Text>
            <br />
            <Box width={"100%"}>
              <Button
                bgColor={"#6699CC"}
                width={"100%"}
                color={"white"}
                _hover={{ bgColor: "#4E759D" }}
              >
                Get Started
              </Button>
              <Box>
                <Text color={"rgba(0, 0, 0, 0.4)"} fontWeight={"medium"}>
                  Includes Everything in Standard
                </Text>
              </Box>
            </Box>
            <br />
            <Box
              display={"flex"}
              flexDirection={"row"}
              alignItems={"center"}
              gap={5}
            >
              <Box
                display={"flex"}
                flexDirection={"column"}
                width={"100%"}
                gap={3}
                height={"700px"}
              >
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text> Interactive Degree Audit & Graduation Planner</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text> Research & Thesis Management Portal</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Career Services Hub</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Student Life Portal</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text> Comprehensive Financial Account Management </Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text> Full Integrated Library Services</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Enhanced LMS Integration</Text>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}

export default pricing;
