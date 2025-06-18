import React from "react";
import "./loginCampushub.scss";
import {
  Box,
  VStack,
  Text,
  HStack,
  InputGroup,
  Input,
  InputRightElement,
  Button,
  InputLeftElement,
  Checkbox,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { FaPhoneAlt } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { MdCheckBoxOutlineBlank } from "react-icons/md";
import { MdOutlineCheckBox } from "react-icons/md";

function loginCampushub() {
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);

  return (
    <Box
      flex={1}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      overflow={"hidden"}
    >
      {/*Company Admin Login Form */}
      <Box
        p={3}
        align={"left"}
        backdropFilter="blur(10px)"
        bg="rgba(0, 0, 0, 0.5)" // translucent glass
        border="1px solid rgba(255, 255, 255, 0.2)"
        boxShadow="lg"
        borderRadius="lg"
        color={"#d6c2b4"}
        zIndex={100}
      >
        <VStack>
          <InputGroup>
            <InputRightElement pointerEvents="none">
              <HiOutlineMail size={25} color="gray.500" />
            </InputRightElement>
            <Input
              type="tel"
              placeholder="Enter your email..."
              _placeholder={{ color: "gray.300" }}
            />
          </InputGroup>
          <InputGroup size="md">
            <Input
              pr="4.5rem"
              type={show ? "text" : "password"}
              placeholder="Enter your password..."
              _placeholder={{ color: "gray.300" }}
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={handleClick}>
                {show ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
          <HStack
            justify="space-between"
            align="center"
            w="100%"
            fontSize="0.7rem"
          >
            <HStack spacing={2} align="center">
              <Text textAlign={"left"}>Remember me</Text>
              <Checkbox colorScheme="orange"></Checkbox>
            </HStack>
            <ChakraLink whiteSpace="nowrap">Forget Password</ChakraLink>
          </HStack>

          <Button w={"100%"} bg={"#8b5e3c"} mt={5}>
            LOGIN
          </Button>
        </VStack>
      </Box>

      {/*Background box */}
      <Box
        position="fixed"
        bottom="-200px"
        left="-200px"
        width="300px"
        height="600px"
        borderRadius="full"
        bgGradient="linear(to-br, #a57b5e, #8b5e3c)"
        zIndex="0"
      ></Box>
      <Box
        position="fixed"
        bottom="-300px"
        left="-100px"
        width="300px"
        height="600px"
        borderRadius="full"
        bgGradient="linear(to-br, #a57b5e, #8b5e3c)"
        zIndex="0"
      ></Box>
      <Box
        position="fixed"
        bottom="-200px"
        right="-200px"
        width="300px"
        height="600px"
        borderRadius="full"
        bgGradient="linear(to-br, #a57b5e, #8b5e3c)"
        zIndex="0"
      ></Box>
      <Box
        position="fixed"
        bottom="-300px"
        right="-100px"
        width="300px"
        height="600px"
        borderRadius="full"
        bgGradient="linear(to-br, #a57b5e, #8b5e3c)"
        zIndex="0"
      ></Box>
    </Box>
  );
}

export default loginCampushub;
