import React, { useState } from 'react';
import {
    Box,
    Button,
    Flex,
    Heading,
    Spinner,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    SimpleGrid,
    Card,
    CardHeader,
    CardBody,
    Badge,
    Text,
    VStack,
    HStack,
    IconButton,
    Input,
    useToast,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
    Select
} from '@chakra-ui/react';
import {
    DeleteIcon,
    CheckIcon,
    CloseIcon
} from '@chakra-ui/icons';
import { useTransportationStore } from '../../../store/transportation.js';
import { getVehicleTypeLabel, getVehicleStatusLabel, getStatusColor } from './utils';

const VehicleTab = ({ loading, error, onView, onEdit, onDelete }) => {
    const { vehicles, updateVehicle } = useTransportationStore();
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = React.useRef();

    // Function to get dynamic colors based on vehicle type
    const getVehicleColors = (vehicleType) => {
        switch (vehicleType) {
            case 'bus':
                return {
                    headerBg: "linear-gradient(135deg, #FCD34D 0%, #ffe48c 100%)",
                    footerBg: "linear-gradient(135deg, #ffe48c 0%, #FCD34D 100%)"
                };
            case 'car':
                return {
                    headerBg: "linear-gradient(135deg, #a3c6ff 0%, #c8d7fa 100%)",
                    footerBg: "linear-gradient(135deg, #c8d7fa 0%, #a3c6ff 100%)"
                };
            default:
                return {
                    headerBg: "rgba(220, 252, 231, 0.3)",
                    footerBg: "rgba(220, 252, 231, 0.3)"
                };
        }
    };

    const handleDelete = (vehicle) => {
        if (onDelete) {
            onDelete('vehicle', vehicle);
        }
    };

    const startEditing = (vehicle) => {
        setEditingVehicle(vehicle._id);
        setEditValues({
            plateNumber: vehicle.plateNumber,
            type: vehicle.type,
            capacity: vehicle.capacity,
            status: vehicle.status,
            schoolId: vehicle.schoolId
        });
        setHasChanges(false);
    };

    const cancelEditing = () => {
        setEditingVehicle(null);
        setEditValues({});
        setHasChanges(false);
    };

    const handleValueChange = (field, value) => {
        const vehicle = vehicles.find(v => v._id === editingVehicle);
        if (vehicle) {
            const newValues = { ...editValues, [field]: value };
            setEditValues(newValues);

            // Check if there are actual changes in any field
            const hasActualChanges =
                newValues.plateNumber !== vehicle.plateNumber ||
                newValues.type !== vehicle.type ||
                newValues.capacity !== vehicle.capacity ||
                newValues.status !== vehicle.status;
            setHasChanges(hasActualChanges);
        }
    };

    const handleSave = async () => {
        try {
            const result = await updateVehicle(editingVehicle, editValues);
            if (result.success) {
                setEditingVehicle(null);
                setEditValues({});
                setHasChanges(false);
                toast({
                    title: "Vehicle updated",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                throw new Error(result.message || "Failed to update vehicle");
            }
        } catch (error) {
            toast({
                title: "Error updating vehicle",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const confirmSave = () => {
        onOpen();
    };

    if (loading) {
        return (
            <Flex justify="center" align="center" height="200px">
                <Spinner size="xl" />
            </Flex>
        );
    }

    if (error) {
        return (
            <Alert status="error">
                <AlertIcon />
                <AlertTitle>Error!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <Box>
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
                {/* Add Vehicle Placeholder Card */}
                <Card
                    overflow={"hidden"}
                    boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                    bg="white"
                    borderRadius="xl"
                    cursor="pointer"
                    onClick={() => onEdit('vehicle', null)}
                    _hover={{
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                        bg: "gray.50",
                        borderColor: "blue.300"
                    }}
                    transition="all 0.3s ease-in-out"
                    border="2px dashed"
                    borderColor="gray.300"
                >
                    <CardHeader pb={3} bg="rgba(220, 252, 231, 0.3)" borderBottom="1px solid" borderColor="gray.100">
                        <Flex align="center" justify="center" height="60px">
                            <Box
                                as="span"
                                fontSize="4xl"
                                fontWeight="bold"
                                color="gray.400"
                                _hover={{ color: "blue.400" }}
                                transition="color 0.3s ease-in-out"
                            >
                                +
                            </Box>
                        </Flex>
                    </CardHeader>

                    <CardBody pt={4} pb={2}>
                        <VStack align="center" justify="center" height="120px" spacing={3}>
                            <Text color="gray.500" fontSize="lg" fontWeight="500">
                                Add New Vehicle
                            </Text>
                            <Text color="gray.400" fontSize="sm" textAlign="center">
                                Click to create a new vehicle
                            </Text>
                        </VStack>
                    </CardBody>
                </Card>

                {/* Existing Vehicle Cards */}
                {vehicles.map((vehicle) => {
                    const { headerBg, footerBg } = getVehicleColors(vehicle.type);
                    return (
                        <Card key={vehicle._id} overflow={"hidden"} boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)" bg="white" borderRadius="xl">
                            <CardHeader pb={3} bg={headerBg} borderBottom="1px solid" borderColor="gray.100">
                                <Flex justify="space-between" align="center">
                                    {editingVehicle === vehicle._id ? (
                                        <Input
                                            value={editValues.plateNumber || ''}
                                            onChange={(e) => handleValueChange('plateNumber', e.target.value)}
                                            size="md"
                                            fontWeight="600"
                                            fontSize="lg"
                                            borderColor="blue.300"
                                            _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                        />
                                    ) : (
                                        <Heading size="md" color="gray.800" fontWeight="600">{vehicle.plateNumber}</Heading>
                                    )}
                                    <Badge colorScheme={getStatusColor(vehicle.status)}>
                                        {getVehicleStatusLabel(vehicle.status)}
                                    </Badge>
                                </Flex>
                            </CardHeader>

                            <CardBody pt={4} pb={2}>
                                <VStack align="start" spacing={4}>
                                    {/* Vehicle Type - Inline Editable */}
                                    <Box width="100%">
                                        <Text fontWeight="500" mb={2} color="gray.700" fontSize="sm">Type</Text>
                                        {editingVehicle === vehicle._id ? (
                                            <Select
                                                size="sm"
                                                value={editValues.type || ''}
                                                onChange={(e) => handleValueChange('type', e.target.value)}
                                                borderColor="blue.300"
                                                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                            >
                                                <option value="bus">Bus</option>
                                                <option value="car">Car</option>
                                            </Select>
                                        ) : (
                                            <Text color="gray.800" fontSize="lg" fontWeight="500">{getVehicleTypeLabel(vehicle.type)}</Text>
                                        )}
                                    </Box>

                                    {/* Capacity - Inline Editable */}
                                    <Box width="100%">
                                        <Text fontWeight="500" mb={2} color="gray.700" fontSize="sm">Capacity</Text>
                                        {editingVehicle === vehicle._id ? (
                                            <HStack spacing={2}>
                                                <Input
                                                    size="sm"
                                                    value={editValues.capacity || ''}
                                                    onChange={(e) => handleValueChange('capacity', e.target.value)}
                                                    type="number"
                                                    min="1"
                                                    width="120px"
                                                    borderColor="blue.300"
                                                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                                />
                                                <Text color="gray.600" fontSize="sm">passengers</Text>
                                            </HStack>
                                        ) : (
                                            <Text color="gray.800" fontSize="lg" fontWeight="500">{vehicle.capacity} passengers</Text>
                                        )}
                                    </Box>

                                    {/* Status - Inline Editable */}
                                    <Box width="100%">
                                        <Text fontWeight="500" mb={2} color="gray.700" fontSize="sm">Status</Text>
                                        {editingVehicle === vehicle._id ? (
                                            <Select
                                                size="sm"
                                                value={editValues.status || ''}
                                                onChange={(e) => handleValueChange('status', e.target.value)}
                                                borderColor="blue.300"
                                                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                            >
                                                <option value="active">Active</option>
                                                <option value="maintenance">Maintenance</option>
                                                <option value="inactive">Inactive</option>
                                            </Select>
                                        ) : (
                                            <Badge colorScheme={getStatusColor(vehicle.status)}>
                                                {getVehicleStatusLabel(vehicle.status)}
                                            </Badge>
                                        )}
                                    </Box>
                                </VStack>
                            </CardBody>

                            {/* Footer - Action Buttons */}
                            <Box bg={footerBg} borderTop="1px solid" borderColor="gray.100" p={4}>
                                <HStack spacing={3} justify="flex-end">
                                    {editingVehicle === vehicle._id ? (
                                        <>
                                            <Button
                                                size="sm"
                                                onClick={cancelEditing}
                                                variant="outline"
                                                colorScheme="gray"
                                                borderColor="gray.300"
                                                _hover={{ bg: "gray.100" }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={hasChanges ? confirmSave : handleSave}
                                                colorScheme="blue"
                                                isDisabled={!hasChanges}
                                                _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
                                            >
                                                Save Changes
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                size="sm"
                                                onClick={() => startEditing(vehicle)}
                                                colorScheme="blue"
                                                variant="outline"
                                                borderColor="blue.300"
                                                _hover={{ bg: "blue.50" }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleDelete(vehicle)}
                                                colorScheme="red"
                                                variant="outline"
                                                borderColor="red.300"
                                                _hover={{ bg: "red.50" }}
                                            >
                                                Delete
                                            </Button>
                                        </>
                                    )}
                                </HStack>
                            </Box>
                        </Card>
                    );
                })}
            </SimpleGrid>

            {/* Save Confirmation Dialog */}
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Save Changes
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to save the changes to this vehicle?
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="green" onClick={() => { handleSave(); onClose(); }} ml={3}>
                                Save
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default VehicleTab;
