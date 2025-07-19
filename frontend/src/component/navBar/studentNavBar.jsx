import {
  Button,
  Container,
  Flex,
  HStack,
  Text,
  useColorMode,
  Input,
  Icon,
  InputGroup,
  InputRightElement,
  Box,
} from "@chakra-ui/react";
import React, { useState } from "react";
import Sidebar from "../sidebar/studentSidebar.jsx";

import { Link, useNavigate } from "react-router-dom";
import { FaMoon } from "react-icons/fa";
import { IoSunny } from "react-icons/io5";
import { MdAccountCircle } from "react-icons/md";
import { CampusHubLogo } from "../campusHubLogo.jsx";
import { FaSearch } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import { IoIosSettings } from "react-icons/io";
import { FiMenu } from "react-icons/fi";

import "../generalComponent.scss";

function navBar() {
  // const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <Box display={"flex"} flexDir={"column"} position={"fixed"} width={"100%"} zIndex={100}>
      <Container maxWidth={"100vw"} px={4} bgColor={"blue.800"}>
        <Flex
          h={16}
          align={"center"}
          justify={"space-between"}
          flexDir={{ base: "column", md: "row" }}
          gap={"10"}
        >
          <CampusHubLogo />

          <InputGroup>
            <Input placeholder="Search..." bg="white" />
            <InputRightElement width="3rem">
              <Button
                h="1.75rem"
                size="sm"
                bg="blue.600"
                color="white"
                _hover={{ color: "blue.800", bg: "white" }}
              >
                <FaSearch />
              </Button>
            </InputRightElement>
          </InputGroup>

          <HStack spacing={2} className="utility">
            {/* Sidebar Toggle Button */}
            <Button
              bg="transparent"
              padding={0}
              _hover={{ bg: "gray.100" }}
              onClick={() => setSidebarOpen((open) => !open)}
              display={{ base: "inline-flex", md: "inline-flex" }}
              aria-label="Toggle Sidebar"
            >
              <Icon as={FiMenu} boxSize={6} color="white" />
            </Button>
            <Button
              bg="transparent"
              padding={0}
              _hover={{ bg: "gray.100" }}
              role="group"
            >
              <Icon
                as={MdAccountCircle}
                boxSize={6}
                color="white"
                _groupHover={{ color: "blue.800" }}
              />
            </Button>
            <Button
              bg="transparent"
              padding={0}
              _hover={{ bg: "gray.100" }}
              role="group"
            >
              <Icon
                as={IoIosNotifications}
                boxSize={6}
                color="white"
                _groupHover={{ color: "blue.800" }}
              />
            </Button>
            <Button
              bg="transparent"
              padding={0}
              _hover={{ bg: "gray.100" }}
              role="group"
            >
              <Icon
                as={IoIosSettings}
                boxSize={6}
                color="white"
                _groupHover={{ color: "blue.800" }}
              />
            </Button>
            <Button onClick={handleLogOut}>Log Out</Button>
          </HStack>
        </Flex>
      </Container>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </Box>
  );
}

export default navBar;
