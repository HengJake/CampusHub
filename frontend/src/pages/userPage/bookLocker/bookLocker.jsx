import React from "react";
import "./bookLocker.scss";
import { useNavigate } from "react-router-dom";

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
  return (
    <Flex
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
    >
      <Box>bookLocker Page</Box>
    </Flex>
  );
}

export default bookLocker;
