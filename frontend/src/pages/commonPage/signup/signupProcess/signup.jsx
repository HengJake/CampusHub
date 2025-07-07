import React, { useEffect } from "react";
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  InputLeftAddon,
  Heading,
  SimpleGrid,
} from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { useState } from "react";
// import { useUserStore } from "../../../../store/user";
import { useAuthStore } from "../../../../store/auth.js";
import { Link as RouterLink } from "react-router-dom";
import RegisterBox from "../../../../component/common/registerBox.jsx";
import SignUpInput from "../../../../component/common/signUpInput.jsx";
import EmailConfirmation from "./emailConfirmation.jsx";
import { useShowToast } from "../../../../store/utils/toast.js";
import { useUserStore } from "../../../../store/user.js";
// add in outer, button in MODAL
function signup({
  formData,
  onNext,
  handleData,
  skipOtp,
  setSkipOtp,
  isWaiting,
  handleNextClick,
  userDetails,
  setUserDetails,
}) {
  const { deleteUser } = useUserStore();
  const { signUp, authorizeUser, logout } = useAuthStore();
  const accountModal = useDisclosure();
  const emailModal = useDisclosure();
  // validation stuff
  const showToast = useShowToast();
  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [cpasswordError, setCPasswordError] = useState(false);


  // check user proceeded to step 2 already; meaning account has been created
  const accountCreated = localStorage.getItem("accountCreated") === "true";

  // format object key
  const formatKey = (key) => {
    if (!Array.isArray(key.split(" "))) {
      return key.toUpperCase();
    }

    const withSpaces = key.replace(/([A-Z])/g, " $1"); // insert space before uppercase letters
    // const lowercased = withSpaces.toLowerCase();
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1); // capitalize first letter
  };

  // handle method
  const handleSignup = async () => {
    let success = true;
    let toastId = "sign-up";

    if (
      !userDetails.firstName ||
      !userDetails.lastName ||
      !userDetails.phoneNumber ||
      !userDetails.email ||
      !userDetails.password ||
      !userDetails.confirmPassword
    ) {
      showToast.error(
        "Empty field detected!",
        "Please fill all the field",
        toastId
      );
      success = false;
    }

    if (userDetails.confirmPassword != userDetails.password) {
      toastId = "password";
      showToast.error(
        "Different Password",
        "Ensure your password and confirm password are identical",
        toastId
      );
      success = false;
    }

    if (
      success &&
      !emailError &&
      !phoneError &&
      !cpasswordError &&
      !passwordError
    ) {
      accountModal.onOpen();
    } else {
      toastId = "empty";
      showToast.error(
        "Error field detected!",
        "Please correct all the field",
        toastId
      );
    }
  };

  const handleSignUp2 = async () => {

    const { firstName, lastName, phoneNumber, email, password } = userDetails;

    const userData = {
      name: `${firstName} ${lastName}`,
      password,
      phoneNumber,
      email,
      role: "schoolAdmin",
      twoFA_enabled: false,
    };

    const { success, message, data } = await signUp(userData);

    if (!success) {
      showToast.error(
        "Error Signing Up",
        message,
        "sign-up-error"
      );
      accountModal.onClose();
    } else {
      showToast.success(
        "Account successfully created",
        "You are able to log in now, proceeding to email verification...",
        "sign-up-success"
      );

      localStorage.setItem("accountCreated", true);
      handleData(userDetails, false);
      accountModal.onClose();
      emailModal.onOpen();
    }
  };

  let buttonText = "";

  if (!accountCreated) {
    buttonText = "Sign Up";
  } else if (!skipOtp) {
    buttonText = "Verify";
  } else {
    buttonText = "Next";
  }

  const handleToLogin = async () => {
    const accountCreated = localStorage.getItem("accountCreated") === "true";
    const schoolCreated = localStorage.getItem("schoolCreated") === "true";
    const paymentCreated = localStorage.getItem("paymentCreated") === "true";

    if (accountCreated) {
      const { id } = await authorizeUser();
      deleteUser(id);
    }

    if (schoolCreated) {
      await deleteSchool(formData.schoolId);
    }

    if (paymentCreated) {
      await deletePayment(formData.paymentId);
    }

    localStorage.removeItem("accountCreated");
    localStorage.removeItem("schoolCreated");
    localStorage.removeItem("paymentCreated");
    localStorage.removeItem("signupFormData");
    localStorage.removeItem("signupStep");
    localStorage.removeItem("otpCooldownEnd");
    localStorage.removeItem("skipOtp");

    logout();
    window.location.href = "/login";
  }

  return (
    <RegisterBox
      formData={formData}
      heading={"Sign Up"}
      buttonClick={() => {
        if (!accountCreated) {
          handleSignup();
        } else if (!skipOtp) {
          emailModal.onOpen();
        } else {
          onNext();
        }
      }}
      isWaiting={isWaiting}
      buttonText={buttonText}
    >

      <VStack>
        <Box display={"flex"} justifyContent={"start"} w={"100%"} gap={1}>
          <Text color={"white"}>Have an account? </Text>
          <ChakraLink
            as={RouterLink}
            onClick={handleToLogin}
            textDecor={"underline"}
            color={"blue.200"}
          >
            Login
          </ChakraLink>
        </Box>

        <SignUpInput
          accountCreated={accountCreated}
          userDetails={userDetails}
          setUserDetails={setUserDetails}
          emailError={emailError}
          setEmailError={setEmailError}
          phoneError={phoneError}
          setPhoneError={setPhoneError}
          passwordError={passwordError}
          setPasswordError={setPasswordError}
          cpasswordError={cpasswordError}
          setCPasswordError={setCPasswordError}
        />

      </VStack>

      {/*Pop up for confirmation */}
      <Modal isOpen={accountModal.isOpen} onClose={accountModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Creating new account...</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={2} spacing={4} width="100%">
              {Object.entries(userDetails)
                .slice(0, 6)
                .map(([key, value]) => (
                  <Box key={key}>
                    <Text fontWeight={600}>{formatKey(key)}</Text>
                    <Text>{value}</Text>
                  </Box>
                ))}
            </SimpleGrid>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={accountModal.onClose}>
              Close
            </Button>
            <Button
              isDisabled={isWaiting}
              colorScheme="blue"
              mr={3}
              onClick={() => {
                handleNextClick();
                handleSignUp2();
              }}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/*Show email confirmation */}
      <Box pos={"fixed"} top={"50%"} left={"50%"} >
        {emailModal.isOpen && (<EmailConfirmation
          setSkipOtp={setSkipOtp}
          isOpen={emailModal.isOpen}
          onClose={emailModal.onClose}
        />)}
      </Box>
    </RegisterBox>
  );
}

export default signup;
