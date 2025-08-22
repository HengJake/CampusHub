import React, { useState, useMemo, useCallback } from 'react';
import {
    Box,
    Button,
    Flex,
    Heading,
    HStack,
    Spinner,
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
    IconButton,
    SimpleGrid,
    Card,
    CardHeader,
    CardBody,
    Badge,
    Text,
    VStack,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    CardFooter,
    Divider
} from '@chakra-ui/react';
import {
    AddIcon,
    RepeatIcon,
    ViewIcon,
    EditIcon,
    DeleteIcon
} from '@chakra-ui/icons';
import { useTransportationStore } from '../../../store/transportation.js';
import { formatTime, calculateDuration, getDayLabel } from './utils';

const BusScheduleTab = React.memo(({ loading, error, onCreate, onView, onEdit, onDelete }) => {
    const { busSchedules } = useTransportationStore();

    const handleDelete = useCallback((schedule) => {
        if (onDelete) {
            onDelete('busSchedule', schedule);
        }
    }, [onDelete]);

    // Helper function to get vehicle plate number
    const getVehiclePlate = (schedule) => {
        if (schedule.vehicleId && schedule.vehicleId.plateNumber) {
            return schedule.vehicleId.plateNumber;
        }
        if (schedule.vehicle && schedule.vehicle.plateNumber) {
            return schedule.vehicle.plateNumber;
        }
        return 'N/A';
    };

    // Helper function to get route names from routeTiming
    const getRouteNames = (schedule, asJSX = false) => {
        if (schedule.routeTiming && Array.isArray(schedule.routeTiming)) {
            const routeNames = schedule.routeTiming.map(timing => {
                if (timing.routeId && timing.routeId.name) {
                    return timing.routeId.name;
                }
                return 'Unknown Route';
            });

            if (asJSX) {
                // Return JSX for table cells
                const displayCount = Math.min(routeNames.length, 3);
                const hasMore = routeNames.length > 3;

                return (
                    <VStack align="start" spacing={1} w="100%">
                        {routeNames.slice(0, displayCount).map((name, index) => (
                            <Text key={index} fontSize="sm" color="gray.700">
                                {name}
                            </Text>
                        ))}
                        {hasMore && (
                            <Text fontSize="sm" color="gray.500" fontStyle="italic">
                                ... {routeNames.length - 3} more
                            </Text>
                        )}
                    </VStack>
                );
            } else {
                // Return string for text contexts
                const displayCount = Math.min(routeNames.length, 3);
                const hasMore = routeNames.length > 3;

                const displayNames = routeNames.slice(0, displayCount);
                let result = displayNames.join(', ');

                if (hasMore) {
                    result += ` ... ${routeNames.length - 3} more`;
                }

                return result;
            }
        }
        return 'N/A';
    };

    // Helper function to get day of week label
    const getDayLabel = (day) => {
        const days = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days[day] || 'Unknown';
    };

    // Group schedules by vehicle
    const groupedSchedules = useMemo(() => {
        const grouped = {};
        busSchedules.forEach(schedule => {
            const vehiclePlate = getVehiclePlate(schedule);
            if (!grouped[vehiclePlate]) {
                grouped[vehiclePlate] = [];
            }
            grouped[vehiclePlate].push(schedule);
        });
        return grouped;
    }, [busSchedules]);

    // Memoize the table rows for a specific vehicle
    const getTableRowsForVehicle = useCallback((schedules) => {
        return schedules.map((schedule) => (
            <Tr key={schedule._id}>
                <Td>{schedule.dayOfWeek ? getDayLabel(schedule.dayOfWeek) : 'N/A'}</Td>
                <Td>{getRouteNames(schedule, true)}</Td>
                <Td>{schedule.startDate ? new Date(schedule.startDate).toLocaleDateString() : 'N/A'}</Td>
                <Td>{schedule.endDate ? new Date(schedule.endDate).toLocaleDateString() : 'N/A'}</Td>
                <Td>
                    {schedule.routeTiming && schedule.routeTiming.length > 0 ? (
                        <VStack align="start" spacing={1}>
                            {schedule.routeTiming.slice(0, 3).map((timing, index) => (
                                <Text key={index} fontSize="sm">
                                    {timing.routeId?.name || 'Unknown Route'}: {timing.startTime} - {timing.endTime}
                                </Text>
                            ))}
                            {schedule.routeTiming.length > 3 && (
                                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                                    ... {schedule.routeTiming.length - 3} more
                                </Text>
                            )}
                        </VStack>
                    ) : 'N/A'}
                </Td>
                <Td>
                    <HStack spacing={2}>
                        <IconButton
                            size="sm"
                            icon={<ViewIcon />}
                            onClick={() => onView('busSchedule', schedule)}
                            aria-label="View schedule"
                            colorScheme="blue"
                        />
                        <IconButton
                            size="sm"
                            icon={<EditIcon />}
                            onClick={() => onEdit('busSchedule', schedule)}
                            aria-label="Edit schedule"
                            colorScheme="orange"
                        />
                        <IconButton
                            size="sm"
                            icon={<DeleteIcon />}
                            onClick={() => handleDelete(schedule)}
                            aria-label="Delete schedule"
                            colorScheme="red"
                        />
                    </HStack>
                </Td>
            </Tr>
        ));
    }, [onView, onEdit, handleDelete]);

    // Memoize the card items for a specific vehicle in timeline order
    const getCardItemsForVehicle = useCallback((schedules) => {
        // Sort schedules by day of week (Monday = 1, Sunday = 7)
        const sortedSchedules = [...schedules].sort((a, b) => {
            const dayA = a.dayOfWeek || 0;
            const dayB = b.dayOfWeek || 0;
            return dayA - dayB;
        });

        return sortedSchedules.map((schedule) => {
            return (
                <Card key={schedule._id} size="sm" variant="outline">
                    <CardBody>
                        <VStack align="stretch" spacing={2}>
                            <HStack justify="space-between" align="center">
                                <Text fontSize="sm">
                                    <strong>Routes:</strong> {getRouteNames(schedule)}
                                </Text>
                                <Badge colorScheme="blue" variant="subtle">
                                    {schedule.dayOfWeek ? getDayLabel(schedule.dayOfWeek) : 'N/A'}
                                </Badge>
                            </HStack>
                            <Text fontSize="sm">
                                <strong>Start:</strong> {schedule.startDate ? new Date(schedule.startDate).toLocaleDateString() : 'N/A'}
                            </Text>
                            <Text fontSize="sm">
                                <strong>End:</strong> {schedule.endDate ? new Date(schedule.endDate).toLocaleDateString() : 'N/A'}
                            </Text>
                            <Text fontSize="sm">
                                <strong>Timing:</strong>
                            </Text>
                            {schedule.routeTiming && schedule.routeTiming.length > 0 ? (
                                <VStack align="start" spacing={1} pl={4}>
                                    {schedule.routeTiming.slice(0, 3).map((timing, index) => (
                                        <Text key={index} fontSize="sm">
                                            • {timing.routeId?.name || 'Unknown Route'}: {timing.startTime} - {timing.endTime}
                                        </Text>
                                    ))}
                                    {schedule.routeTiming.length > 3 && (
                                        <Text fontSize="sm" color="gray.500" fontStyle="italic" pl={4}>
                                            ... {schedule.routeTiming.length - 3} more timings
                                        </Text>
                                    )}
                                </VStack>
                            ) : (
                                <Text fontSize="sm" pl={4}>N/A</Text>
                            )}
                        </VStack>
                    </CardBody>
                    <CardFooter pt={0}>
                        <HStack spacing={2} width="100%">
                            <Button
                                size="sm"
                                leftIcon={<ViewIcon />}
                                onClick={() => onView('busSchedule', schedule)}
                                variant="outline"
                                flex={1}
                                colorScheme="blue"
                            >
                                View
                            </Button>
                            <Button
                                size="sm"
                                leftIcon={<EditIcon />}
                                onClick={() => onEdit('busSchedule', schedule)}
                                variant="outline"
                                flex={1}
                                colorScheme="orange"
                            >
                                Edit
                            </Button>
                            <Button
                                size="sm"
                                leftIcon={<DeleteIcon />}
                                onClick={() => handleDelete(schedule)}
                                colorScheme="red"
                                variant="outline"
                                flex={1}
                            >
                                Delete
                            </Button>
                        </HStack>
                    </CardFooter>
                </Card>
            )
        });
    }, [onView, onEdit, handleDelete]);

    if (loading) {
        return (
            <Flex justify="center" p={8}>
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
            <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">Bus Schedules by Vehicle ({busSchedules.length})</Heading>
                <Button
                    leftIcon={<RepeatIcon />}
                    colorScheme="green"
                    onClick={() => onCreate('busSchedule')}
                >
                    Add Bus Schedule
                </Button>
            </Flex>

            {Object.keys(groupedSchedules).length === 0 ? (
                <Box textAlign="center" py={8}>
                    <Text color="gray.500">No bus schedules found.</Text>
                </Box>
            ) : (
                <VStack spacing={6} align="stretch">
                    {Object.entries(groupedSchedules).map(([vehiclePlate, schedules]) => {

                        return (
                            <Box key={vehiclePlate}>
                                <Card>
                                    <CardHeader>
                                        <Flex justify="space-between" align="center">
                                            <Heading size="md" color="blue.600">
                                                Vehicle: {vehiclePlate}
                                            </Heading>
                                            <Badge colorScheme="blue" fontSize="md">
                                                {schedules.length} schedule{schedules.length !== 1 ? 's' : ''}
                                            </Badge>
                                        </Flex>
                                    </CardHeader>
                                    <CardBody pt={0}>
                                        {/* Desktop Table View */}
                                        <Box display={{ base: "none", lg: "block" }}>
                                            <TableContainer>
                                                <Table variant="simple" size="sm">
                                                    <Thead>
                                                        <Tr>
                                                            <Th>Day of Week</Th>
                                                            <Th>Routes</Th>
                                                            <Th>Start Date</Th>
                                                            <Th>End Date</Th>
                                                            <Th>Route Timing</Th>
                                                            <Th>Actions</Th>
                                                        </Tr>
                                                    </Thead>
                                                    <Tbody>
                                                        {getTableRowsForVehicle(schedules)}
                                                    </Tbody>
                                                </Table>
                                            </TableContainer>
                                        </Box>

                                        {/* Mobile Card View */}
                                        <Box display={{ base: "block", lg: "none" }}>
                                            <VStack spacing={3} align="stretch">
                                                <Text fontSize="sm" fontWeight="semibold" color="gray.600" textAlign="center">
                                                    Weekly Schedule Timeline
                                                </Text>
                                                {getCardItemsForVehicle(schedules)}
                                            </VStack>
                                        </Box>
                                    </CardBody>
                                </Card>
                            </Box>
                        )
                    })}
                </VStack>
            )}
        </Box>
    );
});

BusScheduleTab.displayName = 'BusScheduleTab';

export default BusScheduleTab;
