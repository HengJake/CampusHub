import {
  Button,
  Container,
  Flex,
  HStack,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import React from "react";
import { Link } from "react-router-dom";
import { FaMoon } from "react-icons/fa";
import { IoSunny } from "react-icons/io5";
import { MdAccountCircle } from "react-icons/md";
import { CampusHubLogo } from "../campusHubLogo.jsx";


function navBar() {
  // const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Container maxWidth={"100vw"} px={4} className="navBar">
      <Flex
        h={16}
        align={"center"}
        justify={"space-between"}
        flexDir={{ base: "column", md: "row" }}
      >
        <CampusHubLogo />
      </Flex>
    </Container>
  );
}

export default navBar;
