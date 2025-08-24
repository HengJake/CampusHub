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
    IconButton,
    Badge,
    VStack,
    HStack,
    Text,
    Card,
    CardBody,
    CardHeader,
    SimpleGrid,
    Input,
    useToast,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
    Divider
} from '@chakra-ui/react';
import {
    DeleteIcon,
    CheckIcon,
    CloseIcon
} from '@chakra-ui/icons';
import { useTransportationStore } from '../../../store/transportation.js';

const RouteTab = ({ loading, error, onView, onEdit, onDelete }) => {
    const { routes, stops, updateRoute, fetchStops } = useTransportationStore();
    const [editingRoute, setEditingRoute] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = React.useRef();

    // Fetch stops when component mounts
    React.useEffect(() => {
        fetchStops();
    }, [fetchStops]);

    const handleDelete = (route) => {
        if (onDelete) {
            onDelete('route', route);
        }
    };

    const startEditing = (route) => {
        setEditingRoute(route._id);
        setEditValues({
            name: route.name,
            estimateTimeMinute: route.estimateTimeMinute,
            fare: route.fare,
            stopIds: route.stopIds || [],
            schoolId: route.schoolId
        });
        setHasChanges(false);
    };

    const cancelEditing = () => {
        setEditingRoute(null);
        setEditValues({});
        setHasChanges(false);
    };

    const handleValueChange = (field, value) => {
        const route = routes.find(r => r._id === editingRoute);
        if (route) {
            const newValues = { ...editValues, [field]: value };
            setEditValues(newValues);

            // Check if there are actual changes in any field
            const hasActualChanges =
                newValues.name !== route.name ||
                newValues.estimateTimeMinute !== route.estimateTimeMinute ||
                newValues.fare !== route.fare ||
                JSON.stringify(newValues.stopIds) !== JSON.stringify(route.stopIds);
            setHasChanges(hasActualChanges);
        }
    };

    const handleStopToggle = (stopId) => {
        const currentStopIds = editValues.stopIds || [];
        const newStopIds = currentStopIds.includes(stopId)
            ? currentStopIds.filter(id => id !== stopId)
            : [...currentStopIds, stopId];

        handleValueChange('stopIds', newStopIds);
    };

    const handleSave = async () => {
        try {
            // Convert stop objects to IDs only
            const processedEditValues = {
                ...editValues,
                stopIds: editValues.stopIds?.map(stop =>
                    typeof stop === 'object' ? stop._id : stop
                ) || []
            };


            const result = await updateRoute(editingRoute, processedEditValues);
            if (result.success) {
                setEditingRoute(null);
                setEditValues({});
                setHasChanges(false);
                toast({
                    title: "Route updated",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                throw new Error(result.message || "Failed to update route");
            }
        } catch (error) {
            toast({
                title: "Error updating route",
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
                {/* Add Route Placeholder Card */}
                <Card
                    overflow={"hidden"}
                    boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                    bg="white"
                    borderRadius="xl"
                    cursor="pointer"
                    onClick={() => onEdit('route', null)}
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
                                Add New Route
                            </Text>
                            <Text color="gray.400" fontSize="sm" textAlign="center">
                                Click to create a new route
                            </Text>
                        </VStack>
                    </CardBody>
                </Card>

                {/* Existing Route Cards */}
                {routes.map((route) => (

                    <Card key={route._id} overflow={"hidden"} boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)" bg="white" borderRadius="xl">
                        <CardHeader pb={3} bg="rgba(220, 252, 231, 0.3)" borderBottom="1px solid" borderColor="gray.100">
                            {editingRoute === route._id ? (
                                <Input
                                    value={editValues.name || ''}
                                    onChange={(e) => handleValueChange('name', e.target.value)}
                                    size="md"
                                    fontWeight="600"
                                    fontSize="lg"
                                    borderColor="blue.300"
                                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                />
                            ) : (
                                <Heading size="md" color="gray.800" fontWeight="600">{route.name}</Heading>
                            )}
                        </CardHeader>

                        <CardBody pt={4} pb={2} >
                            <HStack justify={"space-between"} height={"100%"} spacing={6}>
                                {/* Left Side - Route Details */}
                                <Box flex={1} pr={6} borderRight="1px solid" borderColor="gray.200">
                                    <VStack align="start" spacing={4}>
                                        {/* Duration - Inline Editable */}
                                        <Box width="100%">
                                            <Text fontWeight="500" mb={2} color="gray.700" fontSize="sm">Duration</Text>
                                            {editingRoute === route._id ? (
                                                <HStack spacing={2}>
                                                    <Input
                                                        size="sm"
                                                        value={editValues.estimateTimeMinute || ''}
                                                        onChange={(e) => handleValueChange('estimateTimeMinute', e.target.value)}
                                                        type="number"
                                                        min="1"
                                                        width="120px"
                                                        borderColor="blue.300"
                                                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                                    />
                                                    <Text color="gray.600" fontSize="sm">minutes</Text>
                                                </HStack>
                                            ) : (
                                                <Text color="gray.800" fontSize="lg" fontWeight="500">{route.estimateTimeMinute} minutes</Text>
                                            )}
                                        </Box>

                                        {/* Fare - Inline Editable */}
                                        <Box width="100%">
                                            <Text fontWeight="500" mb={2} color="gray.700" fontSize="sm">Fare</Text>
                                            {editingRoute === route._id ? (
                                                <HStack spacing={2}>
                                                    <Text color="gray.600" fontSize="sm">RM</Text>
                                                    <Input
                                                        size="sm"
                                                        value={editValues.fare || ''}
                                                        onChange={(e) => handleValueChange('fare', e.target.value)}
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        width="120px"
                                                        borderColor="blue.300"
                                                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                                    />
                                                </HStack>
                                            ) : (
                                                <Text color="gray.800" fontSize="lg" fontWeight="500">RM {route.fare}</Text>
                                            )}
                                        </Box>
                                    </VStack>
                                </Box>

                                {/* Right Side - Stops */}
                                <VStack alignSelf="start" align={"start"} flex={1} pl={2}>
                                    <HStack justify="space-between" w="full" borderBottom="2px solid" borderColor="rgba(100, 180, 130, 1)" pb={1}>
                                        <Text fontWeight="500" color="gray.700" fontSize="sm">Stops</Text>
                                        {editingRoute === route._id && (
                                            <Text fontSize="xs" color="gray.500">
                                                {editValues.stopIds?.length || 0} selected
                                            </Text>
                                        )}
                                    </HStack>
                                    <VStack align="start" spacing={2} w="full">
                                        {editingRoute === route._id ? (
                                            // Edit mode: Show all stops with background color selection
                                            stops.map((stop) => (
                                                <Box
                                                    key={stop._id}
                                                    w="full"
                                                    p={2}
                                                    borderRadius="md"
                                                    cursor="pointer"
                                                    bg={editValues.stopIds?.includes(stop._id) ? "rgba(100, 180, 130, 0.2)" : "transparent"}
                                                    border={editValues.stopIds?.includes(stop._id) ? "1px solid rgba(100, 180, 130, 0.5)" : "1px solid transparent"}
                                                    _hover={{
                                                        bg: editValues.stopIds?.includes(stop._id) ? "rgba(100, 180, 130, 0.3)" : "rgba(100, 180, 130, 0.1)",
                                                        borderColor: "rgba(100, 180, 130, 0.7)"
                                                    }}
                                                    onClick={() => handleStopToggle(stop._id)}
                                                    transition="all 0.2s"
                                                >
                                                    <Text
                                                        color={editValues.stopIds?.includes(stop._id) ? "gray.800" : "gray.700"}
                                                        fontSize="sm"
                                                        fontWeight={editValues.stopIds?.includes(stop._id) ? "500" : "normal"}
                                                    >
                                                        {stop.name}
                                                    </Text>
                                                </Box>
                                            ))
                                        ) : (
                                            // View mode: Show only current route stops
                                            route.stopIds?.map((stopId) => {
                                                const stop = stops.find(s => s._id === stopId);
                                                return stop ? (
                                                    <Box key={stop._id} w="full">
                                                        <HStack spacing={2}>
                                                            <Box w={2} h={2} bg="rgba(100, 180, 130, 1)" borderRadius="full" flexShrink={0} />
                                                            <Text color="gray.700" fontSize="sm">{stop.name}</Text>
                                                        </HStack>
                                                    </Box>
                                                ) : null;
                                            })
                                        )}
                                    </VStack>
                                </VStack>
                            </HStack>
                        </CardBody>

                        {/* Footer - Action Buttons */}
                        <Box bg="rgba(220, 252, 231, 0.3)" borderTop="1px solid" borderColor="gray.100" p={4}>
                            <HStack spacing={3} justify="flex-end">
                                {editingRoute === route._id ? (
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
                                            onClick={() => startEditing(route)}
                                            colorScheme="blue"
                                            variant="outline"
                                            borderColor="blue.300"
                                            _hover={{ bg: "blue.50" }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleDelete(route)}
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

                ))}
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
                            Are you sure you want to save the changes to this route?
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
        </Box >
    );
};

export default RouteTab;
