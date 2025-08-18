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
          onSuccess={async (credentialResponse) => {
            try {
              setIsOAuthLoading(true);
              const decodedCredential = jwtDecode(credentialResponse.credential);

              // Create OAuth user data
              const oauthUserData = {
                email: decodedCredential.email,
                googleId: decodedCredential.sub,
                name: decodedCredential.name,
                profilePicture: decodedCredential.picture,
                role: "schoolAdmin", // Default role for OAuth login
                authProvider: "google"
              };

              // First try to login with OAuth (in case user already exists)
              let oauthLoginResult = await useAuthStore.getState().logInWithOAuth(oauthUserData);

              // If login fails due to account not existing, try to register
              if (!oauthLoginResult.success &&
                (oauthLoginResult.message?.includes("OAuth user not found") ||
                  oauthLoginResult.message?.includes("Account not found") ||
                  oauthLoginResult.message?.includes("Please sign up first"))) {

                // Try to register the account using OAuth signup
                const signUpResult = await useAuthStore.getState().signUpWithOAuth(oauthUserData);

                if (signUpResult.success) {

                  // After successful registration, try to login again
                  oauthLoginResult = await useAuthStore.getState().logInWithOAuth(oauthUserData);

                  if (oauthLoginResult.success) {
                  } else {
                    throw new Error("Registration successful but login failed. Please try logging in manually.");
                  }
                } else {
                  throw new Error(signUpResult.message || "Registration failed");
                }
              }

              // Check if we have a successful login result
              if (!oauthLoginResult.success) {
                throw new Error(oauthLoginResult.message || "Failed to authenticate with Google OAuth");
              }

              // Show success message
              showToast.success(
                "Google OAuth Successful!",
                oauthLoginResult.data.authProvider === 'google' && oauthLoginResult.data.createdAt === oauthLoginResult.data.updatedAt
                  ? "Welcome! Your account has been created and you are now logged in."
                  : "Welcome back! You are now logged in.",
                "oauth-success"
              );

              // Redirect based on role and setup status
              const redirectPath = getRedirectPath(oauthLoginResult.data.role, oauthLoginResult.schoolSetupComplete);

              // Show toast for lecturers
              if (oauthLoginResult.data.role === 'lecturer') {
                showToast.error(
                  "Lecturer Function Not Implemented",
                  "Lecturer functionality is currently under development. Redirecting to homepage.",
                  "lecturer-not-implemented"
                );
              }

              navigate(redirectPath);

            } catch (error) {
              console.error("Google OAuth error:", error);

              // Handle specific error cases
              if (error.message.includes("OAuth user not found") ||
                error.message.includes("Account not found") ||
                error.message.includes("Please sign up first")) {
                showToast.error(
                  "Account Not Found",
                  "No account found with this Google account. Please use the regular signup form.",
                  "oauth-no-account"
                );
              } else if (error.message.includes("authentication provider mismatch")) {
                showToast.error(
                  "Authentication Error",
                  "This email is associated with a different signup method. Please use your password to login.",
                  "oauth-provider-mismatch"
                );
              } else if (error.message.includes("User with this email already exists")) {
                showToast.error(
                  "Account Already Exists",
                  "An account with this email already exists. Please login instead.",
                  "oauth-account-exists"
                );
              } else if (error.message.includes("User with this Google account already exists")) {
                showToast.error(
                  "Google Account Already Linked",
                  "This Google account is already linked to another account. Please use a different Google account or login with your existing account.",
                  "oauth-google-exists"
                );
              } else if (error.message.includes("Registration successful but login failed")) {
                showToast.success(
                  "Account Created Successfully",
                  "Your account was created successfully, but login failed. Please try logging in manually.",
                  "oauth-registration-success"
                );
              } else if (error.message.includes("Registration failed")) {
                showToast.error(
                  "Registration Failed",
                  "Failed to create your account. Please try again or use the regular signup form.",
                  "oauth-registration-failed"
                );
              } else if (error.message.includes("OAuth registration failed")) {
                showToast.error(
                  "OAuth Registration Failed",
                  "Failed to create your account via Google. Please try again or use the regular signup form.",
                  "oauth-registration-failed"
                );
              } else {
                showToast.error(
                  "OAuth Authentication Failed",
                  error.message || "An unexpected error occurred during Google authentication",
                  "oauth-error"
                );
              }
            } finally {
              setIsOAuthLoading(false);
            }
          }}
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
