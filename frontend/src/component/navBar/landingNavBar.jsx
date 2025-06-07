import {
  Button,
  Container,
  Flex,
  HStack,
  Image,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import React from "react";
import { Link } from "react-router-dom";
import { FaMoon } from "react-icons/fa";
import { IoSunny } from "react-icons/io5";
import { MdAccountCircle } from "react-icons/md";
import {CampusHubLogo} from "../campusHubLogo.jsx";

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

        <HStack spacing={4} display={{ base: "none", md: "flex" }}>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/service">Service</Link>
          <Link to="/contact">Contact</Link>
        </HStack>

        <HStack>
          <Button backgroundColor={"blue.600"} color={"white"}>
            <Link to="/signup">Join Now</Link>
          </Button>
        </HStack>
      </Flex>
    </Container>
  );
}

export default navBar;
