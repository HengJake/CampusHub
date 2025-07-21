import React from "react";
import { Flex, Text, Box, IconButton, InputGroup, Input, InputLeftElement, HStack, Avatar, useBreakpointValue, useDisclosure, VStack } from "@chakra-ui/react";
import { HamburgerIcon, BellIcon, SearchIcon } from "@chakra-ui/icons";
import Sidebar from "./Sidebar";
import navConfig from "../../config/navConfig";

const headerColors = {
    student: {
        primary: "#2563eb",
        accent: "#fbbf24",
        backgroundRgb: "37, 99, 235" // subtle gray
    },
    schoolAdmin: {
        primary: "#059669",
        accent: "#f59e42",
        backgroundRgb: "220, 252, 231" // subtle green
    },
    companyAdmin: {
        primary: "#7c3aed",
        accent: "#f472b6",
        backgroundRgb: "237, 233, 254" // subtle violet
    }
};

const HeaderNavbar = ({ role }) => {
    const getRgba = (rgb, alpha) => `rgba(${rgb}, ${alpha})`;
    const isMobile = useBreakpointValue({ base: true, md: false });
    const { isOpen, onOpen, onClose } = useDisclosure();

    const navItems = navConfig[role] || [];
    const colors = headerColors[role] || headerColors.student;

    const glassBG = getRgba(colors.backgroundRgb, 0.3);
    return (
        <>
            <Sidebar isOpen={isOpen} onClose={onClose} role={role} sidebarColors={headerColors} glassBG={glassBG} />
            <Flex
                as="header"
                h={{ base: "56px", md: "64px" }}
                align="center"
                justify="space-between"
                px={4}
                py={2}
                // bg="transparent"
                color="white"
                position="fixed"
                top={2}
                left={"96px"}
                right={"8px"}
                zIndex={100}
                direction={{ base: "column", md: "row" }}
                bg={glassBG}
                sx={{
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    boxShadow: "0 8px 32px 0 rgba(0,0,0,0.37)",
                    borderRadius: "10px",
                }}
            >
                {isMobile ? (<HStack spacing={3}>

                    <IconButton
                        icon={<HamburgerIcon />}
                        aria-label="Open sidebar"
                        variant="ghost"
                        colorScheme="whiteAlpha"
                        onClick={isOpen ? onClose : onOpen}
                    />

                </HStack>) : ""}

                <Box color={"gray.800"}>
                    <Text fontSize={"10px"}>Welcome Back</Text>
                    <Text fontSize={"20px"} fontWeight={"800"} lineHeight="0.9">Name</Text>
                </Box>
                <InputGroup maxW={{ base: "60vw", md: "400px" }} mx={4} display={{ base: "none", md: "flex" }}>
                    <InputLeftElement pointerEvents="none">
                        <SearchIcon color="gray.400" />
                    </InputLeftElement>
                    <Input placeholder="Search..." bg="white" color="black" borderRadius="md" />
                </InputGroup>
                <HStack spacing={3}>
                    <IconButton
                        py={2}
                        px={4}
                        icon={<BellIcon />}
                        aria-label="Notifications"
                        variant="ghost"
                        color={colors.primary}
                        _hover={{ bg: colors.accent + '33' }}
                    />
                    <Avatar size="sm" name="User" />
                </HStack>
            </Flex >
        </>
    );
};

export default HeaderNavbar; 