import React, { useEffect, useState } from "react";
import { Box, VStack, HStack, IconButton, Divider, Text, Button, useEditable } from "@chakra-ui/react";
import { FiMenu, FiX } from "react-icons/fi";
import { IoIosSettings } from "react-icons/io";
import { RiLogoutBoxRLine } from "react-icons/ri";
import NavItem from "./NavItem";
import navConfig from "../../config/navConfig";
import { useNavigate } from "react-router-dom";
import { useBreakpointValue } from "@chakra-ui/react";

const Sidebar = ({ isOpen, onClose, role = "student", sidebarColors, glassBG }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const navItems = navConfig[role] || [];
    const colors = sidebarColors[role] || sidebarColors.student;
    const items = navItems;
    const isMobile = useBreakpointValue({ base: true, lg: false });
    const navigate = useNavigate();

    let navigateTo;
    if (role === "companyAdmin") {
        navigateTo = () => navigate("/campushub-setting");
    } else if (role === "schoolAdmin") {
        navigateTo = () => navigate("/admin-setting");
    } else {
        navigateTo = () => navigate("/user-profile");
    }

    const toggleSidebar = () => setIsCollapsed((prev) => !prev);

    return (
        <Box
            left={isMobile ? (isOpen ? 6 : "-100%") : 2}
            right={isMobile ? 2 : "auto"}
            width={isMobile ? "calc(100% - 3rem)" : isCollapsed ? "80px" : "16rem"}
            top={{ base: 20, lg: 2 }}
            bottom={2}
            borderRadius={10}
            transition={isMobile ? ("all 0.5s ease-in") : ("all 0.2s")}
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
                <Box py={3} px={isCollapsed ? 2 : 3} borderColor={colors.primary} borderBottom={"1px"} display={{ base: "none", lg: "block" }}>
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
                            <NavItem key={idx} item={item} isCollapsed={isCollapsed} isMobile={isMobile} accentColor={colors.accent} primaryColor={colors.primary} toggleSidebar={toggleSidebar} />
                        ))}
                    </VStack>
                </Box>
                {/* Bottom Items */}
                <VStack p={2} borderTop={"1px solid rgba(229, 231, 235, 1)"} gap={1}  >
                    {(!isCollapsed || isMobile) ?
                        (
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
                        ) : (
                            <Button w={"full"} py={2} variant={"ghost"} _hover={{ bg: "#374151" + "33" }}
                                onClick={() => { navigateTo() }}
                                color={"gray.700"}>
                                <IoIosSettings />
                            </Button>
                        )}
                    {(!isCollapsed || isMobile) ? (
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
                    ) : (
                        <Button w={"full"} py={2} variant={"ghost"} _hover={{ bg: "#ef4444" + "33" }}
                            color={"red.700"} >
                            <RiLogoutBoxRLine />
                        </Button>
                    )}
                </VStack>
            </VStack>
        </Box>
    );
};

export default Sidebar;