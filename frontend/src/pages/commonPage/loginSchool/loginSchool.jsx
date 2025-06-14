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
} from "@chakra-ui/react";
import { FaPhoneAlt } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { MdCheckBoxOutlineBlank } from "react-icons/md";
import { MdOutlineCheckBox } from "react-icons/md";
import { useDisclosure } from "@chakra-ui/react";

function LoginSchool() {
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);
  const { isOpen, onOpen, onClose } = useDisclosure();

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
        School Admin Login
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
          <InputGroup>
            <InputRightElement pointerEvents="none">
              <HiOutlineMail size={25} color="gray.500" />
            </InputRightElement>
            <Input type="tel" placeholder="Enter your email..." />
          </InputGroup>
          <InputGroup size="md">
            <Input
              pr="4.5rem"
              type={show ? "text" : "password"}
              placeholder="Enter your password..."
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
            fontSize="0.7rem"
          >
            <HStack spacing={2} align="center">
              <Text textAlign={"left"}>Remember me</Text>
              <Checkbox colorScheme="orange"></Checkbox>
            </HStack>
            <ChakraLink whiteSpace="nowrap" onClick={onOpen}>
              Forget Password
            </ChakraLink>
          </HStack>

          <Button w={"100%"} bg={"#588157"} mt={5}>
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
