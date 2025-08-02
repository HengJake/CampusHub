import { Box, VStack, Button, Icon } from "@chakra-ui/react";
import { Link } from "react-router-dom";

import {
  MdDashboard,
  MdAssessment,
  MdManageAccounts,
  MdSettings,
  MdPerson,
} from "react-icons/md";
import { FaRegIdCard } from "react-icons/fa";
import { BsPeopleFill } from "react-icons/bs";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
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
      backgroundColor: "#442212",
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
          bg="#442212"
          borderRadius="15px"
          justifyContent={"center"}
          p={2}
        >
          <Link to="/campushub-dashboard">
            <Button sx={sidebarButtonStyle("Dashboard")}>
              <Icon as={MdDashboard} boxSize={6} color="white" zIndex={2} />
            </Button>
          </Link>
          <Link to="/subscription">
            <Button sx={sidebarButtonStyle("Subscription")}>
              <Icon as={FaRegIdCard} boxSize={6} color="white" zIndex={2} />
            </Button>
          </Link>
          <Link to="/analytical-report">
            <Button sx={sidebarButtonStyle("Analytics")}>
              <Icon as={MdAssessment} boxSize={6} color="white" zIndex={2} />
            </Button>
          </Link>
        </VStack>

        {/* Group 2 */}
        <VStack
          bg="#442212"
          borderRadius="15px"
          justifyContent={"center"}
          p={2}
        >
          <Link to="/client-management">
            <Button sx={sidebarButtonStyle("Clients")}>
              <Icon as={BsPeopleFill} boxSize={6} color="white" zIndex={2} />
            </Button>
          </Link>
          <Link to="/user-oversight">
            <Button sx={sidebarButtonStyle("Users")}>
              <Icon
                as={AiOutlineUsergroupAdd}
                boxSize={6}
                color="white"
                zIndex={2}
              />
            </Button>
          </Link>
        </VStack>
      </VStack>
    </Box>
  );
}

export default Sidebar;
