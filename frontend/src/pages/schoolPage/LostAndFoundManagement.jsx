import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    FormControl,
    FormLabel,
    Input,
    Select,
    Textarea,
    VStack,
    HStack,
    Text,
    Badge,
    IconButton,
    Tooltip,
    useToast,
    Flex,
    Heading,
    Card,
    CardBody,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Grid,
    GridItem,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useColorModeValue,
    Divider,
    SimpleGrid,
    Image,
    Stack,
    Tag,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerContent,
    DrawerCloseButton,
    Avatar,
    AvatarGroup,
    Icon,
    useBreakpointValue,
    Center,
    Spinner,
    Image as ChakraImage,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription
} from '@chakra-ui/react';
import {
    FiEdit,
    FiTrash2,
    FiFilter,
    FiEye,
    FiSearch,
    FiMapPin,
    FiCalendar,
    FiUser,
    FiPackage,
    FiCheckCircle,
    FiAlertCircle,
    FiClock,
    FiX,
    FiInfo
} from 'react-icons/fi';
import { useServiceStore } from '../../store/service.js';
import { useAuthStore } from '../../store/auth.js';

export const LostAndFoundManagement = () => {

    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useEditDisclosure();
    const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useViewDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDeleteDisclosure();
    const { isOpen: isMatchOpen, onOpen: onMatchOpen, onClose: onMatchClose } = useDisclosure();
    // Use service store
    const {
        lostItems,
        loading,
        errors,
        fetchLostItemsBySchoolId,
        updateLostItem,
        deleteLostItem,
        matchLostItems
    } = useServiceStore();

    const { currentUser ,initializeAuth, getSchoolId } = useAuthStore();
    console.log("🚀 ~ LostAndFoundManagement ~ currentUser:", currentUser)
    const [filteredItems, setFilteredItems] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [matchedFilter, setMatchedFilter] = useState('');
    const [sortBy, setSortBy] = useState('latest');

    // Status update state
    const [statusUpdateItem, setStatusUpdateItem] = useState(null);
    const [isStatusUpdating, setIsStatusUpdating] = useState(false);

    // Matching state
    const [matchingItem, setMatchingItem] = useState(null);
    const [selectedFoundItem, setSelectedFoundItem] = useState(null);
    const [isMatching, setIsMatching] = useState(false);

    // Matched item modal state
    const [isMatchedItemModalOpen, setIsMatchedItemModalOpen] = useState(false);
    const [selectedMatchedItem, setSelectedMatchedItem] = useState(null);

    // Image preview modal state
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        itemDetails: {
            name: '',
            description: '',
            location: '',
            lostDate: '',
            image: null,
            imageData: null,
            imageType: null
        },
        status: 'reported',
        resolution: {
            status: '',
            notes: ''
        }
    });


    const toast = useToast();
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const cardBg = useColorModeValue('white', 'gray.700');
    const hoverBg = useColorModeValue('gray.50', 'gray.600');
    // Responsive grid columns
    const gridCols = useBreakpointValue({ base: 1, md: 2, lg: 3, xl: 4 });
    const locations = [
        'library', 'cafeteria', 'classroom', 'court', 'parking lot',
        'lobby', 'office', 'gym', 'outdoor_area', 'other'
    ];
    const statuses = ['reported', 'found', 'claimed'];
    // Custom hooks for multiple modals
    function useEditDisclosure() {
        const { isOpen, onOpen, onClose } = useDisclosure();
        return { isOpen, onOpen, onClose };
    }
    function useViewDisclosure() {
        const { isOpen, onOpen, onClose } = useDisclosure();
        return { isOpen, onOpen, onClose };
    }
    function useDeleteDisclosure() {
        const { isOpen, onOpen, onClose } = useDisclosure();
        return { isOpen, onOpen, onClose };
    }

    // Handle opening match modal
    const handleOpenMatchModal = (item) => {
        setMatchingItem(item);
        setSelectedFoundItem(null);
        onMatchOpen();
    };

    // Helper function to get today's date in yyyy-MM-dd format
    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    // Helper function to validate date is not in the future
    const validateDate = (dateString) => {
        if (!dateString) return false;
        const inputDate = new Date(dateString);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        return inputDate <= today;
    };

    // Handle opening matched item modal
    const handleOpenMatchedItemModal = (item) => {
        setSelectedMatchedItem(item);
        setIsMatchedItemModalOpen(true);
    };

    // Handle opening image preview modal
    const handleOpenImageModal = (imageData, imageName) => {
        setSelectedImage({ data: imageData, name: imageName });
        setIsImageModalOpen(true);
    };

    // Handle matching items
    const handleMatchItems = async () => {
        if (!matchingItem || !selectedFoundItem) {
            toast({
                title: 'Error',
                description: 'Please select both items to match',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsMatching(true);
        try {
            const result = await matchLostItems(matchingItem._id, selectedFoundItem._id);
            if (result.success) {
                toast({
                    title: 'Success',
                    description: 'Items successfully matched and status updated to claimed',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                onMatchClose();
                fetchLostItems(); // Refresh the list
            } else {
                toast({
                    title: 'Error',
                    description: result.message || 'Failed to match items',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to match items',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsMatching(false);
        }
    };

    useEffect(() => {
        filterAndSortItems();
    }, [lostItems, searchTerm, statusFilter, locationFilter, matchedFilter, sortBy]);

    const fetchLostItems = async () => {
        try {
            await initializeAuth();

            const result = await fetchLostItemsBySchoolId();
            if (!result.success) {
                toast({
                    title: 'Error',
                    description: result.message || 'Failed to fetch lost items',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                                    // Validate that the data is properly structured
                    if (result.data && Array.isArray(result.data)) {
                        // Filter out any invalid items and ensure proper structure
                        const validItems = result.data.filter(item =>
                            item &&
                            typeof item === 'object' &&
                            item._id &&
                            item.itemDetails &&
                            typeof item.itemDetails === 'object'
                        );
                    }
            }
        } catch (error) {
            console.error('Error loading lost items:', error);
            toast({
                title: 'Error',
                description: 'Failed to load lost items',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        fetchLostItems();
    }, []);

    const filterAndSortItems = () => {
        // Ensure lostItems is an array and filter out any invalid items
        let filtered = Array.isArray(lostItems) ? lostItems.filter(item => item && typeof item === 'object') : [];

        // Apply filters
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item?.itemDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item?.itemDetails?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item?.personId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item?.personId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (statusFilter) {
            filtered = filtered.filter(item => item?.status === statusFilter);
        }
        if (locationFilter) {
            filtered = filtered.filter(item => item?.itemDetails?.location === locationFilter);
        }

        // Apply matched filter
        if (matchedFilter === 'matched') {
            filtered = filtered.filter(item => item?.matchedItem);
        } else if (matchedFilter === 'unmatched') {
            filtered = filtered.filter(item => !item?.matchedItem);
        }
        // Apply sorting
        filtered.sort((a, b) => {
            if (sortBy === 'latest') {
                return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
            } else if (sortBy === 'oldest') {
                return new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0);
            } else if (sortBy === 'status') {
                const statusOrder = { reported: 1, found: 2, claimed: 3 };
                return statusOrder[a?.status] - statusOrder[b?.status];
            }
            return 0;
        });
        setFilteredItems(filtered);
    };


    // Helper function to format date for HTML date input
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    };


    const handleEditItem = (item) => {
        setSelectedItem(item);
        setFormData({
            itemDetails: {
                name: item.itemDetails?.name || '',
                description: item.itemDetails?.description || '',
                location: item.itemDetails?.location || '',
                lostDate: formatDateForInput(item.itemDetails?.lostDate),
                image: null, // Don't store file path
                imageData: item.itemDetails?.imageData || null,
                imageType: item.itemDetails?.imageType || null
            },
            status: item.status || 'reported',
            resolution: {
                status: item.resolution?.status || '',
                notes: item.resolution?.notes || ''
            }
        });

        onEditOpen();
    };
    const handleViewItem = (item) => {
        setSelectedItem(item);
        onViewOpen();
    };
    const handleDeleteItem = (item) => {
        setSelectedItem(item);
        onDeleteOpen();
    };
    const handleSubmit = async (isEdit = false) => {
        setSubmitting(true);
        try {
            let finalFormData = { ...formData };



            // Ensure date is properly formatted for backend
            if (finalFormData.itemDetails.lostDate) {
                finalFormData = {
                    ...finalFormData,
                    itemDetails: {
                        ...finalFormData.itemDetails,
                        lostDate: new Date(finalFormData.itemDetails.lostDate).toISOString()
                    }
                };
            }



            if (isEdit) {
                const updatedItem = {
                    ...finalFormData,
                    schoolId: selectedItem.schoolId._id,
                    personId: selectedItem.personId._id,
                }

                const result = await updateLostItem(selectedItem._id, updatedItem);
                if (result.success) {
                    toast({
                        title: 'Success',
                        description: 'Item updated successfully',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                    });
                    onEditClose();
                } else {
                    throw new Error(result.message || 'Failed to update item');
                }
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to save item',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setSubmitting(false);
        }
    };
    const confirmDelete = async () => {
        setSubmitting(true);
        try {
            const result = await deleteLostItem(selectedItem.id);
            if (result.success) {
                toast({
                    title: 'Success',
                    description: 'Item deleted successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                onDeleteClose();
            } else {
                throw new Error(result.message || 'Failed to delete item');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete item',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setSubmitting(false);
        }
    };
    const getStatusColor = (status) => {
        const colors = {
            reported: 'red',
            found: 'yellow',
            claimed: 'green'
        };
        return colors[status] || 'gray';
    };
    const getStatusIcon = (status) => {
        const icons = {
            reported: FiAlertCircle,
            found: FiClock,
            claimed: FiCheckCircle
        };
        return icons[status] || FiPackage;
    };
    const getStatusText = (status) => {
        const texts = {
            reported: 'Reported',
            found: 'Found',
            claimed: 'Claimed'
        };
        return texts[status] || status;
    };

    // Status update functions
    const handleStatusUpdate = async (item, newStatus) => {
        if (!item || !newStatus) return;

        setIsStatusUpdating(true);
        try {
            const schoolId = await getSchoolId();

            // Only send the necessary fields for update, don't spread the entire item
            const updates = {
                ...item,
                schoolId: schoolId,
                personId: item.personId._id,
                status: newStatus,
                resolution: {
                    status: newStatus,
                    updatedAt: new Date().toISOString()
                }
            };

            const res = await updateLostItem(item._id, updates);
            if (res.success) {
                toast({
                    title: "Status Updated",
                    description: `Item status changed to ${getStatusText(newStatus)}`,
                    status: "success",
                    duration: 2000,
                    isClosable: true
                });
                // Refresh the data to get the updated structure
                await fetchLostItemsBySchoolId();
            } else {
                toast({
                    title: "Unable to update status",
                    description: res.message || "Failed to update status",
                    status: "error",
                    duration: 2000,
                    isClosable: true
                });
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast({
                title: "Error",
                description: "Failed to update status",
                status: "error",
                duration: 3000,
                isClosable: true
            });
        } finally {
            setIsStatusUpdating(false);
        }
    };

    // StatusBadge component
    const StatusBadge = ({ item, onStatusChange }) => {
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);
        const dropdownRef = useRef();

        // Close dropdown when clicking outside
        useEffect(() => {
            const handleClickOutside = (event) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setIsDropdownOpen(false);
                }
            };

            if (isDropdownOpen) {
                document.addEventListener('mousedown', handleClickOutside);
            }

            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, [isDropdownOpen]);

        const getStatusColor = (status) => {
            const colors = {
                reported: 'red',
                found: 'yellow',
                claimed: 'green'
            };
            return colors[status] || 'gray';
        };

        const getStatusIcon = (status) => {
            const icons = {
                reported: FiAlertCircle,
                found: FiClock,
                claimed: FiCheckCircle
            };
            return icons[status] || FiPackage;
        };

        return (
            <Box position="absolute" top="-15px" right="-15px">
                <Tooltip
                    label={isStatusUpdating ? "Updating status..." : "Click to change status"}
                    placement="top"
                    hasArrow
                >
                    <Badge
                        colorScheme={getStatusColor(item.status)}
                        variant="solid"
                        size="sm"
                        px={2}
                        py={1}
                        borderRadius="full"
                        fontSize="sm"
                        fontWeight="bold"
                        display="flex"
                        alignItems="center"
                        gap={1}
                        boxShadow="md"
                        textShadow="0 1px 2px rgba(0,0,0,0.3)"
                        cursor={isStatusUpdating ? "not-allowed" : "pointer"}
                        _hover={{ transform: isStatusUpdating ? "none" : "scale(1.05)" }}
                        transition="all 0.2s"
                        userSelect={"none"}
                        zIndex={10}
                        w={"fit-content"}
                        onClick={() => !isStatusUpdating && setIsDropdownOpen(!isDropdownOpen)}
                        opacity={isStatusUpdating ? 0.7 : 1}
                    >
                        {isStatusUpdating ? (
                            <Spinner size="xs" />
                        ) : (
                            <Icon as={getStatusIcon(item.status)} size="12px" />
                        )}
                        {isStatusUpdating ? "Updating..." : getStatusText(item.status)}
                    </Badge>
                </Tooltip>

                {isDropdownOpen && (
                    <Box
                        ref={dropdownRef}
                        pos="absolute"
                        left="-100px"
                        top="30px"
                        w="fit-content"
                        zIndex={99999}
                        bg="white"
                        boxShadow="xl"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        p={1}
                        minW="120px"
                    >
                        <VStack spacing={1} align="stretch">
                            <Box
                                p={2}
                                cursor={isStatusUpdating ? "not-allowed" : "pointer"}
                                borderRadius="sm"
                                _hover={{ bg: isStatusUpdating ? "gray.100" : "red.100" }}
                                onClick={() => {
                                    if (!isStatusUpdating) {
                                        handleStatusUpdate(item, "reported");
                                        setIsDropdownOpen(false);
                                    }
                                }}
                                display="flex"
                                alignItems="center"
                                gap={2}
                                opacity={isStatusUpdating ? 0.6 : 1}
                            >
                                <Icon as={FiAlertCircle} color="red.600" boxSize={4} />
                                <Text color="red.600" fontSize="sm" fontWeight="medium">
                                    Reported
                                </Text>
                            </Box>

                            <Box
                                p={2}
                                cursor={isStatusUpdating ? "not-allowed" : "pointer"}
                                borderRadius="sm"
                                _hover={{ bg: isStatusUpdating ? "gray.100" : "yellow.100" }}
                                onClick={() => {
                                    if (!isStatusUpdating) {
                                        handleStatusUpdate(item, "found");
                                        setIsDropdownOpen(false);
                                    }
                                }}
                                display="flex"
                                alignItems="center"
                                gap={2}
                                opacity={isStatusUpdating ? 0.6 : 1}
                            >
                                <Icon as={FiClock} color="yellow.600" boxSize={4} />
                                <Text color="yellow.600" fontSize="sm" fontWeight="medium">
                                    Found
                                </Text>
                            </Box>

                            <Box
                                p={2}
                                cursor={isStatusUpdating ? "not-allowed" : "pointer"}
                                borderRadius="sm"
                                _hover={{ bg: isStatusUpdating ? "gray.100" : "green.100" }}
                                onClick={() => {
                                    if (!isStatusUpdating) {
                                        handleStatusUpdate(item, "claimed");
                                        setIsDropdownOpen(false);
                                    }
                                }}
                                display="flex"
                                alignItems="center"
                                gap={2}
                                opacity={isStatusUpdating ? 0.6 : 1}
                            >
                                <Icon as={FiCheckCircle} color="green.600" boxSize={4} />
                                <Text color="green.600" fontSize="sm" fontWeight="medium">
                                    Claimed
                                </Text>
                            </Box>
                        </VStack>
                    </Box>
                )}
            </Box>
        );
    };
    const getLocationIcon = (location) => {
        return FiMapPin;
    };
    const stats = {
        total: lostItems.length,
        reported: lostItems.filter(item => item.status === 'reported').length,
        found: lostItems.filter(item => item.status === 'found').length,
        claimed: lostItems.filter(item => item.status === 'claimed').length
    };
    const truncateText = (text, maxLength = 80) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };




    return (
        <Box p={6}>
            <Flex justify="space-between" align="center" mb={6}>
                <Heading size="lg" color="blue.600">
                    Lost & Found Management
                </Heading>
                <HStack spacing={3}>
                    <Button
                        variant="outline"
                        onClick={fetchLostItems}
                        isLoading={loading.lostItems}
                        loadingText="Refreshing..."
                        size="md"
                    >
                        Refresh
                    </Button>
                </HStack>
            </Flex>
            {/* Statistics Cards */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={6}>
                <Card bg={cardBg} shadow="sm" border="1px" borderColor={borderColor}>
                    <CardBody>
                        <Stat>
                            <StatLabel color="gray.600">Total Items</StatLabel>
                            <StatNumber fontSize="2xl" color="gray.800">{stats.total}</StatNumber>
                            <StatHelpText color="gray.500">All reported items</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
                <Card bg={cardBg} shadow="sm" border="1px" borderColor={borderColor}>
                    <CardBody>
                        <Stat>
                            <StatLabel color="gray.600">Reported</StatLabel>
                            <StatNumber fontSize="2xl" color="red.500">{stats.reported}</StatNumber>
                            <StatHelpText color="gray.500">New reports</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
                <Card bg={cardBg} shadow="sm" border="1px" borderColor={borderColor}>
                    <CardBody>
                        <Stat>
                            <StatLabel color="gray.600">Found</StatLabel>
                            <StatNumber fontSize="2xl" color="yellow.500">{stats.found}</StatNumber>
                            <StatHelpText color="gray.500">Items recovered</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
                <Card bg={cardBg} shadow="sm" border="1px" borderColor={borderColor}>
                    <CardBody>
                        <Stat>
                            <StatLabel color="gray.600">Claimed</StatLabel>
                            <StatNumber fontSize="2xl" color="green.500">{stats.claimed}</StatNumber>
                            <StatHelpText color="gray.500">Returned to owners</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
            </SimpleGrid>
            {/* Filters & Search */}
            <Card mb={6} bg={cardBg} shadow="sm" border="1px" borderColor={borderColor}>
                <CardBody>
                    <VStack spacing={4} align="stretch">
                        {/* Search Bar */}
                        <FormControl>
                            <FormLabel>Search Items</FormLabel>
                            <HStack>
                                <Icon as={FiSearch} color="gray.400" />
                                <Input
                                    placeholder="Search by item name, description, or owner..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    size="md"
                                />
                            </HStack>
                        </FormControl>
                        {/* Filters Row */}
                        <SimpleGrid columns={{ base: 1, lg: 5 }} spacing={4}>
                            <FormControl>
                                <FormLabel>Status</FormLabel>
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    placeholder="All Statuses"
                                    size="md"
                                >
                                    {statuses.map(status => (
                                        <option key={status} value={status}>
                                            {getStatusText(status)}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Location</FormLabel>
                                <Select
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                    placeholder="All Locations"
                                    size="md"
                                >
                                    {locations.map(location => (
                                        <option key={location} value={location}>
                                            {location}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Matched Status</FormLabel>
                                <Select
                                    value={matchedFilter}
                                    onChange={(e) => setMatchedFilter(e.target.value)}
                                    placeholder="All Items"
                                    size="md"
                                >
                                    <option value="">All Items</option>
                                    <option value="matched">Matched Items</option>
                                    <option value="unmatched">Unmatched Items</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Sort By</FormLabel>
                                <Select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    size="md"
                                >
                                    <option value="latest">Latest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="status">By Status</option>
                                </Select>
                            </FormControl>
                            <Button
                                leftIcon={<FiFilter />}
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('');
                                    setLocationFilter('');
                                    setMatchedFilter('');
                                    setSortBy('latest');
                                }}
                                size="md"
                                alignSelf="end"
                            >
                                Clear Filters
                            </Button>
                        </SimpleGrid>
                    </VStack>
                </CardBody>
            </Card>

            {/* Separated Items Display */}
            <VStack spacing={8} align="stretch">
                {/* Reported Items Section */}
                <Box>
                    <HStack justify="space-between" align="center" mb={4}>
                        <Text fontSize="xl" fontWeight="bold" color="gray.800">
                            Reported Items
                        </Text>
                        <Badge colorScheme="orange" variant="subtle">
                            {filteredItems.filter(item => item.status === 'reported').length} items
                        </Badge>
                    </HStack>

                    {loading.lostItems ? (
                        <Card bg={cardBg} shadow="sm" border="1px" borderColor={borderColor}>
                            <CardBody>
                                <Box textAlign="center" py={12}>
                                    <Text color="gray.500" fontSize="lg">Loading reported items...</Text>
                                </Box>
                            </CardBody>
                        </Card>
                    ) : (
                        <>
                            {filteredItems.filter(item => item.status === 'reported').length === 0 ? (
                                <Card bg={cardBg} shadow="sm" border="1px" borderColor={borderColor}>
                                    <CardBody>
                                        <Box textAlign="center" py={12}>
                                            <Icon as={FiPackage} size="48px" color="gray.300" mb={4} />
                                            <Text color="gray.500" fontSize="lg">No reported items found</Text>
                                            <Text color="gray.400" fontSize="md">Items reported as lost will appear here</Text>
                                        </Box>
                                    </CardBody>
                                </Card>
                            ) : (
                                <SimpleGrid columns={gridCols} spacing={6}>
                                    {filteredItems
                                        .filter(item => item.status === 'reported')
                                        .map((item, idx) => (
                                            <Card
                                                key={`reported-${idx}`}
                                                bg={cardBg}
                                                shadow="sm"
                                                border="1px"
                                                borderColor={borderColor}
                                                cursor="pointer"
                                                transition="all 0.2s"
                                                hover={{
                                                    shadow: 'md',
                                                    transform: 'translateY(-2px)',
                                                    borderColor: 'orange.300'
                                                }}
                                                onClick={() => handleViewItem(item)}
                                            >
                                                <CardBody p={4}>
                                                    <VStack spacing={2} align="stretch">
                                                        <StatusBadge item={item} />
                                                    </VStack>

                                                    {/* Item Image */}
                                                    <Box mb={3} borderRadius="md" overflow="hidden">
                                                        {item.itemDetails?.imageData ? (
                                                            <ChakraImage
                                                                src={item.itemDetails.imageData}
                                                                alt={item.itemDetails.name}
                                                                width="100%"
                                                                height="120px"
                                                                objectFit="cover"
                                                                cursor="pointer"
                                                                onClick={() => handleOpenImageModal(item.itemDetails.imageData, item.itemDetails.name)}
                                                                fallback={
                                                                    <Center height="120px" bg="gray.100">
                                                                        <Icon as={FiPackage} size="24px" color="gray.400" />
                                                                    </Center>
                                                                }
                                                            />
                                                        ) : (
                                                            <Center height="120px" bg="gray.100">
                                                                <Icon as={FiPackage} size="32px" color="gray.400" />
                                                            </Center>
                                                        )}
                                                    </Box>

                                                    {/* Item Name */}
                                                    <HStack justify="space-between" align="center" mb={2}>
                                                        <Text
                                                            fontWeight="bold"
                                                            fontSize="lg"
                                                            color="gray.800"
                                                            mb={2}
                                                            noOfLines={1}
                                                        >
                                                            {item.itemDetails?.name || 'Unnamed Item'}
                                                        </Text>
                                                        <HStack spacing={1}>
                                                            <Tooltip label="Match with Found Item">
                                                                <IconButton
                                                                    icon={<FiCheckCircle />}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    colorScheme="green"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleOpenMatchModal(item);
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                            <Tooltip label="Edit Item">
                                                                <IconButton
                                                                    icon={<FiEdit />}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditItem(item);
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        </HStack>
                                                    </HStack>

                                                    {/* Description */}
                                                    <Text
                                                        color="gray.600"
                                                        fontSize="sm"
                                                        mb={3}
                                                        noOfLines={2}
                                                    >
                                                        {truncateText(item.itemDetails?.description || 'No description available')}
                                                    </Text>

                                                    {/* Location */}
                                                    <HStack spacing={2} mb={2}>
                                                        <Icon as={getLocationIcon(item.itemDetails?.location)} color="gray.400" size="14px" />
                                                        <Text
                                                            color="gray.600"
                                                            fontSize="sm"
                                                            textTransform="capitalize"
                                                        >
                                                            {item.itemDetails?.location?.replace('', ' ') || 'Unknown Location'}
                                                        </Text>
                                                    </HStack>

                                                    {/* Date */}
                                                    <HStack spacing={2} mb={3}>
                                                        <Icon as={FiCalendar} color="gray.400" size="14px" />
                                                        <Text color="gray.500" fontSize="xs">
                                                            {item.itemDetails?.lostDate ?
                                                                new Date(item.itemDetails.lostDate).toLocaleDateString() :
                                                                'Date unknown'
                                                            }
                                                        </Text>
                                                    </HStack>

                                                    {/* Owner Info */}
                                                    {item.personId && item.personId.userId && (
                                                        <HStack spacing={2} mb={2}>
                                                            <Icon as={FiUser} color="gray.400" size="14px" />
                                                            <Text color="gray.600" fontSize="xs">
                                                                {item.personId.userId.name || 'Unknown Owner'}
                                                            </Text>
                                                        </HStack>
                                                    )}
                                                </CardBody>
                                            </Card>
                                        ))}
                                </SimpleGrid>
                            )}
                        </>
                    )}
                </Box>

                {/* Found Items Section */}
                <Box>
                    <HStack justify="space-between" align="center" mb={4}>
                        <Text fontSize="xl" fontWeight="bold" color="gray.800">
                            Found Items
                        </Text>
                        <Badge colorScheme="green" variant="subtle">
                            {filteredItems.filter(item => item.status === 'found').length} items
                        </Badge>
                    </HStack>

                    {loading.lostItems ? (
                        <Card bg={cardBg} shadow="sm" border="1px" borderColor={borderColor}>
                            <CardBody>
                                <Box textAlign="center" py={12}>
                                    <Text color="gray.500" fontSize="lg">Loading found items...</Text>
                                </Box>
                            </CardBody>
                        </Card>
                    ) : (
                        <>
                            {filteredItems.filter(item => item.status === 'found').length === 0 ? (
                                <Card bg={cardBg} shadow="sm" border="1px" borderColor={borderColor}>
                                    <CardBody>
                                        <Box textAlign="center" py={12}>
                                            <Icon as={FiPackage} size="48px" color="gray.300" mb={4} />
                                            <Text color="gray.500" fontSize="lg">No found items</Text>
                                            <Text color="gray.400" fontSize="md">Items found and turned in will appear here</Text>
                                        </Box>
                                    </CardBody>
                                </Card>
                            ) : (
                                <SimpleGrid columns={gridCols} spacing={6}>
                                    {filteredItems
                                        .filter(item => item.status === 'found')
                                        .map((item, idx) => (
                                            <Card
                                                key={`found-${idx}`}
                                                bg={cardBg}
                                                shadow="sm"
                                                border="1px"
                                                borderColor={borderColor}
                                                cursor="pointer"
                                                transition="all 0.2s"
                                                hover={{
                                                    shadow: 'md',
                                                    transform: 'translateY(-2px)',
                                                    borderColor: 'green.300'
                                                }}
                                                onClick={() => handleViewItem(item)}
                                            >
                                                <CardBody p={4}>
                                                    <VStack spacing={2} align="stretch">
                                                        <StatusBadge item={item} />
                                                        {item.matchedItem && (
                                                            <Tooltip label="Click to view matched item details" placement="top">
                                                                <Button
                                                                    size="sm"
                                                                    colorScheme="green"
                                                                    variant="solid"
                                                                    alignSelf="flex-start"
                                                                    position="absolute"
                                                                    top="-5px"
                                                                    left="-5px"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        // Find the matched item from the lostItems array
                                                                        const matchedItem = lostItems.find(lostItem => lostItem._id === item.matchedItem._id);
                                                                        if (matchedItem) {
                                                                            handleOpenMatchedItemModal(matchedItem);
                                                                        }
                                                                    }}
                                                                    _hover={{ opacity: 0.8 }}
                                                                    px={2}
                                                                    py={1}
                                                                    fontSize="xs"
                                                                    fontWeight="medium"
                                                                >
                                                                    Matched
                                                                </Button>
                                                            </Tooltip>
                                                        )}
                                                    </VStack>

                                                    {/* Item Image */}
                                                    <Box mb={3} borderRadius="md" overflow="hidden">
                                                        {item.itemDetails?.imageData ? (
                                                            <ChakraImage
                                                                src={item.itemDetails.imageData}
                                                                alt={item.itemDetails.name}
                                                                width="100%"
                                                                height="120px"
                                                                objectFit="cover"
                                                                fallback={
                                                                    <Center height="120px" bg="gray.100">
                                                                        <Icon as={FiPackage} size="24px" color="gray.400" />
                                                                    </Center>
                                                                }
                                                            />
                                                        ) : (
                                                            <Center height="120px" bg="gray.100">
                                                                <Icon as={FiPackage} size="32px" color="gray.400" />
                                                            </Center>
                                                        )}
                                                    </Box>

                                                    {/* Item Name */}
                                                    <HStack justify="space-between" align="center" mb={2}>
                                                        <Text
                                                            fontWeight="bold"
                                                            fontSize="lg"
                                                            color="gray.800"
                                                            mb={2}
                                                            noOfLines={1}
                                                        >
                                                            {item.itemDetails?.name || 'Unnamed Item'}
                                                        </Text>
                                                        <HStack spacing={1}>
                                                            <Tooltip label="Edit Item">
                                                                <IconButton
                                                                    icon={<FiEdit />}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditItem(item);
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        </HStack>
                                                    </HStack>

                                                    {/* Description */}
                                                    <Text
                                                        color="gray.600"
                                                        fontSize="sm"
                                                        mb={3}
                                                        noOfLines={2}
                                                    >
                                                        {truncateText(item.itemDetails?.description || 'No description available')}
                                                    </Text>

                                                    {/* Location */}
                                                    <HStack spacing={2} mb={2}>
                                                        <Icon as={getLocationIcon(item.itemDetails?.location)} color="gray.400" size="14px" />
                                                        <Text
                                                            color="gray.600"
                                                            fontSize="sm"
                                                            textTransform="capitalize"
                                                        >
                                                            {item.itemDetails?.location?.replace('', ' ') || 'Unknown Location'}
                                                        </Text>
                                                    </HStack>

                                                    {/* Date */}
                                                    <HStack spacing={2} mb={3}>
                                                        <Icon as={FiCalendar} color="gray.400" size="14px" />
                                                        <Text color="gray.500" fontSize="xs">
                                                            {item.itemDetails?.lostDate ?
                                                                new Date(item.itemDetails.lostDate).toLocaleDateString() :
                                                                'Date unknown'
                                                            }
                                                        </Text>
                                                    </HStack>

                                                    {/* Owner Info */}
                                                    {item.personId && item.personId.userId && (
                                                        <HStack spacing={2} mb={2}>
                                                            <Icon as={FiUser} color="gray.400" size="14px" />
                                                            <Text color="gray.600" fontSize="xs">
                                                                {item.personId.userId.name || 'Unknown Owner'}
                                                            </Text>
                                                        </HStack>
                                                    )}
                                                </CardBody>
                                            </Card>
                                        ))}
                                </SimpleGrid>
                            )}
                        </>
                    )}
                </Box>

                {/* Claimed Items Section */}
                <Box>
                    <HStack justify="space-between" align="center" mb={4}>
                        <Text fontSize="xl" fontWeight="bold" color="gray.800">
                            Claimed Items
                        </Text>
                        <Badge colorScheme="blue" variant="subtle">
                            {filteredItems.filter(item => item.status === 'claimed').length} items
                        </Badge>
                    </HStack>

                    {loading.lostItems ? (
                        <Card bg={cardBg} shadow="sm" border="1px" borderColor={borderColor}>
                            <CardBody>
                                <Box textAlign="center" py={12}>
                                    <Text color="gray.500" fontSize="lg">Loading claimed items...</Text>
                                </Box>
                            </CardBody>
                        </Card>
                    ) : (
                        <>
                            {filteredItems.filter(item => item.status === 'claimed').length === 0 ? (
                                <Card bg={cardBg} shadow="sm" border="1px" borderColor={borderColor}>
                                    <CardBody>
                                        <Box textAlign="center" py={12}>
                                            <Icon as={FiPackage} size="48px" color="gray.300" mb={4} />
                                            <Text color="gray.500" fontSize="lg">No claimed items</Text>
                                            <Text color="gray.400" fontSize="md">Items that have been claimed will appear here</Text>
                                        </Box>
                                    </CardBody>
                                </Card>
                            ) : (
                                <SimpleGrid columns={gridCols} spacing={6}>
                                    {filteredItems
                                        .filter(item => item.status === 'claimed')
                                        .map((item, idx) => (
                                            <Card key={`claimed-${idx}`} bg={cardBg} shadow="sm" border="1px" borderColor={borderColor} cursor="pointer" transition="all 0.2s" hover={{
                                                shadow: 'md',
                                                transform: 'translateY(-2px)',
                                                borderColor: 'blue.300'
                                            }} onClick={() => handleViewItem(item)}>
                                                <CardBody p={4}>
                                                    <VStack spacing={2} align="stretch">
                                                        <StatusBadge item={item} />
                                                        {item.matchedItem && (
                                                            <Tooltip label="Click to view matched item details" placement="top">
                                                                <Button
                                                                    size="sm"
                                                                    colorScheme="green"
                                                                    variant="solid"
                                                                    alignSelf="flex-start"
                                                                    position="absolute"
                                                                    top="-5px"
                                                                    left="-5px"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        // Find the matched item from the lostItems array
                                                                        const matchedItem = lostItems.find(lostItem => lostItem._id === item.matchedItem._id);
                                                                        if (matchedItem) {
                                                                            handleOpenMatchedItemModal(matchedItem);
                                                                        }
                                                                    }}
                                                                    _hover={{ opacity: 0.8 }}
                                                                    px={2}
                                                                    py={1}
                                                                    fontSize="xs"
                                                                    fontWeight="medium"
                                                                >
                                                                    Matched
                                                                </Button>
                                                            </Tooltip>
                                                        )}
                                                    </VStack>

                                                    {/* Item Image */}
                                                    <Box mb={3} borderRadius="md" overflow="hidden">
                                                        {item.itemDetails?.imageData ? (
                                                            <ChakraImage
                                                                src={item.itemDetails.imageData}
                                                                alt={item.itemDetails.name}
                                                                width="100%"
                                                                height="120px"
                                                                objectFit="cover"
                                                                fallback={
                                                                    <Center height="120px" bg="gray.100">
                                                                        <Icon as={FiPackage} size="24px" color="gray.400" />
                                                                    </Center>
                                                                }
                                                            />
                                                        ) : (
                                                            <Center height="120px" bg="gray.100">
                                                                <Icon as={FiPackage} size="32px" color="gray.400" />
                                                            </Center>
                                                        )}
                                                    </Box>

                                                    {/* Item Name */}
                                                    <HStack justify="space-between" align="center" mb={2}>
                                                        <Text fontWeight="bold" fontSize="lg" color="gray.800" mb={2} noOfLines={1}>
                                                            {item.itemDetails?.name || 'Unnamed Item'}
                                                        </Text>
                                                        <HStack spacing={1}>
                                                            <Tooltip label="Edit Item">
                                                                <IconButton
                                                                    icon={<FiEdit />}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditItem(item);
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        </HStack>
                                                    </HStack>

                                                    {/* Description */}
                                                    <Text color="gray.600" fontSize="sm" mb={3} noOfLines={2}>
                                                        {truncateText(item.itemDetails?.description || 'No description available')}
                                                    </Text>

                                                    {/* Location */}
                                                    <HStack spacing={2} mb={2}>
                                                        <Icon as={getLocationIcon(item.itemDetails?.location)} color="gray.400" size="14px" />
                                                        <Text color="gray.600" fontSize="sm" textTransform="capitalize">
                                                            {item.itemDetails?.location?.replace('', ' ') || 'Unknown Location'}
                                                        </Text>
                                                    </HStack>

                                                    {/* Date */}
                                                    <HStack spacing={2} mb={3}>
                                                        <Icon as={FiCalendar} color="gray.400" size="14px" />
                                                        <Text color="gray.500" fontSize="xs">
                                                            {item.itemDetails?.lostDate ?
                                                                new Date(item.itemDetails.lostDate).toLocaleDateString() :
                                                                'Date unknown'
                                                            }
                                                        </Text>
                                                    </HStack>

                                                    {/* Owner Info */}
                                                    {item.personId && item.personId.userId && (
                                                        <HStack spacing={2} mb={2}>
                                                            <Icon as={FiUser} color="gray.400" size="14px" />
                                                            <Text color="gray.600" fontSize="xs">
                                                                {item.personId.userId.name || 'Unknown Owner'}
                                                            </Text>
                                                        </HStack>
                                                    )}
                                                </CardBody>
                                            </Card>
                                        ))}
                                </SimpleGrid>
                            )}
                        </>
                    )}
                </Box>
            </VStack>

            {/* Edit Item Modal */}
            <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Lost Item</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Item Name</FormLabel>
                                <Input
                                    value={formData.itemDetails.name}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        itemDetails: { ...formData.itemDetails, name: e.target.value }
                                    })}
                                    placeholder="Enter item name"
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Description</FormLabel>
                                <Textarea
                                    value={formData.itemDetails.description}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        itemDetails: { ...formData.itemDetails, description: e.target.value }
                                    })}
                                    placeholder="Describe the item"
                                    rows={3}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Location</FormLabel>
                                <Select
                                    value={formData.itemDetails.location}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        itemDetails: { ...formData.itemDetails, location: e.target.value }
                                    })}
                                    placeholder="Select location"
                                >
                                    {locations.map(location => (
                                        <option key={location} value={location}>
                                            {location}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Lost Date</FormLabel>
                                <Input
                                    type="date"
                                    value={formData.itemDetails.lostDate}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        itemDetails: { ...formData.itemDetails, lostDate: e.target.value }
                                    })}
                                    max={getTodayDate()}
                                    isInvalid={formData.itemDetails.lostDate && !validateDate(formData.itemDetails.lostDate)}
                                />
                                {formData.itemDetails.lostDate && !validateDate(formData.itemDetails.lostDate) && (
                                    <Text color="red.500" fontSize="sm" mt={1}>
                                        Lost date cannot be in the future
                                    </Text>
                                )}
                            </FormControl>



                            <FormControl>
                                <FormLabel>Status</FormLabel>
                                <Select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    {statuses.map(status => (
                                        <option key={status} value={status}>
                                            {getStatusText(status)}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                            <Divider />
                            <FormControl>
                                <FormLabel>Resolution Notes</FormLabel>
                                <Textarea
                                    value={formData.resolution.notes}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        resolution: { ...formData.resolution, notes: e.target.value }
                                    })}
                                    placeholder="Add resolution notes"
                                    rows={3}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onEditClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={() => handleSubmit(true)}
                            isLoading={submitting}
                            loadingText="Updating..."
                        >
                            Update Item
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Modal */}
            <AlertDialog isOpen={isDeleteOpen} onClose={onDeleteClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Item
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure you want to delete "{selectedItem?.itemDetails?.name || 'this item'}"? This action cannot be undone.
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button onClick={onDeleteClose}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={confirmDelete}
                                ml={3}
                                isLoading={submitting}
                                loadingText="Deleting..."
                            >
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            {/* Matching Modal */}
            <Modal isOpen={isMatchOpen} onClose={onMatchClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Match Lost Item</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            {/* Reported Item Display */}
                            <Box>
                                <Text fontWeight="bold" mb={2}>Reported Item:</Text>
                                <Card>
                                    <CardBody>
                                        <Text><strong>Name:</strong> {matchingItem?.itemDetails?.name}</Text>
                                        <Text><strong>Description:</strong> {matchingItem?.itemDetails?.description}</Text>
                                        <Text><strong>Location:</strong> {matchingItem?.itemDetails?.location}</Text>
                                        <Text><strong>Date:</strong> {matchingItem?.itemDetails?.lostDate ? new Date(matchingItem.itemDetails.lostDate).toLocaleDateString() : 'Unknown'}</Text>
                                    </CardBody>
                                </Card>
                            </Box>

                            {/* Found Items Selection */}
                            <Box>
                                <Text fontWeight="bold" mb={2}>Select Found Item to Match:</Text>
                                <Select
                                    placeholder="Choose a found item"
                                    value={selectedFoundItem?._id || ''}
                                    onChange={(e) => {
                                        const found = lostItems.find(item => item._id === e.target.value);
                                        setSelectedFoundItem(found);
                                    }}
                                >
                                    {lostItems
                                        .filter(item => item.status === 'found')
                                        .map(item => (
                                            <option key={item._id} value={item._id}>
                                                {item.itemDetails?.name} - {item.itemDetails?.location} ({new Date(item.itemDetails?.lostDate).toLocaleDateString()})
                                            </option>
                                        ))
                                    }
                                </Select>
                            </Box>

                            {/* Selected Found Item Display */}
                            {selectedFoundItem && (
                                <Box>
                                    <Text fontWeight="bold" mb={2}>Selected Found Item:</Text>
                                    <Card>
                                        <CardBody>
                                            <Text><strong>Name:</strong> {selectedFoundItem.itemDetails?.name}</Text>
                                            <Text><strong>Description:</strong> {selectedFoundItem.itemDetails?.description}</Text>
                                            <Text><strong>Location:</strong> {selectedFoundItem.itemDetails?.location}</Text>
                                            <Text><strong>Date:</strong> {selectedFoundItem.itemDetails?.lostDate ? new Date(selectedFoundItem.itemDetails.lostDate).toLocaleDateString() : 'Unknown'}</Text>
                                        </CardBody>
                                    </Card>
                                </Box>
                            )}

                            <Alert status="info">
                                <AlertIcon />
                                <Box>
                                    <AlertTitle>Matching Information</AlertTitle>
                                    <AlertDescription>
                                        When you match these items, both will be marked as "claimed" and linked together.
                                        This action cannot be undone.
                                    </AlertDescription>
                                </Box>
                            </Alert>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onMatchClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="green"
                            onClick={handleMatchItems}
                            isLoading={isMatching}
                            loadingText="Matching..."
                            isDisabled={!selectedFoundItem}
                        >
                            Match Items
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

                         {/* Matched Item Modal */}
             <Modal isOpen={isMatchedItemModalOpen} onClose={() => setIsMatchedItemModalOpen(false)} size="xl">
                 <ModalOverlay />
                 <ModalContent>
                     <ModalHeader>Matched Item Details</ModalHeader>
                     <ModalCloseButton />
                     <ModalBody>
                         {selectedMatchedItem && (
                             <VStack spacing={6} align="stretch">
                                 {/* Item Image */}
                                 <Box textAlign="center">
                                     {selectedMatchedItem.itemDetails?.imageData ? (
                                         <ChakraImage
                                             src={selectedMatchedItem.itemDetails.imageData}
                                             alt={selectedMatchedItem.itemDetails.name}
                                             maxW="300px"
                                             maxH="300px"
                                             objectFit="cover"
                                             borderRadius="md"
                                             cursor="pointer"
                                             onClick={() => handleOpenImageModal(selectedMatchedItem.itemDetails.imageData, selectedMatchedItem.itemDetails.name)}
                                             fallback={
                                                 <Center height="200px" bg="gray.100" borderRadius="md">
                                                     <Icon as={FiPackage} size="48px" color="gray.400" />
                                                 </Center>
                                             }
                                         />
                                     ) : (
                                         <Center height="200px" bg="gray.100" borderRadius="md">
                                             <Icon as={FiPackage} size="48px" color="gray.400" />
                                         </Center>
                                     )}
                                 </Box>

                                {/* Item Information */}
                                <Card>
                                    <CardBody>
                                        <VStack spacing={4} align="stretch">
                                            <Box>
                                                <Text fontWeight="bold" color="gray.700" fontSize="lg">
                                                    {selectedMatchedItem.itemDetails?.name || 'Unnamed Item'}
                                                </Text>
                                                <Badge colorScheme={selectedMatchedItem.status === 'reported' ? 'orange' : selectedMatchedItem.status === 'found' ? 'green' : 'blue'} variant="subtle">
                                                    {selectedMatchedItem.status}
                                                </Badge>
                                            </Box>

                                            <Box>
                                                <Text fontWeight="semibold" color="gray.600" mb={1}>Description:</Text>
                                                <Text color="gray.700">
                                                    {selectedMatchedItem.itemDetails?.description || 'No description available'}
                                                </Text>
                                            </Box>

                                            <HStack spacing={6}>
                                                <Box>
                                                    <Text fontWeight="semibold" color="gray.600" mb={1}>Location:</Text>
                                                    <HStack spacing={2}>
                                                        <Icon as={getLocationIcon(selectedMatchedItem.itemDetails?.location)} color="gray.400" size="16px" />
                                                        <Text color="gray.700" textTransform="capitalize">
                                                            {selectedMatchedItem.itemDetails?.location?.replace('', ' ') || 'Unknown Location'}
                                                        </Text>
                                                    </HStack>
                                                </Box>

                                                <Box>
                                                    <Text fontWeight="semibold" color="gray.600" mb={1}>Date:</Text>
                                                    <HStack spacing={2}>
                                                        <Icon as={FiCalendar} color="gray.400" size="16px" />
                                                        <Text color="gray.700">
                                                            {selectedMatchedItem.itemDetails?.lostDate ?
                                                                new Date(selectedMatchedItem.itemDetails.lostDate).toLocaleDateString() :
                                                                'Date unknown'
                                                            }
                                                        </Text>
                                                    </HStack>
                                                </Box>
                                            </HStack>

                                            {/* Owner Information */}
                                            {selectedMatchedItem.personId && (
                                                <Box>
                                                    <Text fontWeight="semibold" color="gray.600" mb={1}>Owner:</Text>
                                                    <HStack spacing={2}>
                                                        <Icon as={FiPackage} color="gray.400" size="16px" />
                                                        <Text color="gray.700">
                                                            {selectedMatchedItem.personId.userId?.name || 'Unknown Owner'}
                                                        </Text>
                                                    </HStack>
                                                </Box>
                                            )}

                                            {/* Resolution Information */}
                                            {selectedMatchedItem.resolution && (
                                                <Box>
                                                    <Text fontWeight="semibold" color="gray.600" mb={1}>Resolution:</Text>
                                                    <VStack spacing={2} align="stretch">
                                                        <HStack spacing={2}>
                                                            <Badge colorScheme="purple" variant="subtle">
                                                                {selectedMatchedItem.resolution.status}
                                                            </Badge>
                                                            {selectedMatchedItem.resolution.date && (
                                                                <Text color="gray.600" fontSize="sm">
                                                                    {new Date(selectedMatchedItem.resolution.date).toLocaleDateString()}
                                                                </Text>
                                                            )}
                                                        </HStack>
                                                        {selectedMatchedItem.resolution.notes && (
                                                            <Text color="gray.700" fontSize="sm">
                                                                {selectedMatchedItem.resolution.notes}
                                                            </Text>
                                                        )}
                                                    </VStack>
                                                </Box>
                                            )}
                                        </VStack>
                                    </CardBody>
                                </Card>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" onClick={() => setIsMatchedItemModalOpen(false)}>
                            Close
                        </Button>
                    </ModalFooter>
                                 </ModalContent>
             </Modal>

             {/* Image Preview Modal */}
             <Modal isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} size="6xl">
                 <ModalOverlay />
                 <ModalContent>
                     <ModalHeader>Image Preview</ModalHeader>
                     <ModalCloseButton />
                     <ModalBody>
                         {selectedImage && (
                             <Box textAlign="center">
                                 <ChakraImage
                                     src={selectedImage.data}
                                     alt={selectedImage.name}
                                     maxW="100%"
                                     maxH="80vh"
                                     objectFit="contain"
                                     borderRadius="md"
                                 />
                                 <Text mt={4} color="gray.600" fontSize="lg">
                                     {selectedImage.name}
                                 </Text>
                             </Box>
                         )}
                     </ModalBody>
                     <ModalFooter>
                         <Button variant="ghost" onClick={() => setIsImageModalOpen(false)}>
                             Close
                         </Button>
                     </ModalFooter>
                 </ModalContent>
             </Modal>
         </Box>
     );
 };