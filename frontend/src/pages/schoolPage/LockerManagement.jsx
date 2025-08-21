import {
    Box,
    Button,
    Card,
    CardBody,
    Grid,
    Text,
    VStack,
    HStack,
    SimpleGrid,
    Select,
    Input,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    useColorModeValue,
    Tooltip,
    InputLeftElement,
    InputGroup,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Icon,
    FormControl,
    FormLabel,
    Switch,
    useToast,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Checkbox,
    CheckboxGroup,
    Badge,
    Divider,
    Flex,
    Spacer,
    useDisclosure,
    Stack,
    Heading,
    useBreakpointValue,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Center,
    Spinner,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
} from "@chakra-ui/react"
import { FiPlus, FiSearch, FiLock, FiUnlock, FiTool, FiEdit, FiTrash2, FiMoreVertical, FiRefreshCw, FiMapPin, FiCalendar, FiClock, FiInfo } from "react-icons/fi"
import { useState, useEffect, useMemo } from "react"
import { useFacilityStore } from "../../store/facility.js";
import ComfirmationMessage from "../../component/common/ComfirmationMessage.jsx";
import { useAuthStore } from "../../store/auth.js";

export function LockerManagement() {
    const {
        fetchLockerUnits,
        lockerUnits,
        createLockerUnit,
        updateLockerUnit,
        deleteLockerUnit,
        resources,
        fetchResources,
    } = useFacilityStore();

    const { getSchoolId } = useAuthStore();

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isBulkUploadOpen, onOpen: onBulkUploadOpen, onClose: onBulkUploadClose } = useDisclosure();
    const [isEdit, setIsEdit] = useState(false);
    const [selectedLocker, setSelectedLocker] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [lockerToDelete, setLockerToDelete] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isBulkCreating, setIsBulkCreating] = useState(false);
    const [generatedLockers, setGeneratedLockers] = useState([]);
    const toast = useToast();

    const [formData, setFormData] = useState({
        resourceId: "",
        status: "Available",
        isAvailable: true,
    });

    // Bulk upload form data
    const [bulkFormData, setBulkFormData] = useState({
        prefix: "",
        location: "",
        count: 10,
        status: "Available"
    });

    // Filter states
    const [statusFilter, setStatusFilter] = useState("All");
    const [locationFilter, setLocationFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsRefreshing(true);
                await Promise.all([fetchLockerUnits(), fetchResources()]);
            } catch (error) {
                console.error("Error loading data:", error);
                toast({
                    title: "Error Loading Data",
                    description: "Failed to load locker data. Please try refreshing the page.",
                    status: "error",
                    duration: 5000,
                    isClosable: true
                });
            } finally {
                setIsRefreshing(false);
            }
        };

        loadData();
    }, [fetchLockerUnits, fetchResources]);

    const bgColor = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.600")
    const cardBg = useColorModeValue("white", "gray.700")
    const hoverBg = useColorModeValue("gray.50", "gray.600")

    // Responsive grid columns
    const gridColumns = useBreakpointValue({ base: 2, md: 4, lg: 6 });

    // Filter and group lockers
    const filteredAndGroupedLockers = useMemo(() => {
        let filtered = lockerUnits.filter((locker) => {
            const resourceLocation = locker.resourceId?.location || "";
            const resourceName = locker.resourceId?.name || "";

            // Status filter
            const matchesStatus = statusFilter === "All" || locker.status === statusFilter;

            // Location filter
            const matchesLocation = locationFilter === "All" ||
                resourceLocation.toLowerCase().includes(locationFilter.toLowerCase()) ||
                resourceName.toLowerCase().includes(locationFilter.toLowerCase());

            // Search filter
            const matchesSearch = searchTerm === "" ||
                resourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                locker._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resourceLocation.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesStatus && matchesLocation && matchesSearch;
        });

        // Group by location
        const grouped = {};
        filtered.forEach(locker => {
            const location = locker.resourceId?.location || "Unknown Location";
            const blockMatch = location.match(/(Block\s+[A-Z])/i);
            const block = blockMatch ? blockMatch[1] : location;

            if (!grouped[block]) {
                grouped[block] = [];
            }
            grouped[block].push(locker);
        });

        return grouped;
    }, [lockerUnits, statusFilter, locationFilter, searchTerm]);

    // Get unique locations for filter dropdown
    const uniqueLocations = useMemo(() => {
        const locations = new Set();
        resources.forEach(resource => {
            if (resource.type === 'locker') {
                const location = resource.location || "Unknown Location";
                const blockMatch = location.match(/(Block\s+[A-Z])/i);
                const block = blockMatch ? blockMatch[1] : location;
                locations.add(block);
            }
        });
        return Array.from(locations).sort();
    }, [resources]);

    // Statistics
    const totalLockers = lockerUnits.length;
    const occupiedCount = lockerUnits.filter((l) => l.status === "Occupied").length;
    const availableCount = lockerUnits.filter((l) => l.status === "Available").length;
    const maintenanceCount = lockerUnits.filter((l) => l.status === "Maintenance").length;
    const occupancyRate = totalLockers > 0 ? Math.round((occupiedCount / totalLockers) * 100) : 0;

    // Generate default locker name
    const generateDefaultName = (resourceName, existingNames = []) => {
        if (!resourceName) return "LK1";

        let acronym = '';
        const lowerResourceName = resourceName.toLowerCase();

        if (lowerResourceName.includes('library')) acronym = 'LI';
        else if (lowerResourceName.includes('computer lab') || lowerResourceName.includes('computer room')) acronym = 'CL';
        else if (lowerResourceName.includes('sports complex') || lowerResourceName.includes('sports center')) acronym = 'SC';
        else if (lowerResourceName.includes('gymnasium') || lowerResourceName.includes('gym')) acronym = 'GY';
        else if (lowerResourceName.includes('cafeteria') || lowerResourceName.includes('dining')) acronym = 'CF';
        else if (lowerResourceName.includes('dormitory') || lowerResourceName.includes('hostel') || lowerResourceName.includes('residence')) acronym = 'DO';
        else if (lowerResourceName.includes('laboratory') || lowerResourceName.includes('lab')) acronym = 'LA';
        else if (lowerResourceName.includes('classroom') || lowerResourceName.includes('class room')) acronym = 'CR';
        else if (lowerResourceName.includes('office') || lowerResourceName.includes('admin')) acronym = 'OF';
        else if (lowerResourceName.includes('pool') || lowerResourceName.includes('swimming')) acronym = 'PO';
        else if (lowerResourceName.includes('tennis')) acronym = 'TE';
        else if (lowerResourceName.includes('basketball')) acronym = 'BA';
        else if (lowerResourceName.includes('badminton')) acronym = 'BD';
        else if (lowerResourceName.includes('study room') || lowerResourceName.includes('study hall')) acronym = 'ST';
        else if (lowerResourceName.includes('meeting room') || lowerResourceName.includes('conference')) acronym = 'MR';
        else if (lowerResourceName.includes('seminar room') || lowerResourceName.includes('seminar hall')) acronym = 'SR';
        else if (lowerResourceName.includes('court')) acronym = 'CT';
        else if (lowerResourceName.includes('locker')) {
            const locationPart = resourceName.replace(/locker/gi, '').trim();
            if (locationPart) {
                const words = locationPart.split(/[\s-_]+/).filter(word => word.length > 0);
                if (words.length >= 2) {
                    acronym = words[0].substring(0, 1).toUpperCase() + words[1].substring(0, 1).toUpperCase();
                } else if (words.length === 1) {
                    acronym = words[0].substring(0, 2).toUpperCase();
                } else {
                    acronym = 'LK';
                }
            } else {
                acronym = 'LK';
            }
        } else {
            const words = resourceName
                .split(/[\s-_]+/)
                .filter(word => word.length > 1 && !['the', 'and', 'of', 'in', 'at', 'on', 'for', 'with'].includes(word.toLowerCase()));

            if (words.length >= 2) {
                acronym = words[0].substring(0, 1).toUpperCase() + words[1].substring(0, 1).toUpperCase();
            } else if (words.length === 1) {
                acronym = words[0].substring(0, 2).toUpperCase();
            } else {
                acronym = 'RS';
            }
        }

        let counter = 1;
        let newName = `${acronym}${counter}`;

        while (existingNames.includes(newName)) {
            counter++;
            newName = `${acronym}${counter}`;
        }

        return newName;
    };

    // Open Add Modal
    const openAddModal = () => {
        setFormData({
            resourceId: "",
            status: "Available",
            isAvailable: true,
        });
        setIsEdit(false);
        setSelectedLocker(null);
        onOpen();
    };

    // Open Bulk Upload Modal
    const openBulkUploadModal = () => {
        setBulkFormData({
            prefix: "",
            location: "",
            count: 10,
            status: "Available"
        });
        setGeneratedLockers([]);
        onBulkUploadOpen();
    };

    // Generate locker units for preview
    const generateLockerUnits = () => {
        if (!bulkFormData.prefix.trim() || !bulkFormData.location.trim()) {
            toast({
                title: "Validation Error",
                description: "Please enter both prefix and location",
                status: "error",
                duration: 3000,
                isClosable: true
            });
            return;
        }

        const lockers = [];
        for (let i = 1; i <= bulkFormData.count; i++) {
            lockers.push({
                name: `${bulkFormData.prefix}${i}`,
                location: bulkFormData.location,
                status: bulkFormData.status,
                isAvailable: bulkFormData.status === "Available"
            });
        }
        setGeneratedLockers(lockers);
    };

    // Create bulk locker units
    const createBulkLockerUnits = async () => {
        if (generatedLockers.length === 0) {
            toast({
                title: "No Data",
                description: "No locker units to create",
                status: "error",
                duration: 3000,
                isClosable: true
            });
            return;
        }

        setIsBulkCreating(true);
        try {
            const schoolId = await getSchoolId();
            let successCount = 0;
            let errorCount = 0;

            for (const locker of generatedLockers) {
                try {
                    // First create the resource
                    const resourceData = {
                        name: locker.name,
                        location: locker.location,
                        type: 'locker',
                        schoolId: schoolId,
                        isActive: true
                    };

                    // Create resource first (you'll need to add this to your store)
                    // const resourceRes = await createResource(resourceData);

                    // For now, we'll use a placeholder resource ID
                    // In a real implementation, you'd use the created resource's ID
                    const resourceId = `temp_${Date.now()}_${Math.random()}`;

                    // Then create the locker unit
                    const lockerData = {
                        resourceId: resourceId,
                        schoolId: schoolId,
                        status: locker.status,
                        isAvailable: locker.isAvailable
                    };

                    const res = await createLockerUnit(lockerData);
                    if (res.success) {
                        successCount++;
                    } else {
                        errorCount++;
                    }
                } catch (error) {
                    errorCount++;
                    console.error("Error creating locker unit:", error);
                }
            }

            if (successCount > 0) {
                toast({
                    title: "Bulk Creation Complete",
                    description: `Successfully created ${successCount} locker units${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
                    status: "success",
                    duration: 5000,
                    isClosable: true
                });
                fetchLockerUnits();
                onBulkUploadClose();
                setGeneratedLockers([]);
            } else {
                toast({
                    title: "Bulk Creation Failed",
                    description: "Failed to create any locker units",
                    status: "error",
                    duration: 5000,
                    isClosable: true
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred during bulk creation",
                status: "error",
                duration: 5000,
                isClosable: true
            });
        } finally {
            setIsBulkCreating(false);
        }
    };

    // Open Edit Modal
    const openEditModal = (locker) => {
        setFormData({
            resourceId: locker.resourceId?._id || locker.resourceId || "",
            status: locker.status || "Available",
            isAvailable: locker.isAvailable !== undefined ? locker.isAvailable : true,
        });
        setIsEdit(true);
        setSelectedLocker(locker);
        onOpen();
    };

    // Handle form submit
    const handleSubmit = async () => {
        if (!isEdit && !formData.resourceId) {
            toast({
                title: "Validation Error",
                description: "Please select a resource for the locker unit",
                status: "error",
                duration: 3000,
                isClosable: true
            });
            return;
        }

        setIsSubmitting(true);
        try {
            let res;
            let submitData = { ...formData };

            if (isEdit && selectedLocker) {
                submitData = {
                    status: formData.status,
                    isAvailable: formData.status === "Available"
                };
                res = await updateLockerUnit(selectedLocker._id, submitData);
            } else {
                submitData.isAvailable = submitData.status === "Available";
                res = await createLockerUnit(submitData);
            }

            if (res.success) {
                const resourceName = resources.find(r => r._id === submitData.resourceId)?.name || "Locker";
                toast({
                    title: isEdit ? "Locker unit updated!" : "Locker unit added!",
                    description: isEdit
                        ? `${resourceName} has been updated successfully`
                        : `${resourceName} has been created successfully`,
                    status: "success",
                    duration: 3000,
                    isClosable: true
                });
                fetchLockerUnits();
                onClose();
                resetForm();
            } else {
                toast({
                    title: "Error",
                    description: res.message || "An error occurred while processing your request",
                    status: "error",
                    duration: 3000,
                    isClosable: true
                });
            }
        } catch (err) {
            console.error("Error submitting locker unit:", err);
            toast({
                title: "Error",
                description: err.message || "An unexpected error occurred",
                status: "error",
                duration: 3000,
                isClosable: true
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset form data
    const resetForm = () => {
        setFormData({
            resourceId: "",
            status: "Available",
            isAvailable: true,
        });
        setIsEdit(false);
        setSelectedLocker(null);
    };

    // Handle Delete
    const handleDelete = async () => {
        if (!lockerToDelete) return;
        const res = await deleteLockerUnit(lockerToDelete._id);
        if (res.success) {
            toast({
                title: "Locker unit deleted!",
                status: "success",
                duration: 2000,
                isClosable: true
            });
            fetchLockerUnits();
        } else {
            toast({
                title: "Error",
                description: res.message,
                status: "error",
                duration: 3000,
                isClosable: true
            });
        }
        setIsDeleteOpen(false);
        setLockerToDelete(null);
    };

    // Status badge component
    const StatusBadge = ({ locker, onStatusChange }) => {
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);

        const getStatusColor = (status) => {
            switch (status) {
                case "Available": return "green";
                case "Occupied": return "red";
                case "Maintenance": return "yellow";
                default: return "gray";
            }
        };

        const getStatusIcon = (status) => {
            switch (status) {
                case "Available": return FiUnlock;
                case "Occupied": return FiLock;
                case "Maintenance": return FiTool;
                default: return FiInfo;
            }
        };

        const handleStatusChange = async (newStatus) => {
            try {
                const schoolId = await getSchoolId();

                const updates = {
                    resourceId: locker.resourceId?._id || locker.resourceId,
                    schoolId: schoolId,
                    status: newStatus,
                    isAvailable: newStatus === "Available"
                };
                const res = await updateLockerUnit(locker._id, updates);
                if (res.success) {
                    toast({
                        title: "Status Updated",
                        description: `Locker status changed to ${newStatus}`,
                        status: "success",
                        duration: 2000,
                        isClosable: true
                    });
                    fetchLockerUnits();
                    if (onStatusChange) {
                        onStatusChange(updates);
                    }
                    setIsDropdownOpen(false);
                } else {
                    toast({
                        title: "Unable to update status",
                        description: res.message,
                        status: "error",
                        duration: 2000,
                        isClosable: true
                    });
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to update status",
                    status: "error",
                    duration: 3000,
                    isClosable: true
                });
            }
        };

        return (
            <Box position="relative">
                <Badge
                    colorScheme={getStatusColor(locker.status)}
                    variant="solid"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="sm"
                    fontWeight="bold"
                    display="flex"
                    alignItems="center"
                    gap={2}
                    boxShadow="md"
                    textShadow="0 1px 2px rgba(0,0,0,0.3)"
                    cursor="pointer"
                    _hover={{ transform: "scale(1.05)" }}
                    transition="all 0.2s"
                    userSelect={"none"}
                    zIndex={10}
                    w={"fit-content"}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    <Icon as={getStatusIcon(locker.status)} boxSize={4} />
                </Badge>

//TODO: to implement company admin

                {isDropdownOpen && (
                    <Box
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
                                cursor="pointer"
                                borderRadius="sm"
                                _hover={{ bg: "green.100" }}
                                onClick={() => handleStatusChange("Available")}
                                display="flex"
                                alignItems="center"
                                gap={2}
                            >
                                <Icon as={FiUnlock} color="green.600" boxSize={4} />
                                <Text color="green.600" fontSize="sm" fontWeight="medium">
                                    Available
                                </Text>
                            </Box>

                            <Box
                                p={2}
                                cursor="pointer"
                                borderRadius="sm"
                                _hover={{ bg: "red.100" }}
                                onClick={() => handleStatusChange("Occupied")}
                                display="flex"
                                alignItems="center"
                                gap={2}
                            >
                                <Icon as={FiLock} color="red.600" boxSize={4} />
                                <Text color="red.600" fontSize="sm" fontWeight="medium">
                                    Occupied
                                </Text>
                            </Box>

                            <Box
                                p={2}
                                cursor="pointer"
                                borderRadius="sm"
                                _hover={{ bg: "yellow.100" }}
                                onClick={() => handleStatusChange("Maintenance")}
                                display="flex"
                                alignItems="center"
                                gap={2}
                            >
                                <Icon as={FiTool} color="yellow.600" boxSize={4} />
                                <Text color="yellow.600" fontSize="sm" fontWeight="medium">
                                    Maintenance
                                </Text>
                            </Box>
                        </VStack>
                    </Box>
                )}
            </Box>
        );
    };

    // Locker Card component
    const LockerCard = ({ locker }) => {
        const resourceName = locker.resourceId?.name || "Unknown Resource";
        const resourceLocation = locker.resourceId?.location || "Unknown Location";
        const displayName = resourceName;

        // Get card background based on status
        const getCardBackground = (status) => {
            switch (status) {
                case "Available":
                    return "linear-gradient(135deg, #48BB78 0%, #68D391 100%)";
                case "Occupied":
                    return "linear-gradient(135deg, #E53E3E 0%, #FC8181 100%)";
                case "Maintenance":
                    return "linear-gradient(135deg, #D69E2E 0%, #F6AD55 100%)";
                default:
                    return "linear-gradient(135deg, #A0AEC0 0%, #CBD5E0 100%)";
            }
        };

        // Get text color based on status
        const getTextColor = (status) => {
            switch (status) {
                case "Available":
                    return "white";
                case "Occupied":
                    return "white";
                case "Maintenance":
                    return "white";
                default:
                    return "gray.800";
            }
        };

        return (
            <Card
                bg={getCardBackground(locker.status)}
                color={getTextColor(locker.status)}
                borderColor={borderColor}
                borderWidth="1px"
                _hover={{
                    transform: "translateY(-2px)",
                    shadow: "lg",
                    filter: "brightness(1.1)"
                }}
                transition="all 0.2s"
            >
                <CardBody p={4}>
                    <VStack spacing={3} align="stretch">
                        <HStack justify="space-between" align="start">
                            <VStack align="start" spacing={1} flex={1}>
                                <Text fontSize="lg" fontWeight="bold" color={getTextColor(locker.status)}>
                                    {displayName}
                                </Text>
                                <HStack spacing={2} color={getTextColor(locker.status)} opacity={0.9}>
                                    <Icon as={FiMapPin} boxSize={3} />
                                    <Text fontSize="sm">{resourceLocation}</Text>
                                </HStack>
                            </VStack>
                            <StatusBadge
                                locker={locker}
                                onStatusChange={(updates) => {
                                    // Update the local state if needed
                                    Object.assign(locker, updates);
                                }}
                            />
                        </HStack>

                        <Divider borderColor={getTextColor(locker.status)} opacity={0.3} />

                        <VStack align="start" justify="space-between" fontSize="sm" color={getTextColor(locker.status)} opacity={0.8}>
                            <Text>ID: {locker._id.slice(-6)}</Text>
                            <HStack spacing={1}>
                                <Text>Last Used: {new Date(locker.updatedAt || Date.now()).toLocaleDateString()}</Text>
                            </HStack>
                        </VStack>

                        {/* Quick Actions */}
                        <HStack justify="center" spacing={2} pt={2}>
                            <IconButton
                                icon={<FiEdit />}
                                size="xs"
                                colorScheme="blue"
                                variant="solid"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(locker);
                                }}
                                aria-label="Edit locker"
                            />
                            <IconButton
                                icon={<FiTrash2 />}
                                size="xs"
                                colorScheme="red"
                                variant="solid"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLockerToDelete(locker);
                                    setIsDeleteOpen(true);
                                }}
                                aria-label="Delete locker"
                            />
                        </HStack>
                    </VStack>
                </CardBody>
            </Card>
        );
    };

    return (
        <Box minH="100vh" flex={1} p={6}>
            <VStack spacing={6} align="stretch">
                {/* Header */}
                <Box>
                    <Heading size="lg" color="gray.800" mb={2}>
                        Locker Management
                    </Heading>
                    <Text color="gray.600">Manage locker assignments and availability across campus</Text>
                </Box>

                {/* Stats Cards */}
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                    <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                        <CardBody p={4}>
                            <Stat>
                                <StatLabel color="gray.600" fontSize="sm">Total Lockers</StatLabel>
                                <StatNumber color="blue.600" fontSize="2xl">{totalLockers}</StatNumber>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                        <CardBody p={4}>
                            <Stat>
                                <StatLabel color="gray.600" fontSize="sm">Available</StatLabel>
                                <StatNumber color="green.600" fontSize="2xl">{availableCount}</StatNumber>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                        <CardBody p={4}>
                            <Stat>
                                <StatLabel color="gray.600" fontSize="sm">Occupied</StatLabel>
                                <StatNumber color="red.600" fontSize="2xl">{occupiedCount}</StatNumber>
                                <StatHelpText fontSize="xs">{occupancyRate}% occupancy</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                        <CardBody p={4}>
                            <Stat>
                                <StatLabel color="gray.600" fontSize="sm">Maintenance</StatLabel>
                                <StatNumber color="yellow.600" fontSize="2xl">{maintenanceCount}</StatNumber>
                            </Stat>
                        </CardBody>
                    </Card>
                </SimpleGrid>

                {/* Filters and Actions */}
                <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                    <CardBody p={4}>
                        <VStack spacing={4} align="stretch">
                            <HStack justify="space-between" align="center">
                                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                                    Filters & Search
                                </Text>
                                <HStack spacing={3}>
                                    <Button
                                        leftIcon={<FiRefreshCw />}
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
                                            setIsRefreshing(true);
                                            await Promise.all([fetchLockerUnits(), fetchResources()]);
                                            setIsRefreshing(false);
                                            toast({
                                                title: "Data Refreshed",
                                                description: "Locker data has been updated",
                                                status: "success",
                                                duration: 2000,
                                                isClosable: true
                                            });
                                        }}
                                        isLoading={isRefreshing}
                                    >
                                        Refresh
                                    </Button>
                                    <Button
                                        leftIcon={<FiPlus />}
                                        colorScheme="blue"
                                        size="sm"
                                        onClick={openAddModal}
                                    >
                                        Add Locker
                                    </Button>
                                    <Button
                                        leftIcon={<FiPlus />}
                                        colorScheme="green"
                                        size="sm"
                                        onClick={openBulkUploadModal}
                                    >
                                        Bulk Add
                                    </Button>
                                </HStack>
                            </HStack>

                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                <FormControl>
                                    <FormLabel fontSize="sm">Search</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <FiSearch color="gray.400" />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Search lockers..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            size="sm"
                                        />
                                    </InputGroup>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm">Status</FormLabel>
                                    <Select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        size="sm"
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="Available">Available</option>
                                        <option value="Occupied">Occupied</option>
                                        <option value="Maintenance">Maintenance</option>
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm">Location</FormLabel>
                                    <Select
                                        value={locationFilter}
                                        onChange={(e) => setLocationFilter(e.target.value)}
                                        size="sm"
                                    >
                                        <option value="All">All Locations</option>
                                        {uniqueLocations.map(location => (
                                            <option key={location} value={location}>{location}</option>
                                        ))}
                                    </Select>
                                </FormControl>
                            </SimpleGrid>
                        </VStack>
                    </CardBody>
                </Card>

                {/* Locker Grid by Location */}
                {Object.entries(filteredAndGroupedLockers).map(([location, lockers]) => (
                    <Card key={location} bg={cardBg} borderColor={borderColor} borderWidth="1px">
                        <CardBody p={4}>
                            <VStack spacing={4} align="stretch">
                                <HStack justify="space-between" align="center">
                                    <VStack align="start" spacing={1}>
                                        <Heading size="md" color="gray.800">
                                            {location}
                                        </Heading>
                                        <Text fontSize="sm" color="gray.600">
                                            {lockers.length} locker{lockers.length !== 1 ? 's' : ''}
                                        </Text>
                                    </VStack>
                                </HStack>

                                <SimpleGrid columns={gridColumns} spacing={4}>
                                    {lockers.map((locker) => (
                                        <LockerCard key={locker._id} locker={locker} />
                                    ))}
                                </SimpleGrid>
                            </VStack>
                        </CardBody>
                    </Card>
                ))}

                {/* Add/Edit Locker Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="md">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>
                            {isEdit ? "Edit Locker Unit" : "Add New Locker Unit"}
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            {isEdit ? (
                                <>
                                    <FormControl mb={4}>
                                        <FormLabel>Resource Name</FormLabel>
                                        <VStack align="start" spacing={1}>
                                            <Input
                                                value={resources.find(r => r._id === formData.resourceId)?.name || selectedLocker?.resourceId?.name || 'N/A'}
                                                isReadOnly
                                                bg="gray.100"
                                            />
                                            <Text fontSize="sm" color="gray.600">
                                                Location: {resources.find(r => r._id === formData.resourceId)?.location || selectedLocker?.resourceId?.location || 'N/A'}
                                            </Text>
                                        </VStack>
                                    </FormControl>
                                    <FormControl mb={4}>
                                        <FormLabel>Status</FormLabel>
                                        <Select
                                            value={formData.status}
                                            onChange={(e) => setFormData(f => ({ ...f, status: e.target.value }))}
                                        >
                                            <option value="Available">Available</option>
                                            <option value="Occupied">Occupied</option>
                                            <option value="Maintenance">Maintenance</option>
                                        </Select>
                                    </FormControl>
                                </>
                            ) : (
                                <>
                                    <FormControl isRequired mb={4}>
                                        <FormLabel>Resource</FormLabel>
                                        <Select
                                            value={formData.resourceId}
                                            onChange={(e) => setFormData(f => ({ ...f, resourceId: e.target.value }))}
                                            placeholder="Select a resource"
                                        >
                                            {resources
                                                .filter(resource => resource.type === 'locker')
                                                .map(resource => (
                                                    <option key={resource._id} value={resource._id}>
                                                        {resource.name} - {resource.location}
                                                    </option>
                                                ))
                                            }
                                        </Select>
                                    </FormControl>
                                    <FormControl mb={4}>
                                        <FormLabel>Status</FormLabel>
                                        <Select
                                            value={formData.status}
                                            onChange={(e) => setFormData(f => ({ ...f, status: e.target.value }))}
                                        >
                                            <option value="Available">Available</option>
                                            <option value="Occupied">Occupied</option>
                                            <option value="Maintenance">Maintenance</option>
                                        </Select>
                                    </FormControl>
                                </>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="blue" onClick={handleSubmit} isLoading={isSubmitting}>
                                {isEdit ? "Update" : "Create"}
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Delete Confirmation Modal */}
                <ComfirmationMessage
                    title="Confirm delete locker unit?"
                    description="This locker unit will be permanently deleted and cannot be restored."
                    isOpen={isDeleteOpen}
                    onClose={() => {
                        setIsDeleteOpen(false);
                        setLockerToDelete(null);
                    }}
                    onConfirm={handleDelete}
                />

                {/* Bulk Upload Modal */}
                <Modal isOpen={isBulkUploadOpen} onClose={onBulkUploadClose} isCentered size="xl">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Bulk Create Locker Units</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={6} align="stretch">
                                <Alert status="info" borderRadius="md">
                                    <AlertIcon />
                                    <Box>
                                        <AlertTitle fontSize="sm">Bulk Locker Creation:</AlertTitle>
                                        <AlertDescription fontSize="sm">
                                            Generate multiple locker units by entering a prefix and location. The system will create resources and locker units automatically.
                                        </AlertDescription>
                                    </Box>
                                </Alert>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                    <FormControl>
                                        <FormLabel>Prefix</FormLabel>
                                        <Input
                                            placeholder="e.g., LK, A, B"
                                            value={bulkFormData.prefix}
                                            onChange={(e) => setBulkFormData(f => ({ ...f, prefix: e.target.value }))}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Location</FormLabel>
                                        <Input
                                            placeholder="e.g., Block A, Library, Gym"
                                            value={bulkFormData.location}
                                            onChange={(e) => setBulkFormData(f => ({ ...f, location: e.target.value }))}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Count</FormLabel>
                                        <NumberInput
                                            min={1}
                                            max={100}
                                            value={bulkFormData.count}
                                            onChange={(value) => setBulkFormData(f => ({ ...f, count: parseInt(value) || 1 }))}
                                        >
                                            <NumberInputField />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Initial Status</FormLabel>
                                        <Select
                                            value={bulkFormData.status}
                                            onChange={(e) => setBulkFormData(f => ({ ...f, status: e.target.value }))}
                                        >
                                            <option value="Available">Available</option>
                                            <option value="Occupied">Occupied</option>
                                            <option value="Maintenance">Maintenance</option>
                                        </Select>
                                    </FormControl>
                                </SimpleGrid>

                                <Button
                                    colorScheme="blue"
                                    onClick={generateLockerUnits}
                                    isDisabled={!bulkFormData.prefix.trim() || !bulkFormData.location.trim()}
                                >
                                    Generate Preview
                                </Button>

                                {generatedLockers.length > 0 && (
                                    <Box>
                                        <Text fontSize="sm" fontWeight="semibold" mb={3}>
                                            Generated Locker Units ({generatedLockers.length} units):
                                        </Text>
                                        <TableContainer maxH="300px" overflowY="auto">
                                            <Table size="sm" variant="striped">
                                                <Thead>
                                                    <Tr>
                                                        <Th>Name</Th>
                                                        <Th>Location</Th>
                                                        <Th>Status</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {generatedLockers.map((locker, index) => (
                                                        <Tr key={index}>
                                                            <Td>{locker.name}</Td>
                                                            <Td>{locker.location}</Td>
                                                            <Td>
                                                                <Badge colorScheme={locker.isAvailable ? "green" : "red"}>
                                                                    {locker.status}
                                                                </Badge>
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}

                                {isBulkCreating && (
                                    <Center py={4}>
                                        <VStack>
                                            <Spinner color="blue.500" />
                                            <Text fontSize="sm" color="gray.600">
                                                Creating locker units...
                                            </Text>
                                        </VStack>
                                    </Center>
                                )}
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onBulkUploadClose}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="green"
                                onClick={createBulkLockerUnits}
                                isDisabled={isBulkCreating || generatedLockers.length === 0}
                            >
                                Create Locker Units
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </VStack>
        </Box>
    )
}
