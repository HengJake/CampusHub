import React from "react";
import "./campusRide.scss";
import CarImage from "/CarImg.png";
import { FaPhone } from "react-icons/fa6";
import { RiMessage3Fill } from "react-icons/ri";
import { RiSunCloudyFill } from "react-icons/ri";
import { Divider } from "@chakra-ui/react";

import {
  Box,
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
  Flex,
  Image,
} from "@chakra-ui/react";
import { rgba } from "framer-motion";

function RideDetail() {
  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      width={"100%"}
    >
      <Box>
        <Heading fontSize={"50px"}>Your ride is on its way to you</Heading>{" "}
      </Box>
      <Box
        p={"50px"}
        width={"100%"}
        display={"flex"}
        flexDirection={"column"}
        rowGap={"10%"}
      >
        <Box
          border={"1px"}
          borderColor={"rgba(0, 0, 0, 0.1)"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          flexDirection={"row"}
          width={"100%"}
          height={"100%"}
          boxShadow={"10px 10px 2px rgba(0, 0, 0, 0.3)"}
        >
          <Box
            bgColor={"#EAEAEA"}
            height={"100%"}
            width={"70%"}
            p={"5%"}
            borderBottomRightRadius={"100px"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            flexDirection={"column"}
          >
            <Heading
              fontSize={"40px"}
              fontWeight={"bold"}
              color={"rgba(0, 0, 0, 0.5)"}
            >
              CEB9119
            </Heading>
            <Image src={CarImage} />
          </Box>
          <Box
            p={"50px"}
            height={"100%"}
            width={"100%"}
            display={"flex"}
            flexDirection={"row"}
          >
            <Box width={"100%"}>
              <Box width={"60%"}>
                <Text fontSize={"26px"} fontWeight={"bold"}>
                  Standard Ride
                </Text>
                <Box
                  display={"flex"}
                  width={"100%"}
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  color={"rgba(0, 0, 0, 0.5)"}
                  fontWeight={"medium"}
                >
                  <Text>Est 5 mins away</Text>

                  <Text>4 seated</Text>
                </Box>
              </Box>
              <br />
              <br />
              <Box width={"60%"}>
                <Text fontSize={"26px"} fontWeight={"bold"}>
                  Car Types
                </Text>
                <Box
                  display={"flex"}
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  color={"rgba(0, 0, 0, 0.5)"}
                  fontWeight={"medium"}
                >
                  <Text>Sedan</Text>
                </Box>
              </Box>
              <br />
              <br />
              <Box width={"60%"}>
                <Text fontSize={"26px"} fontWeight={"bold"}>
                  Ride Price
                </Text>
                <Box
                  display={"flex"}
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  color={"rgba(0, 0, 0, 0.5)"}
                  fontWeight={"medium"}
                >
                  <Text>RM 8</Text>
                </Box>
              </Box>
              <br />
              <br />
              <Box width={"60%"}>
                <Text fontSize={"26px"} fontWeight={"bold"}>
                  Ride ID
                </Text>
                <Box
                  display={"flex"}
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  color={"rgba(0, 0, 0, 0.5)"}
                  fontWeight={"medium"}
                >
                  <Text>WFLMRAPISD1A9</Text>
                </Box>
              </Box>
            </Box>
            <Box
              display={"flex"}
              flexDirection={"column"}
              justifyContent={"space-between"}
              width={"80%"}
              p={"10px"}
            >
              <Box
                display={"flex"}
                flexDirection={"row"}
                gap={"50px"}
                justifyContent={"right"}
              >
                <FaPhone size={"30px"} />
                <RiMessage3Fill size={"30px"} />
              </Box>

              <Box
                width={"100%"}
                display={"flex"}
                flexDirection={"column"}
                rowGap={"15px"}
              >
                <Button
                  width={"100%"}
                  bgColor={"#DBDBDB"}
                  color={"rgba(0, 0, 0, 0.3)"}
                >
                  Change Booking
                </Button>
                <Button
                  width={"100%"}
                  bgColor={"#FF5656"}
                  color={"white"}
                  _hover={{ bg: "#D34949" }}
                >
                  Cancel Booking
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box
          width={"100%"}
          display={"flex"}
          justifyContent={"left"}
          alignContent={"center"}
          // border={"1px"}
          flexDirection={"row"}
          gap={"2%"}
        >
          <Box display={"flex"} flexDirection={"row"} gap={"20px"}>
            <RiSunCloudyFill size={"30px"} />
            <Text fontSize={"18px"} fontWeight={"medium"}>
              Partly Cloudy 31.1&deg;C
            </Text>
          </Box>
          <Divider
            display={"flex"}
            justifyContent={"center"}
            alignContent={"center"}
            orientation="vertical"
            border={"1px"}
            h="100%"
          />{" "}
          <Box display={"flex"} flexDirection={"row"} gap={"20px"}>
            <Text fontSize={"18px"} fontWeight={"medium"}>
              Feels like 40.4&deg;C{" "}
            </Text>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}

export default RideDetail;
