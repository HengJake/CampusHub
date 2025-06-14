import React from "react";
import "./login.scss";
import { AiFillAlert } from "react-icons/ai";

import {
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
} from "@chakra-ui/react";

import { redirect } from "react-router-dom";
import { color } from "framer-motion";
import { useDisclosure } from "@chakra-ui/react";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";

function login() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box flex={1} display={"flex"} justifyContent="center" alignItems="center">
      {/* LoginBox */}
      <Box
        position="fixed"
        height={"470px"}
        width={"450px"}
        borderRadius={"20px"}
        zIndex={100}
        p={3}
        backdropFilter="blur(15px)"
        bg="rgba(0, 0, 0, 0.24)" // translucent glass
        boxShadow="lg"
        color={"black"}
      >
        <Heading
          padding={"5"}
          marginTop="50px"
          display={"flex"}
          justifyContent={"center"}
          alignItems={"Center"}
          color={"white"}
          fontSize={"30"}
        >
          Login
        </Heading>
        <Text
          justifyContent={"center"}
          alignItems={"center"}
          display={"flex"}
          color={"White"}
        >
          Enter your student ID and password
        </Text>

        <Stack
          display={"flex"}
          justifyContent="center"
          alignItems="center"
          spacing={3}
          zIndex={100}
          p={5}
        >
          <Input
            p={7}
            _placeholder={{ color: "rgba(255, 255, 255, 0.37)" }}
            placeholder="Student ID"
            size="lg"
            color={"white"}
          />
          <Input
            p={7}
            _placeholder={{ color: "rgba(255, 255, 255, 0.37)" }}
            placeholder="Password"
            size="lg"
            color={"white"}
          />
          <Button
            display={"flex"}
            justifyContent="center"
            alignItems="center"
            width="100%"
            bgColor="#FF5656"
            color="white"
            _hover={{ bg: "#D34949", color: "white" }}
          >
            LOGIN
          </Button>

          <Box
            width={"100%"}
            display="flex"
            alignContent={"space-between"}
            flexDirection={"row"}
          >
            <Checkbox width={"100%"} color={"white"} defaultChecked>
              Remember me
            </Checkbox>
            <ChakraLink
              width={"100%"}
              display={"flex"}
              justifyContent={"right"}
              color="White"
              onClick={onOpen}
            >
              Forget passsword ?
            </ChakraLink>
          </Box>
        </Stack>
      </Box>

      {/* Pop Up */}

      <Modal isOpen={isOpen} onClose={onClose} width="100%">
        <ModalOverlay />

        <ModalContent w={"100%"} bgColor="white">
          <ModalHeader>Forget Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Enter your email to reset your password</Text>
            <br />
            <Input
              p={3}
              _placeholder={{ color: "rgba(0, 0, 0, 0.37)" }}
              placeholder="Email"
              size="lg"
              color={"black"}
            />
          </ModalBody>

          <ModalFooter>
            <Button color={"white"} bg={"#FF5656"} variant="solid">
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Background Design */}
      <Box
        position="fixed"
        bottom="-350px"
        right="-200px"
        width="600px"
        height="600px"
        borderRadius="full"
        bgGradient="linear(to-br, #1B4965, #3693CB)"
        zIndex="1"
      ></Box>
      <Box
        position="fixed"
        bottom="-100px"
        left="-400px"
        width="810px"
        height="810px"
        borderRadius="full"
        bgGradient="linear(to-br, #1B4965, #3693CB)"
        zIndex="1"
      ></Box>
      <Box
        position="fixed"
        bottom="-900px"
        left="75px"
        width="1600px"
        height="1600px"
        borderRadius="full"
        bgGradient="linear(to-br, #1B4965, #3693CB)"
        zIndex="0"
      ></Box>
    </Box>
  );
}

export default login;
