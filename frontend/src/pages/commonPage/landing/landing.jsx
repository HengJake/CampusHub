import React from "react";
import "./landing.scss";
import { Box, Flex } from "@chakra-ui/react";
import { FaUserGear } from "react-icons/fa6";
import { BiSolidReport } from "react-icons/bi";
import { GiSatelliteCommunication } from "react-icons/gi";
import { MdOutlineSecurity } from "react-icons/md";
import { BsBuildingFillGear } from "react-icons/bs";
import { HiAcademicCap } from "react-icons/hi2";
import { Image, Stack, Text, Heading, Button } from "@chakra-ui/react";
import NameImage from "../../../../public/PosterImage.png";
import { color } from "framer-motion";

function landing() {
  return (
    <Flex
      w="100%"
      height={"100vh"}
      align="center"
      bgColor={"white"}
      display={"flex"}
      flexDirection={"column"}
    >
      {/* 1stBox */}
      <Box height={"75%"} width={"100%"} bgColor={"rgba(102, 153, 204, 0.50)"}>
        <Box
          height={"100%"}
          width={"100%"}
          fontSize={"50px"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          flexDirection={"column"}
          gap={5}
          color={"white"}
        >
          <Heading fontSize={"60px"} fontWeight={"light"} letterSpacing={5}>
            Where Student Life Meets
          </Heading>
          <Text fontSize={"60px"} fontWeight={"bold"} letterSpacing={1}>
            Smart Management
          </Text>
          <Box
            display={"flex"}
            gap={5}
            width={"30%"}
            flexDirection={"row"}
            alignItems={"center"}
          >
            <Button
              width={"100%"}
              height={"60px"}
              borderRadius={"15px"}
              bgColor={"#FF5656"}
              color={"white"}
              fontSize={"24px"}
              fontWeight={"bold"}
              zIndex={100}
              _hover={{ bgColor: "rgb(255, 255, 255)", color: "black" }}
            >
              Join Now
            </Button>
            <Button
              width={"100%"}
              height={"60px"}
              borderRadius={"15px"}
              bgColor="rgba(255, 255, 255, 0)"
              border={"4px solid white"}
              color={"white"}
              fontWeight={"bold"}
              fontSize={"24px"}
              _hover={{ bgColor: "rgb(255, 255, 255)", color: "black" }}
            >
              Log in
            </Button>
          </Box>
        </Box>

        <Box
          width={"100%"}
          p={"70px"}
          zIndex="100"
        >
          <Box height={"100%"}>
            <Image
            
              objectFit={"cover"}
              height={"auto"}
              width={"100%"}
              src={NameImage}
              alt="Poster"
            />
            <Box
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              flexDirection={"column"}
            >
              <Box
                p={8}
                width={"100%"}
                display={"flex"}
                flexDirection={"row"}
                justifyContent={"space-between"}
              >
                <Heading fontSize={"30px"}>Purchase Plans</Heading>
                <Button
                  bgColor="rgb(230, 230, 230, 0.50)"
                  borderRadius={"10px"}
                  position={"relative"}
                  width={"10%"}
                >
                  View All
                </Button>
              </Box>

              <Box
                display={"flex"}
                flexDirection={"row"}
                gap={10}
                minW={"96%"}
                justifyContent={"center"}
              >
                <Box
                  p={10}
                  width={"40%"}
                  border={"2px"}
                  borderColor={"rgba(0, 0, 0, 0.10)"}
                  borderRadius={"10"}
                >
                  <Text fontWeight={"bold"} fontSize={"30px"}>
                    Basic
                  </Text>
                  <br />
                  <Text fontWeight={"bold"} fontSize={"30px"}>
                    $99{" "}
                  </Text>
                  <Text fontSize={"14px"}>
                    small colleges or training centers
                  </Text>
                  <br />
                  <Button
                    bg={"transparent"}
                    border={"1px"}
                    borderColor={"rgba(0, 0, 0, 0.20)"}
                    width={"100%"}
                  >
                    Get Started
                  </Button>
                </Box>
                <Box
                  p={10}
                  width={"40%"}
                  border={"2px"}
                  borderColor={"rgba(0, 0, 0, 0.10)"}
                  borderRadius={"10"}
                >
                  <Text fontWeight={"bold"} fontSize={"30px"}>
                    Standard
                  </Text>
                  <br />
                  <Text fontWeight={"bold"} fontSize={"30px"}>
                    $249{" "}
                  </Text>
                  <Text fontSize={"14px"}>Includes Everything in Basic </Text>
                  <br />
                  <Button
                    width={"100%"}
                    bgColor={"rgba(102, 153, 204)"}
                    boxShadow={"0px 4px 10px rgba(0, 0, 0, 0.3)"}
                    color={"white"}
                  >
                    Get Started
                  </Button>
                </Box>
                <Box
                  p={10}
                  width={"40%"}
                  border={"2px"}
                  borderColor={"rgba(0, 0, 0, 0.10)"}
                  borderRadius={"10"}
                >
                  <Text fontWeight={"bold"} fontSize={"30px"}>
                    Premium
                  </Text>
                  <br />
                  <Text fontWeight={"bold"} fontSize={"30px"}>
                    $499{" "}
                  </Text>
                  <Text fontSize={"14px"}>Large Universities or Campuses </Text>
                  <br />
                  <Button
                    width={"100%"}
                    bg={"transparent"}
                    border={"1px"}
                    borderColor={"rgba(0, 0, 0, 0.20)"}
                  >
                    Get Started
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* BackgroundDesign */}
      <Box
        position="absolute"
        bottom="15%"
        left="-10%"
        width="900px"
        height="900px"
        borderRadius="full"
        bgColor={"rgba(255, 255, 255, 0.1)"}
        zIndex="1"
      ></Box>
      <Box
        position="absolute"
        bottom="20%"
        right="70%"
        width="800px"
        height="800px"
        borderRadius="full"
        bgColor={"rgba(255, 255, 255, 0.1)"}
        zIndex="1"
      ></Box>
      <Box
        position="absolute"
        bottom="30%"
        right="80%"
        width="600px"
        height="600px"
        borderRadius="full"
        bgColor={"rgba(255, 255, 255, 0.1)"}
        zIndex="100"
      ></Box>
    </Flex>
  );
}

export default landing;
