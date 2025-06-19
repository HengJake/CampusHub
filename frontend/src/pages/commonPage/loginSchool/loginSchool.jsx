import React from "react";
import "./loginSchool.scss";
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
  Heading,
  useToast,
} from "@chakra-ui/react";
import { HiOutlineMail } from "react-icons/hi";
import { useDisclosure } from "@chakra-ui/react";
import { useState } from "react";
import { useUserStore } from "../../../../store/user";
import { Link as RouterLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { CookieUtils } from "../../../../../utility/cookie";

function LoginSchool() {
  const navigate = useNavigate();
  const toast = useToast();
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userDetails, setUserDetails] = useState({
    email: "hengjunkai@gmail.com",
    password: "Asd@3125437",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const { loginUser } = useUserStore();

  const handleLogin = async () => {
    let success = true;

    if (!userDetails.email || !userDetails.password) {
      const toastId = "log-in";

      if (!toast.isActive(toastId)) {
        toast({
          id: toastId,
          title: "Empty field detected!",
          description: `Please fill all the field`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }

      success = false;
    }

    if (rememberMe) {
      console.log("Remember Me");
    }

    if (success) {
      const {
        success: loginSuccess,
        message,
        data,
      } = await loginUser(userDetails, "schoolAdmin");

      const toastId = "log-in";

      if (!loginSuccess) {
        if (!toast.isActive(toastId)) {
          toast({
            id: toastId,
            title: "Login Error!",
            description: `${message}`,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        toast({
          id: toastId,
          title: "Login Successfully",
          description: `${message}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        CookieUtils.setCookie("role", "admin");
        
        setTimeout(() => {
          navigate("/admin-dashboard");
        }, 1000);
      }
    }
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
        School Administrator Login
      </Heading>
      {/*Company Admin Login Form */}
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
          <Box display={"flex"} justifyContent={"start"} w={"100%"} gap={3}>
            <Text>Have an acount? </Text>
            <ChakraLink
              as={RouterLink}
              to={"/signup"}
              textDecor={"underline"}
              color={"blue.200"}
            >
              Sing Up
            </ChakraLink>
          </Box>
          <InputGroup>
            <InputRightElement pointerEvents="none">
              <HiOutlineMail size={25} color="gray.500" />
            </InputRightElement>
            <Input
              type="tel"
              placeholder="Enter your email..."
              _placeholder={{ color: "gray.300" }}
              value={userDetails.email || ""}
              onChange={(e) => {
                setUserDetails((prev) => ({
                  ...prev,
                  email: e.target.value,
                }));
              }}
            />
          </InputGroup>
          <InputGroup size="md">
            <Input
              pr="4.5rem"
              type={show ? "text" : "password"}
              placeholder="Enter your password..."
              _placeholder={{ color: "gray.300" }}
              value={userDetails.password || ""}
              onChange={(e) => {
                setUserDetails((prev) => ({
                  ...prev,
                  password: e.target.value,
                }));
              }}
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={handleClick}>
                {show ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
          <HStack
            justify="space-between"
            align="center"
            w="100%"
            fontSize="0.9rem"
          >
            <HStack spacing={2} align="center">
              <Text textAlign={"left"}>Remember me</Text>
              <Checkbox
                colorScheme="orange"
                isChecked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              ></Checkbox>
            </HStack>
            <ChakraLink whiteSpace="nowrap" onClick={onOpen}>
              Forget Password
            </ChakraLink>
          </HStack>

          <Button
            w={"100%"}
            bg={"#588157"}
            mt={5}
            onClick={handleLogin}
            color={"gray.300"}
          >
            LOGIN
          </Button>
        </VStack>
      </Box>

      {/*Pop Up */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={"#3A5A40"}>
          <ModalHeader>Forget Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input variant="flushed" placeholder="Enter your email" />
          </ModalBody>

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

export default LoginSchool;
