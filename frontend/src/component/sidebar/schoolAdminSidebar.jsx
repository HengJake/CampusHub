import { Box, VStack, Button, Icon, CloseButton, HStack, Input, InputGroup, InputLeftElement, Divider, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FiHome, FiUsers, FiSettings, FiClipboard, FiBell, FiSearch, FiUser, FiLogOut, FiKey, FiCalendar, FiBarChart, FiCheckSquare, FiBookOpen, FiMessageSquare } from "react-icons/fi";
import { FaSchool, FaChalkboardTeacher, FaLock, FaParking, FaClipboardList, FaUserGraduate, FaRegCalendarAlt, FaBullhorn } from "react-icons/fa";
import React from "react";
import "../generalComponent.scss";

function Sidebar({ isOpen, onClose }) {
  // School admin nav groups and links
  const navGroups = [
    {
      label: "Dashboard",
      items: [
        { label: "Dashboard", icon: FiHome, to: "/admin-dashboard" },
      ],
    },
    {
      label: "Management",
      items: [
        { label: "Student Management", icon: FaUserGraduate, to: "/student-management" },
        { label: "Facility Management", icon: FaSchool, to: "/facility-management" },
        { label: "Locker Management", icon: FaLock, to: "/locker-management" },
        { label: "Parking Management", icon: FaParking, to: "/parking-management" },
        { label: "Booking Management", icon: FaClipboardList, to: "/booking-management" },
        { label: "Feedback Management", icon: FiMessageSquare, to: "/feedback-management" },
        { label: "Announcement Management", icon: FaBullhorn, to: "/announcement-management" },
      ],
    },
    {
      label: "Academics",
      items: [
        { label: "Academic Overview", icon: FiBookOpen, to: "/academic-overview" },
        { label: "Course Management", icon: FiClipboard, to: "/course-management" },
      ],
    },
    {
      label: "Settings & Profile",
      items: [
        { label: "Admin Setting", icon: FiSettings, to: "/admin-setting" },
        { label: "Profile", icon: FiUser, to: "/admin-profile" },
        { label: "Log Out", icon: FiLogOut, to: "/logout" },
      ],
    },
  ];

  return (
    <Box
      pos="fixed"
      top="64px"
      left={isOpen ? "0" : "-300px"}
      transition="left 0.3s cubic-bezier(0.4,0,0.2,1)"
      zIndex="100"
      height="100%"
      width="300px"
      bg="white"
      boxShadow={isOpen ? "2px 0 8px rgba(0,0,0,0.08)" : "none"}
      display="flex"
      flexDirection="column"
    >
      {/* Top: Search and Notifications (optional, can be added if needed) */}
      {/* <Box px={4} pt={4} pb={2} bg="green.800" borderTopRadius="md">
        <HStack justify="space-between">
          <InputGroup maxW="180px">
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input placeholder="Search..." size="sm" bg="white" borderRadius="md" />
          </InputGroup>
          <Icon as={FiBell} color="white" boxSize={5} cursor="pointer" />
          <CloseButton onClick={onClose} size="md" color="white" bg="green.800" _hover={{ bg: "green.600" }} />
        </HStack>
      </Box> */}
      <Divider />
      {/* Navigation Groups */}
      <VStack align="stretch" spacing={1} flex={1} overflowY="auto" py={2} px={2}>
        {navGroups.map((group, idx) => (
          <Box key={group.label} mb={2}>
            <Text fontSize="sm" fontWeight="bold" color="green.800" mb={1} pl={2}>
              {group.label}
            </Text>
            <VStack align="stretch" spacing={0}>
              {group.items.map((item) => (
                <Link to={item.to} key={item.label} style={{ textDecoration: "none" }}>
                  <Button
                    variant="ghost"
                    justifyContent="flex-start"
                    leftIcon={<Icon as={item.icon} boxSize={5} />}
                    width="100%"
                    fontWeight="normal"
                    fontSize="md"
                    color="gray.700"
                    _hover={{ bg: "green.50", color: "green.800" }}
                    borderRadius="md"
                    py={2}
                    px={3}
                    onClick={item.label === "Log Out" ? () => { localStorage.clear(); window.location.href = "/login"; } : undefined}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </VStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

export default Sidebar;
