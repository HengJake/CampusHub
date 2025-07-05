import React from "react";
import "./attendance.scss";
import { Box, Flex } from "@chakra-ui/react";
import { Textarea } from "@chakra-ui/react";
import { FaPhoneAlt } from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import { BsFillPhoneFill } from "react-icons/bs";
import { ImLocation2 } from "react-icons/im";
import { BsFillClockFill } from "react-icons/bs";
import { Divider } from "@chakra-ui/react";
import { PinInput, PinInputField } from "@chakra-ui/react";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";

import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from "@chakra-ui/react";

import {
  Stack,
  HStack,
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
} from "@chakra-ui/react";
import { he } from "date-fns/locale";
import { color } from "framer-motion";

function attendance() {


  return (
    <Flex
      display={"flex"}
      flexDirection={"column"}
      width={"100%"}
      gap={10}
      p={10}
    >
      <Box
        bgColor={"#1B4965"}
        color={"white"}
        borderRadius={"25px"}
        height={"300px"}
        width={"100%"}
        p={10}
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"space-between"}
      >
        <Box>
          <Heading>Attendance</Heading>
          <Text fontSize={"20px"}>Intake - asdfasdfasd</Text>
          <br />
          <HStack
            bgColor={"white"}
            borderRadius={"15px"}
            display={"flex"}
            justifyContent={"center"}
            p={5}
            gap={5}
          >
            <Text color={"black"} fontWeight={"medium"} fontSize={"14px"}>
              Enter OTP Digits
            </Text>

            <PinInput otp>
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
            </PinInput>

            <Button
              w={"100px"}
              borderRadius={"8px"}
              bgColor={"#1B4965"}
              color={"white"}
              transition="all 0.2s ease-in-out"
              _hover={{ transform: "scale(1.05)" }}
            >
              Sign
            </Button>
          </HStack>
        </Box>

        <Box
          bgColor={"#D9D9D9"}
          width={"50%"}
          borderRadius={"15px"}
          h={"100%"}
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
        >
          <Text
            display={"flex"}
            justifyContent={"center"}
            fontWeight={"bold"}
            color={"black"}
            width={"100%"}
            height={"fit-content"}
            borderTopRadius={"15px"}
            p={2}
          >
            Today Class
          </Text>
          <hr />

          <Box
            bgColor={"white"}
            p={5}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            width={"100%"}
            h={"100%"}
            borderBottomRadius={"15px"}
          >
            <Button
              w={"fit_content"}
              bgColor={"black"}
              transition="all 0.1s ease-in-out"
              _hover={{ transform: "scale(1.05)" }}
            >
              <IoIosArrowBack size={"40px"} color="white" />
            </Button>

            <Box
              width={"100%"}
              h={"100%"}
              display={"flex"}
              justifyContent={"center"}
            >
              <Text
                borderRadius={"15px"}
                bgColor={"#D9D9D9"}
                width={"80%"}
                p={10}
                color={"black"}
              >
                Classes...
              </Text>
            </Box>

            <Button
              w={"fit_content"}
              bgColor={"black"}
              transition="all 0.1s ease-in-out"
              _hover={{ transform: "scale(1.05)" }}
            >
              <IoIosArrowForward size={"40px"} color="white" />
            </Button>
          </Box>
        </Box>
      </Box>

      <Accordion defaultIndex={[0]} allowMultiple>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left" p={5}>
                <Heading fontSize={"24px"}>Semester 1</Heading>
                <Text>Attendance Rate: </Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={8} display={"flex"}>
            <TableContainer w={"100%"}>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Subject</Th>
                    <Th>Total</Th>
                    <Th isNumeric>Present</Th>
                    <Th isNumeric>Late</Th>
                    <Th isNumeric>Absent</Th>
                    <Th isNumeric>%</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>Subject1</Td>
                    <Td>millimetres </Td>
                    <Td isNumeric>25.4</Td>
                  </Tr>
                  <Tr>
                    <Td>Subject2</Td>
                    <Td>centimetres (cm)</Td>
                    <Td isNumeric>30.48</Td>
                  </Tr>
                  <Tr>
                    <Td>Subject3</Td>
                    <Td>metres (m)</Td>
                    <Td isNumeric>0.91444</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left" p={5}>
                <Heading fontSize={"24px"}>Semester 2</Heading>
                <Text>Attendance Rate: </Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={8} display={"flex"}>
            <TableContainer w={"100%"}>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Subject</Th>
                    <Th>Total</Th>
                    <Th isNumeric>Present</Th>
                    <Th isNumeric>Late</Th>
                    <Th isNumeric>Absent</Th>
                    <Th isNumeric>%</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>Subject1</Td>
                    <Td>millimetres </Td>
                    <Td isNumeric>25.4</Td>
                  </Tr>
                  <Tr>
                    <Td>Subject2</Td>
                    <Td>centimetres (cm)</Td>
                    <Td isNumeric>30.48</Td>
                  </Tr>
                  <Tr>
                    <Td>Subject3</Td>
                    <Td>metres (m)</Td>
                    <Td isNumeric>0.91444</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left" p={5}>
                <Heading fontSize={"24px"}>Semester 3</Heading>
                <Text>Attendance Rate: </Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={8} display={"flex"}>
            <TableContainer w={"100%"}>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Subject</Th>
                    <Th>Total</Th>
                    <Th isNumeric>Present</Th>
                    <Th isNumeric>Late</Th>
                    <Th isNumeric>Absent</Th>
                    <Th isNumeric>%</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>Subject1</Td>
                    <Td>millimetres </Td>
                    <Td isNumeric>25.4</Td>
                  </Tr>
                  <Tr>
                    <Td>Subject2</Td>
                    <Td>centimetres (cm)</Td>
                    <Td isNumeric>30.48</Td>
                  </Tr>
                  <Tr>
                    <Td>Subject3</Td>
                    <Td>metres (m)</Td>
                    <Td isNumeric>0.91444</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left" p={5}>
                <Heading fontSize={"24px"}>Semester 4</Heading>
                <Text>Attendance Rate: </Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={8} display={"flex"}>
            <TableContainer w={"100%"}>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Subject</Th>
                    <Th>Total</Th>
                    <Th isNumeric>Present</Th>
                    <Th isNumeric>Late</Th>
                    <Th isNumeric>Absent</Th>
                    <Th isNumeric>%</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>Subject1</Td>
                    <Td>millimetres </Td>
                    <Td isNumeric>25.4</Td>
                  </Tr>
                  <Tr>
                    <Td>Subject2</Td>
                    <Td>centimetres (cm)</Td>
                    <Td isNumeric>30.48</Td>
                  </Tr>
                  <Tr>
                    <Td>Subject3</Td>
                    <Td>metres (m)</Td>
                    <Td isNumeric>0.91444</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left" p={5}>
                <Heading fontSize={"24px"}>Semester 5</Heading>
                <Text>Attendance Rate: </Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={8} display={"flex"}>
            <TableContainer w={"100%"}>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Subject</Th>
                    <Th>Total</Th>
                    <Th isNumeric>Present</Th>
                    <Th isNumeric>Late</Th>
                    <Th isNumeric>Absent</Th>
                    <Th isNumeric>%</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>Subject1</Td>
                    <Td>millimetres </Td>
                    <Td isNumeric>25.4</Td>
                  </Tr>
                  <Tr>
                    <Td>Subject2</Td>
                    <Td>centimetres (cm)</Td>
                    <Td isNumeric>30.48</Td>
                  </Tr>
                  <Tr>
                    <Td>Subject3</Td>
                    <Td>metres (m)</Td>
                    <Td isNumeric>0.91444</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Flex>
  );
}

export default attendance;
