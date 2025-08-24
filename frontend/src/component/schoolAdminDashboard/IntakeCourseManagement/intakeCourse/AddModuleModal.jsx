import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    VStack,
    HStack,
    Text,
    Box,
    Input,
    InputGroup,
    InputLeftElement,
    Icon,
    useToast,
    Spinner,
    Center,
    Badge,
    Divider
} from '@chakra-ui/react';
import { FiSearch, FiPlus, FiBookOpen } from 'react-icons/fi';
import { useAcademicStore } from '../../../../store/academic';

const AddModuleModal = ({
    isOpen,
    onClose,
    semester,
    courseId,
    intakeCourseId,
    onModuleAdded
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [availableModules, setAvailableModules] = useState([]);
    const [filteredModules, setFilteredModules] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [selectedModules, setSelectedModules] = useState([]);
    
    const { getAvailableModulesForSemester, addModuleToSemester } = useAcademicStore();
    const toast = useToast();

    useEffect(() => {
        if (isOpen && semester && courseId) {
            fetchAvailableModules();
        }
    }, [isOpen, semester, courseId]);

    useEffect(() => {
        if (availableModules.length > 0) {
            filterModules();
        }
    }, [searchTerm, availableModules]);

    const fetchAvailableModules = async () => {
        setIsLoading(true);
        try {
            const result = await getAvailableModulesForSemester(semester._id, courseId);
            if (result.success) {
                setAvailableModules(result.data);
                setFilteredModules(result.data);
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Failed to fetch available modules",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch available modules",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const filterModules = () => {
        if (!searchTerm.trim()) {
            setFilteredModules(availableModules);
            return;
        }

        const filtered = availableModules.filter(module =>
            module.moduleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            module.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredModules(filtered);
    };

    const handleModuleSelect = (module) => {
        const isSelected = selectedModules.some(m => m._id === module._id);
        if (isSelected) {
            setSelectedModules(selectedModules.filter(m => m._id !== module._id));
        } else {
            setSelectedModules([...selectedModules, module]);
        }
    };

    const handleAddModules = async () => {
        if (selectedModules.length === 0) {
            toast({
                title: "Warning",
                description: "Please select at least one module",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsAdding(true);
        try {
            let successCount = 0;
            let errorCount = 0;

            for (const module of selectedModules) {
                const result = await addModuleToSemester(
                    semester._id,
                    module._id,
                    courseId,
                    intakeCourseId
                );

                if (result.success) {
                    successCount++;
                } else {
                    errorCount++;
                }
            }

            if (successCount > 0) {
                toast({
                    title: "Success",
                    description: `Successfully added ${successCount} module(s) to semester`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });

                if (onModuleAdded) {
                    onModuleAdded();
                }

                onClose();
            }

            if (errorCount > 0) {
                toast({
                    title: "Warning",
                    description: `Failed to add ${errorCount} module(s)`,
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while adding modules",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsAdding(false);
        }
    };

    const isModuleSelected = (module) => {
        return selectedModules.some(m => m._id === module._id);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
            <ModalOverlay zIndex={2000} />
            <ModalContent>
                <ModalHeader>
                    <HStack>
                        <Icon as={FiBookOpen} />
                        <Text>Add Modules to Semester</Text>
                    </HStack>
                </ModalHeader>
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Box>
                            <Text fontSize="sm" color="gray.600" mb={2}>
                                Semester: {semester?.semesterName}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                                Course: {courseId}
                            </Text>
                        </Box>

                        <Divider />

                        <Box>
                            <Text fontSize="md" fontWeight="semibold" mb={2}>
                                Available Modules ({filteredModules.length})
                            </Text>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <Icon as={FiSearch} color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Search modules by name or code..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Box>

                        {isLoading ? (
                            <Center py={8}>
                                <VStack spacing={4}>
                                    <Spinner size="lg" color="blue.500" />
                                    <Text>Loading available modules...</Text>
                                </VStack>
                            </Center>
                        ) : filteredModules.length === 0 ? (
                            <Center py={8}>
                                <Text color="gray.500">
                                    {searchTerm ? 'No modules found matching your search' : 'No available modules for this semester'}
                                </Text>
                            </Center>
                        ) : (
                            <Box maxH="400px" overflowY="auto">
                                <VStack spacing={2} align="stretch">
                                    {filteredModules.map((module) => (
                                        <Box
                                            key={module._id}
                                            p={3}
                                            border="1px solid"
                                            borderColor={isModuleSelected(module) ? "blue.200" : "gray.200"}
                                            borderRadius="md"
                                            bg={isModuleSelected(module) ? "blue.50" : "white"}
                                            cursor="pointer"
                                            _hover={{
                                                borderColor: "blue.300",
                                                bg: isModuleSelected(module) ? "blue.100" : "gray.50"
                                            }}
                                            onClick={() => handleModuleSelect(module)}
                                        >
                                            <HStack justify="space-between" align="start">
                                                <VStack align="start" spacing={1} flex="1">
                                                    <HStack>
                                                        <Text fontWeight="semibold">
                                                            {module.moduleName}
                                                        </Text>
                                                        <Badge colorScheme="blue" size="sm">
                                                            {module.code}
                                                        </Badge>
                                                    </HStack>
                                                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                                        {module.moduleDescription}
                                                    </Text>
                                                    <HStack spacing={4}>
                                                        <Text fontSize="xs" color="gray.500">
                                                            Credits: {module.totalCreditHours}
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.500">
                                                            Assessment: {module.assessmentMethods.join(', ')}
                                                        </Text>
                                                    </HStack>
                                                </VStack>
                                                <Box>
                                                    {isModuleSelected(module) && (
                                                        <Icon as={FiPlus} color="blue.500" />
                                                    )}
                                                </Box>
                                            </HStack>
                                        </Box>
                                    ))}
                                </VStack>
                            </Box>
                        )}

                        {selectedModules.length > 0 && (
                            <Box>
                                <Text fontSize="sm" fontWeight="medium" mb={2}>
                                    Selected Modules ({selectedModules.length}):
                                </Text>
                                <VStack spacing={1} align="stretch">
                                    {selectedModules.map((module) => (
                                        <HStack key={module._id} justify="space-between" p={2} bg="blue.50" borderRadius="md">
                                            <Text fontSize="sm">{module.moduleName} ({module.code})</Text>
                                            <Button
                                                size="xs"
                                                variant="ghost"
                                                colorScheme="red"
                                                onClick={() => handleModuleSelect(module)}
                                            >
                                                Remove
                                            </Button>
                                        </HStack>
                                    ))}
                                </VStack>
                            </Box>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={handleAddModules}
                        isLoading={isAdding}
                        loadingText="Adding..."
                        isDisabled={selectedModules.length === 0}
                        leftIcon={<Icon as={FiPlus} />}
                    >
                        Add {selectedModules.length > 0 ? `(${selectedModules.length})` : ''} Module{selectedModules.length !== 1 ? 's' : ''}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AddModuleModal;
