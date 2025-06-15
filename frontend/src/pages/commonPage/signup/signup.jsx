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
  const [newSchool, setSchool] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // validation stuff
  const toast = useToast();
  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  // handle method
  const handleSignup = async () => {
    onOpen();
    console.log(newSchool);
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
              onChange={(e) =>
                setSchool((prev) => ({ ...prev, firstName: e.target.value }))
              }
            />
            <Input
              type="text"
              placeholder="Last Name"
              _placeholder={{ color: "gray.300" }}
              value={newSchool.lastName}
              onChange={(e) =>
                setSchool((prev) => ({ ...prev, lastName: e.target.value }))
              }
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
                let value = e.target.value;

                if (value.startsWith("0")) {
                  value = value.slice(1);
                }

                const isValid = /^1\d{8,9}$/.test(value);

                setPhoneError(!isValid);

                if (!isValid) {
                  toast({
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
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const isValid = emailRegex.test(newSchool.email);

                setEmailError(!isValid);

                if (!isValid && newSchool.email !== "") {
                  toast({
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
              onChange={(e) =>
                setSchool((prev) => ({ ...prev, password: e.target.value }))
              }
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
              onChange={(e) =>
                setSchool((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
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
