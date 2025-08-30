// Programmer Name : Choy Chi Lam, Frontend Developer
// Program Name: login.jsx
// Description: User authentication login component with form validation, OAuth integration, and role-based redirect logic
// First Written on: June 20, 2024
// Edited on: Friday, August 5, 2024

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
  VStack,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

import { redirect } from "react-router-dom";
import { color } from "framer-motion";
import { useDisclosure } from "@chakra-ui/react";

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

  // Password reset states
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [isResetLoading, setIsResetLoading] = useState(false);

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

  // Password reset functions
  const handleSendResetOtp = async () => {
    if (!resetEmail) {
      showToast.error("Email Required", "Please enter your email address", "email-required");
      return;
    }

    setIsResetLoading(true);
    try {
      const response = await fetch("/auth/send-reset-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (data.success) {
        showToast.success("OTP Sent", "Password reset OTP has been sent to your email", "otp-sent");
        setResetStep(2);
      } else {
        showToast.error("Error", data.message || "Failed to send OTP", "otp-error");
      }
    } catch (error) {
      console.error("Error sending reset OTP:", error);
      showToast.error("Error", "Failed to send OTP. Please try again.", "otp-error");
    } finally {
      setIsResetLoading(false);
    }
  };

  const checkExistingOtp = async (email) => {
    if (!email) return false;

    try {
      const response = await fetch("/auth/check-existing-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();
      return data.success && data.hasValidOtp;
    } catch (error) {
      console.error("Error checking existing OTP:", error);
      return false;
    }
  };

  const handleEmailSubmit = async () => {
    if (!resetEmail) {
      showToast.error("Email Required", "Please enter your email address", "email-required");
      return;
    }

    setIsResetLoading(true);
    try {
      // First check if user already has a valid OTP
      const hasExistingOtp = await checkExistingOtp(resetEmail);

      if (hasExistingOtp) {
        // User has existing valid OTP, skip to step 2
        showToast.info("Existing OTP Found", "You already have a valid OTP. Please enter it to continue.", "existing-otp");
        setResetStep(2);
      } else {
        // No existing OTP, send new one
        await handleSendResetOtp();
      }
    } catch (error) {
      console.error("Error in email submission:", error);
      showToast.error("Error", "Failed to process request. Please try again.", "email-submit-error");
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!resetOtp) {
      showToast.error("OTP Required", "Please enter the OTP sent to your email", "otp-required");
      return;
    }

    setIsResetLoading(true);
    try {
      const response = await fetch("/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail,
          otp: resetOtp,
          newPassword: newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast.success("Password Reset", "Your password has been reset successfully", "password-reset");
        handleCloseResetModal();
      } else {
        showToast.error("Error", data.message || "Failed to reset password", "reset-error");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      showToast.error("Error", "Failed to reset password. Please try again.", "reset-error");
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleVerifyOtpOnly = async () => {
    if (!resetOtp) {
      showToast.error("OTP Required", "Please enter the OTP sent to your email", "otp-required");
      return;
    }

    setIsResetLoading(true);
    try {
      // First verify the OTP without changing password
      const response = await fetch("/auth/verify-reset-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail,
          otp: resetOtp
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast.success("OTP Verified", "OTP verification successful. Please enter your new password.", "otp-verified");
        setResetStep(3);
      } else {
        showToast.error("Invalid OTP", data.message || "Invalid or expired OTP", "otp-invalid");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      showToast.error("Error", "Failed to verify OTP. Please try again.", "otp-verify-error");
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleCloseResetModal = () => {
    setResetStep(1);
    setResetEmail("");
    setResetOtp("");
    setNewPassword("");
    setShowNewPassword(false);
    onClose();
  };

  const handleBackToEmail = () => {
    setResetStep(1);
    setResetEmail("");
    setResetOtp("");
    setNewPassword("");
    setShowNewPassword(false);
  };

  const handleResetModalClose = () => {
    if (resetStep > 1) {
      // If user is in middle of reset process, ask for confirmation
      if (window.confirm("Are you sure you want to cancel? Your progress will be lost.")) {
        handleCloseResetModal();
      }
    } else {
      handleCloseResetModal();
    }
  };

  // Check for existing OTP when modal opens
  useEffect(() => {
    if (isOpen && resetEmail) {
      // If modal opens with an email, check if there's existing OTP
      checkExistingOtp(resetEmail).then(hasExistingOtp => {
        if (hasExistingOtp) {
          setResetStep(2);
        }
      });
    }
  }, [isOpen, resetEmail]);

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
            justifyContent={"right"}
            paddingTop={5}
          >
            <ChakraLink
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

        {/* Password Reset Modal */}
        <Modal isOpen={isOpen} onClose={handleResetModalClose} width="100%">
          <ModalOverlay />

          <ModalContent
            w={"100%"}
            bg="rgba(0, 0, 0, 0.5)"
            backdropFilter="blur(10px)"
            color="white"
          >
            <ModalHeader>Reset Password</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                {/* Step 1: Email Input */}
                {resetStep === 1 && (
                  <>
                    <Text>Enter your email to receive a password reset OTP</Text>
                    <Input
                      p={5}
                      _placeholder={{ color: "rgba(255, 255, 255, 0.37)" }}
                      placeholder="Email"
                      size="lg"
                      color={"white"}
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleEmailSubmit();
                        }
                      }}
                    />
                  </>
                )}

                {/* Step 2: OTP Input */}
                {resetStep === 2 && (
                  <>
                    <Text>Enter the 6-digit OTP sent to:</Text>
                    <Text fontWeight="bold" color="blue.400">{resetEmail}</Text>
                    <Text>Enter OTP:</Text>
                    <Input
                      p={5}
                      _placeholder={{ color: "rgba(255, 255, 255, 0.37)" }}
                      placeholder="Enter OTP"
                      size="lg"
                      color={"white"}
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value)}
                      maxLength={6}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && resetOtp.length === 6) {
                          handleVerifyOtpOnly();
                        }
                      }}
                    />
                    <Text fontSize="sm" color="rgba(255, 255, 255, 0.7)">
                      Didn't receive OTP?{" "}
                      <Button
                        variant="link"
                        color="blue.400"
                        onClick={handleSendResetOtp}
                        isLoading={isResetLoading}
                        size="sm"
                      >
                        Resend
                      </Button>
                    </Text>
                    <Button
                      variant="link"
                      color="blue.400"
                      onClick={handleBackToEmail}
                      size="sm"
                    >
                      Use a different email address
                    </Button>
                  </>
                )}

                {/* Step 3: New Password Input */}
                {resetStep === 3 && (
                  <>
                    <Text>Enter your new password</Text>
                    <InputGroup>
                      <Input
                        p={5}
                        _placeholder={{ color: "rgba(255, 255, 255, 0.37)" }}
                        placeholder="New Password"
                        size="lg"
                        color={"white"}
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newPassword) {
                            handleVerifyOtp();
                          }
                        }}
                      />
                      <InputRightElement p={7}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          color="white"
                          _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                        >
                          {showNewPassword ? <ViewOffIcon /> : <ViewIcon />}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </>
                )}
              </VStack>
            </ModalBody>

            <ModalFooter>
              <HStack spacing={3} width="100%">
                {resetStep > 1 && resetStep !== 3 && (
                  <Button
                    color={"white"}
                    bg={"gray.600"}
                    variant="solid"
                    onClick={resetStep === 2 ? handleBackToEmail : () => setResetStep(resetStep - 1)}
                    size={"sm"}
                    _hover={{ bg: "gray.700" }}
                    flex={1}
                  >
                    {resetStep === 2 ? "Back to Email" : "Back"}
                  </Button>
                )}
                <Button
                  color={"white"}
                  bg={"#FF5656"}
                  variant="solid"
                  onClick={
                    resetStep === 1
                      ? handleEmailSubmit
                      : resetStep === 2
                        ? handleVerifyOtpOnly
                        : handleVerifyOtp
                  }
                  size={"sm"}
                  _hover={{ bg: "#FF0000" }}
                  isLoading={isResetLoading}
                  isDisabled={
                    (resetStep === 1 && !resetEmail) ||
                    (resetStep === 2 && resetOtp.length !== 6) ||
                    (resetStep === 3 && !newPassword)
                  }
                  flex={resetStep === 1 ? 1 : 2}
                >
                  {resetStep === 1
                    ? "Send OTP"
                    : resetStep === 2
                      ? "Continue"
                      : "Reset Password"}
                </Button>
              </HStack>
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
