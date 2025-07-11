import React, { useState } from "react";
import "./bookLocker.scss";
import { useNavigate } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import { LuSettings2 } from "react-icons/lu";
import { SimpleGrid } from "@chakra-ui/react";
import Locker from "../../../component/Student/Locker/Locker";

import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  IconButton,
} from "@chakra-ui/react";

import {
  Box,
  Grid,
  Flex,
  Stack,
  HStack,
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
import classSchedule from "../classSchedule/classSchedule";

function bookLocker() {
  const noOfLocker = 20;
  const [bookedLockers, setBookedLockers] = useState(Array(noOfLocker).fill(false));

  const handleBook = (index) => {
    setBookedLockers((prev) => {
      if (prev[index]) return prev;
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  };

  return (
    <Flex
      display="flex"
      flexDirection="row"
      alignItems="center"
      // justifyContent="center"
      border={"1px"}
      height="100%"
      w="100%"
      gap={"5%"}
      p={5}
    >
      <Box
        display="flex"
        p={5}
        alignItems="center"
        justifyContent="left"
        gap={"30px"}
        border={"1px"}
        w={"40%"}
        h={"100%"}
      >
        <Menu w="100%" border="1px">
          <MenuButton
            px={4}
            py={2}
            transition="all 0.2s"
            borderRadius="15px"
            borderWidth="1px"
            h={"50px"}
            w={"fit-content"}
            _hover={{ bg: "gray.400" }}
            _expanded={{ bg: "blue.400" }}
            _focus={{ boxShadow: "outline" }}
          >
            <LuSettings2 size={20} />
          </MenuButton>
          <MenuList>
            <MenuGroup title="Filters">
              <MenuItem>New File</MenuItem>
              <MenuItem>New Window</MenuItem>
              <MenuDivider />
              <MenuItem>Open...</MenuItem>
              <MenuItem>Save File</MenuItem>
            </MenuGroup>
          </MenuList>
        </Menu>
        <Text fontSize={"24px"} fontWeight={"bold"}>
          Lockers | Floor 1
        </Text>
      </Box>
      <Box w={"100%"} h={"fit-content"} border={"1px"}>
        <SimpleGrid minChildWidth="100px" spacing="20px">
          {Array.from({ length: noOfLocker }, (_, i) => (
            <Locker
              key={i}
              number={i + 1}
              isBooked={bookedLockers[i]}
              onBook={() => handleBook(i)}
            />
          ))}
        </SimpleGrid>
      </Box>
    </Flex>
  );
}

export default bookLocker;
