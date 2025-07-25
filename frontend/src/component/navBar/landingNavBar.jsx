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
import { MdAccountCircle } from "react-icons/md";
import { CampusHubLogo } from "../campusHubLogo.jsx";
import { useLocation } from "react-router-dom";

function navBar() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <Container
      maxWidth={"100vw"}
      px={4}
      bg={isHomePage ? "transparent" : "white"}
      position={isHomePage ? "absolute" : ""}
      zIndex={1000}
    >
      <Flex
        h={16}
        align={"center"}
        justify={"space-between"}
        flexDir={{ base: "column", md: "row" }}
      >
        <CampusHubLogo />

        <HStack
          spacing={8}
          display={{ base: "none", md: "flex" }}
          position={"absolute"}
          transform={"translateX(50%)"}
        >
          <Text color={"gray.800"}>
            <Link to="/">Home</Link>
          </Text>
          <Text color={"gray.800"}>
            <Link to="/about">About</Link>
          </Text>
          <Text color={"gray.800"}>
            <Link to="/pricing">Pricing</Link>
          </Text>
          <Text color={"gray.800"}>
            <Link to="/service">Service</Link>
          </Text>
          <Text color={"gray.800"}>
            <Link to="/contact-us">Contact</Link>
          </Text>
        </HStack>

        <HStack>
          <Button
            bg={"transparent"}
            _hover={{ bg: "blue.200" }}
            color={"blue.800"}
          >
            <Link to="/login">Login</Link>
          </Button>
          <Button backgroundColor={"blue.600"} color={"white"}>
            <Link to="/signup">Join Now</Link>
          </Button>
        </HStack>
      </Flex>
    </Container>
  );
}

export default navBar;
