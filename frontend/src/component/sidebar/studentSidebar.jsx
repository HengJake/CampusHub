import { Box, VStack, Button, Icon } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { PiCourtBasketballBold } from "react-icons/pi";
import { PiLockersFill } from "react-icons/pi";
import { FaParking } from "react-icons/fa";
import { SiGoogleclassroom } from "react-icons/si";
import { FaCalendarAlt } from "react-icons/fa";
import { GoGraph } from "react-icons/go";
import { FaUserCheck } from "react-icons/fa";
import { BiBus } from "react-icons/bi";
import { IoCarSharp } from "react-icons/io5";
import "../generalComponent.scss";

function Sidebar() {
  const sidebarButtonStyle = (isLast = false, label = "", isWrap = false) => ({
    padding: 0,
    flex: 1,
    position: "relative",
    background: "transparent",
    _hover: {
      background: "none",
    },
    "&::after": {
      content: `"${label}"`,
      opacity: 0,
      position: "absolute",
      top: "50%",
      left: "0", // start right after the button
      transform: "translateY(-50%)",
      backgroundColor: "blue.800",
      fontSize: "1rem",
      color: "white",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "0 15px 15px 0",
      transition: "all 0.3s ease-in-out",
      zIndex: 1,
      textAlign: "center",
      padding: "0.25rem 0.75rem",
      width: "max-content",
      minHeight: "100%",
    },
    "&:hover::after": {
      left: "100%",
      opacity: 1,
    },
  });

  return (
    <Box pos="fixed" top="64px" left="0" zIndex="100" height="100%">
      <VStack height="calc(100vh - 64px)" justify="center" p={3}>
        {/* First Group of Icons with Darkest Blue Gradient */}
        <VStack
          bg="blue.800"
          borderRadius="15px"
          justifyContent={"center"}
          p={2}
        >
          <Link to="/bookings">
            <Button sx={sidebarButtonStyle(false, "Book Court")}>
              <Icon
                as={PiCourtBasketballBold}
                boxSize={6}
                color="white"
                zIndex={2}
              />
            </Button>
          </Link>

          <Link to="/gym-locker-booking">
            <Button sx={sidebarButtonStyle(false, "Book Locker")}>
              <Icon as={PiLockersFill} boxSize={6} color="white" zIndex={2} />
            </Button>
          </Link>

          <Link to="/parking-map">
            <Button sx={sidebarButtonStyle(true, "Parking Lot")}>
              <Icon as={FaParking} boxSize={6} color="white" zIndex={2} />
            </Button>
          </Link>
        </VStack>

        <VStack
          bg="blue.800"
          borderRadius="15px"
          justifyContent={"center"}
          p={2}
        >
          <Link to="/class-finder">
            <Button sx={sidebarButtonStyle(false, "Classroom Finder", true)}>
              <Icon
                as={SiGoogleclassroom}
                boxSize={6}
                color="white"
                zIndex={2}
              />
            </Button>
          </Link>

          <Link to="/timetable">
            <Button sx={sidebarButtonStyle(false, "Class Schedule")}>
              <Icon as={FaCalendarAlt} boxSize={6} color="white" zIndex={2} />
            </Button>
          </Link>

          <Link to="/results">
            <Button sx={sidebarButtonStyle(false, "MyResult")}>
              <Icon as={GoGraph} boxSize={6} color="white" zIndex={2} />
            </Button>
          </Link>

          <Link to="/sign-attendance">
            <Button sx={sidebarButtonStyle(true, "Attendance")}>
              <Icon as={FaUserCheck} boxSize={6} color="white" zIndex={2} />
            </Button>
          </Link>
        </VStack>

        <VStack
          bg="blue.800"
          borderRadius="15px"
          justifyContent={"center"}
          p={2}
        >
          <Link to="/bus-schedule">
            <Button sx={sidebarButtonStyle(false, "Bus Schedule")}>
              <Icon as={BiBus} boxSize={6} color="white" zIndex={2} />
            </Button>
          </Link>

          <Link to="/campus-ride">
            <Button sx={sidebarButtonStyle(true, "Campus Ride")}>
              <Icon as={IoCarSharp} boxSize={6} color="white" zIndex={2} />
            </Button>
          </Link>
        </VStack>
      </VStack>
    </Box>
  );
}

export default Sidebar;
