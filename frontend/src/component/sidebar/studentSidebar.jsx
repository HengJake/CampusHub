import { Box, VStack, Button, Icon, CloseButton, HStack, Input, InputGroup, InputLeftElement, Divider, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FiHome, FiMessageSquare, FiUser, FiLogOut, FiBookOpen, FiMapPin } from "react-icons/fi";
import { FaBus } from "react-icons/fa";
import React from "react";
import "../generalComponent.scss";

function Sidebar({ isOpen, onClose }) {
  // Only include routes that exist in App.jsx for students
  const navGroups = [
    {
      label: "Main",
      items: [
        { label: "Dashboard", icon: FiHome, to: "/user-dashboard" },
        { label: "Profile", icon: FiUser, to: "/user-profile" },
      ],
    },
    {
      label: "Features",
      items: [
        { label: "Feedback", icon: FiMessageSquare, to: "/feedback" },
        { label: "Academic", icon: FiBookOpen, to: "/academic" },
        { label: "Facility", icon: FiMapPin, to: "/facility" },
        { label: "Transportation", icon: FaBus, to: "/transportation" },
      ],
    },
    {
      label: "Account",
      items: [
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
      boxShadow={isOpen ? "-2px 0 8px rgba(0,0,0,0.08)" : "none"}
      display="flex"
      flexDirection="column"
    >
      <Divider />
      {/* Navigation Groups */}
      <VStack align="stretch" spacing={1} flex={1} overflowY="auto" py={2} px={2}>
        {navGroups.map((group, idx) => (
          <Box key={group.label} mb={2}>
            <Text fontSize="sm" fontWeight="bold" color="blue.800" mb={1} pl={2}>
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
                    _hover={{ bg: "blue.50", color: "blue.800" }}
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
