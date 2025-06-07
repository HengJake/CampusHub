import { Box, VStack, Button, Icon } from "@chakra-ui/react";
import { Link } from "react-router-dom";

import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaTools,
  FaLock,
  FaParking,
  FaClipboardList,
  FaBullhorn,
  FaCogs,
  FaUserCircle,
} from "react-icons/fa";
import { MdFeedback } from "react-icons/md";
import "../generalComponent.scss";

function Sidebar() {
  const sidebarButtonStyle = (label = "") => ({
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
      backgroundColor: "#344E41",
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
        {/* Group 1 */}
        <VStack
          bg="#344E41"
          borderRadius="15px"
          justifyContent={"center"}
          p={2}
        >
          <Link to="/admin-dashboard">
            <Button sx={sidebarButtonStyle("Dashboard")}>
              <Icon
                as={FaChalkboardTeacher}
                boxSize={6}
                color="white"
                zIndex={2}
              />
            </Button>
          </Link>
          <Link to="/student-management">
            <Button sx={sidebarButtonStyle("Students")}>
              <Icon as={FaUserGraduate} boxSize={6} color="white" zIndex={2} />
            </Button>
          </Link>
          <Link to="/facility-management">
            <Button sx={sidebarButtonStyle("Facility")}>
              <Icon as={FaTools} boxSize={6} color="white" zIndex={2} />
            </Button>
          </Link>
        </VStack>

        {/* Group 2 */}
        <VStack
          bg="#344E41"
          borderRadius="15px"
          justifyContent={"center"}
          p={2}
        >
          <Link to="/locker-management">
            <Button sx={sidebarButtonStyle("Lockers")}>
              <Icon as={FaLock} boxSize={6} color="white" zIndex={2} />
            </Button>
          </Link>
          <Link to="/parking-management">
            <Button sx={sidebarButtonStyle("Parking")}>
              <Icon as={FaParking} boxSize={6} color="white" zIndex={2} />
            </Button>
          </Link>
          <Link to="/booking-management">
            <Button sx={sidebarButtonStyle("Bookings")}>
              <Icon as={FaClipboardList} boxSize={6} color="white" zIndex={2} />
            </Button>
          </Link>
        </VStack>

        {/* Group 3 */}
        <VStack
          bg="#344E41"
          borderRadius="15px"
          justifyContent={"center"}
          p={2}
        >
          <Link to="/feedback-management">
            <Button sx={sidebarButtonStyle("Feedback")}>
              <Icon as={MdFeedback} boxSize={6} color="white" zIndex={2} />
            </Button>
          </Link>
          <Link to="/announcement-management">
            <Button sx={sidebarButtonStyle("Announcements")}>
              <Icon as={FaBullhorn} boxSize={6} color="white" zIndex={2} />
            </Button>
          </Link>
        </VStack>
      </VStack>
    </Box>
  );
}

export default Sidebar;
