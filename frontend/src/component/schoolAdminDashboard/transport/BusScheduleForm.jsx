import React, { useState, useEffect } from 'react';
import {
    VStack,
    FormControl,
    FormLabel,
    Input,
    Select,
    HStack,
    Button,
    IconButton,
    FormHelperText,
    Box,
    Text,
    Badge,
    VStack as ChakraVStack
} from '@chakra-ui/react';
import { FiTrash2 } from 'react-icons/fi';
import { useTransportationStore } from '../../../store/transportation.js';

const BusScheduleForm = ({ onSubmit, selectedItem, isEditMode }) => {
    const { routes, vehicles } = useTransportationStore();

    const [formData, setFormData] = useState({
        routeTiming: [],
        vehicleId: '',
        dayOfWeek: 1,
        startDate: '',
        endDate: ''
    });

    const [selectedVehicleId, setSelectedVehicleId] = useState('');

    // Calculate end time based on start time and route duration
    const calculateEndTime = (startTime, durationMinutes) => {
        if (!startTime || !durationMinutes) return null;

        // Parse start time and add duration
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const startDate = new Date(`2000-01-01T${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}:00`);
        const endDate = new Date(startDate.getTime() + durationMinutes * 60000); // Convert minutes to milliseconds

        // Format end time as HH:MM
        const endHour = endDate.getHours();
        const endMinute = endDate.getMinutes();
        return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    };

    // Add a new route timing entry
    const addRouteTiming = () => {
        setFormData(prev => ({
            ...prev,
            routeTiming: [...prev.routeTiming, { routeId: '', startTime: '07:00' }]
        }));
    };

    // Remove a route timing entry
    const removeRouteTiming = (index) => {
        setFormData(prev => ({
            ...prev,
            routeTiming: prev.routeTiming.filter((_, i) => i !== index)
        }));
    };

    // Update a specific route timing entry
    const updateRouteTiming = (index, field, value) => {
        setFormData(prev => {
            const newRouteTiming = [...prev.routeTiming];
            newRouteTiming[index] = { ...newRouteTiming[index], [field]: value };

            // Auto-calculate end time when start time or route changes
            if (field === 'startTime' || field === 'routeId') {
                const route = routes.find(r => r._id === newRouteTiming[index].routeId);
                if (route && newRouteTiming[index].startTime) {
                    newRouteTiming[index].endTime = calculateEndTime(newRouteTiming[index].startTime, route.estimateTimeMinute);
                }
            }

            return { ...prev, routeTiming: newRouteTiming };
        });
    };

    useEffect(() => {
        if (selectedItem && isEditMode) {
            setFormData({
                routeTiming: selectedItem.routeTiming?.map(timing => ({
                    routeId: timing.routeId?._id || timing.routeId,
                    startTime: timing.startTime || '07:00',
                    endTime: timing.endTime || ''
                })) || [],
                vehicleId: selectedItem.vehicleId?._id || '',
                dayOfWeek: selectedItem.dayOfWeek || 1,
                startDate: selectedItem.startDate ? new Date(selectedItem.startDate).toISOString().split('T')[0] : '',
                endDate: selectedItem.endDate ? new Date(selectedItem.endDate).toISOString().split('T')[0] : ''
            });
            setSelectedVehicleId(selectedItem.vehicleId?._id || '');
        } else {
            // Initialize with one empty route timing entry
            setFormData({
                routeTiming: [{ routeId: '', startTime: '07:00' }],
                vehicleId: '',
                dayOfWeek: 1,
                startDate: '',
                endDate: ''
            });
            setSelectedVehicleId('');
        }
    }, [selectedItem, isEditMode]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.startDate || !formData.endDate) {
            alert('Please provide both start and end dates.');
            return;
        }

        if (formData.routeTiming.length === 0) {
            alert('Please add at least one route timing.');
            return;
        }

        // Validate that all route timings have required fields
        for (const timing of formData.routeTiming) {
            if (!timing.routeId || !timing.startTime) {
                alert('Please fill in all route timing fields.');
                return;
            }
        }

        const submitData = {
            ...formData,
            vehicleId: selectedVehicleId,
            startDate: new Date(formData.startDate),
            endDate: new Date(formData.endDate)
        };

        onSubmit(submitData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
                {/* Route Timing Section */}
                <FormControl isRequired>
                    <FormLabel>Route Timing</FormLabel>
                    <VStack spacing={3} align="stretch" w="100%">
                        {formData.routeTiming.map((timing, index) => {
                            return (
                                <Box key={index} p={3} border="1px" borderColor="gray.200" borderRadius="md">
                                    <HStack spacing={3} align="flex-start">
                                        {/* Route Selection */}
                                        <FormControl isRequired>
                                            <FormLabel fontSize="sm">Route {index + 1}</FormLabel>
                                            <Select
                                                placeholder="Select route"
                                                value={timing.routeId}
                                                onChange={(e) => updateRouteTiming(index, 'routeId', e.target.value)}
                                                size="sm"
                                            >
                                                {routes.map((route) => {
                                                    return (
                                                        <option key={route._id} value={route._id}>
                                                            {route.name} - {route.estimateTimeMinute} min, RM {route.fare}
                                                        </option>
                                                    )
                                                })}
                                            </Select>
                                        </FormControl>

                                        {/* Start Time */}
                                        <FormControl isRequired>
                                            <FormLabel fontSize="sm">Start Time</FormLabel>
                                            <Input
                                                type="time"
                                                value={timing.startTime}
                                                onChange={(e) => updateRouteTiming(index, 'startTime', e.target.value)}
                                                size="sm"
                                            />
                                        </FormControl>

                                        {/* Calculated End Time Display */}
                                        {timing.endTime && (
                                            <FormControl>
                                                <FormLabel fontSize="sm">End Time</FormLabel>
                                                <Box p={2} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200" minW="80px">
                                                    <Text fontSize="sm" textAlign="center" fontWeight="medium">
                                                        {timing.endTime}
                                                    </Text>
                                                </Box>
                                            </FormControl>
                                        )}

                                        {/* Remove Button */}
                                        {formData.routeTiming.length > 1 && (
                                            <IconButton
                                                size="sm"
                                                colorScheme="red"
                                                variant="outline"
                                                onClick={() => removeRouteTiming(index)}
                                                mt={6}
                                                icon={<FiTrash2 />}
                                                aria-label="Remove route timing"
                                            />
                                        )}
                                    </HStack>
                                </Box>
                            )
                        })}

                        <Button
                            type="button"
                            onClick={addRouteTiming}
                            variant="outline"
                            size="sm"
                            leftIcon={<Text>+</Text>}
                        >
                            Add Another Route
                        </Button>
                    </VStack>
                    <FormHelperText>Add multiple routes with their individual start times. End times are calculated automatically.</FormHelperText>
                </FormControl>

                {/* Vehicle Selection */}
                <FormControl isRequired>
                    <FormLabel>Vehicle</FormLabel>
                    <Select
                        placeholder="Select vehicle"
                        value={selectedVehicleId}
                        onChange={(e) => setSelectedVehicleId(e.target.value)}
                    >
                        {vehicles.filter(vehicle => {
                            return vehicle.type === 'bus';
                        }).map((vehicle) => {

                            return (
                                <option key={vehicle._id} value={vehicle._id}>
                                    {vehicle.plateNumber} ({vehicle.type})
                                </option>
                            )
                        })}
                    </Select>
                </FormControl>

                {/* Day of Week Selection */}
                <FormControl isRequired>
                    <FormLabel>Day of Week</FormLabel>
                    <Select
                        value={formData.dayOfWeek}
                        onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                    >
                        <option value={1}>Monday</option>
                        <option value={2}>Tuesday</option>
                        <option value={3}>Wednesday</option>
                        <option value={4}>Thursday</option>
                        <option value={5}>Friday</option>
                        <option value={6}>Saturday</option>
                        <option value={7}>Sunday</option>
                    </Select>
                </FormControl>

                {/* Date Range */}
                <HStack spacing={4} w="100%">
                    <FormControl isRequired>
                        <FormLabel>Start Date</FormLabel>
                        <Input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel>End Date</FormLabel>
                        <Input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </FormControl>
                </HStack>

                <Button type="submit" colorScheme="blue" w="100%">
                    {isEditMode ? 'Update Bus Schedule' : 'Create Bus Schedule'}
                </Button>
            </VStack>
        </form>
    );
};

export default BusScheduleForm;
