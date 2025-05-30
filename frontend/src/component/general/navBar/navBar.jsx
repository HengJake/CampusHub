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
        <Text
          fontSize="2xl"
          fontWeight="bold"
          bg="linear-gradient(90deg, #FF0080, #7928CA)"
          bgClip="text"
        >
          <Link to="/">CampusHub</Link>
        </Text>

        <HStack>
          {/* <Button
              onClick={toggleColorMode}
              aria-label="Toggle Color Mode"
            >  */}
              { // colorMode === "light" ? <FaMoon /> : <IoSunny />
              }
           {/* </Button> */}
          <Button>
            <Link to="/login">
              <MdAccountCircle fontSize={30} />
            </Link>
          </Button>
        </HStack>
      </Flex>
    </Container>
  );
}

export default navBar;
