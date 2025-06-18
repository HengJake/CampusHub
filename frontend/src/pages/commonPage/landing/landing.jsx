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
import NameImage from "/PosterImage.png";
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
          {/* BackgroundDesign */}
          <Box
            position="absolute"
            bottom="15%"
            left="-300px"
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
            zIndex="1"
          ></Box>

          <Heading fontSize={"60px"} fontWeight={"light"}>
            Where Student Life Meets
          </Heading>
          <Text fontSize={"60px"} fontWeight={"bold"}>
            Smart Management
          </Text>
          <Box
            display={"flex"}
            gap={5}
            width={"30%"}
            flexDirection={"row"}
            alignItems={"center"}
          >
            <Button width={"100%"} height={"60px"} borderRadius={"15px"}>
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
              _hover={{ bgColor: "rgb(255, 255, 255)", color: "black" }}
            >
              Log in
            </Button>
          </Box>
        </Box>
        <Box
          width={"100%"}
          height={"100%"}
          p={"70px"}
          bgColor={"white"}
          zIndex="100"
        >
          <Box bgColor={"#6699CC"} height={"80%"}>
            <Image
              objectFit={"fill"}
              height={"100%"}
              width={"100%"}
              src={NameImage}
              alt="Poster"
            />
          </Box>
        </Box>
      </Box>

      {/* Image Box */}
    </Flex>
  );
}

export default landing;
