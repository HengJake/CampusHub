import { Box, VStack, Button, Icon, CloseButton } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { PiCourtBasketballBold } from "react-icons/pi";
import { PiLockersFill } from "react-icons/pi";
import { FaParking, FaUser } from "react-icons/fa";
import { SiGoogleclassroom } from "react-icons/si";
import { FaCalendarAlt, FaBus as FiBus2 } from "react-icons/fa";
import { GoGraph } from "react-icons/go";
import { FaUserCheck } from "react-icons/fa";
import { BiBus } from "react-icons/bi";
import { IoCarSharp } from "react-icons/io5";
import { FiHome, FiBookOpen, FiSettings, FiMessageSquare, FiMapPin } from "react-icons/fi";
import "../generalComponent.scss";
import React from "react";

function Sidebar({ isOpen, onClose }) {
  const sidebarButtonStyle = (isLast = false, label = "", isWrap = false) => ({
    padding: 0,
    flex: 1,
    position: "relative",
    background: "transparent",
    _hover: {
      background: "none",
    },
    "&::after": {
      pointerEvents: "none",
      content: `"${label}"`,
      opacity: 0,
      position: "absolute",
      top: "50%",
      left: "0",
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
      <VStack height="calc(100vh - 64px)" justify="center" p={3} spacing={4}>
        {/* Main Navigation */}
        <VStack bg="blue.800" borderRadius="15px" justifyContent={"center"} p={2}>
          <Link to="/user-dashboard">
            <Button sx={sidebarButtonStyle(false, "Dashboard")}> <Icon as={FiHome} boxSize={6} color="white" zIndex={2} /> </Button>
          </Link>
          <Link to="/user-profile">
            <Button sx={sidebarButtonStyle(false, "Profile")}> <Icon as={FaUser} boxSize={6} color="white" zIndex={2} /> </Button>
          </Link>
          <Link to="/academic">
            <Button sx={sidebarButtonStyle(false, "Academic")}> <Icon as={FiBookOpen} boxSize={6} color="white" zIndex={2} /> </Button>
          </Link>
          <Link to="/facility">
            <Button sx={sidebarButtonStyle(false, "Facility Management")}> <Icon as={FiMapPin} boxSize={6} color="white" zIndex={2} /> </Button>
          </Link>
          <Link to="/transportation">
            <Button sx={sidebarButtonStyle(false, "Transportation")}> <Icon as={FiBus2} boxSize={6} color="white" zIndex={2} /> </Button>
          </Link>
          <Link to="/feedback">
            <Button sx={sidebarButtonStyle(false, "Feedback")}> <Icon as={FiMessageSquare} boxSize={6} color="white" zIndex={2} /> </Button>
          </Link>
        </VStack>
      </VStack>
    </Box>
  );
}

export default Sidebar;
