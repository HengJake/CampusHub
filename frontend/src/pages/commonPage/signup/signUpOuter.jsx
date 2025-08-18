import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Text,
  HStack,
  Input,
  Button,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  Checkbox,
  Link as ChakraLink,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  SimpleGrid,
  useDisclosure,
  Image,
  Link,
} from "@chakra-ui/react";
import { CgProfile } from "react-icons/cg";
import { ViewIcon, ViewOffIcon, PhoneIcon, EmailIcon, LockIcon } from "@chakra-ui/icons";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/auth.js";
import { useUserStore } from "../../../store/user.js";
import { useShowToast } from "../../../store/utils/toast.js";
import RegisterBox from "../../../component/common/registerBox.jsx";
import LoginBackground from "/LoginBackground.png";
import { detectTokenAndRedirect, getRedirectPath } from "../../../utils/authRedirect.js";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

function SignUpOuter() {
  const { authorizeUser, logout, logIn } = useAuthStore();
  const { deleteUser } = useUserStore();
  const showToast = useShowToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const [formData, setFormData] = useState({
    // Step 1: User Details
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

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

  // Sample data for debugging
  const sampleData = {
    firstName: "John",
    lastName: "Doe",
    phoneNumber: "0123456789",
    email: "john.doe@example.com",
    password: "TestPass123!",
    confirmPassword: "TestPass123!",
  };

  const loadSampleData = () => {
    setFormData(sampleData);
    setTouched({
      firstName: true,
      lastName: true,
      phoneNumber: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    // Clear any existing errors
    setErrors({});
  };

  const steps = [
    "User Details",
    "School Information",
    "Verification",
    "Confirmation"
  ];

  const validateMalaysianPhone = (phone) => {
    const phoneRegex = /^(\+?60|60|0|01)?[1-9][0-9]{7,8}$/;
    // Malaysian phone number patterns: +60, 60, 0, or 01 followed by 8-9 digits
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    return passwordRegex.test(password);
  };

  const validateField = (field, value) => {
    switch (field) {
      case 'phoneNumber':
        if (!value.trim()) return "Phone number is required";
        if (!validateMalaysianPhone(value)) return "Please enter a valid Malaysian phone number";
        return "";
      case 'email':
        if (!value.trim()) return "Email is required";
        if (!validateEmail(value)) return "Please enter a valid email address";
        return "";
      case 'password':
        if (!value) return "Password is required";
        if (!validatePassword(value)) return "Password must be at least 8 characters with uppercase, lowercase, number, and special character";
        return "";
      case 'confirmPassword':
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return "";
      case 'firstName':
        if (!value.trim()) return "First name is required";
        return "";
      case 'lastName':
        if (!value.trim()) return "Last name is required";
        return "";
      default:
        return "";
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (touched[field]) {
      // Validate field immediately if it has been touched
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateCurrentStep = () => {
    // Add step validation logic here if needed
    return true;
  };

  const validateForm = () => {
    const newErrors = {};

    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isCurrentStepValid = () => {
    // Check if current step is valid
    return true;
  };

  // Check if form is valid for button state
  const isFormValid = () => {
    return Object.keys(formData).every(field => {
      if (field === 'confirmPassword') {
        return formData[field] && formData[field] === formData.password;
      }
      return formData[field] && !validateField(field, formData[field]);
    });
  };

  const nextStep = () => {
    if (!validateCurrentStep()) return;
    if (!validateForm()) return;
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const handleSignup = () => {
    if (!validateForm()) return;
    onOpen();
  };

  const confirmSignup = async () => {
    try {
      setIsLoading(true);
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        role: "schoolAdmin",
        twoFA_enabled: false,
      };

      const createUserResult = await useUserStore.getState().createUser(userData);

      if (!createUserResult.success) {
        throw new Error(createUserResult.message || "Failed to create user account");
      }

      // Step 2: Automatically log in the user to generate JWT token
      const loginResult = await logIn({ email: formData.email, password: formData.password });

      if (!loginResult.success) {
        throw new Error(loginResult.message || "Failed to log in after account creation");
      }

      // Step 3: Show success message and redirect based on role and setup status
      showToast.success(
        "Account successfully created!",
        "You are now logged in. Please complete your school setup.",
        "signup-success"
      );

      // Redirect based on role and setup status
      const redirectPath = getRedirectPath(loginResult.data.role, false); // false for new schoolAdmin

      // Show toast for lecturers
      if (loginResult.data.role === 'lecturer') {
        showToast.error(
          "Lecturer Function Not Implemented",
          "Lecturer functionality is currently under development. Redirecting to homepage.",
          "lecturer-not-implemented"
        );
      }

      navigate(redirectPath);

    } catch (error) {
      showToast.error("Signup failed", error.message || "An unexpected error occurred", "signup-error");
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const formatKey = (key) => {
    if (!Array.isArray(key.split(" "))) {
      return key.toUpperCase();
    }
    const withSpaces = key.replace(/([A-Z])/g, " $1");
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
  };

  const renderStepContent = () => {
    return (
      <Box
        mt={2}
        display={"flex"}
        flexDirection={"column"}
        gap={5}
        height={"100%"}
        width={"100%"}
      >
        {/* Debug Button - Remove in production */}
        <Button
          size="sm"
          variant="outline"
          color="orange.400"
          borderColor="orange.400"
          onClick={loadSampleData}
          _hover={{ bg: "orange.900" }}
          mb={2}
        >
          🐛 Load Sample Data (Debug)
        </Button>

        <HStack spacing={4}>
          <VStack align={"start"} flex={1}>
            <InputGroup>
              <InputLeftElement p={7}>
                <Text color="rgba(255, 255, 255, 0.5)" fontSize="lg"><CgProfile /></Text>
              </InputLeftElement>
              <Input
                name="firstName"
                p={7}
                pl={16}
                _placeholder={{ color: "rgba(255, 255, 255, 0.37)" }}
                placeholder="First Name"
                size="lg"
                color={"white"}
                required
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                onBlur={() => handleBlur("firstName")}
                isInvalid={!!errors.firstName}
                errorBorderColor="red.300"
                focusBorderColor={!errors.firstName && formData.firstName ? "green.400" : "blue.400"}
                borderColor={!errors.firstName && formData.firstName ? "green.400" : "rgba(255, 255, 255, 0.2)"}
              />
            </InputGroup>
            {errors.firstName && (
              <Text fontSize="xs" color="red.400" textAlign="left">{errors.firstName}</Text>
            )}
            {!errors.firstName && formData.firstName && (
              <Text fontSize="xs" color="green.400" textAlign="left">
                ✓ First name is valid
              </Text>
            )}
          </VStack>

          <VStack align={"start"} flex={1}>
            <InputGroup>
              <InputLeftElement p={7}>
                <Text color="rgba(255, 255, 255, 0.5)" fontSize="lg"><CgProfile /></Text>
              </InputLeftElement>
              <Input
                name="lastName"
                p={7}
                pl={16}
                _placeholder={{ color: "rgba(255, 255, 255, 0.37)" }}
                placeholder="Last Name"
                size="lg"
                color={"white"}
                required
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                onBlur={() => handleBlur("lastName")}
                isInvalid={!!errors.lastName}
                errorBorderColor="red.300"
                focusBorderColor={!errors.lastName && formData.lastName ? "green.400" : "blue.400"}
                borderColor={!errors.lastName && formData.lastName ? "green.400" : "rgba(255, 255, 255, 0.2)"}
              />
            </InputGroup>
            {errors.lastName && (
              <Text fontSize="xs" color="red.400" textAlign="left">{errors.lastName}</Text>
            )}
            {!errors.lastName && formData.lastName && (
              <Text fontSize="xs" color="green.400" textAlign="left">
                ✓ Last name is valid
              </Text>
            )}
          </VStack>
        </HStack>

        <InputGroup>
          <InputLeftElement p={7}>
            <PhoneIcon color="rgba(255, 255, 255, 0.5)" />
          </InputLeftElement>
          <Input
            name="phoneNumber"
            p={7}
            pl={16}
            _placeholder={{ color: "rgba(255, 255, 255, 0.37)" }}
            placeholder="Phone Number (e.g., 0123456789, +60123456789)"
            size="lg"
            color={"white"}
            required
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            onBlur={() => handleBlur("phoneNumber")}
            isInvalid={!!errors.phoneNumber}
            errorBorderColor="red.300"
            focusBorderColor={!errors.phoneNumber && formData.phoneNumber ? "green.400" : "blue.400"}
            borderColor={!errors.phoneNumber && formData.phoneNumber ? "green.400" : "rgba(255, 255, 255, 0.2)"}
          />
        </InputGroup>
        {errors.phoneNumber && (
          <Text fontSize="xs" color="red.400" textAlign="left">{errors.phoneNumber}</Text>
        )}
        {!errors.phoneNumber && formData.phoneNumber && (
          <Text fontSize="xs" color="green.400" textAlign="left">
            ✓ Valid Malaysian phone number
          </Text>
        )}

        <InputGroup>
          <InputLeftElement p={7}>
            <EmailIcon color="rgba(255, 255, 255, 0.5)" />
          </InputLeftElement>
          <Input
            name="email"
            type="email"
            p={7}
            pl={16}
            _placeholder={{ color: "rgba(255, 255, 255, 0.37)" }}
            placeholder="Email"
            size="lg"
            color={"white"}
            required
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            isInvalid={!!errors.email}
            errorBorderColor="red.300"
            focusBorderColor={!errors.email && formData.email ? "green.400" : "blue.400"}
            borderColor={!errors.email && formData.email ? "green.400" : "rgba(255, 255, 255, 0.2)"}
          />
        </InputGroup>
        {errors.email && (
          <Text fontSize="xs" color="red.400" textAlign="left">{errors.email}</Text>
        )}
        {!errors.email && formData.email && (
          <Text fontSize="xs" color="green.400" textAlign="left">
            ✓ Valid email address
          </Text>
        )}

        <InputGroup>
          <InputLeftElement p={7}>
            <LockIcon color="rgba(255, 255, 255, 0.5)" />
          </InputLeftElement>
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            p={7}
            pl={16}
            _placeholder={{ color: "rgba(255, 255, 255, 0.37)" }}
            placeholder="Password"
            size="lg"
            color={"white"}
            required
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            onBlur={() => handleBlur("password")}
            isInvalid={!!errors.password}
            errorBorderColor="red.300"
            focusBorderColor={!errors.password && formData.password ? "green.400" : "blue.400"}
            borderColor={!errors.password && formData.password ? "green.400" : "rgba(255, 255, 255, 0.2)"}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSignup();
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
        {errors.password && (
          <Text fontSize="xs" color="red.400" textAlign="left">{errors.password}</Text>
        )}
        {!errors.password && formData.password && (
          <Text fontSize="xs" color="green.400" textAlign="left">
            ✓ Password meets requirements
          </Text>
        )}

        <InputGroup>
          <InputLeftElement p={7}>
            <LockIcon color="rgba(255, 255, 255, 0.5)" />
          </InputLeftElement>
          <Input
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            p={7}
            pl={16}
            _placeholder={{ color: "rgba(255, 255, 255, 0.37)" }}
            placeholder="Confirm Password"
            size="lg"
            color={"white"}
            required
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            onBlur={() => handleBlur("confirmPassword")}
            isInvalid={!!errors.confirmPassword}
            errorBorderColor="red.300"
            focusBorderColor={!errors.confirmPassword && formData.confirmPassword ? "green.400" : "blue.400"}
            borderColor={!errors.confirmPassword && formData.confirmPassword ? "green.400" : "rgba(255, 255, 255, 0.2)"}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSignup();
              }
            }}
          />
          <InputRightElement p={7}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              color="white"
              _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
            >
              {showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
            </Button>
          </InputRightElement>
        </InputGroup>
        {errors.confirmPassword && (
          <Text fontSize="xs" color="red.400" textAlign="left">{errors.confirmPassword}</Text>
        )}
        {!errors.confirmPassword && formData.confirmPassword && (
          <Text fontSize="xs" color="green.400" textAlign="left">
            ✓ Passwords match
          </Text>
        )}


        {/* Form validation status */}
        <Box
          mt={4}
          p={3}
          borderRadius="md"
          bg={isFormValid() ? "green.900" : "red.900"}
          border="1px solid"
          borderColor={isFormValid() ? "green.400" : "red.400"}
        >
          <Text
            fontSize="sm"
            color={isFormValid() ? "green.200" : "red.200"}
            textAlign="center"
          >
            {isFormValid()
              ? "✓ All fields are valid - You can create your account!"
              : "⚠ Please fill all required fields correctly to continue"
            }
          </Text>
        </Box>
      </Box>
    );
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
        heading="Sign Up"
        buttonText="Create Account"
        buttonClick={handleSignup}
        buttonDisabled={!isFormValid()}
        footer={
          <Text color="white" textAlign="center" mt={4}>
            Already have an account?{" "}
            <Link color={"blue.400"} textDecor={"underline"} ml={3} onClick={() => navigate("/login")}>
              Log In
            </Link>
          </Text>
        }
      >

        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              setIsOAuthLoading(true);
              const decodedCredential = jwtDecode(credentialResponse.credential);
              console.log("Google OAuth credential:", decodedCredential);

              // Create OAuth user data
              const oauthUserData = {
                email: decodedCredential.email,
                googleId: decodedCredential.sub,
                name: decodedCredential.name,
                profilePicture: decodedCredential.picture,
                role: "schoolAdmin", // Default role for OAuth signup
                authProvider: "google"
                // phoneNumber is optional for OAuth users
              };

              // First try to login with OAuth (in case user already exists)
              let oauthLoginResult = await useAuthStore.getState().logInWithOAuth(oauthUserData);
              console.log("Initial OAuth login attempt result:", oauthLoginResult);

              // If login fails due to account not existing, try to register
              if (!oauthLoginResult.success &&
                (oauthLoginResult.message?.includes("OAuth user not found") ||
                  oauthLoginResult.message?.includes("Account not found") ||
                  oauthLoginResult.message?.includes("Please sign up first"))) {

                console.log("Account not found, attempting to register...");

                // Try to register the account using OAuth signup
                const signUpResult = await useAuthStore.getState().signUpWithOAuth(oauthUserData);
                console.log("OAuth registration result:", signUpResult);

                if (signUpResult.success) {
                  console.log("Registration successful, now attempting login...");

                  // After successful registration, try to login again
                  oauthLoginResult = await useAuthStore.getState().logInWithOAuth(oauthUserData);
                  console.log("Login after registration result:", oauthLoginResult);

                  if (oauthLoginResult.success) {
                    console.log("Login after registration successful");
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
              "Failed to authenticate with Google. Please try again or use the regular signup form.",
              "oauth-error"
            );
          }}
        >
        </GoogleLogin>

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

        {renderStepContent()}

        {/* Confirmation Modal */}
        <Modal isOpen={isOpen} onClose={onClose} width="100%">
          <ModalOverlay />
          <ModalContent
            w={"100%"}
            bg="rgba(0, 0, 0, 0.5)"
            backdropFilter="blur(10px)"
            color="white"
          >
            <ModalHeader>Confirm Your Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <SimpleGrid columns={2} spacing={4} width="100%">
                {Object.entries(formData)
                  .slice(0, 6)
                  .map(([key, value]) => (
                    <Box key={key}>
                      <Text fontWeight="bold">{formatKey(key)}:</Text>
                      <Text>{key === "password" || key === "confirmPassword" ? `••••••••${value.slice(-4)}` : value}</Text>
                    </Box>
                  ))}
              </SimpleGrid>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                onClick={onClose}
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
                onClick={confirmSignup}
                isLoading={isLoading}
                _hover={{ bg: "#FF0000" }}
              >
                Confirm
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </RegisterBox>
    </Box>
  );
}

export default SignUpOuter;
