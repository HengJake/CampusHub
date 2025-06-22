import React from "react";
import "./login.scss";
import { useRef, useState, useEffect, useContext } from "react";
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
  useToast,
} from "@chakra-ui/react";

import { redirect } from "react-router-dom";
import { color } from "framer-motion";
import { useDisclosure } from "@chakra-ui/react";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import { useUserStore } from "../../../store/user";
import { useNavigate } from "react-router-dom";

function login() {
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { loginUser } = useUserStore();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    //prevent spamming
    if (isLoading || isCoolingDown) {
      const toastId = "cool-down";
      if (!toast.isActive(toastId)) {
        toast({
          id: toastId,
          title: "Stop spamming 🚫",
          description: "Please wait a while to log in again",
          position: "top",
          status: "error",
          isClosable: true,
        });
      }

      return;
    }
    setIsLoading(true);

    try {
      const { success, message, data, token } = await loginUser(
        formData,
        "student"
      );

      const toastId = "log-in";
      if (!success) {
        if (!toast.isActive(toastId)) {
          toast({
            id: toastId,
            title: "Error Logging In",
            description: message,
            position: "top",
            status: "error",
            isClosable: true,
          });
        }
      } else {
        toast({
          id: toastId,
          title: "Log In successfully",
          description: message,
          position: "top",
          status: "success",
          isClosable: true,
        });

        localStorage.setItem("token", token);
        localStorage.setItem("role", data.role);
        navigate("/user-dashboard");
      }

      setIsCoolingDown(true);
      setTimeout(() => {
        setIsCoolingDown(false);
      }, 3000);

    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Unexpected Error",
        description: "Something went wrong. Please try again.",
        status: "error",
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          Enter your email and password
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
            name="email"
            p={7}
            _placeholder={{ color: "rgba(255, 255, 255, 0.37)" }}
            placeholder="Email"
            size="lg"
            color={"white"}
            required
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleLogin(e);
              }
            }}
          />
          <Input
            name="password"
            type="password"
            p={7}
            _placeholder={{ color: "rgba(255, 255, 255, 0.37)" }}
            placeholder="Password"
            size="lg"
            color={"white"}
            required
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleLogin(e);
              }
            }}
          />
          <Button
            display={"flex"}
            justifyContent="center"
            alignItems="center"
            width="100%"
            bgColor="#FF5656"
            color="white"
            _hover={{ bg: "#D34949", color: "white" }}
            onClick={handleLogin}
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
