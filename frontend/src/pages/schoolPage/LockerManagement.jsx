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
import { FiPlus, FiSearch, FiLock, FiUnlock, FiTool, FiEdit, FiTrash2, FiMoreVertical } from "react-icons/fi"
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
    const toast = useToast();

    const [formData, setFormData] = useState({
        name: "",
        resourceId: "",
        schoolId: "",
        status: "Available",
        isAvailable: true,
    });

    useEffect(() => {
        fetchLockerUnits();
        fetchResources();
    }, [fetchLockerUnits, fetchResources]);

    const [selectedFloor, setSelectedFloor] = useState("All")
    const [selectedSection, setSelectedSection] = useState("All")
    const [searchTerm, setSearchTerm] = useState("")

    const bgColor = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.600")

    const filteredLockers = lockerUnits.filter((locker) => {
        const matchesFloor =
            selectedFloor === "All" ||
            (locker.floor !== undefined &&
                locker.floor !== null &&
                locker.floor.toString() === selectedFloor);

        const matchesSection =
            selectedSection === "All" ||
            (typeof locker.section === "string" && locker.section === selectedSection);

        const matchesSearch =
            searchTerm === "" || 
            locker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            locker._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            locker.resourceId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFloor && matchesSection && matchesSearch;
    });

    // Fixed counter logic - use status field instead of isAvailable
    const occupiedCount = lockerUnits.filter((l) => l.status === "Occupied").length
    const availableCount = lockerUnits.filter((l) => l.status === "Available").length
    const maintenanceCount = lockerUnits.filter((l) => l.status === "Maintenance").length
    const occupancyRate = Math.round((occupiedCount / lockerUnits.length) * 100)

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

    // Generate default locker name
    const generateDefaultName = (resourceName, existingNames = []) => {
        const acronym = resourceName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('');
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
        setIsSubmitting(true);
        try {
            let res;
            let submitData = { ...formData };
            
            if (isEdit && selectedLocker) {
                // For edit, allow changing name and status
                submitData = {
                    name: formData.name,
                    status: formData.status,
                    isAvailable: formData.status === "Available"
                };
                res = await updateLockerUnit(selectedLocker._id, submitData);
            } else {
                // For new locker, auto-generate name if not provided
                if (!submitData.name && submitData.resourceId) {
                    const selectedResource = resources.find(r => r._id === submitData.resourceId);
                    if (selectedResource) {
                        const existingNames = lockerUnits
                            .filter(l => l.resourceId === submitData.resourceId)
                            .map(l => l.name)
                            .filter(Boolean);
                        submitData.name = generateDefaultName(selectedResource.name, existingNames);
                    }
                }
                submitData.isAvailable = submitData.status === "Available";
                res = await createLockerUnit(submitData);
            }
            
            if (res.success) {
                toast({ 
                    title: isEdit ? "Locker unit updated!" : "Locker unit added!", 
                    status: "success", 
                    duration: 2000, 
                    isClosable: true 
                });
                fetchLockerUnits();
                onClose();
                resetForm();
            } else {
                toast({ 
                    title: "Error", 
                    description: res.message, 
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
    const LockerCard = ({ locker }) => (
        <Tooltip label={`${locker.name || locker._id.slice(-4)} - ${locker.status}`}>
            <Card
                bg={getLockerColor(locker.status)}
                color="white"
                cursor="pointer"
                _hover={{ transform: "scale(1.05)" }}
                transition="all 0.2s"
                size="sm"
                border={selectedLockers.includes(locker._id) ? "2px solid #3182CE" : "1px solid transparent"}
            >
                <CardBody p={2} textAlign="center">
                    <Checkbox
                        isChecked={selectedLockers.includes(locker._id)}
                        onChange={(e) => handleLockerSelection(locker._id, e.target.checked)}
                        colorScheme="blue"
                        size="sm"
                        mb={1}
                    />
                    <Text fontSize="xs" fontWeight="bold">
                        {locker.name || locker._id.slice(-4)}
                    </Text>
                    {locker.status === "Occupied" ? <FiLock /> : locker.status === "Maintenance" ? <FiTool /> : <FiUnlock />}
                </CardBody>
                <HStack justify="center" spacing={2} pb={2}>
                    <IconButton 
                        icon={<FiEdit />} 
                        onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(locker);
                        }} 
                        size="xs" 
                        colorScheme="yellow"
                        variant="solid"
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
                    />
                </HStack>
            </Card>
        </Tooltip>
    );

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
                                        <Input 
                                            value={resources.find(r => r._id === formData.resourceId)?.name || 'N/A'}
                                            isReadOnly
                                            bg="gray.100"
                                        />
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

                {/* Stats Cards */}
                <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
                    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.600">Total Lockers</StatLabel>
                                <StatNumber color="#344E41">{lockerUnits.length}</StatNumber>
                                <StatHelpText>Campus wide</StatHelpText>
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
                        </HStack>
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
                            <Text fontSize="lg" fontWeight="semibold" color="#333333">
                                Locker Layout ({filteredLockers.length} lockers)
                            </Text>
                            {selectedLockers.length > 0 && (
                                <Text fontSize="sm" color="blue.500">
                                    {selectedLockers.length} selected
                                </Text>
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