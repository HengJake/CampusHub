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
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

function login() {
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
  const { logIn, logout } = useAuthStore();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkModalData, setLinkModalData] = useState(null);
  const [linkPassword, setLinkPassword] = useState("");

  // Check for existing JWT token and redirect if necessary
  useEffect(() => {
    const checkExistingAuth = async () => {
      const result = await detectTokenAndRedirect(navigate);
      if (result.redirected) {
        if (result.isLecturer) {
          showToast.error(
            "Lecturer Function Not Implemented",
            "Lecturer functionality is currently under development. Redirecting to homepage.",
            "lecturer-not-implemented"
          );

          await logout();

        } else {
          showToast.success(
            "Welcome back!",
            "You are already logged in.",
            "auto-login"
          );
        }
      }
    };

    checkExistingAuth();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isLoading) {
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

        // Show toast for lecturers
        if (data.role === 'lecturer') {
          showToast.error(
            "Lecturer Function Not Implemented",
            "Lecturer functionality is currently under development. Redirecting to homepage.",
            "lecturer-not-implemented"
          );
        }

        navigate(redirectPath);
      }

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

  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  const handleOAuthLogin = async (credentialResponse) => {
    try {
      setIsOAuthLoading(true);
      const decodedCredential = jwtDecode(credentialResponse.credential);

      const oauthUserData = {
        email: decodedCredential.email,
        googleId: decodedCredential.sub,
        name: decodedCredential.name,
        profilePicture: decodedCredential.picture,
        provider: 'google',
        providerId: decodedCredential.sub
      };

      // Use unified authentication
      const authResult = await useAuthStore.getState().unifiedAuth(oauthUserData);

      if (authResult.success) {
        // Check if this is a new account or existing user
        if (authResult.message === "new_account_created") {
          showToast.success("Account created!", "Welcome! Your account has been created and you are now logged in.", "oauth-success");
        } else {
          showToast.success("Login successful!", "Welcome back!", "oauth-success");
        }
        navigate(getRedirectPath(authResult.data.role, authResult.data.schoolSetupComplete));
      } else if (authResult.message === "link_oauth_required") {
        // Account linking required
        setLinkModalData(authResult.data);
        setShowLinkModal(true);
      } else {
        // Other error
        showToast.error("Login failed", authResult.message, "oauth-error");
      }
    } catch (error) {
      console.error("OAuth error:", error);
      showToast.error("Authentication failed", error.message, "oauth-error");
    } finally {
      setIsOAuthLoading(false);
    }
  };

  const handleLinkAccounts = async () => {
    if (!linkPassword.trim()) {
      showToast.error("Password required", "Please enter your password to link accounts", "link-error");
      return;
    }

    try {
      setIsLoading(true);

      const linkResult = await useAuthStore.getState().linkOAuthAccount(
        linkModalData.user.email,
        linkPassword,
        linkModalData.oauthData
      );

      if (linkResult.success) {
        showToast.success("Accounts linked!", "You can now login with either method", "link-success");
        setShowLinkModal(false);
        setLinkPassword("");

        // Auto-login after linking
        navigate(getRedirectPath(linkResult.data.role, linkResult.data.schoolSetupComplete));
      } else {
        showToast.error("Linking failed", linkResult.message, "link-error");
      }
    } catch (error) {
      showToast.error("Linking failed", error.message, "link-error");
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

        <GoogleLogin
          onSuccess={handleOAuthLogin}
          onError={() => {
            console.log('Google OAuth Failed');
            setIsOAuthLoading(false);
            showToast.error(
              "Google OAuth Failed",
              "Failed to authenticate with Google. Please try again or use the regular login form.",
              "oauth-error"
            );
          }}
        />

        {/* OAuth Loading Indicator */}
        {isOAuthLoading && (
          <Box textAlign="center" mt={2}>
            <Text color="blue.400" fontSize="sm">
              Processing Google authentication...
            </Text>
          </Box>
        )}

        {/* Divider */}
        <Box position="relative" my={6}>
          <Box
            position="absolute"
            top="50%"
            left="0"
            right="0"
            height="1px"
            bg="gray.600"
          />
          <Text
            position="relative"
            bg="#1A202C"
            px={4}
            color="gray.400"
            fontSize="sm"
            textAlign="center"
            display="inline-block"
            left="50%"
            transform="translateX(-50%)"
          >
            OR
          </Text>
        </Box>

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

        {/* Account Linking Modal */}
        <Modal isOpen={showLinkModal} onClose={() => setShowLinkModal(false)}>
          <ModalOverlay />
          <ModalContent
            w={"100%"}
            bg="rgba(0, 0, 0, 0.5)"
            backdropFilter="blur(10px)"
            color="white"
          >
            <ModalHeader>Link Your Google Account</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text mb={4}>
                We found an account with email <strong>{linkModalData?.user?.email}</strong> that was created with a password.
              </Text>
              <Text mb={4}>
                To link your Google account, please enter your password:
              </Text>
              <Input
                type="password"
                placeholder="Enter your password"
                value={linkPassword}
                onChange={(e) => setLinkPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLinkAccounts();
                  }
                }}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                onClick={() => setShowLinkModal(false)}
                color="white"
                _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
              >
                Cancel
              </Button>
              <Button
                color={"white"}
                bg={"#FF5656"}
                variant="solid"
                mr={3}
                onClick={handleLinkAccounts}
                isLoading={isLoading}
                _hover={{ bg: "#FF0000" }}
              >
                Link Accounts
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Text textAlign={"left"} mt={3}>
          Don't have an account?{" "}
          <Link color={"blue.400"} textDecor={"underline"} ml={3} onClick={() => navigate("/signup")}>
            Sign Up
          </Link>
        </Text>
      </RegisterBox>
    </Box>
  );
}

export default login;
