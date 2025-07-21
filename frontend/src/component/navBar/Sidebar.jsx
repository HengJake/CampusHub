import React, { useEffect, useState } from "react";
import { Box, VStack, HStack, IconButton, Divider, Text, Button, useEditable } from "@chakra-ui/react";
import { FiMenu, FiX } from "react-icons/fi";
import { IoIosSettings } from "react-icons/io";
import { RiLogoutBoxRLine } from "react-icons/ri";
import NavItem from "./NavItem";
import navConfig from "../../config/navConfig";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ role = "student", sidebarColors, glassBG }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const navItems = navConfig[role] || [];
    const colors = sidebarColors[role] || sidebarColors.student;
    const items = navItems;
    const navigate = useNavigate();

    const toggleSidebar = () => setIsCollapsed((prev) => !prev);

    return (
        <Box
            left={2}
            top={2}
            bottom={2}
            w={isCollapsed ? "80px" : "64"}
            borderRadius={10}
            transition="width 0.2s"
            position="fixed"
            zIndex={101}
            bg={glassBG}
            sx={{
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "10px",
            }}
            borderLeft={"10px solid " + colors.primary}
        >
            <VStack spacing={0} align="stretch" h={"100%"}>
                {/* Header */}
                <Box py={3} px={isCollapsed ? 2 : 3} borderColor={colors.primary} borderBottom={"1px"}>
                    <HStack justify={isCollapsed ? "center" : "space-between"} >
                        {!isCollapsed && (
                            <Text fontWeight="semibold" fontSize="sm" color={colors.primary}>
                                CampusHub
                            </Text>
                        )}
                        <IconButton
                            aria-label="Toggle sidebar"
                            icon={isCollapsed ? <FiMenu /> : <FiX />}
                            variant="ghost"
                            onClick={toggleSidebar}
                            color={colors.primary}
                            _hover={{ bg: colors.accent + "33" }}
                        />
                    </HStack>
                </Box>
                {/* Navigation */}
                <Box flex="1" overflowY="auto" overflowX={"hidden"} p={2}>
                    <VStack spacing={1} align="stretch">
                        {items.map((item, idx) => (
                            <NavItem key={idx} item={item} isCollapsed={isCollapsed} accentColor={colors.accent} primaryColor={colors.primary} toggleSidebar={toggleSidebar} />
                        ))}
                    </VStack>
                </Box>
                {/* Bottom Items */}
                <VStack p={2} borderTop={"1px solid rgba(229, 231, 235, 1)"} gap={1}  >
                    {isCollapsed ? (
                        <Button w={"full"} py={2} variant={"ghost"} _hover={{ bg: "#374151" + "33" }}
                            onClick={() => { role === "companyAdmin" ? navigate("/campushub-setting") : "" }}
                            color={"gray.700"}>
                            <IoIosSettings />
                        </Button>) : (
                        <Button
                            justifyContent={"start"}
                            w={"full"}
                            variant="ghost"
                            py={2}
                            px={4}
                            leftIcon={<IoIosSettings />}
                            _hover={{ bg: "#374151" + "33" }}
                            color={"gray.700"}
                        >
                            Setting
                        </Button>
                    )}
                    {isCollapsed ? (
                        <Button w={"full"} py={2} variant={"ghost"} _hover={{ bg: "#ef4444" + "33" }}
                            color={"red.700"} >
                            <RiLogoutBoxRLine />
                        </Button>) : (
                        <Button
                            justifyContent={"start"}
                            w={"full"}
                            variant="ghost"
                            py={2}
                            px={4}
                            leftIcon={<RiLogoutBoxRLine />}
                            _hover={{ bg: "#ef4444" + "33" }}
                            color={"red.700"}
                        >
                            Log Out
                        </Button>
                    )}
                </VStack>
            </VStack>
        </Box>
    );
};

export default Sidebar;