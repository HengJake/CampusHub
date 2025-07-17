import React from "react";
import "./campusRide.scss";
import RegisterBox from "../../../component/common/registerBox";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
} from "@chakra-ui/react";
import sideViewCar from "/sideViewCar.png";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
} from "@chakra-ui/react";

import {
  SimpleGrid,
  VStack,
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
  useToast,
  Flex,
} from "@chakra-ui/react";

function campusRide() {
  const rideCategories = [
    {
      rides: [{ name: "Nissan GTR", distance: "1.7 km" }],
    },
    {
      rides: [{ name: "Toyota camry", distance: "670 m" }],
    },
    {
      rides: [{ name: "Lamborghini Huracan", distance: "2.2 km" }],
    },
  ];
  return (
    <Flex
      flex={1}
      height={"calc(100% - 60px)"}
      width="100%"
      position="relative"
      overflowY="hidden"
      display={"flex"}
      justifyContent={"center"}
    >
      <Box width="100%" height="100%" position="fixed" top={"60px"} left={0} zIndex={-1}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.14662745759!2d101.69798647602784!3d3.0554056969203773!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc4abb795025d9%3A0x1c37182a714ba968!2sAsia%20Pacific%20University%20of%20Technology%20%26%20Innovation%20(APU)!5e0!3m2!1sen!2smy!4v1751102964249!5m2!1sen!2smy"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="APU Campus Map"
        />
      </Box>

      <Box
        position="absolute"
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        alignContent={"center"}
        bottom={10}
        zIndex={1}
        width={"100%"}
        gap={10}
      >
        <Box
          display={"flex"}
          alignItems={"center"}
          height={"100%"}
          // border={"1px"}
          flexDirection={"column"}
          gap={1}
          position={"relative"}
        >
          <Box
            bgColor={"white"}
            width={"65%"}
            height={"100%"}
            borderRadius={"xl"}
            display={"flex"}
            boxShadow={"sm"}
            flexDirection={"column"}
            position="relative"
          >
            <Menu isLazy>
              <MenuButton textAlign={"left"} width={"100%"} p={5}>
                From
              </MenuButton>
              <MenuList width="440%">
                <MenuItem>Location 1</MenuItem>
                <MenuItem>Location 2</MenuItem>
                <MenuItem>Location 3</MenuItem>
              </MenuList>
            </Menu>
            <hr />
            <Menu isLazy>
              <MenuButton textAlign={"left"} width={"100%"} p={5}>
                To
              </MenuButton>
              <MenuList width="440%">
                <MenuItem>Location 1</MenuItem>
                <MenuItem>Location 2</MenuItem>
                <MenuItem>Location 3</MenuItem>
              </MenuList>
            </Menu>
          </Box>
        </Box>

        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"center"}
          gap={10}
        >
          {" "}
          {rideCategories.map((category, catIndex) => (
            <Box
              display={"flex"}
              justifyItems={"center"}
              alignItems={"center"}
              key={catIndex}
              width={"20%"}
            >
              {category.rides.map((ride, rideIndex) => (
                <Flex
                  fontSize={"20px"}
                  key={rideIndex}
                  display={"flex"}
                  width={"100%"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  flexDirection={"column"}
                  p={3}
                  borderRadius="xl"
                  boxShadow={"lg"}
                  bg={catIndex === 1 ? "#FF5656" : "rgba(255, 255, 255, 0.5)"}
                  backdropFilter="blur(5px)"
                  color={catIndex === 1 ? "white" : "black"}
                  transition="all 0.3s ease-in-out"
                  _hover={{
                    bg: catIndex === 1 ? "#FC3939" : "white",
                    transform: "scale(1.02)",
                  }}
                >
                  <Text fontWeight="medium">{ride.name}</Text>
                  <Text color={catIndex === 1 ? "whiteAlpha.800" : "gray.500"}>
                    {ride.distance}
                  </Text>
                  <Image
                    src={sideViewCar}
                    alt="sideviewcar"
                    width={"70%"}
                    height={"fit-content"}
                    objectFit={"fill"}
                    transition="all 0.2s ease-in-out"
                    _hover={{ transform: "scale(1.4)" }}
                  ></Image>
                </Flex>
              ))}
            </Box>
          ))}
        </Box>

        <Box display={"flex"} justifyContent={"center"}>
          <Button
            fontWeight={"medium"}
            fontSize={"16px"}
            borderRadius={"10px"}
            width={"20%"}
            size={"lg"}
            bgColor="#FF5656"
            color={"white"}
            boxShadow={"md"}
            transition="all 0.1s ease-in-out"
            _hover={{
              bgColor: "#FC3939",
              transform: "scale(1.02)",
            }}
          >
            BOOK NOW
          </Button>
        </Box>
      </Box>
    </Flex>
  );
}

export default campusRide;
