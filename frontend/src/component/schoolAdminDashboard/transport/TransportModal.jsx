import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Button,
    VStack,
    HStack,
    Box,
    Heading,
    Text,
    Badge,
    Icon,
    useToast,
    SimpleGrid,
    Divider,
    Flex,
    Spacer
} from '@chakra-ui/react';
import { FaBus, FaRoute, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaMoneyBillWave } from 'react-icons/fa';
import { useTransportationStore } from '../../../store/transportation.js';
import BusScheduleForm from './BusScheduleForm';
import VehicleForm from './VehicleForm';
import StopForm from './StopForm';
import RouteForm from './RouteForm';
import { formatTime, calculateDuration, getDayLabel, getVehicleTypeLabel, getVehicleStatusLabel, getStopTypeLabel, getStatusColor } from './utils';

const TransportModal = ({ isOpen, onClose, modalType, selectedItem, isEditMode, onRefresh }) => {
    const toast = useToast();
    const {
        createBusSchedule,
        updateBusSchedule,
        createVehicle,
        updateVehicle,
        createStop,
        updateStop,
        createRoute,
        updateRoute,
        fetchRoutesBySchoolId,
        fetchVehiclesBySchoolId
    } = useTransportationStore();

    // Fetch required data when modal opens
    useEffect(() => {
        if (isOpen && modalType === 'busSchedule') {
            // Fetch routes and vehicles needed for bus schedule form
            fetchRoutesBySchoolId();
            fetchVehiclesBySchoolId();
        }
    }, [isOpen, modalType, fetchRoutesBySchoolId, fetchVehiclesBySchoolId]);

    const handleSubmit = async (formData) => {
        try {
            let result;

            switch (modalType) {
                case 'busSchedule':
                    if (isEditMode && selectedItem) {
                        result = await updateBusSchedule(selectedItem._id, formData);
                    } else {
                        result = await createBusSchedule(formData);
                    }
                    break;
                case 'vehicle':
                    if (isEditMode && selectedItem) {
                        result = await updateVehicle(selectedItem._id, formData);
                    } else {
                        result = await createVehicle(formData);
                    }
                    break;
                case 'stop':
                    if (isEditMode && selectedItem) {
                        result = await updateStop(selectedItem._id, formData);
                    } else {
                        result = await createStop(formData);
                    }
                    break;
                case 'route':
                    if (isEditMode && selectedItem) {
                        result = await updateRoute(selectedItem._id, formData);
                    } else {
                        result = await createRoute(formData);
                    }
                    break;
                default:
                    return;
            }

            if (result.success) {
                toast({
                    title: isEditMode ? 'Updated Successfully' : 'Created Successfully',
                    description: result.message,
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });

                // Refresh data after successful creation/update
                if (onRefresh) {
                    onRefresh();
                }

                onClose();
            } else {
                toast({
                    title: 'Error',
                    description: result.message,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An error occurred while processing the request.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const getModalTitle = () => {
        if (!modalType) return '';

        const action = isEditMode ? 'Edit' : selectedItem ? 'View' : 'Add';
        const type = modalType === 'busSchedule' ? 'Bus Schedule' :
            modalType === 'vehicle' ? 'Vehicle' :
                modalType === 'stop' ? 'Stop' : 'Route';

        return `${action} ${type}`;
    };

    const renderViewContent = () => {
        console.log("🚀 ~ renderViewContent ~ selectedItem:", selectedItem)
        if (!selectedItem) return null;

        switch (modalType) {
            case 'busSchedule':
                return (
                    <Box>
                        {/* Header Section */}
                        <Box mb={6} textAlign="center">
                            <HStack justify="center" mb={3}>
                                <Icon as={FaBus} color="blue.500" boxSize={6} />
                                <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
                                    Bus Schedule
                                </Badge>
                            </HStack>
                            <Heading size="lg" color="gray.800">
                                {selectedItem.routeTiming?.[0]?.routeId?.name || 'Route Details'}
                            </Heading>
                        </Box>

                        {/* Main Content - Responsive Grid */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            {/* Left Column - Vehicle & Route Info */}
                            <VStack spacing={4} align="stretch">
                                {/* Vehicle Information Card */}
                                <Box
                                    bg="white"
                                    p={5}
                                    borderRadius="xl"
                                    boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                                    border="1px solid"
                                    borderColor="gray.100"
                                >
                                    <HStack mb={3}>
                                        <Icon as={FaBus} color="blue.500" />
                                        <Heading size="md" color="gray.800">Vehicle Information</Heading>
                                    </HStack>
                                    <Divider mb={3} />

                                    <VStack align="start" spacing={3}>
                                        <HStack justify="space-between" w="100%">
                                            <Text fontWeight="semibold" color="gray.600">Plate Number:</Text>
                                            <Text fontWeight="bold" color="gray.800">
                                                {selectedItem.vehicleId?.plateNumber || 'N/A'}
                                            </Text>
                                        </HStack>
                                        <HStack justify="space-between" w="100%">
                                            <Text fontWeight="semibold" color="gray.600">Type:</Text>
                                            <Badge colorScheme="green" variant="subtle" px={3} py={1}>
                                                {getVehicleTypeLabel(selectedItem.vehicleId?.type) || 'N/A'}
                                            </Badge>
                                        </HStack>
                                    </VStack>
                                </Box>

                                {/* Routes Information Card */}
                                <Box
                                    bg="white"
                                    p={5}
                                    borderRadius="xl"
                                    boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                                    border="1px solid"
                                    borderColor="gray.100"
                                >
                                    <HStack mb={3}>
                                        <Icon as={FaRoute} color="purple.500" />
                                        <Heading size="md" color="gray.800">Route Details</Heading>
                                    </HStack>
                                    <Divider mb={3} />

                                    {selectedItem.routeTiming && selectedItem.routeTiming.length > 0 ? (
                                        <VStack align="stretch" spacing={3}>
                                            {selectedItem.routeTiming.map((route, index) => (
                                                <Box
                                                    key={index}
                                                    p={4}
                                                    bg="gray.50"
                                                    borderRadius="lg"
                                                    border="1px solid"
                                                    borderColor="gray.200"
                                                >
                                                    <Text fontWeight="bold" color="blue.600" mb={2}>
                                                        {route.routeId?.name || 'Route Name'}
                                                    </Text>

                                                    <SimpleGrid columns={2} spacing={3}>
                                                        <HStack>
                                                            <Icon as={FaClock} color="gray.500" boxSize={4} />
                                                            <Text fontSize="sm" color="gray.600">
                                                                {route.routeId?.estimateTimeMinute || 0} min
                                                            </Text>
                                                        </HStack>
                                                        <HStack>
                                                            <Icon as={FaMoneyBillWave} color="gray.500" boxSize={4} />
                                                            <Text fontSize="sm" color="gray.600">
                                                                RM {route.routeId?.fare || 0}
                                                            </Text>
                                                        </HStack>
                                                        <HStack colSpan={2}>
                                                            <Icon as={FaMapMarkerAlt} color="gray.500" boxSize={4} />
                                                            <Text fontSize="sm" color="gray.600">
                                                                {route.routeId?.stopIds?.length || 0} stops
                                                            </Text>
                                                        </HStack>
                                                    </SimpleGrid>
                                                </Box>
                                            ))}
                                        </VStack>
                                    ) : (
                                        <Text color="gray.500" textAlign="center" py={4}>
                                            No routes assigned
                                        </Text>
                                    )}
                                </Box>
                            </VStack>

                            {/* Right Column - Schedule Information */}
                            <VStack spacing={4} align="stretch">
                                <Box
                                    bg="white"
                                    p={5}
                                    borderRadius="xl"
                                    boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                                    border="1px solid"
                                    borderColor="gray.100"
                                    h="fit-content"
                                >
                                    <HStack mb={3}>
                                        <Icon as={FaCalendarAlt} color="orange.500" />
                                        <Heading size="md" color="gray.800">Schedule Information</Heading>
                                    </HStack>
                                    <Divider mb={3} />

                                    <VStack align="stretch" spacing={4}>
                                        {/* Day of Week */}
                                        <Box>
                                            <Text fontWeight="semibold" color="gray.600" mb={2}>Day of Week:</Text>
                                            <Badge
                                                colorScheme="blue"
                                                variant="solid"
                                                px={4}
                                                py={2}
                                                borderRadius="full"
                                                fontSize="md"
                                            >
                                                {selectedItem.dayOfWeek ?
                                                    ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][selectedItem.dayOfWeek]
                                                    : 'N/A'
                                                }
                                            </Badge>
                                        </Box>

                                        {/* Time Range */}
                                        <Box>
                                            <Text fontWeight="semibold" color="gray.600" mb={2}>Operating Hours:</Text>
                                            <HStack>
                                                <Icon as={FaClock} color="gray.500" />
                                                <Text fontWeight="bold" color="gray.800" fontSize="lg">
                                                    {selectedItem.routeTiming?.[0]?.startTime || 'N/A'} - {selectedItem.routeTiming?.[selectedItem.routeTiming.length - 1]?.endTime || 'N/A'}
                                                </Text>
                                            </HStack>
                                        </Box>

                                        {/* Date Range */}
                                        <Box>
                                            <Text fontWeight="semibold" color="gray.600" mb={2}>Valid Period:</Text>
                                            <VStack align="start" spacing={2}>
                                                <HStack>
                                                    <Text fontSize="sm" color="gray.500">From:</Text>
                                                    <Text fontWeight="medium" color="gray.800">
                                                        {selectedItem.startDate ? new Date(selectedItem.startDate).toLocaleDateString() : 'N/A'}
                                                    </Text>
                                                </HStack>
                                                <HStack>
                                                    <Text fontSize="sm" color="gray.500">To:</Text>
                                                    <Text fontWeight="medium" color="gray.800">
                                                        {selectedItem.endDate ? new Date(selectedItem.endDate).toLocaleDateString() : 'N/A'}
                                                    </Text>
                                                </HStack>
                                            </VStack>
                                        </Box>
                                    </VStack>
                                </Box>
                            </VStack>
                        </SimpleGrid>

                        {/* Action Button - Future Edit Functionality */}
                        <Box mt={6} textAlign="center">
                            <Button
                                colorScheme="blue"
                                variant="outline"
                                size="lg"
                                px={8}
                                leftIcon={<Icon as={FaCalendarAlt} />}
                                onClick={() => {/* Future edit functionality */ }}
                                isDisabled={true} // Disabled for now, enable when edit is implemented
                            >
                                Edit Schedule
                            </Button>
                        </Box>
                    </Box>
                );

            case 'vehicle':
                return (
                    <Box>
                        <Heading size="md" mb={4}>Vehicle Details</Heading>
                        <VStack spacing={3} align="stretch">
                            <Box>
                                <Text fontWeight="bold">Plate Number:</Text>
                                <Text>{selectedItem.plateNumber}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Type:</Text>
                                <Badge colorScheme="blue">{getVehicleTypeLabel(selectedItem.type)}</Badge>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Capacity:</Text>
                                <Text>{selectedItem.capacity} passengers</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Status:</Text>
                                <Badge colorScheme={getStatusColor(selectedItem.status)}>
                                    {getVehicleStatusLabel(selectedItem.status)}
                                </Badge>
                            </Box>
                        </VStack>
                    </Box>
                );

            case 'stop':
                return (
                    <Box>
                        <Heading size="md" mb={4}>Stop Details</Heading>
                        <VStack spacing={3} align="stretch">
                            <Box>
                                <Text fontWeight="bold">Name:</Text>
                                <Text>{selectedItem.name}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Type:</Text>
                                <Badge colorScheme="blue">{getStopTypeLabel(selectedItem.type)}</Badge>
                            </Box>
                        </VStack>
                    </Box>
                );

            case 'route':
                return (
                    <Box>
                        <Heading size="md" mb={4}>Route Details</Heading>
                        <VStack spacing={3} align="stretch">
                            <Box>
                                <Text fontWeight="bold">Name:</Text>
                                <Text>{selectedItem.name}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Duration:</Text>
                                <Text>{selectedItem.estimateTimeMinute} minutes</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Fare:</Text>
                                <Text>RM {selectedItem.fare}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Stops:</Text>
                                {selectedItem.stopIds && selectedItem.stopIds.length > 0 ? (
                                    <VStack align="start" spacing={2}>
                                        {selectedItem.stopIds.map((stop, index) => (
                                            <Box key={stop._id} p={2} border="1px" borderColor="gray.200" borderRadius="md">
                                                <Text fontSize="sm">
                                                    {index + 1}. {stop.name} ({getStopTypeLabel(stop.type)})
                                                </Text>
                                            </Box>
                                        ))}
                                    </VStack>
                                ) : (
                                    <Text color="gray.500">No stops assigned</Text>
                                )}
                            </Box>
                        </VStack>
                    </Box>
                );

            default:
                return null;
        }
    };

    const renderFormContent = () => {
        if (!modalType) return null;

        switch (modalType) {
            case 'busSchedule':
                return <BusScheduleForm onSubmit={handleSubmit} selectedItem={selectedItem} isEditMode={isEditMode} />;
            case 'vehicle':
                return <VehicleForm onSubmit={handleSubmit} selectedItem={selectedItem} isEditMode={isEditMode} />;
            case 'stop':
                return <StopForm onSubmit={handleSubmit} selectedItem={selectedItem} isEditMode={isEditMode} />;
            case 'route':
                return <RouteForm onSubmit={handleSubmit} selectedItem={selectedItem} isEditMode={isEditMode} />;
            default:
                return null;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="4xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{getModalTitle()}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {!isEditMode && selectedItem ? (
                        renderViewContent()
                    ) : (
                        renderFormContent()
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default TransportModal;
