import React from "react";
import "./service.scss";
import { Box, Flex } from "@chakra-ui/react";
import { FaUserGear } from "react-icons/fa6";
import { BiSolidReport } from "react-icons/bi";
import { GiSatelliteCommunication } from "react-icons/gi";
import { MdOutlineSecurity } from "react-icons/md";
import { BsBuildingFillGear } from "react-icons/bs";
import { HiAcademicCap } from "react-icons/hi2";

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

function service() {
  return (
    <Flex w="100%" justify="center" align="center" bgColor={"white"}>
      <Box
        w={"90%"}
        justifyContent={"center"}
        height={"100%"}
        flexDirection={"column"}
        p={"4"}
      >
        <Box p={5}>
          <Heading fontSize={"24px"} fontWeight={"medium"}>
            Our Services
          </Heading>
          <Text
            paddingTop={"2"}
            fontSize={"16px"}
            color={"rgba(0, 0, 0, 0.46)"}
            sx={{ wordSpacing: "1px" }}
          >
            CampusHub provides comprehensive digital solutions to streamline
            campus operations, enhance academic experiences, and improve
            facility management for educational institutions.
          </Text>
        </Box>
        {/* MainBox */}
        <Box
          width={"100%"}
          display={"flex"}
          flexDirection={"column"}
          gap={"30px"}
          p={"20px"}
        >
          {/* 1stBox */}
          <Box
            width={"100%"}
            display={"flex"}
            height={"360px"}
            flexDirection={"row"}
            gap={"30px"}
          >
            {/* 1stContentBox */}
            <Box
              width={"100%"}
              height={"100%"}
              p={"20px"}
              display={"flex"}
              flexDirection={"column"}
              alignContent={"center"}
              bgColor={"#F8F9FA"}
              boxShadow="0px 4px 10px rgba(0, 0, 0, 0.15)"
            >
              <Text paddingTop={"40px"} fontWeight={"medium"} fontSize={"20px"}>
                <FaUserGear size={"40px"} />
                <br />
                User Management
                <Text
                  fontSize={"16px"}
                  paddingTop={"5px"}
                  fontWeight={"normal"}
                  color={"rgba(0, 0, 0, 0.46)"}
                >
                  Comprehensive student and staff management system with
                  role-based access control, profile management, and
                  administrative oversight.
                </Text>
                <br />
                <Box width={"100%"} marginTop={"10%"}>
                  <Button
                    width={"100%"}
                    height={"40px"}
                    fontSize={"16px"}
                    fontWeight={"normal"}
                    borderRadius={"0px"}
                    bgColor={"#FF5656"}
                    color={"white"}
                    _hover={{ bg: "#D34949" }}
                  >
                    Learn More
                  </Button>
                </Box>
              </Text>
            </Box>
            {/* 2ndContentBox */}
            <Box
              width={"100%"}
              p={"20px"}
              bgColor={"#F8F9FA"}
              boxShadow="0px 4px 10px rgba(0, 0, 0, 0.15)"
            >
              <Text paddingTop={"40px"} fontWeight={"medium"} fontSize={"20px"}>
                <BsBuildingFillGear size={"40px"} />
                <br />
                Facility Management
                <Text
                  fontSize={"16px"}
                  paddingTop={"5px"}
                  fontWeight={"normal"}
                  color={"rgba(0, 0, 0, 0.46)"}
                >
                  Smart booking system for courts, parking lots, gym lockers,
                  and campus transportation with real-time availability
                  tracking.
                </Text>
                <br />
                <Box width={"100%"} marginTop={"10%"}>
                  <Button
                    width={"100%"}
                    height={"40px"}
                    fontSize={"16px"}
                    fontWeight={"normal"}
                    borderRadius={"0px"}
                    bgColor={"#FF5656"}
                    color={"white"}
                    _hover={{ bg: "#D34949" }}
                  >
                    Learn More
                  </Button>
                </Box>
              </Text>
            </Box>
            {/* 3rdContentBox */}
            <Box
              width={"100%"}
              p={"20px"}
              bgColor={"#F8F9FA"}
              boxShadow="0px 4px 10px rgba(0, 0, 0, 0.15)"
            >
              <Text paddingTop={"40px"} fontWeight={"medium"} fontSize={"20px"}>
                <HiAcademicCap size={"40px"} />
                <br />
                Academic Data
                <Text
                  fontSize={"16px"}
                  paddingTop={"5px"}
                  fontWeight={"normal"}
                  color={"rgba(0, 0, 0, 0.46)"}
                >
                  Complete academic information system including schedules,
                  results, attendance tracking, and examination management.
                </Text>
              </Text>
              <br />
              <Box width={"100%"} marginTop={"11%"}>
                <Button
                  width={"100%"}
                  height={"40px"}
                  fontSize={"16px"}
                  fontWeight={"normal"}
                  borderRadius={"0px"}
                  bgColor={"#FF5656"}
                  color={"white"}
                  _hover={{ bg: "#D34949" }}
                >
                  Learn More
                </Button>
              </Box>
            </Box>
          </Box>

          {/* 2ndMainBox */}
          <Box
            height={"100%"}
            width={"100%"}
            display={"flex"}
            flexDirection={"row"}
            gap={"30px"}
          >
            <Box
              height={"360px"}
              width={"100%"}
              display={"flex"}
              flexDirection={"row"}
              gap={"30px"}
            >
              {/* 1stContentBox */}
              <Box
                width={"100%"}
                height={"100%"}
                p={"20px"}
                display={"flex"}
                flexDirection={"column"}
                alignContent={"center"}
                bgColor={"#F8F9FA"}
                boxShadow="0px 4px 10px rgba(0, 0, 0, 0.15)"
              >
                <Text
                  paddingTop={"40px"}
                  fontWeight={"medium"}
                  fontSize={"20px"}
                >
                  <BiSolidReport size={"40px"} />
                  <br />
                  Reports & Analytics
                  <Text
                    fontSize={"16px"}
                    paddingTop={"5px"}
                    fontWeight={"normal"}
                    color={"rgba(0, 0, 0, 0.46)"}
                  >
                    Data-driven insights with facility usage statistics, booking
                    patterns, and user engagement reports for informed decision
                    making.
                  </Text>
                  <br />
                  <Box width={"100%"} marginTop={"10%"}>
                    <Button
                      width={"100%"}
                      height={"40px"}
                      fontSize={"16px"}
                      fontWeight={"normal"}
                      borderRadius={"0px"}
                      bgColor={"#FF5656"}
                      color={"white"}
                      _hover={{ bg: "#D34949" }}
                    >
                      Learn More
                    </Button>
                  </Box>
                </Text>

                {/* 2ndContentBox */}
              </Box>
              <Box
                width={"100%"}
                p={"20px"}
                bgColor={"#F8F9FA"}
                boxShadow="0px 4px 10px rgba(0, 0, 0, 0.15)"
              >
                <Text
                  paddingTop={"40px"}
                  fontWeight={"medium"}
                  fontSize={"20px"}
                >
                  <GiSatelliteCommunication size={"40px"} />
                  <br />
                  Campus Communication
                  <Text
                    fontSize={"16px"}
                    paddingTop={"5px"}
                    fontWeight={"normal"}
                    color={"rgba(0, 0, 0, 0.46)"}
                  >
                    Streamlined announcement system and campus-wide
                    communication tools to keep students and staff informed and
                    engaged.
                  </Text>
                  <br />
                  <Box width={"100%"} marginTop={"10%"}>
                    <Button
                      width={"100%"}
                      height={"40px"}
                      fontSize={"16px"}
                      fontWeight={"normal"}
                      borderRadius={"0px"}
                      bgColor={"#FF5656"}
                      color={"white"}
                      _hover={{ bg: "#D34949" }}
                    >
                      Learn More
                    </Button>
                  </Box>
                </Text>

                {/* 3rdContentBox */}
              </Box>
              <Box
                bgColor={"#F8F9FA"}
                boxShadow="0px 4px 10px rgba(0, 0, 0, 0.15)"
                width={"100%"}
                p={"20px"}
              >
                <Text
                  paddingTop={"40px"}
                  fontWeight={"medium"}
                  fontSize={"20px"}
                >
                  <MdOutlineSecurity size={"40px"} />
                  <br />
                  Security & Support
                  <Text
                    fontSize={"16px"}
                    paddingTop={"5px"}
                    fontWeight={"normal"}
                    color={"rgba(0, 0, 0, 0.46)"}
                  >
                    Robust security features including two-factor
                    authentication, role-based permissions, and comprehensive
                    customer support.
                  </Text>
                  <br />
                  <Box width={"100%"} marginTop={"10%"}>
                    <Button
                      width={"100%"}
                      height={"40px"}
                      fontSize={"16px"}
                      fontWeight={"normal"}
                      borderRadius={"0px"}
                      bgColor={"#FF5656"}
                      color={"white"}
                      _hover={{ bg: "#D34949" }}
                    >
                      Learn More
                    </Button>
                  </Box>
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}

export default service;
