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


function pricing() {
  
  return (
    <Flex
      w="100%"
      justify="center"
      align="center"
      bgColor={"white"}
      display={"flex"}
      flexDirection={"column"}
    >
      <Box
        display={"flex"}
        width={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
        border={"1px"}
        textAlign={"center"}
      >
        <Heading fontSize={"60px"}>
          All your campus operations. <br />
          Powered by one platform.
        </Heading>
      </Box>
      <Box
        display={"flex"}
        width={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
        border={"1px"}
      >
      </Box>
    </Flex>
  );
}

export default pricing;
