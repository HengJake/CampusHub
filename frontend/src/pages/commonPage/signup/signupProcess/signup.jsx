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
import { FaPhoneAlt } from "react-icons/fa";
import { MdCheckBoxOutlineBlank } from "react-icons/md";
import { MdOutlineCheckBox } from "react-icons/md";
import { HiOutlineMail } from "react-icons/hi";
import { useDisclosure } from "@chakra-ui/react";
import { FaRegUserCircle } from "react-icons/fa";
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
// import { useUserStore } from "../../../../store/user";
import { useAuthStore } from "../../../../store/auth.js";
import { CookieUtils } from "../../../../../../utility/cookie";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import RegisterBox from "../../../../component/common/registerBox.jsx";
import { useUserStore } from "../../../../store/user.js";

// add in outer, button in MODAL
function signup({ formData, setFormData, onNext, isWaiting, handleNextClick }) {
  const { signUp } = useAuthStore();
  const { checkUser } = useUserStore();
  const navigate = useNavigate();

  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // validation stuff
  const toast = useToast();
  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [cpasswordError, setCPasswordError] = useState(false);
  const validatePassword = (password) => {
    const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(
      password
    );
    return isValid;
  };

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
    const toastId = "sign-up";

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.phoneNumber ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      if (!toast.isActive(toastId)) {
        toast({
          id: toastId,
          title: "Empty field detected!",
          description: `Please fill all the field`,
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
      success = false;
    }

    if (formData.confirmPassword != formData.password) {
      if (!toast.isActive(toastId)) {
        toast({
          id: toastId,
          title: "Different Password",
          description:
            "Ensure your password and confirm password are identical",
          status: "warning",
          duration: 2000,
          isClosable: true,
        });
      }
      success = false;
    }

    if (
      success &&
      !emailError &&
      !phoneError &&
      !cpasswordError &&
      !passwordError
    ) {
      onOpen();
    }
  };

  const handleSignUp2 = async () => {
    const { firstName, lastName, phoneNumber, email, password } = formData;

    const userData = {
      name: `${firstName} ${lastName}`,
      password,
      phoneNumber,
      email,
      role: "schoolAdmin",
      twoFA_enabled: false,
    };

    // const { exist, takenFields } = await checkUser(userData);
    const { success, message } = await signUp(userData);

    // console.log(exist, takenFields);

    // const takenKeys = Object.keys(takenFields).filter(
    //   (key) => takenFields[key]
    // );

    // let message = "";
    // if (takenKeys.length === 1) {
    //   message = `${formatKey(takenKeys[0])} is taken.`;
    // } else if (takenKeys.length === 2) {
    //   message = `${formatKey(takenKeys[0])} and ${formatKey(
    //     takenKeys[1]
    //   )} are taken.`;
    // } else if (takenKeys.length > 2) {
    //   const last = takenKeys.pop();
    //   const formattedKeys = takenKeys.map(formatKey);
    //   message = `${formattedKeys.join(", ")}, and ${formatKey(
    //     last
    //   )} are taken.`;
    // } else {
    //   message = "All details are available.";
    // }

    if (!success) {
      toast({
        title: "Error Signing Up",
        description: message,
        position: "top",
        status: "error",
        duration: 1500,
        isClosable: true,
      });
    } else {
      toast({
        title: "Account succesfully created",
        description: "Proceeding to email verification...",
        position: "top",
        status: "success",
        duration: 1500,
        isClosable: true,
      });

      setTimeout(() => {
        onNext();
      }, 500);
    }
  };

  return (
    <RegisterBox
      heading={"Sign Up"}
      buttonClick={handleSignup}
      isWaiting={isWaiting}
    >
      <VStack>
        <Box display={"flex"} justifyContent={"start"} w={"100%"} gap={1}>
          <Text color={"white"}>Have an acount? </Text>
          <ChakraLink
            as={RouterLink}
            to={"/login-school"}
            textDecor={"underline"}
            color={"blue.200"}
          >
            Login
          </ChakraLink>
        </Box>

        <InputGroup gap={2}>
          <Input
            type="text"
            placeholder="First Name"
            _placeholder={{ color: "gray.300" }}
            value={formData.firstName}
            onChange={(e) => {
              const value = e.target.value;
              const toastId = "no-digits-toast";

              if (/\d/.test(value)) {
                if (!toast.isActive(toastId)) {
                  toast({
                    id: toastId,
                    title: "Invalid input",
                    description: "Numbers are not allowed in the name.",
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                  });
                }
                return;
              }

              setFormData((prev) => ({ ...prev, firstName: value }));
            }}
          />
          <Input
            type="text"
            placeholder="Last Name"
            _placeholder={{ color: "gray.300" }}
            value={formData.lastName}
            onChange={(e) => {
              const value = e.target.value;
              const toastId = "no-digits-toast";

              if (/\d/.test(value)) {
                if (!toast.isActive(toastId)) {
                  toast({
                    id: toastId,
                    title: "Invalid input",
                    description: "Numbers are not allowed in the name.",
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                  });
                }
                return;
              }

              setFormData((prev) => ({ ...prev, lastName: value }));
            }}
          />
        </InputGroup>

        <InputGroup>
          <InputLeftAddon bg={"gray.300"} color={"black"}>
            +60
          </InputLeftAddon>
          <InputRightElement pointerEvents="none">
            <FaPhoneAlt size={15} color="gray.500" />
          </InputRightElement>
          <Input
            type="tel"
            placeholder="Phone Number"
            _placeholder={{ color: "gray.300" }}
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                phoneNumber: e.target.value,
              }))
            }
            onBlur={(e) => {
              const toastId = "no-phone-toast";
              let value = e.target.value;

              if (value.startsWith("0")) {
                value = value.slice(1);
              }

              const isValid = /^1\d{8,9}$/.test(value);

              setPhoneError(!isValid);

              if (!isValid && !toast.isActive(toastId)) {
                toast({
                  id: toastId,
                  title: "Invalid phone number",
                  description:
                    "Please enter a valid Malaysian phone number starting with 1 and 9 digits.",
                  status: "error",
                  duration: 3000,

                  isClosable: true,
                });
              }

              if (value === "" || isValid) {
                setFormData((prev) => ({ ...prev, phoneNumber: value }));
              }
            }}
            maxLength={10} // Only 9 digits after +60
            isInvalid={phoneError}
            borderColor={phoneError ? "red.500" : "gray.200"}
            focusBorderColor={phoneError ? "red.500" : "blue.300"}
          />
        </InputGroup>

        <InputGroup>
          <InputRightElement pointerEvents="none">
            <HiOutlineMail size={25} color="gray.500" />
          </InputRightElement>
          <Input
            type="email"
            placeholder="Email"
            _placeholder={{ color: "gray.300" }}
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            onBlur={() => {
              const toastId = "no-email-toast";
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              const isValid = emailRegex.test(formData.email);

              setEmailError(!isValid);

              if (
                !isValid &&
                formData.email !== "" &&
                !toast.isActive(toastId)
              ) {
                toast({
                  id: toastId,
                  title: "Invalid email address",
                  description:
                    "Please enter a valid email like example@email.com",
                  status: "error",
                  duration: 3000,
                  isClosable: true,
                });
              }
            }}
            isInvalid={emailError}
            borderColor={emailError ? "red.500" : "gray.200"}
            focusBorderColor={emailError ? "red.500" : "blue.300"}
          />
        </InputGroup>

        <InputGroup size="md">
          <Input
            pr="4.5rem"
            type={show ? "text" : "password"}
            placeholder="Password"
            _placeholder={{ color: "gray.300" }}
            value={formData.password}
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({ ...prev, password: value }));
            }}
            onBlur={(e) => {
              const value = e.target.value;
              const toastId = "invalid-password";

              const isValid = validatePassword(value);

              setPasswordError(!isValid);

              if (!isValid && value.length > 0) {
                if (!toast.isActive(toastId)) {
                  toast({
                    id: toastId,
                    title: "Weak Password",
                    description:
                      "Must be 8+ characters with uppercase, lowercase, number, and symbol.",
                    status: "warning",
                    duration: 4000,
                    isClosable: true,
                  });
                }
              }
            }}
            isInvalid={passwordError}
            borderColor={passwordError ? "red.500" : "gray.200"}
            focusBorderColor={passwordError ? "red.500" : "blue.300"}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>

        <InputGroup size="md">
          <Input
            pr="4.5rem"
            type={show ? "text" : "password"}
            placeholder="Confirm password"
            _placeholder={{ color: "gray.300" }}
            value={formData.confirmPassword}
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({ ...prev, confirmPassword: value }));
            }}
            onBlur={(e) => {
              const value = e.target.value;
              const toastId = "invalid-password";

              const isValid = validatePassword(value);

              setCPasswordError(!isValid);

              if (!isValid && value.length > 0) {
                if (!toast.isActive(toastId)) {
                  toast({
                    id: toastId,
                    title: "Weak Password",
                    description:
                      "Must be 8+ characters with uppercase, lowercase, number, and symbol.",
                    status: "warning",
                    duration: 4000,
                    isClosable: true,
                  });
                }
              }
            }}
            isInvalid={cpasswordError}
            borderColor={cpasswordError ? "red.500" : "gray.200"}
            focusBorderColor={cpasswordError ? "red.500" : "blue.300"}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </VStack>

      {/*Pop up for email confirmation */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Creating new account...</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={2} spacing={4} width="100%">
              {Object.entries(formData)
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
            <Button variant="ghost" onClick={onClose}>
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
    </RegisterBox>
  );
}

export default signup;
