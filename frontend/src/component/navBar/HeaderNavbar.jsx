import React, { useState, useEffect } from "react";
import { Flex, Text, Box, IconButton, InputGroup, Input, InputLeftElement, HStack, useBreakpointValue, useDisclosure, VStack, useToast, List, ListItem, Button, Tooltip } from "@chakra-ui/react";
import { HamburgerIcon, BellIcon, SearchIcon } from "@chakra-ui/icons";
import Sidebar from "./Sidebar";
import navConfig from "../../config/navConfig";
import { useNavigate } from "react-router-dom";
import toolTips from "../common/toolTips";
import { useUserStore } from "../../store/user";
import { useAuthStore } from "../../store/auth";
import { CampusHubLogo } from "../campusHubLogo";
import ProfilePicture from "../common/ProfilePicture";

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
    const [userName, setUserName] = useState("User");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults] = useState([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        profilePicture: "",
    });
    const [schoolName, setSchoolName] = useState("");
    const getRgba = (rgb, alpha) => `rgba(${rgb}, ${alpha})`;
    const isMobile = useBreakpointValue({ base: true, lg: false });
    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate();
    const toast = useToast();

    let navigateTo;
    if (role === "student") {
        navigateTo = () => navigate("/user-profile");
    } else if (role === "schoolAdmin") {
        navigateTo = () => navigate("/admin-profile");
    } else {
        navigateTo = () => navigate("/campushub-setting");
    }

    const navItems = navConfig[role] || [];
    const colors = headerColors[role] || headerColors.student;

    const glassBG = getRgba(colors.backgroundRgb, 0.3);

    // Function to flatten navigation items and their children
    const flattenNavItems = (items) => {
        const flattened = [];
        items.forEach(item => {
            if (item.children) {
                item.children.forEach(child => {
                    flattened.push({
                        label: `${item.label} > ${child.label}`,
                        path: child.path,
                        icon: child.icon
                    });
                });
            } else {
                flattened.push(item);
            }
        });
        return flattened;
    };

    // Function to handle search
    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim() === "") {
            setSearchResults([]);
            setIsSearchOpen(false);
            return;
        }

        const flattenedItems = flattenNavItems(navItems);
        const filtered = flattenedItems.filter(item =>
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

    const handleNotificationClick = () => {
        toast({
            title: "Push Notifications",
            description: "Push notifications feature is coming soon! Stay tuned for updates.",
            status: "info",
            duration: 4000,
            isClosable: true,
            position: "top-right",
        });
    };



    const { getUser } = useUserStore();

    const fixGoogleProfilePictureUrl = (url) => {
        if (!url) return url;

        // If it's a Google profile picture URL, ensure it's properly formatted
        if (url.includes('googleusercontent.com')) {
            // Try different size parameters to ensure the image loads
            // Remove existing size parameters and add a larger size
            const baseUrl = url.replace(/=s\d+-c$/, '');
            const fixedUrl = `${baseUrl}=s400-c`;
            return fixedUrl;
        }

        return url;
    };

    // Fetch user profile data
    useEffect(() => {
        const fetchUserData = async () => {
            try {

                await useAuthStore.getState().authorizeUser();

                // Use auth store method instead of fetch
                const data = useAuthStore.getState().currentUser;

                if (data) {

                    // Extract school name from auth result
                    if (data.school && data.school.name) {
                        setSchoolName(data.school.name);
                    }

                    // Update profile data with real user data
                    if (data._id) {
                        // Use user store method instead of fetch
                        const userResult = await getUser(data._id);

                        if (userResult.success && userResult.data) {
                            const user = userResult.data;

                            const fixedProfilePictureUrl = fixGoogleProfilePictureUrl(user.profilePicture);
                            const finalProfileData = {
                                name: user.name || "",
                                email: user.email || "",
                                profilePicture: fixedProfilePictureUrl || "",
                            };
                            setProfileData(finalProfileData);
                            setUserName(user.name || "User");
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [getUser]);

    return (
        <>
            <Sidebar isOpen={isOpen} onClose={onClose} role={role} sidebarColors={headerColors} glassBG={glassBG} />
            <Flex
                as="header"
                h={"64px"}
                align="center"
                justify="space-between"
                px={4}
                py={2}
                // bg="transparent"
                color="white"
                position="fixed"
                top={2}
                left={{ base: "24px", lg: "96px" }}
                right={{ base: "24px", lg: "8px" }}
                zIndex={100}
                direction={"row"}
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
                        colorScheme="gray"
                        onClick={isOpen ? onClose : onOpen}
                    />

                </HStack>) : ""}

                <Box color={"gray.800"}>
                    <HStack>
                        <CampusHubLogo />
                        <Box>
                            <Text fontSize={"10px"}>Welcome Back</Text>
                            <Text fontSize={"20px"} fontWeight={"800"} lineHeight="0.9">{profileData.name || userName}</Text>
                            {schoolName && (role === "schoolAdmin" || role === "student") ? (
                                <Text fontSize={"10px"} color="gray.600" fontStyle="italic">
                                    {schoolName}
                                </Text>
                            ) : (<Text fontSize={"10px"} color="gray.600" fontStyle="italic">
                                CampusHub Company
                            </Text>)}
                        </Box>
                    </HStack>
                </Box>

                <Box position="relative" className="search-container" w={{ base: "60vw", lg: "500px" }} mx={4} display={{ base: "none", lg: "block" }}>
                    <InputGroup>
                        <InputLeftElement pointerEvents="none">
                            <SearchIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                            placeholder="Search pages..."
                            bg="white"
                            color="black"
                            borderRadius="md"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            onFocus={() => {
                                if (searchQuery.trim() !== "" && searchResults.length > 0) {
                                    setIsSearchOpen(true);
                                }
                            }}
                        />
                    </InputGroup>

                    {isSearchOpen && searchResults.length > 0 && (
                        <Box
                            position="absolute"
                            top="100%"
                            left={0}
                            right={0}
                            bg="white"
                            borderRadius="md"
                            boxShadow="lg"
                            border="1px solid"
                            borderColor="gray.200"
                            zIndex={1000}
                            maxH="300px"
                            overflowY="auto"
                            mt={1}
                        >
                            <List spacing={0}>
                                {searchResults.map((result, index) => (
                                    <ListItem key={index}>
                                        <Button
                                            w="100%"
                                            justifyContent="flex-start"
                                            variant="ghost"
                                            size="sm"
                                            px={4}
                                            py={3}
                                            borderRadius={0}
                                            _hover={{ bg: "gray.100" }}
                                            onClick={() => handleSearchResultClick(result.path)}
                                            color="gray.800"
                                        >
                                            {result.label}
                                        </Button>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                </Box>

                <HStack spacing={3}>
                    <IconButton
                        py={2}
                        px={4}
                        icon={<BellIcon />}
                        aria-label="Notifications"
                        variant="ghost"
                        color={colors.primary}
                        _hover={{ bg: colors.accent + '33' }}
                        onClick={handleNotificationClick}
                    />
                    <Tooltip
                        label={`${profileData.name || userName}${profileData.email ? ` (${profileData.email})` : ''}`}
                        placement="bottom"
                        hasArrow
                    >
                        <Box
                            cursor="pointer"
                            onClick={() => navigateTo()}
                            _hover={{
                                transform: 'scale(1.05)'
                            }}
                            transition="all 0.2s"
                        >
                            <ProfilePicture
                                src={profileData.profilePicture}
                                name={profileData.name || userName}
                                size="sm"
                                bgColor={colors.primary}
                                showChangeButton={false}
                                editable={false}
                            />
                        </Box>
                    </Tooltip>

                </HStack>
            </Flex >
        </>
    );
};

export default HeaderNavbar; 