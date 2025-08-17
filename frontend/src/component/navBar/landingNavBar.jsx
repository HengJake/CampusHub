import React, { useState, useEffect } from "react";
import {
  Button,
  Container,
  Flex,
  HStack,
  Image,
  Text,
  useColorMode,
  Box,
  IconButton,
  InputGroup,
  Input,
  InputLeftElement,
  useBreakpointValue,
  useDisclosure,
  VStack,
  useToast,
  List,
  ListItem,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdAccountCircle } from "react-icons/md";
import { CampusHubLogo } from "../campusHubLogo.jsx";
import Sidebar from "./Sidebar";

const headerColors = {
  landing: {
    primary: "#2563eb",
    accent: "#fbbf24",
    backgroundRgb: "255, 255, 255" // white background
  }
};

function LandingNavBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const colors = headerColors.landing;
  const glassBG = isHomePage ? "transparent" : `rgba(${colors.backgroundRgb}, 0.4)`;

  // Navigation items for landing page
  const navItems = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Pricing", path: "/pricing" },
    { label: "Service", path: "/service" },
    { label: "Contact", path: "/contact-us" }
  ];

  // Function to handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const filtered = navItems.filter(item =>
      item.label.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(filtered);
    setIsSearchOpen(filtered.length > 0);
  };

  // Function to handle search result click
  const handleSearchResultClick = (path) => {
    navigate(path);
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchOpen(false);
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <Flex
        flexDir={"column"}
        px={4}
        bg={glassBG}
        position={"fixed"}
        top={2}
        left={{ base: "24px", lg: "8px" }}
        right={{ base: "24px", lg: "8px" }}
        zIndex={1000}
        sx={{
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 32px 0 rgba(0,0,0,0.1)",
          borderRadius: "10px",
        }}
      >
        <Flex
          h={16}
          align={"center"}
          justify={"space-between"}
        >
          <HStack>
            {isMobile ? (
              <HStack spacing={3}>
                <IconButton
                  icon={<HamburgerIcon />}
                  aria-label="Open navigation menu"
                  variant="ghost"
                  colorScheme="gray"
                  onClick={onOpen}
                />
              </HStack>
            ) : ""}

            <CampusHubLogo />
          </HStack>

          {isMobile ? "" : (
            <HStack
              spacing={8}
              display={{ base: "none", md: "flex" }}
              position={"absolute"}
              transform={"translateX(50%)"}
            >
              {navItems.map((item) => (
                <Text key={item.path} color={"gray.800"}>
                  <Link to={item.path}>{item.label}</Link>
                </Text>
              ))}
            </HStack>
          )}

          <HStack spacing={3}>
            <Button
              bg={"transparent"}
              _hover={{ bg: "blue.200" }}
              color={"blue.800"}
            >
              <Link to="/login">Login</Link>
            </Button>
            <Button backgroundColor={"blue.600"} color={"white"}>
              <Link to="/signup">Join Now</Link>
            </Button>
          </HStack>
        </Flex>
      </Flex>

      {/* Mobile Sidebar Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Navigation</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch" mt={4}>
              {navItems.map((item) => (
                <Box key={item.path} py={2}>
                  <Link to={item.path} onClick={onClose}>
                    <Text fontSize="lg" color="gray.800" _hover={{ color: "blue.600" }}>
                      {item.label}
                    </Text>
                  </Link>
                </Box>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default LandingNavBar;
