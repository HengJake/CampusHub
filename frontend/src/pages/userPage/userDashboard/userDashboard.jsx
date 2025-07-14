import React from "react";
import "./userDashboard.scss";
import { useEffect, useState } from "react";
import { useUserStore } from "../../../store/user";
import { useNavigate } from "react-router-dom";
import { MdAccountCircle } from "react-icons/md";

import {
  Box,
  Grid,
  Flex,
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
import classSchedule from "../classSchedule/classSchedule";

function userDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const { getAllUsers } = useUserStore();

  const handleAttendance = async () => {
    navigate("/attendance");
  };
  const handleBus_schedule = async () => {
    navigate("/bus-schedule");
  };
  const handleParkingLot = async () => {
    navigate("/parking-lot"); // Fixed: navigate to parking-lot instead of attendance
  };
  const handleNewBooking = async () => {
    navigate("/book-facility"); // Fixed: navigate to book-facility instead of attendance
  };
  const handleHelp = async () => {
    navigate("/feedback"); // Fixed: navigate to feedback instead of attendance
  };

  const handleProfile = async () => {
    navigate("/user-profile");
  };



  return (
    <Flex
      display={"flex"}
      flexDirection={"column"}
      width={"100%"}
      gap={10}
      p={10}
    >
      <Box
        bgColor={"blue.800"}
        color={"white"}
        borderRadius={"25px"}
        height={"300px"}
        width={"100%"}
        p={10}
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"space-between"}
        boxShadow={"lg"}
        gap={50}
      >
        <Box w={"100%"}>
          <Text fontWeight={"bold"} fontSize={"30px"}>
            Welcome back,{" "}
          </Text>
          {users.map((user) => {
            <p>{user.name}</p>;
          })}
          <br />
          <Box
            display={"flex"}
            flexDirection={"row"}
            alignItems={"center"}
            gap={5}
          >
            <Button
              w={"auto"}
              h={"auto"}
              bgColor={"transparent"}
              borderRadius={"full"}
              onClick={handleProfile}
              _hover={{ bgColor: "transparent" }}
            >
              {/* UserProfile */}
              <MdAccountCircle color="white" size={"150px"} />
            </Button>
            <Box display={"flex"} flexDirection={"column"}>
              <Text fontSize={"20px"}>Coursename</Text>
              <Text fontSize={"20px"}>username@gmail.com</Text>
            </Box>
          </Box>
        </Box>
        <Box
          display={"flex"}
          flexDirection={"column"}
          w={"100%"}
          h={"fit-content"}
          gap={5}
        >
          <Heading fontSize={"24px"}>Quick Access</Heading>
          <Box
            display={"flex"}
            flexDirection={"row"}
            position={"relative"}
            gap={5}
            w={"100%"}
          >
            <Grid
              templateColumns="repeat(2, 1fr)"
              gap={5}
              position={"relative"}
              width={"100%"}
            >
              <Button
                transition="all 0.1s ease-in-out"
                _hover={{ transform: "scale(1.05)", fontWeight: "bold" }}
                fontWeight={"medium"}
                w={"100%"}
                h={"50px"}
                borderRadius={"10px"}
                onClick={handleAttendance}
              >
                Sign Attendance
              </Button>
              <Button
                transition="all 0.1s ease-in-out"
                _hover={{ transform: "scale(1.05)", fontWeight: "bold" }}
                fontWeight={"medium"}
                w={"100%"}
                h={"50px"}
                borderRadius={"10px"}
                onClick={handleBus_schedule}
              >
                Bus Schedule
              </Button>
              <Button
                transition="all 0.1s ease-in-out"
                _hover={{ transform: "scale(1.05)", fontWeight: "bold" }}
                fontWeight={"medium"}
                w={"100%"}
                h={"50px"}
                borderRadius={"10px"}
                onClick={handleParkingLot} // Fixed: use function instead of empty string
              >
                Reserve Parking
              </Button>
              <Button
                transition="all 0.1s ease-in-out"
                _hover={{ transform: "scale(1.05)", fontWeight: "bold" }}
                fontWeight={"medium"}
                w={"100%"}
                h={"50px"}
                borderRadius={"10px"}
                onClick={handleNewBooking} // Fixed: use function instead of empty string
              >
                New Booking
              </Button>
              <Button
                transition="all 0.1s ease-in-out"
                _hover={{ transform: "scale(1.05)", fontWeight: "bold" }}
                fontWeight={"medium"}
                w={"100%"}
                h={"50px"}
                borderRadius={"10px"}
                onClick={handleHelp} // Fixed: use function instead of empty string
              >
                Help Centre
              </Button>
            </Grid>
          </Box>
        </Box>
      </Box>
      <hr />
      <Box
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"space-between"}
        gap={50}
      >
        <Box
          bgColor={"#CAE9FF"}
          color={"black"}
          borderRadius={"25px"}
          height={"300px"}
          width={"100%"}
          p={10}
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"space-between"}
          boxShadow={"lg"}
          transition="all 0.05s ease-in-out"
          _hover={{ transform: "scale(1.01)" }}
        >
          <Box w={"50%"}>
            <Heading fontWeight={"bold"} fontSize={"30px"}>
              Class Schedule
            </Heading>
            <br />
            <Text fontWeight={"medium"} fontSize={"20px"}>
              03 May 2025 <br />
              Responsive Web Developement Design
            </Text>
            <Text fontSize={"18px"}>
              C-04-02 <br />
              01:00 - 03:00
            </Text>
          </Box>
        </Box>
        <Box
          bgColor={"#CAE9FF"}
          color={"black"}
          borderRadius={"25px"}
          height={"300px"}
          width={"100%"}
          p={10}
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"space-between"}
          boxShadow={"lg"}
          transition="all 0.05s ease-in-out"
          _hover={{ transform: "scale(1.01)" }}
        >
          {" "}
          <Box w={"50%"}>
            <Heading fontWeight={"bold"} fontSize={"30px"}>
              Exam Schedule
            </Heading>
            <br />
            <Text fontWeight={"medium"} fontSize={"20px"}>
              03 May 2025 <br />
              Responsive Web Developement Design
            </Text>
            <Text fontSize={"18px"}>
              Exam Hall 1<br />
              01:00 - 03:00
            </Text>
          </Box>
        </Box>
      </Box>

      <hr />
      <Box
        color={"black"}
        borderRadius={"25px"}
        height={"300px"}
        width={"100%"}
        p={10}
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"space-between"}
      >
        <Box w={"50%"}>
          <Heading fontWeight={"bold"} fontSize={"30px"}>
            My Booking
          </Heading>
        </Box>
        <Box w={"50%"}>
          <Heading fontWeight={"bold"} fontSize={"30px"}>
            Oncoming Class
          </Heading>
        </Box>
      </Box>
    </Flex>
  );
}

export default userDashboard;
