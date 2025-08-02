import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button, HStack, Text, Badge, Box, Collapse, VStack } from "@chakra-ui/react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const NavItem = ({ item, isCollapsed, level = 0, accentColor, primaryColor, toggleSidebar, isMobile }) => {
    // Set isOpen to false by default for all levels
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = item.children && item.children.length > 0;
    const navigate = useNavigate();

    // Fallbacks for colors
    const accent = accentColor || "#fbbf24";
    const primary = primaryColor || "#2563eb";
    const bgColor = level > 0 ? "transparent" : "transparent";
    const hoverBg = accent + "33"; // 20% opacity for hover
    const textColor = primary;

    const handleClick = () => {
        console.log("🚀 ~ handleClick ~ isOpen:", isOpen)

        if (hasChildren) {

            if (isCollapsed) {
                toggleSidebar();
                setIsOpen(true);
            } else {
                setIsOpen(!isOpen);
            }

            return
        }

        navigate(item.path);
    };

    return (
        <Box w="full">
            <Button
                as={item.href ? Link : undefined}
                to={item.href}
                variant="ghost"
                w="full"
                h={level === 0 ? "12" : "10"}
                justifyContent={isCollapsed ? "center" : "flex-start"}
                px={isCollapsed ? 0 : level === 0 ? 4 : 6}
                py={2}
                onClick={handleClick}
                bg={bgColor}
                _hover={{ bg: hoverBg }}
                color={textColor}
                fontWeight={level === 0 ? "medium" : "normal"}
                fontSize={level === 0 ? "sm" : "xs"}
            >
                <HStack spacing={3} w="full" justify={isCollapsed ? "center" : ""}>
                    {item.icon && <item.icon size={level === 0 ? 18 : 16} color={primary} />}
                    {(!isCollapsed || isMobile) && (
                        <>
                            <Text flex="1" textAlign="left" color={textColor}>
                                {item.name || item.label}
                            </Text>
                            {item.badge && (
                                <Badge bg={accent} color="white" size="sm">
                                    {item.badge}
                                </Badge>
                            )}
                            {hasChildren && <Box>{isOpen ? <FiChevronDown size={14} color={primary} /> : <FiChevronRight size={14} color={primary} />}</Box>}
                        </>
                    )}
                </HStack>
            </Button>
            {hasChildren && !isCollapsed && (
                <Collapse in={isOpen}>
                    <VStack spacing={1} align="stretch" pl={2}>
                        {item.children.map((child, idx) => (
                            <NavItem key={idx} item={child} isCollapsed={isCollapsed} level={level + 1} accentColor={accent} primaryColor={primary} />
                        ))}
                    </VStack>
                </Collapse>
            )}
        </Box>
    );
};

export default NavItem; 