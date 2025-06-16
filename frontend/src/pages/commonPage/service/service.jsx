import React from "react";
import "./service.scss";
import { Box, Flex } from "@chakra-ui/react";
import { FaUserGear } from "react-icons/fa6";
import { BiSolidReport } from "react-icons/bi";
import { GiSatelliteCommunication } from "react-icons/gi";
import { MdOutlineSecurity } from "react-icons/md";
import { BsBuildingFillGear } from "react-icons/bs";
import { HiAcademicCap } from "react-icons/hi2";
import ServiceCard from "./ServiceCard.jsx";

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
          gap={10}
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
            <ServiceCard
              icon={<FaUserGear size="40px" />}
              title="User Management"
              description="Comprehensive student and staff management system with role-based access control, profile management, and administrative oversight."
              buttonText="Learn More"
              onButtonClick={() => console.log("Clicked Learn More")}
            />

            {/* 2ndContentBox */}
            <ServiceCard
              icon={<BsBuildingFillGear size="40px" />}
              title="Facility Management"
              description="Smart booking system for courts, parking lots, gym lockers, and campus transportation with real-time availability tracking."
              buttonText="Learn More"
              onButtonClick={() => console.log("Facility Management clicked")}
            />

            {/* 3rdContentBox */}
            <ServiceCard
              icon={<HiAcademicCap size="40px" />}
              title="Academic Data"
              description="Complete academic information system including schedules, results, attendance tracking, and examination management."
              buttonText="Learn More"
              onButtonClick={() => console.log("Academic Data clicked")}
            />
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
              <ServiceCard
                icon={<BiSolidReport size="40px" />}
                title="Reports & Analytics"
                description="Data-driven insights with facility usage statistics, booking patterns, and user engagement reports for informed decision making."
                buttonText="Learn More"
                onButtonClick={() => console.log("Reports clicked")}
              />

              <ServiceCard
                icon={<GiSatelliteCommunication size="40px" />}
                title="Campus Communication"
                description="Streamlined announcement system and campus-wide communication tools to keep students and staff informed and engaged."
                buttonText="Learn More"
                onButtonClick={() => console.log("Communication clicked")}
              />

              <ServiceCard
                icon={<MdOutlineSecurity size="40px" />}
                title="Security & Support"
                description="Robust security features including two-factor authentication, role-based permissions, and comprehensive customer support."
                buttonText="Learn More"
                onButtonClick={() => console.log("Security clicked")}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}

export default service;
