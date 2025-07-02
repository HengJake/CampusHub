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
import PosterImage from "/PosterImage.png";
import LoginBackground from "/LoginBackground.png";
import { color } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@chakra-ui/react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
} from "@chakra-ui/react";
import RegisterBox from "../../../component/common/registerBox";

function landing() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const handleviewall = () => {
    navigate("/pricing");
  };
  const handlesignup = () => {
    navigate("/signup");
  };
  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <Flex
      w="100vw"
      justifyContent={"center"}
      align="center"
      // bgColor={"red"}
      display={"flex"}
      flexDirection={"column"}
      // zIndex={-1}
    >
      {/* 1stBox */}
      <Box height={"fit-content"} width={"100%"}>
        <Box
          height={"800px"}
          width={"100%"}
          fontSize={"50px"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          flexDirection={"column"}
          gap={5}
          color={"white"}
          overflowY={"hidden"}
          overflowX={"hidden"}
          position={"relative"}
          boxShadow={"0px 10px 5px rgba(0, 0, 0, 0.2)"}
        >
          <Image
            position={"absolute"}
            objectFit={"cover"}
            height={"1400px"}
            width={"100%"}
            src={LoginBackground}
          ></Image>

          <Heading
            fontSize={"60px"}
            fontWeight={"light"}
            letterSpacing={5}
            zIndex={100}
          >
            Where Student Life Meets
          </Heading>
          <Text
            fontSize={"60px"}
            fontWeight={"bold"}
            letterSpacing={1}
            zIndex={100}
          >
            Smart Management
          </Text>
          <Box
            display={"flex"}
            gap={5}
            width={"35%"}
            flexDirection={"row"}
            alignItems={"center"}
          >
            <Button
              width={"100%"}
              height={"60px"}
              borderRadius={"15px"}
              bgcolor={"rgba(102, 153, 204)"}
              bgSize="200% 200%"
              transition="all 0.1s ease-in-out"
              _hover={{ transform: "scale(1.05)" }}
              color={"black"}
              fontSize={"20px"}
              fontWeight={"bold"}
              onClick={handlesignup}
            >
              Join Now
            </Button>
            <Button
              width="100%"
              height="60px"
              borderRadius="15px"
              border="2px solid white"
              color="white"
              fontWeight="bold"
              fontSize="20px"
              bg="transparent"
              position="relative"
              overflow="hidden" 
              transition="all 0.3s ease-in-out"
              zIndex={1} 
              _before={{
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "0%", 
                height: "100%",
                bg: "white", 
                zIndex: -1, 
                transition: "width 0.2s ease-in-out", 
              }}
              _hover={{
                color: "black",
                transform: "scale(1.05)",
                _before: {
                  width: "100%", 
                },
              }}
              onClick={handleLogin}
            >
              Log in
            </Button>
          </Box>
        </Box>
        <Box width={"100%"} p={"70px"} bgColor={"white"} zIndex="100">
          <Box>
            <Image
              objectFit={"cover"}
              height={"auto"}
              width={"100%"}
              src={PosterImage}
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
                  onClick={handleviewall}
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
                    _hover={{ transform: "scale(1.05)" }}
                    onClick={handleviewall}
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
                    _hover={{
                      bgColor: "rgb(89, 131, 174)",
                      transform: "scale(1.05)",
                    }}
                    color={"white"}
                    onClick={handleviewall}
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
                    _hover={{ transform: "scale(1.05)" }}
                    onClick={handleviewall}
                  >
                    Get Started
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}

export default landing;
