import React from "react";
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
  Link,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

import { redirect } from "react-router-dom";
import { color } from "framer-motion";
import { useDisclosure } from "@chakra-ui/react";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import { useUserStore } from "../../../store/user";
import { useNavigate } from "react-router-dom";
import RegisterBox from "../../../component/common/registerBox";
import LoginBackground from "/LoginBackground.png";
import { Image } from "@chakra-ui/react";
import { useAuthStore } from "../../../store/auth";
import { detectTokenAndRedirect, getRedirectPath } from "../../../utils/authRedirect.js";
import { useShowToast } from "../../../store/utils/toast.js";

function login() {
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const showToast = useShowToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  // fix login user
  const { logIn } = useAuthStore();

  // Check for existing JWT token and redirect if necessary
  useEffect(() => {
    const checkExistingAuth = async () => {
      const redirected = await detectTokenAndRedirect(navigate);
      if (redirected) {
        showToast.success(
          "Welcome back!",
          "You are already logged in.",
          "auto-login"
        );
      }
    };

    checkExistingAuth();
  }, [navigate, showToast]);

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
      showToast.error(
        "Stop spamming",
        "Please wait a while to log in again",
        "cool-down"
      );
      return;
    }
    setIsLoading(true);

    try {
      const { success, message, data, token } = await logIn(formData);

      if (!success) {
        showToast.error(
          "Error Logging In",
          message,
          "log-in"
        );
      } else {
        showToast.success(
          "Log In successfully",
          message,
          "log-in"
        );

        // Redirect based on role and setup status
        const redirectPath = getRedirectPath(data.role, data.schoolSetupComplete);
        navigate(redirectPath);
      }

      setIsCoolingDown(true);
      setTimeout(() => {
        setIsCoolingDown(false);
      }, 3000);
    } catch (error) {
      console.error("Unexpected error:", error);
      showToast.error(
        "Unexpected Error",
        "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      m={"auto auto"}
      maxW={"md"}
      width={"100%"}
      bgColor={"#1A202C"}
      borderRadius={"md"}
    >
      <Image
        objectFit={"cover"}
        position={"fixed"}
        top={0}
        right={0}
        display={"flex"}
        height={"100%"}
        width={"100%"}
        src={LoginBackground}
        alt="Login Background"
      />

      <RegisterBox
        heading={"Login"}
        buttonText="Login"
        buttonClick={handleLogin}
        footer={
          <Box
            width={"100%"}
            display="flex"
            flexDirection={"row"}
            paddingTop={5}
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
        }
      >
        <Text textAlign={"left"}>
          Don't have an account?{" "}
          <Link color={"blue.400"} textDecor={"underline"} ml={3} onClick={() => navigate("/signup")}>
            Sign Up
          </Link>
        </Text>
        <Box
          mt={2}
          display={"flex"}
          flexDirection={"column"}
          gap={5}
          height={"100%"}
          width={"100%"}
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

          <InputGroup>
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
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
            <InputRightElement p={7}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPassword(!showPassword)}
                color="white"
                _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
              >
                {showPassword ? <ViewOffIcon /> : <ViewIcon />}
              </Button>
            </InputRightElement>
          </InputGroup>
        </Box>

        {/* Pop Up */}
        <Modal isOpen={isOpen} onClose={onClose} width="100%">
          <ModalOverlay />

          <ModalContent
            w={"100%"}
            bg="rgba(0, 0, 0, 0.5)"
            backdropFilter="blur(10px)"
            color="white"
          >
            <ModalHeader>Forget Password</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>Enter your email to reset your password</Text>
              <br />
              <Input
                p={5}
                _placeholder={{ color: "rgba(255, 255, 255, 0.37)" }}
                placeholder="Email"
                size="lg"
                color={"white"}
              />
            </ModalBody>

            <ModalFooter>
              <Button
                color={"white"}
                bg={"#FF5656"}
                variant="solid"
                width={"100%"}
                onClick={onClose}
                size={"sm"}
                _hover={{ bg: "#FF0000" }}
              >
                Submit
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </RegisterBox>
    </Box>
  );
}

export default login;
