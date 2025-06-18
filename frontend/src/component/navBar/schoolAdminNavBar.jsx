import {
  Button,
  Container,
  Flex,
  HStack,
  Input,
  Icon,
  InputGroup,
  InputRightElement,
  Link as ChakraLink
} from "@chakra-ui/react";
import Sidebar from "../sidebar/schoolAdminSidebar.jsx";

import { Link as RouterLink } from "react-router-dom";
import { MdAccountCircle } from "react-icons/md";
import { CampusHubLogo } from "../campusHubLogo.jsx";
import { FaSearch } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import { IoIosSettings } from "react-icons/io";

import "../generalComponent.scss";

function navBar() {
  // const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Container maxWidth={"100vw"} px={4} className="navBar" bg="#344E41">
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
              bg="#344E41"
              color="white"
              _hover={{ color: "#344E41", bg: "white" }}
            >
              <FaSearch />
            </Button>
          </InputRightElement>
        </InputGroup>

        <HStack spacing={2} className="utility">
          <Button
            bg="transparent"
            padding={0}
            _hover={{ bg: "gray.100" }}
            role="group"
          >
            <ChakraLink as={RouterLink} to={"student-management"}>
              <Icon
                as={MdAccountCircle}
                boxSize={6}
                color="white"
                _groupHover={{ color: "blue.800" }}
              />
            </ChakraLink>
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
        </HStack>
      </Flex>
      <Sidebar />
    </Container>
  );
}

export default navBar;
