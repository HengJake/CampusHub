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

import {
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
      gap={10}
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
        // border={"1px"}
        height={"100%"}
      >
        <Box display={"flex"} flexDirection={"row"} gap={10} height={"800px"}>
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
                  <Text>Student & Faculty Management</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Attendance Tracking</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Attendance Tracking</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Basic Reporting</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Email Support</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Up to 500 active users</Text>
                </Box>
              </Box>
            </Box>
          </Box>
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
                  <Text>Course Registration & Grade Management</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Library Management System</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Hostel/Facility Management</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Role-Based Access Control</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Custom Branding</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Chat & Ticket Support</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Up to 2,000 active users</Text>
                </Box>
              </Box>
            </Box>
          </Box>
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
              <Button bgColor={"#6699CC"} width={"100%"} color={"white"} _hover={{bgColor:"#4E759D"}}>
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
                  <Text>Online Exam Module</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Learning Management System (LMS)</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Fee Management & Payment Integration</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Real-time Analytics Dashboard</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>API Access</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Mobile App Integration</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Priority Support</Text>
                </Box>
                <Box display={"flex"} flexDirection={"row"} gap={7}>
                  <FaSquareCheck color="#14C800" size={24} />
                  <Text>Unlimited Users</Text>
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
