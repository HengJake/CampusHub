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
} from "@chakra-ui/react"
import { FiPlus, FiSearch, FiLock, FiUnlock, FiTool, FiEdit, FiTrash2, FiMoreVertical, FiRefreshCw } from "react-icons/fi"
import { useState, useEffect } from "react"
import { useFacilityStore } from "../../store/facility.js";
import { useDisclosure } from "@chakra-ui/react";
import ComfirmationMessage from "../../component/common/ComfirmationMessage.jsx";

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

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isEdit, setIsEdit] = useState(false);
    const [selectedLocker, setSelectedLocker] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [lockerToDelete, setLockerToDelete] = useState(null);
    const [selectedLockers, setSelectedLockers] = useState([]);
    const [isBulkActionOpen, setIsBulkActionOpen] = useState(false);
    const [bulkAction, setBulkAction] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const toast = useToast();

    const [formData, setFormData] = useState({
        name: "",
        resourceId: "",
        schoolId: "",
        status: "Available",
        isAvailable: true,
    });

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

    const [selectedFloor, setSelectedFloor] = useState("All")
    const [selectedSection, setSelectedSection] = useState("All")
    const [selectedSchool, setSelectedSchool] = useState("All")
    const [searchTerm, setSearchTerm] = useState("")

    const bgColor = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.600")

    const filteredLockers = lockerUnits.filter((locker) => {
        // Extract floor from resource location if available
        const resourceLocation = locker.resourceId?.location || "";
        const floorMatch = resourceLocation.match(/(\d+)(st|nd|rd|th)\s+Floor/i);
        const lockerFloor = floorMatch ? floorMatch[1] : null;

        const matchesFloor =
            selectedFloor === "All" ||
            (lockerFloor && lockerFloor === selectedFloor);

        // Extract section from resource location or name
        const sectionMatch = resourceLocation.match(/Section\s+([A-Z])/i) ||
            locker.name?.match(/([A-Z])\d+$/);
        const lockerSection = sectionMatch ? sectionMatch[1].toUpperCase() : null;

        const matchesSection =
            selectedSection === "All" ||
            (lockerSection && lockerSection === selectedSection);

        // Filter by school ID
        const matchesSchool =
            selectedSchool === "All" ||
            locker.schoolId === selectedSchool;

        const matchesSearch =
            searchTerm === "" ||
            locker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            locker._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            locker.resourceId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            locker.resourceId?.location?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFloor && matchesSection && matchesSchool && matchesSearch;
    });

    // Fixed counter logic - use status field instead of isAvailable
    // Use filtered data for stats when school is selected
    const statsData = selectedSchool === "All" ? lockerUnits : lockerUnits.filter(l => l.schoolId === selectedSchool);
    const occupiedCount = statsData.filter((l) => l.status === "Occupied").length
    const availableCount = statsData.filter((l) => l.status === "Available").length
    const maintenanceCount = statsData.filter((l) => l.status === "Maintenance").length
    const occupancyRate = statsData.length > 0 ? Math.round((occupiedCount / statsData.length) * 100) : 0

    // Get unique schools for filtering
    const uniqueSchools = [...new Set(lockerUnits.map(locker => locker.schoolId).filter(Boolean))]
        .map(schoolId => ({
            id: schoolId,
            displayName: `School ${schoolId.slice(-6)}` // Show last 6 characters for readability
        }))
        .sort((a, b) => a.displayName.localeCompare(b.displayName))

    const getLockerColor = (status) => {
        switch (status) {
            case "Available":
                return "#48BB78"
            case "Occupied":
                return "#344E41"
            case "Maintenance":
                return "#ED8936"
            default:
                return "#A4C3A2"
        }
    }




    // Generate default locker name based on location
    const generateDefaultName = (resourceName, resourceLocation, existingNames = []) => {
        // Extract location-based acronym
        let locationAcronym = '';

        // Check for specific location patterns
        if (resourceLocation?.toLowerCase().includes('library')) {
            locationAcronym = 'LO'; // Library lOcker
        } else if (resourceLocation?.toLowerCase().includes('computer lab')) {
            locationAcronym = 'CL'; // Computer Lab
        } else if (resourceLocation?.toLowerCase().includes('sports complex')) {
            locationAcronym = 'SC'; // Sports Complex
        } else if (resourceLocation?.toLowerCase().includes('gym')) {
            locationAcronym = 'GY'; // GYm
        } else if (resourceLocation?.toLowerCase().includes('cafeteria')) {
            locationAcronym = 'CF'; // CaFeteria
        } else if (resourceLocation?.toLowerCase().includes('dormitory') || resourceLocation?.toLowerCase().includes('hostel')) {
            locationAcronym = 'DO'; // DOrmitory
        } else if (resourceLocation?.toLowerCase().includes('laboratory') || resourceLocation?.toLowerCase().includes('lab')) {
            locationAcronym = 'LA'; // LAboratory
        } else if (resourceLocation?.toLowerCase().includes('classroom')) {
            locationAcronym = 'CR'; // ClassRoom
        } else if (resourceLocation?.toLowerCase().includes('office')) {
            locationAcronym = 'OF'; // OFfice
        } else {
            // Fallback: use first two letters of each significant word
            const words = (resourceLocation || resourceName || 'Locker')
                .split(/[\s-_]+/)
                .filter(word => word.length > 2 && !['the', 'and', 'of', 'in', 'at', 'on'].includes(word.toLowerCase()));

            if (words.length >= 2) {
                locationAcronym = words[0].substring(0, 1).toUpperCase() + words[1].substring(0, 1).toUpperCase();
            } else if (words.length === 1) {
                locationAcronym = words[0].substring(0, 2).toUpperCase();
            } else {
                locationAcronym = 'LK'; // Default: LocKer
            }
        }

        // Generate unique number
        let counter = 1;
        let newName = `${locationAcronym}${counter}`;

        while (existingNames.includes(newName)) {
            counter++;
            newName = `${locationAcronym}${counter}`;
        }

        return newName;
    };

    // Open Add Modal
    const openAddModal = () => {
        setFormData({
            name: "",
            resourceId: "",
            schoolId: "",
            status: "Available",
            isAvailable: true,
        });
        setIsEdit(false);
        setSelectedLocker(null);
        onOpen();
    };

    // Open Edit Modal
    const openEditModal = (locker) => {
        setFormData({
            name: locker.name || "",
            resourceId: locker.resourceId?._id || locker.resourceId || "",
            schoolId: locker.schoolId || "",
            status: locker.status || "Available",
            isAvailable: locker.isAvailable !== undefined ? locker.isAvailable : true,
        });
        setIsEdit(true);
        setSelectedLocker(locker);
        onOpen();
    };


    // Handle form submit for creating/updating locker units
    const handleSubmit = async () => {
        // Validation
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

        if (!isEdit && !formData.schoolId) {
            toast({
                title: "Validation Error",
                description: "Please provide a school ID",
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
                // For edit, send all required fields
                submitData = {
                    name: formData.name.trim() || selectedLocker.name,
                    schoolId: formData.schoolId || selectedLocker.schoolId,
                    resourceId: formData.resourceId || selectedLocker.resourceId,
                    status: formData.status,
                    isAvailable: formData.status === "Available"
                };
                res = await updateLockerUnit(selectedLocker._id, submitData);
            } else {
                // For new locker, auto-generate name if not provided
                if (!submitData.name.trim() && submitData.resourceId) {
                    const selectedResource = resources.find(r => r._id === submitData.resourceId);
                    if (selectedResource) {
                        const existingNames = lockerUnits
                            .filter(l => l.resourceId === submitData.resourceId || l.resourceId?._id === submitData.resourceId)
                            .map(l => l.name)
                            .filter(Boolean);
                        submitData.name = generateDefaultName(selectedResource.name, selectedResource.location, existingNames);
                    }
                } else {
                    submitData.name = submitData.name.trim();
                }

                submitData.isAvailable = submitData.status === "Available";
                res = await createLockerUnit(submitData);
            }

            if (res.success) {
                toast({
                    title: isEdit ? "Locker unit updated!" : "Locker unit added!",
                    description: isEdit
                        ? `${submitData.name} has been updated successfully`
                        : `${submitData.name} has been created successfully`,
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
            name: "",
            resourceId: "",
            schoolId: "",
            status: "Available",
            isAvailable: true,
        });
        setIsEdit(false);
        setSelectedLocker(null);
    };

    // Open Delete Dialog
    const openDeleteDialog = (locker) => {
        setLockerToDelete(locker);
        setIsDeleteOpen(true);
    };

    // Close Delete Dialog
    const closeDeleteDialog = () => {
        setIsDeleteOpen(false);
        setLockerToDelete(null);
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
        closeDeleteDialog();
    };

    // Handle bulk selection
    const handleLockerSelection = (lockerId, isSelected) => {
        if (isSelected) {
            setSelectedLockers(prev => [...prev, lockerId]);
        } else {
            setSelectedLockers(prev => prev.filter(id => id !== lockerId));
        }
    };

    // Handle bulk actions
    const handleBulkAction = async () => {
        if (selectedLockers.length === 0) {
            toast({
                title: "No lockers selected",
                description: "Please select at least one locker to perform bulk action",
                status: "warning",
                duration: 3000,
                isClosable: true
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const updates = {
                status: bulkAction,
                isAvailable: bulkAction === "Available"
            };

            const promises = selectedLockers.map(lockerId =>
                updateLockerUnit(lockerId, updates)
            );

            const results = await Promise.all(promises);
            const successCount = results.filter(res => res.success).length;

            if (successCount > 0) {
                toast({
                    title: "Bulk action completed!",
                    description: `Successfully updated ${successCount} out of ${selectedLockers.length} lockers`,
                    status: "success",
                    duration: 3000,
                    isClosable: true
                });
                fetchLockerUnits();
                setSelectedLockers([]);
                setIsBulkActionOpen(false);
            } else {
                toast({
                    title: "Bulk action failed",
                    description: "Failed to update any lockers",
                    status: "error",
                    duration: 3000,
                    isClosable: true
                });
            }
        } catch (err) {
            toast({
                title: "Error",
                description: err.message,
                status: "error",
                duration: 3000,
                isClosable: true
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Locker Card component to display each locker unit
    const LockerCard = ({ locker }) => {
        const resourceName = locker.resourceId?.name || "Unknown Resource";
        const resourceLocation = locker.resourceId?.location || "Unknown Location";
        const tooltipText = `${locker.name || locker._id.slice(-4)} - ${locker.status}\nResource: ${resourceName}\nLocation: ${resourceLocation}\nAvailable: ${locker.isAvailable ? 'Yes' : 'No'}`;

        return (
            <Tooltip label={tooltipText} hasArrow placement="top">
                <Card
                    bg={getLockerColor(locker.status)}
                    color="white"
                    cursor="pointer"
                    _hover={{ transform: "scale(1.05)", shadow: "lg" }}
                    transition="all 0.2s"
                    size="sm"
                    border={selectedLockers.includes(locker._id) ? "2px solid #3182CE" : "1px solid transparent"}
                    position="relative"
                >
                    <CardBody p={2} textAlign="center">
                        <Checkbox
                            isChecked={selectedLockers.includes(locker._id)}
                            onChange={(e) => handleLockerSelection(locker._id, e.target.checked)}
                            colorScheme="blue"
                            size="sm"
                            mb={1}
                        />
                        <Text fontSize="xs" fontWeight="bold" mb={1}>
                            {locker.name || locker._id.slice(-4)}
                        </Text>
                        <Icon as={locker.status === "Occupied" ? FiLock : locker.status === "Maintenance" ? FiTool : FiUnlock}
                            boxSize={3} mb={1} />
                        {!locker.isAvailable && (
                            <Text fontSize="xs" opacity={0.8}>
                                Unavailable
                            </Text>
                        )}
                    </CardBody>
                    <HStack justify="center" spacing={1} pb={2}>
                        <IconButton
                            icon={<FiEdit />}
                            onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(locker);
                            }}
                            size="xs"
                            colorScheme="yellow"
                            variant="solid"
                            aria-label="Edit locker"
                        />
                        <IconButton
                            icon={<FiTrash2 />}
                            onClick={(e) => {
                                e.stopPropagation();
                                openDeleteDialog(locker);
                            }}
                            size="xs"
                            colorScheme="red"
                            variant="solid"
                            aria-label="Delete locker"
                        />
                    </HStack>
                </Card>
            </Tooltip>
        );
    };

    return (
        <Box minH="100vh" flex={1}>
            <VStack spacing={6} align="stretch">
                {/* Header */}
                <HStack justify="space-between">
                    <Box>
                        <Text fontSize="2xl" fontWeight="bold" color="#333333">
                            Locker Management
                        </Text>
                        <Text color="gray.600">Manage locker assignments and availability</Text>
                    </Box>
                    <HStack spacing={4}>
                        <Button
                            leftIcon={<FiRefreshCw />}
                            variant="outline"
                            onClick={async () => {
                                setIsRefreshing(true);
                                await fetchLockerUnits();
                                await fetchResources();
                                setIsRefreshing(false);
                                toast({
                                    title: "Data Refreshed",
                                    description: "Locker data has been updated from database",
                                    status: "success",
                                    duration: 2000,
                                    isClosable: true
                                });
                            }}
                            isLoading={isRefreshing}
                        >
                            Refresh
                        </Button>
                        <Button leftIcon={<FiPlus />} bg="#344E41" color="white" _hover={{ bg: "#2a332a" }} onClick={openAddModal}>
                            Add Locker Unit
                        </Button>
                        <Button
                            leftIcon={<FiTool />}
                            bg="#A4C3A2"
                            color="white"
                            _hover={{ bg: "#8db08f" }}
                            onClick={() => setIsBulkActionOpen(true)}
                            isDisabled={selectedLockers.length === 0}
                        >
                            Bulk Actions ({selectedLockers.length})
                        </Button>
                    </HStack>
                </HStack>

                {/* Add/Edit Locker Unit Modal */}
                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>{isEdit ? "Edit Locker Unit" : "Add New Locker Unit"}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            {isEdit ? (
                                // Edit mode - allow changing name and status
                                <>
                                    <FormControl isRequired mb={3}>
                                        <FormLabel>Locker Name</FormLabel>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                                            placeholder="Enter locker name (e.g., LR1, SR2)"
                                        />
                                    </FormControl>
                                    <FormControl mb={3}>
                                        <FormLabel>Resource</FormLabel>
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
                                    <FormControl mb={3}>
                                        <FormLabel>School ID</FormLabel>
                                        <Input
                                            value={formData.schoolId}
                                            isReadOnly
                                            bg="gray.100"
                                        />
                                    </FormControl>
                                    <FormControl mb={3}>
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
                                // Add mode - allow setting all fields
                                <>
                                    <FormControl mb={3}>
                                        <FormLabel>Locker Name (Optional)</FormLabel>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                                            placeholder="Leave empty for auto-generated name"
                                        />
                                    </FormControl>
                                    <FormControl isRequired mb={3}>
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
                                    <FormControl isRequired mb={3}>
                                        <FormLabel>School ID</FormLabel>
                                        <Input
                                            value={formData.schoolId}
                                            onChange={(e) => setFormData(f => ({ ...f, schoolId: e.target.value }))}
                                            placeholder="School ID"
                                        />
                                    </FormControl>
                                    <FormControl mb={3}>
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
                            <Button colorScheme="green" onClick={handleSubmit} isLoading={isSubmitting}>
                                {isEdit ? "Update Locker Unit" : "Add Locker Unit"}
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Bulk Action Modal */}
                <Modal isOpen={isBulkActionOpen} onClose={() => setIsBulkActionOpen(false)}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Bulk Action on {selectedLockers.length} Lockers</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <FormControl mb={3}>
                                <FormLabel>Select Action</FormLabel>
                                <Select
                                    value={bulkAction}
                                    onChange={(e) => setBulkAction(e.target.value)}
                                    placeholder="Choose an action"
                                >
                                    <option value="Available">Mark as Available</option>
                                    <option value="Occupied">Mark as Occupied</option>
                                    <option value="Maintenance">Mark for Maintenance</option>
                                </Select>
                            </FormControl>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={() => setIsBulkActionOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="blue"
                                onClick={handleBulkAction}
                                isLoading={isSubmitting}
                                isDisabled={!bulkAction}
                            >
                                Apply to {selectedLockers.length} Lockers
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Quick School Filter */}
                {uniqueSchools.length > 1 && (
                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <HStack justify="space-between" align="center">
                                <Text fontSize="md" fontWeight="semibold" color="#333333">
                                    Quick School Filter:
                                </Text>
                                <HStack spacing={2} wrap="wrap">
                                    <Button
                                        size="sm"
                                        variant={selectedSchool === "All" ? "solid" : "outline"}
                                        colorScheme="blue"
                                        onClick={() => setSelectedSchool("All")}
                                    >
                                        All ({lockerUnits.length})
                                    </Button>
                                    {uniqueSchools.slice(0, 5).map(school => {
                                        const schoolLockerCount = lockerUnits.filter(l => l.schoolId === school.id).length;
                                        return (
                                            <Button
                                                key={school.id}
                                                size="sm"
                                                variant={selectedSchool === school.id ? "solid" : "outline"}
                                                colorScheme="blue"
                                                onClick={() => setSelectedSchool(school.id)}
                                            >
                                                {school.displayName} ({schoolLockerCount})
                                            </Button>
                                        );
                                    })}
                                    {uniqueSchools.length > 5 && (
                                        <Text fontSize="sm" color="gray.500">
                                            +{uniqueSchools.length - 5} more schools
                                        </Text>
                                    )}
                                </HStack>
                            </HStack>
                        </CardBody>
                    </Card>
                )}

                {/* Stats Cards */}
                <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.600">Total Lockers</StatLabel>
                                <StatNumber color="#344E41">{statsData.length}</StatNumber>
                                <StatHelpText>
                                    {selectedSchool === "All" ? "Campus wide" : `In selected school`}
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.600">Occupied</StatLabel>
                                <StatNumber color="#A4C3A2">{occupiedCount}</StatNumber>
                                <StatHelpText>{occupancyRate}% occupancy</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.600">Available</StatLabel>
                                <StatNumber color="#48BB78">{availableCount}</StatNumber>
                                <StatHelpText>Ready for assignment</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.600">Maintenance</StatLabel>
                                <StatNumber color="#ED8936">{maintenanceCount}</StatNumber>
                                <StatHelpText>Need attention</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </Grid>

                {/* Filters */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        <VStack spacing={4} align="stretch">
                            <HStack spacing={4}>
                                <Box flex="1">
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <FiSearch color="gray.400" />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Search by locker name, ID or resource name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </Box>
                                <Select w="200px" value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}>
                                    <option value="All">All Schools ({uniqueSchools.length})</option>
                                    {uniqueSchools.map(school => (
                                        <option key={school.id} value={school.id}>
                                            {school.displayName}
                                        </option>
                                    ))}
                                </Select>
                            </HStack>
                            <HStack spacing={4}>
                                <Select w="150px" value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)}>
                                    <option value="All">All Floors</option>
                                    <option value="1">Floor 1</option>
                                    <option value="2">Floor 2</option>
                                    <option value="3">Floor 3</option>
                                    <option value="4">Floor 4</option>
                                </Select>
                                <Select w="150px" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                                    <option value="All">All Sections</option>
                                    <option value="A">Section A</option>
                                    <option value="B">Section B</option>
                                    <option value="C">Section C</option>
                                    <option value="D">Section D</option>
                                    <option value="E">Section E</option>
                                </Select>
                                <Box flex="1" />
                                {selectedSchool !== "All" && (
                                    <Text fontSize="sm" color="blue.600" fontWeight="medium">
                                        Filtered by: {uniqueSchools.find(s => s.id === selectedSchool)?.displayName || selectedSchool}
                                    </Text>
                                )}
                            </HStack>
                        </VStack>
                    </CardBody>
                </Card>

                {/* Legend */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        <HStack spacing={6}>
                            <HStack>
                                <Box w={4} h={4} bg="#48BB78" borderRadius="sm" />
                                <Text fontSize="sm">Available</Text>
                            </HStack>
                            <HStack>
                                <Box w={4} h={4} bg="#344E41" borderRadius="sm" />
                                <Text fontSize="sm">Occupied</Text>
                            </HStack>
                            <HStack>
                                <Box w={4} h={4} bg="#ED8936" borderRadius="sm" />
                                <Text fontSize="sm">Maintenance</Text>
                            </HStack>
                        </HStack>
                    </CardBody>
                </Card>

                {/* Locker Grid */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        <HStack justify="space-between" mb={4}>
                            <VStack align="start" spacing={1}>
                                <Text fontSize="lg" fontWeight="semibold" color="#333333">
                                    Locker Layout ({filteredLockers.length} lockers)
                                </Text>
                                <Text fontSize="xs" color="green.600">
                                    📡 Live Data from Database
                                </Text>
                            </VStack>
                            {selectedLockers.length > 0 && (
                                <VStack align="end" spacing={1}>
                                    <Text fontSize="sm" color="blue.500" fontWeight="medium">
                                        {selectedLockers.length} selected
                                    </Text>
                                    <Button
                                        size="xs"
                                        variant="ghost"
                                        onClick={() => setSelectedLockers([])}
                                        color="gray.500"
                                    >
                                        Clear selection
                                    </Button>
                                </VStack>
                            )}
                        </HStack>
                        <SimpleGrid columns={{ base: 8, md: 12, lg: 16 }} spacing={2}>
                            {filteredLockers.map((locker) => (
                                <LockerCard key={locker._id} locker={locker} />
                            ))}
                        </SimpleGrid>
                    </CardBody>
                </Card>

                {/* Quick Actions */}
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <CardBody>
                        <Text fontSize="lg" fontWeight="semibold" mb={4} color="#333333">
                            Quick Actions
                        </Text>
                        <HStack spacing={4}>
                            <Button
                                leftIcon={<FiLock />}
                                colorScheme="green"
                                variant="outline"
                                onClick={() => {
                                    setBulkAction("Occupied");
                                    setIsBulkActionOpen(true);
                                }}
                                isDisabled={selectedLockers.length === 0}
                            >
                                Assign Selected ({selectedLockers.length})
                            </Button>
                            <Button
                                leftIcon={<FiUnlock />}
                                colorScheme="blue"
                                variant="outline"
                                onClick={() => {
                                    setBulkAction("Available");
                                    setIsBulkActionOpen(true);
                                }}
                                isDisabled={selectedLockers.length === 0}
                            >
                                Release Selected ({selectedLockers.length})
                            </Button>
                            <Button
                                leftIcon={<FiTool />}
                                colorScheme="orange"
                                variant="outline"
                                onClick={() => {
                                    setBulkAction("Maintenance");
                                    setIsBulkActionOpen(true);
                                }}
                                isDisabled={selectedLockers.length === 0}
                            >
                                Mark for Maintenance ({selectedLockers.length})
                            </Button>
                        </HStack>
                    </CardBody>
                </Card>

                {/* Delete Confirmation Modal */}
                <ComfirmationMessage
                    title="Confirm delete locker unit?"
                    description="This locker unit will be permanently deleted and cannot be restored."
                    isOpen={isDeleteOpen}
                    onClose={closeDeleteDialog}
                    onConfirm={handleDelete}
                />
            </VStack>
        </Box>
    )
}