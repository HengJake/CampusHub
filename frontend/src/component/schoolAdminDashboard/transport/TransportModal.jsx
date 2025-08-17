import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    VStack,
    Box,
    Heading,
    Text,
    Badge,
    useToast
} from '@chakra-ui/react';
import { useTransportationStore } from '../../../store/transportation.js';
import BusScheduleForm from './BusScheduleForm';
import VehicleForm from './VehicleForm';
import StopForm from './StopForm';
import RouteForm from './RouteForm';
import { formatTime, calculateDuration, getDayLabel, getVehicleTypeLabel, getVehicleStatusLabel, getStopTypeLabel, getStatusColor } from './utils';

const TransportModal = ({ isOpen, onClose, modalType, selectedItem, isEditMode }) => {
    const toast = useToast();
    const {
        createBusSchedule,
        updateBusSchedule,
        createVehicle,
        updateVehicle,
        createStop,
        updateStop,
        createRoute,
        updateRoute
    } = useTransportationStore();

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
        if (!selectedItem) return null;

        switch (modalType) {
            case 'busSchedule':
                return (
                    <Box>
                        <Heading size="md" mb={4}>Bus Schedule Details</Heading>
                        <VStack spacing={3} align="stretch">
                            <Box>
                                <Text fontWeight="bold">Vehicle:</Text>
                                <Text>{selectedItem.vehicleId?.plateNumber || 'N/A'} ({getVehicleTypeLabel(selectedItem.vehicleId?.type)})</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Routes:</Text>
                                {selectedItem.routeId && selectedItem.routeId.length > 0 ? (
                                    <VStack align="start" spacing={2}>
                                        {selectedItem.routeId.map((route, index) => (
                                            <Box key={route._id} p={3} border="1px" borderColor="gray.200" borderRadius="md" w="100%">
                                                <Text fontWeight="semibold">{route.name}</Text>
                                                <Text fontSize="sm" color="gray.600">
                                                    Duration: {route.estimateTimeMinute} minutes | Fare: RM {route.fare}
                                                </Text>
                                                <Text fontSize="sm" color="gray.600">
                                                    Stops: {route.stopIds?.length || 0} stops
                                                </Text>
                                            </Box>
                                        ))}
                                    </VStack>
                                ) : (
                                    <Text color="gray.500">No routes assigned</Text>
                                )}
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Day of Week:</Text>
                                <Badge colorScheme="blue">
                                    {selectedItem.dayOfWeek ? ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][selectedItem.dayOfWeek] : 'N/A'}
                                </Badge>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Time:</Text>
                                <Text>{selectedItem.startTime && selectedItem.endTime ? `${selectedItem.startTime} - ${selectedItem.endTime}` : 'N/A'}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="bold">Date Range:</Text>
                                <Text>Start: {selectedItem.startDate ? new Date(selectedItem.startDate).toLocaleDateString() : 'N/A'}</Text>
                                <Text>End: {selectedItem.endDate ? new Date(selectedItem.endDate).toLocaleDateString() : 'N/A'}</Text>
                            </Box>
                        </VStack>
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
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
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

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        {!isEditMode && selectedItem ? 'Close' : 'Cancel'}
                    </Button>
                    {(isEditMode || !selectedItem) && (
                        <Button
                            colorScheme="blue"
                            onClick={() => {
                                // Form submission will be handled by the individual form components
                                // This is just a fallback
                            }}
                        >
                            {isEditMode ? 'Update' : 'Create'}
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default TransportModal;
