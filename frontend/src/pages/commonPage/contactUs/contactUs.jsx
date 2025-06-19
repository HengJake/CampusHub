import React from "react";
import "./contactUs.scss";
import { Box, Flex } from "@chakra-ui/react";
import { Textarea } from "@chakra-ui/react";
import { FaPhoneAlt } from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import { BsFillPhoneFill } from "react-icons/bs";
import { ImLocation2 } from "react-icons/im";
import { BsFillClockFill } from "react-icons/bs";
import { Divider } from "@chakra-ui/react";

import {
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
} from "@chakra-ui/react";

function contactUs() {
  return (
    <Flex w="100%" h="100vh" justify="center" align="center">
      <Box
        className="ContactUs"
        w={"90%"}
        justifyContent={"center"}
        height={"100%"}
        p={"4"}
        flexDirection={"column"}
      >
        <Box paddingTop={"8"}>
          <Heading fontWeight={"medium"} fontSize={"24px"}>
            Contact Us
          </Heading>
          <Text
            paddingTop={"4"}
            fontSize={"16px"}
            color={"rgba(0, 0, 0, 0.46)"}
            sx={{ wordSpacing: "1px" }}
          >
            Get in touch with our support team. We're here to help you with any
            questions, technical issues, or feedback you may have about
            CampusHub.
          </Text>
          <br />
        </Box>
        <Box width={"100%"} display={"flex"} flexDirection={"row"} gap={"50px"}>
          <Box
            bgColor={"#F8F9FA"}
            boxShadow={"0px 4px 10px rgba(0, 0, 0, 0.2)"}
            height={"800px"}
            width={"100%"}
          >
            <Text fontSize={"20px"} paddingTop={"40px"} paddingLeft={"30px"}>
              Send us a message
            </Text>
            <Text
              color={"rgba(0, 0, 0, 0.46)"}
              fontSize={"16px"}
              paddingTop={"5px"}
              paddingLeft={"30px"}
            >
              Fill out the form below and we'll get back to you within 24 hours
            </Text>

            <Box paddingBottom={"30px"}>
              <Box paddingTop={"30px"} paddingLeft={"30px"}>
                <Text
                  color={"rgb(0, 0, 0)"}
                  fontSize={"16px"}
                  paddingBottom={"15px"}
                >
                  Full Name
                </Text>
                <Box>
                  <Input width={"95%"} p={"25px"} placeholder="Full Name" />
                </Box>
              </Box>
              <Box paddingTop={"30px"} paddingLeft={"30px"}>
                <Text
                  color={"rgb(0, 0, 0)"}
                  fontSize={"16px"}
                  paddingBottom={"15px"}
                >
                  Email Address
                </Text>
                <Box>
                  <Input
                    width={"95%"}
                    p={"25px"}
                    placeholder="example@gmail.com"
                  />
                </Box>
              </Box>
              <Box paddingTop={"30px"} paddingLeft={"30px"}>
                <Text
                  color={"rgb(0, 0, 0)"}
                  fontSize={"16px"}
                  paddingBottom={"15px"}
                >
                  Subject
                </Text>
                <Box>
                  <Input
                    width={"95%"}
                    p={"25px"}
                    placeholder="What is this regarding?"
                  />
                </Box>
              </Box>
              <Box paddingTop={"30px"} paddingLeft={"30px"}>
                <Text
                  color={"rgb(0, 0, 0)"}
                  fontSize={"16px"}
                  paddingBottom={"15px"}
                >
                  Subject
                </Text>
                <Box>
                  <Textarea
                    width={"95%"}
                    height={"150px"}
                    placeholder="Please describe your inquiry, issue or feedback in detail. Include any relevant information that might help us assist you better. "
                  />
                </Box>
              </Box>
              <Box paddingTop={"30px"} paddingLeft={"30px"}>
                <Button
                  width={"95%"}
                  height={"50px"}
                  color={"white"}
                  bgColor={"#FF5656"}
                  _hover={{ bg: "#D34949" }}
                  fontWeight={"bold"}
                >
                  SUBMIT INQUIRY
                </Button>
              </Box>
            </Box>
          </Box>

          <Box
            bgColor={"#F8F9FA"}
            boxShadow={"0px 4px 10px rgba(0, 0, 0, 0.2)"}
            height={"800px"}
            width={"85%"}
            paddingBottom={"30px"}
          >
            <Box>
              <Heading
                display={"flex"}
                flexDirection={"row"}
                fontSize={"20px"}
                paddingTop={"40px"}
                paddingLeft={"30px"}
                gap={"20px"}
              >
                <FaPhoneAlt size={"25px"} />
                Contact Information
              </Heading>

              <Box
                display={"flex"}
                flexDirection={"column"}
                fontSize={"20px"}
                paddingTop={"40px"}
                paddingLeft={"30px"}
                gap={"20px"}
              >
                <Box
                  display={"flex"}
                  flexDirection={"row"}
                  gap={"30px"}
                  alignItems={"center"}
                >
                  <IoMail size={"25px"} />
                  <Box fontSize={"16px"} fontWeight={"medium"}>
                    Email Support
                    <Text
                      fontSize={"15px"}
                      fontWeight={"medium"}
                      color={"rgba(0, 0, 0, 0.46)"}
                    >
                      support@campushub.com
                    </Text>
                  </Box>
                </Box>
                <Box
                  display={"flex"}
                  flexDirection={"row"}
                  gap={"30px"}
                  alignItems={"center"}
                >
                  <BsFillPhoneFill size={"25px"} />
                  <Box fontSize={"16px"} fontWeight={"medium"}>
                    Phone Support
                    <Text
                      fontSize={"15px"}
                      fontWeight={"medium"}
                      color={"rgba(0, 0, 0, 0.46)"}
                    >
                      +60 1234 5678
                    </Text>
                  </Box>
                </Box>
                <Box
                  display={"flex"}
                  flexDirection={"row"}
                  gap={"30px"}
                  alignItems={"center"}
                >
                  <ImLocation2 size={"25px"} />
                  <Box fontSize={"16px"} fontWeight={"medium"}>
                    Office Address
                    <Text
                      fontSize={"15px"}
                      fontWeight={"medium"}
                      color={"rgba(0, 0, 0, 0.46)"}
                    >
                      Shah Alam, Selangor, <br />
                      Malaysia
                    </Text>
                  </Box>
                </Box>
                <br />
                <Divider borderColor={"gray.300"} width={"95%"} />
                <br />
                <Box
                  width={"95%"}
                  display={"flex"}
                  flexDirection={"column"}
                  gap={"30px"}
                >
                  <Box
                    display={"flex"}
                    flexDirection={"row"}
                    gap={"30px"}
                    alignItems={"center"}
                  >
                    <BsFillClockFill size={"25px"} />
                    <Heading fontSize={"20px"} fontWeight={"bold"}>
                      Business Hours
                    </Heading>
                  </Box>
                  <Box bgColor={"white"} borderRadius={"8px"}>
                    <Box p={"20px"}>
                      <Box
                        fontSize={"16px"}
                        fontWeight={"medium"}
                        paddingTop={"25px"}
                        paddingLeft={"20px"}
                      >
                        Monday - Friday <br />{" "}
                        <Text fontWeight={"normal"}>
                          9:00 AM - 5:00 PM (GMT+8)
                        </Text>
                      </Box>
                      <Box
                        fontSize={"16px"}
                        fontWeight={"medium"}
                        paddingTop={"25px"}
                        paddingLeft={"20px"}
                      >
                        Saturday <br />{" "}
                        <Text fontWeight={"normal"}>
                          9:00 AM - 1:00 PM (GMT+8)
                        </Text>
                      </Box>
                      <Box
                        fontSize={"16px"}
                        fontWeight={"medium"}
                        paddingTop={"25px"}
                        paddingLeft={"20px"}
                      >
                        Sunday & Public Holidays <br />{" "}
                        <Text fontWeight={"normal"}>Closed</Text>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}

export default contactUs;
