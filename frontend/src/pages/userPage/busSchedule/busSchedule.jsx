import React from "react";
import "./busSchedule.scss";
import BusImage from "/Bus.jpg";
import { IoMdArrowDropright } from "react-icons/io";
import { useState, useEffect } from "react";

import { format } from "date-fns";

import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  Badge,
} from "@chakra-ui/react";
import {
  Image,
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
  Link,
  Flex,
  HStack,
  VStack,
  IconButton,
  Divider,
  Container,
  Textarea,
} from "@chakra-ui/react";
import {
  ChevronRightIcon,
  ArrowBackIcon,
  ExternalLinkIcon,
} from "@chakra-ui/icons";

function busSchedule() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const currentDate = format(new Date(), "MMMM d, yyyy");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const calculateTimeDifference = (targetTime) => {
    const [hours, minutes] = targetTime.split(":").map(Number);
    const targetDate = new Date(currentTime);
    targetDate.setHours(hours, minutes, 0, 0);

    const diffInMinutes = Math.round((targetDate - currentTime) / 60000);

    if (diffInMinutes < 0) {
      return "Past";
    } else if (diffInMinutes < 60) {
      return `IN ${diffInMinutes} MINS`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const mins = diffInMinutes % 60;
      return `IN ${hours} HR${hours > 1 ? "S" : ""}${
        mins > 0 ? ` ${mins} MINS` : ""
      }`;
    }
  };

  const routes = [
    {
      name: "LRT - BUKIT JALIL",
      destination: "APU",
      times: ["17:40", "17:50", "18:00", "18:10"],
    },
  ];

  return (
    <Box width={"100%"} p={10}>
      <VStack spacing={6} align="start">
        {/* Header Section */}
        <Box width={"100%"} position="relative">
          <Box
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Heading as="h1" size="xl" mb={2}>
              Bus Shuttle Sevices
            </Heading>
            <Menu>
              <MenuButton
                as={Button}
                bgColor={"#DBDBDB"}
                color={"rgba(0, 0, 0, 0.3)"}
                _hover={{ bgColor: "#4E759D", color: "white" }}
                width={"225px"}
              >
                Filter Shuttles
              </MenuButton>
              <MenuList>
                <MenuGroup>
                  <MenuItem>APU</MenuItem>
                  <MenuItem>Accomodation</MenuItem>
                </MenuGroup>
              </MenuList>
            </Menu>{" "}
          </Box>

          <Text color="gray.500" fontSize="sm">
            {currentDate}
          </Text>
        </Box>

        {/* Main Content */}
        <Text fontSize="lg">
          We regularly update our bus schedules to accommodate changes in
          service demand and operational needs. Please check back frequently for
          announcements regarding any service adjustments that may affect your
          travel plans. Your understanding helps us serve you better.
        </Text>

        <Divider />

        {/* Navigation Links */}
        <Flex display={"flex"} flexDirection={"row"} w={"100%"} gap={"100px"}>
          <Box
            py={4}
            width={"100%"}
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
          >
            <Heading
              as="h1"
              size="xl"
              mb={6}
              textAlign="left"
              width={"100%"}
              color="blue.600"
            >
              APU
            </Heading>

            <VStack spacing={8} width={"100%"} divider={<Divider />}>
              {routes.map((route, index) => (
                <Box key={index} w="full">
                  <Heading
                    as="h2"
                    size="lg"
                    mb={4}
                    color="blue.600"
                    display={"flex"}
                    flexDirection={"row"}
                    alignItems={"center"}
                    gap={2}
                  >
                    {route.name}
                    <icon as={IoMdArrowDropright} color="gray.500" />
                    {route.destination && (
                      <Text
                        as="span"
                        color="gray.500"
                        fontSize={"xl"}
                        fontWeight="bold"
                      >
                        {" "}
                        {route.destination}
                      </Text>
                    )}
                  </Heading>

                  <VStack spacing={3} align="stretch">
                    {route.times.map((time, i) => {
                      const timeDifference = calculateTimeDifference(time);
                      const isPast =
                        timeDifference === "Now" ||
                        timeDifference.includes("IN -");

                      return (
                        <HStack
                          key={`${time}-${i}`}
                          justify="space-between"
                          px={2}
                        >
                          <Text fontSize="xl" fontWeight="bold">
                            {time}
                          </Text>
                          <Badge
                            display={"flex"}
                            justifyContent={"center"}
                            bgColor={
                              isPast
                                ? "rgba(255, 0, 0, 0.03)"
                                : timeDifference === "Now"
                                ? "green.50"
                                : "rgba(0, 0, 0, 0.03)"
                            }
                            color={
                              isPast
                                ? "rgba(255, 0, 0, 0.3)"
                                : timeDifference === "Now"
                                ? "green.600"
                                : "rgba(0, 0, 0, 0.3)"
                            }
                            width={"150px"}
                            fontWeight={"medium"}
                            fontSize="sm"
                            px={3}
                            py={1}
                          >
                            {timeDifference}
                          </Badge>
                        </HStack>
                      );
                    })}
                  </VStack>
                </Box>
              ))}
            </VStack>
          </Box>
          <Box
            py={4}
            width={"100%"}
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
          >
            <Heading
              as="h1"
              size="xl"
              mb={6}
              textAlign="left"
              width={"100%"}
              color="blue.600"
            >
              APU
            </Heading>

            <VStack spacing={8} width={"100%"} divider={<Divider />}>
              {routes.map((route, index) => (
                <Box key={index} w="full">
                  <Heading
                    as="h2"
                    size="lg"
                    mb={4}
                    color="blue.600"
                    display={"flex"}
                    flexDirection={"row"}
                    alignItems={"center"}
                    gap={2}
                  >
                    {route.name}
                    <icon as={IoMdArrowDropright} color="gray.500" />
                    {route.destination && (
                      <Text
                        as="span"
                        color="gray.500"
                        fontSize={"xl"}
                        fontWeight="bold"
                      >
                        {" "}
                        {route.destination}
                      </Text>
                    )}
                  </Heading>

                  <VStack spacing={3} align="stretch">
                    {route.times.map((time, i) => {
                      const timeDifference = calculateTimeDifference(time);
                      const isPast =
                        timeDifference === "Now" ||
                        timeDifference.includes("IN -");
                      return (
                        <HStack
                          key={`${time}-${i}`}
                          justify="space-between"
                          px={2}
                        >
                          <Text fontSize="xl" fontWeight="bold">
                            {time}
                          </Text>
                          <Badge
                            display={"flex"}
                            justifyContent={"center"}
                            bgColor={
                              timeDifference === "Now"
                                ? "green.50"
                                : "rgba(0, 0, 0, 0.03)"
                            }
                            color={
                              timeDifference === "Now"
                                ? "green.600"
                                : "rgba(0, 0, 0, 0.3)"
                            }
                            width={"150px"}
                            fontWeight={"medium"}
                            fontSize="sm"
                            px={3}
                            py={1}
                          >
                            {timeDifference}
                          </Badge>
                        </HStack>
                      );
                    })}
                  </VStack>
                </Box>
              ))}
            </VStack>
          </Box>
        </Flex>

        <Divider />

        {/* Footer Links */}
        <HStack spacing={4} fontSize="sm" color="gray.600">
          <Link href="#">
            <ArrowBackIcon mr={1} /> Return to home
          </Link>
          <Link href="#">About us</Link>
          <Link href="#">Give us a feedback</Link>
        </HStack>
      </VStack>
    </Box>
  );
}

export default busSchedule;
