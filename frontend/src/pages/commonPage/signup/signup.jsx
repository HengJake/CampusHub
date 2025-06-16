import React from "react";
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
} from "@chakra-ui/react";
import { FaPhoneAlt } from "react-icons/fa";
import { MdCheckBoxOutlineBlank } from "react-icons/md";
import { MdOutlineCheckBox } from "react-icons/md";
import { HiOutlineMail } from "react-icons/hi";
import { useDisclosure } from "@chakra-ui/react";
import { FaRegUserCircle } from "react-icons/fa";
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import "./signup.scss";

function signup() {
  // declaring variable
  // const [newSchool, setSchool] = useState({
  //   firstName: "",
  //   lastName: "",
  //   phoneNumber: "",
  //   email: "",
  //   password: "",
  //   confirmPassword: "",
  // });
  const [newSchool, setSchool] = useState({
    firstName: "",
    lastName: "Doe",
    phoneNumber: "123456789",
    email: "john.doe@example.com",
    password: "Password@123",
    confirmPassword: "Password@123",
  });

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

  // handle method
  const handleSignup = async () => {
    onOpen();

    // loop with object
    Object.entries(newSchool).forEach(([key, value]) => {
      if (value == "") {
        console.log(`Please fill in ${key}`);
        return
      }
    });


  };

  return (
    <Box
      flex={1}
      display={"flex"}
      flexDirection={"column"}
      justifyContent={"center"}
      alignItems={"center"}
      overflow={"hidden"}
    >
      <Heading color={"#344E41"} mb={10}>
        Sign Up
      </Heading>
      {/*School Admin Login Form */}
      <Box
        p={3}
        align={"left"}
        backdropFilter="blur(10px)"
        bg="rgba(0, 0, 0, 0.5)" // translucent glass
        border="1px solid rgba(255, 255, 255, 0.2)"
        boxShadow="lg"
        borderRadius="lg"
        color={"#DAD7CD"}
        zIndex={100}
      >
        <VStack>
          <InputGroup gap={2}>
            <Input
              type="text"
              placeholder="First Name"
              _placeholder={{ color: "gray.300" }}
              value={newSchool.firstName}
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

                setSchool((prev) => ({ ...prev, firstName: value }));
              }}
            />
            <Input
              type="text"
              placeholder="Last Name"
              _placeholder={{ color: "gray.300" }}
              value={newSchool.lastName}
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

                setSchool((prev) => ({ ...prev, lastName: value }));
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
              value={newSchool.phoneNumber}
              onChange={(e) =>
                setSchool((prev) => ({ ...prev, phoneNumber: e.target.value }))
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
                  setSchool((prev) => ({ ...prev, phoneNumber: value }));
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
              value={newSchool.email}
              onChange={(e) =>
                setSchool((prev) => ({ ...prev, email: e.target.value }))
              }
              onBlur={() => {
                const toastId = "no-email-toast";
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const isValid = emailRegex.test(newSchool.email);

                setEmailError(!isValid);

                if (
                  !isValid &&
                  newSchool.email !== "" &&
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
              value={newSchool.password}
              onChange={(e) => {
                const value = e.target.value;
                setSchool((prev) => ({ ...prev, password: value }));
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
              value={newSchool.confirmPassword}
              onChange={(e) => {
                const value = e.target.value;
                setSchool((prev) => ({ ...prev, confirmPassword: value }));
              }}
              onBlur={(e) => {
                const value = e.target.value;
                const toastId = "invalid-cpassword";

                const isValid = validatePassword(value);

                setCPasswordError(!isValid);
                if (newSchool.confirmPassword != newSchool.password) {
                  if (!toast.isActive(toastId)) {
                    toast({
                      id: toastId,
                      title: "Different Password",
                      description:
                        "Ensure your password and confirm password are identical",
                      status: "warning",
                      duration: 4000,
                      isClosable: true,
                    });
                  }
                }

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

          <Button
            w={"100%"}
            bg={"#588157"}
            mt={5}
            color={"gray.300"}
            onClick={handleSignup}
          >
            Sign Up
          </Button>
        </VStack>
      </Box>

      {/*Pop up for email confirmation */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>stff</ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost">Secondary Action</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/*Background box */}
      {/*First layer */}
      <Box
        position="fixed"
        bottom="-20%"
        left="-10%"
        width="300px"
        height="600px"
        borderRadius="full"
        bgGradient="linear(to-br, #A3B18A, #588157)"
        zIndex="0"
      ></Box>
      <Box
        position="fixed"
        bottom="-20%"
        right="-10%"
        width="300px"
        height="600px"
        borderRadius="full"
        bgGradient="linear(to-br, #A3B18A, #588157)"
        zIndex="0"
      ></Box>
      {/*Second layer */}
      <Box
        position="fixed"
        bottom="-40%"
        left="10%"
        width="300px"
        height="600px"
        borderRadius="full"
        bgGradient="linear(to-br, #A3B18A, #588157)"
        zIndex="0"
      ></Box>
      <Box
        position="fixed"
        bottom="-40%"
        right="10%"
        width="300px"
        height="600px"
        borderRadius="full"
        bgGradient="linear(to-br, #A3B18A, #588157)"
        zIndex="0"
      ></Box>
      {/*Third layer */}
      <Box
        position="fixed"
        bottom="-60%"
        right="20%"
        width="300px"
        height="600px"
        borderRadius="full"
        bgGradient="linear(to-br, #A3B18A, #588157)"
        zIndex="0"
      ></Box>
      <Box
        position="fixed"
        bottom="-60%"
        left="20%"
        width="300px"
        height="600px"
        borderRadius="full"
        bgGradient="linear(to-br, #A3B18A, #588157)"
        zIndex="0"
      ></Box>
    </Box>
  );
}

export default signup;
